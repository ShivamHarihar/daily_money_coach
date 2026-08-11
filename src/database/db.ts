import * as SQLite from 'expo-sqlite';
import { DefaultCategories } from '../constants/theme';
import { Budget, Category, Expense, SavingsGoal, UserProfile } from '../types';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('daily_money_coach.db');
    await initDatabase(dbInstance);
  }
  return dbInstance;
}

async function initDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT DEFAULT 'User',
      monthly_income REAL DEFAULT 0,
      fixed_expenses REAL DEFAULT 0,
      savings_target REAL DEFAULT 0,
      currency_symbol TEXT DEFAULT '₹',
      onboarding_completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      type TEXT DEFAULT 'expense',
      is_custom INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      category_id TEXT NOT NULL,
      note TEXT,
      date TEXT NOT NULL,
      time TEXT,
      payment_method TEXT DEFAULT 'UPI',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      amount REAL NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS savings_goals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL DEFAULT 0,
      deadline TEXT,
      icon TEXT DEFAULT 'target',
      color TEXT DEFAULT '#10B981',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default categories if empty
  const categoryCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM categories;'
  );

  if (!categoryCount || categoryCount.count === 0) {
    for (const cat of DefaultCategories) {
      await db.runAsync(
        'INSERT OR REPLACE INTO categories (id, name, icon, color, type, is_custom) VALUES (?, ?, ?, ?, ?, 0);',
        [cat.id, cat.name, cat.icon, cat.color, cat.type]
      );
    }
  }
}

/* ---------------- User Profile Queries ---------------- */
export async function getUserProfileDB(): Promise<UserProfile | null> {
  const db = await getDB();
  const user = await db.getFirstAsync<UserProfile>('SELECT * FROM users ORDER BY id ASC LIMIT 1;');
  if (user) {
    user.onboarding_completed = Boolean(user.onboarding_completed);
  }
  return user || null;
}

export async function saveUserProfileDB(profile: Partial<UserProfile>): Promise<UserProfile> {
  const db = await getDB();
  const existing = await getUserProfileDB();

  if (existing) {
    await db.runAsync(
      `UPDATE users SET 
        name = COALESCE(?, name),
        monthly_income = COALESCE(?, monthly_income),
        fixed_expenses = COALESCE(?, fixed_expenses),
        savings_target = COALESCE(?, savings_target),
        currency_symbol = COALESCE(?, currency_symbol),
        onboarding_completed = COALESCE(?, onboarding_completed)
      WHERE id = ?;`,
      [
        profile.name ?? null,
        profile.monthly_income ?? null,
        profile.fixed_expenses ?? null,
        profile.savings_target ?? null,
        profile.currency_symbol ?? null,
        profile.onboarding_completed !== undefined ? (profile.onboarding_completed ? 1 : 0) : null,
        existing.id,
      ]
    );
  } else {
    await db.runAsync(
      `INSERT INTO users (name, monthly_income, fixed_expenses, savings_target, currency_symbol, onboarding_completed)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        profile.name || 'User',
        profile.monthly_income || 0,
        profile.fixed_expenses || 0,
        profile.savings_target || 0,
        profile.currency_symbol || '₹',
        profile.onboarding_completed ? 1 : 0,
      ]
    );
  }

  const updated = await getUserProfileDB();
  return updated!;
}

/* ---------------- Expense Queries ---------------- */
export async function getExpensesDB(): Promise<Expense[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<any>(`
    SELECT e.*, c.name as category_name, c.icon as category_icon, c.color as category_color 
    FROM expenses e 
    LEFT JOIN categories c ON e.category_id = c.id 
    ORDER BY date DESC, created_at DESC;
  `);
  return rows.map((r) => ({
    id: r.id,
    amount: Number(r.amount),
    category_id: r.category_id,
    category_name: r.category_name || 'Other',
    category_icon: r.category_icon || 'more-horizontal',
    category_color: r.category_color || '#64748B',
    note: r.note || '',
    date: r.date,
    time: r.time || '',
    payment_method: r.payment_method || 'UPI',
    created_at: r.created_at,
  }));
}

export async function addExpenseDB(expense: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> {
  const db = await getDB();
  const id = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const createdAt = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO expenses (id, amount, category_id, note, date, time, payment_method, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      expense.amount,
      expense.category_id,
      expense.note || '',
      expense.date,
      expense.time || '',
      expense.payment_method || 'UPI',
      createdAt,
    ]
  );

  const expenses = await getExpensesDB();
  return expenses.find((e) => e.id === id)!;
}

export async function deleteExpenseDB(id: string): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM expenses WHERE id = ?;', [id]);
}

/* ---------------- Category Queries ---------------- */
export async function getCategoriesDB(): Promise<Category[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<any>('SELECT * FROM categories ORDER BY is_custom ASC, name ASC;');
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    icon: r.icon,
    color: r.color,
    type: r.type,
    is_custom: Boolean(r.is_custom),
  }));
}

/* ---------------- Savings Goals Queries ---------------- */
export async function getSavingsGoalsDB(): Promise<SavingsGoal[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<any>('SELECT * FROM savings_goals ORDER BY created_at DESC;');
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    target_amount: Number(r.target_amount),
    current_amount: Number(r.current_amount),
    deadline: r.deadline,
    icon: r.icon,
    color: r.color,
    created_at: r.created_at,
  }));
}

export async function addSavingsGoalDB(goal: Omit<SavingsGoal, 'id' | 'created_at'>): Promise<SavingsGoal> {
  const db = await getDB();
  const id = `goal_${Date.now()}`;
  const createdAt = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO savings_goals (id, name, target_amount, current_amount, deadline, icon, color, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      goal.name,
      goal.target_amount,
      goal.current_amount || 0,
      goal.deadline || '',
      goal.icon || 'target',
      goal.color || '#10B981',
      createdAt,
    ]
  );

  const goals = await getSavingsGoalsDB();
  return goals.find((g) => g.id === id)!;
}

export async function updateSavingsGoalProgressDB(id: string, newAmount: number): Promise<void> {
  const db = await getDB();
  await db.runAsync('UPDATE savings_goals SET current_amount = ? WHERE id = ?;', [newAmount, id]);
}

export async function deleteSavingsGoalDB(id: string): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM savings_goals WHERE id = ?;', [id]);
}
