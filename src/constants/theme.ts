import { Category } from '../types';

export const Colors = {
  // Brand Primary
  primary: '#10B981', // Emerald 500 - Safe/Growth Green
  primaryDark: '#059669', // Emerald 600
  primaryLight: '#D1FAE5', // Emerald 100
  primarySubtle: 'rgba(16, 185, 129, 0.12)',

  // Secondary & Accents
  secondary: '#6366F1', // Indigo 500 - Trust / Analytics
  secondaryLight: '#EEF2FF',
  accent: '#F59E0B', // Amber 500 - Caution / Warnings

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#3B82F6',

  // Dark Theme Neutral Hierarchy
  background: '#0B0F17', // Deep obsidian slate
  cardBackground: '#161F2E', // Sleek card background
  cardBorder: '#233044', // Subtle border
  surfaceHover: '#1E2B3E',

  // Text Colors
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textDark: '#0F172A',

  // Light Mode Overrides (for adaptable components)
  lightBackground: '#F8FAFC',
  lightCard: '#FFFFFF',
  lightBorder: '#E2E8F0',
};

export const DefaultCategories: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: 'utensils', color: '#F59E0B', type: 'expense' },
  { id: 'transport', name: 'Transport', icon: 'car', color: '#3B82F6', type: 'expense' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping-bag', color: '#EC4899', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', icon: 'film', color: '#8B5CF6', type: 'expense' },
  { id: 'bills', name: 'Bills & Utilities', icon: 'file-text', color: '#EF4444', type: 'expense' },
  { id: 'rent', name: 'Rent & Housing', icon: 'home', color: '#10B981', type: 'expense' },
  { id: 'emi', name: 'EMI & Loans', icon: 'credit-card', color: '#6366F1', type: 'expense' },
  { id: 'health', name: 'Health & Medical', icon: 'heart-pulse', color: '#14B8A6', type: 'expense' },
  { id: 'subscriptions', name: 'Subscriptions', icon: 'tv', color: '#A855F7', type: 'expense' },
  { id: 'travel', name: 'Travel & Vacations', icon: 'plane', color: '#06B6D4', type: 'expense' },
  { id: 'education', name: 'Education', icon: 'graduation-cap', color: '#F97316', type: 'expense' },
  { id: 'other', name: 'Other Expenses', icon: 'more-horizontal', color: '#64748B', type: 'expense' },
];

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  full: 9999,
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  glowGreen: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
};
