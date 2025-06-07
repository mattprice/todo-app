import { type KeyboardEvent } from "react";
import { useTaskStore } from "../../store";
import styles from "./TodoItem.module.scss";

interface TodoItemProps {
  id: number;
}

export function TodoItem({ id }: TodoItemProps) {
  const task = useTaskStore((s) => s.tasks[id]);
  const addTask = useTaskStore((s) => s.addTask);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const value = event.currentTarget.value.trim();
      if (value) {
        addTask({ title: value });
        event.currentTarget.value = "";
      }
    }
  };

  if (id === -1) {
    return (
      <input
        name="todoInput"
        className={styles.input}
        placeholder="Add a new task..."
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <input
      name="todoInput"
      className={styles.input}
      defaultValue={task.title}
      onKeyDown={handleKeyDown}
    />
  );
}
