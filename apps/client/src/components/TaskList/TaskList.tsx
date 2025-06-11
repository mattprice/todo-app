import { useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { useTaskStore } from "../../stores/useTaskStore";
import { Alert } from "../Alert/Alert";
import { TaskItem } from "../TaskItem/TaskItem";
import styles from "./TaskList.module.scss";

export function TaskList() {
  const status = useTaskStore((s) => s.status);
  const tasks = useTaskStore(useShallow((s) => s.tasks));

  useEffect(() => {
    useTaskStore.getState().fetchTasks();
  }, []);

  if (status === "error") {
    return (
      <div className={styles.errorContainer}>
        <Alert message="Unable to fetch the task list. Please try again." />
      </div>
    );
  }

  if (status === "loading") {
    return <div>Loading tasks...</div>;
  }

  const sortedTasks = Object.values(tasks).sort((a, b) => {
    return a.priority - b.priority;
  });
  const lastPriority = sortedTasks[sortedTasks.length - 1]?.priority || 0;

  return (
    <section
      className={styles.taskList}
      role="list"
      aria-labelledby="list-name"
    >
      <h1 id="list-name">Task List</h1>

      {sortedTasks.map((task, i, array) => {
        const prevPriority = i === 0 ? 0 : array[i - 1].priority;
        const nextPriority = task.priority;

        return (
          <TaskItem
            key={task.id}
            id={task.id}
            prevPriority={prevPriority}
            nextPriority={nextPriority}
          />
        );
      })}

      <TaskItem prevPriority={lastPriority} nextPriority={lastPriority + 1} />
    </section>
  );
}
