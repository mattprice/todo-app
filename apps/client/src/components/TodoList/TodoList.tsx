import { useEffect } from "react";
import { useTaskStore } from "../../store";
import { Alert } from "../Alert/Alert";
import { TodoItem } from "../TodoItem/TodoItem";
import styles from "./TodoList.module.scss";

export function TodoList() {
  const status = useTaskStore((s) => s.status);
  const tasks = useTaskStore((s) => s.tasks);

  useEffect(() => {
    useTaskStore.getState().fetchTasks();
  }, []);

  if (status === "error") {
    return <Alert message="Unable to fetch tasks" />;
  }

  if (status === "loading") {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className={styles.todoList}>
      {tasks.map((_, index) => (
        <TodoItem key={index} id={index} />
      ))}

      <TodoItem id={-1} />
    </div>
  );
}
