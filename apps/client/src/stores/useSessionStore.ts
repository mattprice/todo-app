import { create } from "zustand";
import type { User } from "../../../../shared/types";
import { socket } from "../socket";

interface SessionState {
  status: "loading" | "error" | "success";
  connectedUsers: User[];
}

export const useSessionStore = create<SessionState>((set) => {
  const store: SessionState = {
    status: "loading",
    connectedUsers: [],
  };

  socket.on("updateConnectedUsers", (data) => {
    set((state) => ({
      ...state,
      status: "success",
      connectedUsers: data.users,
    }));
  });

  socket.on("disconnect", () => {
    set({ status: "error", connectedUsers: [] });
  });

  return store;
});
