import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { RootStackParamList, MainTabParamList, AuthStackParamList } from '../types';
import { useApp } from '../contexts/AppContext';

// Import screens (we'll create these next)
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import DashboardScreen from '../screens/main/DashboardScreen';
import HabitsScreen from '../screens/main/HabitsScreen';
import StatisticsScreen from '../screens/main/StatisticsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import HabitCreationScreen from '../screens/main/HabitCreationScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import PremiumScreen from '../screens/settings/PremiumScreen';

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

const MainNavigator = () => {
  const { getCurrentTheme } = useApp();
  const theme = getCurrentTheme();

  return (
    <MainTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
      }}
    >
      <MainTab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <MainTab.Screen 
        name="Habits" 
        component={HabitsScreen}
        options={{
          tabBarLabel: 'Habits',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📝</Text>,
        }}
      />
      <MainTab.Screen 
        name="Statistics" 
        component={StatisticsScreen}
        options={{
          tabBarLabel: 'Stats',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📊</Text>,
        }}
      />
      <MainTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
        }}
      />
    </MainTab.Navigator>
  );
};

const AppNavigator = () => {
  const { user } = useApp();

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <RootStack.Screen name="Main" component={MainNavigator} />
            <RootStack.Screen name="HabitCreation" component={HabitCreationScreen} />
            <RootStack.Screen name="Settings" component={SettingsScreen} />
            <RootStack.Screen name="Premium" component={PremiumScreen} />
          </>
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;