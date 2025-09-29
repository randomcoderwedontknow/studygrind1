import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { BookOpen, Clock, Target, Award, ChevronRight } from 'lucide-react-native';
import { Deck, useCardsStore } from '@/stores/cardsStore';
import { useThemeStore } from '@/stores/themeStore';

interface DeckCardProps {
  deck: Deck;
  onPress: () => void;
  onReview: () => void;
}

export function DeckCard({ deck, onPress, onReview }: DeckCardProps) {
  const { getDeckStats } = useCardsStore();
  const { currentTheme } = useThemeStore();
  const stats = getDeckStats(deck.id);

  const formatLastStudied = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: currentTheme.colors.secondary }]}>
          <BookOpen size={24} color={currentTheme.colors.primary} />
        </View>
        <View style={styles.deckInfo}>
          <Text style={styles.deckName}>{deck.name}</Text>
          {deck.description && (
            <Text style={styles.deckDescription}>{deck.description}</Text>
          )}
        </View>
        <ChevronRight size={20} color="#9CA3AF" />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Target size={16} color="#6B7280" />
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Cards</Text>
        </View>
        <View style={styles.statItem}>
          <Clock size={16} color="#F59E0B" />
          <Text style={styles.statValue}>{stats.dueForReview}</Text>
          <Text style={styles.statLabel}>Due</Text>
        </View>
        <View style={styles.statItem}>
          <Award size={16} color="#10B981" />
          <Text style={styles.statValue}>{stats.mastered}</Text>
          <Text style={styles.statLabel}>Mastered</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.lastStudied}>
          Last studied: {formatLastStudied(deck.lastStudied)}
        </Text>
        {stats.dueForReview > 0 && (
          <TouchableOpacity
            style={[styles.reviewButton, { backgroundColor: currentTheme.colors.primary }]}
            onPress={(e) => {
              e.stopPropagation();
              onReview();
            }}
          >
            <Text style={styles.reviewButtonText}>Review Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deckInfo: {
    flex: 1,
  },
  deckName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  deckDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastStudied: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  reviewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});