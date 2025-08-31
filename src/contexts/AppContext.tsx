import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Habit, CheckIn, ThemeMode, AppState } from '../types';
import { lightTheme, darkTheme } from '../utils/theme';

interface AppContextType extends AppState {
  setUser: (user: User | null) => void;
  setHabits: (habits: Habit[]) => void;
  addHabit: (habit: Habit) => void;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (habitId: string) => void;
  addCheckIn: (checkIn: CheckIn) => void;
  setTheme: (theme: ThemeMode) => void;
  setLoading: (loading: boolean) => void;
  setOnline: (online: boolean) => void;
  getCurrentTheme: () => any;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_HABITS'; payload: Habit[] }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'ADD_CHECK_IN'; payload: CheckIn }
  | { type: 'SET_THEME'; payload: ThemeMode }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ONLINE'; payload: boolean };

const initialState: AppState = {
  user: null,
  habits: [],
  checkIns: [],
  isLoading: false,
  theme: 'light',
  isOnline: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_HABITS':
      return { ...state, habits: action.payload };
    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.payload] };
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(habit =>
          habit.id === action.payload.id ? action.payload : habit,
        ),
      };
    case 'DELETE_HABIT':
      return {
        ...state,
        habits: state.habits.filter(habit => habit.id !== action.payload),
      };
    case 'ADD_CHECK_IN':
      return { ...state, checkIns: [...state.checkIns, action.payload] };
    case 'SET_THEME':
      AsyncStorage.setItem('theme', action.payload);
      return { ...state, theme: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ONLINE':
      return { ...state, isOnline: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Load theme from storage on app start
    AsyncStorage.getItem('theme').then(savedTheme => {
      if (savedTheme === 'light' || savedTheme === 'dark') {
        dispatch({ type: 'SET_THEME', payload: savedTheme });
      }
    });
  }, []);

  const contextValue: AppContextType = {
    ...state,
    setUser: (user: User | null) => dispatch({ type: 'SET_USER', payload: user }),
    setHabits: (habits: Habit[]) => dispatch({ type: 'SET_HABITS', payload: habits }),
    addHabit: (habit: Habit) => dispatch({ type: 'ADD_HABIT', payload: habit }),
    updateHabit: (habit: Habit) => dispatch({ type: 'UPDATE_HABIT', payload: habit }),
    deleteHabit: (habitId: string) => dispatch({ type: 'DELETE_HABIT', payload: habitId }),
    addCheckIn: (checkIn: CheckIn) => dispatch({ type: 'ADD_CHECK_IN', payload: checkIn }),
    setTheme: (theme: ThemeMode) => dispatch({ type: 'SET_THEME', payload: theme }),
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setOnline: (online: boolean) => dispatch({ type: 'SET_ONLINE', payload: online }),
    getCurrentTheme: () => (state.theme === 'light' ? lightTheme : darkTheme),
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};