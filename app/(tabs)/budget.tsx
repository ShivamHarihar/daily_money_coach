import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Shadows, Spacing } from '../../src/constants/theme';
import { useFinanceStore } from '../../src/store/useFinanceStore';
import { formatCurrency } from '../../src/utils/calculator';
import { Share2, ChevronLeft, ChevronRight, PieChart } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BudgetScreen() {
  const { expenses, categories, getSummary } = useFinanceStore();
  const summary = getSummary();
  const [selectedPeriod, setSelectedPeriod] = useState<'WEEK' | 'MONTH' | 'YEAR' | 'ALL'>('MONTH');

  // Group expenses by category for current month
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const categoryTotals: Record<string, number> = {};
  let totalSpentThisMonth = 0;
  let activeDaysSet = new Set<string>();
  let totalTransactions = 0;

  for (const exp of expenses) {
    const d = new Date(exp.date);
    if (d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear) {
      categoryTotals[exp.category_id] = (categoryTotals[exp.category_id] || 0) + exp.amount;
      totalSpentThisMonth += exp.amount;
      activeDaysSet.add(exp.date);
      totalTransactions++;
    }
  }

  // Find top category
  let topCategoryName = 'None';
  let topCategoryPct = 0;
  let maxSpent = 0;
  categories.forEach(cat => {
    const spent = categoryTotals[cat.id] || 0;
    if (spent > maxSpent) {
      maxSpent = spent;
      topCategoryName = cat.name;
    }
  });
  if (totalSpentThisMonth > 0 && maxSpent > 0) {
    topCategoryPct = Math.round((maxSpent / totalSpentThisMonth) * 100);
  }

  const activeDays = activeDaysSet.size;
  const monthName = now.toLocaleString('default', { month: 'long' });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header from Screenshot 2 */}
        <View style={styles.header}>
          <View>
            <View style={styles.liveBadgeRow}>
              <Text style={styles.title}>Spending Stats</Text>
              <View style={styles.liveIndicator}>
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>Clear patterns • {monthName} {currentYear}</Text>
          </View>
          <TouchableOpacity style={styles.shareButton}>
            <Share2 size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Period Selector Tabs */}
        <View style={styles.periodTabsContainer}>
          {(['WEEK', 'MONTH', 'YEAR', 'ALL'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodTab,
                selectedPeriod === period && styles.periodTabActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodTabText,
                  selectedPeriod === period && styles.periodTabTextActive,
                ]}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Selector Row */}
        <View style={styles.dateSelectorRow}>
          <TouchableOpacity style={styles.arrowBtn}>
            <ChevronLeft size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.calendarLabel}>
            <Text style={styles.calendarLabelText}>
              {monthName} {currentYear}
            </Text>
          </View>
          <TouchableOpacity style={styles.arrowBtn}>
            <ChevronRight size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Spending Story Card */}
        <View style={[styles.storyCard, Shadows.card]}>
          <Text style={styles.storyTitle}>Your spending story</Text>
          <Text style={styles.storySub}>
            {monthName} {currentYear} • live entries
          </Text>

          <Text style={styles.outflowLabel}>TOTAL OUTFLOW</Text>
          <Text style={styles.outflowAmount}>{formatCurrency(totalSpentThisMonth)}</Text>

          {/* Prompt card snippet */}
          <View style={styles.promptSnippetBox}>
            <Text style={styles.promptSnippetText}>
              Keep logging to unlock a like-for-like comparison.
            </Text>
          </View>

          {/* Stats quick grid */}
          <View style={styles.statsSummaryGrid}>
            <View style={styles.statSummaryBox}>
              <Text style={styles.summaryLabel}>SPENT</Text>
              <Text style={[styles.summaryVal, { color: Colors.primary }]}>
                {formatCurrency(totalSpentThisMonth)}
              </Text>
            </View>
            <View style={styles.statSummaryBox}>
              <Text style={styles.summaryLabel}>SAVED</Text>
              <Text style={[styles.summaryVal, { color: Colors.essentials }]}>
                {formatCurrency(Math.max(0, summary.totalMonthlyIncome - summary.totalFixedExpenses - totalSpentThisMonth))}
              </Text>
            </View>
            <View style={styles.statSummaryBox}>
              <Text style={styles.summaryLabel}>ENTRIES</Text>
              <Text style={[styles.summaryVal, { color: '#7C3AED' }]}>{totalTransactions}</Text>
            </View>
          </View>
        </View>

        {/* "What your numbers say" Section */}
        <Text style={styles.sectionTitle}>What your numbers say</Text>
        <Text style={styles.sectionSubtitle}>Based on the entries available</Text>

        <View style={styles.insightsRow}>
          <View style={[styles.insightCard, { backgroundColor: '#EFF6FF' }]}>
            <Text style={styles.insightValText}>{totalTransactions}</Text>
            <Text style={styles.insightLabelText}>Entries logged</Text>
          </View>

          <View style={[styles.insightCard, { backgroundColor: '#ECFDF5' }]}>
            <Text style={styles.insightValText}>{activeDays}/30</Text>
            <Text style={styles.insightLabelText}>Active days tracker</Text>
          </View>

          <View style={[styles.insightCard, { backgroundColor: '#FFFBEB' }]}>
            <Text style={styles.insightValText}>{topCategoryPct}%</Text>
            <Text style={styles.insightLabelText} numberOfLines={2}>Top share: {topCategoryName}</Text>
          </View>
        </View>

        {/* Category breakdown listing */}
        <Text style={styles.sectionTitle}>Category breakdown</Text>
        <View style={styles.categoryBreakdownList}>
          {categories.map((cat) => {
            const spent = categoryTotals[cat.id] || 0;
            const percentOfTotal =
              totalSpentThisMonth > 0 ? Math.round((spent / totalSpentThisMonth) * 100) : 0;

            return (
              <View key={cat.id} style={styles.catBreakdownCard}>
                <View style={styles.catHeader}>
                  <View style={styles.catLeft}>
                    <View style={[styles.catBadgeCircle, { backgroundColor: cat.color }]}>
                      <Text style={styles.catBadgeText}>{cat.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.catNameText}>{cat.name}</Text>
                  </View>
                  <Text style={styles.catAmountText}>{formatCurrency(spent)}</Text>
                </View>

                {/* Custom Bar progress indicator */}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressIndicatorFill,
                      { width: `${percentOfTotal}%`, backgroundColor: cat.color },
                    ]}
                  />
                </View>
                <Text style={styles.percentSubText}>{percentOfTotal}% of total variable spend</Text>
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
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  liveIndicator: {
    backgroundColor: '#DEF7EC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  liveText: {
    color: '#03543F',
    fontSize: 10,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  periodTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: BorderRadius.md,
    padding: 2,
    marginBottom: Spacing.md,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  periodTabActive: {
    backgroundColor: Colors.primary,
  },
  periodTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  periodTabTextActive: {
    color: '#FFFFFF',
  },
  dateSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  calendarLabel: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    elevation: 1,
  },
  calendarLabelText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  storyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  storySub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  outflowLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  outflowAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -1,
    marginBottom: Spacing.md,
  },
  promptSnippetBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  promptSnippetText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsSummaryGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: Spacing.md,
  },
  statSummaryBox: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  summaryVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  insightsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  insightCard: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  insightValText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  insightLabelText: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  categoryBreakdownList: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  catBreakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  catBadgeCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catBadgeText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  catNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  catAmountText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    marginVertical: Spacing.sm,
    overflow: 'hidden',
  },
  progressIndicatorFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentSubText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
