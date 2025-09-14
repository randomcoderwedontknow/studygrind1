import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, X, BookOpen, CreditCard as Edit3, Trash2, Play } from 'lucide-react-native';
import { useCardsStore } from '@/stores/cardsStore';
import { useFocusShopStore } from '@/stores/focusShopStore';
import { useThemeStore } from '@/stores/themeStore';
import { useFocusLockStore } from '@/stores/focusLockStore';
import { DeckCard } from '@/components/DeckCard';
import { FlashcardReview } from '@/components/FlashcardReview';
import { FocusLockOverlay } from '@/components/FocusLockOverlay';

export default function CardsScreen() {
  const { 
    decks, 
    reviewSession,
    createDeck, 
    deleteDeck, 
    addCard, 
    updateCard,
    deleteCard,
    startReviewSession,
    endReviewSession,
    getDeckById,
    getCardsForReview,
  } = useCardsStore();
  const { addPoints } = useFocusShopStore();
  const { currentTheme } = useThemeStore();
  const { isPageLocked } = useFocusLockStore();

  const isLocked = isPageLocked('/(tabs)/cards');
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<any>(null);
  
  const [deckName, setDeckName] = useState('');
  const [deckDescription, setDeckDescription] = useState('');
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [showDeleteDeckModal, setShowDeleteDeckModal] = useState<{show: boolean, deckId: string, deckName: string}>({show: false, deckId: '', deckName: ''});
  const [showNoCardsModal, setShowNoCardsModal] = useState(false);

  const handleCreateDeck = () => {
    if (!deckName.trim()) return;
    createDeck(deckName.trim(), deckDescription.trim() || undefined);
    setDeckName('');
    setDeckDescription('');
    setShowCreateDeck(false);
  };

  const handleCreateCard = () => {
    if (!cardFront.trim() || !cardBack.trim() || !selectedDeck) return;
    
    if (editingCard) {
      updateCard(editingCard.id, cardFront.trim(), cardBack.trim());
    } else {
      addCard(selectedDeck, cardFront.trim(), cardBack.trim());
    }
    
    setCardFront('');
    setCardBack('');
    setEditingCard(null);
    setShowCreateCard(false);
  };

  const handleDeleteDeck = (deckId: string, deckName: string) => {
    setShowDeleteDeckModal({show: true, deckId, deckName});
  };

  const confirmDeleteDeck = () => {
    deleteDeck(showDeleteDeckModal.deckId);
    setShowDeleteDeckModal({show: false, deckId: '', deckName: ''});
  };

  const handleStartReview = (deckId: string) => {
    const cardsForReview = getCardsForReview(deckId);
    if (cardsForReview.length === 0) {
      setShowNoCardsModal(true);
      return;
    }
    startReviewSession(deckId);
  };

  const handleEndReview = () => {
    const pointsEarned = endReviewSession();
    if (pointsEarned > 0) {
      addPoints(pointsEarned);
    }
  };

  const handleEditCard = (card: any) => {
    setEditingCard(card);
    setCardFront(card.front);
    setCardBack(card.back);
    setShowCreateCard(true);
  };

  // If in review mode, show the flashcard review interface
  if (reviewSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewTitle}>
            {getDeckById(reviewSession.deckId)?.name}
          </Text>
          <TouchableOpacity
            style={styles.endReviewButton}
            onPress={handleEndReview}
          >
            <X size={20} color="#EF4444" />
            <Text style={styles.endReviewText}>End Review</Text>
          </TouchableOpacity>
        </View>
        <FlashcardReview />
      </SafeAreaView>
    );
  }

  const currentDeck = selectedDeck ? getDeckById(selectedDeck) : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Focus Lock Overlay */}
      {isLocked && <FocusLockOverlay pageName="Flashcards" pageIcon="📚" />}

      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.colors.primary }]}>
        <Text style={styles.title}>
          {currentDeck ? currentDeck.name : 'Flashcards'}
        </Text>
        <Text style={styles.subtitle}>
          {currentDeck 
            ? `${currentDeck.cards.length} cards`
            : 'Study with spaced repetition'
          }
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!currentDeck ? (
          // Deck List View
          <>
            <View style={styles.addDeckSection}>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: currentTheme.colors.primary }]}
                onPress={() => setShowCreateDeck(true)}
              >
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Create New Deck</Text>
              </TouchableOpacity>
            </View>

            {decks.length === 0 ? (
              <View style={styles.emptyState}>
                <BookOpen size={48} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No Decks Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Create your first flashcard deck to start studying
                </Text>
              </View>
            ) : (
              <View style={styles.decksList}>
                {decks.map((deck) => (
                  <DeckCard
                    key={deck.id}
                    deck={deck}
                    onPress={() => setSelectedDeck(deck.id)}
                    onReview={() => handleStartReview(deck.id)}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          // Deck Detail View
          <>
            <View style={styles.deckActions}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedDeck(null)}
              >
                <Text style={styles.backButtonText}>← Back to Decks</Text>
              </TouchableOpacity>
              
              <View style={styles.deckActionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: currentTheme.colors.primary }]}
                  onPress={() => handleStartReview(currentDeck.id)}
                >
                  <Play size={16} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Review</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                  onPress={() => setShowCreateCard(true)}
                >
                  <Plus size={16} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Add Card</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                  onPress={() => handleDeleteDeck(currentDeck.id, currentDeck.name)}
                >
                  <Trash2 size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {currentDeck.cards.length === 0 ? (
              <View style={styles.emptyState}>
                <BookOpen size={48} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No Cards Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Add your first flashcard to start studying
                </Text>
              </View>
            ) : (
              <View style={styles.cardsList}>
                {currentDeck.cards.map((card) => (
                  <View key={card.id} style={styles.cardItem}>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardFront}>{card.front}</Text>
                      <Text style={styles.cardBack}>{card.back}</Text>
                      <View style={styles.cardMeta}>
                        <View style={[styles.difficultyBadge, { 
                          backgroundColor: getDifficultyColor(card.difficulty) 
                        }]}>
                          <Text style={styles.difficultyText}>
                            {card.difficulty.toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.cardStats}>
                          {card.reviewCount} reviews • {
                            card.reviewCount > 0 
                              ? Math.round((card.correctCount / card.reviewCount) * 100)
                              : 0
                          }% accuracy
                        </Text>
                      </View>
                    </View>
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.cardActionButton}
                        onPress={() => handleEditCard(card)}
                      >
                        <Edit3 size={16} color="#6B7280" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cardActionButton}
                        onPress={() => deleteCard(card.id)}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Create Deck Modal */}
      <Modal
        visible={showCreateDeck}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Deck</Text>
            <TouchableOpacity onPress={() => setShowCreateDeck(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Deck Name</Text>
              <TextInput
                style={styles.input}
                value={deckName}
                onChangeText={setDeckName}
                placeholder="e.g., Spanish Vocabulary"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={deckDescription}
                onChangeText={setDeckDescription}
                placeholder="Brief description of this deck..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCreateDeck(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.createButton, !deckName.trim() && styles.disabledButton]}
              onPress={handleCreateDeck}
              disabled={!deckName.trim()}
            >
              <Text style={styles.createText}>Create Deck</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Create/Edit Card Modal */}
      <Modal
        visible={showCreateCard}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingCard ? 'Edit Card' : 'Add New Card'}
            </Text>
            <TouchableOpacity onPress={() => {
              setShowCreateCard(false);
              setEditingCard(null);
              setCardFront('');
              setCardBack('');
            }}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Front (Question/Term)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={cardFront}
                onChangeText={setCardFront}
                placeholder="Enter the question or term..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Back (Answer/Definition)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={cardBack}
                onChangeText={setCardBack}
                placeholder="Enter the answer or definition..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowCreateCard(false);
                setEditingCard(null);
                setCardFront('');
                setCardBack('');
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.createButton,
                (!cardFront.trim() || !cardBack.trim()) && styles.disabledButton
              ]}
              onPress={handleCreateCard}
              disabled={!cardFront.trim() || !cardBack.trim()}
            >
              <Text style={styles.createText}>
                {editingCard ? 'Update Card' : 'Add Card'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Delete Deck Confirmation Modal */}
      <Modal
        visible={showDeleteDeckModal.show}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <Text style={styles.confirmationTitle}>Delete Deck</Text>
            <Text style={styles.confirmationText}>
              Are you sure you want to delete "{showDeleteDeckModal.deckName}"? This will also delete all cards in this deck.
            </Text>
            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDeleteDeckModal({show: false, deckId: '', deckName: ''})}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmButton}
                onPress={confirmDeleteDeck}
              >
                <Text style={styles.deleteConfirmText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* No Cards Due Modal */}
      <Modal
        visible={showNoCardsModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <Text style={styles.confirmationTitle}>No Cards Due</Text>
            <Text style={styles.confirmationText}>
              All cards in this deck are up to date! Come back later.
            </Text>
            <TouchableOpacity
              style={styles.okButton}
              onPress={() => setShowNoCardsModal(false)}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'easy': return '#10B981';
    case 'medium': return '#F59E0B';
    case 'hard': return '#EF4444';
    default: return '#6B7280';
  }
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
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  endReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  endReviewText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  addDeckSection: {
    marginBottom: 24,
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
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
  decksList: {
    gap: 16,
  },
  deckActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  deckActionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardsList: {
    gap: 12,
  },
  cardItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardFront: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardBack: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardStats: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cardActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
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