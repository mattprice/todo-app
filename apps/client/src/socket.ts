import { io, Socket } from "socket.io-client";
import type { ClientEvents, ServerEvents } from "../../../shared/types";

export const socket: Socket<ServerEvents, ClientEvents> = io("/");
