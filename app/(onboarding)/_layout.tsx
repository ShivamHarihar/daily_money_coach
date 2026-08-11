import { Stack } from 'expo-router';
import React from 'react';
import { Colors } from '../../src/constants/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="income" />
      <Stack.Screen name="fixed-expenses" />
      <Stack.Screen name="savings" />
      <Stack.Screen name="summary" />
    </Stack>
  );
}
