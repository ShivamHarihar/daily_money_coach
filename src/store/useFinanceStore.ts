import { create } from 'zustand';
import {
  addExpenseDB,
  addSavingsGoalDB,
  deleteExpenseDB,
  deleteSavingsGoalDB,
  getCategoriesDB,
  getExpensesDB,
  getSavingsGoalsDB,
  getUserProfileDB,
  saveUserProfileDB,
  updateSavingsGoalProgressDB,
} from '../database/db';
import { Category, DailySpendingSummary, Expense, SavingsGoal, UserProfile } from '../types';
import { calculateDailySafeSpend } from '../utils/calculator';

interface FinanceState {
  userProfile: UserProfile | null;
  expenses: Expense[];
  categories: Category[];
  savingsGoals: SavingsGoal[];
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  loadInitialData: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile>;
  addExpense: (expense: Omit<Expense, 'id' | 'created_at'>) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'created_at'>) => Promise<SavingsGoal>;
  updateGoalProgress: (id: string, amount: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  // Computed getters
  getSummary: () => DailySpendingSummary;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  userProfile: null,
  expenses: [],
  categories: [],
  savingsGoals: [],
  isLoading: true,
  isInitialized: false,

  loadInitialData: async () => {
    try {
      set({ isLoading: true });
      const profile = await getUserProfileDB();
      const expenses = await getExpensesDB();
      const categories = await getCategoriesDB();
      const goals = await getSavingsGoalsDB();

      set({
        userProfile: profile,
        expenses,
        categories,
        savingsGoals: goals,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.error('Error loading initial finance data:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    const updated = await saveUserProfileDB(data);
    set({ userProfile: updated });
    return updated;
  },

  addExpense: async (expenseData) => {
    const newExpense = await addExpenseDB(expenseData);
    const updatedExpenses = await getExpensesDB();
    set({ expenses: updatedExpenses });
    return newExpense;
  },

  deleteExpense: async (id: string) => {
    await deleteExpenseDB(id);
    const updatedExpenses = await getExpensesDB();
    set({ expenses: updatedExpenses });
  },

  addSavingsGoal: async (goalData) => {
    const newGoal = await addSavingsGoalDB(goalData);
    const updatedGoals = await getSavingsGoalsDB();
    set({ savingsGoals: updatedGoals });
    return newGoal;
  },

  updateGoalProgress: async (id: string, amount: number) => {
    await updateSavingsGoalProgressDB(id, amount);
    const updatedGoals = await getSavingsGoalsDB();
    set({ savingsGoals: updatedGoals });
  },

  deleteGoal: async (id: string) => {
    await deleteSavingsGoalDB(id);
    const updatedGoals = await getSavingsGoalsDB();
    set({ savingsGoals: updatedGoals });
  },

  getSummary: () => {
    const state = get();
    const income = state.userProfile?.monthly_income || 0;
    const fixed = state.userProfile?.fixed_expenses || 0;
    const target = state.userProfile?.savings_target || 0;

    return calculateDailySafeSpend({
      monthlyIncome: income,
      fixedExpenses: fixed,
      savingsTarget: target,
      monthlyExpenses: state.expenses,
    });
  },
}));
