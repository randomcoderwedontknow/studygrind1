import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gamepad2, Lock, Play, Coins, Clock } from 'lucide-react-native';
import { useGamesStore, MiniGame } from '@/stores/gamesStore';
import { useFocusShopStore } from '@/stores/focusShopStore';
import { useFocusLockStore } from '@/stores/focusLockStore';
import { useThemeStore } from '@/stores/themeStore';
import { WordScrambleGame } from '@/components/WordScrambleGame';
import { NumberPuzzleGame } from '@/components/NumberPuzzleGame';
import { MemoryMatchGame } from '@/components/MemoryMatchGame';
import { LogicPuzzleGame } from '@/components/LogicPuzzleGame';
import { FocusLockOverlay } from '@/components/FocusLockOverlay';

export default function GamesScreen() {
  const { 
    games, 
    currentGame, 
    purchaseGame, 
    setCurrentGame, 
    isGameUnlocked,
    getGameById 
  } = useGamesStore();
  const { points, addPoints } = useFocusShopStore();
  const { isPageLocked } = useFocusLockStore();
  const { currentTheme } = useThemeStore();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'word' | 'number' | 'memory' | 'logic'>('all');
  const [showInsufficientPointsModal, setShowInsufficientPointsModal] = useState<{show: boolean, game: MiniGame | null, needed: number}>({show: false, game: null, needed: 0});
  const [showPurchaseModal, setShowPurchaseModal] = useState<{show: boolean, game: MiniGame | null}>({show: false, game: null});
  const [showGameCompleteModal, setShowGameCompleteModal] = useState<{show: boolean, points: number}>({show: false, points: 0});
  const [showExitGameModal, setShowExitGameModal] = useState(false);

  const isLocked = isPageLocked('/(tabs)/games');

  const categories = [
    { id: 'all' as const, name: 'All Games', icon: '🎮' },
    { id: 'word' as const, name: 'Word Games', icon: '🔤' },
    { id: 'number' as const, name: 'Number Games', icon: '🔢' },
    { id: 'memory' as const, name: 'Memory Games', icon: '🧠' },
    { id: 'logic' as const, name: 'Logic Games', icon: '🧩' },
  ];

  const filteredGames = selectedCategory === 'all' 
    ? games 
    : games.filter(game => game.category === selectedCategory);

  const handlePurchaseGame = (game: MiniGame) => {
    if (points < game.price) {
      setShowInsufficientPointsModal({show: true, game, needed: game.price - points});
      return;
    }

    setShowPurchaseModal({show: true, game});
  };

  const confirmPurchase = () => {
    if (showPurchaseModal.game && purchaseGame(showPurchaseModal.game.id)) {
      setShowPurchaseModal({show: false, game: null});
    }
  };

  const handlePlayGame = (game: MiniGame) => {
    if (!isGameUnlocked(game.id)) return;
    
    setCurrentGame(game.id);
  };

  const handleGameComplete = (score: number) => {
    const pointsEarned = Math.floor(score / 2); // Convert score to points
    if (pointsEarned > 0) {
      addPoints(pointsEarned);
      setShowGameCompleteModal({show: true, points: pointsEarned});
    } else {
      setCurrentGame(null);
    }
  };

  const handleGameExit = () => {
    setShowExitGameModal(true);
  };

  const confirmGameExit = () => {
    setCurrentGame(null);
    setShowExitGameModal(false);
  };

  // Render current game if one is active
  if (currentGame) {
    const game = getGameById(currentGame);
    if (!game) {
      setCurrentGame(null);
      return null;
    }

    switch (currentGame) {
      case 'word-scramble':
        return <WordScrambleGame onGameComplete={handleGameComplete} onGameExit={handleGameExit} />;
      case 'number-puzzle':
        return <NumberPuzzleGame onGameComplete={handleGameComplete} onGameExit={handleGameExit} />;
      case 'memory-match':
        return <MemoryMatchGame onGameComplete={handleGameComplete} onGameExit={handleGameExit} />;
      case 'logic-puzzle':
        return <LogicPuzzleGame onGameComplete={handleGameComplete} onGameExit={handleGameExit} />;
      default:
        setCurrentGame(null);
        return null;
    }
  };

  const GameCard = ({ game }: { game: MiniGame }) => {
    const unlocked = isGameUnlocked(game.id);
    const canAfford = points >= game.price;

    return (
      <View style={[styles.gameCard, unlocked && styles.unlockedGameCard]}>
        <View style={styles.gameHeader}>
          <Text style={styles.gameIcon}>{game.icon}</Text>
          <View style={styles.gameInfo}>
            <Text style={styles.gameName}>{game.name}</Text>
            <Text style={styles.gameDescription}>{game.description}</Text>
            <View style={styles.gameMeta}>
              <View style={styles.metaItem}>
                <Clock size={12} color="#6B7280" />
                <Text style={styles.metaText}>{game.maxDuration} min max</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.gameFooter}>
          {unlocked ? (
            <TouchableOpacity
              style={[styles.playButton, { backgroundColor: currentTheme.colors.primary }]}
              onPress={() => handlePlayGame(game)}
            >
              <Play size={16} color="#FFFFFF" />
              <Text style={styles.playButtonText}>Play</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.unlockButton,
                canAfford ? { backgroundColor: '#10B981' } : styles.disabledButton
              ]}
              onPress={() => handlePurchaseGame(game)}
              disabled={!canAfford}
            >
              {!canAfford && <Lock size={16} color="#9CA3AF" />}
              <Coins size={16} color={canAfford ? "#FFFFFF" : "#9CA3AF"} />
              <Text style={[
                styles.unlockButtonText,
                !canAfford && styles.disabledButtonText
              ]}>
                {game.price}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Focus Lock Overlay */}
      {isLocked && <FocusLockOverlay pageName="Games" pageIcon="🎮" />}

      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.colors.primary }]}>
        <Text style={styles.title}>Study Break Games</Text>
        <Text style={styles.subtitle}>Quick, focus-friendly mini-games for your breaks</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Points Display */}
        <View style={styles.pointsCard}>
          <Coins size={24} color="#F59E0B" />
          <Text style={styles.pointsValue}>{points.toLocaleString()}</Text>
          <Text style={styles.pointsLabel}>Focus Points</Text>
        </View>

        {/* Category Tabs */}
        <View style={styles.categoryTabs}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryTab,
                  selectedCategory === category.id && styles.activeCategoryTab
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryTabText,
                  selectedCategory === category.id && styles.activeCategoryTabText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Games Grid */}
        <View style={styles.gamesContainer}>
          {filteredGames.length === 0 ? (
            <View style={styles.emptyState}>
              <Gamepad2 size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Games Available</Text>
              <Text style={styles.emptySubtitle}>
                Games in this category are coming soon!
              </Text>
            </View>
          ) : (
            <View style={styles.gamesGrid}>
              {filteredGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </View>
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About Study Break Games</Text>
          <Text style={styles.infoText}>
            These mini-games are designed to give your mind a quick, refreshing break between study sessions. 
            Each game is limited to 3 minutes or less to prevent procrastination while helping you recharge.
          </Text>
          <Text style={styles.infoText}>
            Unlock games using focus points earned from completing study sessions, or win them through the daily reward spin!
          </Text>
        </View>
      </ScrollView>

      {/* Insufficient Points Modal */}
      <Modal
        visible={showInsufficientPointsModal.show}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <Text style={styles.confirmationTitle}>Insufficient Points</Text>
            <Text style={styles.confirmationText}>
              You need {showInsufficientPointsModal.needed} more focus points to unlock {showInsufficientPointsModal.game?.name}. Complete more study sessions to earn points!
            </Text>
            <TouchableOpacity
              style={styles.okButton}
              onPress={() => setShowInsufficientPointsModal({show: false, game: null, needed: 0})}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Purchase Confirmation Modal */}
      <Modal
        visible={showPurchaseModal.show}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <Text style={styles.confirmationTitle}>Unlock Game</Text>
            <Text style={styles.confirmationText}>
              Unlock {showPurchaseModal.game?.name} for {showPurchaseModal.game?.price} focus points?
            </Text>
            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPurchaseModal({show: false, game: null})}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmPurchase}
              >
                <Text style={styles.confirmText}>Unlock</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Game Complete Modal */}
      <Modal
        visible={showGameCompleteModal.show}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <Text style={styles.confirmationTitle}>Game Complete! 🎉</Text>
            <Text style={styles.confirmationText}>
              Great job! You earned {showGameCompleteModal.points} focus points.
            </Text>
            <TouchableOpacity
              style={styles.okButton}
              onPress={() => {
                setShowGameCompleteModal({show: false, points: 0});
                setCurrentGame(null);
              }}
            >
              <Text style={styles.okButtonText}>Awesome!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Exit Game Confirmation Modal */}
      <Modal
        visible={showExitGameModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <Text style={styles.confirmationTitle}>Exit Game?</Text>
            <Text style={styles.confirmationText}>
              Are you sure you want to exit? Your progress will be lost.
            </Text>
            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowExitGameModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmGameExit}
              >
                <Text style={styles.confirmText}>Exit</Text>
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
  pointsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400E',
  },
  pointsLabel: {
    fontSize: 14,
    color: '#D97706',
  },
  categoryTabs: {
    marginBottom: 24,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  activeCategoryTab: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeCategoryTabText: {
    color: '#FFFFFF',
  },
  gamesContainer: {
    marginBottom: 32,
  },
  gamesGrid: {
    gap: 16,
  },
  gameCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  unlockedGameCard: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  gameIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  gameMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  gameFooter: {
    alignItems: 'flex-end',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  playButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  disabledButton: {
    backgroundColor: '#F3F4F6',
  },
  unlockButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: '#9CA3AF',
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
  infoSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
    marginBottom: 8,
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
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmText: {
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
  },
});