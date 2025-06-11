import { io, Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../../../shared/typeDefs";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
  io("/");
