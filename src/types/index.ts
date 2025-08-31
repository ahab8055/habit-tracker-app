// User types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Habit types
export interface Habit {
  id: string;
  userId: string;
  title: string;
  icon: string;
  reminderTime?: string; // ISO string format
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  streak: number;
  bestStreak: number;
  totalCheckIns: number;
}

// Check-in types
export interface CheckIn {
  id: string;
  habitId: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  timestamp: Date;
  createdAt: Date;
}

// Theme types
export interface Theme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export type ThemeMode = 'light' | 'dark';

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  HabitCreation: { habitId?: string };
  Settings: undefined;
  Premium: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Habits: undefined;
  Statistics: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// State types
export interface AppState {
  user: User | null;
  habits: Habit[];
  checkIns: CheckIn[];
  isLoading: boolean;
  theme: ThemeMode;
  isOnline: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Subscription types
export interface SubscriptionInfo {
  isActive: boolean;
  productId: string;
  purchaseDate?: Date;
  expirationDate?: Date;
}

// Notification types
export interface NotificationConfig {
  habitId: string;
  title: string;
  body: string;
  time: string; // HH:mm format
  enabled: boolean;
}