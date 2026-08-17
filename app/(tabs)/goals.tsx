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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Goals</Text>
            <Text style={styles.subtitle}>Set financial goals and track your progress.</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Plus size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

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
                    <Text style={styles.goalName} numberOfLines={1}>{goal.name}</Text>
                    <View style={styles.pctBadge}>
                      <Text style={styles.pctBadgeText}>{progressPct}%</Text>
                    </View>
                  </View>

                  <View style={styles.goalAmountRow}>
                    <Text style={styles.goalCurrent}>
                      {formatCurrency(goal.current_amount)} <Text style={{ color: Colors.textSecondary, fontWeight: '400' }}>/ {formatCurrency(goal.target_amount)}</Text>
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteGoal(goal.id, goal.name)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Trash2 size={15} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.goalProgressBg}>
                    <View style={[styles.goalProgressFill, { width: `${progressPct}%` }]} />
                  </View>

                  <Text style={styles.goalDateSub}>Target Date: 31 Dec 2026</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Motivational Card at bottom from screenshot 5 */}
        <View style={styles.disciplineCard}>
          <Text style={styles.disciplineText}>Stay disciplined today</Text>
          <Text style={styles.disciplineSub}>To enjoy a better tomorrow! ✨</Text>
        </View>
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
              placeholder="e.g. Emergency Fund, New Laptop"
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
    paddingHorizontal: Spacing.md,
    paddingBottom: 110, // clear tab bar offset space
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: 26,
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
    backgroundColor: '#0D9488', // Teal highlight color
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
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
    marginVertical: Spacing.sm,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    flex: 1,
  },
  pctBadge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  pctBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#137333',
  },
  goalAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  goalCurrent: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  goalProgressBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginVertical: Spacing.sm,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#0D9488', // Green-Teal
    borderRadius: 4,
  },
  goalDateSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  disciplineCard: {
    backgroundColor: '#E6F4EA',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: '#CEEAD6',
  },
  disciplineText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#137333',
  },
  disciplineSub: {
    fontSize: 12,
    color: '#137333',
    marginTop: 2,
  },
  kavWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: '#F3F4F6',
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
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    borderColor: '#E5E7EB',
    borderWidth: 1,
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
    backgroundColor: '#F3F4F6',
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
    backgroundColor: '#0D9488',
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
});
