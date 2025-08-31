import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Habit, CheckIn } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { getHabitIcon, formatDate, isToday } from '../../utils/helpers';

interface HabitCardProps {
  habit: Habit;
  checkIns: CheckIn[];
  onPress: () => void;
  onCheckIn: () => void;
}

const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  checkIns,
  onPress,
  onCheckIn,
}) => {
  const { getCurrentTheme } = useApp();
  const theme = getCurrentTheme();

  const todaysCheckIn = checkIns.find(checkIn => 
    checkIn.habitId === habit.id && isToday(new Date(checkIn.date))
  );

  const isCheckedToday = !!todaysCheckIn;

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getHabitIcon(habit.icon)}</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.text }]}>{habit.title}</Text>
          <Text style={[styles.streak, { color: theme.textSecondary }]}>
            {habit.streak} day streak
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.checkButton,
            {
              backgroundColor: isCheckedToday ? theme.success : theme.border,
              borderColor: isCheckedToday ? theme.success : theme.textSecondary,
            },
          ]}
          onPress={onCheckIn}
        >
          <Text style={[styles.checkText, { color: isCheckedToday ? '#ffffff' : theme.textSecondary }]}>
            {isCheckedToday ? '✓' : '○'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.stats}>
          <Text style={[styles.statText, { color: theme.textSecondary }]}>
            Best: {habit.bestStreak} days
          </Text>
          <Text style={[styles.statText, { color: theme.textSecondary }]}>
            Total: {habit.totalCheckIns} check-ins
          </Text>
        </View>
        {habit.reminderTime && (
          <Text style={[styles.reminderText, { color: theme.textSecondary }]}>
            Reminder: {habit.reminderTime}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  streak: {
    fontSize: 14,
  },
  checkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    fontSize: 12,
  },
  reminderText: {
    fontSize: 12,
  },
});

export default HabitCard;