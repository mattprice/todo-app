import { useEffect } from "react";
import styles from "./App.module.scss";
import { TodoList } from "./components/TodoList/TodoList";
import { socket } from "./socket";
import { useSessionStore } from "./stores/useSessionStore";

function App() {
  const { connectedUsers } = useSessionStore();

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
        <div className={styles.headerDetails}>
          {connectedUsers.map((connectedUser) => (
            <div className={styles.user} key={connectedUser.id}>
              <div
                className={`${styles.avatar} ${styles[connectedUser.color]}`}
              />
              <div className={styles.username}>{connectedUser.displayName}</div>
            </div>
          ))}
        </div>
      </header>

      <div className={styles.container}>
        <TodoList />
      </div>
    </>
  );
}

export default App;
