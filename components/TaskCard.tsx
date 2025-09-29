import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SquareCheck as CheckSquare, Square, Clock, Flag, Play } from 'lucide-react-native';
import { Task, useTaskStore } from '@/stores/taskStore';
import { useThemeStore } from '@/stores/themeStore';
import { useTagStore } from '@/stores/tagStore';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const { toggleTask, setActiveTask } = useTaskStore();
  const { currentTheme } = useThemeStore();
  const { getTagById } = useTagStore();

  const taskTag = task.tagId ? getTagById(task.tagId) : undefined;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getTimerModeText = (mode: string) => {
    switch (mode) {
      case 'pomodoro': return '25 min';
      case 'extended': return '60 min';
      case 'custom': return `${Math.floor((task.customDuration || 1500) / 60)} min`;
      default: return '25 min';
    }
  };

  return (
    <View style={[styles.container, task.completed && styles.completedContainer]}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => toggleTask(task.id)}
      >
        {task.completed ? (
          <CheckSquare size={24} color={currentTheme.colors.primary} />
        ) : (
          <Square size={24} color="#9CA3AF" />
        )}
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, task.completed && styles.completedTitle]}>
          {task.title}
        </Text>
        {task.description && (
          <Text style={[styles.description, task.completed && styles.completedDescription]}>
            {task.description}
          </Text>
        )}
        <View style={styles.metadata}>
          {taskTag && (
            <View style={[styles.tagBadge, { backgroundColor: taskTag.color + '20', borderColor: taskTag.color }]}>
              <View style={[styles.tagDot, { backgroundColor: taskTag.color }]} />
              <Text style={[styles.tagText, { color: taskTag.color }]}>
                {taskTag.name}
              </Text>
            </View>
          )}
          <View style={styles.priorityBadge}>
            <Flag size={12} color={getPriorityColor(task.priority)} />
            <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
              {task.priority}
            </Text>
          </View>
          <View style={styles.timeBadge}>
            <Clock size={12} color="#6B7280" />
            <Text style={styles.timeText}>{getTimerModeText(task.timerMode)}</Text>
          </View>
          {task.sessionTime > 0 && (
            <View style={styles.sessionBadge}>
              <Text style={styles.sessionText}>{task.sessionTime}m logged</Text>
            </View>
          )}
        </View>
      </View>

      {!task.completed && (
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => setActiveTask(task)}
        >
          <Play size={16} color="#6366F1" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  completedContainer: {
    backgroundColor: '#F3F4F6',
    opacity: 0.7,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  completedTitle: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  completedDescription: {
    color: '#D1D5DB',
  },
  metadata: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 3,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 3,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  sessionBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  sessionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    gap: 3,
  },
  tagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});