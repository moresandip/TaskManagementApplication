import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskType, TaskStatus } from '../../models/task.model';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" [class.show]="isVisible" (click)="onBackdropClick($event)">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ isEdit ? 'Edit Task' : 'Create New Task' }}</h2>
          <button class="close-btn" (click)="onCancel()" type="button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <form class="modal-body" (ngSubmit)="onSave()" #taskForm="ngForm">
          <div class="form-group">
            <label for="entityName">Entity Name *</label>
            <input 
              type="text" 
              id="entityName" 
              name="entityName" 
              [(ngModel)]="taskData.entityName" 
              required
              class="form-input"
              placeholder="Enter entity name">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="date">Date *</label>
              <input 
                type="date" 
                id="date" 
                name="date" 
                [value]="formatDateForInput(taskData.date)" 
                (change)="onDateChange($event)"
                required
                class="form-input">
            </div>
            <div class="form-group">
              <label for="time">Time *</label>
              <input 
                type="time" 
                id="time" 
                name="time" 
                [(ngModel)]="taskData.time" 
                required
                class="form-input">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="taskType">Task Type *</label>
              <select 
                id="taskType" 
                name="taskType" 
                [(ngModel)]="taskData.taskType" 
                required
                class="form-select">
                <option [value]="TaskType.CALL">{{ TaskType.CALL }}</option>
                <option [value]="TaskType.MEETING">{{ TaskType.MEETING }}</option>
                <option [value]="TaskType.VIDEO_CALL">{{ TaskType.VIDEO_CALL }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="phoneNumber">Phone Number</label>
              <input 
                type="tel" 
                id="phoneNumber" 
                name="phoneNumber" 
                [(ngModel)]="taskData.phoneNumber" 
                class="form-input"
                placeholder="+1-555-0123">
            </div>
          </div>

          <div class="form-group">
            <label for="contactPerson">Contact Person *</label>
            <input 
              type="text" 
              id="contactPerson" 
              name="contactPerson" 
              [(ngModel)]="taskData.contactPerson" 
              required
              class="form-input"
              placeholder="Enter contact person name">
          </div>

          <div class="form-group">
            <label for="note">Note</label>
            <textarea 
              id="note" 
              name="note" 
              [(ngModel)]="taskData.note" 
              rows="3"
              class="form-textarea"
              placeholder="Add any additional notes..."></textarea>
          </div>

          <div class="form-group">
            <label for="status">Status</label>
            <select 
              id="status" 
              name="status" 
              [(ngModel)]="taskData.status" 
              class="form-select">
              <option [value]="TaskStatus.OPEN">{{ TaskStatus.OPEN }}</option>
              <option [value]="TaskStatus.CLOSED">{{ TaskStatus.CLOSED }}</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" (click)="onCancel()">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="!taskForm.valid">
              {{ isEdit ? 'Update' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    .modal-overlay.show {
      opacity: 1;
      visibility: visible;
    }

    .modal-container {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      transform: scale(0.95);
      transition: transform 0.3s ease;
    }

    .modal-overlay.show .modal-container {
      transform: scale(1);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 24px 0;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 24px;
    }

    .modal-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      padding: 8px;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      color: #374151;
      background: #f3f4f6;
    }

    .modal-body {
      padding: 0 24px 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }

    label {
      display: block;
      font-weight: 500;
      color: #374151;
      margin-bottom: 8px;
      font-size: 0.875rem;
    }

    .form-input,
    .form-select,
    .form-textarea {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.875rem;
      transition: all 0.2s ease;
      background: white;
      box-sizing: border-box;
    }

    .form-input:focus,
    .form-select:focus,
    .form-textarea:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }

    .btn-primary,
    .btn-secondary {
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }

    .btn-primary {
      background: #2563eb;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1d4ed8;
      transform: translateY(-1px);
    }

    .btn-primary:disabled {
      background: #9ca3af;
      cursor: not-allowed;
      transform: none;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
      transform: translateY(-1px);
    }
  `]
})
export class TaskModalComponent implements OnInit {
  @Input() isVisible = false;
  @Input() task: Task | null = null;
  @Output() save = new EventEmitter<Task>();
  @Output() cancel = new EventEmitter<void>();

  TaskType = TaskType;
  TaskStatus = TaskStatus;
  isEdit = false;

  taskData: Partial<Task> = {
    entityName: '',
    date: new Date(),
    taskType: TaskType.CALL,
    time: '',
    contactPerson: '',
    note: '',
    status: TaskStatus.OPEN,
    phoneNumber: ''
  };

  ngOnInit() {
    this.resetForm();
    if (this.task) {
      this.isEdit = true;
      this.taskData = { ...this.task };
    }
  }

  onSave() {
    if (this.isValidTask()) {
      const taskToSave: Task = {
        id: this.isEdit ? this.task!.id : '',
        date: this.taskData.date!,
        entityName: this.taskData.entityName!,
        taskType: this.taskData.taskType!,
        time: this.taskData.time!,
        contactPerson: this.taskData.contactPerson!,
        note: this.taskData.note || '',
        status: this.taskData.status!,
        phoneNumber: this.taskData.phoneNumber || ''
      };
      this.save.emit(taskToSave);
    }
  }

  onCancel() {
    this.cancel.emit();
    this.resetForm();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  onDateChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.taskData.date = new Date(target.value);
  }

  formatDateForInput(date: Date | undefined): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  }

  private isValidTask(): boolean {
    return !!(
      this.taskData.entityName &&
      this.taskData.date &&
      this.taskData.time &&
      this.taskData.contactPerson &&
      this.taskData.taskType &&
      this.taskData.status
    );
  }

  private resetForm() {
    this.taskData = {
      entityName: '',
      date: new Date(),
      taskType: TaskType.CALL,
      time: '',
      contactPerson: '',
      note: '',
      status: TaskStatus.OPEN,
      phoneNumber: ''
    };
    this.isEdit = false;
  }
}