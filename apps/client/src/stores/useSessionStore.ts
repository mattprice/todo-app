import { create } from "zustand";
import type { TextSelection, User } from "../../../../shared/types";
import { socket } from "../socket";

interface SessionState {
  status: "loading" | "error" | "success";
  currentUserId: string | null;
  currentUserColor: string | null;
  connectedUsers: User[];
  userColors: Record<string, string>;
  textSelections: Record<string, TextSelection[]>;
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
    currentUserColor: null,
    connectedUsers: [],
    userColors: {},
    textSelections: {},

    sendTextSelection: (taskId, start, end) => {
      // TODO: Debounce this action to avoid flooding the server with updates?
      socket.volatile.emit("textSelection", {
        taskId,
        selection: { start, end },
      });
    },
  };

  socket.on("updateConnectedUsers", (data) => {
    const currentUser = data.users.find((user) => user.id === socket.id);

    const userColors: Record<string, string> = {};
    for (const user of data.users) {
      userColors[user.id] = user.color;
    }

    set((state) => ({
      ...state,
      status: "success",
      currentUserId: currentUser?.id || null,
      currentUserColor: currentUser?.color || null,
      connectedUsers: data.users,
      userColors,
    }));
  });

  socket.on("updateTextSelections", (data) => {
    set((state) => ({
      ...state,
      textSelections: data.selections,
    }));
  });

  socket.on("disconnect", () => {
    set({ status: "error", connectedUsers: [], userColors: {} });
  });

  return store;
});
