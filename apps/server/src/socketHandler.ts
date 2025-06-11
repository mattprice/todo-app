import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  Task,
  TextSelection,
  User,
} from "../../../shared/typeDefs.ts";
import { db } from "./db.ts";

// Users are assigned a unique combination of name and color on connection
// NOTE: For best results, these arrays should be the same length
const ANIMAL_NAMES = ["Capybara", "Llama", "Fox", "Hippo"];
const ANIMAL_COLORS = ["green", "blue", "yellow", "pink"];

let io: Server<ClientToServerEvents, ServerToClientEvents> | null = null;
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

      if (
        selection.start === null ||
        selection.end === null ||
        selection.start === selection.end
      ) {
        // Remove the selection for this user, since they cleared it
        const filteredSelections = taskSelections.filter(
          (s) => s.userId !== socket.id
        );

        // If no more selections exist, remove the empty array
        if (filteredSelections.length === 0) {
          delete textSelections[data.taskId];
        } else {
          textSelections[data.taskId] = filteredSelections;
        }
      } else {
        const userSelection = taskSelections.find(
          (s) => s.userId === socket.id
        );

        // Add a new selection for the user, or update an existing one
        if (userSelection) {
          userSelection.start = selection.start;
          userSelection.end = selection.end;
        } else {
          taskSelections.push(selection);
        }
        textSelections[data.taskId] = taskSelections;
      }

      socket.broadcast.emit("updateTextSelections", {
        selections: textSelections,
      });
    });

    socket.on("editTask", async (data, callback) => {
      const { taskId, task } = data;
      const { title, completed, priority } = task;

      if (
        (title !== undefined && typeof title !== "string") ||
        (completed !== undefined && typeof completed !== "boolean") ||
        (priority !== undefined && typeof priority !== "number")
      ) {
        callback({ error: "Invalid task data" });
        return;
      }

      try {
        const existingTask = await db("tasks").where({ id: taskId }).first();
        if (!existingTask) {
          callback({ error: "Task not found" });
          return;
        }

        const query = await db("tasks")
          .where({ id: taskId })
          .update({ title, completed, priority })
          .returning("*");
        const updatedTask = query[0];

        io.emit("updateTask", {
          task: updatedTask,
        });
      } catch (error) {
        console.error("Error updating task via socket:", error);
        callback({ error: "Unexpected error" });
      }
    });

    socket.on("disconnect", () => {
      if (connectedUsers[socket.id]) {
        delete connectedUsers[socket.id];
      }

      // Clean up any text selections for the user
      for (const taskId of Object.keys(textSelections)) {
        textSelections[taskId] = textSelections[taskId].filter(
          (selection) => selection.userId !== socket.id
        );
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
