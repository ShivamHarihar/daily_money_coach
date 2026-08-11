import { Redirect, useRouter } from 'expo-router';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  HelpCircle,
  PiggyBank,
  Plus,
  Sparkles,
  Trash2,
  TrendingUp,
} from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Shadows, Spacing } from '../../src/constants/theme';
import { useFinanceStore } from '../../src/store/useFinanceStore';
import { Expense } from '../../src/types';
import { formatCurrency, isToday } from '../../src/utils/calculator';

export default function DashboardScreen() {
  const router = useRouter();
  const { userProfile, expenses, getSummary, deleteExpense, loadInitialData, isLoading } =
    useFinanceStore();

  if (userProfile && !userProfile.onboarding_completed) {
    return <Redirect href="/(onboarding)" />;
  }

  const summary = getSummary();
  const todayExpenses = expenses.filter((e) => isToday(e.date));

  const currentDateFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const handleDeleteExpense = (id: string, categoryName?: string, amount?: number) => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to remove ${categoryName || 'this expense'} (${formatCurrency(
        amount || 0
      )})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(id) },
      ]
    );
  };

  // Calculate percentage of safe daily limit spent
  const todayPercentSpent =
    summary.safeDailyLimit > 0
      ? Math.min(100, Math.round((summary.spentToday / summary.safeDailyLimit) * 100))
      : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadInitialData}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Top Bar Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Daily Money Coach</Text>
            <View style={styles.dateBadge}>
              <Calendar size={13} color={Colors.textMuted} />
              <Text style={styles.dateText}>{currentDateFormatted}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.affordHeaderButton}
            onPress={() => router.push('/can-i-afford')}
          >
            <Sparkles size={16} color={Colors.secondary} />
            <Text style={styles.affordHeaderText}>Can I Afford?</Text>
          </TouchableOpacity>
        </View>

        {/* HERO SAFE SPENDING CARD */}
        <View style={[styles.heroCard, Shadows.glowGreen]}>
          <Text style={styles.heroSubHeader}>SAFE TO SPEND TODAY</Text>
          <Text style={styles.heroAmount}>{formatCurrency(summary.safeDailyLimit)}</Text>

          {/* Today Spending Bar */}
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${todayPercentSpent}%`,
                  backgroundColor:
                    todayPercentSpent > 90 ? Colors.danger : Colors.primary,
                },
              ]}
            />
          </View>

          {/* Today Spent vs Remaining Stats */}
          <View style={styles.todayStatsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: Colors.accent }]} />
              <Text style={styles.statLabel}>Spent Today: </Text>
              <Text style={styles.statValue}>{formatCurrency(summary.spentToday)}</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.statLabel}>Remaining Today: </Text>
              <Text
                style={[
                  styles.statValue,
                  { color: summary.remainingToday < 0 ? Colors.danger : Colors.primary },
                ]}
              >
                {formatCurrency(summary.remainingToday)}
              </Text>
            </View>
          </View>
        </View>

        {/* QUICK ACTION BUTTONS */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.addExpenseButton}
            activeOpacity={0.85}
            onPress={() => router.push('/add-expense')}
          >
            <Plus size={22} color="#0B0F17" />
            <Text style={styles.addExpenseText}>+ Add Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.canIAffordButton}
            activeOpacity={0.85}
            onPress={() => router.push('/can-i-afford')}
          >
            <HelpCircle size={20} color={Colors.textPrimary} />
            <Text style={styles.canIAffordText}>Can I Afford This?</Text>
          </TouchableOpacity>
        </View>

        {/* MONTHLY SUMMARY CARD */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Monthly Plan Pulse</Text>
          <View style={styles.monthlyCard}>
            <View style={styles.monthlyRow}>
              <View style={styles.monthlyItem}>
                <Text style={styles.monthlyLabel}>Monthly Income</Text>
                <Text style={styles.monthlyValue}>
                  {formatCurrency(summary.totalMonthlyIncome)}
                </Text>
              </View>
              <View style={styles.monthlyItem}>
                <Text style={styles.monthlyLabel}>Fixed Expenses</Text>
                <Text style={[styles.monthlyValue, { color: Colors.danger }]}>
                  {formatCurrency(summary.totalFixedExpenses)}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Savings Goal Target Tracker */}
            <View style={styles.savingsTracker}>
              <View style={styles.savingsHeader}>
                <View style={styles.savingsTitleGroup}>
                  <PiggyBank size={18} color={Colors.primary} />
                  <Text style={styles.savingsTitle}>Monthly Savings Goal</Text>
                </View>
                <Text style={styles.savingsAmount}>
                  {formatCurrency(summary.savingsTarget)}
                </Text>
              </View>

              <View style={styles.savingsProgressBarBg}>
                <View
                  style={[
                    styles.savingsProgressBarFill,
                    { width: `${summary.savingsProgressPercent}%` },
                  ]}
                />
              </View>
              <Text style={styles.savingsPercentText}>
                {summary.savingsProgressPercent}% on track to meet monthly target
              </Text>
            </View>
          </View>
        </View>

        {/* TODAY'S EXPENSES LIST */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Today's Transactions</Text>
            <Text style={styles.transactionCount}>{todayExpenses.length} items</Text>
          </View>

          {todayExpenses.length === 0 ? (
            <View style={styles.emptyCard}>
              <TrendingUp size={32} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No expenses logged today</Text>
              <Text style={styles.emptySub}>
                Every expense logged updates your safe spending limit in real-time.
              </Text>
            </View>
          ) : (
            <View style={styles.expenseList}>
              {todayExpenses.map((expense) => (
                <View key={expense.id} style={styles.expenseRow}>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: expense.category_color || Colors.primary },
                    ]}
                  >
                    <Text style={styles.categoryBadgeText}>
                      {expense.category_name?.charAt(0) || 'E'}
                    </Text>
                  </View>
                  <View style={styles.expenseDetails}>
                    <Text style={styles.expenseCategory}>{expense.category_name}</Text>
                    {expense.note ? (
                      <Text style={styles.expenseNote}>{expense.note}</Text>
                    ) : null}
                    <Text style={styles.expenseMethod}>{expense.payment_method}</Text>
                  </View>
                  <View style={styles.expenseAmountGroup}>
                    <Text style={styles.expenseAmount}>
                      -{formatCurrency(expense.amount)}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        handleDeleteExpense(expense.id, expense.category_name, expense.amount)
                      }
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Trash2 size={16} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  affordHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderColor: Colors.cardBorder,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  affordHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  heroCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginVertical: Spacing.md,
    alignItems: 'center',
  },
  heroSubHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  heroAmount: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.surfaceHover,
    borderRadius: 4,
    marginVertical: Spacing.md,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  todayStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: Spacing.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  addExpenseButton: {
    flex: 1,
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  addExpenseText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B0F17',
  },
  canIAffordButton: {
    flex: 1,
    height: 52,
    backgroundColor: Colors.cardBackground,
    borderColor: Colors.cardBorder,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  canIAffordText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionContainer: {
    marginBottom: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  transactionCount: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  monthlyCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginTop: Spacing.sm,
  },
  monthlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthlyItem: {
    flex: 1,
  },
  monthlyLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  monthlyValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: Spacing.md,
  },
  savingsTracker: {
    gap: Spacing.xs,
  },
  savingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savingsTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  savingsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  savingsAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  savingsProgressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.surfaceHover,
    borderRadius: 3,
    marginTop: 4,
    overflow: 'hidden',
  },
  savingsProgressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  savingsPercentText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: 2,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  expenseList: {
    gap: Spacing.sm,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  categoryBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  categoryBadgeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  expenseDetails: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  expenseNote: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  expenseMethod: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  expenseAmountGroup: {
    alignItems: 'flex-end',
    gap: 4,
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.danger,
  },
});
