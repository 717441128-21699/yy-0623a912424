import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import CustomerCard from '@/components/CustomerCard';
import { Customer } from '@/types';
import { getTodayCustomers } from '@/data/customers';
import { formatDate, showToast } from '@/utils';
import styles from './index.module.scss';

type FilterType = 'all' | 'waiting' | 'shooting' | 'completed';

const TodayPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    try {
      const data = getTodayCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('[Today] 加载数据失败:', error);
      showToast('加载失败，请重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onPullDownRefresh = useCallback(() => {
    loadData();
    Taro.stopPullDownRefresh();
  }, []);

  useEffect(() => {
    Taro.eventCenter.on('pulldownrefresh', onPullDownRefresh);
    return () => {
      Taro.eventCenter.off('pulldownrefresh', onPullDownRefresh);
    };
  }, [onPullDownRefresh]);

  const filteredCustomers = customers.filter(c => {
    if (filter === 'all') return c.status !== 'cancelled';
    return c.status === filter;
  });

  const stats = {
    total: customers.filter(c => c.status !== 'cancelled').length,
    waiting: customers.filter(c => c.status === 'waiting').length,
    shooting: customers.filter(c => c.status === 'shooting').length,
    completed: customers.filter(c => c.status === 'completed').length
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'waiting', label: '待拍摄' },
    { key: 'shooting', label: '拍摄中' },
    { key: 'completed', label: '已完成' }
  ];

  const handleScan = () => {
    Taro.scanCode({
      success: (res) => {
        console.log('[Today] 扫码结果:', res.result);
        showToast('客户身份核验成功', 'success');
      },
      fail: (error) => {
        console.error('[Today] 扫码失败:', error);
        showToast('扫码失败，请重试', 'error');
      }
    });
  };

  const handleCustomerClick = (customer: Customer) => {
    console.log('[Today] 点击客户:', customer.name);
    Taro.navigateTo({
      url: '/pages/shooting/index?id=' + customer.id
    });
  };

  const handleStartShoot = (customer: Customer) => {
    console.log('[Today] 开始拍摄:', customer.name);
    Taro.switchTab({
      url: '/pages/confirm/index'
    });
  };

  const today = new Date();

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <View>
            <Text className={styles.headerTitle}>今日拍摄</Text>
            <View className={styles.headerDate}>
              <Text>{formatDate(today)} · 今日共 {stats.total} 位客户</Text>
            </View>
          </View>
          <View className={styles.scanBtn} onClick={handleScan}>
            <Text className={styles.scanIcon}>⌖</Text>
          </View>
        </View>

        <View className={styles.quickActions}>
          <View className={styles.quickAction} onClick={handleScan}>
            <Text>扫码核对</Text>
          </View>
          <View className={styles.quickAction}>
            <Text>交班汇总</Text>
          </View>
        </View>
      </View>

      <View className={styles.statsCard}>
        <Text className={styles.statsTitle}>今日统计</Text>
        <View className={styles.statsGrid}>
          <View className={styles.statItem}>
            <Text className={classnames(styles.statNum, styles.total)}>{stats.total}</Text>
            <Text className={styles.statLabel}>总预约</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={classnames(styles.statNum, styles.waiting)}>{stats.waiting}</Text>
            <Text className={styles.statLabel}>待拍摄</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={classnames(styles.statNum, styles.shooting)}>{stats.shooting}</Text>
            <Text className={styles.statLabel}>拍摄中</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={classnames(styles.statNum, styles.completed)}>{stats.completed}</Text>
            <Text className={styles.statLabel}>已完成</Text>
          </View>
        </View>
      </View>

      <View className={styles.filterBar}>
        {filters.map(item => (
          <View
            key={item.key}
            className={classnames(styles.filterItem, filter === item.key && styles.active)}
            onClick={() => setFilter(item.key)}
          >
            <Text className={styles.filterText}>
              {item.label}
              <Text className={styles.filterCount}>
                ({item.key === 'all' ? stats.total : stats[item.key]})
              </Text>
            </Text>
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.listContainer}>
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map(customer => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onClick={handleCustomerClick}
              onAction={handleStartShoot}
            />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📷</Text>
            <Text className={styles.emptyText}>暂无{filters.find(f => f.key === filter)?.label}客户</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default TodayPage;
