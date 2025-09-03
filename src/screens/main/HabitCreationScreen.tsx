import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RootStackParamList } from '../../types';
import { useApp } from '../../contexts/AppContext';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import FirebaseService from '../../services/firebase.service';
import NotificationService from '../../services/notification.service';
import { habitIcons, formatTime } from '../../utils/helpers';

type Props = StackScreenProps<RootStackParamList, 'HabitCreation'>;

const HabitCreationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user, habits, addHabit, updateHabit, getCurrentTheme, setLoading, isLoading } = useApp();
  const theme = getCurrentTheme();
  const { habitId } = route.params || {};
  const isEditing = !!habitId;

  const [formData, setFormData] = useState({
    title: '',
    icon: habitIcons[0],
    reminderEnabled: false,
    reminderTime: new Date(),
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isEditing && habitId) {
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        setFormData({
          title: habit.title,
          icon: habit.icon,
          reminderEnabled: !!habit.reminderTime,
          reminderTime: habit.reminderTime ? new Date(`1970-01-01T${habit.reminderTime}:00`) : new Date(),
        });
      }
    }
  }, [isEditing, habitId, habits]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Habit title is required';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Habit title must be at least 2 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !user) return;

    // Check habit limit for free users
    if (!isEditing && !user.isPremium && habits.length >= 3) {
      Alert.alert(
        'Upgrade to Premium',
        'Free accounts are limited to 3 habits. Upgrade to Premium for unlimited habits.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upgrade',
            onPress: () => navigation.navigate('Premium'),
          },
        ]
      );
      return;
    }

    setLoading(true);
    
    try {
      const habitData = {
        userId: user.uid,
        title: formData.title.trim(),
        icon: formData.icon,
        reminderTime: formData.reminderEnabled ? formatTime(formData.reminderTime) : undefined,
        isActive: true,
        streak: 0,
        bestStreak: 0,
        totalCheckIns: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (isEditing && habitId) {
        // Update existing habit
        const result = await FirebaseService.updateHabit(habitId, habitData);
        if (result.success) {
          const updatedHabit = { ...habitData, id: habitId };
          updateHabit(updatedHabit);

          // Update notification
          if (formData.reminderEnabled && formData.reminderTime) {
            NotificationService.updateHabitReminder({
              habitId,
              title: `Time for ${formData.title}!`,
              body: `Don't break your streak - complete your habit now.`,
              time: formatTime(formData.reminderTime),
              enabled: true,
            });
          } else {
            NotificationService.cancelHabitReminder(habitId);
          }

          Alert.alert('Success', 'Habit updated successfully!', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        } else {
          Alert.alert('Error', result.error || 'Failed to update habit');
        }
      } else {
        // Create new habit
        const result = await FirebaseService.createHabit(habitData);
        if (result.success && result.data) {
          const newHabit = { ...habitData, id: result.data };
          addHabit(newHabit);

          // Schedule notification if enabled
          if (formData.reminderEnabled && formData.reminderTime) {
            NotificationService.scheduleHabitReminder({
              habitId: result.data,
              title: `Time for ${formData.title}!`,
              body: `Don't break your streak - complete your habit now.`,
              time: formatTime(formData.reminderTime),
              enabled: true,
            });
          }

          Alert.alert('Success', 'Habit created successfully!', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        } else {
          Alert.alert('Error', result.error || 'Failed to create habit');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('Error saving habit:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      updateFormData('reminderTime', selectedTime);
    }
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.cancelButton, { color: theme.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>
          {isEditing ? 'Edit Habit' : 'New Habit'}
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.saveButton, { color: theme.primary }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <Input
            label="Habit Title"
            value={formData.title}
            onChangeText={(value) => updateFormData('title', value)}
            placeholder="e.g., Drink 8 glasses of water"
            error={errors.title}
          />

          <View style={styles.iconSection}>
            <Text style={[styles.label, { color: theme.text }]}>Choose an Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
              <View style={styles.iconGrid}>
                {habitIcons.map((icon, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.iconButton,
                      {
                        backgroundColor: formData.icon === icon ? theme.primary : theme.surface,
                        borderColor: formData.icon === icon ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => updateFormData('icon', icon)}
                  >
                    <Text style={styles.iconText}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.reminderSection}>
            <View style={styles.reminderHeader}>
              <Text style={[styles.label, { color: theme.text }]}>Daily Reminder</Text>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  {
                    backgroundColor: formData.reminderEnabled ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => updateFormData('reminderEnabled', !formData.reminderEnabled)}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    {
                      backgroundColor: theme.background,
                      transform: [{ translateX: formData.reminderEnabled ? 20 : 0 }],
                    },
                  ]}
                />
              </TouchableOpacity>
            </View>

            {formData.reminderEnabled && (
              <View style={styles.timeSection}>
                <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>
                  Reminder Time
                </Text>
                <TouchableOpacity
                  style={[styles.timeButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={[styles.timeText, { color: theme.text }]}>
                    {formatTime(formData.reminderTime)}
                  </Text>
                </TouchableOpacity>

                {showTimePicker && (
                  <DateTimePicker
                    value={formData.reminderTime}
                    mode="time"
                    is24Hour={false}
                    display="default"
                    onChange={handleTimeChange}
                  />
                )}
              </View>
            )}
          </View>

          <View style={styles.previewSection}>
            <Text style={[styles.label, { color: theme.text }]}>Preview</Text>
            <View style={[styles.habitPreview, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.previewHeader}>
                <View style={styles.previewIconContainer}>
                  <Text style={styles.previewIcon}>{formData.icon}</Text>
                </View>
                <View style={styles.previewInfo}>
                  <Text style={[styles.previewTitle, { color: theme.text }]}>
                    {formData.title || 'Habit Title'}
                  </Text>
                  <Text style={[styles.previewStreak, { color: theme.textSecondary }]}>
                    0 day streak
                  </Text>
                </View>
                <View style={[styles.previewCheckButton, { borderColor: theme.textSecondary }]}>
                  <Text style={[styles.previewCheckText, { color: theme.textSecondary }]}>○</Text>
                </View>
              </View>
              {formData.reminderEnabled && (
                <Text style={[styles.previewReminder, { color: theme.textSecondary }]}>
                  Reminder: {formatTime(formData.reminderTime)}
                </Text>
              )}
            </View>
          </View>
        </View>
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
  cancelButton: {
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  form: {
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  iconSection: {
    marginBottom: 24,
  },
  iconScroll: {
    marginTop: 8,
  },
  iconGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 20,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  reminderSection: {
    marginBottom: 24,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  timeSection: {
    marginTop: 16,
  },
  timeLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  timeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  timeText: {
    fontSize: 16,
    textAlign: 'center',
  },
  previewSection: {
    marginBottom: 24,
  },
  habitPreview: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  previewIcon: {
    fontSize: 24,
  },
  previewInfo: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewStreak: {
    fontSize: 14,
  },
  previewCheckButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCheckText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewReminder: {
    fontSize: 12,
    textAlign: 'right',
  },
});

export default HabitCreationScreen;