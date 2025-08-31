import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task, TaskType, TaskStatus, TaskFilter } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  constructor() {
    // Initialize with sample data
    const sampleTasks: Task[] = [
      {
        id: '1',
        date: new Date('2025-01-15'),
        entityName: 'Acme Corp',
        taskType: TaskType.CALL,
        time: '10:00 AM',
        contactPerson: 'John Smith',
        note: 'Follow up on proposal',
        status: TaskStatus.OPEN,
        phoneNumber: '+1-555-0123'
      },
      {
        id: '2',
        date: new Date('2025-01-16'),
        entityName: 'TechStart Inc',
        taskType: TaskType.MEETING,
        time: '2:00 PM',
        contactPerson: 'Sarah Johnson',
        note: 'Product demo presentation',
        status: TaskStatus.CLOSED,
        phoneNumber: '+1-555-0456'
      },
      {
        id: '3',
        date: new Date('2025-01-17'),
        entityName: 'Global Solutions',
        taskType: TaskType.VIDEO_CALL,
        time: '11:30 AM',
        contactPerson: 'Mike Davis',
        status: TaskStatus.OPEN,
        phoneNumber: '+1-555-0789'
      }
    ];
    this.tasksSubject.next(sampleTasks);
  }

  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  addTask(task: Omit<Task, 'id'>): void {
    const newTask: Task = {
      ...task,
      id: this.generateId()
    };
    const currentTasks = this.tasksSubject.value;
    this.tasksSubject.next([...currentTasks, newTask]);
  }

  updateTask(updatedTask: Task): void {
    const currentTasks = this.tasksSubject.value;
    const index = currentTasks.findIndex(task => task.id === updatedTask.id);
    if (index !== -1) {
      currentTasks[index] = updatedTask;
      this.tasksSubject.next([...currentTasks]);
    }
  }

  deleteTask(taskId: string): void {
    const currentTasks = this.tasksSubject.value;
    const filteredTasks = currentTasks.filter(task => task.id !== taskId);
    this.tasksSubject.next(filteredTasks);
  }

  duplicateTask(taskId: string): void {
    const currentTasks = this.tasksSubject.value;
    const taskToDuplicate = currentTasks.find(task => task.id === taskId);
    if (taskToDuplicate) {
      const duplicatedTask: Task = {
        ...taskToDuplicate,
        id: this.generateId(),
        date: new Date(),
        status: TaskStatus.OPEN
      };
      this.tasksSubject.next([...currentTasks, duplicatedTask]);
    }
  }

  filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
    return tasks.filter(task => {
      if (filter.taskType && task.taskType !== filter.taskType) return false;
      if (filter.status && task.status !== filter.status) return false;
      if (filter.contactPerson && !task.contactPerson.toLowerCase().includes(filter.contactPerson.toLowerCase())) return false;
      if (filter.entityName && !task.entityName.toLowerCase().includes(filter.entityName.toLowerCase())) return false;
      if (filter.dateFrom && task.date < filter.dateFrom) return false;
      if (filter.dateTo && task.date > filter.dateTo) return false;
      return true;
    });
  }

  sortTasks(tasks: Task[], column: keyof Task, direction: 'asc' | 'desc'): Task[] {
    return [...tasks].sort((a, b) => {
      let aValue = a[column];
      let bValue = b[column];

      // Handle undefined values - place them at the end
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return direction === 'asc' ? 1 : -1;
      if (bValue === undefined) return direction === 'asc' ? -1 : 1;

      if (aValue instanceof Date && bValue instanceof Date) {
        const aTime = aValue.getTime();
        const bTime = bValue.getTime();
        return direction === 'asc' ? aTime - bTime : bTime - aTime;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const strA = aValue.toLowerCase();
        const strB = bValue.toLowerCase();
        if (strA < strB) return direction === 'asc' ? -1 : 1;
        if (strA > strB) return direction === 'asc' ? 1 : -1;
        return 0;
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}