import express from "express";
import type { Task } from "../../../shared/typeDefs.ts";
import { db } from "./db.ts";
import { emitTaskUpdate } from "./socketHandler.ts";

const router = express.Router();

router.get("/tasks", async (req, res) => {
  try {
    const tasks = await db("tasks").select("*");

    const tasksObject: Record<string, Task> = {};
    tasks.forEach((task) => {
      tasksObject[task.id] = task;
    });

    res.json({
      data: {
        tasks: tasksObject,
      },
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

router.post("/tasks", async (req, res) => {
  const { title, priority } = req.body as Task;

  if (typeof title !== "string") {
    res.status(400).json({ error: "Title must be a string" });
    return;
  }

  if (typeof priority !== "number") {
    res.status(400).json({ error: "Priority must be a number" });
    return;
  }

  try {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      priority,
    };

    await db("tasks").insert(newTask);

    emitTaskUpdate(newTask);

    res.status(201).json({
      data: {
        task: newTask,
      },
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

export const tasksRouter = router;
