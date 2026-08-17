import { useRouter } from 'expo-router';
import {
  Building,
  PiggyBank,
  RefreshCw,
  ShieldCheck,
  User,
  Wallet,
} from 'lucide-react-native';
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

export default function ProfileScreen() {
  const router = useRouter();
  const { userProfile, updateProfile } = useFinanceStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [incomeInput, setIncomeInput] = useState(String(userProfile?.monthly_income || 40000));
  const [fixedInput, setFixedInput] = useState(String(userProfile?.fixed_expenses || 15000));
  const [savingsInput, setSavingsInput] = useState(String(userProfile?.savings_target || 5000));

  const handleUpdatePlan = async () => {
    const inc = parseFloat(incomeInput) || 0;
    const fix = parseFloat(fixedInput) || 0;
    const sav = parseFloat(savingsInput) || 0;

    await updateProfile({
      monthly_income: inc,
      fixed_expenses: fix,
      savings_target: sav,
    });

    setModalVisible(false);
  };

  const handleReRunOnboarding = () => {
    Alert.alert(
      'Re-run Onboarding',
      'Do you want to re-run the setup wizard?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Setup',
          onPress: async () => {
            await updateProfile({ onboarding_completed: false });
            router.replace('/(onboarding)');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your profile parameters and financial setup.</Text>
        </View>

        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <User size={28} color={Colors.primary} />
          </View>
          <View style={styles.profileText}>
            <Text style={styles.userName}>{userProfile?.name || 'User'}</Text>
            <Text style={styles.userSub}>Local Device Storage • 100% Offline</Text>
          </View>
        </View>

        {/* Active Money Plan Settings */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Active Financial Formula</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setIncomeInput(String(userProfile?.monthly_income || 0));
              setFixedInput(String(userProfile?.fixed_expenses || 0));
              setSavingsInput(String(userProfile?.savings_target || 0));
              setModalVisible(true);
            }}
          >
            <Text style={styles.editText}>Edit Plan</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.planCard}>
          <View style={styles.planRow}>
            <View style={styles.planLabelGroup}>
              <Wallet size={18} color={Colors.primary} />
              <Text style={styles.planLabel}>Monthly Income</Text>
            </View>
            <Text style={styles.planValue} numberOfLines={1}>
              {formatCurrency(userProfile?.monthly_income || 0)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.planRow}>
            <View style={styles.planLabelGroup}>
              <Building size={18} color={Colors.danger} />
              <Text style={styles.planLabel}>Fixed Expenses</Text>
            </View>
            <Text style={[styles.planValue, { color: Colors.danger }]} numberOfLines={1}>
              {formatCurrency(userProfile?.fixed_expenses || 0)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.planRow}>
            <View style={styles.planLabelGroup}>
              <PiggyBank size={18} color={Colors.secondary} />
              <Text style={styles.planLabel}>Savings Target</Text>
            </View>
            <Text style={[styles.planValue, { color: Colors.secondary }]} numberOfLines={1}>
              {formatCurrency(userProfile?.savings_target || 0)}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.md, marginBottom: Spacing.sm }]}>
          App Preferences
        </Text>

        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={handleReRunOnboarding}>
            <RefreshCw size={20} color={Colors.textPrimary} />
            <Text style={styles.menuText}>Re-run Onboarding Setup Wizard</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy & Legal Disclaimer */}
        <View style={styles.disclaimerCard}>
          <ShieldCheck size={20} color={Colors.primary} />
          <Text style={styles.disclaimerText}>
            This application is a personal budgeting and expense management tool. All financial data is stored locally on your device.
          </Text>
        </View>

        <Text style={styles.versionText}>Daily Money Coach v1.0</Text>
      </ScrollView>

      {/* Edit Plan Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent statusBarTranslucent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kavWrapper}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Monthly Formula</Text>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Monthly Income (₹)</Text>
              <TextInput
                style={styles.modalInput}
                value={incomeInput}
                onChangeText={(t) => setIncomeInput(t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholder="e.g. 60000"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.inputLabel}>Fixed Expenses — Rent, Bills, EMI (₹)</Text>
              <TextInput
                style={styles.modalInput}
                value={fixedInput}
                onChangeText={(t) => setFixedInput(t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholder="e.g. 15000"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.inputLabel}>Monthly Savings Goal (₹)</Text>
              <TextInput
                style={styles.modalInput}
                value={savingsInput}
                onChangeText={(t) => setSavingsInput(t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholder="e.g. 5000"
                placeholderTextColor={Colors.textMuted}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveBtn} onPress={handleUpdatePlan}>
                  <Text style={styles.saveText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    paddingBottom: Spacing.xxl,
  },
  header: {
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginVertical: Spacing.md,
    gap: Spacing.md,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  profileText: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  userSub: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  editButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  editText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: Spacing.lg,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  planLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  planLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  planValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    flexShrink: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: Spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: Spacing.lg,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  versionText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
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
    maxHeight: '85%',
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
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  cancelBtn: {
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
  saveBtn: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
});
