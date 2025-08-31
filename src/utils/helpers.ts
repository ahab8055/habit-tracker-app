import { CheckIn } from '../types';

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

export const formatTime = (date: Date): string => {
  return date.toTimeString().slice(0, 5); // HH:MM
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return formatDate(date) === formatDate(today);
};

export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(date) === formatDate(yesterday);
};

export const daysBetween = (date1: Date, date2: Date): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const calculateStreak = (checkIns: CheckIn[]): number => {
  if (checkIns.length === 0) return 0;

  // Sort check-ins by date (most recent first)
  const sortedCheckIns = checkIns
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const checkIn of sortedCheckIns) {
    const checkInDate = new Date(checkIn.date);
    checkInDate.setHours(0, 0, 0, 0);

    const daysDiff = daysBetween(checkInDate, currentDate);

    if (daysDiff === 0) {
      // Check-in is today
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (daysDiff === 1) {
      // Check-in is consecutive
      streak++;
      currentDate = checkInDate;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Gap in check-ins, break the streak
      break;
    }
  }

  return streak;
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

export const getRandomMotivationalQuote = (): string => {
  const quotes = [
    "The secret of getting ahead is getting started.",
    "Don't watch the clock; do what it does. Keep going.",
    "Success is the sum of small efforts repeated day in and day out.",
    "The only impossible journey is the one you never begin.",
    "Your limitation—it's only your imagination.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn't just find you. You have to go out and get it.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Dream bigger. Do bigger."
  ];
  
  return quotes[Math.floor(Math.random() * quotes.length)];
};

export const habitIcons = [
  '💧', '📖', '🏃‍♂️', '🧘‍♀️', '📚', '💪', '🎵', '🎨', 
  '🍎', '🚶‍♂️', '💤', '📱', '🌱', '☕', '🏋️‍♀️', '📝',
  '🧠', '❤️', '🎯', '🌟', '⏰', '🔥', '🌊', '🏔️'
];

export const getHabitIcon = (iconName: string): string => {
  const iconMap: { [key: string]: string } = {
    'water': '💧',
    'reading': '📖',
    'exercise': '🏃‍♂️',
    'meditation': '🧘‍♀️',
    'learning': '📚',
    'gym': '💪',
    'music': '🎵',
    'art': '🎨',
    'healthy-eating': '🍎',
    'walking': '🚶‍♂️',
    'sleep': '💤',
    'phone': '📱',
    'plant': '🌱',
    'coffee': '☕',
    'weights': '🏋️‍♀️',
    'writing': '📝',
    'brain': '🧠',
    'heart': '❤️',
    'target': '🎯',
    'star': '🌟',
    'time': '⏰',
    'fire': '🔥',
    'wave': '🌊',
    'mountain': '🏔️'
  };

  return iconMap[iconName] || iconName;
};