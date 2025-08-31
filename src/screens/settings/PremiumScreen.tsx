import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { useApp } from '../../contexts/AppContext';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import SubscriptionService from '../../services/subscription.service';
import FirebaseService from '../../services/firebase.service';

type Props = StackScreenProps<RootStackParamList, 'Premium'>;

const PremiumScreen: React.FC<Props> = ({ navigation }) => {
  const { user, setUser, getCurrentTheme, setLoading, isLoading } = useApp();
  const theme = getCurrentTheme();
  
  const [offerings, setOfferings] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);

  useEffect(() => {
    initializeSubscription();
    loadOfferings();
    loadSubscriptionInfo();
  }, []);

  const initializeSubscription = async () => {
    if (user) {
      await SubscriptionService.initialize(user.uid);
    }
  };

  const loadOfferings = async () => {
    try {
      const result = await SubscriptionService.getOfferings();
      if (result.success && result.data) {
        setOfferings(result.data);
        // Select the first package by default
        if (result.data.length > 0 && result.data[0].availablePackages?.length > 0) {
          setSelectedPackage(result.data[0].availablePackages[0]);
        }
      }
    } catch (error) {
      console.error('Error loading offerings:', error);
    }
  };

  const loadSubscriptionInfo = async () => {
    try {
      const info = await SubscriptionService.getSubscriptionInfo();
      setSubscriptionInfo(info);
    } catch (error) {
      console.error('Error loading subscription info:', error);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert('Error', 'Please select a subscription package');
      return;
    }

    setLoading(true);
    try {
      const result = await SubscriptionService.purchasePackage(selectedPackage);
      if (result.success && result.data) {
        const isPremium = SubscriptionService.isPremiumUser(result.data);
        
        // Update user premium status in Firebase
        if (user && isPremium) {
          await FirebaseService.updateUser({ isPremium: true });
          setUser({ ...user, isPremium: true });
        }

        Alert.alert(
          'Success!',
          'Welcome to Premium! You now have access to unlimited habits and premium features.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error: any) {
      if (error.message !== 'Purchase cancelled') {
        Alert.alert('Purchase Failed', error.message || 'An error occurred during purchase');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const result = await SubscriptionService.restorePurchases();
      if (result.success && result.data) {
        const isPremium = SubscriptionService.isPremiumUser(result.data);
        
        if (isPremium && user) {
          await FirebaseService.updateUser({ isPremium: true });
          setUser({ ...user, isPremium: true });
          Alert.alert('Success', 'Your Premium subscription has been restored!');
        } else {
          Alert.alert('No Purchases Found', 'No active subscriptions were found to restore.');
        }
      }
    } catch (error: any) {
      Alert.alert('Restore Failed', error.message || 'Failed to restore purchases');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: '∞',
      title: 'Unlimited Habits',
      description: 'Create as many habits as you want without any restrictions',
      free: 'Up to 3 habits',
      premium: 'Unlimited',
    },
    {
      icon: '🎨',
      title: 'Custom Themes',
      description: 'Access to exclusive premium themes and color schemes',
      free: 'Light & Dark',
      premium: '10+ Premium themes',
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Detailed insights and progress tracking with charts',
      free: 'Basic stats',
      premium: 'Advanced analytics',
    },
    {
      icon: '🔔',
      title: 'Smart Reminders',
      description: 'Intelligent reminder system with custom scheduling',
      free: 'Daily reminders',
      premium: 'Smart reminders',
    },
    {
      icon: '☁️',
      title: 'Priority Sync',
      description: 'Faster cloud synchronization across all your devices',
      free: 'Standard sync',
      premium: 'Priority sync',
    },
    {
      icon: '📈',
      title: 'Habit Insights',
      description: 'AI-powered suggestions to improve your habit success',
      free: 'Not available',
      premium: 'Available',
    },
  ];

  if (isLoading && offerings.length === 0) {
    return <Loading fullScreen />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.closeButton, { color: theme.textSecondary }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Premium</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {user?.isPremium ? (
          <View style={[styles.activeSubscriptionBanner, { backgroundColor: theme.success }]}>
            <Text style={styles.bannerText}>🎉 You're a Premium member!</Text>
          </View>
        ) : (
          <View style={[styles.heroBanner, { backgroundColor: theme.primary }]}>
            <Text style={styles.heroTitle}>Unlock Your Full Potential</Text>
            <Text style={styles.heroSubtitle}>
              Take your habit building to the next level with Premium features
            </Text>
          </View>
        )}

        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Premium Features</Text>
          
          {features.map((feature, index) => (
            <View key={index} style={[styles.featureItem, { borderColor: theme.border }]}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: theme.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                  {feature.description}
                </Text>
                <View style={styles.comparisonRow}>
                  <View style={styles.comparisonItem}>
                    <Text style={[styles.comparisonLabel, { color: theme.textSecondary }]}>Free</Text>
                    <Text style={[styles.comparisonValue, { color: theme.textSecondary }]}>
                      {feature.free}
                    </Text>
                  </View>
                  <View style={styles.comparisonItem}>
                    <Text style={[styles.comparisonLabel, { color: theme.primary }]}>Premium</Text>
                    <Text style={[styles.comparisonValue, { color: theme.primary }]}>
                      {feature.premium}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {!user?.isPremium && offerings.length > 0 && (
          <View style={styles.pricingSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Choose Your Plan</Text>
            
            <View style={[styles.priceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.priceHeader}>
                <Text style={[styles.priceTitle, { color: theme.text }]}>Premium Monthly</Text>
                <View style={[styles.popularBadge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.popularText}>Most Popular</Text>
                </View>
              </View>
              
              <View style={styles.priceDisplay}>
                <Text style={[styles.priceAmount, { color: theme.text }]}>$2.99</Text>
                <Text style={[styles.pricePeriod, { color: theme.textSecondary }]}>/month</Text>
              </View>
              
              <Text style={[styles.priceDescription, { color: theme.textSecondary }]}>
                Full access to all Premium features. Cancel anytime.
              </Text>

              <Button
                title="Start Premium"
                onPress={handlePurchase}
                fullWidth
                style={styles.subscribeButton}
                disabled={isLoading}
              />
            </View>

            <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
              <Text style={[styles.restoreText, { color: theme.textSecondary }]}>
                Already purchased? Restore purchases
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {user?.isPremium && subscriptionInfo?.isActive && (
          <View style={[styles.subscriptionInfo, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Subscription Details</Text>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Status</Text>
              <Text style={[styles.infoValue, { color: theme.success }]}>Active</Text>
            </View>
            
            {subscriptionInfo.expirationDate && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Renews</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {subscriptionInfo.expirationDate.toLocaleDateString()}
                </Text>
              </View>
            )}

            <Button
              title="Manage Subscription"
              onPress={() => {
                Alert.alert(
                  'Manage Subscription',
                  'To cancel or modify your subscription, please visit the App Store settings.',
                  [{ text: 'OK' }]
                );
              }}
              variant="outline"
              fullWidth
              style={styles.manageButton}
            />
          </View>
        )}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period.
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  closeButton: {
    fontSize: 20,
    width: 30,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 30,
  },
  scrollView: {
    flex: 1,
  },
  activeSubscriptionBanner: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  heroBanner: {
    margin: 20,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 30,
    textAlign: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  comparisonRow: {
    flexDirection: 'row',
    gap: 24,
  },
  comparisonItem: {
    flex: 1,
  },
  comparisonLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  comparisonValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  pricingSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  priceCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  popularBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  priceDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  pricePeriod: {
    fontSize: 16,
    marginLeft: 4,
  },
  priceDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  subscribeButton: {
    marginTop: 8,
  },
  restoreButton: {
    alignItems: 'center',
    padding: 16,
  },
  restoreText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  subscriptionInfo: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  manageButton: {
    marginTop: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
});

export default PremiumScreen;