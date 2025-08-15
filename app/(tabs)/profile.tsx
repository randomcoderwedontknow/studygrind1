import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, Target, Clock, Zap, Calendar, Award, TrendingUp, BookOpen, SquareCheck as CheckSquare, Flame, User, Crown, Star, ChartBar as BarChart3 } from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { useTimerStore } from '@/stores/timerStore';
import { useTaskStore } from '@/stores/taskStore';
import { useCardsStore } from '@/stores/cardsStore';
import { useFocusShopStore } from '@/stores/focusShopStore';
import { useThemeStore } from '@/stores/themeStore';
import { useFocusLockStore } from '@/stores/focusLockStore';
import { LevelProgress } from '@/components/LevelProgress';
import { FocusLockOverlay } from '@/components/FocusLockOverlay';

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { user: userProfile, level, experiencePoints } = useUserStore();
  const { completedSessions, totalStudyTime, currentStreak } = useTimerStore();
  const { tasks, completedTasks } = useTaskStore();
  const { decks } = useCardsStore();
  const { points } = useFocusShopStore();
  const { currentTheme } = useThemeStore();
  const { isPageLocked } = useFocusLockStore();

  const isLocked = isPageLocked('/(tabs)/profile');

  // Calculate stats
  const totalTasks = tasks.length + completedTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  const totalCards = decks.reduce((sum, deck) => sum + deck.cards.length, 0);
  const averageSessionTime = completedSessions > 0 ? Math.round(totalStudyTime / completedSessions) : 0;
  
  // Mock achievements - in a real app these would come from an achievements store
  const achievements = [
    { id: 1, name: 'First Steps', description: 'Complete your first study session', icon: '🎯', unlocked: completedSessions > 0, progress: Math.min(completedSessions, 1), total: 1 },
    { id: 2, name: 'Task Master', description: 'Complete 10 tasks', icon: '✅', unlocked: completedTasks.length >= 10, progress: Math.min(completedTasks.length, 10), total: 10 },
    { id: 3, name: 'Study Streak', description: 'Maintain a 7-day study streak', icon: '🔥', unlocked: currentStreak >= 7, progress: Math.min(currentStreak, 7), total: 7 },
    { id: 4, name: 'Flashcard Pro', description: 'Create 50 flashcards', icon: '🃏', unlocked: totalCards >= 50, progress: Math.min(totalCards, 50), total: 50 },
    { id: 5, name: 'Time Warrior', description: 'Study for 100 hours total', icon: '⏰', unlocked: totalStudyTime >= 6000, progress: Math.min(totalStudyTime, 6000), total: 6000 },
    { id: 6, name: 'Level Up', description: 'Reach level 10', icon: '🚀', unlocked: level >= 10, progress: Math.min(level, 10), total: 10 },
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const nextAchievement = achievements.find(a => !a.unlocked);

  return (
    <SafeAreaView style={styles.container}>
      {/* Focus Lock Overlay */}
      {isLocked && <FocusLockOverlay pageName="Profile" pageIcon="👤" />}

      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.colors.primary }]}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Your study journey</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color={currentTheme.colors.primary} />
            </View>
            <View style={styles.levelBadge}>
              <Crown size={16} color="#F59E0B" />
              <Text style={styles.levelText}>{level}</Text>
            </View>
            {user?.isOwner && (
              <View style={styles.ownerBadge}>
                <Text style={styles.ownerBadgeText}>Owner</Text>
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || 'Study Grinder'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@studygrind.com'}</Text>
            <Text style={styles.userStats}>
              {userProfile?.dateJoined ? new Date(userProfile.dateJoined).toLocaleDateString() : 'Today'}
            </Text>
            <LevelProgress 
              currentXP={experiencePoints} 
              level={level}
            />
          </View>
        </View>

        {/* Study Statistics */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Study Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#ECFDF5' }]}>
                <Clock size={20} color="#10B981" />
              </View>
              <Text style={styles.statValue}>{Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m</Text>
              <Text style={styles.statLabel}>Total Study Time</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
                <Target size={20} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>{completedSessions}</Text>
              <Text style={styles.statLabel}>Sessions Completed</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
                <Flame size={20} color="#EF4444" />
              </View>
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#EEF2FF' }]}>
                <CheckSquare size={20} color="#6366F1" />
              </View>
              <Text style={styles.statValue}>{completedTasks.length}</Text>
              <Text style={styles.statLabel}>Tasks Completed</Text>
            </View>
          </View>
        </View>

        {/* Performance Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Insights</Text>
          <View style={styles.insightsContainer}>
            <View style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <BarChart3 size={20} color="#10B981" />
                <Text style={styles.insightTitle}>Task Completion Rate</Text>
              </View>
              <Text style={styles.insightValue}>{completionRate}%</Text>
              <Text style={styles.insightDescription}>
                {completionRate >= 80 ? 'Excellent completion rate!' : 
                 completionRate >= 60 ? 'Good progress, keep it up!' : 
                 'Room for improvement - you got this!'}
              </Text>
            </View>
            
            <View style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <TrendingUp size={20} color="#6366F1" />
                <Text style={styles.insightTitle}>Average Session</Text>
              </View>
              <Text style={styles.insightValue}>{averageSessionTime}min</Text>
              <Text style={styles.insightDescription}>
                {averageSessionTime >= 25 ? 'Great focus duration!' : 
                 averageSessionTime > 0 ? 'Try longer sessions for deeper focus' : 
                 'Start your first session!'}
              </Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Text style={styles.achievementCount}>{unlockedAchievements.length}/{achievements.length}</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsScroll}>
            {achievements.map((achievement) => (
              <View key={achievement.id} style={[
                styles.achievementCard,
                achievement.unlocked ? styles.unlockedAchievement : styles.lockedAchievement
              ]}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={[
                  styles.achievementName,
                  !achievement.unlocked && styles.lockedText
                ]}>
                  {achievement.name}
                </Text>
                <Text style={[
                  styles.achievementDescription,
                  !achievement.unlocked && styles.lockedText
                ]}>
                  {achievement.description}
                </Text>
                {!achievement.unlocked && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${(achievement.progress / achievement.total) * 100}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {achievement.progress}/{achievement.total}
                    </Text>
                  </View>
                )}
                {achievement.unlocked && (
                  <View style={styles.unlockedBadge}>
                    <Award size={16} color="#F59E0B" />
                    <Text style={styles.unlockedText}>Unlocked!</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Next Goal */}
        {nextAchievement && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Next Goal</Text>
            <View style={styles.nextGoalCard}>
              <View style={styles.nextGoalHeader}>
                <Text style={styles.nextGoalIcon}>{nextAchievement.icon}</Text>
                <View style={styles.nextGoalInfo}>
                  <Text style={styles.nextGoalName}>{nextAchievement.name}</Text>
                  <Text style={styles.nextGoalDescription}>{nextAchievement.description}</Text>
                </View>
              </View>
              <View style={styles.nextGoalProgress}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(nextAchievement.progress / nextAchievement.total) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.nextGoalProgressText}>
                  {nextAchievement.progress}/{nextAchievement.total}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Study Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Overview</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryLeft}>
                <BookOpen size={16} color="#6B7280" />
                <Text style={styles.summaryLabel}>Flashcard Decks</Text>
              </View>
              <Text style={styles.summaryValue}>{decks.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryLeft}>
                <Target size={16} color="#6B7280" />
                <Text style={styles.summaryLabel}>Active Tasks</Text>
              </View>
              <Text style={styles.summaryValue}>{tasks.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryLeft}>
                <Zap size={16} color="#6B7280" />
                <Text style={styles.summaryLabel}>Focus Points</Text>
              </View>
              <Text style={styles.summaryValue}>{points}</Text>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryLeft}>
                <Calendar size={16} color="#6B7280" />
                <Text style={styles.summaryLabel}>Member Since</Text>
              </View>
              <Text style={styles.summaryValue}>
                {user?.dateJoined ? new Date(user.dateJoined).toLocaleDateString() : 'Today'}
              </Text>
            </View>
          </View>
        </View>
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
  profileCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  ownerBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#D97706',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  ownerBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400E',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  userStats: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  achievementCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  statsSection: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  insightsContainer: {
    gap: 12,
  },
  insightCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 20,
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
  achievementsScroll: {
    paddingRight: 24,
  },
  achievementCard: {
    width: 160,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
  },
  unlockedAchievement: {
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  lockedAchievement: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  lockedText: {
    color: '#9CA3AF',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#6B7280',
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unlockedText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  nextGoalCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  nextGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  nextGoalIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  nextGoalInfo: {
    flex: 1,
  },
  nextGoalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  nextGoalDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  nextGoalProgress: {
    alignItems: 'center',
  },
  nextGoalProgressText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#374151',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
});