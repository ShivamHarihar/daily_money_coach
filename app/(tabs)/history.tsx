import { Search, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
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

export default function HistoryScreen() {
  const { expenses, deleteExpense } = useFinanceStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExpenses = expenses.filter((exp) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      exp.category_name?.toLowerCase().includes(query) ||
      exp.note?.toLowerCase().includes(query) ||
      exp.payment_method?.toLowerCase().includes(query)
    );
  });

  const handleDelete = (id: string, category?: string, amount?: number) => {
    Alert.alert(
      'Delete Expense',
      `Delete ${category || 'expense'} (${formatCurrency(amount || 0)})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(id) },
      ]
    );
  };

  // Header rendered inside FlatList so it scrolls together and keyboard avoidance works
  const ListHeader = (
    <View style={styles.header}>
      <Text style={styles.title}>Expense History</Text>
      <Text style={styles.subtitle}>
        All transactions logged locally ({expenses.length} total).
      </Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search category, note or payment..."
          placeholderTextColor={Colors.textMuted}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {filteredExpenses.length === 0 ? (
        // Show header + empty state together in a single scroll container
        <FlatList
          data={[]}
          keyExtractor={() => 'empty'}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No expenses found</Text>
              <Text style={styles.emptySub}>
                {searchQuery
                  ? 'Try searching with a different term'
                  : 'Start logging expenses to build your history!'}
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <View style={styles.expenseRow}>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: item.category_color || Colors.primary },
                ]}
              >
                <Text style={styles.categoryBadgeText}>
                  {item.category_name?.charAt(0) || 'E'}
                </Text>
              </View>

              <View style={styles.expenseDetails}>
                <Text style={styles.expenseCategory} numberOfLines={1}>{item.category_name}</Text>
                {item.note ? <Text style={styles.expenseNote} numberOfLines={1}>{item.note}</Text> : null}
                <Text style={styles.expenseDate}>
                  {item.date} • {item.payment_method}
                </Text>
              </View>

              <View style={styles.amountGroup}>
                <Text style={styles.expenseAmount}>-{formatCurrency(item.amount)}</Text>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id, item.category_name, item.amount)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Trash2 size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
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
    marginBottom: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    borderColor: Colors.cardBorder,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  categoryBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    flexShrink: 0,
  },
  categoryBadgeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  expenseDetails: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  expenseCategory: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  expenseNote: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  expenseDate: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  amountGroup: {
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.danger,
  },
  emptyContainer: {
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
