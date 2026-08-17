import { Redirect, useRouter } from 'expo-router';
import {
  Calendar,
  HelpCircle,
  PiggyBank,
  Plus,
  Sparkles,
  Trash2,
  TrendingUp,
  Info,
  Lightbulb,
  ArrowRight,
  TrendingDown,
  Percent,
  CheckCircle2,
  Compass,
  ArrowRightCircle,
  Activity,
  X,
  Flame,
  Award,
  Menu,
  Home,
  User,
  History,
  Target,
  Settings,
  AlertTriangle
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Shadows, Spacing } from '../../src/constants/theme';
import { useFinanceStore } from '../../src/store/useFinanceStore';
import { Expense } from '../../src/types';
import { formatCurrency, isToday, calculateAffordability } from '../../src/utils/calculator';
import { PieChart, LineChart } from 'react-native-gifted-charts';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 3 smart tips matching screenshot 2 Daily Coach suggestions
const SUGGESTIONS = [
  { id: '1', text: "You spent ₹2,350 more on Food this week. Try cooking at home to save more.", type: 'warning' },
  { id: '2', text: "Your savings are good! Keep consistently investing in your future.", type: 'success' },
  { id: '3', text: "Avoid unnecessary subscriptions. You can save up to ₹1,200/month.", type: 'suggestion' }
];

