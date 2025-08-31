import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useApp } from '../../contexts/AppContext';
import { formatDate, daysBetween } from '../../utils/helpers';

const { width } = Dimensions.get('window');

const StatisticsScreen = () => {
  const { habits, checkIns, getCurrentTheme } = useApp();
  const theme = getCurrentTheme();

  const statistics = useMemo(() => {
    const totalCheckIns = checkIns.length;
    const totalHabits = habits.length;
    const activeHabits = habits.filter(habit => habit.isActive).length;
    
    // Calculate completion rate for last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(formatDate(date));
    }
    
    const completionRates = last7Days.map(date => {
      const dayCheckIns = checkIns.filter(checkIn => checkIn.date === date);
      return {
        date,
        completed: dayCheckIns.length,
        total: totalHabits,
        rate: totalHabits > 0 ? (dayCheckIns.length / totalHabits) * 100 : 0,
      };
    });

    // Calculate streaks
    const totalActiveStreaks = habits.reduce((sum, habit) => sum + habit.streak, 0);
    const bestStreak = Math.max(...habits.map(habit => habit.bestStreak), 0);
    
    // Calculate habit performance
    const habitStats = habits.map(habit => {
      const habitCheckIns = checkIns.filter(checkIn => checkIn.habitId === habit.id);
      const lastCheckIn = habitCheckIns[habitCheckIns.length - 1];
      const daysSinceCreated = daysBetween(habit.createdAt, new Date());
      const completionRate = daysSinceCreated > 0 ? (habitCheckIns.length / daysSinceCreated) * 100 : 0;
      
      return {
        ...habit,
        completionRate: Math.min(completionRate, 100),
        totalCheckIns: habitCheckIns.length,
        lastCheckIn: lastCheckIn?.date,
      };
    }).sort((a, b) => b.completionRate - a.completionRate);

    return {
      totalCheckIns,
      totalHabits,
      activeHabits,
      completionRates,
      totalActiveStreaks,
      bestStreak,
      habitStats,
      averageCompletionRate: completionRates.length > 0 
        ? completionRates.reduce((sum, day) => sum + day.rate, 0) / completionRates.length 
        : 0,
    };
  }, [habits, checkIns]);

  const renderCompletionChart = () => {
    const maxRate = Math.max(...statistics.completionRates.map(day => day.rate), 100);
    const chartHeight = 120;
    const barWidth = (width - 80) / 7;

    return (
      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>7-Day Completion Rate</Text>
        <View style={[styles.chart, { height: chartHeight }]}>
          {statistics.completionRates.map((day, index) => {
            const barHeight = maxRate > 0 ? (day.rate / maxRate) * (chartHeight - 30) : 0;
            const dayName = new Date(day.date).toLocaleDateString('en', { weekday: 'short' });
            
            return (
              <View key={day.date} style={[styles.chartBar, { width: barWidth }]}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: day.rate >= 80 ? theme.success : 
                                       day.rate >= 50 ? theme.warning : theme.error,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, { color: theme.textSecondary }]}>
                  {dayName}
                </Text>
                <Text style={[styles.barValue, { color: theme.textSecondary }]}>
                  {Math.round(day.rate)}%
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView}>
        <Text style={[styles.title, { color: theme.text }]}>Statistics</Text>

        {/* Overview Stats */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>
              {statistics.totalCheckIns}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Check-ins</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.statNumber, { color: theme.success }]}>
              {statistics.totalActiveStreaks}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active Streaks</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.statNumber, { color: theme.secondary }]}>
              {statistics.bestStreak}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Best Streak</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.statNumber, { color: theme.warning }]}>
              {Math.round(statistics.averageCompletionRate)}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Avg. Completion</Text>
          </View>
        </View>

        {/* Completion Chart */}
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {renderCompletionChart()}
        </View>

        {/* Habit Performance */}
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Habit Performance</Text>
          
          {statistics.habitStats.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No habits to analyze yet
            </Text>
          ) : (
            statistics.habitStats.map(habit => (
              <View key={habit.id} style={styles.habitPerformanceItem}>
                <View style={styles.habitHeader}>
                  <Text style={[styles.habitIcon]}>{habit.icon}</Text>
                  <View style={styles.habitInfo}>
                    <Text style={[styles.habitTitle, { color: theme.text }]}>
                      {habit.title}
                    </Text>
                    <Text style={[styles.habitSubtitle, { color: theme.textSecondary }]}>
                      {habit.totalCheckIns} check-ins • {habit.streak} day streak
                    </Text>
                  </View>
                  <Text style={[
                    styles.completionRate,
                    {
                      color: habit.completionRate >= 80 ? theme.success :
                             habit.completionRate >= 50 ? theme.warning : theme.error
                    }
                  ]}>
                    {Math.round(habit.completionRate)}%
                  </Text>
                </View>
                
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${habit.completionRate}%`,
                        backgroundColor: habit.completionRate >= 80 ? theme.success :
                                       habit.completionRate >= 50 ? theme.warning : theme.error
                      }
                    ]}
                  />
                </View>
              </View>
            ))
          )}
        </View>

        {/* Quick Insights */}
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Insights</Text>
          
          <View style={styles.insights}>
            <View style={styles.insight}>
              <Text style={[styles.insightIcon]}>🎯</Text>
              <View style={styles.insightText}>
                <Text style={[styles.insightTitle, { color: theme.text }]}>Most Consistent</Text>
                <Text style={[styles.insightDescription, { color: theme.textSecondary }]}>
                  {statistics.habitStats.length > 0 
                    ? `${statistics.habitStats[0]?.title} (${Math.round(statistics.habitStats[0]?.completionRate)}%)`
                    : 'No data yet'
                  }
                </Text>
              </View>
            </View>

            <View style={styles.insight}>
              <Text style={[styles.insightIcon]}>🔥</Text>
              <View style={styles.insightText}>
                <Text style={[styles.insightTitle, { color: theme.text }]}>Longest Streak</Text>
                <Text style={[styles.insightDescription, { color: theme.textSecondary }]}>
                  {statistics.bestStreak} days
                </Text>
              </View>
            </View>

            <View style={styles.insight}>
              <Text style={[styles.insightIcon]}>📈</Text>
              <View style={styles.insightText}>
                <Text style={[styles.insightTitle, { color: theme.text }]}>This Week</Text>
                <Text style={[styles.insightDescription, { color: theme.textSecondary }]}>
                  {Math.round(statistics.averageCompletionRate)}% average completion
                </Text>
              </View>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
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
  chartContainer: {
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
  },
  chartBar: {
    alignItems: 'center',
  },
  barContainer: {
    height: 90,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 20,
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
  },
  habitPerformanceItem: {
    marginBottom: 20,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  habitIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  habitSubtitle: {
    fontSize: 12,
  },
  completionRate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  insights: {
    gap: 16,
  },
  insight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  insightText: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  insightDescription: {
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    paddingVertical: 20,
  },
});

export default StatisticsScreen;