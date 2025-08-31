import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { User, Habit, CheckIn, ApiResponse } from '../types';

class FirebaseService {
  constructor() {
    this.initGoogleSignIn();
  }

  private initGoogleSignIn() {
    GoogleSignin.configure({
      webClientId: 'your-web-client-id.apps.googleusercontent.com', // Replace with your web client ID
    });
  }

  // Authentication methods
  async signInWithEmail(email: string, password: string): Promise<ApiResponse<User>> {
    try {
      const credential = await auth().signInWithEmailAndPassword(email, password);
      const user = await this.getUserData(credential.user.uid);
      return { success: true, data: user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async signUpWithEmail(email: string, password: string, displayName: string): Promise<ApiResponse<User>> {
    try {
      const credential = await auth().createUserWithEmailAndPassword(email, password);
      await credential.user.updateProfile({ displayName });
      
      const userData: User = {
        uid: credential.user.uid,
        email,
        displayName,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await this.createUser(userData);
      return { success: true, data: userData };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async signInWithGoogle(): Promise<ApiResponse<User>> {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const credential = await auth().signInWithCredential(googleCredential);
      
      let user = await this.getUserData(credential.user.uid);
      if (!user) {
        user = {
          uid: credential.user.uid,
          email: credential.user.email || '',
          displayName: credential.user.displayName || '',
          photoURL: credential.user.photoURL || '',
          isPremium: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await this.createUser(user);
      }
      
      return { success: true, data: user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async signOut(): Promise<ApiResponse<void>> {
    try {
      await auth().signOut();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async resetPassword(email: string): Promise<ApiResponse<void>> {
    try {
      await auth().sendPasswordResetEmail(email);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // User data methods
  async createUser(userData: User): Promise<ApiResponse<void>> {
    try {
      await firestore().collection('users').doc(userData.uid).set(userData);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getUserData(uid: string): Promise<User | null> {
    try {
      const doc = await firestore().collection('users').doc(uid).get();
      if (doc.exists) {
        const data = doc.data();
        return {
          ...data,
          createdAt: data?.createdAt?.toDate() || new Date(),
          updatedAt: data?.updatedAt?.toDate() || new Date(),
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  async updateUser(userData: Partial<User>): Promise<ApiResponse<void>> {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        return { success: false, error: 'No authenticated user' };
      }

      await firestore().collection('users').doc(currentUser.uid).update({
        ...userData,
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Habit methods
  async createHabit(habitData: Omit<Habit, 'id'>): Promise<ApiResponse<string>> {
    try {
      const doc = await firestore().collection('habits').add(habitData);
      return { success: true, data: doc.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getUserHabits(userId: string): Promise<Habit[]> {
    try {
      const snapshot = await firestore()
        .collection('habits')
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Habit[];
    } catch (error) {
      console.error('Error getting habits:', error);
      return [];
    }
  }

  async updateHabit(habitId: string, updates: Partial<Habit>): Promise<ApiResponse<void>> {
    try {
      await firestore().collection('habits').doc(habitId).update({
        ...updates,
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteHabit(habitId: string): Promise<ApiResponse<void>> {
    try {
      await firestore().collection('habits').doc(habitId).update({
        isActive: false,
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Check-in methods
  async createCheckIn(checkInData: Omit<CheckIn, 'id'>): Promise<ApiResponse<string>> {
    try {
      const doc = await firestore().collection('checkIns').add(checkInData);
      return { success: true, data: doc.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getHabitCheckIns(habitId: string, limit = 30): Promise<CheckIn[]> {
    try {
      const snapshot = await firestore()
        .collection('checkIns')
        .where('habitId', '==', habitId)
        .orderBy('date', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as CheckIn[];
    } catch (error) {
      console.error('Error getting check-ins:', error);
      return [];
    }
  }

  // Real-time listeners
  onAuthStateChanged(callback: (user: FirebaseAuthTypes.User | null) => void) {
    return auth().onAuthStateChanged(callback);
  }

  subscribeToHabits(userId: string, callback: (habits: Habit[]) => void) {
    return firestore()
      .collection('habits')
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const habits = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Habit[];
        callback(habits);
      });
  }
}

export default new FirebaseService();