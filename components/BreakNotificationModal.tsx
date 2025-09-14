import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Coffee, Play } from 'lucide-react-native';
import { useThemeStore } from '@/stores/themeStore';

interface BreakNotificationModalProps {
  visible: boolean;
  breakDuration: number;
  onContinue: () => void;
}

export function BreakNotificationModal({ visible, breakDuration, onContinue }: BreakNotificationModalProps) {
  const { currentTheme } = useThemeStore();
  const [timeLeft, setTimeLeft] = useState(breakDuration * 60);

  useEffect(() => {
    if (visible) {
      setTimeLeft(breakDuration * 60);
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [visible, breakDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Coffee size={32} color="#F59E0B" />
            <Text style={styles.title}>Break Time! ☕</Text>
          </View>

          <Text style={styles.message}>
            Time for a {breakDuration}-minute break. Stretch, hydrate, or just relax!
          </Text>

          <View style={styles.timer}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentTheme.colors.primary }]}
            onPress={onContinue}
          >
            <Play size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Continue Studying</Text>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  timer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});