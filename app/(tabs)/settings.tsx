import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Settings as SettingsIcon, 
  Trophy, 
  Target, 
  Bell, 
  Volume2, 
  Moon, 
  Sun,
  ChevronRight, 
  User, 
  Crown, 
  Download, 
  RotateCcw, 
  LogOut,
  X,
  Focus,
  Shield
} from 'lucide-react-native';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useFocusModeStore } from '@/stores/focusModeStore';
import { useFocusLockStore } from '@/stores/focusLockStore';
import { LevelProgress } from '@/components/LevelProgress';
import { SettingItem } from '@/components/SettingItem';
import { FocusLockSetupModal } from '@/components/FocusLockSetupModal';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { user, signOut } = useAuthStore();
  const { user: userProfile, level, experiencePoints } = useUserStore();
  const { currentTheme, isDarkMode, toggleDarkMode } = useThemeStore();
  const { isFocusModeActive, setFocusMode } = useFocusModeStore();
  const { 
    isEnabled: focusLockEnabled, 
    setEnabled: setFocusLockEnabled,
    showSetup: showFocusLockSetup,
    hasCompletedSetup,
    lockedPages,
    availablePages,
  } = useFocusLockStore();
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const handleFocusLockToggle = (enabled: boolean) => {
    if (enabled && !hasCompletedSetup) {
      // Will trigger setup modal
      setFocusLockEnabled(true);
    } else {
      setFocusLockEnabled(enabled);
    }
  };

  const handleEditFocusLock = () => {
    showFocusLockSetup();
  };

  const handleExportProgress = () => {
    Alert.alert(
      'Export Progress',
      'Your progress report will be generated and saved to your device.',
      [{ text: 'OK' }]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your progress, tasks, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            signOut();
            setTimeout(() => {
              router.replace('/auth');
            }, 0);
          }
        }
      ]
    );
  };

  const handleOwnerSettings = () => {
    router.push('/owner-settings');
  };

  const handleSignOut = () => {
    setShowSignOutModal(false);
    signOut();
    setTimeout(() => {
      router.replace('/auth');
    }, 0);
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.colors.primary }]}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={32} color="#10B981" />
            </View>
            <View style={styles.levelBadge}>
              <Crown size={16} color="#F59E0B" />
              <Text style={styles.levelText}>{level}</Text>
            </View>
            {user?.isOwner && (
              <TouchableOpacity 
                style={styles.ownerBadge}
                onPress={handleOwnerSettings}
              >
                <Text style={styles.ownerBadgeText}>Owner</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || 'Study Grinder'}</Text>
            <Text style={styles.userStats}>
              Level {level} Study Grinder
            </Text>
            <LevelProgress 
              currentXP={experiencePoints} 
              level={level}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Target size={24} color="#10B981" />
              <Text style={styles.quickActionText}>Set Goals</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.settingsContainer}>
            {user?.isOwner && (
              <SettingItem
                icon={<Shield size={20} color="#D97706" />}
                title="Owner Settings"
                subtitle="Administrative tools and advanced controls"
                rightElement={<ChevronRight size={20} color="#9CA3AF" />}
                onPress={handleOwnerSettings}
              />
            )}
            <SettingItem
              icon={<Focus size={20} color="#6B7280" />}
              title="Focus Lock"
              subtitle={
                focusLockEnabled 
                  ? `${lockedPages.length} page${lockedPages.length !== 1 ? 's' : ''} locked during sessions`
                  : "Lock distracting pages during timer sessions"
              }
              rightElement={
                <View style={styles.focusLockControls}>
                  {focusLockEnabled && hasCompletedSetup && (
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={handleEditFocusLock}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                  )}
                  <Switch
                    value={focusLockEnabled}
                    onValueChange={handleFocusLockToggle}
                    trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
                    thumbColor={focusLockEnabled ? '#10B981' : '#9CA3AF'}
                  />
                </View>
              }
            />
            <SettingItem
              icon={<Focus size={20} color="#6B7280" />}
              title="Focus Mode Lock"
              subtitle="Auto-hide distracting features during timer sessions"
              rightElement={
                <Switch
                  value={isFocusModeActive}
                  onValueChange={setFocusMode}
                  trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
                  thumbColor={isFocusModeActive ? '#10B981' : '#9CA3AF'}
                />
              }
            />
            <SettingItem
              icon={<Bell size={20} color="#6B7280" />}
              title="Notifications"
              subtitle="Get reminders and session alerts"
              rightElement={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
                  thumbColor={notifications ? '#10B981' : '#9CA3AF'}
                />
              }
            />
            <SettingItem
              icon={<Volume2 size={20} color="#6B7280" />}
              title="Sound Effects"
              subtitle="Timer sounds and ambient noise"
              rightElement={
                <Switch
                  value={sounds}
                  onValueChange={setSounds}
                  trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
                  thumbColor={sounds ? '#10B981' : '#9CA3AF'}
                />
              }
            />
            <SettingItem
              icon={isDarkMode ? <Moon size={20} color="#6B7280" /> : <Sun size={20} color="#6B7280" />}
              title="Dark Mode"
              subtitle={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
              rightElement={
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleDarkMode}
                  trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
                  thumbColor={isDarkMode ? '#10B981' : '#9CA3AF'}
                />
              }
            />
          </View>
        </View>

        {/* Study Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Preferences</Text>
          <View style={styles.settingsContainer}>
            <SettingItem
              icon={<SettingsIcon size={20} color="#6B7280" />}
              title="Timer Settings"
              subtitle="Customize your study sessions"
              rightElement={<ChevronRight size={20} color="#9CA3AF" />}
              onPress={() => {}}
            />
            <SettingItem
              icon={<Target size={20} color="#6B7280" />}
              title="Goals & Targets"
              subtitle="Set daily and weekly objectives"
              rightElement={<ChevronRight size={20} color="#9CA3AF" />}
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Data & Export */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Export</Text>
          <View style={styles.settingsContainer}>
            <SettingItem
              icon={<Download size={20} color="#6B7280" />}
              title="Export Progress"
              subtitle="Download your study data as PDF"
              rightElement={<ChevronRight size={20} color="#9CA3AF" />}
              onPress={handleExportProgress}
            />
            <SettingItem
              icon={<RotateCcw size={20} color="#EF4444" />}
              title="Reset All Data"
              subtitle="Clear all progress and start fresh"
              rightElement={<ChevronRight size={20} color="#9CA3AF" />}
              onPress={handleResetData}
            />
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <View style={styles.settingsContainer}>
            <SettingItem
              icon={<LogOut size={20} color="#EF4444" />}
              title="Sign Out"
              subtitle="Log out of your account"
              rightElement={<ChevronRight size={20} color="#9CA3AF" />}
              onPress={() => setShowSignOutModal(true)}
            />
          </View>
        </View>

        {/* Weekly Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week's Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sessions Completed</Text>
              <Text style={styles.summaryValue}>0</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Study Time</Text>
              <Text style={styles.summaryValue}>0 hours</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Average Session</Text>
              <Text style={styles.summaryValue}>0 minutes</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Longest Streak</Text>
              <Text style={styles.summaryValue}>0 days</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Focus Lock Setup Modal */}
      <FocusLockSetupModal />

      {/* Sign Out Modal */}
      <Modal
        visible={showSignOutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSignOutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.signOutModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sign Out</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSignOutModal(false)}
              >
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.signOutIcon}>
                <LogOut size={32} color="#EF4444" />
              </View>
              <Text style={styles.modalMessage}>Are you sure you want to sign out?</Text>
              <Text style={styles.modalSubMessage}>
                Don't worry, your progress will be saved and you can sign back in anytime.
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowSignOutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={handleSignOut}
              >
                <Text style={styles.signOutButtonText}>Sign Out</Text>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
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
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400E',
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
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  settingsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  signOutModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 24,
    alignItems: 'center',
  },
  signOutIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  signOutButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  focusLockControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editButton: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4338CA',
  },
});