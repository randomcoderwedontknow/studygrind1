import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { BookOpen, Play, Calendar } from 'lucide-react-native';

interface Deck {
  id: string;
  name: string;
  description?: string;
  cards: any[];
  createdAt: Date;
  lastStudied?: Date;
  totalReviews: number;
}

interface DeckCardProps {
  deck: Deck;
  onPress: () => void;
  onReview: () => void;
}

export function DeckCard({ deck, onPress, onReview }: DeckCardProps) {
  const getDueCards = () => {
    // Simple logic to determine cards due for review
    const now = new Date();
    return deck.cards.filter(card => {
      if (!card.nextReview) return true; // New cards are due
      return new Date(card.nextReview) <= now;
    }).length;
  };

  const dueCards = getDueCards();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <BookOpen size={24} color="#10B981" />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{deck.name}</Text>
          {deck.description && (
            <Text style={styles.description}>{deck.description}</Text>
          )}
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{deck.cards.length}</Text>
          <Text style={styles.statLabel}>Cards</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{dueCards}</Text>
          <Text style={styles.statLabel}>Due</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{deck.totalReviews}</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
      </View>

      {deck.lastStudied && (
        <View style={styles.lastStudied}>
          <Calendar size={14} color="#6B7280" />
          <Text style={styles.lastStudiedText}>
            Last studied: {deck.lastStudied.toLocaleDateString()}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, dueCards === 0 && styles.disabledButton]}
          onPress={onReview}
          disabled={dueCards === 0}
        >
          <Play size={16} color={dueCards === 0 ? "#9CA3AF" : "#FFFFFF"} />
          <Text style={[
            styles.actionButtonText,
            dueCards === 0 && styles.disabledButtonText
          ]}>
            {dueCards === 0 ? 'Up to date' : `Review (${dueCards})`}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  lastStudied: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  lastStudiedText: {
    fontSize: 12,
    color: '#6B7280',
  },
  actions: {
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 140,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#F3F4F6',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
});