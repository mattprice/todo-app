import clsx from "clsx";
import { useEffect, useRef } from "react";
import { useSessionStore } from "../../stores/useSessionStore";
import { useTaskStore } from "../../stores/useTaskStore";
import styles from "./TodoItem.module.scss";

interface TodoItemProps {
  id?: string;
  nextPriority?: number;
}

export function TodoItem({ id = "", nextPriority }: TodoItemProps) {
  const task = useTaskStore((s) => s.tasks[id]);
  const dragState = useTaskStore((s) => s.dragState);
  const textSelections = useSessionStore((s) => s.textSelections[id]);
  const addTask = useTaskStore((s) => s.addTask);
  const editTask = useTaskStore((s) => s.editTask);
  const setDragState = useTaskStore((s) => s.setDragState);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Don't update the input field if it's focused. (You run into a fun bug
    // where you end up typing at the beginning of the field.)
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.textContent = task?.title || "";
    }
  }, [task?.title]);

  const handleSelection = () => {
    if (!id) {
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

      // TODO: Finding a user this way isn't efficient for how often this runs
      const user = useSessionStore
        .getState()
        .connectedUsers.find((u) => u.id === selection.userId);
      if (!user) {
        continue;
      }

      try {
        const range = new Range();
        range.setStart(textNode, selection.start || 0);
        range.setEnd(textNode, selection.end || 0);
        const highlight = new Highlight(range);

        // TODO: Handle users with the same color
        CSS.highlights.set(user.color, highlight);
      } catch (error) {
        console.error("Error creating highlight:", error);
      }
    }

    // TODO: Handle highlights in multiple tasks
    return () => {
      CSS.highlights.clear();
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
      if (!task && newTitle !== "") {
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
    if (task && newTitle !== task.title) {
      editTask(id, { title: newTitle });
    }
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (task) {
      editTask(id, { completed: event.currentTarget.checked });
    }
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.effectAllowed = "move";

    if (task) {
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
    <div
      role="listitem"
      className={clsx(styles.todoItem, isDraggingThis && styles.dragging)}
      aria-label="Task"
      draggable={!!task}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <input
        name="completed"
        type="checkbox"
        className={styles.checkbox}
        checked={task?.completed || false}
        onChange={handleCheckboxChange}
        disabled={!task}
        title="Mark task as complete"
        aria-hidden={!task}
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
        data-placeholder={!task ? "Add a new task..." : ""}
        title="Edit task title"
      />
    </div>
  );
}
