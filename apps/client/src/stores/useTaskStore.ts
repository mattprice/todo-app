import { create } from "zustand";
import type { Task } from "../../../../shared/typeDefs";
import { socket } from "../socket";

interface DragState {
  taskId: string | null;
  taskPriority: number | null;
}

interface StoreState {
  status: "loading" | "error" | "success";
  tasks: Record<string, Task>;
  dragState: DragState;
}

interface StoreActions {
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, "id">) => void;
  editTask: (taskId: string, task: Partial<Task>) => void;
  setDragState: (dragState: DragState) => void;
}

export const useTaskStore = create<StoreState & StoreActions>((set, get) => {
  const store: StoreState & StoreActions = {
    status: "loading",
    tasks: {},
    dragState: {
      taskId: null,
      taskPriority: null,
    },

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
          body: JSON.stringify(task),
        });

        if (!response.ok) {
          throw new Error("Unable to create task");
        }

        const data = await response.json();
        const newTask = data.data.task;

        set((state) => ({
          tasks: {
            ...state.tasks,
            [newTask.id]: newTask,
          },
        }));
      } catch (error) {
        console.error("Error creating task:", error);
      }
    },
    editTask: async (taskId, task) => {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(task),
        });

        if (!response.ok) {
          throw new Error("Unable to update task");
        }

        const data = await response.json();
        const updatedTask = data.data.task;

        set((state) => ({
          tasks: {
            ...state.tasks,
            [taskId]: updatedTask,
          },
        }));
      } catch (error) {
        console.error("Error updating task:", error);
      }
    },
    setDragState: (dragState) => {
      set({
        dragState: dragState,
      });
    },
  };

  socket.on("connect", () => {
    get().fetchTasks();
  });

  socket.on("updateTask", (data) => {
    set((state) => ({
      tasks: {
        ...state.tasks,
        [data.task.id]: data.task,
      },
    }));
  });

  socket.on("disconnect", () => {
    set({ status: "error" });
  });

  return store;
});
