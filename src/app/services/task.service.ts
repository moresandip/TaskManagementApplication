import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { supabase } from '../../lib/supabase';
import { Task, TaskType, TaskStatus, TaskFilter } from '../models/task.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  constructor(private authService: AuthService) {
    // Load tasks when user changes
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadTasks();
      } else {
        this.tasksSubject.next([]);
      }
    });
  }

  private async loadTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading tasks:', error);
        return;
      }

      const tasks: Task[] = data.map(row => ({
        id: row.id,
        date: new Date(row.date),
        entityName: row.entity_name,
        taskType: row.task_type as TaskType,
        time: row.time,
        contactPerson: row.contact_person,
        note: row.note,
        status: row.status as TaskStatus,
        phoneNumber: row.phone_number
      }));

      this.tasksSubject.next(tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }

  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  addTask(task: Omit<Task, 'id'>): Observable<{ success: boolean; message?: string }> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return from([{ success: false, message: 'User not authenticated' }]);
    }

    return from(
      supabase
        .from('tasks')
        .insert({
          user_id: currentUser.id,
          date: task.date.toISOString().split('T')[0],
          entity_name: task.entityName,
          task_type: task.taskType,
          time: task.time,
          contact_person: task.contactPerson,
          note: task.note || '',
          status: task.status,
          phone_number: task.phoneNumber || ''
        })
    ).pipe(
      map(({ error }) => {
        if (error) {
          console.error('Error adding task:', error);
          return { success: false, message: 'Failed to create task' };
        }
        this.loadTasks(); // Reload tasks
        return { success: true };
      }),
      catchError(error => {
        console.error('Error adding task:', error);
        return [{ success: false, message: 'Failed to create task' }];
      })
    );
  }

  updateTask(updatedTask: Task): Observable<{ success: boolean; message?: string }> {
    return from(
      supabase
        .from('tasks')
        .update({
          date: updatedTask.date.toISOString().split('T')[0],
          entity_name: updatedTask.entityName,
          task_type: updatedTask.taskType,
          time: updatedTask.time,
          contact_person: updatedTask.contactPerson,
          note: updatedTask.note || '',
          status: updatedTask.status,
          phone_number: updatedTask.phoneNumber || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedTask.id)
    ).pipe(
      map(({ error }) => {
        if (error) {
          console.error('Error updating task:', error);
          return { success: false, message: 'Failed to update task' };
        }
        this.loadTasks(); // Reload tasks
        return { success: true };
      }),
      catchError(error => {
        console.error('Error updating task:', error);
        return [{ success: false, message: 'Failed to update task' }];
      })
    );
  }

  deleteTask(taskId: string): Observable<{ success: boolean; message?: string }> {
    return from(
      supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
    ).pipe(
      map(({ error }) => {
        if (error) {
          console.error('Error deleting task:', error);
          return { success: false, message: 'Failed to delete task' };
        }
        this.loadTasks(); // Reload tasks
        return { success: true };
      }),
      catchError(error => {
        console.error('Error deleting task:', error);
        return [{ success: false, message: 'Failed to delete task' }];
      })
    );
  }

  duplicateTask(taskId: string): Observable<{ success: boolean; message?: string }> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return from([{ success: false, message: 'User not authenticated' }]);
    }

    const currentTasks = this.tasksSubject.value;
    const taskToDuplicate = currentTasks.find(task => task.id === taskId);
    
    if (!taskToDuplicate) {
      return from([{ success: false, message: 'Task not found' }]);
    }

    return from(
      supabase
        .from('tasks')
        .insert({
          user_id: currentUser.id,
          date: new Date().toISOString().split('T')[0],
          entity_name: taskToDuplicate.entityName,
          task_type: taskToDuplicate.taskType,
          time: taskToDuplicate.time,
          contact_person: taskToDuplicate.contactPerson,
          note: taskToDuplicate.note || '',
          status: 'Open',
          phone_number: taskToDuplicate.phoneNumber || ''
        })
    ).pipe(
      map(({ error }) => {
        if (error) {
          console.error('Error duplicating task:', error);
          return { success: false, message: 'Failed to duplicate task' };
        }
        this.loadTasks(); // Reload tasks
        return { success: true };
      }),
      catchError(error => {
        console.error('Error duplicating task:', error);
        return [{ success: false, message: 'Failed to duplicate task' }];
      })
    );
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

      // Additional undefined checks for the comparison operations
      if (aValue !== undefined && bValue !== undefined) {
        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      }
      
      return 0;
    });
  }
}