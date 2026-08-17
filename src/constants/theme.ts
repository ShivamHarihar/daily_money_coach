import { Category } from '../types';

export const Colors = {
  // Brand Primary (Blue Accent from screenshots)
  primary: '#2563EB', // Blue 600
  primaryDark: '#1D4ED8', // Blue 700
  primaryLight: '#DBEAFE', // Blue 100
  primarySubtle: 'rgba(37, 99, 235, 0.1)',

  // Secondary & Accents
  secondary: '#3B82F6', // Blue 500
  secondaryLight: '#EFF6FF',
  accent: '#F59E0B', // Amber 500

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#3B82F6',

  // Light Theme Neutral Hierarchy
  background: '#E8F2F0', // Soft premium teal-mint theme background
  cardBackground: '#FFFFFF', // Clean white card background
  cardBorder: '#E5E7EB', // Subtle light gray border
  surfaceHover: '#F9FAFB', // Light gray hover

  // Text Colors
  textPrimary: '#111827', // Near black text
  textSecondary: '#4B5563', // Gray 600
  textMuted: '#9CA3AF', // Gray 400
  textDark: '#111827',

  // Types color classification
  essentials: '#16A34A', // Green 600
  lifestyle: '#D97706', // Amber 600
  savings: '#2563EB', // Blue 600 (used for Saved)
};

export const DefaultCategories: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: 'utensils', color: '#16A34A', type: 'expense' }, // Essentials
  { id: 'transport', name: 'Transport', icon: 'car', color: '#16A34A', type: 'expense' }, // Essentials
  { id: 'shopping', name: 'Shopping', icon: 'shopping-bag', color: '#D97706', type: 'expense' }, // Lifestyle
  { id: 'entertainment', name: 'Entertainment', icon: 'film', color: '#D97706', type: 'expense' }, // Lifestyle
  { id: 'bills', name: 'Bills & Utilities', icon: 'file-text', color: '#16A34A', type: 'expense' }, // Essentials
  { id: 'rent', name: 'Rent & Housing', icon: 'home', color: '#16A34A', type: 'expense' }, // Essentials
  { id: 'emi', name: 'EMI & Loans', icon: 'credit-card', color: '#16A34A', type: 'expense' }, // Essentials
  { id: 'health', name: 'Health & Medical', icon: 'heart-pulse', color: '#16A34A', type: 'expense' }, // Essentials
  { id: 'subscriptions', name: 'Subscriptions', icon: 'tv', color: '#D97706', type: 'expense' }, // Lifestyle
  { id: 'travel', name: 'Travel & Vacations', icon: 'plane', color: '#D97706', type: 'expense' }, // Lifestyle
  { id: 'education', name: 'Education', icon: 'graduation-cap', color: '#16A34A', type: 'expense' }, // Essentials
  { id: 'other', name: 'Other Expenses', icon: 'more-horizontal', color: '#D97706', type: 'expense' }, // Lifestyle
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  glowGreen: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
};
