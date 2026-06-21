import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { UploadRecord } from '@/types';
import { useAppStore } from '@/store';
import { formatDateTime, showToast } from '@/utils';
import styles from './index.module.scss';

type FilterType = 'all' | 'success' | 'pending' | 'failed' | 'offline';

const RecordsPage: React.FC = () => {
  const uploadRecords = useAppStore(state => state.uploadRecords);
  const offlinePhotos = useAppStore(state => state.offlinePhotos);
  const retryUpload = useAppStore(state => state.retryUpload);
  const retryAllOffline = useAppStore(state => state.retryAllOffline);
  
  const [filter, setFilter] = useState<FilterType>('all');

  const stats = useMemo(() => {
    const success = uploadRecords.filter(r => r.status === 'success' && !r.isOffline).length;
    const pending = uploadRecords.filter(r => 
      r.status === 'pending' || r.status === 'partial'
    ).length;
    const failed = uploadRecords.filter(r => r.status === 'failed').length;
    const offline = uploadRecords.filter(r => r.isOffline).length;
    return { success, pending, failed, offline, total: uploadRecords.length };
  }, [uploadRecords]);

  const filteredRecords = useMemo(() => {
    return uploadRecords.filter(r => {
      if (filter === 'all') return true;
      if (filter === 'success') return r.status === 'success' && !r.isOffline;
      if (filter === 'pending') return r.status === 'pending' || r.status === 'partial';
      if (filter === 'failed') return r.status === 'failed';
      if (filter === 'offline') return r.isOffline;
      return true;
    });
  }, [uploadRecords, filter]);

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: stats.total },
    { key: 'success', label: '成功', count: stats.success },
    { key: 'pending', label: '待上传', count: stats.pending },
    { key: 'failed', label: '失败', count: stats.failed },
    { key: 'offline', label: '离线', count: stats.offline }
  ];

  const getStatusText = (status: string, isOffline?: boolean) => {
    if (isOffline) return '离线暂存';
    const map: Record<string, string> = {
      success: '上传成功',
      pending: '待上传',
      failed: '上传失败',
      partial: '部分成功'
    };
    return map[status] || status;
  };

  const getStatusStyle = (status: string, isOffline?: boolean) => {
    if (isOffline) return styles.offline;
    const map: Record<string, string> = {
      success: styles.success,
      pending: styles.pending,
      failed: styles.failed,
      partial: styles.partial
    };
    return map[status] || '';
  };

  const handleRecordClick = useCallback((record: UploadRecord) => {
    console.log('[Records] 点击记录:', record.customerName);
  }, []);

  const handleRetry = useCallback((record: UploadRecord) => {
    console.log('[Records] 重试上传:', record.customerName);
    retryUpload(record.id);
    showToast('正在重新上传...', 'none');
    
    setTimeout(() => {
      showToast('上传成功', 'success');
    }, 1500);
  }, [retryUpload]);

  const handleRetryAllOffline = useCallback(() => {
    console.log('[Records] 全部重试离线照片');
    retryAllOffline();
    showToast('正在批量上传...', 'none');
    
    setTimeout(() => {
      showToast('全部上传成功', 'success');
    }, 2000);
  }, [retryAllOffline]);

  const handleViewDetail = useCallback((record: UploadRecord) => {
    console.log('[Records] 查看详情:', record.customerName);
    Taro.showModal({
      title: record.projectName,
      content: `客户：${record.customerName}\n照片数量：${record.photoCount}张\n上传时间：${formatDateTime(record.uploadTime)}\n护士：${record.nurseName}${record.remark ? '\n备注：' + record.remark : ''}`,
      showCancel: false,
      confirmText: '知道了'
    });
  }, []);

  const needsRetry = (record: UploadRecord) => {
    return record.status === 'failed' || record.status === 'partial' || record.isOffline;
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNum, styles.success)}>{stats.success}</Text>
          <Text className={styles.statLabel}>上传成功</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNum, styles.pending)}>{stats.pending}</Text>
          <Text className={styles.statLabel}>待上传</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNum, styles.failed)}>{stats.failed}</Text>
          <Text className={styles.statLabel}>上传失败</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNum, styles.offline)}>{stats.offline}</Text>
          <Text className={styles.statLabel}>离线暂存</Text>
        </View>
      </View>

      {stats.offline > 0 && (
        <View className={styles.offlineNotice}>
          <Text className={styles.noticeIcon}>📡</Text>
          <View className={styles.noticeContent}>
            <Text className={styles.noticeTitle}>网络恢复中</Text>
            <Text className={styles.noticeDesc}>
              有 {stats.offline} 条离线记录待上传
            </Text>
          </View>
          <Button className={styles.retryAllBtn} onClick={handleRetryAllOffline}>
            立即上传
          </Button>
        </View>
      )}

      <ScrollView scrollX className={styles.filterBar}>
        {filters.map(item => (
          <View
            key={item.key}
            className={classnames(styles.filterTab, filter === item.key && styles.active)}
            onClick={() => setFilter(item.key)}
          >
            <Text>{item.label}</Text>
            <Text className={styles.filterCount}>({item.count})</Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView scrollY className={styles.recordsList}>
        {filteredRecords.length > 0 ? (
          filteredRecords.map(record => (
            <View
              key={record.id}
              className={styles.recordCard}
              onClick={() => handleRecordClick(record)}
            >
              <View className={styles.recordHeader}>
                <View style={{ display: 'flex', alignItems: 'center' }}>
                  <Text className={styles.customerName}>{record.customerName}</Text>
                  {record.isOffline && (
                    <Text className={styles.offlineTag}>
                      <Text>⚡</Text>
                      <Text>离线暂存</Text>
                    </Text>
                  )}
                </View>
                <View className={classnames(styles.statusBadge, getStatusStyle(record.status, record.isOffline))}>
                  <Text>{getStatusText(record.status, record.isOffline)}</Text>
                </View>
              </View>

              <View className={styles.recordBody}>
                <Text className={styles.projectName}>{record.projectName}</Text>
                <View className={styles.recordInfo}>
                  <View className={styles.infoItem}>
                    <Text>📷 {record.photoCount}张照片</Text>
                  </View>
                  <View className={styles.infoItem}>
                    <Text>👩‍⚕️ {record.nurseName}</Text>
                  </View>
                  {record.failedCount && record.failedCount > 0 && (
                    <View className={styles.infoItem}>
                      <Text style={{ color: '#F53F3F' }}>❌ {record.failedCount}张失败</Text>
                    </View>
                  )}
                </View>
                {record.remark && (
                  <View className={styles.remarkBox}>
                    <Text>📝 {record.remark}</Text>
                  </View>
                )}
              </View>

              <View className={styles.recordFooter}>
                <Text className={styles.uploadTime}>{formatDateTime(record.uploadTime)}</Text>
                <View style={{ display: 'flex', gap: '16rpx' }}>
                  {needsRetry(record) && (
                    <Button
                      className={classnames(styles.actionBtn, styles.retry)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRetry(record);
                      }}
                    >
                      重试
                    </Button>
                  )}
                  <Button
                    className={styles.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetail(record);
                    }}
                  >
                    详情
                  </Button>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📁</Text>
            <Text className={styles.emptyText}>暂无上传记录</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default RecordsPage;
