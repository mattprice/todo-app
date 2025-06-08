import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import type {
  ClientEvents,
  ServerEvents,
  Task,
  TextSelection,
  User,
} from "../../shared/types.ts";

// Users are assigned a unique combination of name and color on connection
// NOTE: For best results, these arrays should be the same length
const ANIMAL_NAMES = ["Capybara", "Llama", "Fox", "Hippo"];
const ANIMAL_COLORS = ["green", "blue", "yellow", "pink"];

let io: Server<ClientEvents, ServerEvents> | null = null;
let totalConnections = 0;
const connectedUsers: Record<string, User> = {};
const textSelections: Record<string, TextSelection[]> = {};

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
      selection: null,
    };

    connectedUsers[socket.id] = user;

    io.emit("updateConnectedUsers", {
      users: Object.values(connectedUsers),
    });

    socket.on("textSelection", (data) => {
      const selection: TextSelection = {
        userId: socket.id,
        start: data.selection.start,
        end: data.selection.end,
      };

      const taskSelections = textSelections[data.taskId] || [];
      const userSelection = taskSelections.find((s) => s.userId === socket.id);
      if (userSelection) {
        userSelection.start = selection.start;
        userSelection.end = selection.end;
      } else {
        taskSelections.push(selection);
      }
      textSelections[data.taskId] = taskSelections;

      socket.broadcast.emit("updateTextSelections", {
        selections: textSelections,
      });
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

export function emitTaskUpdate(task: Task) {
  if (io) {
    io.emit("updateTask", { task });
  }
}
