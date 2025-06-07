import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import type { Task } from "../../shared/types.ts";

let io: Server | null = null;

export function initializeSocket(httpServer: HttpServer) {
  io = new Server(httpServer);
}

export function emitTaskUpdate(
  action: "created" | "updated" | "deleted",
  task: Task
) {
  if (io) {
    io.emit("taskUpdate", { action, task });
  }
}
