import { type KeyboardEvent, useEffect, useState } from "react";
import { useTaskStore } from "../../store";
import styles from "./TodoItem.module.scss";

interface TodoItemProps {
  id?: string;
}

export function TodoItem({ id = "" }: TodoItemProps) {
  const task = useTaskStore((s) => s.tasks[id]);
  const addTask = useTaskStore((s) => s.addTask);
  const editTask = useTaskStore((s) => s.editTask);
  const [value, setValue] = useState(task?.title);

  useEffect(() => {
    setValue(task?.title);
  }, [task?.title]);

  // TODO: Handle onBlur events too, since Enter isn't the only way to submit
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.currentTarget.blur();
      setValue(task?.title);
    }

    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();

      // TODO: Display something if there is an error
      if (!task) {
        addTask({ title: value });
        setValue("");
      } else {
        // TODO: If the title is empty, ask if they want to delete the task
        editTask(id, { ...task, title: value });
      }
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <input
      name="todoInput"
      className={styles.input}
      placeholder={!task ? "Add a new task..." : ""}
      value={value || ""}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
}
