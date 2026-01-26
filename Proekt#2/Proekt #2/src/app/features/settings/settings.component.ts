import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable } from 'rxjs';
import { CategoryService } from '../../core/services/category.service';
import { ExpenseService } from '../../core/services/expense.service';
import { Category } from '../../core/models/category.model';
import { CategoryFormDialogComponent } from './category-form-dialog.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="settings-container">
      <h1>Settings</h1>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Categories Management</mat-card-title>
          <button mat-raised-button color="primary" (click)="openAddDialog()">
            <mat-icon>add</mat-icon>
            Add Category
          </button>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="(categories$ | async)?.length === 0" class="empty-state">
            <mat-icon>category</mat-icon>
            <p>No categories yet</p>
          </div>

          <mat-list *ngIf="(categories$ | async) as categories">
            <mat-list-item *ngFor="let category of categories" class="category-item">
              <span matListItemIcon class="category-dot" [style.background-color]="category.color"></span>
              <div matListItemTitle class="category-title">
                <mat-icon class="category-icon">{{ category.icon }}</mat-icon>
                <span class="category-name">{{ category.name }}</span>
              </div>
              <div matListItemLine class="category-budget">
                <span *ngIf="category.monthlyBudget">
                  Budget: {{ category.monthlyBudget | number:'1.2-2' }} MKD/month
                </span>
                <span *ngIf="!category.monthlyBudget" class="no-budget">
                  No budget set
                </span>
              </div>
              <div matListItemMeta class="category-actions">
                <button mat-icon-button color="primary" (click)="openEditDialog(category)" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button 
                  mat-icon-button 
                  color="warn" 
                  (click)="deleteCategory(category)" 
                  [disabled]="category.id === uncategorizedId"
                  [matTooltip]="category.id === uncategorizedId ? 'Cannot delete Uncategorized' : 'Delete'">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>

      <mat-card class="info-card">
        <mat-card-header>
          <mat-card-title>About SpendSmart</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Data Storage:</strong> Local Storage (Browser)</p>
          <p class="info-text">
            SpendSmart helps you track your expenses, manage budgets, and gain insights into your spending habits.
            All data is stored locally in your browser.
          </p>
          <div class="info-warning">
            <mat-icon>warning</mat-icon>
            <span>Clearing browser data will delete all your expenses and categories.</span>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 1000px;
      margin: 0 auto;
    }

    h1 {
      margin: 0 0 24px 0;
      font-size: 2rem;
      font-weight: 400;
    }

    mat-card {
      margin-bottom: 24px;

      mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        mat-card-title {
          margin: 0;
          font-size: 1.25rem;
        }
      }
    }

    .category-item {
      padding: 16px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);

      &:last-child {
        border-bottom: none;
      }
    }

    .category-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .category-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .category-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .category-name {
      font-size: 1rem;
    }

    .category-budget {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
      margin-top: 4px;

      .no-budget {
        font-style: italic;
      }
    }

    .category-actions {
      display: flex;
      gap: 8px;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: rgba(0, 0, 0, 0.6);

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: rgba(0, 0, 0, 0.3);
        margin-bottom: 8px;
      }

      p {
        margin: 8px 0;
      }
    }

    .info-card {
      mat-card-content {
        p {
          margin: 8px 0;

          strong {
            font-weight: 500;
          }
        }

        .info-text {
          margin-top: 16px;
          color: rgba(0, 0, 0, 0.7);
          line-height: 1.5;
        }

        .info-warning {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background-color: #fff3e0;
          border-radius: 8px;
          margin-top: 16px;

          mat-icon {
            color: #ff9800;
            flex-shrink: 0;
          }

          span {
            font-size: 0.875rem;
            color: rgba(0, 0, 0, 0.7);
          }
        }
      }
    }

    @media (max-width: 768px) {
      mat-card mat-card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .category-item {
        height: auto;
        min-height: 72px;
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  categories$!: Observable<Category[]>;
  uncategorizedId: string;

  constructor(
    private categoryService: CategoryService,
    private expenseService: ExpenseService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.uncategorizedId = this.categoryService.getUncategorizedId();
  }

  ngOnInit(): void {
    this.categories$ = this.categoryService.getAll();
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(CategoryFormDialogComponent, {
      width: '500px',
      data: {}
    });

    dialogRef.afterClosed().subscribe((category: Category) => {
      if (category) {
        category.id = this.generateId();
        this.categoryService.add(category);
        this.snackBar.open('Category added successfully', 'Close', { duration: 3000 });
      }
    });
  }

  openEditDialog(category: Category): void {
    const dialogRef = this.dialog.open(CategoryFormDialogComponent, {
      width: '500px',
      data: { category }
    });

    dialogRef.afterClosed().subscribe((updatedCategory: Category) => {
      if (updatedCategory) {
        this.categoryService.update(updatedCategory);
        this.snackBar.open('Category updated successfully', 'Close', { duration: 3000 });
      }
    });
  }

  deleteCategory(category: Category): void {
    if (category.id === this.uncategorizedId) {
      this.snackBar.open('Cannot delete Uncategorized category', 'Close', { duration: 3000 });
      return;
    }

    const message = `Are you sure you want to delete "${category.name}"? All expenses in this category will be moved to Uncategorized.`;
    
    if (confirm(message)) {
      this.expenseService.updateCategoryForExpenses(category.id, this.uncategorizedId);
      this.categoryService.remove(category.id);
      this.snackBar.open('Category deleted successfully', 'Close', { duration: 3000 });
    }
  }

  private generateId(): string {
    return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
