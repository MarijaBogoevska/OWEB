import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Category } from '../models/category.model';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'spendsmart_categories';
const UNCATEGORIZED_ID = 'uncategorized';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categoriesSubject: BehaviorSubject<Category[]>;
  public categories$: Observable<Category[]>;

  constructor(private storage: StorageService) {
    const initialCategories = this.storage.get<Category[]>(STORAGE_KEY, this.getDefaultCategories());
    this.ensureUncategorized(initialCategories);
    this.categoriesSubject = new BehaviorSubject<Category[]>(initialCategories);
    this.categories$ = this.categoriesSubject.asObservable();
  }

  private getDefaultCategories(): Category[] {
    return [
      { id: UNCATEGORIZED_ID, name: 'Uncategorized', icon: 'help_outline', color: '#9E9E9E' },
      { id: this.generateId(), name: 'Groceries', icon: 'shopping_cart', color: '#4CAF50', monthlyBudget: 500 },
      { id: this.generateId(), name: 'Eating Out', icon: 'restaurant', color: '#FF9800', monthlyBudget: 300 },
      { id: this.generateId(), name: 'Transport', icon: 'directions_car', color: '#2196F3', monthlyBudget: 200 },
      { id: this.generateId(), name: 'Bills', icon: 'receipt', color: '#F44336', monthlyBudget: 800 },
      { id: this.generateId(), name: 'Fun', icon: 'sports_esports', color: '#9C27B0', monthlyBudget: 150 }
    ];
  }

  private ensureUncategorized(categories: Category[]): void {
    const hasUncategorized = categories.some(c => c.id === UNCATEGORIZED_ID);
    if (!hasUncategorized) {
      categories.unshift({ id: UNCATEGORIZED_ID, name: 'Uncategorized', icon: 'help_outline', color: '#9E9E9E' });
    }
  }

  getAll(): Observable<Category[]> {
    return this.categories$;
  }

  getById(categoryId: string): Category | undefined {
    return this.categoriesSubject.value.find(c => c.id === categoryId);
  }

  add(category: Category): void {
    const categories = [...this.categoriesSubject.value, category];
    this.save(categories);
  }

  update(category: Category): void {
    const categories = this.categoriesSubject.value.map(c => c.id === category.id ? category : c);
    this.save(categories);
  }

  remove(categoryId: string): void {
    if (categoryId === UNCATEGORIZED_ID) {
      return;
    }
    const categories = this.categoriesSubject.value.filter(c => c.id !== categoryId);
    this.save(categories);
  }

  getUncategorizedId(): string {
    return UNCATEGORIZED_ID;
  }

  private save(categories: Category[]): void {
    this.storage.set(STORAGE_KEY, categories);
    this.categoriesSubject.next(categories);
  }

  private generateId(): string {
    return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
