import { Stack, useRootNavigationState, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../src/constants/theme';
import { useFinanceStore } from '../src/store/useFinanceStore';

// Set Android navigation bar color to match the tab bar background (White)
if (Platform.OS === 'android') {
  SystemUI.setBackgroundColorAsync('#FFFFFF');
}

export default function RootLayout() {
  const { loadInitialData, isLoading, isInitialized, userProfile } = useFinanceStore();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const hasRedirected = useRef(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (
      !navigationState?.key ||
      !isInitialized ||
      isLoading ||
      hasRedirected.current
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
      {/* Dark status bar content for light background */}
      <StatusBar style="dark" {...({ backgroundColor: Colors.background } as any)} />
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

      {/* Loading overlay */}
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
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
