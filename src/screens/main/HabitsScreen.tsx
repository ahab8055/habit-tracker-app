import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../contexts/AppContext';
import HabitCard from '../../components/habit/HabitCard';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import FirebaseService from '../../services/firebase.service';
import { formatDate } from '../../utils/helpers';

const HabitsScreen = () => {
  const navigation = useNavigation();
  const { 
    user, 
    habits, 
    setHabits, 
    checkIns,
    addCheckIn,
    deleteHabit,
    getCurrentTheme, 
    isLoading,
  } = useApp();
  const theme = getCurrentTheme();

  const [refreshing, setRefreshing] = useState(false);

  const loadHabits = async () => {
    if (!user) return;
    
    try {
      const userHabits = await FirebaseService.getUserHabits(user.uid);
      setHabits(userHabits);
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

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

  const handleEditHabit = (habitId: string) => {
    navigation.navigate('HabitCreation' as never, { habitId } as never);
  };

  const handleDeleteHabit = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await FirebaseService.deleteHabit(habitId);
              if (result.success) {
                deleteHabit(habitId);
              } else {
                Alert.alert('Error', result.error || 'Failed to delete habit');
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred');
            }
          },
        },
      ]
    );
  };

  const canAddMoreHabits = () => {
    if (user?.isPremium) return true;
    return habits.length < 3; // Free tier limit
  };

  const handleAddHabit = () => {
    if (!canAddMoreHabits()) {
      Alert.alert(
        'Upgrade to Premium',
        'Free accounts are limited to 3 habits. Upgrade to Premium for unlimited habits.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upgrade',
            onPress: () => navigation.navigate('Premium' as never),
          },
        ]
      );
      return;
    }

    navigation.navigate('HabitCreation' as never);
  };

  if (isLoading && habits.length === 0) {
    return <Loading fullScreen />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>My Habits</Text>
        <TouchableOpacity onPress={handleAddHabit}>
          <View style={[styles.addButton, { backgroundColor: theme.primary }]}>
            <Text style={styles.addButtonText}>+</Text>
          </View>
        </TouchableOpacity>
      </View>

      {!user?.isPremium && (
        <View style={[styles.limitBanner, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.limitText, { color: theme.textSecondary }]}>
            Free Plan: {habits.length}/3 habits used
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Premium' as never)}>
            <Text style={[styles.upgradeText, { color: theme.primary }]}>Upgrade</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateTitle, { color: theme.text }]}>No Habits Yet</Text>
            <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
              Create your first habit to start building better routines!
            </Text>
            <Button
              title="Create First Habit"
              onPress={handleAddHabit}
              style={styles.createButton}
            />
          </View>
        ) : (
          <View style={styles.habitsList}>
            {habits.map(habit => (
              <TouchableOpacity
                key={habit.id}
                onLongPress={() => {
                  Alert.alert(
                    'Habit Actions',
                    `What would you like to do with "${habit.title}"?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Edit',
                        onPress: () => handleEditHabit(habit.id),
                      },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => handleDeleteHabit(habit.id),
                      },
                    ]
                  );
                }}
              >
                <HabitCard
                  habit={habit}
                  checkIns={checkIns.filter(checkIn => checkIn.habitId === habit.id)}
                  onPress={() => handleEditHabit(habit.id)}
                  onCheckIn={() => handleCheckIn(habit.id)}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {habits.length > 0 && canAddMoreHabits() && (
          <Button
            title="Add New Habit"
            onPress={handleAddHabit}
            variant="outline"
            fullWidth
            style={styles.addNewButton}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  limitBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  limitText: {
    fontSize: 14,
  },
  upgradeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  createButton: {
    marginTop: 8,
  },
  habitsList: {
    paddingBottom: 20,
  },
  addNewButton: {
    marginTop: 20,
    marginBottom: 40,
  },
});

export default HabitsScreen;