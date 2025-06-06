import { useEffect, useState } from "react";
import styles from "./App.module.scss";
import { Alert } from "./components/Alert/Alert";
import { TodoItem } from "./components/TodoItem/TodoItem";

interface Task {
  title: string;
}

function App() {
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/tasks");

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();
      setTaskList(data.data.tasks);
    } catch (err) {
      setError("Unable to fetch task list");
      console.error("Error fetching task last:", err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (title: string) => {
    try {
      setError(null);
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: title }),
      });

      if (!response.ok) {
        throw new Error("Unable to create task");
      }

      const data = await response.json();
      setTaskList(data.data.tasks);
    } catch (err) {
      setError("Unable to create task");
      console.error("Error creating task:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <>
      <header className={styles.header}>
        <h1>To-Do App</h1>
        <div className={styles.headerDetails}>Current User</div>
      </header>

      <div className={styles.listWrapper}>
        <div className={styles.todoList}>
          {error && <Alert message={`Error: ${error}`} />}

          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              {taskList.map((task, index) => (
                <TodoItem
                  key={index}
                  defaultValue={task.title}
                  onSubmit={addTask}
                />
              ))}
              <TodoItem onSubmit={addTask} />
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
