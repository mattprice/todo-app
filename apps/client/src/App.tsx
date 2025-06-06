import { useState } from "react";
import styles from "./App.module.scss";
import { TodoItem } from "./components/TodoItem/TodoItem";

function App() {
  const [taskList, setTaskList] = useState<string[]>([]);

  const addTask = (task: string) => {
    setTaskList([...taskList, task]);
  };

  return (
    <>
      <header className={styles.header}>
        <h1>To-Do App</h1>
        <div className={styles.headerDetails}>Current User</div>
      </header>

      <section className={styles.listWrapper}>
        <div className={styles.todoList}>
          {taskList.map((task, index) => (
            <TodoItem key={index} defaultValue={task} onSubmit={addTask} />
          ))}
          <TodoItem onSubmit={addTask} />
        </div>
      </section>
    </>
  );
}

export default App;
