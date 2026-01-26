import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { combineLatest, map, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ExpenseService } from '../../core/services/expense.service';
import { CategoryService } from '../../core/services/category.service';
import { Expense } from '../../core/models/expense.model';
import { Category } from '../../core/models/category.model';
import { ExpenseFormDialogComponent } from './expense-form-dialog.component';

interface ExpenseRow {
  id: string;
  title: string;
  amount: number;
  date: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  note?: string;
}

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatTooltipModule
  ],
  template: `
    <div class="expenses-container">
      <div class="header">
        <h1>Expenses</h1>
        <button mat-raised-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon>
          Add Expense
        </button>
      </div>

      <mat-card class="filters-card">
        <form [formGroup]="filtersForm" class="filters-form">
          <mat-form-field appearance="outline">
            <mat-label>Month</mat-label>
            <mat-select formControlName="month">
              <mat-option value="">All</mat-option>
              <mat-option *ngFor="let month of availableMonths" [value]="month.value">
                {{ month.label }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select formControlName="categoryId">
              <mat-option value="">All</mat-option>
              <mat-option *ngFor="let category of categories" [value]="category.id">
                <span class="category-dot" [style.background-color]="category.color"></span>
                {{ category.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search</mat-label>
            <input matInput formControlName="searchText" placeholder="Search title or note">
            <mat-icon matIconPrefix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Min Amount</mat-label>
            <input matInput type="number" formControlName="minAmount">
            <span matTextPrefix>MKD&nbsp;</span>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Max Amount</mat-label>
            <input matInput type="number" formControlName="maxAmount">
            <span matTextPrefix>MKD&nbsp;</span>
          </mat-form-field>
        </form>
      </mat-card>

      <mat-card class="table-card">
        <div *ngIf="dataSource.data.length === 0" class="empty-state">
          <mat-icon>receipt_long</mat-icon>
          <p>No expenses found</p>
          <button mat-raised-button color="primary" (click)="openAddDialog()">Add Your First Expense</button>
        </div>

        <table mat-table [dataSource]="dataSource" matSort class="expenses-table" *ngIf="dataSource.data.length > 0">
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
            <td mat-cell *matCellDef="let expense">{{ formatDate(expense.date) }}</td>
          </ng-container>

          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
            <td mat-cell *matCellDef="let expense">
              <div class="title-cell">
                <span class="title">{{ expense.title }}</span>
                <span *ngIf="expense.note" class="note">{{ expense.note }}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
            <td mat-cell *matCellDef="let expense">
              <div class="category-cell">
                <span class="category-dot" [style.background-color]="expense.categoryColor"></span>
                {{ expense.categoryName }}
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Amount</th>
            <td mat-cell *matCellDef="let expense" class="amount-cell">
              {{ expense.amount | number:'1.2-2' }} MKD
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let expense">
              <button mat-icon-button color="primary" (click)="openEditDialog(expense)" matTooltip="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteExpense(expense)" matTooltip="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-card>
    </div>
  `,
  styles: [`
    .expenses-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 400;
    }

    .filters-card {
      margin-bottom: 24px;
      padding: 16px;
    }

    .filters-form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .search-field {
      grid-column: span 2;
    }

    .table-card {
      padding: 0;
      overflow-x: auto;
    }

    .expenses-table {
      width: 100%;
    }

    .title-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .title {
      font-weight: 500;
    }

    .note {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .category-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .category-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      display: inline-block;
    }

    .amount-cell {
      font-weight: 500;
      color: #2196f3;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: rgba(0, 0, 0, 0.6);

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: rgba(0, 0, 0, 0.3);
        margin-bottom: 16px;
      }

      p {
        margin: 16px 0 24px;
        font-size: 1.125rem;
      }
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .filters-form {
        grid-template-columns: 1fr;
      }

      .search-field {
        grid-column: span 1;
      }

      .expenses-table {
        font-size: 0.875rem;
      }
    }
  `]
})
export class ExpensesComponent implements OnInit {
  displayedColumns: string[] = ['date', 'title', 'category', 'amount', 'actions'];
  dataSource = new MatTableDataSource<ExpenseRow>([]);
  categories: Category[] = [];
  availableMonths: Array<{ label: string; value: string }> = [];
  filtersForm: FormGroup;

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    this.filtersForm = this.fb.group({
      month: [currentMonth],
      categoryId: [''],
      searchText: [''],
      minAmount: [''],
      maxAmount: ['']
    });

    this.setupFilters();
  }

  ngOnInit(): void {
    this.generateAvailableMonths();
    this.categoryService.getAll().pipe(takeUntilDestroyed()).subscribe(categories => {
      this.categories = categories;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  private setupFilters(): void {
    combineLatest([
      this.expenseService.getAll(),
      this.categoryService.getAll(),
      this.filtersForm.valueChanges.pipe(startWith(this.filtersForm.value))
    ]).pipe(
      takeUntilDestroyed(),
      map(([expenses, categories, filters]) => {
        const filtered = this.expenseService.query({
          month: filters.month || undefined,
          categoryId: filters.categoryId || undefined,
          searchText: filters.searchText || undefined,
          minAmount: filters.minAmount ? Number(filters.minAmount) : undefined,
          maxAmount: filters.maxAmount ? Number(filters.maxAmount) : undefined
        });

        return filtered
          .map(expense => {
            const category = categories.find(c => c.id === expense.categoryId);
            return {
              ...expense,
              categoryName: category?.name || 'Unknown',
              categoryColor: category?.color || '#9E9E9E'
            };
          })
          .sort((a, b) => b.date.localeCompare(a.date));
      })
    ).subscribe(data => {
      this.dataSource.data = data;
    });
  }

  private generateAvailableMonths(): void {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      months.push({ label, value });
    }
    this.availableMonths = months;
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(ExpenseFormDialogComponent, {
      width: '500px',
      data: { categories$: this.categoryService.getAll() }
    });

    dialogRef.afterClosed().subscribe((expense: Expense) => {
      if (expense) {
        expense.id = this.expenseService.generateId();
        this.expenseService.add(expense);
        this.snackBar.open('Expense added successfully', 'Close', { duration: 3000 });
      }
    });
  }

  openEditDialog(expenseRow: ExpenseRow): void {
    const expense: Expense = {
      id: expenseRow.id,
      title: expenseRow.title,
      amount: expenseRow.amount,
      date: expenseRow.date,
      categoryId: expenseRow.categoryId,
      note: expenseRow.note
    };

    const dialogRef = this.dialog.open(ExpenseFormDialogComponent, {
      width: '500px',
      data: { expense, categories$: this.categoryService.getAll() }
    });

    dialogRef.afterClosed().subscribe((updatedExpense: Expense) => {
      if (updatedExpense) {
        this.expenseService.update(updatedExpense);
        this.snackBar.open('Expense updated successfully', 'Close', { duration: 3000 });
      }
    });
  }

  deleteExpense(expense: ExpenseRow): void {
    if (confirm(`Are you sure you want to delete "${expense.title}"?`)) {
      this.expenseService.remove(expense.id);
      this.snackBar.open('Expense deleted successfully', 'Close', { duration: 3000 });
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
