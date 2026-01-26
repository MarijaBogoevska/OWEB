export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  categoryId: string;
  note?: string;
}
