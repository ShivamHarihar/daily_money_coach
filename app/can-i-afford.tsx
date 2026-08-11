import { useRouter } from 'expo-router';
import { AlertTriangle, CheckCircle, Sparkles, X, XCircle } from 'lucide-react-native';
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
import { BorderRadius, Colors, Shadows, Spacing } from '../src/constants/theme';
import { useFinanceStore } from '../src/store/useFinanceStore';
import { calculateAffordability, formatCurrency } from '../src/utils/calculator';

export default function CanIAffordScreen() {
  const router = useRouter();
  const { getSummary } = useFinanceStore();

  const [itemTitle, setItemTitle] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const summary = getSummary();
  const purchaseAmount = parseFloat(amount) || 0;

  const analysis = calculateAffordability({
    purchaseAmount,
    currentSummary: summary,
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleGroup}>
            <Sparkles size={20} color={Colors.secondary} />
            <Text style={styles.headerTitle}>Can I Afford This?</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <X size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.subtitle}>
            Enter an intended purchase amount to see how it impacts your daily budget and monthly savings.
          </Text>

          {/* Item Name Input */}
          <Text style={styles.inputLabel}>What do you want to buy?</Text>
          <TextInput
            style={styles.textInput}
            value={itemTitle}
            onChangeText={setItemTitle}
            placeholder="e.g. Wireless Headphones, New Jacket"
            placeholderTextColor={Colors.textMuted}
          />

          {/* Purchase Amount Input */}
          <Text style={styles.inputLabel}>Price / Cost</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencyPrefix}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ''))}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
              autoFocus
            />
          </View>

          {/* DECISION ANALYSIS CARD */}
          {purchaseAmount > 0 ? (
            <View
              style={[
                styles.analysisCard,
                analysis.severity === 'safe'
                  ? styles.cardSafe
                  : analysis.severity === 'caution'
                  ? styles.cardCaution
                  : styles.cardWarning,
              ]}
            >
              <View style={styles.badgeRow}>
                {analysis.severity === 'safe' ? (
                  <CheckCircle size={28} color={Colors.primary} />
                ) : analysis.severity === 'caution' ? (
                  <AlertTriangle size={28} color={Colors.warning} />
                ) : (
                  <XCircle size={28} color={Colors.danger} />
                )}

                <View style={styles.badgeTextGroup}>
                  <Text
                    style={[
                      styles.decisionTitle,
                      {
                        color:
                          analysis.severity === 'safe'
                            ? Colors.primary
                            : analysis.severity === 'caution'
                            ? Colors.warning
                            : Colors.danger,
                      },
                    ]}
                  >
                    {analysis.title}
                  </Text>
                  <Text style={styles.decisionSub}>{itemTitle || 'This purchase'}</Text>
                </View>
              </View>

              <Text style={styles.decisionDescription}>{analysis.description}</Text>

              <View style={styles.divider} />

              {/* Impact Breakdown Table */}
              <View style={styles.impactTable}>
                <View style={styles.impactRow}>
                  <Text style={styles.impactLabel}>Current Daily Limit</Text>
                  <Text style={styles.impactValue}>
                    {formatCurrency(summary.safeDailyLimit)}/day
                  </Text>
                </View>

                <View style={styles.impactRow}>
                  <Text style={styles.impactLabel}>New Daily Limit (after purchase)</Text>
                  <Text
                    style={[
                      styles.impactValue,
                      {
                        color:
                          analysis.newDailyLimit < summary.safeDailyLimit
                            ? Colors.warning
                            : Colors.primary,
                      },
                    ]}
                  >
                    {formatCurrency(analysis.newDailyLimit)}/day
                  </Text>
                </View>

                <View style={styles.impactRow}>
                  <Text style={styles.impactLabel}>Remaining Monthly Buffer</Text>
                  <Text style={styles.impactValue}>
                    {formatCurrency(analysis.monthlyDiscretionaryRemaining)}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyPrompt}>
              <Sparkles size={36} color={Colors.textMuted} />
              <Text style={styles.promptTitle}>Instant Decision Coach</Text>
              <Text style={styles.promptSub}>
                Type an amount above to see if you can safely buy it without compromising your savings goal!
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.closeModalButton}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Text style={styles.closeModalText}>Got it</Text>
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
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  textInput: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    borderColor: Colors.cardBorder,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.secondary,
    marginBottom: Spacing.xl,
  },
  currencyPrefix: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.secondary,
    marginRight: Spacing.xs,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  analysisCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 2,
    marginBottom: Spacing.xl,
  },
  cardSafe: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: Colors.primary,
  },
  cardCaution: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: Colors.warning,
  },
  cardWarning: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: Colors.danger,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  badgeTextGroup: {
    flex: 1,
  },
  decisionTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  decisionSub: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  decisionDescription: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: Spacing.md,
  },
  impactTable: {
    gap: Spacing.xs,
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  impactLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  impactValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyPrompt: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderStyle: 'dashed',
  },
  promptTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: 4,
  },
  promptSub: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  closeModalButton: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.surfaceHover,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
