import { useEffect } from "react";
import { useTaskStore } from "../../store";
import { Alert } from "../Alert/Alert";
import { TodoItem } from "../TodoItem/TodoItem";
import styles from "./TodoList.module.scss";

export function TodoList() {
  const status = useTaskStore((s) => s.status);
  // TODO: Use shallow
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
      {Object.keys(tasks).map((taskId) => (
        <TodoItem key={taskId} id={taskId} />
      ))}

      <TodoItem />
    </div>
  );
}
