import express from "express";
import type { Task } from "../../../shared/types.ts";
import { db } from "../db.ts";
import { emitTaskUpdate } from "../socket.ts";

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

router.put("/tasks/:id", async (req, res) => {
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

  try {
    const existingTask = await db("tasks").where({ id }).first();
    if (!existingTask) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const query = await db("tasks")
      .where({ id })
      .update({ title, completed, priority })
      .returning("*");
    const updatedTask = query[0];

    emitTaskUpdate(updatedTask);

    res.json({
      data: {
        task: updatedTask,
      },
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

export const tasksRouter = router;
