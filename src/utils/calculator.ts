import { AffordabilityAnalysis, DailySpendingSummary, Expense } from '../types';

/**
 * Get total number of days in a specific month and year
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Format currency string in Indian Rupees (₹) by default
 */
export function formatCurrency(amount: number, symbol: string = '₹'): string {
  const formatted = Math.round(amount).toLocaleString('en-IN');
  return `${symbol}${formatted}`;
}

/**
 * Helper to check if a date string (YYYY-MM-DD) matches today's date
 */
export function isToday(dateString: string): boolean {
  const todayStr = new Date().toISOString().split('T')[0];
  return dateString === todayStr;
}

/**
 * Core Algorithm: Calculate Daily Safe Spending
 */
export function calculateDailySafeSpend(params: {
  monthlyIncome: number;
  fixedExpenses: number;
  savingsTarget: number;
  monthlyExpenses: Expense[];
  currentDate?: Date;
}): DailySpendingSummary {
  const now = params.currentDate || new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentDayOfMonth = now.getDate();
  const totalDaysInMonth = getDaysInMonth(currentYear, currentMonth);

  // Total days remaining in the month including today
  const daysRemainingInMonth = Math.max(1, totalDaysInMonth - currentDayOfMonth + 1);

  // 1. Total discretionary budget for the entire month
  const discretionaryMonthlyBudget = Math.max(
    0,
    params.monthlyIncome - params.fixedExpenses - params.savingsTarget
  );

  // 2. Sum up all variable expenses logged this month
  const todayDateStr = now.toISOString().split('T')[0];
  let totalSpentThisMonth = 0;
  let spentToday = 0;

  for (const exp of params.monthlyExpenses) {
    const expDate = new Date(exp.date);
    // Ensure expense is in the current month & year
    if (expDate.getFullYear() === currentYear && expDate.getMonth() + 1 === currentMonth) {
      totalSpentThisMonth += exp.amount;
      if (exp.date === todayDateStr) {
        spentToday += exp.amount;
      }
    }
  }

  // 3. Remaining discretionary budget for the rest of the month (excluding today's spending in calculation of daily limit)
  // To avoid double-counting today's spend when dividing across remaining days:
  const spentBeforeToday = totalSpentThisMonth - spentToday;
  const discretionaryForRestOfMonth = Math.max(0, discretionaryMonthlyBudget - spentBeforeToday);

  // 4. Safe daily spending limit starting from today
  const rawDailyLimit = discretionaryForRestOfMonth / daysRemainingInMonth;
  // Round to nearest 10 for clean display (e.g., 653 -> 650, or 666 -> 660)
  const safeDailyLimit = Math.max(0, Math.round(rawDailyLimit / 10) * 10 || Math.round(rawDailyLimit));

  // 5. Remaining for today specifically
  const remainingToday = safeDailyLimit - spentToday;

  // 6. Savings Progress Calculation
  // Total available money left in month = Income - Fixed Expenses - Total Variable Spent
  const netRemainingMonth = params.monthlyIncome - params.fixedExpenses - totalSpentThisMonth;
  const savingsProgressPercent = params.savingsTarget > 0
    ? Math.min(100, Math.max(0, Math.round((netRemainingMonth / params.savingsTarget) * 100)))
    : 100;

  return {
    safeDailyLimit,
    spentToday,
    remainingToday,
    totalMonthlyIncome: params.monthlyIncome,
    totalFixedExpenses: params.fixedExpenses,
    savingsTarget: params.savingsTarget,
    discretionaryMonthlyBudget,
    totalSpentThisMonth,
    remainingMonthlyDiscretionary: Math.max(0, discretionaryMonthlyBudget - totalSpentThisMonth),
    savingsProgressPercent,
    daysRemainingInMonth,
    currentDayOfMonth,
    totalDaysInMonth,
  };
}

/**
 * Feature Algorithm: "Can I Afford This?"
 */
export function calculateAffordability(params: {
  purchaseAmount: number;
  currentSummary: DailySpendingSummary;
}): AffordabilityAnalysis {
  const { purchaseAmount, currentSummary } = params;
  const { remainingMonthlyDiscretionary, safeDailyLimit, daysRemainingInMonth, remainingToday } = currentSummary;

  // Scenario 1: Fits comfortably in today's remaining safe daily spend
  if (purchaseAmount <= remainingToday) {
    return {
      canAfford: true,
      severity: 'safe',
      title: 'Fits in Today\'s Budget! ✅',
      description: `You have ${formatCurrency(remainingToday)} safe to spend today. This purchase fits without affecting your future daily limit.`,
      impactOnDailyLimit: 0,
      newDailyLimit: safeDailyLimit,
      monthlyDiscretionaryRemaining: remainingMonthlyDiscretionary - purchaseAmount,
      savingsImpactPercent: 0,
    };
  }

  // Scenario 2: Exceeds total remaining discretionary budget for the month
  if (purchaseAmount > remainingMonthlyDiscretionary) {
    const deficit = purchaseAmount - remainingMonthlyDiscretionary;
    return {
      canAfford: false,
      severity: 'warning',
      title: 'Not Recommended ⚠️',
      description: `This purchase exceeds your remaining monthly discretionary budget by ${formatCurrency(deficit)} and will eat into your savings goal!`,
      impactOnDailyLimit: safeDailyLimit,
      newDailyLimit: 0,
      monthlyDiscretionaryRemaining: 0,
      savingsImpactPercent: Math.round((deficit / (currentSummary.savingsTarget || 1)) * 100),
    };
  }

  // Scenario 3: Exceeds today's budget, but fits inside monthly discretionary
  const newDiscretionaryRemaining = remainingMonthlyDiscretionary - purchaseAmount;
  const newDailyLimitRaw = newDiscretionaryRemaining / daysRemainingInMonth;
  const newDailyLimit = Math.max(0, Math.round(newDailyLimitRaw / 10) * 10);
  const dailyReduction = Math.max(0, safeDailyLimit - newDailyLimit);

  return {
    canAfford: true,
    severity: 'caution',
    title: 'Yes, but proceed with caution ⚠️',
    description: `You can afford this, but it will reduce your safe daily spending from ${formatCurrency(safeDailyLimit)} to ${formatCurrency(newDailyLimit)} for the next ${daysRemainingInMonth} days.`,
    impactOnDailyLimit: dailyReduction,
    newDailyLimit,
    monthlyDiscretionaryRemaining: newDiscretionaryRemaining,
    savingsImpactPercent: 0,
  };
}
