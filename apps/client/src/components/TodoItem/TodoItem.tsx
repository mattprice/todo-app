import { type KeyboardEvent } from "react";
import { useTaskStore } from "../../store";
import styles from "./TodoItem.module.scss";

interface TodoItemProps {
  id?: string;
}

export function TodoItem({ id = "" }: TodoItemProps) {
  const task = useTaskStore((s) => s.tasks[id]);
  const addTask = useTaskStore((s) => s.addTask);
  const editTask = useTaskStore((s) => s.editTask);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.currentTarget.blur();
    }

    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();

      const title = event.currentTarget.value;

      if (!task) {
        addTask({ title: title });
        event.currentTarget.value = "";
      } else {
        // TODO: If the title is empty, ask if they want to delete the task
        editTask(id, { ...task, title: title });
        event.currentTarget.value = title;
      }
    }
  };

  return (
    <input
      name="todoInput"
      className={styles.input}
      placeholder={!task ? "Add a new task..." : ""}
      defaultValue={task?.title || ""}
      onKeyDown={handleKeyDown}
    />
  );
}
