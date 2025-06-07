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
  const { title } = req.body as Task;

  if (typeof title !== "string") {
    res.status(400).json({ error: "Title must be a string" });
    return;
  }

  const id = randomUUID();
  tasks[id] = {
    id,
    title,
    completed: false,
  };

  emitTaskUpdate("created", tasks[id]);

  res.status(201).json({
    data: {
      task: tasks[id],
    },
  });
});

router.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body as Partial<Task>;

  if (title !== undefined && typeof title !== "string") {
    res.status(400).json({ error: "Title must be a string" });
    return;
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    res.status(400).json({ error: "Completed must be a boolean" });
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
  };

  emitTaskUpdate("updated", tasks[id]);

  res.json({
    data: {
      task: tasks[id],
    },
  });
});

export const tasksRouter = router;
