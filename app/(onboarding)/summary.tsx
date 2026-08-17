import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Shadows, Spacing } from '../../src/constants/theme';
import { useFinanceStore } from '../../src/store/useFinanceStore';
import { formatCurrency } from '../../src/utils/calculator';
import { PieChart } from 'react-native-gifted-charts';

export default function SummaryScreen() {
  const router = useRouter();
  const { userProfile, getSummary, updateProfile } = useFinanceStore();

  const summary = getSummary();

  const handleStartPlan = async () => {
    await updateProfile({ onboarding_completed: true });
    router.replace('/(tabs)');
  };

  // Prepare Donut Chart data representing breakdown of Income
  const discretionaryBudget = Math.max(0, summary.totalMonthlyIncome - summary.totalFixedExpenses - summary.savingsTarget);
  const donutData = [
    { value: summary.totalFixedExpenses, color: Colors.danger, text: 'Fixed' },
    { value: summary.savingsTarget, color: Colors.savings, text: 'Saved' },
    { value: discretionaryBudget, color: Colors.primary, text: 'Available' },
  ].filter(d => d.value > 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Step 5 of 5</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.title}>Your Money Formula</Text>
          <Text style={styles.subtitle}>
            Here is your daily spending power calculated from your inputs.
          </Text>
        </View>

        {/* HERO CARD: Daily Safe Spend */}
        <View style={[styles.heroCard, Shadows.card]}>
          <View style={styles.heroBadge}>
            <Sparkles size={16} color={Colors.primary} />
            <Text style={styles.heroBadgeText}>Calculated Daily Limit</Text>
          </View>
          <Text style={styles.heroAmount}>{formatCurrency(summary.safeDailyLimit)}</Text>
          <Text style={styles.heroSub}>Safe to spend today</Text>
        </View>

        {/* Chart representation using standard PieChart + donut prop */}
        {donutData.length > 0 && (
          <View style={styles.chartContainer}>
            <PieChart
              donut
              data={donutData}
              radius={70}
              innerRadius={50}
              showText
              textSize={10}
              textColor="#FFFFFF"
            />
            <View style={styles.legendContainer}>
              {donutData.map((item, idx) => (
                <View key={idx} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>
                    {item.text}: {formatCurrency(item.value)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Calculation Breakdown Card */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Monthly Formula</Text>

          <View style={styles.breakdownRow}>
            <Text style={styles.rowLabel}>Monthly Income</Text>
            <Text style={[styles.rowValue, { color: Colors.primary }]}>
              +{formatCurrency(summary.totalMonthlyIncome)}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.rowLabel}>Fixed Expenses (Rent, Bills, EMI)</Text>
            <Text style={[styles.rowValue, { color: Colors.danger }]}>
              -{formatCurrency(summary.totalFixedExpenses)}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.rowLabel}>Monthly Savings Goal</Text>
            <Text style={[styles.rowValue, { color: Colors.savings }]}>
              -{formatCurrency(summary.savingsTarget)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.breakdownRow}>
            <Text style={styles.totalRowLabel}>Available Discretionary Spending</Text>
            <Text style={styles.totalRowValue}>
              {formatCurrency(summary.discretionaryMonthlyBudget)}
            </Text>
          </View>

          <View style={styles.daysInfo}>
            <ShieldCheck size={16} color={Colors.textSecondary} />
            <Text style={styles.daysText}>
              Divided across {summary.daysRemainingInMonth} remaining days in this month.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8} onPress={handleStartPlan}>
          <Text style={styles.buttonText}>Start My Money Plan</Text>
          <CheckCircle2 size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
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
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sectionHeader: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: Spacing.lg,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 6,
    marginBottom: Spacing.sm,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  heroAmount: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  heroSub: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  legendContainer: {
    marginTop: Spacing.md,
    width: '100%',
    gap: Spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: Spacing.sm,
  },
  totalRowLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  totalRowValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  daysInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.md,
    backgroundColor: '#F9FAFB',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  daysText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  primaryButton: {
    width: '100%',
    height: 54,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
