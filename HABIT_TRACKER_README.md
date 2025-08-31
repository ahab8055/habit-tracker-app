# Habit Tracker App

A complete React Native habit tracker application with Firebase integration, premium subscriptions, and local notifications.

## Features

### ✨ Core Features
- **Authentication System**: Firebase Auth with email/password and Google Sign-In
- **Habit Management**: Create, edit, delete, and track daily habits
- **Check-in System**: Daily habit completion tracking with streak counters
- **Real-time Sync**: Firebase Firestore integration for cross-device synchronization
- **Local Notifications**: Customizable daily reminders for each habit
- **Premium Subscription**: RevenueCat integration for premium features ($2.99/month)

### 🎨 UI/UX Features
- **Modern Design**: Clean, minimal interface with Material Design principles
- **Dark/Light Mode**: Automatic theme switching with manual override
- **Premium Themes**: Exclusive color schemes for premium subscribers
- **Responsive Layout**: Optimized for various Android screen sizes
- **Loading States**: Smooth loading indicators and error handling

### 📊 Analytics & Statistics
- **Habit Analytics**: Completion rates, streak tracking, and progress charts
- **Weekly Overview**: 7-day completion rate visualization
- **Habit Insights**: Performance ranking and motivational metrics
- **Data Export**: JSON export functionality for user data

### 🔒 Premium Features
- **Unlimited Habits**: Free tier limited to 3 habits, Premium unlimited
- **Custom Themes**: 10+ exclusive color schemes
- **Advanced Analytics**: Detailed insights and AI-powered suggestions
- **Priority Sync**: Faster cloud synchronization
- **Smart Reminders**: Intelligent notification scheduling

## Technical Stack

- **Framework**: React Native 0.81.1 with TypeScript
- **Navigation**: React Navigation v6
- **State Management**: Context API with useReducer
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth + Google Sign-In
- **Notifications**: React Native Push Notifications
- **Subscriptions**: RevenueCat SDK
- **Storage**: AsyncStorage for local persistence
- **Icons**: React Native Vector Icons

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   └── habit/           # Habit-specific components
├── contexts/            # React Context providers
├── navigation/          # Navigation configuration
├── screens/
│   ├── auth/           # Authentication screens
│   ├── main/           # Main app screens
│   └── settings/       # Settings and premium screens
├── services/           # API and service integrations
├── types/              # TypeScript type definitions
└── utils/              # Helper functions and constants
```

## Installation & Setup

### Prerequisites
- Node.js >= 20
- React Native CLI
- Android Studio & Android SDK
- Java 11 or higher

### Installation Steps

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd habit-tracker-app
   npm install
   ```

2. **Configure Firebase**:
   - Create Firebase project with Authentication and Firestore
   - Download `google-services.json` to `android/app/`
   - Update Firebase config in `src/services/firebase.config.ts`

3. **Configure Google Sign-In**:
   - Enable Google provider in Firebase Auth
   - Update Web Client ID in `src/services/firebase.service.ts`

4. **Configure RevenueCat** (Optional for testing):
   - Create RevenueCat account and app
   - Update API keys in `src/services/subscription.service.ts`

5. **Run the app**:
   ```bash
   npm run android
   ```

## Key App Screens

1. **Authentication**: Login, register, forgot password
2. **Dashboard**: Daily progress, streaks, quick check-ins
3. **Habits**: Create/edit habits, icon selection, reminders
4. **Statistics**: 7-day charts, habit performance, insights
5. **Profile**: User info, settings, subscription status
6. **Premium**: Feature comparison, subscription management

## Configuration Files

- `android/app/src/main/AndroidManifest.xml`: Android permissions and notifications
- `src/services/firebase.config.ts`: Firebase project configuration
- `src/services/notification.service.ts`: Local notification setup
- `src/services/subscription.service.ts`: RevenueCat configuration

## Features Implementation Status

✅ **Completed**:
- React Native CLI project setup with TypeScript
- Firebase Authentication (email/password + Google Sign-In)
- Habit CRUD operations with Firestore sync
- Daily check-in system with streak tracking  
- Local push notifications with scheduling
- Premium subscription flow with RevenueCat
- Light/Dark mode theming system
- Statistics and analytics screens
- Responsive UI components
- Navigation structure
- Android permissions and configuration

🔧 **Ready for Configuration**:
- Firebase project setup (requires user's Firebase project)
- Google Sign-In client ID (requires Firebase console setup)
- RevenueCat API keys (requires RevenueCat account)
- Push notification certificates (handled automatically)

## Production Deployment

### Building for Release

```bash
cd android
./gradlew assembleRelease
```

### Required Environment Setup

1. **Firebase**: Create project, enable Auth + Firestore, download config
2. **Google Play**: Set up app listing and upload signed APK
3. **RevenueCat**: Configure products and webhooks
4. **Signing**: Generate upload key for Play Store

### Security Considerations

- Firebase Security Rules configured for user data isolation
- All API calls authenticated with Firebase tokens
- Local storage encrypted with AsyncStorage
- No hardcoded secrets in source code

## Architecture

- **State Management**: React Context with useReducer pattern
- **Navigation**: Stack + Tab navigation with type safety
- **Data Flow**: Firebase real-time listeners with local caching
- **Offline Support**: AsyncStorage fallback for network issues
- **Error Handling**: Comprehensive try/catch with user feedback

## Testing

```bash
npm run lint    # ESLint + TypeScript checking
npm test        # Jest unit tests
```

This is a production-ready React Native habit tracker app with all core features implemented and ready for deployment after proper Firebase/RevenueCat configuration.