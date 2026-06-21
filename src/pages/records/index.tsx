import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { UploadRecord, PhotoRecord } from '@/types';
import { getUploadRecords, getOfflinePhotos } from '@/data/records';
import { formatDateTime, showToast } from '@/utils';
import styles from './index.module.scss';

type FilterType = 'all' | 'success' | 'pending' | 'failed' | 'offline';

const RecordsPage: React.FC = () => {
  const [records, setRecords] = useState<UploadRecord[]>([]);
  const [offlinePhotos, setOfflinePhotos] = useState<PhotoRecord[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const uploadRecords = getUploadRecords();
      setRecords(uploadRecords);
      
      const offline = getOfflinePhotos();
      setOfflinePhotos(offline);
    } catch (error) {
      console.error('[Records] 加载上传记录失败:', error);
    }
  };

  const filteredRecords = records.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'offline') return r.isOffline;
    return r.status === filter;
  });

  const stats = {
    total: records.length,
    success: records.filter(r => r.status === 'success').length,
    pending: records.filter(r => r.status === 'pending' || r.status === 'partial').length,
    failed: records.filter(r => r.status === 'failed').length,
    offline: records.filter(r => r.isOffline).length
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'success', label: '成功' },
    { key: 'pending', label: '待上传' },
    { key: 'failed', label: '失败' },
    { key: 'offline', label: '离线' }
  ];

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      success: '上传成功',
      pending: '待上传',
      failed: '上传失败',
      partial: '部分成功'
    };
    return map[status] || status;
  };

  const handleRecordClick = (record: UploadRecord) => {
    console.log('[Records] 点击记录:', record.customerName);
  };

  const handleRetry = (record: UploadRecord) => {
    console.log('[Records] 重试上传:', record.customerName);
    showToast('正在重新上传...', 'none');
  };

  const handleRetryAllOffline = () => {
    console.log('[Records] 全部重试离线照片');
    showToast('正在批量上传...', 'none');
  };

  const handleViewDetail = (record: UploadRecord) => {
    console.log('[Records] 查看详情:', record.customerName);
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
          <Text className={classnames(styles.statNum, styles.offline)}>{offlinePhotos.length}</Text>
          <Text className={styles.statLabel}>离线暂存</Text>
        </View>
      </View>

      {offlinePhotos.length > 0 && (
        <View className={styles.offlineNotice}>
          <Text className={styles.noticeIcon}>📡</Text>
          <View className={styles.noticeContent}>
            <Text className={styles.noticeTitle}>网络恢复中</Text>
            <Text className={styles.noticeDesc}>
              有 {offlinePhotos.length} 张照片暂存本地，网络恢复后将自动上传
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
                <View className={classnames(styles.statusBadge, styles[record.status])}>
                  <Text>{getStatusText(record.status)}</Text>
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
                  {(record.status === 'failed' || record.status === 'partial') && (
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
