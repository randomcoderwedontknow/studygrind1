import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { X, Users, MessageSquare, ChartBar as BarChart3, Palette, Shield, Download, Trash2, Plus, CreditCard as Edit, Search, UserPlus } from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';

export default function OwnerSettingsScreen() {
  const { allUsers, deleteUser, resetUserPassword, loadAllUsers } = useAuthStore();
  const { 
    motivationMessages, 
    defaultTasks, 
    primaryColor, 
    accentColor,
    addMotivationMessage,
    removeMotivationMessage,
    addDefaultTask,
    removeDefaultTask,
    updateColors,
    exportData,
    clearTestData
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newTask, setNewTask] = useState('');
  const [newPrimaryColor, setNewPrimaryColor] = useState(primaryColor);
  const [newAccentColor, setNewAccentColor] = useState(accentColor);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [showDeleteUserModal, setShowDeleteUserModal] = useState<{show: boolean, userId: string, userName: string}>({show: false, userId: '', userName: ''});
  const [showResetPasswordModal, setShowResetPasswordModal] = useState<{show: boolean, userId: string, userName: string, newPassword: string}>({show: false, userId: '', userName: '', newPassword: ''});
  const [showExportModal, setShowExportModal] = useState(false);
  const [showClearDataModal, setShowClearDataModal] = useState(false);

  React.useEffect(() => {
    // Load all users when component mounts
    loadAllUsers();
  }, []);

  const filteredUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUsers = allUsers.length + 1; // +1 for owner account
  const totalHours = allUsers.reduce((sum, user) => sum + user.totalHours, 0);
  const mostPopularTimer = 'Pomodoro'; // Mock data

  const handleDeleteUser = (userId: string, userName: string) => {
    setShowDeleteUserModal({show: true, userId, userName});
  };

  const confirmDeleteUser = () => {
    deleteUser(showDeleteUserModal.userId);
    setShowDeleteUserModal({show: false, userId: '', userName: ''});
  };

  const handleResetPassword = (userId: string, userName: string) => {
    const newPassword = Math.random().toString(36).slice(-8);
    resetUserPassword(userId, newPassword);
    setShowResetPasswordModal({show: true, userId, userName, newPassword});
  };

  const handleExportData = () => {
    const data = exportData();
    setShowExportModal(true);
    console.log('Exported data:', data);
  };

  const handleClearTestData = () => {
    setShowClearDataModal(true);
  };

  const confirmClearData = () => {
    clearTestData();
    setShowClearDataModal(false);
  };

  const handleCreateAdmin = async () => {
    if (!adminName.trim() || !adminEmail.trim()) return;
    
    try {
      // Generate a random password for the admin
      const adminPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      
      // In a real app, this would create the admin account in the database
      // For now, we'll just show the credentials
      setShowResetPasswordModal({
        show: true, 
        userId: 'new-admin', 
        userName: adminName, 
        newPassword: adminPassword
      });
      
      setAdminName('');
      setAdminEmail('');
      setShowCreateAdminModal(false);
    } catch (error) {
      console.error('Error creating admin:', error);
    }
  };

  const renderUserItem = ({ item }: { item: any }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userStats}>
          Joined: {item.dateJoined.toLocaleDateString()} • {item.totalHours}h studied
        </Text>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleResetPassword(item.id, item.name)}
        >
          <Text style={styles.actionButtonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteUser(item.id, item.name)}
        >
          <Trash2 size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Owner Settings</Text>
          <Text style={styles.subtitle}>Administrative tools and advanced controls</Text>
        </View>
        <TouchableOpacity
          style={styles.exitButton}
          onPress={() => router.back()}
        >
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Data & Analytics Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <BarChart3 size={20} color="#D97706" /> Analytics Overview
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalUsers}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalHours.toFixed(1)}h</Text>
              <Text style={styles.statLabel}>Total Hours</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{mostPopularTimer}</Text>
              <Text style={styles.statLabel}>Popular Timer</Text>
            </View>
          </View>
        </View>

        {/* User Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Users size={20} color="#D97706" /> User Management
          </Text>
          
          {/* Create Admin Button */}
          <TouchableOpacity
            style={styles.createAdminButton}
            onPress={() => setShowCreateAdminModal(true)}
          >
            <UserPlus size={20} color="#FFFFFF" />
            <Text style={styles.createAdminText}>Create Admin Account</Text>
          </TouchableOpacity>
          
          <View style={styles.searchContainer}>
            <Search size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            style={styles.userList}
            scrollEnabled={false}
            ListHeaderComponent={() => (
              <View style={styles.userItem}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>Abdullah Ahmed (You)</Text>
                  <Text style={styles.userEmail}>abdullahahmed</Text>
                  <Text style={styles.userStats}>
                    Owner Account • 150h studied
                  </Text>
                </View>
                <View style={styles.ownerIndicator}>
                  <Text style={styles.ownerIndicatorText}>Owner</Text>
                </View>
              </View>
            )}
          />
        </View>

        {/* App Content Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <MessageSquare size={20} color="#D97706" /> Content Management
          </Text>
          
          {/* Motivation Messages */}
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Motivation Messages</Text>
            <View style={styles.addItemContainer}>
              <TextInput
                style={styles.addItemInput}
                placeholder="Add new motivation message..."
                value={newMessage}
                onChangeText={setNewMessage}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  if (newMessage.trim()) {
                    addMotivationMessage(newMessage.trim());
                    setNewMessage('');
                  }
                }}
              >
                <Plus size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            {motivationMessages.map((message, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemText}>{message}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeMotivationMessage(index)}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Default Tasks */}
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Default Tasks</Text>
            <View style={styles.addItemContainer}>
              <TextInput
                style={styles.addItemInput}
                placeholder="Add new default task..."
                value={newTask}
                onChangeText={setNewTask}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  if (newTask.trim()) {
                    addDefaultTask(newTask.trim());
                    setNewTask('');
                  }
                }}
              >
                <Plus size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            {defaultTasks.map((task, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemText}>{task}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeDefaultTask(index)}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Theme & Branding */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Palette size={20} color="#D97706" /> Theme & Branding
          </Text>
          <View style={styles.colorContainer}>
            <View style={styles.colorInput}>
              <Text style={styles.colorLabel}>Primary Color</Text>
              <View style={styles.colorRow}>
                <View style={[styles.colorPreview, { backgroundColor: newPrimaryColor }]} />
                <TextInput
                  style={styles.colorTextInput}
                  value={newPrimaryColor}
                  onChangeText={setNewPrimaryColor}
                  placeholder="#10B981"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
            <View style={styles.colorInput}>
              <Text style={styles.colorLabel}>Accent Color</Text>
              <View style={styles.colorRow}>
                <View style={[styles.colorPreview, { backgroundColor: newAccentColor }]} />
                <TextInput
                  style={styles.colorTextInput}
                  value={newAccentColor}
                  onChangeText={setNewAccentColor}
                  placeholder="#6366F1"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => updateColors(newPrimaryColor, newAccentColor)}
          >
            <Text style={styles.updateButtonText}>Update Colors</Text>
          </TouchableOpacity>
        </View>

        {/* Security & Maintenance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Shield size={20} color="#D97706" /> Security & Maintenance
          </Text>
          <View style={styles.maintenanceButtons}>
            <TouchableOpacity
              style={styles.maintenanceButton}
              onPress={handleExportData}
            >
              <Download size={20} color="#10B981" />
              <Text style={styles.maintenanceButtonText}>Export Data</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.maintenanceButton, styles.dangerButton]}
              onPress={handleClearTestData}
            >
              <Trash2 size={20} color="#EF4444" />
              <Text style={[styles.maintenanceButtonText, styles.dangerText]}>Clear Test Data</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.versionInfo}>
            <Text style={styles.versionText}>App Version: 1.0.0</Text>
            <Text style={styles.versionText}>Last Updated: {new Date().toLocaleDateString()}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Create Admin Modal */}
      <Modal
        visible={showCreateAdminModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Admin Account</Text>
            <TouchableOpacity onPress={() => setShowCreateAdminModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Admin Name</Text>
              <TextInput
                style={styles.input}
                value={adminName}
                onChangeText={setAdminName}
                placeholder="Enter admin name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Admin Email</Text>
              <TextInput
                style={styles.input}
                value={adminEmail}
                onChangeText={setAdminEmail}
                placeholder="Enter admin email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.adminNote}>
              A random secure password will be generated for this admin account.
            </Text>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCreateAdminModal(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.createButton, (!adminName.trim() || !adminEmail.trim()) && styles.disabledButton]}
              onPress={handleCreateAdmin}
              disabled={!adminName.trim() || !adminEmail.trim()}
            >
              <Text style={styles.createText}>Create Admin</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal
        visible={showDeleteUserModal.show}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <Text style={styles.confirmationTitle}>Delete User</Text>
            <Text style={styles.confirmationText}>
              Are you sure you want to delete {showDeleteUserModal.userName}? This action cannot be undone.
            </Text>
            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={styles.cancelConfirmButton}
                onPress={() => setShowDeleteUserModal({show: false, userId: '', userName: ''})}
              >
                <Text style={styles.cancelConfirmText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmButton}
                onPress={confirmDeleteUser}
              >
                <Text style={styles.deleteConfirmText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Password Reset Modal */}
      <Modal
        visible={showResetPasswordModal.show}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <Text style={styles.confirmationTitle}>
              {showResetPasswordModal.userId === 'new-admin' ? 'Admin Created!' : 'Password Reset'}
            </Text>
            <Text style={styles.confirmationText}>
              {showResetPasswordModal.userId === 'new-admin' 
                ? `Admin account created for ${showResetPasswordModal.userName}`
                : `Password reset for ${showResetPasswordModal.userName}`
              }
            </Text>
            <View style={styles.passwordContainer}>
              <Text style={styles.passwordLabel}>
                {showResetPasswordModal.userId === 'new-admin' ? 'Login Credentials:' : 'New Password:'}
              </Text>
              {showResetPasswordModal.userId === 'new-admin' && (
                <Text style={styles.passwordText}>Email: {adminEmail}</Text>
              )}
              <Text style={styles.passwordText}>Password: {showResetPasswordModal.newPassword}</Text>
            </View>
            <TouchableOpacity
              style={styles.okButton}
              onPress={() => setShowResetPasswordModal({show: false, userId: '', userName: '', newPassword: ''})}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Export Data Modal */}
      <Modal
        visible={showExportModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <Text style={styles.confirmationTitle}>Data Exported</Text>
            <Text style={styles.confirmationText}>
              App data has been exported successfully.
            </Text>
            <TouchableOpacity
              style={styles.okButton}
              onPress={() => setShowExportModal(false)}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Clear Data Confirmation Modal */}
      <Modal
        visible={showClearDataModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <Text style={styles.confirmationTitle}>Clear Test Data</Text>
            <Text style={styles.confirmationText}>
              This will remove all test data. Are you sure?
            </Text>
            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={styles.cancelConfirmButton}
                onPress={() => setShowClearDataModal(false)}
              >
                <Text style={styles.cancelConfirmText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmButton}
                onPress={confirmClearData}
              >
                <Text style={styles.deleteConfirmText}>Clear</Text>
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
    backgroundColor: '#D97706',
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
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400E',
  },
  statLabel: {
    fontSize: 12,
    color: '#D97706',
    marginTop: 4,
  },
  createAdminButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  createAdminText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  userList: {
    maxHeight: 300,
  },
  userItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  userStats: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subsection: {
    marginBottom: 24,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  addItemContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  addItemInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  removeButton: {
    padding: 4,
  },
  colorContainer: {
    gap: 16,
    marginBottom: 16,
  },
  colorInput: {
    gap: 8,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorPreview: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  colorTextInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  updateButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  maintenanceButtons: {
    gap: 12,
    marginBottom: 16,
  },
  maintenanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dangerButton: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  maintenanceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  dangerText: {
    color: '#EF4444',
  },
  versionInfo: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
  },
  versionText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  ownerIndicator: {
    backgroundColor: '#D97706',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ownerIndicatorText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
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
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  adminNote: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  createButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  createText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 350,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmationText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelConfirmButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  deleteConfirmButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  deleteConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  passwordContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  passwordLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  passwordText: {
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  okButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  okButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});