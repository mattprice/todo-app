import { create } from "zustand";
import type { TextSelection, User } from "../../../../shared/typeDefs";
import { socket } from "../socket";

interface SessionState {
  status: "loading" | "error" | "success";
  currentUserId: string | null;
  connectedUsers: User[];
  textSelections: Record<string, TextSelection[]>;
  textSelectionColors: Record<string, string>;
}

interface SessionActions {
  sendTextSelection: (
    taskId: string,
    start: number | null,
    end: number | null
  ) => void;
}

export const useSessionStore = create<SessionState & SessionActions>((set) => {
  const store: SessionState & SessionActions = {
    status: "loading",
    currentUserId: null,
    connectedUsers: [],
    textSelections: {},
    textSelectionColors: {},

    sendTextSelection: (taskId, start, end) => {
      socket.volatile.emit("textSelection", {
        taskId,
        selection: { start, end },
      });
    },
  };

  socket.on("updateConnectedUsers", (data) => {
    // Sort the connected users so that the current user is always last
    const sortedUsers = data.users.sort((a) => {
      if (a.id === socket.id) {
        return 1;
      }
      return 0;
    });

    const userColors: Record<string, string> = {};
    for (const user of data.users) {
      userColors[user.id] = user.color;
    }

    set((state) => ({
      ...state,
      status: "success",
      currentUserId: socket.id || null,
      connectedUsers: sortedUsers,
      textSelectionColors: userColors,
    }));
  });

  socket.on("updateTextSelections", (data) => {
    set((state) => ({
      ...state,
      textSelections: data.selections,
    }));
  });

  socket.on("disconnect", () => {
    set({
      status: "error",
      connectedUsers: [],
      textSelections: {},
      textSelectionColors: {},
    });
  });

  return store;
});
