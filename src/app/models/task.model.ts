export interface Task {
  id: string;
  date: Date;
  entityName: string;
  taskType: TaskType;
  time: string;
  contactPerson: string;
  note?: string;
  status: TaskStatus;
  phoneNumber?: string;
}

export enum TaskType {
  CALL = 'Call',
  MEETING = 'Meeting',
  VIDEO_CALL = 'Video Call'
}

export enum TaskStatus {
  OPEN = 'Open',
  CLOSED = 'Closed'
}

export interface TaskFilter {
  taskType?: TaskType;
  status?: TaskStatus;
  contactPerson?: string;
  entityName?: string;
  dateFrom?: Date;
  dateTo?: Date;
}