import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp, 
  Award, 
  ArrowRight,
  Star,
  Zap
} from 'lucide-react-native';

export default function WeeklyReviewScreen() {
  const weeklyStats = {
    totalHours: 12.5,
    totalSessions: 18,
    longestStreak: 5,
    mostProductiveDay: 'Wednesday',
    completedTasks: 14,
    averageSessionLength: 42,
    improvementFromLastWeek: 15, // percentage
  };

  const nextWeekGoal = Math.ceil(weeklyStats.totalHours * 1.1); // 10% increase

  const achievements = [
    { title: 'Consistency Champion', description: 'Studied 5 days in a row' },
    { title: 'Task Master', description: 'Completed 14 tasks this week' },
    { title: 'Focus Warrior', description: 'Average session over 40 minutes' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Review</Text>
        <Text style={styles.subtitle}>
          {new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} - {new Date().toLocaleDateString()}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Celebration Banner */}
        <View style={styles.celebrationBanner}>
          <View style={styles.celebrationIcon}>
            <Star size={32} color="#F59E0B" />
          </View>
          <View style={styles.celebrationContent}>
            <Text style={styles.celebrationTitle}>Great Week!</Text>
            <Text style={styles.celebrationText}>
              You studied {weeklyStats.totalHours} hours and completed {weeklyStats.completedTasks} tasks
            </Text>
          </View>
        </View>

        {/* Key Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week's Highlights</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Clock size={24} color="#10B981" />
              <Text style={styles.statValue}>{weeklyStats.totalHours}h</Text>
              <Text style={styles.statLabel}>Total Study Time</Text>
            </View>
            <View style={styles.statCard}>
              <Target size={24} color="#6366F1" />
              <Text style={styles.statValue}>{weeklyStats.totalSessions}</Text>
              <Text style={styles.statLabel}>Sessions Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Zap size={24} color="#F59E0B" />
              <Text style={styles.statValue}>{weeklyStats.longestStreak}</Text>
              <Text style={styles.statLabel}>Longest Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Calendar size={24} color="#EF4444" />
              <Text style={styles.statValue}>{weeklyStats.mostProductiveDay}</Text>
              <Text style={styles.statLabel}>Most Productive</Text>
            </View>
          </View>
        </View>

        {/* Performance Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Insights</Text>
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <TrendingUp size={20} color="#10B981" />
              <Text style={styles.insightTitle}>Week-over-Week Growth</Text>
            </View>
            <Text style={styles.insightValue}>+{weeklyStats.improvementFromLastWeek}%</Text>
            <Text style={styles.insightDescription}>
              You improved your study time by {weeklyStats.improvementFromLastWeek}% compared to last week!
            </Text>
          </View>
          
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Clock size={20} color="#6366F1" />
              <Text style={styles.insightTitle}>Average Session Length</Text>
            </View>
            <Text style={styles.insightValue}>{weeklyStats.averageSessionLength} min</Text>
            <Text style={styles.insightDescription}>
              Your focus sessions are getting longer - great job maintaining concentration!
            </Text>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Achievements</Text>
          {achievements.map((achievement, index) => (
            <View key={index} style={styles.achievementCard}>
              <View style={styles.achievementIcon}>
                <Award size={20} color="#F59E0B" />
              </View>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Next Week Goal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Week's Goal</Text>
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Target size={24} color="#10B981" />
              <Text style={styles.goalTitle}>Suggested Goal</Text>
            </View>
            <Text style={styles.goalValue}>{nextWeekGoal} hours</Text>
            <Text style={styles.goalDescription}>
              Based on your progress, we suggest aiming for {nextWeekGoal} hours of study time next week.
            </Text>
          </View>
        </View>

        {/* Motivational Message */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationTitle}>Keep Up the Momentum! 🚀</Text>
          <Text style={styles.motivationText}>
            You're building incredible study habits. Every session counts, and your consistency 
            is paying off. Ready to make next week even better?
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: currentTheme.colors.primary }]}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.continueText}>Continue Grinding</Text>
          <ArrowRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  celebrationBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  celebrationIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FED7AA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  celebrationContent: {
    flex: 1,
  },
  celebrationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 4,
  },
  celebrationText: {
    fontSize: 14,
    color: '#D97706',
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  insightCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  insightValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  achievementCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FED7AA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#D97706',
    marginTop: 2,
  },
  goalCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065F46',
  },
  goalValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  goalDescription: {
    fontSize: 14,
    color: '#047857',
    textAlign: 'center',
    lineHeight: 20,
  },
  motivationCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3730A3',
    marginBottom: 12,
    textAlign: 'center',
  },
  motivationText: {
    fontSize: 14,
    color: '#4338CA',
    textAlign: 'center',
    lineHeight: 22,
  },
  continueButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});