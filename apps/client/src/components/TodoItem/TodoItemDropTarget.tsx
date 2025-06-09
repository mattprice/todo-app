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
  const dragState = useTaskStore((s) => s.dragState);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    // Don't show the drop target if the task hasn't actually moved positions.
    // event.dataTransfer isn't reachable here, so we have to use a global state.
    if (
      dragState?.taskPriority === prevPriority ||
      dragState?.taskPriority === nextPriority
    ) {
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

    if (dragState.taskId) {
      const priority = prevPriority + (nextPriority - prevPriority) / 2;

      useTaskStore.getState().editTask(dragState.taskId, {
        priority,
      });
    }
  };

  return (
    <div
      className={styles.dropTarget}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-hidden="true"
      tabIndex={-1}
    >
      <div className={clsx(isDragOver && styles.dragOver)} />
    </div>
  );
}
