import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import type { Task, User } from "../../shared/types.ts";

// Users are assigned a unique combination of name and color on connection
// NOTE: For best results, these arrays should be the same length
const ANIMAL_NAMES = ["Capybara", "Otter", "Penguin", "Dolphin"];
const ANIMAL_COLORS = ["red", "green", "yellow", "purple"];

let io: Server | null = null;
let totalConnections = 0;
const connectedUsers: Record<string, User> = {};

export function initializeSocket(httpServer: HttpServer) {
  io = new Server(httpServer);

  io.on("connection", (socket) => {
    // Assign a unique animal and color combination to each user.
    // The offset ensures that each appearance of an animal is paired with a
    // different color. Using the total connection count biases us towards
    // new combinations instead of immediately repeating an old one.
    const nameIndex = totalConnections % ANIMAL_NAMES.length;
    const offset = Math.floor(totalConnections / ANIMAL_COLORS.length);
    const colorIndex = (totalConnections + offset) % ANIMAL_COLORS.length;
    totalConnections = totalConnections + 1;

    const user: User = {
      id: socket.id,
      displayName: ANIMAL_NAMES[nameIndex],
      color: ANIMAL_COLORS[colorIndex],
    };

    connectedUsers[socket.id] = user;

    io.emit("updateConnectedUsers", {
      users: Object.values(connectedUsers),
    });

    socket.on("disconnect", () => {
      if (connectedUsers[socket.id]) {
        delete connectedUsers[socket.id];
      }

      io.emit("updateConnectedUsers", {
        users: Object.values(connectedUsers),
      });
    });
  });
}

export function emitTaskUpdate(
  action: "created" | "updated" | "deleted",
  task: Task
) {
  if (io) {
    io.emit("updateTask", { action, task });
  }
}
