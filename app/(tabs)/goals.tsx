import { PiggyBank, Plus, Target, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
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

export default function GoalsScreen() {
  const { userProfile, savingsGoals, getSummary, addSavingsGoal, deleteGoal } = useFinanceStore();
  const summary = getSummary();

  const [modalVisible, setModalVisible] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  const handleCreateGoal = async () => {
    const target = parseFloat(targetAmount);
    if (!goalName.trim() || isNaN(target) || target <= 0) {
      Alert.alert('Error', 'Please enter a valid goal name and target amount.');
      return;
    }

    await addSavingsGoal({
      name: goalName.trim(),
      target_amount: target,
      current_amount: 0,
      color: Colors.primary,
    });

    setGoalName('');
    setTargetAmount('');
    setModalVisible(false);
  };

  const handleDeleteGoal = (id: string, name: string) => {
    Alert.alert('Delete Goal', `Are you sure you want to delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteGoal(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Savings & Goals</Text>
            <Text style={styles.subtitle}>Track your monthly target and long-term milestones.</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Plus size={20} color="#0B0F17" />
          </TouchableOpacity>
        </View>

        {/* Primary Monthly Target Card */}
        <View style={styles.primaryTargetCard}>
          <View style={styles.primaryHeader}>
            <PiggyBank size={24} color={Colors.primary} />
            <Text style={styles.primaryTitle}>Monthly Savings Plan</Text>
          </View>
          <Text style={styles.primaryAmount} numberOfLines={1} adjustsFontSizeToFit>
            {formatCurrency(summary.savingsTarget)}/month
          </Text>

          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                { width: `${summary.savingsProgressPercent}%` },
              ]}
            />
          </View>
          <Text style={styles.progressSub}>
            {summary.savingsProgressPercent}% of your monthly target saved so far this month
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Your Savings Milestones</Text>

        {savingsGoals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Target size={32} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No custom goals yet</Text>
            <Text style={styles.emptySub}>
              Tap the + button above to create a target for an Emergency Fund, Laptop, or Vacation!
            </Text>
          </View>
        ) : (
          <View style={styles.goalsList}>
            {savingsGoals.map((goal) => {
              const progressPct =
                goal.target_amount > 0
                  ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
                  : 0;

              return (
                <View key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <View style={styles.goalTitleGroup}>
                      <View style={styles.goalIconCircle}>
                        <Target size={18} color={Colors.primary} />
                      </View>
                      <Text style={styles.goalName} numberOfLines={1}>{goal.name}</Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleDeleteGoal(goal.id, goal.name)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Trash2 size={16} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.goalAmountRow}>
                    <Text style={styles.goalCurrent}>
                      Saved: {formatCurrency(goal.current_amount)}
                    </Text>
                    <Text style={styles.goalTarget}>
                      Target: {formatCurrency(goal.target_amount)}
                    </Text>
                  </View>

                  <View style={styles.goalProgressBg}>
                    <View style={[styles.goalProgressFill, { width: `${progressPct}%` }]} />
                  </View>

                  <Text style={styles.goalPercentText}>{progressPct}% achieved</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent statusBarTranslucent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kavWrapper}
        >
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setModalVisible(false)} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Savings Goal</Text>

            <Text style={styles.inputLabel}>Goal Name</Text>
            <TextInput
              style={styles.modalInput}
              value={goalName}
              onChangeText={setGoalName}
              placeholder="e.g. Emergency Fund, New Bike"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.inputLabel}>Target Amount (₹)</Text>
            <TextInput
              style={styles.modalInput}
              value={targetAmount}
              onChangeText={(t) => setTargetAmount(t.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 50000"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.createButton} onPress={handleCreateGoal}>
                <Text style={styles.createText}>Create Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryTargetCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginVertical: Spacing.md,
  },
  primaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.xs,
  },
  primaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  primaryAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.primary,
  },
  progressBg: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.surfaceHover,
    borderRadius: 4,
    marginVertical: Spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressSub: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  emptyCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    // removed borderStyle: 'dashed' — not supported on Android
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  goalsList: {
    gap: Spacing.md,
  },
  goalCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  goalTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    marginRight: Spacing.sm,
  },
  goalIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceHover,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  goalName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  goalAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  goalCurrent: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  goalTarget: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  goalProgressBg: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.surfaceHover,
    borderRadius: 3,
    marginVertical: Spacing.sm,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  goalPercentText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  // Modal styles
  kavWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: Colors.surfaceHover,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.surfaceHover,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  createButton: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B0F17',
  },
});