export default function DashboardScreen() {
  const router = useRouter();
  const { userProfile, expenses, getSummary, deleteExpense, loadInitialData, isLoading, updateProfile } =
    useFinanceStore();

  const [askAmount, setAskAmount] = useState('');
  const [askResult, setAskResult] = useState<any>(null);

  // Edit Income/Budget Formula States
  const [formulaModalVisible, setFormulaModalVisible] = useState(false);
  const [incomeInput, setIncomeInput] = useState('');
  const [fixedInput, setFixedInput] = useState('');
  const [savingsInput, setSavingsInput] = useState('');

  // Sidebar navigation visibility state
  const [sidebarVisible, setSidebarVisible] = useState(false);

  if (userProfile && !userProfile.onboarding_completed) {
    return <Redirect href="/(onboarding)" />;
  }

  const summary = getSummary();
  const todayExpenses = expenses.filter((e) => isToday(e.date));

  const currentDateFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const handleDeleteExpense = (id: string, categoryName?: string, amount?: number) => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to remove ${categoryName || 'this expense'} (${formatCurrency(
        amount || 0
      )})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(id) },
      ]
    );
  };

  // Days left helper
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - now.getDate() + 1;
  const daysPct = Math.min(100, Math.round((now.getDate() / daysInMonth) * 100));

  // Derive Essentials vs Lifestyle vs Saved totals
  const essentialsCatIds = ['food', 'transport', 'bills', 'rent', 'emi', 'health', 'education'];
  
  let essentialsTotal = 0;
  let lifestyleTotal = 0;
  
  expenses.forEach(exp => {
    const d = new Date(exp.date);
    if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
      if (essentialsCatIds.includes(exp.category_id)) {
        essentialsTotal += exp.amount;
      } else {
        lifestyleTotal += exp.amount;
      }
    }
  });

  const savedTotal = Math.max(0, summary.totalMonthlyIncome - summary.totalFixedExpenses - summary.totalSpentThisMonth);

  // Safe to Spend circle data
  const dailySpentPct = summary.safeDailyLimit > 0 
    ? Math.max(0, Math.min(100, Math.round((summary.spentToday / summary.safeDailyLimit) * 100))) 
    : 0;

  const currentHour = now.getHours();
  let timeGreeting = "Good morning";
  if (currentHour >= 12 && currentHour < 17) {
    timeGreeting = "Good afternoon";
  } else if (currentHour >= 17) {
    timeGreeting = "Good evening";
  }

  // Create Safe to Spend Donut Ring using standard PieChart
  const circleDonutData = [
    { value: Math.max(1, 100 - dailySpentPct), color: '#0D9488' }, // Teal primary color matching mockup theme
    { value: dailySpentPct, color: '#E5E7EB' },
  ];

  // 7-day spending line chart data calculation
  const getLineChartData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Calculate total spent on this day
      const dayTotal = expenses
        .filter(e => e.date === dateStr)
        .reduce((sum, e) => sum + e.amount, 0);

      last7Days.push({
        value: dayTotal,
        label: dayLabel,
        // Show tooltip values dynamically
        dataPointLabelValue: dayTotal > 0 ? `₹${Math.round(dayTotal)}` : '₹0',
      });
    }
    return last7Days;
  };

  const lineChartData = getLineChartData();

  // Streak Tracker calculation
  const getStreakData = () => {
    let streakCount = 0;
    let rolloverSavings = 0;
    
    // Check historical days (excluding today) where spent was below daily limit
    const discretionaryDailyLimit = summary.safeDailyLimit;
    
    for (let i = 1; i <= 30; i++) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      
      // Skip if the day was in a previous month
      if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) {
        break;
      }
      
      const dateStr = d.toISOString().split('T')[0];
      const dayTotalSpent = expenses
        .filter(e => e.date === dateStr)
        .reduce((sum, e) => sum + e.amount, 0);
        
      if (dayTotalSpent < discretionaryDailyLimit) {
        streakCount++;
        rolloverSavings += (discretionaryDailyLimit - dayTotalSpent);
      } else {
        // Streak broken
        break;
      }
    }
    return { streakCount, rolloverSavings };
  };

  const { streakCount, rolloverSavings } = getStreakData();

  // Quick Affordability calculation
  const handleQuickAsk = () => {
    const amt = parseFloat(askAmount);
    if (isNaN(amt) || amt <= 0) {
      setAskResult(null);
      return;
    }
    const analysis = calculateAffordability({
      purchaseAmount: amt,
      currentSummary: summary
    });
    setAskResult(analysis);
  };

  const handleUpdateFormula = async () => {
    const inc = parseFloat(incomeInput) || 0;
    const fix = parseFloat(fixedInput) || 0;
    const sav = parseFloat(savingsInput) || 0;

    await updateProfile({
      monthly_income: inc,
      fixed_expenses: fix,
      savings_target: sav,
    });

    setFormulaModalVisible(false);
  };

  const handleSidebarNavigate = (route: string) => {
    setSidebarVisible(false);
    router.push(route);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadInitialData}
            tintColor="#0D9488"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Top Profile / Header Bar */}
        <View style={styles.header}>
          <View style={styles.profileArea}>
            <TouchableOpacity 
              style={styles.hamburgerButton}
              onPress={() => setSidebarVisible(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Menu size={24} color="#374151" />
            </TouchableOpacity>

            <LinearGradient
              colors={['#0D9488', '#0F766E']}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {userProfile?.name?.charAt(0).toUpperCase() || 'S'}
              </Text>
            </LinearGradient>
            <View>
              <Text style={styles.greetingText}>{timeGreeting},</Text>
              <Text style={styles.usernameText}>{userProfile?.name || 'User'}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => router.push('/can-i-afford')}
          >
            <Sparkles size={18} color="#0D9488" />
            <Text style={styles.headerActionText}>Ask Coach</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Prompt / Quick Action Bar */}
        <TouchableOpacity 
          style={styles.voicePromptBox} 
          onPress={() => router.push('/add-expense')}
          activeOpacity={0.9}
        >
          <View style={styles.plusCircle}>
            <Plus size={15} color="#0D9488" />
          </View>
          <Text style={styles.promptPlaceholder}>Try "Coffee 120" or "Uber 3..."</Text>
        </TouchableOpacity>

        {/* Month Spending Overview Dashboard Card */}
        <View style={[styles.mainCard, Shadows.card]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderTitle}>
              {now.toLocaleString('default', { month: 'long' }).toUpperCase()} {now.getFullYear()}
            </Text>
            <TouchableOpacity 
              style={styles.badgeLabel}
              onPress={() => {
                setIncomeInput(String(userProfile?.monthly_income || '0'));
                setFixedInput(String(userProfile?.fixed_expenses || '0'));
                setSavingsInput(String(userProfile?.savings_target || '0'));
                setFormulaModalVisible(true);
              }}
            >
              <Text style={styles.badgeText}>+ Update Formula</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.spentAmount}>
            {formatCurrency(summary.totalSpentThisMonth)}
          </Text>
          <Text style={styles.spentAmountSub}>spent this month</Text>

          {/* Month progress line */}
          <View style={styles.barContainer}>
            <View style={[styles.barFill, { width: `${100 - daysPct}%` }]} />
          </View>

          <View style={styles.daysLeftRow}>
            <Text style={styles.daysText}>—</Text>
            <Text style={styles.daysTextBold}>{daysLeft} days left</Text>
          </View>

          <View style={styles.categoriesRow}>
            <View style={styles.catSummaryItem}>
              <Text style={styles.catSummaryLabel}>ESSENTIALS</Text>
              <Text style={[styles.catSummaryValue, { color: '#16A34A' }]}>
                {formatCurrency(essentialsTotal)}
              </Text>
            </View>
            <View style={styles.catSummaryItem}>
              <Text style={styles.catSummaryLabel}>LIFESTYLE</Text>
              <Text style={[styles.catSummaryValue, { color: '#D97706' }]}>
                {formatCurrency(lifestyleTotal)}
              </Text>
            </View>
            <View style={styles.catSummaryItem}>
              <Text style={styles.catSummaryLabel}>SAVED</Text>
              <Text style={[styles.catSummaryValue, { color: '#2563EB' }]}>
                {formatCurrency(savedTotal)}
              </Text>
            </View>
          </View>
        </View>

        {/* Safe to Spend Ring Section */}
        <Text style={styles.sectionLabel}>SAFE TO SPEND</Text>

        <View style={[styles.safeSpendCircleContainer, Shadows.card]}>
          <View style={styles.circleGraphicWrapper}>
            <PieChart
              donut
              data={circleDonutData}
              radius={88}
              innerRadius={76}
            />
            {/* Center Display Overlay */}
            <View style={styles.circleCenter}>
              <Text style={styles.circleLabel}>TODAY'S BUFFER</Text>
              <Text style={styles.circleAmountText} numberOfLines={1} adjustsFontSizeToFit>
                {formatCurrency(summary.remainingToday)}
              </Text>
            </View>
          </View>
        </View>

        {/* Day Rollover Savings Streak Tracker Card */}
        <View style={[styles.mainCard, Shadows.card]}>
          <View style={styles.featureTitleRow}>
            <Flame size={18} color="#FF6B6B" />
            <Text style={styles.featureTitleText}>Daily Rollover Streak</Text>
          </View>
          
          <View style={styles.streakDetailsRow}>
            <View style={styles.streakCountBox}>
              <Text style={styles.streakValue}>{streakCount} days</Text>
              <Text style={styles.streakLabel}>Under-Budget Streak</Text>
            </View>
            
            <View style={styles.verticalDivider} />
            
            <View style={styles.streakCountBox}>
              <Text style={[styles.streakValue, { color: '#0D9488' }]}>
                {formatCurrency(rolloverSavings)}
              </Text>
              <Text style={styles.streakLabel}>Rollover Saved</Text>
            </View>
          </View>

          <View style={styles.streakMessageContainer}>
            <Award size={16} color="#0D9488" />
            <Text style={styles.streakMessage}>
              {streakCount > 0 
                ? `You saved ${formatCurrency(rolloverSavings)} by staying under limit! Keep it up!` 
                : "Spend below your limit today to start your savings rollover streak!"}
            </Text>
          </View>
        </View>

        {/* Trending Feature 4: Interactive Daily Spending Trend Line (Vibrancy-based) */}
        <View style={[styles.mainCard, Shadows.card]}>
          <View style={styles.featureTitleRow}>
            <Activity size={18} color="#0D9488" />
            <Text style={styles.featureTitleText}>Daily Spending Trend (7D)</Text>
          </View>

          <View style={styles.chartWrapper}>
            <LineChart
              data={lineChartData}
              areaChart
              color="#0D9488"
              startFillColor="rgba(13, 148, 136, 0.4)"
              endFillColor="rgba(13, 148, 136, 0.05)"
              thickness={3}
              
              // Correct data points labels configurations
              hideDataPoints={false}
              dataPointsColor="#0D9488"
              dataPointsRadius={4}
              
              // Enable tooltips on top of line chart points
              showValuesAsDataPointsText
              textFontSize={8}
              textColor="#374151"
              textShiftY={-12}
              
              spacing={SCREEN_WIDTH * 0.108}
              initialSpacing={18}
              hideRules
              yAxisThickness={0}
              xAxisColor="#E5E7EB"
              xAxisLabelTextStyle={styles.xAxisLabelStyle}
              rulesType="solid"
              height={120}
              noOfSections={3}
              pointerConfig={{
                pointerStripHeight: 100,
                pointerStripColor: 'lightgray',
                pointerStripWidth: 2,
                pointerColor: '#0D9488',
                radius: 6,
                pointerLabelWidth: 80,
                pointerLabelHeight: 30,
              }}
            />
          </View>
        </View>

        {/* Premium Daily Coach Card matching Mockup screenshot 2 */}
        <View style={[styles.mainCard, Shadows.card]}>
          <View style={styles.coachHeaderRow}>
            <Compass size={20} color="#0D9488" />
            <Text style={styles.coachTitleText}>Daily Coach Advisor</Text>
          </View>

          {/* Today's Tip text box */}
          <View style={styles.tipBoxContainer}>
            <View style={styles.tipTextWrap}>
              <Text style={styles.tipLabelText}>Today's Tip</Text>
              <Text style={styles.tipBodyText}>
                "Small savings today build a big security tomorrow."
              </Text>
            </View>
            <View style={styles.coachImageWrapper}>
              <Image 
                source={require('../../assets/ai_mascot.png')} 
                style={styles.coachMascotImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Dynamic advisor list matching Mockup style */}
          <Text style={styles.sectionDividerLabel}>Suggestions for You</Text>
          <View style={styles.suggestionsList}>
            {SUGGESTIONS.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.suggestionRow}
                onPress={() => router.push('/can-i-afford')}
              >
                <View style={[
                  styles.suggestionIconBox, 
                  { backgroundColor: item.type === 'warning' ? '#FEF3C7' : item.type === 'success' ? '#E8F5E9' : '#EFF6FF' }
                ]}>
                  <Text style={styles.suggestionDotIcon}>
                    {item.type === 'warning' ? '⚠️' : item.type === 'success' ? '✅' : '💡'}
                  </Text>
                </View>
                <Text style={styles.suggestionText} numberOfLines={2}>{item.text}</Text>
                <ArrowRight size={16} color="#6B7280" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Keep Going card footer */}
          <View style={styles.keepGoingBox}>
            <View style={styles.keepGoingLeft}>
              <Text style={styles.keepGoingTitle}>Keep Going! 💪</Text>
              <Text style={styles.keepGoingDesc}>You're making great progress towards your financial freedom.</Text>
            </View>
            <Text style={styles.chartEmoji}>📈</Text>
          </View>
        </View>

        {/* Feature 1: Can I Afford This Quick Check Card */}
        <View style={[styles.mainCard, Shadows.card]}>
          <View style={styles.featureTitleRow}>
            <HelpCircle size={18} color="#0D9488" />
            <Text style={styles.featureTitleText}>Can I Afford This? Checker</Text>
          </View>
          <View style={styles.quickAskRow}>
            <TextInput
              style={styles.quickAskInput}
              placeholder="Enter price e.g. 5000"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
              value={askAmount}
              onChangeText={(text) => {
                setAskAmount(text);
                if (!text) setAskResult(null);
              }}
            />
            <TouchableOpacity style={styles.quickAskBtn} onPress={handleQuickAsk}>
              <Text style={styles.quickAskBtnText}>Check</Text>
            </TouchableOpacity>
          </View>

          {askResult && (
            <View style={[
              styles.quickAskResultBox,
              { backgroundColor: askResult.severity === 'safe' ? '#E8F5E9' : askResult.severity === 'caution' ? '#FEF3C7' : '#FEE2E2' }
            ]}>
              <Text style={[styles.resultTitleText, { color: askResult.severity === 'safe' ? '#16A34A' : askResult.severity === 'caution' ? '#D97706' : Colors.danger }]}>
                {askResult.title}
              </Text>
              <Text style={styles.resultDescText}>{askResult.description}</Text>
            </View>
          )}
        </View>

        {/* Transactions / Activity Feed */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitleText}>Today's Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
              <Text style={styles.viewAllText}>Manage All</Text>
            </TouchableOpacity>
          </View>

          {todayExpenses.length === 0 ? (
            <View style={styles.emptyActivityCard}>
              <TrendingUp size={24} color={Colors.textMuted} />
              <Text style={styles.emptyActivityText}>No transactions recorded today.</Text>
            </View>
          ) : (
            todayExpenses.map((exp) => {
              const isEssential = essentialsCatIds.includes(exp.category_id);
              return (
                <View key={exp.id} style={styles.transactionCard}>
                  <View style={styles.transLeft}>
                    <View style={[styles.transBadge, { backgroundColor: exp.category_color || Colors.primary }]}>
                      <Text style={styles.transBadgeText}>
                        {exp.category_name?.charAt(0).toUpperCase() || 'E'}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.transTitle} numberOfLines={1}>{exp.note || exp.category_name}</Text>
                      <Text style={styles.transSub}>
                        {exp.category_name} • <Text style={{ color: isEssential ? '#16A34A' : '#D97706', fontWeight: '600' }}>{isEssential ? 'Essentials' : 'Lifestyle'}</Text>
                      </Text>
                    </View>
                  </View>
                  <View style={styles.transRight}>
                    <Text style={styles.transAmount}>-{formatCurrency(exp.amount)}</Text>
                    <TouchableOpacity 
                      onPress={() => handleDeleteExpense(exp.id, exp.category_name, exp.amount)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Trash2 size={13} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Sidebar / Hamburger Modal Drawer */}
      <Modal
        visible={sidebarVisible}
        animationType="none"
        transparent
        onRequestClose={() => setSidebarVisible(false)}
      >
        <View style={styles.sidebarOverlay}>
          <LinearGradient
            colors={['#111827', '#1F2937']} // Dark premium gradient background
            style={styles.sidebarDrawer}
          >
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarBrandTitle}>Daily Money Coach</Text>
              <TouchableOpacity onPress={() => setSidebarVisible(false)}>
                <X size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.sidebarProfileArea}>
              <View style={styles.sidebarAvatar}>
                <Text style={styles.sidebarAvatarText}>
                  {userProfile?.name?.charAt(0).toUpperCase() || 'S'}
                </Text>
              </View>
              <Text style={styles.sidebarNameText}>{userProfile?.name || 'User'}</Text>
              <Text style={styles.sidebarFormulaText}>
                Income: {formatCurrency(userProfile?.monthly_income || 0)}
              </Text>
            </View>

            <View style={styles.sidebarDivider} />

            {/* Sidebar Routes Options */}
            <View style={styles.sidebarMenu}>
              <TouchableOpacity 
                style={styles.sidebarMenuItem} 
                onPress={() => handleSidebarNavigate('/(tabs)')}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(13, 148, 136, 0.15)' }]}>
                  <Home size={18} color="#0D9488" />
                </View>
                <Text style={styles.sidebarMenuText}>Dashboard Home</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.sidebarMenuItem} 
                onPress={() => handleSidebarNavigate('/(tabs)/history')}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <History size={18} color="#3B82F6" />
                </View>
                <Text style={styles.sidebarMenuText}>All Transactions</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.sidebarMenuItem} 
                onPress={() => handleSidebarNavigate('/(tabs)/goals')}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Target size={18} color="#EF4444" />
                </View>
                <Text style={styles.sidebarMenuText}>Savings Goals</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.sidebarMenuItem} 
                onPress={() => handleSidebarNavigate('/(tabs)/profile')}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Settings size={18} color="#F59E0B" />
                </View>
                <Text style={styles.sidebarMenuText}>Formula Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.sidebarMenuItem} 
                onPress={() => handleSidebarNavigate('/can-i-afford')}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Sparkles size={18} color="#10B981" />
                </View>
                <Text style={styles.sidebarMenuText}>Can I Afford This?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sidebarFooter}>
              <Text style={styles.sidebarFooterText}>Offline Local Storage</Text>
              <Text style={styles.sidebarVersionText}>v1.1 Premium Edition</Text>
            </View>
          </LinearGradient>
          <TouchableOpacity 
            style={styles.sidebarDismissBackdrop} 
            activeOpacity={1}
            onPress={() => setSidebarVisible(false)}
          />
        </View>
      </Modal>

      {/* Edit Formula Inline Modal */}
      <Modal visible={formulaModalVisible} animationType="slide" transparent statusBarTranslucent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kavWrapper}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setFormulaModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Monthly Formula</Text>
              <TouchableOpacity onPress={() => setFormulaModalVisible(false)}>
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

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
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setFormulaModalVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateFormula}>
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
    paddingBottom: 110, // extra padding so content doesn't hide behind floating menu strip
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  profileArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  hamburgerButton: {
    paddingRight: 6,
  },
  avatarGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  greetingText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  usernameText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    gap: 4,
  },
  headerActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D9488',
  },
  voicePromptBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: Spacing.md,
  },
  plusCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  promptPlaceholder: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 1.2,
  },
  badgeLabel: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#137333',
  },
  spentAmount: {
    fontSize: 38,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  spentAmountSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: Spacing.md,
  },
  barContainer: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#0D9488',
    borderRadius: 3,
  },
  daysLeftRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  daysText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  daysTextBold: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: Spacing.md,
  },
  catSummaryItem: {
    flex: 1,
  },
  catSummaryLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  catSummaryValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  safeSpendCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  circleGraphicWrapper: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circleCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  circleAmountText: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.textDark,
    marginVertical: 4,
  },
  // Coach specific styles matching Mockup screenshot 2
  coachHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  coachTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  tipBoxContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  tipTextWrap: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  tipLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  tipBodyText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
    lineHeight: 18,
  },
  coachImageWrapper: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coachMascotImage: {
    width: 64,
    height: 64,
  },
  sectionDividerLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    marginVertical: Spacing.sm,
  },
  suggestionsList: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  suggestionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionDotIcon: {
    fontSize: 14,
  },
  suggestionText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '600',
    lineHeight: 18,
  },
  keepGoingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  keepGoingLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  keepGoingTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  keepGoingDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  chartEmoji: {
    fontSize: 32,
  },
  // Feature layout styles
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  featureTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  quickAskRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickAskInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  quickAskBtn: {
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  quickAskBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  quickAskResultBox: {
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  resultTitleText: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  resultDescText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  transactionsSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  viewAllText: {
    fontSize: 13,
    color: '#0D9488',
    fontWeight: '700',
  },
  emptyActivityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptyActivityText: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: Spacing.xs,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  transLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  transBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transBadgeText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  transTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  transSub: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  transRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  transAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  chartWrapper: {
    paddingRight: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  xAxisLabelStyle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7280',
  },
  // Modal layout styling
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
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
    backgroundColor: '#0D9488',
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
  // Streak widget styles
  streakDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    backgroundColor: '#FAF5FF',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: '#F3E8FF',
  },
  streakCountBox: {
    flex: 1,
    alignItems: 'center',
  },
  verticalDivider: {
    width: 1.5,
    height: 38,
    backgroundColor: '#E9D5FF',
  },
  streakValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#9333EA',
  },
  streakLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  streakMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.sm,
    backgroundColor: '#E6F4EA',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#CEEAD6',
  },
  streakMessage: {
    fontSize: 11,
    color: '#137333',
    fontWeight: '700',
    flex: 1,
  },
  // Sidebar styling
  sidebarOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarDismissBackdrop: {
    width: SCREEN_WIDTH * 0.35, // reduced width so backdrop matches larger drawer
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sidebarDrawer: {
    width: SCREEN_WIDTH * 0.65, // reduced drawer width from 75% to 65%
    height: '100%',
    padding: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    elevation: 20,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  sidebarBrandTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0D9488',
  },
  sidebarProfileArea: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  sidebarAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sidebarAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  sidebarNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF', // White text on dark drawer
  },
  sidebarFormulaText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '600',
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: '#374151', // Darker divider line
    marginVertical: Spacing.md,
  },
  sidebarMenu: {
    flex: 1,
    gap: Spacing.xs,
  },
  sidebarMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  sidebarMenuText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E5E7EB', // lighter text color for contrast
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: Spacing.md,
    alignItems: 'center',
  },
  sidebarFooterText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  sidebarVersionText: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 2,
  },
});
