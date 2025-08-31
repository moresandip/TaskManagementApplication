import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskType, TaskStatus, TaskFilter } from '../../models/task.model';

@Component({
  selector: 'app-task-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filters-container">
      <div class="filters-row">
        <div class="filter-group">
          <label for="taskTypeFilter">Task Type</label>
          <select 
            id="taskTypeFilter" 
            [(ngModel)]="filters.taskType" 
            (change)="onFilterChange()"
            class="filter-select">
            <option value="">All Types</option>
            <option [value]="TaskType.CALL">{{ TaskType.CALL }}</option>
            <option [value]="TaskType.MEETING">{{ TaskType.MEETING }}</option>
            <option [value]="TaskType.VIDEO_CALL">{{ TaskType.VIDEO_CALL }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="statusFilter">Status</label>
          <select 
            id="statusFilter" 
            [(ngModel)]="filters.status" 
            (change)="onFilterChange()"
            class="filter-select">
            <option value="">All Status</option>
            <option [value]="TaskStatus.OPEN">{{ TaskStatus.OPEN }}</option>
            <option [value]="TaskStatus.CLOSED">{{ TaskStatus.CLOSED }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="contactPersonFilter">Contact Person</label>
          <input 
            type="text" 
            id="contactPersonFilter" 
            [(ngModel)]="filters.contactPerson" 
            (input)="onFilterChange()"
            placeholder="Search by contact person..."
            class="filter-input">
        </div>

        <div class="filter-group">
          <label for="entityNameFilter">Entity Name</label>
          <input 
            type="text" 
            id="entityNameFilter" 
            [(ngModel)]="filters.entityName" 
            (input)="onFilterChange()"
            placeholder="Search by entity name..."
            class="filter-input">
        </div>
      </div>

      <div class="filters-row">
        <div class="filter-group">
          <label for="dateFromFilter">Date From</label>
          <input 
            type="date" 
            id="dateFromFilter" 
            [value]="formatDateForInput(filters.dateFrom)"
            (change)="onDateFromChange($event)"
            class="filter-input">
        </div>

        <div class="filter-group">
          <label for="dateToFilter">Date To</label>
          <input 
            type="date" 
            id="dateToFilter" 
            [value]="formatDateForInput(filters.dateTo)"
            (change)="onDateToChange($event)"
            class="filter-input">
        </div>

        <div class="filter-group filter-actions">
          <button 
            type="button" 
            (click)="clearFilters()"
            class="clear-filters-btn">
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filters-container {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      margin-bottom: 24px;
    }

    .filters-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .filters-row:last-child {
      margin-bottom: 0;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
    }

    .filter-actions {
      justify-content: flex-end;
      align-items: flex-end;
    }

    label {
      font-weight: 500;
      color: #374151;
      margin-bottom: 6px;
      font-size: 0.875rem;
    }

    .filter-input,
    .filter-select {
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
      transition: all 0.2s ease;
      background: white;
    }

    .filter-input:focus,
    .filter-select:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .clear-filters-btn {
      padding: 10px 16px;
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .clear-filters-btn:hover {
      background: #e5e7eb;
      transform: translateY(-1px);
    }

    @media (max-width: 768px) {
      .filters-row {
        grid-template-columns: 1fr;
      }
      
      .filters-container {
        padding: 16px;
      }
    }
  `]
})
export class TaskFiltersComponent {
  @Output() filtersChange = new EventEmitter<TaskFilter>();

  TaskType = TaskType;
  TaskStatus = TaskStatus;

  filters: TaskFilter = {};

  onFilterChange() {
    this.filtersChange.emit({ ...this.filters });
  }

  onDateFromChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.filters.dateFrom = target.value ? new Date(target.value) : undefined;
    this.onFilterChange();
  }

  onDateToChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.filters.dateTo = target.value ? new Date(target.value) : undefined;
    this.onFilterChange();
  }

  formatDateForInput(date?: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  }

  clearFilters() {
    this.filters = {};
    this.onFilterChange();
  }
}