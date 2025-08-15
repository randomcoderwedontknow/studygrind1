import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, SquareCheck as CheckSquare, Clock, Target } from 'lucide-react-native';
import { useTaskStore } from '@/stores/taskStore';
import { useThemeStore } from '@/stores/themeStore';
import { useTagStore } from '@/stores/tagStore';
import { TaskCard } from '@/components/TaskCard';
import { AddTaskModal } from '@/components/AddTaskModal';
import { TagStatsView } from '@/components/TagStatsView';

export default function TasksScreen() {
  const { tasks, completedTasks, filterTag, setFilterTag, getFilteredTasks } = useTaskStore();
  const { tags } = useTagStore();
  const { currentTheme } = useThemeStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showStats, setShowStats] = useState(false);

  const baseFilteredTasks = getFilteredTasks();
  const filteredTasks = baseFilteredTasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const todayStats = {
    completed: 0,
    total: 0,
    timeSpent: 0,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <Text style={styles.subtitle}>
          {todayStats.completed} of {todayStats.total} completed today
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Today's Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <CheckSquare size={20} color="#10B981" />
          </View>
          <View>
            <Text style={styles.statValue}>{todayStats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Clock size={20} color="#6366F1" />
          </View>
          <View>
            <Text style={styles.statValue}>{todayStats.timeSpent}m</Text>
            <Text style={styles.statLabel}>Time Spent</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Target size={20} color="#F59E0B" />
          </View>
          <View>
            <Text style={styles.statValue}>{Math.floor(todayStats.timeSpent / 25)}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
        </View>
      </View>

        {/* Add Task Button */}
        <View style={styles.addTaskSection}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: currentTheme.colors.primary }]}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add New Task</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filtersContainer}>
          {/* Status Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Status</Text>
            <View style={styles.filterTabs}>
              {(['all', 'pending', 'completed'] as const).map((filterType) => (
                <TouchableOpacity
                  key={filterType}
                  style={[
                    styles.filterTab,
                    filter === filterType && styles.activeFilterTab,
                  ]}
                  onPress={() => setFilter(filterType)}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      filter === filterType && styles.activeFilterTabText,
                    ]}
                  >
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tag Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Tag</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagFilterScroll}
            >
              <TouchableOpacity
                style={[
                  styles.tagFilterTab,
                  !filterTag && styles.activeTagFilterTab,
                ]}
                onPress={() => setFilterTag(null)}
              >
                <Text
                  style={[
                    styles.tagFilterText,
                    !filterTag && styles.activeTagFilterText,
                  ]}
                >
                  All Tags
                </Text>
              </TouchableOpacity>
              {tags.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tagFilterTab,
                    filterTag === tag.id && styles.activeTagFilterTab,
                  ]}
                  onPress={() => setFilterTag(tag.id)}
                >
                  <View style={[styles.tagFilterDot, { backgroundColor: tag.color }]} />
                  <Text
                    style={[
                      styles.tagFilterText,
                      filterTag === tag.id && styles.activeTagFilterText,
                    ]}
                  >
                    {tag.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Stats Toggle */}
        <TouchableOpacity
          style={styles.statsToggle}
          onPress={() => setShowStats(!showStats)}
        >
          <Text style={styles.statsToggleText}>
            {showStats ? 'Hide' : 'Show'} Tag Statistics
          </Text>
        </TouchableOpacity>

        {/* Tag Statistics */}
        {showStats && <TagStatsView />}

      {/* Task List */}
        <View style={styles.taskList}>
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {filter === 'all' 
                ? 'No tasks yet. Create your first task!' 
                : `No ${filter} tasks.`}
            </Text>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
        </View>
      </ScrollView>

      {/* Add Task Modal */}
      <AddTaskModal 
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  addTaskSection: {
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
  filtersContainer: {
    marginBottom: 24,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  filterTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFilterTab: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  tagFilterScroll: {
    paddingRight: 24,
  },
  tagFilterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    gap: 6,
  },
  activeTagFilterTab: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  tagFilterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tagFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTagFilterText: {
    color: '#FFFFFF',
  },
  statsToggle: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statsToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  taskList: {
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});