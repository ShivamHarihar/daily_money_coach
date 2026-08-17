import { Tabs } from 'expo-router';
import { History, Home, PieChart, Target, User, Plus } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  // Premium floating layout configuration
  // Showing exactly 5 options: Home, List, Add (floating custom button), Goals, More
  const bottomPad = Math.max(insets.bottom, 12);
  const tabBarHeight = 62 + bottomPad;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: bottomPad,
          paddingTop: 8,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          elevation: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: '#0D9488', // Green-Teal active tint color matching mockup theme
        tabBarInactiveTintColor: '#6B7280', // Slate gray
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color }) => <History size={20} color={color} />,
        }}
      />
      {/* Floating Center button to add expense */}
      <Tabs.Screen
        name="add-action"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={styles.floatingCenterBtn}>
              <Plus size={24} color="#FFFFFF" />
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('add-expense');
          },
        })}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color }) => <Target size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={20} color={color} />,
        }}
      />
      {/* Hide stats page from bottom bar */}
      <Tabs.Screen
        name="budget"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  tabBarItem: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  floatingCenterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0D9488', // Premium Teal background
    justifyContent: 'center',
    alignItems: 'center',
    top: -10, // pull button upwards
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
