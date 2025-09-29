import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Lock, Clock } from 'lucide-react-native';
import { useFocusLockStore } from '@/stores/focusLockStore';
import { useThemeStore } from '@/stores/themeStore';

interface FocusLockOverlayProps {
  pageName: string;
  pageIcon: string;
}

export function FocusLockOverlay({ pageName, pageIcon }: FocusLockOverlayProps) {
  const { lockEndTime, lockReason, unlockAllPages } = useFocusLockStore();
  const { currentTheme } = useThemeStore();

  const getTimeRemaining = () => {
    if (!lockEndTime) return '';
    
    const now = new Date();
    const remaining = lockEndTime.getTime() - now.getTime();
    
    if (remaining <= 0) {
      unlockAllPages();
      return '';
    }
    
    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const timeRemaining = getTimeRemaining();

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Lock size={48} color="#EF4444" />
        </View>
        
        <Text style={styles.emoji}>{pageIcon}</Text>
        
        <Text style={styles.title}>
          {pageName} is Locked
        </Text>
        
        <Text style={styles.reason}>
          {lockReason || 'This page is temporarily locked to help you focus.'}
        </Text>
        
        {timeRemaining && (
          <View style={styles.timerContainer}>
            <Clock size={20} color="#6B7280" />
            <Text style={styles.timeRemaining}>
              {timeRemaining} remaining
            </Text>
          </View>
        )}
        
        <Text style={styles.encouragement}>
          Stay focused! You can do this! 💪
        </Text>
        
        <TouchableOpacity
          style={[styles.emergencyButton, { borderColor: currentTheme.colors.primary }]}
          onPress={unlockAllPages}
        >
          <Text style={[styles.emergencyButtonText, { color: currentTheme.colors.primary }]}>
            Emergency Unlock
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '85%',
    maxWidth: 350,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  reason: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  timeRemaining: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  encouragement: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  emergencyButton: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emergencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});