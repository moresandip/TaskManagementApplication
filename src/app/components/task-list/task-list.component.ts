import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskType, TaskStatus, TaskFilter } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { TaskModalComponent } from '../task-modal/task-modal.component';
import { TaskFiltersComponent } from '../task-filters/task-filters.component';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskModalComponent, TaskFiltersComponent],
  template: `
    <div class="task-list-container">
      <div class="header">
        <h1>Sales Log</h1>
        <button class="create-btn" (click)="openCreateModal()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create Task
        </button>
      </div>

      <app-task-filters (filtersChange)="onFiltersChange($event)"></app-task-filters>

      <div class="table-container">
        <table class="tasks-table">
          <thead>
            <tr>
              <th (click)="sort('date')" class="sortable">
                Date
                <span class="sort-icon" [class.asc]="sortColumn === 'date' && sortDirection === 'asc'"
                      [class.desc]="sortColumn === 'date' && sortDirection === 'desc'">↕</span>
              </th>
              <th (click)="sort('entityName')" class="sortable">
                Entity Name
                <span class="sort-icon" [class.asc]="sortColumn === 'entityName' && sortDirection === 'asc'"
                      [class.desc]="sortColumn === 'entityName' && sortDirection === 'desc'">↕</span>
              </th>
              <th (click)="sort('taskType')" class="sortable">
                Task Type
                <span class="sort-icon" [class.asc]="sortColumn === 'taskType' && sortDirection === 'asc'"
                      [class.desc]="sortColumn === 'taskType' && sortDirection === 'desc'">↕</span>
              </th>
              <th (click)="sort('time')" class="sortable">
                Time
                <span class="sort-icon" [class.asc]="sortColumn === 'time' && sortDirection === 'asc'"
                      [class.desc]="sortColumn === 'time' && sortDirection === 'desc'">↕</span>
              </th>
              <th (click)="sort('contactPerson')" class="sortable">
                Contact Person
                <span class="sort-icon" [class.asc]="sortColumn === 'contactPerson' && sortDirection === 'asc'"
                      [class.desc]="sortColumn === 'contactPerson' && sortDirection === 'desc'">↕</span>
              </th>
              <th>Notes</th>
              <th>Status</th>
              <th>Options</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let task of filteredTasks; trackBy: trackByTaskId" class="task-row">
              <td>{{ formatDate(task.date) }}</td>
              <td>
                <div class="editable-cell" 
                     [class.editing]="editingField === task.id + '-entityName'"
                     (click)="startEditing(task.id, 'entityName', task.entityName)">
                  <span *ngIf="editingField !== task.id + '-entityName'">{{ task.entityName }}</span>
                  <input 
                    *ngIf="editingField === task.id + '-entityName'"
                    [(ngModel)]="editValue"
                    (blur)="saveEdit(task, 'entityName')"
                    (keyup.enter)="saveEdit(task, 'entityName')"
                    (keyup.escape)="cancelEdit()"
                    class="inline-edit-input"
                    #editInput>
                </div>
              </td>
              <td>
                <span class="task-type-badge" [class]="getTaskTypeClass(task.taskType)">
                  {{ task.taskType }}
                </span>
              </td>
              <td>{{ task.time }}</td>
              <td>
                <div class="editable-cell" 
                     [class.editing]="editingField === task.id + '-contactPerson'"
                     (click)="startEditing(task.id, 'contactPerson', task.contactPerson)">
                  <span *ngIf="editingField !== task.id + '-contactPerson'">{{ task.contactPerson }}</span>
                  <input 
                    *ngIf="editingField === task.id + '-contactPerson'"
                    [(ngModel)]="editValue"
                    (blur)="saveEdit(task, 'contactPerson')"
                    (keyup.enter)="saveEdit(task, 'contactPerson')"
                    (keyup.escape)="cancelEdit()"
                    class="inline-edit-input"
                    #editInput>
                </div>
              </td>
              <td>
                <div class="editable-cell" 
                     [class.editing]="editingField === task.id + '-note'"
                     (click)="startEditing(task.id, 'note', task.note || '')">
                  <span *ngIf="editingField !== task.id + '-note'" class="note-text">
                    {{ task.note || 'Click to add note...' }}
                  </span>
                  <input 
                    *ngIf="editingField === task.id + '-note'"
                    [(ngModel)]="editValue"
                    (blur)="saveEdit(task, 'note')"
                    (keyup.enter)="saveEdit(task, 'note')"
                    (keyup.escape)="cancelEdit()"
                    class="inline-edit-input"
                    placeholder="Add note..."
                    #editInput>
                </div>
              </td>
              <td>
                <div class="status-dropdown" [class.open]="openDropdown === task.id + '-status'">
                  <button 
                    class="status-btn" 
                    [class]="getStatusClass(task.status)"
                    (click)="toggleDropdown(task.id + '-status', $event)">
                    {{ task.status }}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                  </button>
                  <div class="dropdown-menu" *ngIf="openDropdown === task.id + '-status'">
                    <button 
                      class="dropdown-item"
                      (click)="changeStatus(task, TaskStatus.OPEN)">
                      {{ TaskStatus.OPEN }}
                    </button>
                    <button 
                      class="dropdown-item"
                      (click)="changeStatus(task, TaskStatus.CLOSED)">
                      {{ TaskStatus.CLOSED }}
                    </button>
                  </div>
                </div>
              </td>
              <td>
                <div class="options-dropdown" [class.open]="openDropdown === task.id + '-options'">
                  <button 
                    class="options-btn"
                    (click)="toggleDropdown(task.id + '-options', $event)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="12" cy="5" r="1"></circle>
                      <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                  </button>
                  <div class="dropdown-menu" *ngIf="openDropdown === task.id + '-options'">
                    <button class="dropdown-item" (click)="editTask(task)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit
                    </button>
                    <button class="dropdown-item" (click)="duplicateTask(task.id)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      Duplicate
                    </button>
                    <button class="dropdown-item danger" (click)="deleteTask(task.id)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="m19,6v14a2,2 0,0 1-2,2H7a2,2 0,0 1-2-2V6m3,0V4a2,2 0,0 1,2-2h4a2,2 0,0 1,2,2v2"></path>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </td>
            </tr>
            <tr *ngIf="filteredTasks.length === 0">
              <td colspan="8" class="no-tasks">
                No tasks found. {{ hasActiveFilters() ? 'Try adjusting your filters.' : 'Create your first task!' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <app-task-modal
      [isVisible]="isModalVisible"
      [task]="selectedTask"
      (save)="onTaskSave($event)"
      (cancel)="onModalCancel()">
    </app-task-modal>
  `,
  styles: [`
    .task-list-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .create-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #2563eb;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .create-btn:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
    }

    .table-container {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }

    .tasks-table {
      width: 100%;
      border-collapse: collapse;
    }

    .tasks-table th {
      background: #f9fafb;
      padding: 16px 12px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
      position: relative;
    }

    .tasks-table th.sortable {
      cursor: pointer;
      user-select: none;
      transition: background 0.2s ease;
    }

    .tasks-table th.sortable:hover {
      background: #f3f4f6;
    }

    .sort-icon {
      font-size: 0.75rem;
      color: #9ca3af;
      margin-left: 4px;
    }

    .sort-icon.asc,
    .sort-icon.desc {
      color: #2563eb;
    }

    .tasks-table td {
      padding: 16px 12px;
      border-bottom: 1px solid #f3f4f6;
      vertical-align: top;
    }

    .task-row {
      transition: background 0.2s ease;
    }

    .task-row:hover {
      background: #f9fafb;
    }

    .editable-cell {
      cursor: pointer;
      padding: 6px 8px;
      border-radius: 4px;
      transition: all 0.2s ease;
      min-height: 20px;
    }

    .editable-cell:hover {
      background: #f3f4f6;
    }

    .editable-cell.editing {
      background: #eff6ff;
    }

    .inline-edit-input {
      border: 1px solid #2563eb;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 0.875rem;
      width: 100%;
      background: white;
    }

    .inline-edit-input:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
    }

    .note-text {
      color: #6b7280;
      font-style: italic;
    }

    .note-text:empty::before {
      content: 'Click to add note...';
    }

    .task-type-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .task-type-badge.call {
      background: #dcfce7;
      color: #166534;
    }

    .task-type-badge.meeting {
      background: #dbeafe;
      color: #1e40af;
    }

    .task-type-badge.video-call {
      background: #fef3c7;
      color: #92400e;
    }

    .status-dropdown,
    .options-dropdown {
      position: relative;
    }

    .status-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
      min-width: 100px;
    }

    .status-btn:hover {
      border-color: #9ca3af;
    }

    .status-btn.open {
      color: #059669;
      border-color: #10b981;
      background: #f0fdf4;
    }

    .status-btn.closed {
      color: #dc2626;
      border-color: #ef4444;
      background: #fef2f2;
    }

    .options-btn {
      padding: 8px;
      border: none;
      background: none;
      border-radius: 6px;
      cursor: pointer;
      color: #6b7280;
      transition: all 0.2s ease;
    }

    .options-btn:hover {
      background: #f3f4f6;
      color: #374151;
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      z-index: 10;
      min-width: 160px;
      overflow: hidden;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 12px 16px;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      transition: background 0.2s ease;
      font-size: 0.875rem;
    }

    .dropdown-item:hover {
      background: #f3f4f6;
    }

    .dropdown-item.danger {
      color: #dc2626;
    }

    .dropdown-item.danger:hover {
      background: #fef2f2;
    }

    .no-tasks {
      text-align: center;
      padding: 48px 16px;
      color: #6b7280;
      font-style: italic;
    }

    @media (max-width: 1024px) {
      .tasks-table {
        font-size: 0.875rem;
      }
      
      .tasks-table th,
      .tasks-table td {
        padding: 12px 8px;
      }
    }

    @media (max-width: 768px) {
      .task-list-container {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .table-container {
        overflow-x: auto;
      }

      .tasks-table {
        min-width: 800px;
      }
    }
  `]
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  isModalVisible = false;
  selectedTask: Task | null = null;
  openDropdown: string | null = null;
  editingField: string | null = null;
  editValue = '';
  currentFilters: TaskFilter = {};
  sortColumn: keyof Task = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';

  TaskType = TaskType;
  TaskStatus = TaskStatus;

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
      this.applyFiltersAndSort();
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Close dropdowns when clicking outside
    this.openDropdown = null;
  }

  openCreateModal() {
    this.selectedTask = null;
    this.isModalVisible = true;
  }

  editTask(task: Task) {
    this.selectedTask = task;
    this.isModalVisible = true;
    this.openDropdown = null;
  }

  onTaskSave(task: Task) {
    const operation = this.selectedTask 
      ? this.taskService.updateTask(task)
      : this.taskService.addTask(task);

    operation.subscribe(result => {
      if (result.success) {
        this.isModalVisible = false;
        this.selectedTask = null;
      } else {
        console.error('Task operation failed:', result.message);
        this.showErrorMessage(result.message || 'Operation failed. Please try again.');
      }
    });
  }

  onModalCancel() {
    this.isModalVisible = false;
    this.selectedTask = null;
  }

  duplicateTask(taskId: string) {
    this.taskService.duplicateTask(taskId).subscribe(result => {
      if (!result.success) {
        console.error('Failed to duplicate task:', result.message);
        this.showErrorMessage('Failed to duplicate task. Please try again.');
      }
    });
    this.openDropdown = null;
  }

  deleteTask(taskId: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe(result => {
        if (!result.success) {
          console.error('Failed to delete task:', result.message);
          this.showErrorMessage('Failed to delete task. Please try again.');
        }
      });
    }
    this.openDropdown = null;
  }

  changeStatus(task: Task, newStatus: TaskStatus) {
    const updatedTask = { ...task, status: newStatus };
    this.taskService.updateTask(updatedTask).subscribe(result => {
      if (!result.success) {
        console.error('Failed to update status:', result.message);
        // Show user-friendly error message
        this.showErrorMessage('Failed to update task status. Please try again.');
      }
    });
    this.openDropdown = null;
  }

  toggleDropdown(dropdownId: string, event: Event) {
    event.stopPropagation();
    this.openDropdown = this.openDropdown === dropdownId ? null : dropdownId;
  }

  startEditing(taskId: string, field: string, currentValue: string) {
    this.editingField = taskId + '-' + field;
    this.editValue = currentValue;
    setTimeout(() => {
      const input = document.querySelector('.inline-edit-input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    });
  }

  saveEdit(task: Task, field: keyof Task) {
    if (this.editValue !== task[field]) {
      const updatedTask = { ...task, [field]: this.editValue };
      this.taskService.updateTask(updatedTask).subscribe(result => {
        if (!result.success) {
          console.error('Failed to update task:', result.message);
          this.showErrorMessage('Failed to update task. Please try again.');
        }
      });
    }
    this.cancelEdit();
  }

  cancelEdit() {
    this.editingField = null;
    this.editValue = '';
  }

  onFiltersChange(filters: TaskFilter) {
    this.currentFilters = filters;
    this.applyFiltersAndSort();
  }

  sort(column: keyof Task) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSort();
  }

  private applyFiltersAndSort() {
    let filtered = this.taskService.filterTasks(this.tasks, this.currentFilters);
    this.filteredTasks = this.taskService.sortTasks(filtered, this.sortColumn, this.sortDirection);
  }

  hasActiveFilters(): boolean {
    return Object.keys(this.currentFilters).some(key => 
      this.currentFilters[key as keyof TaskFilter] !== undefined && 
      this.currentFilters[key as keyof TaskFilter] !== ''
    );
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  }

  getTaskTypeClass(taskType: TaskType): string {
    switch (taskType) {
      case TaskType.CALL: return 'call';
      case TaskType.MEETING: return 'meeting';
      case TaskType.VIDEO_CALL: return 'video-call';
      default: return '';
    }
  }

  getStatusClass(status: TaskStatus): string {
    return status.toLowerCase();
  }

  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }

  private showErrorMessage(message: string) {
    // Simple error display - you could enhance this with a toast notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-toast';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc2626;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      z-index: 1000;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    `;
    document.body.appendChild(errorDiv);
    setTimeout(() => {
      document.body.removeChild(errorDiv);
    }, 3000);
  }
}