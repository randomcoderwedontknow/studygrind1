import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Timer, Target, TrendingUp, Award } from 'lucide-react-native';
import { useThemeStore } from '../stores/themeStore';

export default function OnboardingScreen() {
  const { currentTheme } = useThemeStore();

  const features = [
    {
      icon: <Timer size={32} color="#10B981" />,
      title: 'Stay Focused',
      description: 'Powerful timer system with Pomodoro, Long Sessions, and Custom modes to match your workflow',
    },
    {
      icon: <Target size={32} color="#10B981" />,
      title: 'Reach Your Goals',
      description: 'Track your progress with detailed stats, daily targets, and visual analytics',
    },
    {
      icon: <TrendingUp size={32} color="#10B981" />,
      icon: <Award size={32} color="#10B981" />,
      title: 'Grind and Level Up',
      description: 'Build streaks, unlock achievement badges, and level up as you develop consistent study habits',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Timer size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>StudyGrind</Text>
        </View>
        <Text style={styles.tagline}>Grind smarter. Focus longer. Achieve more.</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.featuresTitle}>Everything you need to succeed</Text>
        
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                {feature.icon}
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.getStartedButton, { backgroundColor: currentTheme.colors.primary }]}
          onPress={() => router.push('/auth')}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
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
    paddingVertical: 40,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginVertical: 32,
  },
  featuresContainer: {
    gap: 20,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  getStartedButton: {
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
  getStartedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});