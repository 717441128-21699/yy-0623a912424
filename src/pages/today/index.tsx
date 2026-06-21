import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import CustomerCard from '@/components/CustomerCard';
import { Customer } from '@/types';
import { useAppStore } from '@/store';
import { formatDate, showToast } from '@/utils';
import styles from './index.module.scss';

type FilterType = 'all' | 'waiting' | 'shooting' | 'completed';

const TodayPage: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  
  const customers = useAppStore(state => state.customers);
  const selectCustomer = useAppStore(state => state.selectCustomer);
  const findCustomerByNo = useAppStore(state => state.findCustomerByNo);
  const currentCustomerId = useAppStore(state => state.currentCustomerId);

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

  const handleScan = useCallback(() => {
    Taro.scanCode({
      success: (res) => {
        console.log('[Today] 扫码结果:', res.result);
        const code = res.result.trim();
        
        const found = findCustomerByNo(code);
        
        if (found) {
          console.log('[Today] 找到客户:', found.name);
          selectCustomer(found.id);
          showToast('客户身份核验成功', 'success');
          
          setTimeout(() => {
            Taro.switchTab({
              url: '/pages/confirm/index'
            });
          }, 800);
        } else {
          console.warn('[Today] 未找到对应客户:', code);
          showToast('未找到对应客户，请核对预约号', 'error');
        }
      },
      fail: (error) => {
        console.error('[Today] 扫码失败:', error);
        showToast('扫码失败，请重试', 'error');
      }
    });
  }, [findCustomerByNo, selectCustomer]);

  const handleCustomerClick = useCallback((customer: Customer) => {
    console.log('[Today] 点击客户:', customer.name);
    selectCustomer(customer.id);
    Taro.navigateTo({
      url: '/pages/template-detail?id=' + customer.projectIds[0]
    });
  }, [selectCustomer]);

  const handleStartShoot = useCallback((customer: Customer) => {
    console.log('[Today] 开始拍摄:', customer.name);
    selectCustomer(customer.id);
    Taro.switchTab({
      url: '/pages/confirm/index'
    });
  }, [selectCustomer]);

  const handleHandover = useCallback(() => {
    console.log('[Today] 交班汇总');
    Taro.switchTab({
      url: '/pages/supplement/index'
    });
  }, []);

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
          <View className={styles.quickAction} onClick={handleHandover}>
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
