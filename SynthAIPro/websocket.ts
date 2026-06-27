import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { getDb } from "./db";
import { meshConnections } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * WebSocket Server for Real-Time Broadcast Mesh
 * Manages connections, broadcasts, and cross-node synchronization
 */

interface ClientConnection {
  socketId: string;
  userId: number;
  hexagramAddress: string;
  nodeType: "admin" | "receiving" | "agent";
  connectedAt: Date;
  lastHeartbeat: Date;
}

interface BroadcastMessage {
  id: string;
  type: "group" | "targeted" | "root";
  senderId: number;
  senderAddress: string;
  title: string;
  content: string;
  payload: Record<string, unknown>;
  targetAddresses?: string[];
  timestamp: Date;
  status: "pending" | "sent" | "delivered";
}

interface MeshEvent {
  eventId: string;
  eventType: string;
  sourceAddress: string;
  targetAddresses: string[];
  payload: Record<string, unknown>;
  timestamp: Date;
}

// Active client connections
const clients = new Map<string, ClientConnection>();

// Broadcast message queue
const messageQueue: BroadcastMessage[] = [];

// Mesh event listeners
const eventListeners = new Map<string, Set<(event: MeshEvent) => void>>();

/**
 * Initialize WebSocket server
 */
export function initializeWebSocket(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  /**
   * Connection handler
   */
  io.on("connection", (socket: Socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    /**
     * Client registration
     */
    socket.on("register", (data: any) => {
      const { userId, hexagramAddress, nodeType } = data;

      const clientConnection: ClientConnection = {
        socketId: socket.id,
        userId,
        hexagramAddress,
        nodeType,
        connectedAt: new Date(),
        lastHeartbeat: new Date(),
      };

      clients.set(socket.id, clientConnection);

      console.log(
        `[WebSocket] Client registered: ${hexagramAddress} (${nodeType})`
      );

      // Notify all clients of connection
      io.emit("client-connected", {
        socketId: socket.id,
        hexagramAddress,
        nodeType,
        timestamp: new Date(),
      });

      // Send pending messages to newly connected client
      if (nodeType === "receiving") {
        messageQueue.forEach((msg) => {
          if (
            msg.type === "group" ||
            (msg.type === "targeted" && msg.targetAddresses?.includes(hexagramAddress))
          ) {
            socket.emit("broadcast-message", msg);
          }
        });
      }
    });

    /**
     * Broadcast message handler (from admin panel)
     */
    socket.on("send-broadcast", async (data: any) => {
      const client = clients.get(socket.id);
      if (!client || client.nodeType !== "admin") {
        socket.emit("error", { message: "Unauthorized: admin only" });
        return;
      }

      const { type, title, content, payload, targetAddresses } = data;

      const broadcastMsg: BroadcastMessage = {
        id: nanoid(),
        type,
        senderId: client.userId,
        senderAddress: client.hexagramAddress,
        title,
        content,
        payload,
        targetAddresses,
        timestamp: new Date(),
        status: "pending",
      };

      messageQueue.push(broadcastMsg);

      // Log to database
      try {
        const db = await getDb();
        if (db) {
          // Broadcast logged via tRPC in broadcast router
        }
      } catch (error) {
        console.error("[WebSocket] Failed to log broadcast:", error);
      }

      // Deliver to receiving clients
      io.emit("broadcast-message", {
        ...broadcastMsg,
        status: "sent",
      });

      // Acknowledge to sender
      socket.emit("broadcast-sent", {
        broadcastId: broadcastMsg.id,
        status: "delivered",
      });

      console.log(
        `[WebSocket] Broadcast sent: ${broadcastMsg.id} (${type})`
      );
    });

    /**
     * Targeted message handler
     */
    socket.on("send-targeted", async (data: any) => {
      const client = clients.get(socket.id);
      if (!client || client.nodeType !== "admin") {
        socket.emit("error", { message: "Unauthorized: admin only" });
        return;
      }

      const { targetAddresses, title, content, payload } = data;

      const targetedMsg: BroadcastMessage = {
        id: nanoid(),
        type: "targeted",
        senderId: client.userId,
        senderAddress: client.hexagramAddress,
        title,
        content,
        payload,
        targetAddresses,
        timestamp: new Date(),
        status: "pending",
      };

      messageQueue.push(targetedMsg);

      // Deliver to specific targets
      const targetClients = Array.from(clients.values()).filter((c) =>
        targetAddresses.includes(c.hexagramAddress)
      );

      targetClients.forEach((target) => {
        io.to(target.socketId).emit("broadcast-message", {
          ...targetedMsg,
          status: "delivered",
        });
      });

      socket.emit("broadcast-sent", {
        broadcastId: targetedMsg.id,
        status: "delivered",
        deliveredTo: targetClients.length,
      });

      console.log(
        `[WebSocket] Targeted message sent to ${targetClients.length} clients`
      );
    });

    /**
     * Root entry point update handler
     */
    socket.on("update-root", async (data: any) => {
      const client = clients.get(socket.id);
      if (!client || client.nodeType !== "admin") {
        socket.emit("error", { message: "Unauthorized: admin only" });
        return;
      }

      const { rootName, content, hexagramAddress } = data;

      const rootEvent: MeshEvent = {
        eventId: nanoid(),
        eventType: "root-update",
        sourceAddress: client.hexagramAddress,
        targetAddresses: [], // Broadcast to all
        payload: { rootName, content, hexagramAddress },
        timestamp: new Date(),
      };

      // Emit to all connected clients
      io.emit("root-updated", rootEvent);

      console.log(`[WebSocket] Root entry point updated: ${rootName}`);
    });

    /**
     * Action log event handler (from receiving side)
     */
    socket.on("action-logged", async (data: any) => {
      const client = clients.get(socket.id);
      if (!client) {
        socket.emit("error", { message: "Client not registered" });
        return;
      }

      const { actionType, description, payload } = data;

      const actionEvent: MeshEvent = {
        eventId: nanoid(),
        eventType: "action",
        sourceAddress: client.hexagramAddress,
        targetAddresses: [], // Broadcast to all
        payload: { actionType, description, payload },
        timestamp: new Date(),
      };

      // Emit to all connected clients (especially admin for monitoring)
      io.emit("action-event", actionEvent);

      // Trigger event listeners
      const listeners = eventListeners.get("action") || new Set();
      listeners.forEach((listener) => listener(actionEvent));

      console.log(
        `[WebSocket] Action logged from ${client.hexagramAddress}: ${actionType}`
      );
    });

    /**
     * Heartbeat handler
     */
    socket.on("heartbeat", () => {
      const client = clients.get(socket.id);
      if (client) {
        client.lastHeartbeat = new Date();
      }
    });

    /**
     * Mesh event subscription
     */
    socket.on("subscribe-events", (data: any) => {
      const { eventType } = data;
      const client = clients.get(socket.id);

      if (!client) {
        socket.emit("error", { message: "Client not registered" });
        return;
      }

      if (!eventListeners.has(eventType)) {
        eventListeners.set(eventType, new Set());
      }

      const listeners = eventListeners.get(eventType)!;
      const listener = (event: MeshEvent) => {
        socket.emit(`event-${eventType}`, event);
      };

      listeners.add(listener);

      console.log(
        `[WebSocket] Client subscribed to events: ${eventType}`
      );

      socket.on("disconnect", () => {
        listeners.delete(listener);
      });
    });

    /**
     * Disconnect handler
     */
    socket.on("disconnect", () => {
      const client = clients.get(socket.id);
      if (client) {
        console.log(`[WebSocket] Client disconnected: ${client.hexagramAddress}`);
        clients.delete(socket.id);

        // Notify all clients of disconnection
        io.emit("client-disconnected", {
          socketId: socket.id,
          hexagramAddress: client.hexagramAddress,
          timestamp: new Date(),
        });
      }
    });

    /**
     * Error handler
     */
    socket.on("error", (error: any) => {
      console.error(`[WebSocket] Socket error: ${error}`);
    });
  });

  return io;
}

