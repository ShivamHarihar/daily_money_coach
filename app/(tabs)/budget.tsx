import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../src/constants/theme';
import { useFinanceStore } from '../../src/store/useFinanceStore';
import { formatCurrency } from '../../src/utils/calculator';

export default function BudgetScreen() {
  const { expenses, categories, getSummary } = useFinanceStore();
  const summary = getSummary();

  // Group expenses by category for current month
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const categoryTotals: Record<string, number> = {};
  let totalSpentThisMonth = 0;

  for (const exp of expenses) {
    const d = new Date(exp.date);
    if (d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear) {
      categoryTotals[exp.category_id] = (categoryTotals[exp.category_id] || 0) + exp.amount;
      totalSpentThisMonth += exp.amount;
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Category Spending</Text>
          <Text style={styles.subtitle}>
            Track your discretionary spending breakdown for this month.
          </Text>
        </View>

        {/* Monthly Spent Header Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Variable Spent This Month</Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalSpentThisMonth)}</Text>
          <Text style={styles.discretionarySub}>
            Out of {formatCurrency(summary.discretionaryMonthlyBudget)} discretionary plan
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Category Breakdown</Text>

        <View style={styles.categoryList}>
          {categories.map((cat) => {
            const spent = categoryTotals[cat.id] || 0;
            const percentOfTotal =
              totalSpentThisMonth > 0 ? Math.round((spent / totalSpentThisMonth) * 100) : 0;

            return (
              <View key={cat.id} style={styles.categoryCard}>
                <View style={styles.catHeader}>
                  <View style={styles.catTitleGroup}>
                    <View style={[styles.catBadge, { backgroundColor: cat.color }]}>
                      <Text style={styles.catBadgeText}>{cat.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.catName}>{cat.name}</Text>
                  </View>
                  <Text style={styles.catSpent}>{formatCurrency(spent)}</Text>
                </View>

                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${percentOfTotal}%`,
                        backgroundColor: cat.color,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.percentText}>{percentOfTotal}% of monthly spend</Text>
              </View>
            );
          })}
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
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  totalCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginVertical: Spacing.md,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  discretionarySub: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  categoryList: {
    gap: Spacing.md,
  },
  categoryCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  catTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  catBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
  catName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  catSpent: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  progressBg: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.surfaceHover,
    borderRadius: 3,
    marginVertical: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
