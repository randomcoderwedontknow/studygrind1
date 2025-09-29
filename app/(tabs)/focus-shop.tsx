import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingBag, Palette, Image, Volume2, Coins, Check, Lock, Crown, Sparkles } from 'lucide-react-native';
import { useFocusShopStore } from '@/stores/focusShopStore';
import { useThemeStore } from '@/stores/themeStore';
import { useFocusLockStore } from '@/stores/focusLockStore';
import { FocusLockOverlay } from '@/components/FocusLockOverlay';

export default function FocusShopScreen() {
  const { 
    points, 
    items, 
    previewTheme,
    purchaseItem, 
    purchaseTheme,
    isItemUnlocked, 
    previewThemeTemporarily,
    clearPreview,
  } = useFocusShopStore();
  
  const { 
    themes, 
    currentThemeId, 
    currentTheme,
    equipTheme, 
    unequipTheme, 
    isThemeUnlocked 
  } = useThemeStore();
  
  const [selectedCategory, setSelectedCategory] = useState<'themes' | 'background' | 'sound'>('themes');
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);
  const { isPageLocked } = useFocusLockStore();
  const isLocked = isPageLocked('/(tabs)/focus-shop');

  const categories = [
    { id: 'themes', name: 'Themes', icon: <Palette size={16} color="#6B7280" /> },
    { id: 'background', name: 'Backgrounds', icon: <Image size={16} color="#6B7280" /> },
    { id: 'sound', name: 'Sounds', icon: <Volume2 size={16} color="#6B7280" /> },
  ];

  const filteredItems = selectedCategory === 'themes' 
    ? themes.filter(theme => showOwnedOnly ? isThemeUnlocked(theme.id) : true)
    : items.filter(item => item.category === selectedCategory);

  const handlePurchaseTheme = (theme: any) => {
    if (isThemeUnlocked(theme.id)) {
      // This is now handled by the Equip button
      return;
    }

    if (points < theme.price) {
      Alert.alert('Insufficient Points', `You need ${theme.price - points} more points to purchase this theme. Complete more study sessions to earn points!`);
      return;
    }

    // Purchase the theme without auto-equipping
    if (purchaseTheme(theme.id)) {
      Alert.alert('Theme Purchased!', `${theme.name} has been added to your collection! Press "Equip" to apply it.`);
    }
  };

  const handleEquipTheme = (theme: any) => {
    if (!isThemeUnlocked(theme.id)) {
      return;
    }

    if (currentThemeId === theme.id) {
      Alert.alert('Already Equipped', 'This theme is currently active!');
      return;
    }

    equipTheme(theme.id);
    Alert.alert('Theme Equipped!', `${theme.name} is now active across your app!`);
  };

  const handlePurchaseItem = (item: any) => {
    if (isItemUnlocked(item.id)) {
      Alert.alert('Already Owned', 'You already own this item!');
      return;
    }

    if (points < item.price) {
      Alert.alert('Insufficient Points', `You need ${item.price - points} more points to purchase this item. Complete more study sessions to earn points!`);
      return;
    }

    Alert.alert(
      'Confirm Purchase',
      `Purchase ${item.name} for ${item.price} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: () => {
            if (purchaseItem(item.id)) {
              Alert.alert('Success!', `${item.name} has been added to your collection!`);
            }
          }
        }
      ]
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'theme': return <Palette size={20} color="#10B981" />;
      case 'background': return <Image size={20} color="#10B981" />;
      case 'sound': return <Volume2 size={20} color="#10B981" />;
      default: return <ShoppingBag size={20} color="#10B981" />;
    }
  };

  const ThemeCard = ({ theme }: { theme: any }) => {
    const isUnlocked = isThemeUnlocked(theme.id);
    const isEquipped = currentThemeId === theme.id;
    const isPreviewing = previewTheme === theme.id;
    const canAfford = points >= theme.price;

    return (
      <View style={[
        styles.themeCard, 
        isEquipped && styles.equippedCard,
        isPreviewing && styles.previewCard
      ]}>
        <View style={styles.themePreview}>
          <View style={[styles.colorPreview, { backgroundColor: theme.colors.primary }]}>
            <View style={[styles.colorAccent, { backgroundColor: theme.colors.accent }]} />
          </View>
          {isEquipped && (
            <View style={styles.equippedBadge}>
              <Crown size={16} color="#F59E0B" />
            </View>
          )}
          {isPreviewing && (
            <View style={styles.previewBadge}>
              <Text style={styles.previewBadgeText}>Preview</Text>
            </View>
          )}
        </View>
        
        <View style={styles.themeInfo}>
          <Text style={styles.themeName}>{theme.name}</Text>
          <Text style={styles.themeDescription}>{theme.description}</Text>
          
          <View style={styles.themeFooter}>
            {theme.price === 0 ? (
              <View style={styles.freeTag}>
                <Text style={styles.freeText}>Free</Text>
              </View>
            ) : (
              <View style={styles.priceContainer}>
                <Coins size={16} color="#F59E0B" />
                <Text style={styles.priceText}>{theme.price}</Text>
              </View>
            )}
            
            {isEquipped ? (
              <View style={styles.equippedButton}>
                <Crown size={16} color="#FFFFFF" />
                <Text style={styles.equippedText}>Equipped</Text>
              </View>
            ) : isUnlocked ? (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.previewButton}
                  onPress={() => previewThemeTemporarily(theme.id)}
                >
                  <Text style={styles.previewButtonText}>Preview</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.equipButton}
                  onPress={() => handleEquipTheme(theme)}
                >
                  <Text style={styles.equipText}>Equip</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.previewButton}
                  onPress={() => previewThemeTemporarily(theme.id)}
                >
                  <Text style={styles.previewButtonText}>Preview</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.purchaseButton,
                    !canAfford && styles.disabledButton
                  ]}
                  onPress={() => handlePurchaseTheme(theme)}
                  disabled={!canAfford}
                >
                  {!canAfford && <Lock size={16} color="#9CA3AF" />}
                  <Text style={[
                    styles.purchaseText,
                    !canAfford && styles.disabledText
                  ]}>
                    {canAfford ? 'Buy' : 'Locked'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const ShopItemCard = ({ item }: { item: any }) => {
    const isUnlocked = isItemUnlocked(item.id);
    const canAfford = points >= item.price;

    return (
      <View style={[styles.itemCard, isUnlocked && styles.unlockedCard]}>
        <View style={styles.itemHeader}>
          <View style={styles.itemIcon}>
            {getCategoryIcon(item.category)}
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
          </View>
          {isUnlocked && (
            <View style={styles.ownedBadge}>
              <Check size={16} color="#FFFFFF" />
            </View>
          )}
        </View>

        <View style={styles.itemFooter}>
          <View style={styles.priceContainer}>
            <Coins size={16} color="#F59E0B" />
            <Text style={styles.priceText}>{item.price}</Text>
          </View>
          
          {isUnlocked ? (
            <View style={styles.ownedButton}>
              <Text style={styles.ownedText}>Owned</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.purchaseButton,
                !canAfford && styles.disabledButton
              ]}
              onPress={() => handlePurchaseItem(item)}
              disabled={!canAfford}
            >
              {!canAfford && <Lock size={16} color="#9CA3AF" />}
              <Text style={[
                styles.purchaseText,
                !canAfford && styles.disabledText
              ]}>
                {canAfford ? 'Buy' : 'Locked'}
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
      {isLocked && <FocusLockOverlay pageName="Focus Shop" pageIcon="🛍️" />}

      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.colors.primary }]}>
        <Text style={styles.title}>Focus Shop</Text>
        <Text style={styles.subtitle}>Customize your study experience</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Points Display */}
        <View style={styles.pointsContainer}>
          <View style={styles.pointsCard}>
            <View style={styles.pointsIcon}>
              <Coins size={28} color="#F59E0B" />
              <Sparkles size={16} color="#F59E0B" style={styles.sparkle} />
            </View>
            <View style={styles.pointsInfo}>
              <Text style={styles.pointsValue}>{points.toLocaleString()}</Text>
              <Text style={styles.pointsLabel}>Focus Points</Text>
            </View>
          </View>
          <Text style={styles.pointsHint}>
            💡 Earn 100 points for every 10+ minute study session!
          </Text>
        </View>

        {/* How to Earn Points */}
        <View style={styles.earnPointsSection}>
          <Text style={styles.earnPointsTitle}>How to Earn Points:</Text>
          <View style={styles.earnPointsList}>
            <Text style={styles.earnPointsItem}>• Complete 10+ min sessions: +100 points</Text>
            <Text style={styles.earnPointsItem}>• 7-day streak bonus: +250 points</Text>
            <Text style={styles.earnPointsItem}>• 50 total sessions: +500 points</Text>
          </View>
        </View>

        {/* Category Tabs */}
        <View style={styles.categoryTabs}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                selectedCategory === category.id && styles.activeCategoryTab
              ]}
              onPress={() => setSelectedCategory(category.id as any)}
            >
              {React.cloneElement(category.icon, {
                color: selectedCategory === category.id ? '#FFFFFF' : '#6B7280'
              })}
              <Text style={[
                styles.categoryTabText,
                selectedCategory === category.id && styles.activeCategoryTabText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
          {selectedCategory === 'themes' && (
            <TouchableOpacity
              style={[
                styles.categoryTab,
                showOwnedOnly && styles.activeCategoryTab
              ]}
              onPress={() => setShowOwnedOnly(!showOwnedOnly)}
            >
              <Text style={[
                styles.categoryTabText,
                showOwnedOnly && styles.activeCategoryTabText
              ]}>
                Owned Only
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Preview Controls */}
        {previewTheme && (
          <View style={styles.previewControls}>
            <Text style={styles.previewText}>
              Previewing: {themes.find(t => t.id === previewTheme)?.name}
            </Text>
            <TouchableOpacity
              style={styles.clearPreviewButton}
              onPress={clearPreview}
            >
              <Text style={styles.clearPreviewText}>Clear Preview</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Items Grid */}
        <View style={styles.itemsList}>
          {selectedCategory === 'themes' ? (
            <View style={styles.themesGrid}>
              {filteredItems.map((theme) => (
                <ThemeCard key={theme.id} theme={theme} />
              ))}
            </View>
          ) : (
            <View style={styles.itemsGrid}>
              {filteredItems.map((item) => (
                <ShopItemCard key={item.id} item={item} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  pointsContainer: {
    marginBottom: 20,
  },
  pointsCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  pointsIcon: {
    position: 'relative',
  },
  sparkle: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  pointsInfo: {
    flex: 1,
  },
  pointsValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#92400E',
  },
  pointsLabel: {
    fontSize: 14,
    color: '#D97706',
  },
  pointsHint: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  earnPointsSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  earnPointsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 8,
  },
  earnPointsList: {
    gap: 4,
  },
  earnPointsItem: {
    fontSize: 14,
    color: '#047857',
  },
  categoryTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeCategoryTab: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeCategoryTabText: {
    color: '#FFFFFF',
  },
  itemsList: {
    marginBottom: 20,
  },
  themesGrid: {
    gap: 16,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  themeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  equippedCard: {
    borderColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
  },
  previewCard: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  themePreview: {
    height: 80,
    borderRadius: 12,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  colorPreview: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  colorAccent: {
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.8,
  },
  equippedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 4,
  },
  previewBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  previewBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  themeInfo: {
    gap: 8,
  },
  themeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  themeDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  themeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  freeTag: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  freeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D97706',
  },
  equippedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  equippedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  equipButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  equipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  previewButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  previewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  disabledButton: {
    backgroundColor: '#F3F4F6',
  },
  purchaseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  previewControls: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  previewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4338CA',
  },
  clearPreviewButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearPreviewText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  itemCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 120,
  },
  unlockedCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  itemDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  ownedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ownedButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  ownedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});