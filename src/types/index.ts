export type PaymentMethod = 'UPI' | 'Cash' | 'Card' | 'Bank Transfer' | 'Other';

export interface UserProfile {
  id: number;
  name: string;
  monthly_income: number;
  fixed_expenses: number;
  savings_target: number;
  currency_symbol: string;
  onboarding_completed: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
  is_custom?: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  category_id: string;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  note?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  payment_method: PaymentMethod;
  created_at: string;
}

export interface Budget {
  id: string;
  category_id: string;
  amount: number;
  month: number; // 1 - 12
  year: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  icon?: string;
  color?: string;
  created_at: string;
}

export interface DailySpendingSummary {
  safeDailyLimit: number;
  spentToday: number;
  remainingToday: number;
  totalMonthlyIncome: number;
  totalFixedExpenses: number;
  savingsTarget: number;
  discretionaryMonthlyBudget: number;
  totalSpentThisMonth: number;
  remainingMonthlyDiscretionary: number;
  savingsProgressPercent: number;
  daysRemainingInMonth: number;
  currentDayOfMonth: number;
  totalDaysInMonth: number;
}

export interface AffordabilityAnalysis {
  canAfford: boolean;
  severity: 'safe' | 'caution' | 'warning';
  title: string;
  description: string;
  impactOnDailyLimit: number;
  newDailyLimit: number;
  monthlyDiscretionaryRemaining: number;
  savingsImpactPercent: number;
}
