export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface User {
  id: string;
  displayName: string;
  color: string;
}

export interface UpdateTaskEvent {
  task: Task;
}

export interface UpdateConnectedUsersEvent {
  users: User[];
}

export interface ServerEvents {
  updateTask: (data: UpdateTaskEvent) => void;
  updateConnectedUsers: (data: UpdateConnectedUsersEvent) => void;
}

export interface ClientEvents {}
