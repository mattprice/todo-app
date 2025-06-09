export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: number;
}

export interface TextSelection {
  userId: string;
  start: number | null;
  end: number | null;
}

export interface User {
  id: string;
  displayName: string;
  color: string;
  selection: TextSelection | null;
}

export interface UpdateTaskEvent {
  task: Task;
}

export interface UpdateConnectedUsersEvent {
  users: User[];
}

export interface UpdateTextSelectionsEvent {
  selections: Record<string, TextSelection[]>;
}

export interface ClientTextSelectionEvent {
  taskId: string;
  selection: Omit<TextSelection, "userId"> | null;
}

export interface ServerEvents {
  updateTask: (data: UpdateTaskEvent) => void;
  updateConnectedUsers: (data: UpdateConnectedUsersEvent) => void;
  updateTextSelections: (data: UpdateTextSelectionsEvent) => void;
}

export interface ClientEvents {
  textSelection: (data: ClientTextSelectionEvent) => void;
}
