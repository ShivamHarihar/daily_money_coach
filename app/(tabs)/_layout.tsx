import { Tabs } from 'expo-router';
import { History, Home, PieChart, Target, User } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  // Bottom padding inside the tab bar:
  // iOS home indicator  → insets.bottom (34px on notch phones, 0 on older ones)
  // Android 3-btn nav   → insets.bottom (~24-48px)
  // Android gesture nav → insets.bottom (~16-24px)  
  // Android no nav      → insets.bottom = 0 → use 4px minimum
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'android' ? 4 : 0);

  // Total bar height = icon+label zone (52px) + system nav spacing
  const tabBarHeight = 52 + bottomPad;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.cardBackground,
          borderTopColor: Colors.cardBorder,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: bottomPad,
          paddingTop: 6,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Budget',
          tabBarIcon: ({ color, size }) => <PieChart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color, size }) => <Target size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <History size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabBarItem: {
    paddingTop: 4,
  },
});
