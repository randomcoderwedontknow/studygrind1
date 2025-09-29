import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Eye, RotateCcw, CheckCircle, AlertCircle, XCircle } from 'lucide-react-native';
import { useCardsStore } from '@/stores/cardsStore';
import { useThemeStore } from '@/stores/themeStore';

const { width } = Dimensions.get('window');

export function FlashcardReview() {
  const { 
    reviewSession, 
    currentCard, 
    showCardAnswer, 
    markCard 
  } = useCardsStore();
  const { currentTheme } = useThemeStore();

  if (!reviewSession || !currentCard) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No review session active</Text>
      </View>
    );
  }

  const handleShowAnswer = () => {
    showCardAnswer();
  };

  const handleMarkCard = (difficulty: 'easy' | 'medium' | 'hard') => {
    markCard(difficulty);
  };

  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${(reviewSession.completed / reviewSession.total) * 100}%`,
                backgroundColor: currentTheme.colors.primary 
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {reviewSession.completed + 1} of {reviewSession.total}
        </Text>
      </View>

      {/* Flashcard */}
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            {reviewSession.showAnswer ? 'Answer' : 'Question'}
          </Text>
          <Text style={styles.cardText}>
            {reviewSession.showAnswer ? currentCard.back : currentCard.front}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {!reviewSession.showAnswer ? (
          <TouchableOpacity
            style={[styles.showAnswerButton, { backgroundColor: currentTheme.colors.primary }]}
            onPress={handleShowAnswer}
          >
            <Eye size={20} color="#FFFFFF" />
            <Text style={styles.showAnswerText}>Show Answer</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.difficultyButtons}>
            <Text style={styles.difficultyLabel}>How did you do?</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.difficultyButton, styles.hardButton]}
                onPress={() => handleMarkCard('hard')}
              >
                <XCircle size={20} color="#FFFFFF" />
                <Text style={styles.difficultyButtonText}>Hard</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.difficultyButton, styles.mediumButton]}
                onPress={() => handleMarkCard('medium')}
              >
                <AlertCircle size={20} color="#FFFFFF" />
                <Text style={styles.difficultyButtonText}>Medium</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.difficultyButton, styles.easyButton]}
                onPress={() => handleMarkCard('easy')}
              >
                <CheckCircle size={20} color="#FFFFFF" />
                <Text style={styles.difficultyButtonText}>Easy</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  card: {
    width: width * 0.85,
    minHeight: 200,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardText: {
    fontSize: 18,
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 28,
  },
  actionsContainer: {
    alignItems: 'center',
  },
  showAnswerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
  },
  showAnswerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  difficultyButtons: {
    alignItems: 'center',
    width: '100%',
  },
  difficultyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  difficultyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 6,
  },
  hardButton: {
    backgroundColor: '#EF4444',
  },
  mediumButton: {
    backgroundColor: '#F59E0B',
  },
  easyButton: {
    backgroundColor: '#10B981',
  },
  difficultyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 50,
  },
});