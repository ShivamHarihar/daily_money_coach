import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Check, X } from 'lucide-react-native';
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
import { BorderRadius, Colors, Spacing } from '../src/constants/theme';
import { useFinanceStore } from '../src/store/useFinanceStore';
import { PaymentMethod } from '../src/types';

const PAYMENT_METHODS: PaymentMethod[] = ['UPI', 'Cash', 'Card', 'Bank Transfer'];

export default function AddExpenseModal() {
  const router = useRouter();
  const { categories, addExpense } = useFinanceStore();

  const [amount, setAmount] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categories[0]?.id || 'food'
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    await addExpense({
      amount: numAmount,
      category_id: selectedCategory,
      note: note.trim(),
      date: todayStr,
      time: timeStr,
      payment_method: paymentMethod,
    });

    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add Expense</Text>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <X size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Amount Box */}
          <View style={styles.amountContainer}>
            <Text style={styles.amountPrefix}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={(text) => {
                setAmount(text.replace(/[^0-9]/g, ''));
                setError('');
              }}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
              autoFocus
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Quick Preset Amount Buttons */}
          <View style={styles.quickAmountGrid}>
            {[50, 100, 200, 500, 1000].map((val) => (
              <TouchableOpacity
                key={val}
                style={styles.quickAmountChip}
                onPress={() => setAmount(String(val))}
              >
                <Text style={styles.quickAmountText}>+₹{val}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category Chips */}
          <Text style={styles.sectionLabel}>Select Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    isSelected && { backgroundColor: cat.color, borderColor: cat.color },
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && { color: '#FFF', fontWeight: '800' },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Payment Method Selector */}
          <Text style={styles.sectionLabel}>Payment Method</Text>
          <View style={styles.paymentMethodRow}>
            {PAYMENT_METHODS.map((pm) => {
              const isSelected = paymentMethod === pm;
              return (
                <TouchableOpacity
                  key={pm}
                  style={[
                    styles.pmChip,
                    isSelected && styles.pmChipSelected,
                  ]}
                  onPress={() => setPaymentMethod(pm)}
                >
                  <Text
                    style={[
                      styles.pmText,
                      isSelected && styles.pmTextSelected,
                    ]}
                  >
                    {pm}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Note Input */}
          <Text style={styles.sectionLabel}>Optional Note</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="e.g. Swiggy lunch with team"
            placeholderTextColor={Colors.textMuted}
          />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.saveButton}
            activeOpacity={0.8}
            onPress={handleSave}
          >
            <Check size={20} color="#0B0F17" />
            <Text style={styles.saveButtonText}>Save Expense</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: Spacing.sm,
  },
  amountPrefix: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.primary,
    marginRight: Spacing.xs,
  },
  amountInput: {
    flex: 1,
    fontSize: 36,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginBottom: Spacing.sm,
  },
  quickAmountGrid: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  quickAmountChip: {
    backgroundColor: Colors.surfaceHover,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  quickAmountText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  categoryChip: {
    backgroundColor: Colors.cardBackground,
    borderColor: Colors.cardBorder,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  categoryChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  pmChip: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderColor: Colors.cardBorder,
    borderWidth: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  pmChipSelected: {
    backgroundColor: Colors.primarySubtle,
    borderColor: Colors.primary,
  },
  pmText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  pmTextSelected: {
    color: Colors.primary,
    fontWeight: '800',
  },
  noteInput: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    borderColor: Colors.cardBorder,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  saveButton: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B0F17',
  },
});
