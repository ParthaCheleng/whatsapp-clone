import { Server } from "socket.io";
import type http from "node:http";

let io: Server | null = null;

export function initIO(server: http.Server, corsOrigins: string[] | "*" = "*") {
  io = new Server(server, {
    cors: { origin: corsOrigins }
  });
  io.on("connection", (socket) => {
    // you can log or auth here if needed
    // console.log("socket connected", socket.id);
  });
  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

// Convenience emitters used across the app
export function emitNewMessage(doc: any) {
  if (!io) return;
  io.emit("message:new", doc);
}

export function emitStatusUpdate(payload: { id: string; status: string; wa_id?: string; timestamp?: Date }) {
  if (!io) return;
  io.emit("message:status", payload);
}
