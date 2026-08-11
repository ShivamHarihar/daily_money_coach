import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, Building, CreditCard, FileText, Tv } from 'lucide-react-native';
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

export default function FixedExpensesScreen() {
  const router = useRouter();
  const { userProfile, updateProfile } = useFinanceStore();

  const [rent, setRent] = useState<string>('10000');
  const [emi, setEmi] = useState<string>('2500');
  const [bills, setBills] = useState<string>('1500');
  const [subscriptions, setSubscriptions] = useState<string>('1000');

  const totalFixed =
    (parseFloat(rent) || 0) +
    (parseFloat(emi) || 0) +
    (parseFloat(bills) || 0) +
    (parseFloat(subscriptions) || 0);

  const handleNext = async () => {
    await updateProfile({ fixed_expenses: totalFixed });
    router.push('/(onboarding)/savings');
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
            <Text style={styles.headerTitle}>Step 3 of 5</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Title */}
          <View style={styles.sectionHeader}>
            <Text style={styles.title}>Fixed Expenses</Text>
            <Text style={styles.subtitle}>
              What bills do you have to pay every month without fail?
            </Text>
          </View>

          {/* Dynamic Total Display */}
          <View style={styles.totalBadge}>
            <Text style={styles.totalLabel}>Total Fixed Commitments</Text>
            <Text style={styles.totalAmount}>{formatCurrency(totalFixed)}/month</Text>
          </View>

          {/* Itemized Fields */}
          <View style={styles.fieldsContainer}>
            {/* Rent Field */}
            <View style={styles.fieldRow}>
              <View style={styles.fieldIcon}>
                <Building size={20} color={Colors.primary} />
              </View>
              <View style={styles.fieldInfo}>
                <Text style={styles.fieldTitle}>Rent & Housing</Text>
              </View>
              <View style={styles.fieldInputContainer}>
                <Text style={styles.fieldPrefix}>₹</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={rent}
                  onChangeText={(text) => setRent(text.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            {/* EMI Field */}
            <View style={styles.fieldRow}>
              <View style={styles.fieldIcon}>
                <CreditCard size={20} color={Colors.secondary} />
              </View>
              <View style={styles.fieldInfo}>
                <Text style={styles.fieldTitle}>EMI & Loans</Text>
              </View>
              <View style={styles.fieldInputContainer}>
                <Text style={styles.fieldPrefix}>₹</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={emi}
                  onChangeText={(text) => setEmi(text.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            {/* Bills & Utilities */}
            <View style={styles.fieldRow}>
              <View style={styles.fieldIcon}>
                <FileText size={20} color={Colors.accent} />
              </View>
              <View style={styles.fieldInfo}>
                <Text style={styles.fieldTitle}>Bills & Utilities</Text>
              </View>
              <View style={styles.fieldInputContainer}>
                <Text style={styles.fieldPrefix}>₹</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={bills}
                  onChangeText={(text) => setBills(text.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            {/* Subscriptions */}
            <View style={styles.fieldRow}>
              <View style={styles.fieldIcon}>
                <Tv size={20} color="#A855F7" />
              </View>
              <View style={styles.fieldInfo}>
                <Text style={styles.fieldTitle}>Subscriptions & Other</Text>
              </View>
              <View style={styles.fieldInputContainer}>
                <Text style={styles.fieldPrefix}>₹</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={subscriptions}
                  onChangeText={(text) => setSubscriptions(text.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>
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
  totalBadge: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
  fieldsContainer: {
    gap: Spacing.md,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  fieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceHover,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  fieldInfo: {
    flex: 1,
  },
  fieldTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  fieldInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceHover,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    minWidth: 100,
  },
  fieldPrefix: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginRight: 4,
  },
  fieldInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'right',
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
