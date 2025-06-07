import { randomUUID } from "crypto";
import express from "express";

const router = express.Router();

type Task = {
  id: string;
  title: string;
};

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
    res.status(400).json({ error: "Title is a required field" });
    return;
  }

  const id = randomUUID();
  tasks[id] = {
    id,
    title,
  };

  res.status(201).json({
    data: {
      task: tasks[id],
    },
  });
});

router.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { title } = req.body as Task;

  if (typeof title !== "string") {
    res.status(400).json({ error: "Title is a required field" });
    return;
  }

  if (!tasks[id]) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  tasks[id] = {
    ...tasks[id],
    title,
  };

  res.json({
    data: {
      task: tasks[id],
    },
  });
});

export const tasksRouter = router;
