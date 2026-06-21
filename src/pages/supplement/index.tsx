import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { SupplementTask } from '@/types';
import { getSupplementTasks } from '@/data/records';
import { getPriorityText, getPriorityColor, formatDate, showToast } from '@/utils';
import styles from './index.module.scss';

type FilterType = 'all' | 'high' | 'medium' | 'low' | 'completed';

const SupplementPage: React.FC = () => {
  const [tasks, setTasks] = useState<SupplementTask[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const data = getSupplementTasks();
      setTasks(data);
    } catch (error) {
      console.error('[Supplement] 加载待补照片数据失败:', error);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'all') return !t.isCompleted;
    if (filter === 'completed') return t.isCompleted;
    return t.priority === filter && !t.isCompleted;
  });

  const pendingTasks = tasks.filter(t => !t.isCompleted);
  const highPriorityCount = pendingTasks.filter(t => t.priority === 'high').length;

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部待补' },
    { key: 'high', label: '高优先' },
    { key: 'medium', label: '中优先' },
    { key: 'low', label: '低优先' },
    { key: 'completed', label: '已完成' }
  ];

  const getSourceText = (source: string) => {
    const map: Record<string, string> = {
      check: '审核发现',
      recheck: '复诊提醒',
      doctor: '医生要求'
    };
    return map[source] || source;
  };

  const isUrgent = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 1;
  };

  const handleTaskClick = (task: SupplementTask) => {
    console.log('[Supplement] 点击待补任务:', task.customerName);
  };

  const handleHandleTask = (task: SupplementTask) => {
    console.log('[Supplement] 处理待补任务:', task.customerName);
    showToast('已跳转到拍摄页面', 'success');
    Taro.navigateTo({
      url: '/pages/shooting/index?id=' + task.customerId + '&projectId=' + task.projectId
    });
  };

  const handleHandover = () => {
    console.log('[Supplement] 交班汇总');
    showToast('交班汇总已生成', 'success');
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.summaryCard}>
        <View className={styles.summaryHeader}>
          <Text className={styles.summaryTitle}>待补照片汇总</Text>
          <View className={styles.summaryBtn} onClick={handleHandover}>
            <Text>交班汇总</Text>
          </View>
        </View>
        <View className={styles.summaryStats}>
          <View className={styles.summaryItem}>
            <Text className={styles.statNum}>{pendingTasks.length}</Text>
            <Text className={styles.statLabel}>待补任务</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.statNum}>{highPriorityCount}</Text>
            <Text className={styles.statLabel}>高优先级</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.statNum}>
              {pendingTasks.reduce((sum, t) => sum + t.missingAngles.length, 0)}
            </Text>
            <Text className={styles.statLabel}>缺拍数量</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollX className={styles.filterBar}>
        {filters.map(item => (
          <View
            key={item.key}
            className={classnames(styles.filterTab, filter === item.key && styles.active)}
            onClick={() => setFilter(item.key)}
          >
            <Text>{item.label}</Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView scrollY className={styles.taskList}>
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <View
              key={task.id}
              className={classnames(styles.taskCard, task.isCompleted && styles.completed)}
              onClick={() => handleTaskClick(task)}
            >
              <View className={styles.taskHeader}>
                <View className={styles.customerInfo}>
                  <Text className={styles.customerName}>{task.customerName}</Text>
                  <View
                    className={classnames(styles.priorityBadge, styles[task.priority])}
                  >
                    <Text>{getPriorityText(task.priority)}优先</Text>
                  </View>
                </View>
                <Text className={styles.sourceTag}>{getSourceText(task.source)}</Text>
              </View>

              <View className={styles.taskBody}>
                <Text className={styles.projectName}>{task.projectName}</Text>
                <View className={styles.missingAngles}>
                  {task.missingAngleNames.map((name, index) => (
                    <Text key={index} className={styles.angleTag}>缺{name}</Text>
                  ))}
                </View>
              </View>

              <View className={styles.taskFooter}>
                <View className={styles.footerLeft}>
                  <View className={classnames(styles.deadline, isUrgent(task.deadline) && styles.urgent)}>
                    <Text>📅 截止：{formatDate(task.deadline)}</Text>
                  </View>
                </View>
                {!task.isCompleted && (
                  <Button
                    className={styles.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHandleTask(task);
                    }}
                  >
                    去补拍
                  </Button>
                )}
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>✅</Text>
            <Text className={styles.emptyText}>暂无待补照片</Text>
            <Text className={styles.emptyDesc}>所有拍摄任务都已完成</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SupplementPage;
