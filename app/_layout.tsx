import { Stack, useRootNavigationState, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../src/constants/theme';
import { useFinanceStore } from '../src/store/useFinanceStore';

// Set Android navigation bar color to match the tab bar background
if (Platform.OS === 'android') {
  SystemUI.setBackgroundColorAsync(Colors.cardBackground);
}

export default function RootLayout() {
  const { loadInitialData, isLoading, isInitialized, userProfile } = useFinanceStore();
  const router = useRouter();
  // useRootNavigationState tells us when the navigator is actually mounted
  const navigationState = useRootNavigationState();
  const hasRedirected = useRef(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Wait for BOTH the navigation context AND data to be ready before redirecting.
  // Without checking navigationState?.key, router.replace() fires before the
  // Stack navigator is mounted → "ContextNavigator" error.
  useEffect(() => {
    if (
      !navigationState?.key ||   // navigator not mounted yet
      !isInitialized ||          // DB data not loaded yet
      isLoading ||               // still loading
      hasRedirected.current      // already redirected
    ) {
      return;
    }

    hasRedirected.current = true;

    if (userProfile?.onboarding_completed) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(onboarding)');
    }
  }, [navigationState?.key, isInitialized, isLoading]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={Colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-expense"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="can-i-afford"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            headerShown: false,
          }}
        />
      </Stack>

      {/* Loading overlay — shown on top of the Stack while data loads */}
      {(!isInitialized || isLoading) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
