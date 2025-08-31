import PushNotification from 'react-native-push-notification';
import { Platform, PermissionsAndroid } from 'react-native';
import { NotificationConfig } from '../types';

class NotificationService {
  constructor() {
    this.initializeNotifications();
  }

  private async initializeNotifications() {
    // Request permissions for Android 13+
    if (Platform.OS === 'android') {
      await this.requestAndroidPermissions();
    }

    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },

      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },

      onAction: function (notification) {
        console.log('ACTION:', notification.action);
        console.log('NOTIFICATION:', notification);
      },

      onRegistrationError: function (err) {
        console.error(err.message, err);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    PushNotification.createChannel(
      {
        channelId: 'habit-reminders',
        channelName: 'Habit Reminders',
        channelDescription: 'Daily reminders for your habits',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );
  }

  private async requestAndroidPermissions() {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'This app needs permission to send you habit reminders',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  }

  scheduleHabitReminder(config: NotificationConfig) {
    const [hours, minutes] = config.time.split(':').map(Number);
    const now = new Date();
    const scheduleTime = new Date();
    scheduleTime.setHours(hours, minutes, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (scheduleTime <= now) {
      scheduleTime.setDate(scheduleTime.getDate() + 1);
    }

    PushNotification.localNotificationSchedule({
      channelId: 'habit-reminders',
      id: config.habitId,
      title: config.title,
      message: config.body,
      date: scheduleTime,
      repeatType: 'day',
      userInfo: {
        habitId: config.habitId,
      },
    });
  }

  cancelHabitReminder(habitId: string) {
    PushNotification.cancelLocalNotifications({ id: habitId });
  }

  updateHabitReminder(config: NotificationConfig) {
    this.cancelHabitReminder(config.habitId);
    if (config.enabled) {
      this.scheduleHabitReminder(config);
    }
  }

  cancelAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }

  async checkPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      PushNotification.checkPermissions((permissions) => {
        resolve(permissions.alert || permissions.badge || permissions.sound);
      });
    });
  }

  requestPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      PushNotification.requestPermissions().then((permissions) => {
        resolve(permissions.alert || permissions.badge || permissions.sound);
      });
    });
  }
}

export default new NotificationService();