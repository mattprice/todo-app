import { useEffect } from "react";
import styles from "./App.module.scss";
import { TodoList } from "./components/TodoList/TodoList";
import { socket } from "./socket";
import { useSessionStore } from "./stores/useSessionStore";

function App() {
  const connectedUsers = useSessionStore((s) => s.connectedUsers);
  const currentUserColor = useSessionStore((s) => s.currentUserColor);

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (currentUserColor) {
      const bodyStyles = window.getComputedStyle(document.body);
      const highlightColor = bodyStyles.getPropertyValue(
        `--color-user-${currentUserColor}-50`
      );
      document.documentElement.style.setProperty(
        "--color-current-user",
        highlightColor
      );
    }
  }, [currentUserColor]);

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
