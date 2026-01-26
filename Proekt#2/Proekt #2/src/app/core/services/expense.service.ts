import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Expense } from '../models/expense.model';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'spendsmart_expenses';

export interface ExpenseFilters {
  month?: string;
  categoryId?: string;
  searchText?: string;
  minAmount?: number;
  maxAmount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private expensesSubject: BehaviorSubject<Expense[]>;
  public expenses$: Observable<Expense[]>;

  constructor(private storage: StorageService) {
    const initialExpenses = this.storage.get<Expense[]>(STORAGE_KEY, this.getDefaultExpenses());
    this.expensesSubject = new BehaviorSubject<Expense[]>(initialExpenses);
    this.expenses$ = this.expensesSubject.asObservable();
  }

  private getDefaultExpenses(): Expense[] {
    const now = new Date();
    const currentMonth = now.toISOString().substring(0, 7);
    return [
      {
        id: this.generateId(),
        title: 'Weekly groceries',
        amount: 75.50,
        date: `${currentMonth}-${String(now.getDate()).padStart(2, '0')}`,
        categoryId: 'groceries',
        note: 'Fresh produce and basics'
      },
      {
        id: this.generateId(),
        title: 'Coffee with friends',
        amount: 12.00,
        date: `${currentMonth}-${String(now.getDate() - 1).padStart(2, '0')}`,
        categoryId: 'eating_out'
      },
      {
        id: this.generateId(),
        title: 'Gas station',
        amount: 45.00,
        date: `${currentMonth}-${String(now.getDate() - 2).padStart(2, '0')}`,
        categoryId: 'transport'
      }
    ];
  }

  getAll(): Observable<Expense[]> {
    return this.expenses$;
  }

  getById(expenseId: string): Expense | undefined {
    return this.expensesSubject.value.find(e => e.id === expenseId);
  }

  add(expense: Expense): void {
    const expenses = [...this.expensesSubject.value, expense];
    this.save(expenses);
  }

  update(expense: Expense): void {
    const expenses = this.expensesSubject.value.map(e => e.id === expense.id ? expense : e);
    this.save(expenses);
  }

  remove(expenseId: string): void {
    const expenses = this.expensesSubject.value.filter(e => e.id !== expenseId);
    this.save(expenses);
  }

  query(filters: ExpenseFilters): Expense[] {
    let expenses = [...this.expensesSubject.value];

    if (filters.month) {
      expenses = expenses.filter(e => e.date.startsWith(filters.month!));
    }

    if (filters.categoryId) {
      expenses = expenses.filter(e => e.categoryId === filters.categoryId);
    }

    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      expenses = expenses.filter(e => 
        e.title.toLowerCase().includes(search) || 
        (e.note && e.note.toLowerCase().includes(search))
      );
    }

    if (filters.minAmount !== undefined) {
      expenses = expenses.filter(e => e.amount >= filters.minAmount!);
    }

    if (filters.maxAmount !== undefined) {
      expenses = expenses.filter(e => e.amount <= filters.maxAmount!);
    }

    return expenses;
  }

  updateCategoryForExpenses(oldCategoryId: string, newCategoryId: string): void {
    const expenses = this.expensesSubject.value.map(e => 
      e.categoryId === oldCategoryId ? { ...e, categoryId: newCategoryId } : e
    );
    this.save(expenses);
  }

  generateId(): string {
    return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private save(expenses: Expense[]): void {
    this.storage.set(STORAGE_KEY, expenses);
    this.expensesSubject.next(expenses);
  }
}
