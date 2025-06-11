import { ListIcon } from "@phosphor-icons/react";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import { useSessionStore } from "../../stores/useSessionStore";
import { useTaskStore } from "../../stores/useTaskStore";
import { TaskDropTarget } from "./TaskDropTarget";
import styles from "./TaskItem.module.scss";

interface TaskItemProps {
  id?: string;
  prevPriority: number;
  nextPriority: number;
}

export function TaskItem({
  id = "",
  prevPriority,
  nextPriority,
}: TaskItemProps) {
  const task = useTaskStore((s) => s.tasks[id]);
  const dragState = useTaskStore((s) => s.dragState);
  const textSelections = useSessionStore((s) => s.textSelections[id]);
  const addTask = useTaskStore((s) => s.addTask);
  const editTask = useTaskStore((s) => s.editTask);
  const setDragState = useTaskStore((s) => s.setDragState);
  const inputRef = useRef<HTMLDivElement>(null);

  const isNewTask = !task;

  useEffect(() => {
    // Don't update the input field if it's focused. (You run into a fun bug
    // where you end up typing at the beginning of the field.)
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.textContent = task?.title || "";
    }
  }, [task?.title]);

  const handleSelection = () => {
    if (isNewTask) {
      return;
    }

    // Ignore empty selections or selections with multiple ranges
    const selection = window.getSelection();
    if (!selection || selection.rangeCount !== 1) {
      return;
    }

    const range = selection.getRangeAt(0);
    const start = range.startOffset;
    const end = range.endOffset;

    useSessionStore.getState().sendTextSelection(id, start, end);
  };

  useEffect(() => {
    const textNode = inputRef.current?.firstChild;
    if (!textNode || !textSelections || !CSS.highlights) {
      return;
    }

    const currentUserId = useSessionStore.getState().currentUserId;
    for (const selection of textSelections) {
      if (selection.userId === currentUserId) {
        continue;
      }

      try {
        const range = new Range();
        range.setStart(textNode, selection.start || 0);
        range.setEnd(textNode, selection.end || 0);
        const highlight = new Highlight(range);

        CSS.highlights.set(`user-${selection.userId}`, highlight);
      } catch (error) {
        console.error("Error creating highlight:", error);
      }
    }

    return () => {
      for (const selection of textSelections) {
        CSS.highlights.delete(`user-${selection.userId}`);
      }
    };
  }, [textSelections]);

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    // Don't reset the text selection if the input field is still focused
    // (This could happen if, e.g., the user clicks to another browser tab)
    if (document.activeElement === event.currentTarget) {
      return;
    }

    useSessionStore.getState().sendTextSelection(id, null, null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.currentTarget.blur();
    }

    if (event.key === "Enter") {
      event.preventDefault();

      const newTitle = event.currentTarget.textContent || "";
      if (isNewTask && newTitle !== "") {
        // TODO: Display something if there is an error
        addTask({
          title: newTitle,
          completed: false,
          priority: nextPriority || 0,
        });
        event.currentTarget.textContent = "";
      } else {
        event.currentTarget.blur();
      }
    }
  };

  const handleTitleChange = (event: React.InputEvent<HTMLDivElement>) => {
    const newTitle = event.currentTarget.textContent || "";
    if (!isNewTask) {
      editTask(id, { title: newTitle });
    }
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isNewTask) {
      editTask(id, { completed: event.currentTarget.checked });
    }
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.effectAllowed = "move";

    if (!isNewTask) {
      // Set a custom drag image so it looks like you're dragging the whole row
      const todoItem = event.currentTarget.closest('[role="listitem"]');
      if (todoItem) {
        const parentRect = todoItem.getBoundingClientRect();
        const handleRect = event.currentTarget.getBoundingClientRect();
        event.dataTransfer.setDragImage(
          todoItem,
          parentRect.width - handleRect.width,
          parentRect.height / 2
        );
      }

      setDragState({
        taskId: task.id,
        taskPriority: task.priority,
      });
    }
  };

  const handleDragEnd = () => {
    setDragState({
      taskId: null,
      taskPriority: null,
    });
  };

  const isDraggingThis = dragState.taskId === id;
  const isDraggingSomething = !!dragState.taskId;

  return (
    <TaskDropTarget prevPriority={prevPriority} nextPriority={nextPriority}>
      <div
        role="listitem"
        className={clsx(
          styles.taskItem,
          isDraggingThis && styles.dragging,
          task?.completed && styles.completed
        )}
        aria-label="Task"
      >
        <input
          name="completed"
          type="checkbox"
          className={styles.checkbox}
          checked={task?.completed || false}
          onChange={handleCheckboxChange}
          disabled={isNewTask}
          title="Mark task as complete"
          aria-hidden={isNewTask}
        />
        <div
          ref={inputRef}
          role="textbox"
          contentEditable={!isDraggingSomething}
          className={styles.input}
          onBlur={handleBlur}
          onInput={handleTitleChange}
          onKeyDown={handleKeyDown}
          onSelect={handleSelection}
          data-placeholder={isNewTask ? "Add a new task..." : ""}
          title="Edit task title"
        />
        <div
          draggable={!isNewTask}
          className={styles.dragHandle}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          title="Drag to reorder"
        >
          <ListIcon />
        </div>
      </div>
    </TaskDropTarget>
  );
}
