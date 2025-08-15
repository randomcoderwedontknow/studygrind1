import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Timer, Clock, Settings, Target, Zap, Moon, Sun } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTimerStore } from '@/stores/timerStore';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import { useFocusShopStore } from '@/stores/focusShopStore';
import { useThemeStore } from '@/stores/themeStore';
import { useDailySpinStore } from '@/stores/dailySpinStore';
import { EnergyMeter } from '@/components/EnergyMeter';
import { QuoteOfTheDay } from '@/components/QuoteOfTheDay';
import { FocusLockIndicator } from '@/components/FocusLockIndicator';
import { DailySpinWheel } from '@/components/DailySpinWheel';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { setMode } = useTimerStore();
  const { tasks } = useTaskStore();
  const { points } = useFocusShopStore();
  const { currentTheme, isDarkMode, toggleDarkMode } = useThemeStore();
  const { canSpin, checkCanSpin, initializeSpin } = useDailySpinStore();
  const [showDailySpin, setShowDailySpin] = React.useState(false);
  
  const userName = user?.name?.split(' ')[0] || "Grinder";
  const dailyGoal = 4;
  const completedSessions = 0;
  const currentStreak = 0;
  
  // Energy meter data
  const currentEnergy = 0; // minutes studied today
  const maxEnergy = 240; // 4 hours = 240 minutes
  const userLevel = 1;
  
  const pendingTasks = tasks.filter(task => !task.completed);

  React.useEffect(() => {
    // Initialize daily spin and check if user can spin
    initializeSpin();
    const canSpinToday = checkCanSpin();
    
    // Show daily spin modal if user can spin (once per day)
    if (canSpinToday) {
      // Delay to let the screen load first
      setTimeout(() => setShowDailySpin(true), 1000);
    }
  }, []);
  const handleQuickStart = (mode: 'pomodoro' | 'extended' | 'custom') => {
    setMode(mode);
    router.push('/(tabs)/timer');
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.colors.primary }]}>
        <View>
          <Text style={styles.greeting}>Let's grind, {userName}!</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.darkModeToggle, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
            onPress={toggleDarkMode}
          >
            {isDarkMode ? (
              <Sun size={20} color="#FFFFFF" />
            ) : (
              <Moon size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
          {user?.isOwner && (
            <View style={styles.ownerBadge}>
              <Text style={styles.ownerText}>Owner</Text>
            </View>
          )}
          <View style={[styles.pointsDisplay, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
            <Text style={styles.pointsValue}>{points}</Text>
            <Text style={styles.pointsLabel}>points</Text>
          </View>
          <View style={[styles.streakContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Focus Lock Indicator */}
        <FocusLockIndicator />

        {/* Quote of the Day */}
        <QuoteOfTheDay />

        {/* Energy Meter */}
        <EnergyMeter 
          currentEnergy={currentEnergy}
          maxEnergy={maxEnergy}
          level={userLevel}
        />

        {/* Daily Goal Progress */}
        <View style={styles.goalSection}>
          <Text style={styles.sectionTitle}>Today's Goal</Text>
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Target size={24} color="#10B981" />
              <Text style={styles.goalText}>
                {completedSessions} of {dailyGoal} sessions completed
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(completedSessions / dailyGoal) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round((completedSessions / dailyGoal) * 100)}% complete
            </Text>
          </View>
        </View>

        {/* Quick Start Buttons */}
        <View style={styles.quickStartSection}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <View style={styles.quickStartGrid}>
            <TouchableOpacity
              style={styles.quickStartButton}
              onPress={() => handleQuickStart('pomodoro')}
            >
              <View style={styles.quickStartIcon}>
                <Timer size={28} color="#10B981" />
              </View>
              <Text style={styles.quickStartTitle}>Pomodoro</Text>
              <Text style={styles.quickStartSubtitle}>25/5 min</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickStartButton}
              onPress={() => handleQuickStart('extended')}
            >
              <View style={styles.quickStartIcon}>
                <Clock size={28} color="#10B981" />
              </View>
              <Text style={styles.quickStartTitle}>Long Focus</Text>
              <Text style={styles.quickStartSubtitle}>60 min</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickStartButton}
              onPress={() => handleQuickStart('custom')}
            >
              <View style={styles.quickStartIcon}>
                <Settings size={28} color="#10B981" />
              </View>
              <Text style={styles.quickStartTitle}>Custom</Text>
              <Text style={styles.quickStartSubtitle}>Your choice</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Add Task Shortcut */}
        <View style={styles.taskSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tasks</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {pendingTasks.length > 0 ? (
            <View style={styles.taskPreview}>
              <Text style={styles.taskCount}>
                {pendingTasks.length} task{pendingTasks.length !== 1 ? 's' : ''} pending
              </Text>
              <TouchableOpacity
                style={styles.addTaskButton}
                onPress={() => router.push('/(tabs)/tasks')}
              >
                <Text style={styles.addTaskText}>Manage Tasks</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addTaskButton}
              onPress={() => router.push('/(tabs)/tasks')}
            >
              <Text style={styles.addTaskText}>Add Your First Task</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Level & Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Zap size={20} color="#10B981" />
              <Text style={styles.statValue}>Level 12</Text>
              <Text style={styles.statLabel}>Current Level</Text>
            </View>
            <View style={styles.statCard}>
              <Target size={20} color="#10B981" />
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Daily Spin Wheel */}
      <DailySpinWheel 
        visible={showDailySpin}
        onClose={() => setShowDailySpin(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  date: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  darkModeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerBadge: {
    backgroundColor: '#D97706',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ownerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pointsDisplay: {
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pointsLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  streakContainer: {
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  streakNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  streakLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  goalSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  goalCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
  },
  quickStartSection: {
    marginBottom: 32,
  },
  quickStartGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickStartButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickStartIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickStartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  quickStartSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  taskSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  taskPreview: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskCount: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  addTaskButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  addTaskText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsSection: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
});