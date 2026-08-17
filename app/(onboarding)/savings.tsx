import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, PiggyBank, Sparkles } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../src/constants/theme';
import { useFinanceStore } from '../../src/store/useFinanceStore';
import { formatCurrency } from '../../src/utils/calculator';

export default function SavingsTargetScreen() {
  const router = useRouter();
  const { userProfile, updateProfile } = useFinanceStore();

  const income = userProfile?.monthly_income || 40000;
  // Default to ~15% of income
  const defaultSavings = Math.round((income * 0.15) / 1000) * 1000 || 5000;

  const [savings, setSavings] = useState<string>(String(defaultSavings));
  const [error, setError] = useState<string>('');

  const numericSavings = parseFloat(savings) || 0;
  const savingsPercent = income > 0 ? Math.round((numericSavings / income) * 100) : 0;

  const percentages = [10, 15, 20, 25];

  const handleNext = async () => {
    if (numericSavings < 0) {
      setError('Savings target cannot be negative.');
      return;
    }
    setError('');
    await updateProfile({ savings_target: numericSavings });
    router.push('/(onboarding)/summary');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Step 4 of 5</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Title */}
          <View style={styles.sectionHeader}>
            <Text style={styles.title}>Monthly Savings Goal</Text>
            <Text style={styles.subtitle}>
              How much money do you want to keep for your future self every month?
            </Text>
          </View>

          {/* Large Input Box */}
          <View style={styles.inputContainer}>
            <Text style={styles.currencyPrefix}>₹</Text>
            <TextInput
              style={styles.input}
              value={savings}
              onChangeText={(text) => {
                setSavings(text.replace(/[^0-9]/g, ''));
                setError('');
              }}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Percentage Pills */}
          <Text style={styles.presetLabel}>Recommended Targets (% of Income):</Text>
          <View style={styles.presetGrid}>
            {percentages.map((pct) => {
              const targetVal = Math.round((income * (pct / 100)) / 500) * 500;
              const isSelected = numericSavings === targetVal;
              return (
                <TouchableOpacity
                  key={pct}
                  style={[styles.presetChip, isSelected && styles.presetChipSelected]}
                  onPress={() => {
                    setSavings(String(targetVal));
                    setError('');
                  }}
                >
                  <Text style={[styles.presetText, isSelected && styles.presetTextSelected]}>
                    {pct}% ({formatCurrency(targetVal)})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Savings Dynamic Feedback */}
          <View style={styles.feedbackCard}>
            <PiggyBank size={24} color={Colors.primary} />
            <View style={styles.feedbackText}>
              <Text style={styles.feedbackTitle}>
                {savingsPercent}% of your monthly income
              </Text>
              <Text style={styles.feedbackSub}>
                {savingsPercent >= 20
                  ? '🔥 Fantastic goal! You will build an emergency fund & wealth fast.'
                  : savingsPercent >= 10
                  ? '👍 Solid start! Consistent saving compounds over time.'
                  : '💡 Saving even 5-10% consistently builds strong financial security.'}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8} onPress={handleNext}>
            <Text style={styles.buttonText}>Reveal My Daily Limit</Text>
            <Sparkles size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    marginBottom: Spacing.xl,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  currencyPrefix: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    marginBottom: Spacing.md,
  },
  presetLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  presetChip: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  presetChipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: Colors.primary,
  },
  presetText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  presetTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  feedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  feedbackText: {
    flex: 1,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  feedbackSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
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
