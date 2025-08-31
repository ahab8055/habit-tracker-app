import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../contexts/AppContext';
import Button from '../../components/common/Button';
import FirebaseService from '../../services/firebase.service';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { 
    user, 
    setUser, 
    theme, 
    setTheme, 
    getCurrentTheme,
    habits,
    checkIns 
  } = useApp();
  const currentTheme = getCurrentTheme();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await FirebaseService.signOut();
              setUser(null);
            } catch (error) {
              console.error('Error signing out:', error);
            }
          },
        },
      ]
    );
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const getTotalCheckIns = () => {
    return checkIns.length;
  };

  const getActiveStreaks = () => {
    return habits.reduce((total, habit) => total + habit.streak, 0);
  };

  const getBestStreak = () => {
    return Math.max(...habits.map(habit => habit.bestStreak), 0);
  };

  const getJoinDate = () => {
    if (!user?.createdAt) return 'Unknown';
    return new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScrollView style={styles.scrollView}>
        <Text style={[styles.title, { color: currentTheme.text }]}>Profile</Text>

        {/* User Info Section */}
        <View style={[styles.section, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: currentTheme.primary }]}>
              <Text style={styles.avatarText}>
                {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: currentTheme.text }]}>
                {user?.displayName || 'User'}
              </Text>
              <Text style={[styles.userEmail, { color: currentTheme.textSecondary }]}>
                {user?.email}
              </Text>
              <View style={[
                styles.premiumBadge,
                { backgroundColor: user?.isPremium ? currentTheme.success : currentTheme.border }
              ]}>
                <Text style={[
                  styles.premiumText,
                  { color: user?.isPremium ? '#ffffff' : currentTheme.textSecondary }
                ]}>
                  {user?.isPremium ? 'PREMIUM' : 'FREE'}
                </Text>
              </View>
            </View>
          </View>
          
          <Text style={[styles.joinDate, { color: currentTheme.textSecondary }]}>
            Member since {getJoinDate()}
          </Text>
        </View>

        {/* Stats Section */}
        <View style={[styles.section, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Your Stats</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: currentTheme.primary }]}>
                {habits.length}
              </Text>
              <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>Habits</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: currentTheme.success }]}>
                {getTotalCheckIns()}
              </Text>
              <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>Check-ins</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: currentTheme.warning }]}>
                {getActiveStreaks()}
              </Text>
              <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>Active Streaks</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: currentTheme.secondary }]}>
                {getBestStreak()}
              </Text>
              <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>Best Streak</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={[styles.section, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Dark Mode</Text>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: currentTheme.border, true: currentTheme.primary }}
              thumbColor={currentTheme.background}
            />
          </View>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigation.navigate('Settings' as never)}
          >
            <Text style={[styles.settingLabel, { color: currentTheme.text }]}>App Settings</Text>
            <Text style={[styles.settingArrow, { color: currentTheme.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Subscription Section */}
        {!user?.isPremium && (
          <View style={[styles.section, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Upgrade</Text>
            
            <Text style={[styles.upgradeText, { color: currentTheme.textSecondary }]}>
              Unlock unlimited habits, custom themes, and advanced analytics with Premium.
            </Text>

            <Button
              title="Upgrade to Premium"
              onPress={() => navigation.navigate('Premium' as never)}
              style={styles.upgradeButton}
            />
          </View>
        )}

        {user?.isPremium && (
          <View style={[styles.section, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Premium Features</Text>
            
            <View style={styles.premiumFeatures}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>∞</Text>
                <Text style={[styles.featureText, { color: currentTheme.text }]}>Unlimited Habits</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎨</Text>
                <Text style={[styles.featureText, { color: currentTheme.text }]}>Custom Themes</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📊</Text>
                <Text style={[styles.featureText, { color: currentTheme.text }]}>Advanced Analytics</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => navigation.navigate('Premium' as never)}
            >
              <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Manage Subscription</Text>
              <Text style={[styles.settingArrow, { color: currentTheme.textSecondary }]}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Account Section */}
        <View style={[styles.section, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Account</Text>
          
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="outline"
            fullWidth
            style={[styles.signOutButton, { borderColor: currentTheme.error }]}
            textStyle={{ color: currentTheme.error }}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: currentTheme.textSecondary }]}>
            Habit Tracker v1.0.0
          </Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingTop: 20,
    marginBottom: 24,
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  premiumBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  joinDate: {
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    width: '22%',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingArrow: {
    fontSize: 20,
    fontWeight: '300',
  },
  upgradeText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  upgradeButton: {
    marginTop: 8,
  },
  premiumFeatures: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 30,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 16,
  },
  signOutButton: {
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
  },
});

export default ProfileScreen;