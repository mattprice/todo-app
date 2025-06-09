import clsx from "clsx";
import { useState } from "react";
import { useTaskStore } from "../../stores/useTaskStore";
import styles from "./TodoItemDropTarget.module.scss";

interface TodoItemDropTargetProps {
  prevPriority: number;
  nextPriority: number;
}

export function TodoItemDropTarget({
  prevPriority,
  nextPriority,
}: TodoItemDropTargetProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    // TODO: This doesn't work since dataTransfer is empty
    // TODO: Make it so TodoItems aren't editable while anything is being dragged
    const taskId = event.dataTransfer.getData("text/plain");
    const taskPriority = useTaskStore.getState().tasks[taskId]?.priority;

    if (taskPriority == prevPriority || taskPriority == nextPriority) {
      return;
    }

    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const taskId = event.dataTransfer.getData("text/plain");
    const priority = prevPriority + (nextPriority - prevPriority) / 2;

    useTaskStore.getState().editTask(taskId, {
      priority,
    });
  };

  return (
    <div
      className={clsx(styles.dropTarget, isDragOver && styles.dragOver)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
