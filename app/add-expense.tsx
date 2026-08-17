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
  const { categories, addExpense, updateProfile, userProfile } = useFinanceStore();

  const [transactionType, setTransactionType] = useState<'Expense' | 'Income'>('Expense');
  const [amount, setAmount] = useState<string>('');
  
  // Essentials vs Lifestyle segment selector (only for expenses)
  const essentialsCatIds = ['food', 'transport', 'bills', 'rent', 'emi', 'health', 'education'];
  const [selectedSegment, setSelectedSegment] = useState<'Essentials' | 'Lifestyle' | 'Savings'>(
    essentialsCatIds.includes(categories[0]?.id) ? 'Essentials' : 'Lifestyle'
  );
  
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categories[0]?.id || 'food'
  );

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  const filteredCategories = categories.filter(cat => {
    const isEssential = essentialsCatIds.includes(cat.id);
    if (selectedSegment === 'Essentials') return isEssential;
    if (selectedSegment === 'Lifestyle') return !isEssential;
    return true; // fallback
  });

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    if (transactionType === 'Income') {
      // Add directly to user's monthly income profile formula
      const newIncome = (userProfile?.monthly_income || 0) + numAmount;
      await updateProfile({
        monthly_income: newIncome
      });
    } else {
      // Add expense transaction normally
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
    }

    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <X size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Transaction</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Business/Personal tab mock style from screenshot 3 */}
        <View style={styles.segmentTopBar}>
          <TouchableOpacity style={[styles.segmentBtn, styles.segmentBtnActive]}>
            <Text style={styles.segmentBtnTextActive}>Personal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.segmentBtn}>
            <Text style={styles.segmentBtnText}>Business</Text>
          </TouchableOpacity>
        </View>

        {/* Expense/Income switcher */}
        <View style={styles.typeSwitcher}>
          <TouchableOpacity 
            style={[styles.switchHalf, transactionType === 'Expense' && styles.switchHalfActive]}
            onPress={() => setTransactionType('Expense')}
          >
            <Text style={transactionType === 'Expense' ? styles.switchTextActive : styles.switchText}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.switchHalf, transactionType === 'Income' && styles.switchHalfActive]}
            onPress={() => setTransactionType('Income')}
          >
            <Text style={transactionType === 'Income' ? styles.switchTextActive : styles.switchText}>Income</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Amount Box */}
          <Text style={styles.inputLabelCenter}>AMOUNT</Text>
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
              placeholderTextColor="#CBD5E1"
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
                <Text style={styles.quickAmountText}>₹{val}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {transactionType === 'Expense' ? (
            <>
              {/* Segment Selector from Screenshot 3 */}
              <Text style={styles.sectionLabel}>TYPE</Text>
              <View style={styles.segmentSelectorContainer}>
                {(['Essentials', 'Lifestyle', 'Savings'] as const).map((segment) => {
                  const isActive = selectedSegment === segment;
                  return (
                    <TouchableOpacity
                      key={segment}
                      style={[
                        styles.segmentOption,
                        isActive && {
                          backgroundColor:
                            segment === 'Essentials'
                              ? '#E8F5E9'
                              : segment === 'Lifestyle'
                              ? '#FEF3C7'
                              : '#EFF6FF',
                          borderColor:
                            segment === 'Essentials'
                              ? Colors.essentials
                              : segment === 'Lifestyle'
                              ? Colors.lifestyle
                              : Colors.savings,
                        },
                      ]}
                      onPress={() => {
                        setSelectedSegment(segment);
                        // Automatically pre-select first category in this segment
                        const firstInSeg = categories.find(cat => {
                          const isEssential = essentialsCatIds.includes(cat.id);
                          return segment === 'Essentials' ? isEssential : !isEssential;
                        });
                        if (firstInSeg) setSelectedCategory(firstInSeg.id);
                      }}
                    >
                      <Text
                        style={[
                          styles.segmentOptionText,
                          isActive && {
                            color:
                              segment === 'Essentials'
                                ? Colors.essentials
                                : segment === 'Lifestyle'
                                ? Colors.lifestyle
                                : Colors.savings,
                            fontWeight: '800',
                          },
                        ]}
                      >
                        {segment}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Note Input */}
              <Text style={styles.sectionLabel}>DESCRIPTION</Text>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="e.g. Swiggy dinner"
                placeholderTextColor={Colors.textMuted}
              />

              {/* Category Chips */}
              <Text style={styles.sectionLabel}>CATEGORY</Text>
              <View style={styles.categoryGrid}>
                {filteredCategories.map((cat) => {
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
            </>
          ) : (
            <View style={styles.incomeNoticeBox}>
              <Text style={styles.incomeNoticeText}>
                Adding income here updates your active monthly budget formula and recalculates your Daily Safe Spend buffer automatically.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.saveButton}
            activeOpacity={0.8}
            onPress={handleSave}
          >
            <Check size={20} color="#FFF" />
            <Text style={styles.saveButtonText}>
              {transactionType === 'Expense' ? 'Add Transaction' : 'Save Income'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  segmentTopBar: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: BorderRadius.md,
    padding: 2,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  segmentBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  segmentBtnTextActive: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  typeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: BorderRadius.md,
    padding: 2,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  switchHalf: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  switchHalfActive: {
    backgroundColor: Colors.primary,
  },
  switchText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  switchTextActive: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  inputLabelCenter: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 4,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  amountPrefix: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.primary,
    marginRight: 4,
  },
  amountInput: {
    fontSize: 56,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  quickAmountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  quickAmountChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickAmountText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  segmentSelectorContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  segmentOption: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  segmentOptionText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  categoryChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  noteInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderColor: Colors.primary,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  saveButton: {
    width: '100%',
    height: 54,
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
    color: '#FFF',
  },
  incomeNoticeBox: {
    backgroundColor: '#E6F4EA',
    borderWidth: 1,
    borderColor: '#CEEAD6',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  incomeNoticeText: {
    color: '#137333',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
  },
});
