import { create } from "zustand";

interface Task {
  title: string;
}

interface StoreState {
  status: "loading" | "error" | "success";
  tasks: Task[];
}

interface StoreActions {
  fetchTasks: () => Promise<void>;
  addTask: (task: Task) => void;
}

export const useTaskStore = create<StoreState & StoreActions>((set) => ({
  status: "loading",
  tasks: [],

  fetchTasks: async () => {
    set({ status: "loading" });

    try {
      const response = await fetch("/api/tasks");

      if (!response.ok) {
        throw new Error("Unable to fetch tasks");
      }

      const data = await response.json();

      set({
        status: "success",
        tasks: data.data.tasks,
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      set({ status: "error" });
    }
  },
  addTask: async (task) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: task.title }),
      });

      if (!response.ok) {
        throw new Error("Unable to create task");
      }

      const data = await response.json();

      set((state) => ({
        tasks: [...state.tasks, data.data.task],
      }));
    } catch (error) {
      console.error("Error creating task:", error);
    }
  },
}));