/**
 * Heartbeat monitor - checks for stale connections
 */
export function startHeartbeatMonitor(io: SocketIOServer, interval: number = 30000) {
  setInterval(() => {
    const now = new Date();
    const staleThreshold = 60000; // 60 seconds

    clients.forEach((client, socketId) => {
      const timeSinceHeartbeat = now.getTime() - client.lastHeartbeat.getTime();

      if (timeSinceHeartbeat > staleThreshold) {
        console.log(
          `[WebSocket] Disconnecting stale client: ${client.hexagramAddress}`
        );
        io.to(socketId).emit("heartbeat-timeout");
        io.sockets.sockets.get(socketId)?.disconnect(true);
      }
    });
  }, interval);
}

/**
 * Get connected clients count
 */
export function getConnectedClientsCount(): number {
  return clients.size;
}

/**
 * Get clients by node type
 */
export function getClientsByNodeType(nodeType: "admin" | "receiving" | "agent"): ClientConnection[] {
  return Array.from(clients.values()).filter((c) => c.nodeType === nodeType);
}

/**
 * Get client by hexagram address
 */
export function getClientByAddress(hexagramAddress: string): ClientConnection | undefined {
  return Array.from(clients.values()).find((c) => c.hexagramAddress === hexagramAddress);
}

/**
 * Broadcast message to all clients
 */
export function broadcastToAll(io: SocketIOServer, eventType: string, data: any) {
  io.emit(eventType, data);
}

/**
 * Broadcast message to specific clients
 */
export function broadcastToAddresses(
  io: SocketIOServer,
  addresses: string[],
  eventType: string,
  data: any
) {
  const targetClients = Array.from(clients.values()).filter((c) =>
    addresses.includes(c.hexagramAddress)
  );

  targetClients.forEach((client) => {
    io.to(client.socketId).emit(eventType, data);
  });
}

/**
 * Get message queue status
 */
export function getMessageQueueStatus() {
  return {
    queueSize: messageQueue.length,
    messages: messageQueue.slice(-10), // Last 10 messages
  };
}

/**
 * Clear message queue
 */
export function clearMessageQueue() {
  messageQueue.length = 0;
}
