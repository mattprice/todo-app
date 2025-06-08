import { type KeyboardEvent, useEffect, useRef } from "react";
import { useSessionStore } from "../../stores/useSessionStore";
import { useTaskStore } from "../../stores/useTaskStore";
import styles from "./TodoItem.module.scss";

interface TodoItemProps {
  id?: string;
}

export function TodoItem({ id = "" }: TodoItemProps) {
  const task = useTaskStore((s) => s.tasks[id]);
  const textSelections = useSessionStore((s) => s.textSelections[id]);
  const addTask = useTaskStore((s) => s.addTask);
  const editTask = useTaskStore((s) => s.editTask);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Don't update the input field if it's focused. (You run into a fun bug
    // where you end up typing at the beginning of the field.)
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.textContent = task?.title || "";
    }
  }, [task?.title]);

  useEffect(() => {
    const inputField = inputRef.current;
    if (!id || !inputField) {
      return;
    }

    const handleSelection = () => {
      const selection = window.getSelection();

      // Ignore empty selections or selections with multiple ranges
      if (!selection || selection.rangeCount !== 1) {
        return;
      }

      // Ignore events for other TodoItems
      if (!inputField.contains(selection.anchorNode as Node)) {
        return;
      }

      const range = selection.getRangeAt(0);
      const start = range.startOffset;
      const end = range.endOffset;
      useSessionStore.getState().sendTextSelection(id, start, end);
    };

    document.addEventListener("selectionchange", handleSelection);
    return () => {
      document.removeEventListener("selectionchange", handleSelection);
    };
  }, [id]);

  useEffect(() => {
    // TODO: Don't highlight your own selections
    const textNode = inputRef.current?.firstChild;
    if (!textNode || !textSelections || !CSS.highlights) {
      return;
    }

    for (const selection of textSelections) {
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

  const handleBlur = () => {
    // Don't reset the text selection if the input field is still focused
    // (This could happen if, e.g., the user clicks to another browser tab)
    if (document.activeElement === inputRef.current) {
      return;
    }

    useSessionStore.getState().sendTextSelection(id, null, null);
  };

  // TODO: Clear text selection when the input is blurred
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!inputRef.current) {
      return;
    }

    const newTitle = inputRef.current.textContent || "";

    // Reset the input field on Escape
    if (event.key === "Escape") {
      event.preventDefault();
      event.currentTarget.blur();
      inputRef.current.textContent = task.title;
    }

    // Create a new task on Enter, or blur the input for existing tasks
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();

      // TODO: Display something if there is an error
      if (newTitle !== "" && !task) {
        addTask({ title: newTitle, completed: false });
        inputRef.current.textContent = "";
      }
    }

    // For everything else, if the value has changed, update the task
    // TODO: If the title is empty, ask if they want to delete the task
    if (task && newTitle !== task.title) {
      editTask(id, { title: newTitle });
    }
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (task) {
      editTask(id, { completed: event.target.checked });
    }
  };

  return (
    <div role="listitem" className={styles.todoItem} aria-label="Task">
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
        contentEditable
        className={styles.input}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        data-placeholder={!task ? "Add a new task..." : ""}
        title="Edit task title"
      />
    </div>
  );
}
