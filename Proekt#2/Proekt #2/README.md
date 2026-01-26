# SpendSmart - Angular Expense Tracker

A modern expense tracking web application built with Angular 18+ featuring standalone components, reactive forms, and Angular Material.

## Features

- 📊 **Dashboard**: View spending summaries, budget usage, and recent expenses
- 💰 **Expense Management**: Full CRUD operations with advanced filtering and sorting
- ⚙️ **Settings**: Manage categories and monthly budgets
- 💾 **Local Storage**: All data persists in browser localStorage
- 📱 **Responsive Design**: Works seamlessly on mobile and desktop
- 🎨 **Material Design**: Clean, modern UI using Angular Material

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install Angular Material (if not already installed):
```bash
ng add @angular/material
```

When prompted:
- Choose a prebuilt theme (e.g., "Indigo/Pink")
- Set up global Angular Material typography styles: Yes
- Include Angular animations: Yes

## Running the Application

Start the development server:

```bash
npm start
```

or

```bash
ng serve
```

Navigate to `http://localhost:4200/` in your browser.

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/
│   │   │   ├── category.model.ts
│   │   │   └── expense.model.ts
│   │   └── services/
│   │       ├── analytics.service.ts
│   │       ├── category.service.ts
│   │       ├── expense.service.ts
│   │       └── storage.service.ts
│   ├── features/
│   │   ├── dashboard/
│   │   │   └── dashboard.component.ts
│   │   ├── expenses/
│   │   │   ├── expense-form-dialog.component.ts
│   │   │   └── expenses.component.ts
│   │   └── settings/
│   │       ├── category-form-dialog.component.ts
│   │       └── settings.component.ts
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── index.html
├── main.ts
└── styles.css
```

## Key Technologies

- **Angular 18+**: Latest Angular with standalone components
- **Angular Material**: UI component library
- **RxJS**: Reactive programming
- **TypeScript**: Type-safe development
- **Local Storage API**: Client-side data persistence

## Usage

### Dashboard
- View monthly spending summaries
- Track budget usage by category
- Compare spending to previous months
- See recent expenses

### Expenses Page
- Add, edit, and delete expenses
- Filter by month, category, amount range
- Search expenses by title or note
- Sort by date, title, category, or amount

### Settings Page
- Create and manage expense categories
- Set monthly budgets for categories
- Customize category icons and colors
- Delete categories (expenses moved to "Uncategorized")

## Data Storage

All data is stored in browser localStorage with the following keys:
- `spendsmart_categories`: Category data
- `spendsmart_expenses`: Expense data

**Warning**: Clearing browser data will delete all expenses and categories.

## Building for Production

```bash
npm run build
```

Build artifacts will be stored in the `dist/` directory.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
