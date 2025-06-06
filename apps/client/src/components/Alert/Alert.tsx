import styles from "./Alert.module.scss";

interface AlertProps {
  message: string;
}

export function Alert({ message }: AlertProps) {
  return <div className={styles.alert}>{message}</div>;
}
