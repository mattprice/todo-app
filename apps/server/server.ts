import express from "express";
import fs from "fs";
import helmet from "helmet";
import http from "http";
import { initializeSocket } from "./src/socketHandler.ts";
import { tasksRouter } from "./src/tasksRouter.ts";

if (fs.existsSync("../../.env")) {
  process.loadEnvFile("../../.env");
}

const app = express();
const port = parseInt(process.env.SERVER_PORT || "3000");
const server = http.createServer(app);

initializeSocket(server);

app.use(helmet());
app.use(express.static("public"));
app.use(express.json());

app.use("/api", tasksRouter);

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
