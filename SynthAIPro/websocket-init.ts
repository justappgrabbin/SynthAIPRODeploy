import { Server as HTTPServer } from "http";
import { initializeWebSocket, startHeartbeatMonitor } from "../websocket";

/**
 * Initialize WebSocket server on HTTP server
 */
export function setupWebSocketServer(httpServer: HTTPServer) {
  console.log("[WebSocket] Initializing WebSocket server...");

  const io = initializeWebSocket(httpServer);

  // Start heartbeat monitor
  startHeartbeatMonitor(io, 30000);

  console.log("[WebSocket] WebSocket server initialized successfully");

  return io;
}
