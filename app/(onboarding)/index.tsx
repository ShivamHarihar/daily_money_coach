import { useRouter } from 'expo-router';
import { ArrowRight, ShieldCheck, Sparkles, Target, Wallet } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing } from '../../src/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Hero Icon */}
        <View style={styles.heroBadge}>
          <Wallet size={48} color={Colors.primary} />
        </View>

        <Text style={styles.appName}>Daily Money Coach</Text>
        <Text style={styles.tagline}>"Know what you can safely spend today."</Text>

        <Text style={styles.description}>
          Don't just track your past spending. Transform your monthly income into a simple daily safe limit and build financial freedom.
        </Text>

        {/* Feature Pill Highlights */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.iconCircle}>
              <Sparkles size={20} color={Colors.primary} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Daily Safe Spend</Text>
              <Text style={styles.featureSub}>Instant clarity on how much you can spend today</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.iconCircle}>
              <Target size={20} color={Colors.secondary} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Can I Afford This?</Text>
              <Text style={styles.featureSub}>Real-time financial impact for purchases</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.iconCircle}>
              <ShieldCheck size={20} color={Colors.primary} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>100% Private & Offline</Text>
              <Text style={styles.featureSub}>No account required. Your data stays on your phone.</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(onboarding)/income')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <ArrowRight size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>Step 1 of 5</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  heroBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  featuresContainer: {
    width: '100%',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceHover,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  featureSub: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  footer: {
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
    alignItems: 'center',
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
  stepIndicator: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
});
