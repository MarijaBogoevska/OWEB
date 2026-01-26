import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import { Category } from '../../core/models/category.model';
import { Expense } from '../../core/models/expense.model';

@Component({
  selector: 'app-expense-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.expense ? 'Edit Expense' : 'Add Expense' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="expenseForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" placeholder="Enter expense title">
          <mat-error *ngIf="expenseForm.get('title')?.hasError('required')">Title is required</mat-error>
          <mat-error *ngIf="expenseForm.get('title')?.hasError('minlength')">Title must be at least 2 characters</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Amount</mat-label>
          <input matInput type="number" formControlName="amount" placeholder="0.00">
          <span matTextPrefix>MKD&nbsp;</span>
          <mat-error *ngIf="expenseForm.get('amount')?.hasError('required')">Amount is required</mat-error>
          <mat-error *ngIf="expenseForm.get('amount')?.hasError('min')">Amount must be greater than 0</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="date" placeholder="Select date">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error *ngIf="expenseForm.get('date')?.hasError('required')">Date is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Category</mat-label>
          <mat-select formControlName="categoryId">
            <mat-option *ngFor="let category of (categories$ | async)" [value]="category.id">
              <span class="category-dot" [style.background-color]="category.color"></span>
              {{ category.name }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="expenseForm.get('categoryId')?.hasError('required')">Category is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Note (Optional)</mat-label>
          <textarea matInput formControlName="note" rows="3" placeholder="Add a note"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="!expenseForm.valid" (click)="onSave()">
        {{ data.expense ? 'Update' : 'Add' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 400px;
      padding-top: 20px;
    }

    .full-width {
      width: 100%;
      display: block;
      margin-bottom: 16px;
    }

    .category-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      display: inline-block;
      margin-right: 8px;
      vertical-align: middle;
    }

    @media (max-width: 600px) {
      mat-dialog-content {
        min-width: unset;
        width: 90vw;
      }
    }
  `]
})
export class ExpenseFormDialogComponent {
  expenseForm: FormGroup;
  categories$: Observable<Category[]>;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ExpenseFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { expense?: Expense; categories$: Observable<Category[]> }
  ) {
    this.categories$ = data.categories$;

    const expense = data.expense;
    const dateValue = expense?.date ? new Date(expense.date + 'T00:00:00') : new Date();

    this.expenseForm = this.fb.group({
      title: [expense?.title || '', [Validators.required, Validators.minLength(2)]],
      amount: [expense?.amount || '', [Validators.required, Validators.min(0.01)]],
      date: [dateValue, Validators.required],
      categoryId: [expense?.categoryId || '', Validators.required],
      note: [expense?.note || '']
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.expenseForm.valid) {
      const formValue = this.expenseForm.value;
      const date = formValue.date as Date;
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      const expense: Expense = {
        id: this.data.expense?.id || '',
        title: formValue.title,
        amount: Number(formValue.amount),
        date: dateStr,
        categoryId: formValue.categoryId,
        note: formValue.note || undefined
      };

      this.dialogRef.close(expense);
    }
  }
}
