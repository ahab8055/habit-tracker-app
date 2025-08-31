import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../contexts/AppContext';
import { CheckIn } from '../../types';
import HabitCard from '../../components/habit/HabitCard';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import FirebaseService from '../../services/firebase.service';
import { getGreeting, getRandomMotivationalQuote, formatDate } from '../../utils/helpers';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { 
    user, 
    habits, 
    setHabits, 
    checkIns,
    addCheckIn,
    getCurrentTheme, 
    isLoading,
    setLoading 
  } = useApp();
  const theme = getCurrentTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [quote] = useState(getRandomMotivationalQuote());

  useEffect(() => {
    if (user) {
      loadHabits();
    }
  }, [user, loadHabits]);

  const loadHabits = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userHabits = await FirebaseService.getUserHabits(user.uid);
      setHabits(userHabits);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  }, [user, setHabits, setLoading]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHabits();
    setRefreshing(false);
  };

  const handleCheckIn = async (habitId: string) => {
    if (!user) return;

    const today = formatDate(new Date());
    const existingCheckIn = checkIns.find(
      checkIn => checkIn.habitId === habitId && checkIn.date === today
    );

    if (existingCheckIn) return; // Already checked in today

    try {
      const checkInData = {
        habitId,
        userId: user.uid,
        date: today,
        timestamp: new Date(),
        createdAt: new Date(),
      };

      const result = await FirebaseService.createCheckIn(checkInData);
      if (result.success && result.data) {
        addCheckIn({
          ...checkInData,
          id: result.data,
        });

        // Update habit streak
        const habit = habits.find(h => h.id === habitId);
        if (habit) {
          const updatedHabit = {
            ...habit,
            streak: habit.streak + 1,
            bestStreak: Math.max(habit.bestStreak, habit.streak + 1),
            totalCheckIns: habit.totalCheckIns + 1,
          };
          
          await FirebaseService.updateHabit(habitId, {
            streak: updatedHabit.streak,
            bestStreak: updatedHabit.bestStreak,
            totalCheckIns: updatedHabit.totalCheckIns,
          });
          
          setHabits(habits.map(h => h.id === habitId ? updatedHabit : h));
        }
      }
    } catch (error) {
      console.error('Error checking in:', error);
    }
  };

  const getTodaysProgress = () => {
    const today = formatDate(new Date());
    const todaysCheckIns = checkIns.filter(checkIn => checkIn.date === today);
    const totalHabits = habits.length;
    return { completed: todaysCheckIns.length, total: totalHabits };
  };

  const getActiveStreak = () => {
    return habits.reduce((total, habit) => total + habit.streak, 0);
  };

  if (isLoading && habits.length === 0) {
    return <Loading fullScreen />;
  }

  const todaysProgress = getTodaysProgress();
  const activeStreak = getActiveStreak();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.text }]}>
            {getGreeting()}, {user?.displayName || 'Friend'}!
          </Text>
          <Text style={[styles.quote, { color: theme.textSecondary }]}>
            "{quote}"
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>
              {todaysProgress.completed}/{todaysProgress.total}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Today's Progress</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.statNumber, { color: theme.success }]}>
              {activeStreak}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active Streaks</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.statNumber, { color: theme.secondary }]}>
              {habits.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Habits</Text>
          </View>
        </View>

        <View style={styles.habitsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Habits</Text>
            <TouchableOpacity onPress={() => navigation.navigate('HabitCreation' as never)}>
              <Text style={[styles.addButton, { color: theme.primary }]}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {habits.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                No habits yet. Create your first habit to get started!
              </Text>
              <Button
                title="Create First Habit"
                onPress={() => navigation.navigate('HabitCreation' as never)}
                style={styles.createButton}
              />
            </View>
          ) : (
            habits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                checkIns={checkIns.filter(checkIn => checkIn.habitId === habit.id)}
                onPress={() => {
                  // Navigate to habit details
                }}
                onCheckIn={() => handleCheckIn(habit.id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  habitsSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  addButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    marginTop: 8,
  },
});

export default DashboardScreen;