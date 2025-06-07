import { useEffect } from "react";
import styles from "./App.module.scss";
import { TodoList } from "./components/TodoList/TodoList";
import { socket } from "./socket";

function App() {
  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <header className={styles.header}>
        <h1>To-Do App</h1>
        <div className={styles.headerDetails}>Current User</div>
      </header>

      <div className={styles.container}>
        <TodoList />
      </div>
    </>
  );
}

export default App;
