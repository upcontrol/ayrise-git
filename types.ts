export interface Task {
  id: string;
  taskNumber: number;
  title: string;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
  labels?: string[];
}