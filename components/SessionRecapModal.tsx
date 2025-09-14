import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Trophy, Clock, Zap, Target } from 'lucide-react-native';
import { useTimerStore } from '@/stores/timerStore';
import { useThemeStore } from '@/stores/themeStore';

export function SessionRecapModal() {
  const { showSessionRecap, sessionStats } = useTimerStore();
  const { currentTheme } = useThemeStore();

  const handleClose = () => {
    const { set } = useTimerStore.getState();
    set({ showSessionRecap: false, sessionStats: null });
  };

  if (!showSessionRecap || !sessionStats) return null;

  return (
    <Modal
      visible={showSessionRecap}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Trophy size={32} color="#F59E0B" />
            <Text style={styles.title}>Session Complete! 🎉</Text>
          </View>

          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Clock size={24} color={currentTheme.colors.primary} />
              <Text style={styles.statValue}>{sessionStats.duration}min</Text>
              <Text style={styles.statLabel}>Study Time</Text>
            </View>
            
            <View style={styles.statItem}>
              <Zap size={24} color="#F59E0B" />
              <Text style={styles.statValue}>{sessionStats.pointsEarned}</Text>
              <Text style={styles.statLabel}>Points Earned</Text>
            </View>
            
            <View style={styles.statItem}>
              <Target size={24} color="#10B981" />
              <Text style={styles.statValue}>{sessionStats.tasksCompleted}</Text>
              <Text style={styles.statLabel}>Tasks Done</Text>
            </View>
          </View>

          <Text style={styles.message}>
            Great job! You're building consistent study habits.
          </Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentTheme.colors.primary }]}
            onPress={handleClose}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 350,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});