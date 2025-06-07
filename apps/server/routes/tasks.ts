import express from "express";

const router = express.Router();

type Task = {
  title: string;
};

let tasks: Task[] = [];

router.get("/tasks", (req, res) => {
  res.json({
    data: {
      tasks,
    },
  });
});

router.post("/tasks", (req, res) => {
  const { title } = req.body as Task;

  if (typeof title !== "string" || title.trim() === "") {
    res.status(400).json({ error: "Title is a required field" });
    return;
  }

  const length = tasks.push({
    title: title.trim(),
  });

  res.status(201).json({
    data: {
      task: tasks[length - 1],
    },
  });
});

export const tasksRouter = router;
