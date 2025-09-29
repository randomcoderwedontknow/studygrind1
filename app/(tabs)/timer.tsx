import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Pause, Square, Settings, Volume2, X, CircleStop as StopCircle } from 'lucide-react-native';
import { useTimerStore } from '@/stores/timerStore';
import { useTaskStore } from '@/stores/taskStore';
import { useThemeStore } from '@/stores/themeStore';
import { TimerModeSelector } from '@/components/TimerModeSelector';
import { ActiveTask } from '@/components/ActiveTask';
import { SessionRecapModal } from '@/components/SessionRecapModal';
import { BreakNotificationModal } from '@/components/BreakNotificationModal';

const { width } = Dimensions.get('window');

export default function TimerScreen() {
  const {
    timeLeft,
    isRunning,
    canEndEarly,
    currentMode,
    currentSession,
    customDuration,
    scheduledBreaks,
    currentBreak,
    isOnBreak,
    startTimer,
    pauseTimer,
    stopTimer,
    endSessionEarly,
    endBreak,
    setCustomDuration,
  } = useTimerStore();

  const { activeTask } = useTaskStore();
  const { currentTheme } = useThemeStore();
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('25');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerModeDisplay = () => {
    switch (currentMode) {
      case 'pomodoro':
        return currentSession === 'work' ? 'Focus Time' : 'Break Time';
      case 'extended':
        return 'Deep Focus';
      case 'custom':
        return 'Custom Session';
      default:
        return 'Study Session';
    }
  };

  const getTotalTime = () => {
    switch (currentMode) {
      case 'pomodoro':
        return currentSession === 'work' ? 1500 : 300;
      case 'extended':
        return 3600;
      case 'custom':
        return customDuration;
      default:
        return 1500;
    }
  };

  const progress = (getTotalTime() - timeLeft) / getTotalTime();

  const handleCustomTimer = () => {
    const minutes = parseInt(customMinutes);
    if (minutes > 0 && minutes <= 180) {
      setCustomDuration(minutes * 60);
      setShowCustomModal(false);
    }
  };

  const handleEndEarly = () => {
    Alert.alert(
      'End Session Early?',
      'Are you sure you want to end this session? You\'ll still earn points for the time you\'ve studied.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Session', 
          style: 'destructive',
          onPress: endSessionEarly
        }
      ]
    );
  };

  const getNextBreakInfo = () => {
    if (scheduledBreaks.length === 0) return null;
    
    const totalTime = getTotalTime();
    const elapsedTime = totalTime - timeLeft;
    const elapsedMinutes = Math.floor(elapsedTime / 60);
    
    const nextBreak = scheduledBreaks.find(b => b.minute > elapsedMinutes && !b.taken);
    return nextBreak;
  };

  const nextBreak = getNextBreakInfo();
  
  // Initialize breaks when active task changes
  React.useEffect(() => {
    if (activeTask?.customBreaks) {
      const breaks = activeTask.customBreaks.map(b => ({ ...b, taken: false }));
      setScheduledBreaks(breaks);
    } else {
      setScheduledBreaks([]);
    }
  }, [activeTask]);
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Timer</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Volume2 size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowCustomModal(true)}
          >
            <Settings size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Timer Mode Selector */}
        <TimerModeSelector />

        {/* Main Timer Circle */}
        <View style={styles.timerContainer}>
          <View style={styles.timerCircle}>
            <svg
              width={width * 0.7}
              height={width * 0.7}
              style={styles.progressRing}
            >
              <circle
                cx={width * 0.35}
                cy={width * 0.35}
                r={width * 0.32}
                stroke="#E5E7EB"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx={width * 0.35}
                cy={width * 0.35}
                r={width * 0.32}
                stroke={isRunning ? '#10B981' : '#6B7280'}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * width * 0.32}`}
                strokeDashoffset={`${2 * Math.PI * width * 0.32 * (1 - progress)}`}
                strokeLinecap="round"
                transform={`rotate(-90 ${width * 0.35} ${width * 0.35})`}
              />
            </svg>
            <View style={styles.timerContent}>
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              <Text style={styles.sessionType}>{getTimerModeDisplay()}</Text>
            </View>
          </View>
        </View>

        {/* Scheduled Breaks Info */}
        {scheduledBreaks.length > 0 && (
          <View style={styles.breaksInfo}>
            <Text style={styles.breaksTitle}>Scheduled Breaks</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {scheduledBreaks.map((breakItem, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.breakChip,
                    breakItem.taken && styles.takenBreakChip,
                    nextBreak?.minute === breakItem.minute && styles.nextBreakChip,
                  ]}
                >
                  <Coffee size={12} color={
                    breakItem.taken ? '#9CA3AF' : 
                    nextBreak?.minute === breakItem.minute ? '#F59E0B' : '#6B7280'
                  } />
                  <Text style={[
                    styles.breakChipText,
                    breakItem.taken && styles.takenBreakText,
                    nextBreak?.minute === breakItem.minute && styles.nextBreakText,
                  ]}>
                    {breakItem.minute}min
                  </Text>
                </View>
              ))}
            </ScrollView>
            {nextBreak && (
              <Text style={styles.nextBreakInfo}>
                Next break at {nextBreak.minute} minutes ({nextBreak.duration}m break)
              </Text>
            )}
          </View>
        )}

        {/* Active Task */}
        <ActiveTask />

        {/* Timer Controls */}
        <View style={styles.controls}>
          {canEndEarly ? (
            <TouchableOpacity
              style={[styles.controlButton, styles.endEarlyButton]}
              onPress={handleEndEarly}
            >
              <StopCircle size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton]}
              onPress={stopTimer}
            >
              <Square size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.primaryButton, 
              isRunning 
                ? { backgroundColor: currentTheme.colors.warning }
                : { backgroundColor: currentTheme.colors.primary }
            ]}
            onPress={isRunning ? pauseTimer : startTimer}
          >
            {isRunning ? (
              <Pause size={28} color="#FFFFFF" />
            ) : (
              <Play size={28} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => setShowCustomModal(true)}
          >
            <Settings size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Session Recap Modal */}
      <SessionRecapModal />

      {/* Break Notification Modal */}
      <BreakNotificationModal
        visible={isOnBreak}
        breakDuration={currentBreak?.duration || 5}
        onContinue={endBreak}
      />

      {/* Custom Timer Modal */}
      <Modal
        visible={showCustomModal}
        animationType="slide"
        presentationStyle="pageSheet"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Custom Timer</Text>
              <TouchableOpacity onPress={() => setShowCustomModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Duration (minutes)</Text>
              <TextInput
                style={styles.input}
                value={customMinutes}
                onChangeText={setCustomMinutes}
                keyboardType="numeric"
                placeholder="Enter minutes (1-180)"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.inputHint}>
                Set a custom duration between 1 and 180 minutes
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCustomModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.setButton}
                onPress={handleCustomTimer}
              >
                <Text style={styles.setText}>Set Timer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  timerCircle: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  progressRing: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  timerContent: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  sessionType: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginVertical: 32,
  },
  primaryButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  playButton: {
    backgroundColor: '#10B981',
  },
  pauseButton: {
    backgroundColor: '#F59E0B',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  stopButton: {
    backgroundColor: '#EF4444',
  },
  endEarlyButton: {
    backgroundColor: '#F59E0B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: width * 0.9,
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalBody: {
    padding: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 8,
  },
  inputHint: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  setButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  setText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  breaksInfo: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  breaksTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  breakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  takenBreakChip: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  nextBreakChip: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  breakChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  takenBreakText: {
    color: '#9CA3AF',
  },
  nextBreakText: {
    color: '#D97706',
  },
  nextBreakInfo: {
    fontSize: 12,
    color: '#D97706',
    marginTop: 8,
    textAlign: 'center',
  },
});