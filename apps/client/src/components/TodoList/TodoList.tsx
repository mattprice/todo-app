import { useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { useTaskStore } from "../../store";
import { Alert } from "../Alert/Alert";
import { TodoItem } from "../TodoItem/TodoItem";
import styles from "./TodoList.module.scss";

export function TodoList() {
  const status = useTaskStore((s) => s.status);
  const taskIds = useTaskStore(useShallow((s) => Object.keys(s.tasks)));

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
      {taskIds.map((id) => (
        <TodoItem key={id} id={id} />
      ))}

      <TodoItem />
    </div>
  );
}
