import { useEffect } from "react";
import styles from "./App.module.scss";
import { TodoList } from "./components/TodoList/TodoList";
import { socket } from "./socket";
import { useSessionStore } from "./stores/useSessionStore";

function App() {
  const connectedUsers = useSessionStore((s) => s.connectedUsers);
  const userColors = useSessionStore((s) => s.textSelectionColors);
  const currentUserId = useSessionStore((s) => s.currentUserId);

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Set up the ::selection and ::highlight colors for each user
    const bodyStyles = window.getComputedStyle(document.body);
    for (const [userId, color] of Object.entries(userColors)) {
      const highlightColor = bodyStyles.getPropertyValue(
        `--color-user-${color}-50`
      );

      if (userId === currentUserId) {
        document.documentElement.style.setProperty(
          "--color-current-user",
          highlightColor
        );
      } else {
        const styleSheet = document.styleSheets[0];
        styleSheet.insertRule(
          `::highlight(user-${userId}) { background-color: ${highlightColor}; }`,
          styleSheet.cssRules.length
        );
      }
    }
  }, [currentUserId, userColors]);

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
              <div className={styles.username}>
                {connectedUser.displayName}
                {connectedUser.id === currentUserId ? " (You)" : ""}
              </div>
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
