import type { KeyboardEvent } from "react";
import styles from "./TodoItem.module.scss";

interface TodoItemProps {
  defaultValue?: string;
  onSubmit?: (task: string) => void;
}

export function TodoItem({ defaultValue, onSubmit }: TodoItemProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const value = event.currentTarget.value.trim();
      if (value && onSubmit) {
        onSubmit(value);
        event.currentTarget.value = "";
      }
    }
  };

  return (
    <input
      name="todoInput"
      className={styles.input}
      placeholder="New To-Do"
      defaultValue={defaultValue}
      onKeyDown={handleKeyDown}
    />
  );
}
