import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { useApp } from '../../contexts/AppContext';
import Button from '../../components/common/Button';
import NotificationService from '../../services/notification.service';

type Props = StackScreenProps<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, setTheme, getCurrentTheme, user } = useApp();
  const currentTheme = getCurrentTheme();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const hasPermission = await NotificationService.checkPermissions();
      if (!hasPermission) {
        const granted = await NotificationService.requestPermissions();
        if (!granted) {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive habit reminders.'
          );
          return;
        }
      }
    } else {
      NotificationService.cancelAllNotifications();
    }
    setNotificationsEnabled(enabled);
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your habits, check-ins, and progress. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement data clearing
            Alert.alert('Success', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your habit data will be exported as a JSON file.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            // TODO: Implement data export
            Alert.alert('Success', 'Data exported successfully.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: currentTheme.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: currentTheme.text }]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Display Settings */}
        <View style={[styles.section, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Display</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Dark Mode</Text>
              <Text style={[styles.settingDescription, { color: currentTheme.textSecondary }]}>
                Switch between light and dark themes
              </Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              trackColor={{ false: currentTheme.border, true: currentTheme.primary }}
              thumbColor={currentTheme.background}
            />
          </View>

          {user?.isPremium && (
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Custom Themes</Text>
                <Text style={[styles.settingDescription, { color: currentTheme.textSecondary }]}>
                  Choose from premium theme collection
                </Text>
              </View>
              <Text style={[styles.settingArrow, { color: currentTheme.textSecondary }]}>›</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notification Settings */}
        <View style={[styles.section, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Push Notifications</Text>
              <Text style={[styles.settingDescription, { color: currentTheme.textSecondary }]}>
                Receive reminders for your habits
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: currentTheme.border, true: currentTheme.primary }}
              thumbColor={currentTheme.background}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Sound</Text>
              <Text style={[styles.settingDescription, { color: currentTheme.textSecondary }]}>
                Play sound with notifications
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              disabled={!notificationsEnabled}
              trackColor={{ false: currentTheme.border, true: currentTheme.primary }}
              thumbColor={currentTheme.background}
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={[styles.section, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Data Management</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Export Data</Text>
              <Text style={[styles.settingDescription, { color: currentTheme.textSecondary }]}>
                Download your habits and progress
              </Text>
            </View>
            <Text style={[styles.settingArrow, { color: currentTheme.textSecondary }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleClearAllData}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.error }]}>Clear All Data</Text>
              <Text style={[styles.settingDescription, { color: currentTheme.textSecondary }]}>
                Permanently delete all your data
              </Text>
            </View>
            <Text style={[styles.settingArrow, { color: currentTheme.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Account */}
        <View style={[styles.section, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Account</Text>
          
          {!user?.isPremium && (
            <TouchableOpacity 
              style={styles.settingItem} 
              onPress={() => navigation.navigate('Premium')}
            >
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: currentTheme.primary }]}>Upgrade to Premium</Text>
                <Text style={[styles.settingDescription, { color: currentTheme.textSecondary }]}>
                  Unlock unlimited habits and themes
                </Text>
              </View>
              <Text style={[styles.settingArrow, { color: currentTheme.textSecondary }]}>›</Text>
            </TouchableOpacity>
          )}

          {user?.isPremium && (
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => navigation.navigate('Premium')}
            >
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Manage Subscription</Text>
                <Text style={[styles.settingDescription, { color: currentTheme.textSecondary }]}>
                  View and manage your Premium subscription
                </Text>
              </View>
              <Text style={[styles.settingArrow, { color: currentTheme.textSecondary }]}>›</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* About */}
        <View style={[styles.section, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>About</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Version</Text>
              <Text style={[styles.settingDescription, { color: currentTheme.textSecondary }]}>
                Habit Tracker v1.0.0
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Privacy Policy</Text>
              <Text style={[styles.settingDescription, { color: currentTheme.textSecondary }]}>
                Read our privacy policy
              </Text>
            </View>
            <Text style={[styles.settingArrow, { color: currentTheme.textSecondary }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Terms of Service</Text>
              <Text style={[styles.settingDescription, { color: currentTheme.textSecondary }]}>
                Read our terms of service
              </Text>
            </View>
            <Text style={[styles.settingArrow, { color: currentTheme.textSecondary }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Contact Support</Text>
              <Text style={[styles.settingDescription, { color: currentTheme.textSecondary }]}>
                Get help and support
              </Text>
            </View>
            <Text style={[styles.settingArrow, { color: currentTheme.textSecondary }]}>›</Text>
          </TouchableOpacity>
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
  backButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 50,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  settingArrow: {
    fontSize: 20,
    fontWeight: '300',
  },
});

export default SettingsScreen;