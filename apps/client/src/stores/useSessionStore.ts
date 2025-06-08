import { create } from "zustand";
import type { TextSelection, User } from "../../../../shared/types";
import { socket } from "../socket";

interface SessionState {
  status: "loading" | "error" | "success";
  connectedUsers: User[];
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
    connectedUsers: [],
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
    set((state) => ({
      ...state,
      status: "success",
      connectedUsers: data.users,
    }));
  });

  socket.on("updateTextSelections", (data) => {
    set((state) => ({
      ...state,
      textSelections: data.selections,
    }));
  });

  socket.on("disconnect", () => {
    set({ status: "error", connectedUsers: [] });
  });

  return store;
});
