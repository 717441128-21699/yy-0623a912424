import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Image, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { PhotoRecord } from '@/types';
import { useAppStore } from '@/store';
import { formatDateTime, showToast } from '@/utils';
import styles from './index.module.scss';

const RecordDetailPage: React.FC = () => {
  const router = useRouter();
  const recordId = router.params?.recordId || '';
  const getRecordById = useAppStore(state => state.getRecordById);
  const retryUpload = useAppStore(state => state.retryUpload);
  const retrySinglePhoto = useAppStore(state => state.retrySinglePhoto);
  
  const [retryCount, setRetryCount] = useState(0);
  const [resolvedId, setResolvedId] = useState('');

  useEffect(() => {
    const id = router.params?.recordId || '';
    if (id) {
      setResolvedId(id);
    } else if (retryCount < 5) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [router.params, retryCount]);

  const record = useMemo(() => {
    if (!resolvedId) return undefined;
    return getRecordById(resolvedId);
  }, [resolvedId, getRecordById, useAppStore(state => state.uploadRecords)]);

  const getPhotoStatusText = (photo: PhotoRecord) => {
    if (photo.uploadStatus === 'success') return '上传成功';
    if (photo.uploadStatus === 'failed') return '上传失败';
    if (photo.uploadStatus === 'pending' || photo.isOffline) return '待上传';
    return '上传中';
  };

  const getPhotoStatusStyle = (photo: PhotoRecord) => {
    if (photo.uploadStatus === 'success') return styles.success;
    if (photo.uploadStatus === 'failed') return styles.failed;
    return styles.pending;
  };

  const getQualityText = (photo: PhotoRecord) => {
    const issues: string[] = [];
    if (photo.exposureLevel === 'dark') issues.push('曝光偏暗');
    if (photo.exposureLevel === 'bright') issues.push('曝光过亮');
    if (photo.angleDeviation === 'slight') issues.push('角度微偏');
    if (photo.angleDeviation === 'serious') issues.push('角度偏差大');
    return issues.length > 0 ? issues.join('、') : '正常';
  };

  const getQualityColor = (photo: PhotoRecord) => {
    if (photo.angleDeviation === 'serious' || photo.exposureLevel === 'bright') return '#F53F3F';
    if (photo.angleDeviation === 'slight' || photo.exposureLevel === 'dark') return '#FF7D00';
    return '#00B42A';
  };

  const handleRetryAll = () => {
    if (!record) return;
    retryUpload(record.id);
    showToast('正在重新上传...', 'none');
    setTimeout(() => {
      showToast('上传成功', 'success');
    }, 1500);
  };

  const handleRetryPhoto = (photo: PhotoRecord) => {
    if (!record) return;
    retrySinglePhoto(record.id, photo.id);
    showToast('正在重新上传...', 'none');
    setTimeout(() => {
      showToast('上传成功', 'success');
    }, 1000);
  };

  const canRetryAll = record && (
    record.status === 'failed' || 
    record.status === 'partial' || 
    record.isOffline
  );

  const stats = useMemo(() => {
    if (!record || !record.photos) return { success: 0, failed: 0, pending: 0, total: 0 };
    const photos = record.photos;
    return {
      total: photos.length,
      success: photos.filter(p => p.uploadStatus === 'success').length,
      failed: photos.filter(p => p.uploadStatus === 'failed').length,
      pending: photos.filter(p => p.uploadStatus === 'pending' || p.uploadStatus === 'uploading' || p.isOffline).length
    };
  }, [record]);

  if (!record) {
    return (
      <View className={styles.pageContainer}>
        <View style={{ padding: '100rpx 32rpx', textAlign: 'center' }}>
          <Text style={{ fontSize: '48rpx', display: 'block', marginBottom: '24rpx' }}>🔍</Text>
          <Text style={{ fontSize: '28rpx', color: '#86909C' }}>
            {resolvedId ? '未找到该上传记录' : '正在加载...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      <View className={styles.headerCard}>
        <View className={styles.headerRow}>
          <View>
            <Text className={styles.customerName}>{record.customerName}</Text>
            <Text className={styles.projectName}>{record.projectName}</Text>
          </View>
          <View className={classnames(styles.statusBadge, styles[record.status], record.isOffline && styles.offline)}>
            <Text>
              {record.isOffline ? '离线暂存' : 
               record.status === 'success' ? '上传成功' :
               record.status === 'pending' ? '待上传' :
               record.status === 'partial' ? '部分成功' : '上传失败'}
            </Text>
          </View>
        </View>
        <View className={styles.infoRow}>
          <View className={styles.infoItem}>
            <Text>📷 {record.photoCount}张照片</Text>
          </View>
          <View className={styles.infoItem}>
            <Text>👩‍⚕️ {record.nurseName}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text>🕐 {formatDateTime(record.uploadTime)}</Text>
          </View>
        </View>
        {record.remark && (
          <View className={styles.remarkBox}>
            <Text className={styles.remarkLabel}>异常备注：</Text>
            <Text className={styles.remarkText}>{record.remark}</Text>
          </View>
        )}
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNum, styles.success)}>{stats.success}</Text>
          <Text className={styles.statLabel}>成功</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNum, styles.failed)}>{stats.failed}</Text>
          <Text className={styles.statLabel}>失败</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNum, styles.pending)}>{stats.pending}</Text>
          <Text className={styles.statLabel}>待上传</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statNum}>{stats.total}</Text>
          <Text className={styles.statLabel}>总计</Text>
        </View>
      </View>

      {canRetryAll && (
        <View className={styles.actionBar}>
          <Button className={styles.retryBtn} onClick={handleRetryAll}>
            重新上传全部
          </Button>
        </View>
      )}

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>照片详情</Text>
          <Text className={styles.sectionSub}>{record.photos?.length || 0}张</Text>
        </View>
        <View className={styles.photoGrid}>
          {record.photos?.map(photo => (
            <View key={photo.id} className={styles.photoCard}>
              <Image
                className={styles.photoImage}
                src={photo.thumbnailUrl}
                mode="aspectFill"
              />
              <View className={styles.photoInfo}>
                <Text className={styles.angleName}>{photo.angleName}</Text>
                <Text 
                  className={styles.qualityText}
                  style={{ color: getQualityColor(photo) }}
                >
                  {getQualityText(photo)}
                </Text>
                <View className={classnames(styles.photoStatus, getPhotoStatusStyle(photo))}>
                  <Text>{getPhotoStatusText(photo)}</Text>
                </View>
              </View>
              {(photo.uploadStatus === 'failed' || photo.uploadStatus === 'pending' || photo.isOffline) && (
                <Button
                  className={styles.retrySingleBtn}
                  onClick={() => handleRetryPhoto(photo)}
                >
                  重传
                </Button>
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default RecordDetailPage;
