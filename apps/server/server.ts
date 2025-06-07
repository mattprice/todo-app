import express from "express";
import http from "http";
import { tasksRouter } from "./routes/tasks.ts";
import { initializeSocket } from "./socket.ts";

const app = express();
const port = 3000;
const server = http.createServer(app);

app.use(express.json());

app.use("/api", tasksRouter);

initializeSocket(server);

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
