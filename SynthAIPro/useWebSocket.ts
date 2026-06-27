import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/_core/hooks/useAuth";

interface UseWebSocketOptions {
  nodeType: "admin" | "receiving" | "agent";
  onBroadcast?: (message: any) => void;
  onRootUpdate?: (event: any) => void;
  onActionLogged?: (event: any) => void;
  onClientConnected?: (client: any) => void;
  onClientDisconnected?: (client: any) => void;
  autoConnect?: boolean;
}

/**
 * Custom hook for WebSocket communication
 */
export function useWebSocket(options: UseWebSocketOptions) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [clientCount, setClientCount] = useState(0);
  const [lastMessage, setLastMessage] = useState<any>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user || !options.autoConnect !== false) return;

    const socket = io(window.location.origin, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection established
    socket.on("connect", () => {
      console.log("[WebSocket] Connected");
      setIsConnected(true);

      // Register this client
      socket.emit("register", {
        userId: user.id,
        hexagramAddress: user.hexagramAddress || `user:${user.id}`,
        nodeType: options.nodeType,
      });
    });

    // Broadcast message received
    socket.on("broadcast-message", (message: any) => {
      setLastMessage(message);
      options.onBroadcast?.(message);
    });

    // Root entry point updated
    socket.on("root-updated", (event: any) => {
      options.onRootUpdate?.(event);
    });

    // Action logged
    socket.on("action-event", (event: any) => {
      options.onActionLogged?.(event);
    });

    // Client connected
    socket.on("client-connected", (client: any) => {
      options.onClientConnected?.(client);
    });

    // Client disconnected
    socket.on("client-disconnected", (client: any) => {
      options.onClientDisconnected?.(client);
    });

    // Heartbeat timeout
    socket.on("heartbeat-timeout", () => {
      console.warn("[WebSocket] Heartbeat timeout, reconnecting...");
      socket.disconnect();
      socket.connect();
    });

    // Error handling
    socket.on("error", (error: any) => {
      console.error("[WebSocket] Error:", error);
    });

    // Disconnection
    socket.on("disconnect", () => {
      console.log("[WebSocket] Disconnected");
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, options]);

  // Heartbeat sender
  useEffect(() => {
    if (!isConnected || !socketRef.current) return;

    const heartbeatInterval = setInterval(() => {
      socketRef.current?.emit("heartbeat");
    }, 25000); // Send heartbeat every 25 seconds

    return () => clearInterval(heartbeatInterval);
  }, [isConnected]);

  // Send broadcast message
  const sendBroadcast = useCallback(
    (type: "group" | "targeted" | "root", title: string, content: string, payload?: any, targetAddresses?: string[]) => {
      if (!socketRef.current?.connected) {
        console.error("[WebSocket] Not connected");
        return;
      }

      socketRef.current.emit("send-broadcast", {
        type,
        title,
        content,
        payload: payload || {},
        targetAddresses,
      });
    },
    []
  );

  // Send targeted message
  const sendTargeted = useCallback(
    (targetAddresses: string[], title: string, content: string, payload?: any) => {
      if (!socketRef.current?.connected) {
        console.error("[WebSocket] Not connected");
        return;
      }

      socketRef.current.emit("send-targeted", {
        targetAddresses,
        title,
        content,
        payload: payload || {},
      });
    },
    []
  );

  // Update root entry point
  const updateRoot = useCallback(
    (rootName: string, content: any, hexagramAddress: string) => {
      if (!socketRef.current?.connected) {
        console.error("[WebSocket] Not connected");
        return;
      }

      socketRef.current.emit("update-root", {
        rootName,
        content,
        hexagramAddress,
      });
    },
    []
  );

  // Log action
  const logAction = useCallback(
    (actionType: string, description: string, payload?: any) => {
      if (!socketRef.current?.connected) {
        console.error("[WebSocket] Not connected");
        return;
      }

      socketRef.current.emit("action-logged", {
        actionType,
        description,
        payload: payload || {},
      });
    },
    []
  );

  // Subscribe to events
  const subscribeToEvents = useCallback((eventType: string) => {
    if (!socketRef.current?.connected) {
      console.error("[WebSocket] Not connected");
      return;
    }

    socketRef.current.emit("subscribe-events", { eventType });
  }, []);

  return {
    isConnected,
    clientCount,
    lastMessage,
    sendBroadcast,
    sendTargeted,
    updateRoot,
    logAction,
    subscribeToEvents,
    socket: socketRef.current,
  };
}
