import { randomUUID } from "crypto";
import express from "express";
import type { Task } from "../../../shared/types.ts";
import { emitTaskUpdate } from "../socket.ts";

const router = express.Router();

let tasks: Record<string, Task> = {};

router.get("/tasks", (req, res) => {
  res.json({
    data: {
      tasks,
    },
  });
});

router.post("/tasks", (req, res) => {
  const { title, priority } = req.body as Task;

  if (typeof title !== "string") {
    res.status(400).json({ error: "Title must be a string" });
    return;
  }

  if (typeof priority !== "number") {
    res.status(400).json({ error: "Priority must be a number" });
    return;
  }

  const id = randomUUID();
  tasks[id] = {
    id,
    title,
    completed: false,
    priority,
  };

  emitTaskUpdate(tasks[id]);

  res.status(201).json({
    data: {
      task: tasks[id],
    },
  });
});

router.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { title, completed, priority } = req.body as Partial<Task>;

  if (title !== undefined && typeof title !== "string") {
    res.status(400).json({ error: "Title must be a string" });
    return;
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    res.status(400).json({ error: "Completed must be a boolean" });
    return;
  }

  if (priority !== undefined && typeof priority !== "number") {
    res.status(400).json({ error: "Priority must be a number" });
    return;
  }

  if (!tasks[id]) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  tasks[id] = {
    ...tasks[id],
    title: title ?? tasks[id].title,
    completed: completed ?? tasks[id].completed,
    priority: priority ?? tasks[id].priority,
  };

  emitTaskUpdate(tasks[id]);

  res.json({
    data: {
      task: tasks[id],
    },
  });
});

export const tasksRouter = router;
