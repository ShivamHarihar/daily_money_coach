import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, IndianRupee } from 'lucide-react-native';
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

const PRESET_INCOMES = [25000, 40000, 60000, 80000, 100000];

export default function IncomeScreen() {
  const router = useRouter();
  const { userProfile, updateProfile } = useFinanceStore();
  const [income, setIncome] = useState<string>(
    userProfile?.monthly_income ? String(userProfile.monthly_income) : '40000'
  );
  const [error, setError] = useState<string>('');

  const handleNext = async () => {
    const numericIncome = parseFloat(income);
    if (isNaN(numericIncome) || numericIncome <= 0) {
      setError('Please enter a valid monthly income.');
      return;
    }
    setError('');
    await updateProfile({ monthly_income: numericIncome });
    router.push('/(onboarding)/fixed-expenses');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Step 2 of 5</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Question */}
          <View style={styles.sectionHeader}>
            <Text style={styles.title}>Monthly Income</Text>
            <Text style={styles.subtitle}>How much do you take home every month after tax?</Text>
          </View>

          {/* Large Input Box */}
          <View style={styles.inputContainer}>
            <Text style={styles.currencyPrefix}>₹</Text>
            <TextInput
              style={styles.input}
              value={income}
              onChangeText={(text) => {
                setIncome(text.replace(/[^0-9]/g, ''));
                setError('');
              }}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              autoFocus
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Preset Buttons */}
          <Text style={styles.presetLabel}>Quick Select:</Text>
          <View style={styles.presetGrid}>
            {PRESET_INCOMES.map((amount) => {
              const isSelected = income === String(amount);
              return (
                <TouchableOpacity
                  key={amount}
                  style={[styles.presetChip, isSelected && styles.presetChipSelected]}
                  onPress={() => {
                    setIncome(String(amount));
                    setError('');
                  }}
                >
                  <Text style={[styles.presetText, isSelected && styles.presetTextSelected]}>
                    {formatCurrency(amount)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.infoBox}>
            <IndianRupee size={18} color={Colors.primary} />
            <Text style={styles.infoText}>
              If your income varies each month, enter your average minimum expected income.
            </Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8} onPress={handleNext}>
            <Text style={styles.buttonText}>Continue</Text>
            <ArrowRight size={20} color="#000" />
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
    paddingHorizontal: Spacing.lg,
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
    color: Colors.textMuted,
  },
  sectionHeader: {
    marginTop: Spacing.md,
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
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
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
    color: Colors.textMuted,
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
    backgroundColor: Colors.cardBackground,
    borderColor: Colors.cardBorder,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  presetChipSelected: {
    backgroundColor: Colors.primarySubtle,
    borderColor: Colors.primary,
  },
  presetText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  presetTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceHover,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  primaryButton: {
    width: '100%',
    height: 56,
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
    color: '#0B0F17',
  },
});
