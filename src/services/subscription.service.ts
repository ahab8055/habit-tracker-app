import Purchases, { PurchasesOffering, CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';
import { SubscriptionInfo, ApiResponse } from '../types';

class SubscriptionService {
  private initialized = false;

  async initialize(userId: string): Promise<void> {
    if (this.initialized) return;

    try {
      const apiKey = Platform.OS === 'android' 
        ? 'your-revenuecat-android-api-key' 
        : 'your-revenuecat-ios-api-key';

      Purchases.configure({ apiKey });
      await Purchases.logIn(userId);
      this.initialized = true;
    } catch (error) {
      console.error('RevenueCat initialization failed:', error);
    }
  }

  async getOfferings(): Promise<ApiResponse<PurchasesOffering[]>> {
    try {
      const offerings = await Purchases.getOfferings();
      return { 
        success: true, 
        data: Object.values(offerings.all) 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async purchasePackage(packageToPurchase: PurchasesPackage): Promise<ApiResponse<CustomerInfo>> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      return { success: true, data: customerInfo };
    } catch (error: any) {
      if (!error.userCancelled) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Purchase cancelled' };
    }
  }

  async restorePurchases(): Promise<ApiResponse<CustomerInfo>> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return { success: true, data: customerInfo };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getCustomerInfo(): Promise<ApiResponse<CustomerInfo>> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return { success: true, data: customerInfo };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getSubscriptionInfo(): Promise<SubscriptionInfo> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const premiumEntitlement = customerInfo.entitlements.active.premium;
      
      if (premiumEntitlement) {
        return {
          isActive: true,
          productId: premiumEntitlement.productIdentifier,
          purchaseDate: premiumEntitlement.latestPurchaseDate 
            ? new Date(premiumEntitlement.latestPurchaseDate) 
            : undefined,
          expirationDate: premiumEntitlement.expirationDate 
            ? new Date(premiumEntitlement.expirationDate) 
            : undefined,
        };
      }

      return { isActive: false, productId: '' };
    } catch (error) {
      console.error('Error getting subscription info:', error);
      return { isActive: false, productId: '' };
    }
  }

  isPremiumUser(customerInfo: CustomerInfo): boolean {
    return customerInfo.entitlements.active.premium !== undefined;
  }

  async logOut(): Promise<void> {
    try {
      await Purchases.logOut();
      this.initialized = false;
    } catch (error) {
      console.error('Error logging out from RevenueCat:', error);
    }
  }

  // Listener for subscription changes
  addCustomerInfoUpdateListener(listener: (customerInfo: CustomerInfo) => void) {
    return Purchases.addCustomerInfoUpdateListener(listener);
  }
}

export default new SubscriptionService();