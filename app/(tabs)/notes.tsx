import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, CreditCard as Edit3, Trash2, X, FileText } from 'lucide-react-native';
import { useNotesStore } from '@/stores/notesStore';
import { useThemeStore } from '@/stores/themeStore';
import { useFocusLockStore } from '@/stores/focusLockStore';
import { FocusLockOverlay } from '@/components/FocusLockOverlay';

export default function NotesScreen() {
  const { currentTheme } = useThemeStore();
  const { isPageLocked } = useFocusLockStore();
  const { 
    notes, 
    searchQuery, 
    addNote, 
    updateNote, 
    deleteNote, 
    setSearchQuery, 
    getFilteredNotes 
  } = useNotesStore();
  
  const isLocked = isPageLocked('/(tabs)/notes');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const filteredNotes = getFilteredNotes();

  const handleSaveNote = () => {
    if (!noteTitle.trim()) return;

    if (editingNote) {
      updateNote(editingNote.id, noteTitle.trim(), noteContent.trim());
    } else {
      addNote(noteTitle.trim(), noteContent.trim());
    }

    setNoteTitle('');
    setNoteContent('');
    setEditingNote(null);
    setShowAddModal(false);
  };

  const handleEditNote = (note: any) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setShowAddModal(true);
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
  };

  const NoteCard = ({ note }: { note: any }) => (
    <View style={styles.noteCard}>
      <View style={styles.noteHeader}>
        <View style={styles.noteIcon}>
          <FileText size={20} color="#10B981" />
        </View>
        <View style={styles.noteInfo}>
          <Text style={styles.noteTitle}>{note.title}</Text>
          <Text style={styles.noteDate}>
            {note.updatedAt.toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.noteActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditNote(note)}
          >
            <Edit3 size={16} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteNote(note.id)}
          >
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.notePreview} numberOfLines={3}>
        {note.content}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Focus Lock Overlay */}
      {isLocked && <FocusLockOverlay pageName="Notes" pageIcon="📝" />}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Notes</Text>
        <Text style={styles.subtitle}>Capture your thoughts and ideas</Text>
      </View>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Add Note Button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: currentTheme.colors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add New Note</Text>
        </TouchableOpacity>

        {/* Notes List */}
        <ScrollView style={styles.notesList} showsVerticalScrollIndicator={false}>
          {filteredNotes.length === 0 ? (
            <View style={styles.emptyState}>
              <FileText size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No notes yet</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'No notes match your search' : 'Create your first note to get started'}
              </Text>
            </View>
          ) : (
            filteredNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))
          )}
        </ScrollView>
      </View>

      {/* Add/Edit Note Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingNote ? 'Edit Note' : 'New Note'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowAddModal(false);
                setEditingNote(null);
                setNoteTitle('');
                setNoteContent('');
              }}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <TextInput
              style={styles.titleInput}
              placeholder="Note title..."
              value={noteTitle}
              onChangeText={setNoteTitle}
              placeholderTextColor="#9CA3AF"
            />
            <TextInput
              style={styles.contentInput}
              placeholder="Write your note here..."
              value={noteContent}
              onChangeText={setNoteContent}
              multiline
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowAddModal(false);
                setEditingNote(null);
                setNoteTitle('');
                setNoteContent('');
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, !noteTitle.trim() && styles.disabledButton]}
              onPress={handleSaveNote}
              disabled={!noteTitle.trim()}
            >
              <Text style={styles.saveText}>
                {editingNote ? 'Update' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
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
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
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
  addButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  notesList: {
    flex: 1,
  },
  noteCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noteInfo: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  noteDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notePreview: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9CA3AF',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    marginTop: 8,
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
  titleInput: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 20,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});