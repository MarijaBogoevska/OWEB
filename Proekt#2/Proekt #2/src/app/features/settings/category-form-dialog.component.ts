import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Category } from '../../core/models/category.model';

const MATERIAL_ICONS = [
  'shopping_cart', 'restaurant', 'directions_car', 'receipt', 'sports_esports',
  'local_hospital', 'school', 'home', 'flight', 'local_grocery_store',
  'fastfood', 'local_cafe', 'movie', 'fitness_center', 'pets',
  'shopping_bag', 'local_gas_station', 'local_taxi', 'train', 'phone',
  'wifi', 'computer', 'watch', 'card_giftcard', 'celebration',
  'help_outline', 'category', 'account_balance', 'savings', 'credit_card'
];

@Component({
  selector: 'app-category-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.category ? 'Edit Category' : 'Add Category' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="categoryForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Enter category name">
          <mat-error *ngIf="categoryForm.get('name')?.hasError('required')">Name is required</mat-error>
          <mat-error *ngIf="categoryForm.get('name')?.hasError('minlength')">Name must be at least 2 characters</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Icon</mat-label>
          <mat-select formControlName="icon">
            <mat-option *ngFor="let icon of icons" [value]="icon">
              <mat-icon>{{ icon }}</mat-icon>
              {{ icon }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="categoryForm.get('icon')?.hasError('required')">Icon is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Color</mat-label>
          <input matInput type="color" formControlName="color">
          <mat-error *ngIf="categoryForm.get('color')?.hasError('required')">Color is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Monthly Budget (Optional)</mat-label>
          <input matInput type="number" formControlName="monthlyBudget" placeholder="0.00">
          <span matTextPrefix>MKD&nbsp;</span>
          <mat-error *ngIf="categoryForm.get('monthlyBudget')?.hasError('min')">Budget must be greater than 0</mat-error>
        </mat-form-field>

        <div class="preview">
          <span class="preview-label">Preview:</span>
          <span class="category-preview">
            <span class="category-dot" [style.background-color]="categoryForm.get('color')?.value"></span>
            <mat-icon>{{ categoryForm.get('icon')?.value }}</mat-icon>
            {{ categoryForm.get('name')?.value || 'Category Name' }}
          </span>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="!categoryForm.valid" (click)="onSave()">
        {{ data.category ? 'Update' : 'Add' }}
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

    .preview {
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .preview-label {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
    }

    .category-preview {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1rem;
    }

    .category-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: inline-block;
    }

    mat-icon {
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
export class CategoryFormDialogComponent {
  categoryForm: FormGroup;
  icons = MATERIAL_ICONS;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CategoryFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { category?: Category }
  ) {
    const category = data.category;

    this.categoryForm = this.fb.group({
      name: [category?.name || '', [Validators.required, Validators.minLength(2)]],
      icon: [category?.icon || 'category', Validators.required],
      color: [category?.color || '#9C27B0', Validators.required],
      monthlyBudget: [category?.monthlyBudget || '', [Validators.min(0.01)]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.categoryForm.valid) {
      const formValue = this.categoryForm.value;
      const category: Category = {
        id: this.data.category?.id || '',
        name: formValue.name,
        icon: formValue.icon,
        color: formValue.color,
        monthlyBudget: formValue.monthlyBudget ? Number(formValue.monthlyBudget) : undefined
      };

      this.dialogRef.close(category);
    }
  }
}
