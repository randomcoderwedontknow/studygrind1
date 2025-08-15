import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Timer, Clock, Settings, Target, Volume2 } from 'lucide-react-native';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useTimerStore } from '@/stores/timerStore';
import { useThemeStore } from '@/stores/themeStore';

export default function SetupScreen() {
  const { completeOnboarding } = useOnboardingStore();
  const { setMode, setCustomDuration } = useTimerStore();
  const { currentTheme } = useThemeStore();
  
  const [selectedTimer, setSelectedTimer] = useState<'pomodoro' | 'extended' | 'custom'>('pomodoro');
  const [dailyGoal, setDailyGoal] = useState(4);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerOptions = [
    {
      id: 'pomodoro' as const,
      title: 'Pomodoro',
      subtitle: '25 min focus + 5 min break',
      icon: <Timer size={24} color={selectedTimer === 'pomodoro' ? '#FFFFFF' : '#10B981'} />,
    },
    {
      id: 'extended' as const,
      title: 'Long Session',
      subtitle: '60 min deep focus',
      icon: <Clock size={24} color={selectedTimer === 'extended' ? '#FFFFFF' : '#10B981'} />,
    },
    {
      id: 'custom' as const,
      title: 'Custom',
      subtitle: 'Set your own duration',
      icon: <Settings size={24} color={selectedTimer === 'custom' ? '#FFFFFF' : '#10B981'} />,
    },
  ];

  const goalOptions = [2, 3, 4, 5, 6];

  const handleContinue = () => {
    setMode(selectedTimer);
    completeOnboarding();
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Let's set you up</Text>
        <Text style={styles.subtitle}>Customize StudyGrind to match your workflow</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Timer Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose your default timer</Text>
          <View style={styles.optionsContainer}>
            {timerOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.timerOption,
                  selectedTimer === option.id && styles.selectedTimerOption,
                ]}
                onPress={() => setSelectedTimer(option.id)}
              >
                <View style={styles.timerIcon}>
                  {option.icon}
                </View>
                <View style={styles.timerContent}>
                  <Text
                    style={[
                      styles.timerTitle,
                      selectedTimer === option.id && styles.selectedTimerTitle,
                    ]}
                  >
                    {option.title}
                  </Text>
                  <Text
                    style={[
                      styles.timerSubtitle,
                      selectedTimer === option.id && styles.selectedTimerSubtitle,
                    ]}
                  >
                    {option.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Daily Goal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Set your daily goal</Text>
          <View style={styles.goalContainer}>
            {goalOptions.map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.goalOption,
                  dailyGoal === goal && styles.selectedGoalOption,
                ]}
                onPress={() => setDailyGoal(goal)}
              >
                <Target size={16} color={dailyGoal === goal ? '#FFFFFF' : '#10B981'} />
                <Text
                  style={[
                    styles.goalText,
                    dailyGoal === goal && styles.selectedGoalText,
                  ]}
                >
                  {goal} sessions
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sound Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio preferences</Text>
          <View style={styles.soundOption}>
            <View style={styles.soundContent}>
              <View style={styles.soundIcon}>
                <Volume2 size={20} color="#10B981" />
              </View>
              <View>
                <Text style={styles.soundTitle}>Sound effects & ambient noises</Text>
                <Text style={styles.soundSubtitle}>Timer sounds and focus music</Text>
              </View>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
              thumbColor={soundEnabled ? '#10B981' : '#9CA3AF'}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: currentTheme.colors.primary }]}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>Save & Continue</Text>
        </TouchableOpacity>
      </View>
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
    paddingVertical: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  timerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedTimerOption: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  timerIcon: {
    marginRight: 16,
  },
  timerContent: {
    flex: 1,
  },
  timerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  selectedTimerTitle: {
    color: '#FFFFFF',
  },
  timerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedTimerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  goalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  selectedGoalOption: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  goalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  selectedGoalText: {
    color: '#FFFFFF',
  },
  soundOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
  },
  soundContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  soundIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  soundTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  soundSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  continueButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  continueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});