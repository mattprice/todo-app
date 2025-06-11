import clsx from "clsx";
import { useRef, useState } from "react";
import { useTaskStore } from "../../stores/useTaskStore";
import styles from "./TaskDropTarget.module.scss";

interface TaskDropTargetProps {
  prevPriority: number;
  nextPriority: number;
  children: React.ReactNode;
}

export function TaskDropTarget({
  prevPriority,
  nextPriority,
  children,
}: TaskDropTargetProps) {
  const dragState = useTaskStore((s) => s.dragState);
  const [isDragOver, setIsDragOver] = useState(false);
  const dropTarget = useRef<HTMLDivElement>(null);

  const handleDragEnter = () => {
    // Don't show the drop target if the task hasn't actually moved positions.
    // event.dataTransfer isn't reachable here, so we have to use a global state.
    if (
      dragState?.taskPriority === prevPriority ||
      dragState?.taskPriority === nextPriority
    ) {
      return;
    }

    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    // If the drag leave event is caused by entering a child element, ignore it
    if (event.currentTarget.contains(event.relatedTarget as Node)) {
      return;
    }
    setIsDragOver(false);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
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
      ref={dropTarget}
      className={styles.dropTarget}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-hidden="true"
      tabIndex={-1}
    >
      <div className={clsx(isDragOver && styles.dragOver)} />
      {children}
    </div>
  );
}
