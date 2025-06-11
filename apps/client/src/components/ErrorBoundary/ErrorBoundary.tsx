import React from "react";
import styles from "./ErrorBoundary.module.scss";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  handleReload() {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorBoundary}>
          <h2>Sorry! An unexpected error has occurred.</h2>
          <a href="/" onClick={this.handleReload}>
            Reload page
          </a>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
