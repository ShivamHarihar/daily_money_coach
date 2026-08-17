import { Search, Trash2, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react-native';
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
import { Expense } from '../../src/types';

export default function HistoryScreen() {
  const { expenses, deleteExpense } = useFinanceStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Essentials vs Lifestyle classification configuration
  const essentialsCatIds = ['food', 'transport', 'bills', 'rent', 'emi', 'health', 'education'];

  const filteredExpenses = expenses.filter((exp) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      exp.category_name?.toLowerCase().includes(query) ||
      exp.note?.toLowerCase().includes(query) ||
      exp.payment_method?.toLowerCase().includes(query)
    );
  });

  // Calculate stats for current month
  const now = new Date();
  let essentialsTotal = 0;
  let lifestyleTotal = 0;

  filteredExpenses.forEach(exp => {
    const d = new Date(exp.date);
    if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
      if (essentialsCatIds.includes(exp.category_id)) {
        essentialsTotal += exp.amount;
      } else {
        lifestyleTotal += exp.amount;
      }
    }
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

  // Grouping by Date string
  const groupedData: { title: string; data: Expense[]; total: number }[] = [];
  filteredExpenses.forEach(exp => {
    const dateStr = exp.date; // YYYY-MM-DD
    const match = groupedData.find(g => g.title === dateStr);
    if (match) {
      match.data.push(exp);
      match.total += exp.amount;
    } else {
      groupedData.push({ title: dateStr, data: [exp], total: exp.amount });
    }
  });

  // Sort grouped dates descending
  groupedData.sort((a, b) => b.title.localeCompare(a.title));

  const formatGroupHeader = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'TODAY';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'YESTERDAY';
    } else {
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' }).toUpperCase();
    }
  };

  const ListHeader = (
    <View style={styles.header}>
      <Text style={styles.title}>Transactions</Text>
      <Text style={styles.subtitle}>
        {filteredExpenses.length} transactions • {now.toLocaleString('default', { month: 'long' })} {now.getFullYear()}
      </Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search transactions..."
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      {/* Type Row indicators from Screenshot 4 */}
      <View style={styles.typeStatsRow}>
        <View style={styles.typeStatBox}>
          <Text style={[styles.typeIndicatorDot, { color: Colors.essentials }]}>● Essentials</Text>
          <Text style={[styles.typeStatValue, { color: Colors.essentials }]}>{formatCurrency(essentialsTotal)}</Text>
        </View>
        <View style={styles.typeStatBox}>
          <Text style={[styles.typeIndicatorDot, { color: Colors.lifestyle }]}>● Lifestyle</Text>
          <Text style={[styles.typeStatValue, { color: Colors.lifestyle }]}>{formatCurrency(lifestyleTotal)}</Text>
        </View>
        <View style={styles.typeStatBox}>
          <Text style={[styles.typeIndicatorDot, { color: Colors.savings }]}>● Savings</Text>
          <Text style={[styles.typeStatValue, { color: Colors.savings }]}>{formatCurrency(0)}</Text>
        </View>
      </View>
    </View>
  );

  // Prepare flat layout list with headers injected
  const flatItemsList: any[] = [];
  groupedData.forEach(group => {
    flatItemsList.push({ type: 'header', title: formatGroupHeader(group.title), total: group.total });
    group.data.forEach(item => {
      flatItemsList.push({ type: 'item', ...item });
    });
  });

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={flatItemsList}
        keyExtractor={(item, index) => item.type === 'header' ? `h-${item.title}-${index}` : item.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No transactions found</Text>
            <Text style={styles.emptySub}>
              {searchQuery ? 'Try another query' : 'Start logging items!'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <View style={styles.groupHeaderRow}>
                <Text style={styles.groupHeaderText}>{item.title}</Text>
                <Text style={styles.groupHeaderTotal}>{formatCurrency(item.total)}</Text>
              </View>
            );
          }

          const isEssential = essentialsCatIds.includes(item.category_id);

          return (
            <View style={styles.expenseRow}>
              <View style={styles.transLeft}>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: item.category_color || Colors.primary },
                  ]}
                >
                  <Text style={styles.categoryBadgeText}>
                    {item.category_name?.charAt(0).toUpperCase() || 'E'}
                  </Text>
                </View>

                <View style={styles.expenseDetails}>
                  <Text style={styles.expenseCategory} numberOfLines={1}>
                    {item.note || item.category_name}
                  </Text>
                  <View style={styles.tagRow}>
                    <Text style={styles.tagLabel}>{item.category_name}</Text>
                    <View style={styles.tagDotSeparator} />
                    <Text style={[styles.typeBadgeTag, { color: isEssential ? Colors.essentials : Colors.lifestyle }]}>
                      {isEssential ? 'Essentials' : 'Lifestyle'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.amountGroup}>
                <Text style={styles.expenseAmount}>-{formatCurrency(item.amount)}</Text>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id, item.category_name, item.amount)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Trash2 size={14} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
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
    marginBottom: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    borderColor: '#F3F4F6',
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  typeStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    paddingVertical: 12,
    paddingHorizontal: Spacing.sm,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: Spacing.md,
  },
  typeStatBox: {
    alignItems: 'center',
  },
  typeIndicatorDot: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  typeStatValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  groupHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  groupHeaderTotal: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  transLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  categoryBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  categoryBadgeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  expenseDetails: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  tagLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  tagDotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textMuted,
    marginHorizontal: 6,
  },
  typeBadgeTag: {
    fontSize: 11,
    fontWeight: '700',
  },
  amountGroup: {
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptyContainer: {
    paddingTop: Spacing.xxl,
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
