import { Theme } from '../types';

export const lightTheme: Theme = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
};

export const darkTheme: Theme = {
  primary: '#818cf8',
  secondary: '#a78bfa',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  border: '#334155',
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
};

export const premiumThemes = {
  ocean: {
    ...lightTheme,
    primary: '#0ea5e9',
    secondary: '#06b6d4',
  },
  sunset: {
    ...lightTheme,
    primary: '#f97316',
    secondary: '#f59e0b',
  },
  forest: {
    ...lightTheme,
    primary: '#059669',
    secondary: '#10b981',
  },
  royal: {
    ...darkTheme,
    primary: '#7c3aed',
    secondary: '#8b5cf6',
  },
};