import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { ProjectTemplate, PhotoRecord } from '@/types';
import { getTemplateById } from '@/data/templates';
import { getCustomerById } from '@/data/customers';
import { showToast } from '@/utils';
import styles from './index.module.scss';

const ShootingPage: React.FC = () => {
  const [customer, setCustomer] = useState<any>(null);
  const [template, setTemplate] = useState<ProjectTemplate | null>(null);
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0);
  const [takenPhotos, setTakenPhotos] = useState<Record<string, PhotoRecord>>({});
  const [currentPhoto, setCurrentPhoto] = useState<string>('');

  useEffect(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = (currentPage as any).options || {};
    
    const customerId = options.id || 'c002';
    const projectId = options.projectId || 'p002';
    
    const customerData = getCustomerById(customerId);
    const templateData = getTemplateById(projectId);
    
    if (customerData) setCustomer(customerData);
    if (templateData) setTemplate(templateData);
  }, []);

  if (!template || !customer) {
    return (
      <View className={styles.pageContainer}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const angles = template.angles;
  const currentAngle = angles[currentAngleIndex];
  const completedCount = Object.keys(takenPhotos).length;
  const requiredCount = angles.filter(a => a.isRequired).length;
  const completedRequiredCount = angles.filter(a => a.isRequired && takenPhotos[a.id]).length;
  const progressPercent = Math.round((completedCount / angles.length) * 100);

  const handleTakePhoto = () => {
    console.log('[Shooting] 拍摄照片:', currentAngle.name);
    
    const photoId = 'ph_' + Date.now();
    const photoRecord: PhotoRecord = {
      id: photoId,
      customerId: customer.id,
      customerName: customer.name,
      projectId: template.id,
      projectName: template.name,
      angleId: currentAngle.id,
      angleName: currentAngle.name,
      photoUrl: 'https://picsum.photos/id/' + (64 + currentAngleIndex) + '/600/800',
      thumbnailUrl: 'https://picsum.photos/id/' + (64 + currentAngleIndex) + '/200/267',
      shootTime: new Date().toISOString(),
      uploadStatus: 'pending',
      isOffline: true
    };
    
    setTakenPhotos(prev => ({
      ...prev,
      [currentAngle.id]: photoRecord
    }));
    setCurrentPhoto(photoRecord.photoUrl);
    
    showToast('拍摄成功', 'success');
    
    if (currentAngleIndex < angles.length - 1) {
      setTimeout(() => {
        setCurrentAngleIndex(currentAngleIndex + 1);
      }, 500);
    }
  };

  const handleAngleClick = (index: number) => {
    setCurrentAngleIndex(index);
    const photo = takenPhotos[angles[index].id];
    if (photo) {
      setCurrentPhoto(photo.photoUrl);
    } else {
      setCurrentPhoto('');
    }
  };

  const handlePrevAngle = () => {
    if (currentAngleIndex > 0) {
      const prevIndex = currentAngleIndex - 1;
      setCurrentAngleIndex(prevIndex);
      const photo = takenPhotos[angles[prevIndex].id];
      setCurrentPhoto(photo ? photo.photoUrl : '');
    }
  };

  const handleNextAngle = () => {
    if (currentAngleIndex < angles.length - 1) {
      const nextIndex = currentAngleIndex + 1;
      setCurrentAngleIndex(nextIndex);
      const photo = takenPhotos[angles[nextIndex].id];
      setCurrentPhoto(photo ? photo.photoUrl : '');
    }
  };

  const handleSubmit = () => {
    if (completedRequiredCount < requiredCount) {
      showToast('还有必拍角度未完成', 'error');
      return;
    }
    
    console.log('[Shooting] 提交照片:', completedCount, '张');
    showToast('照片已提交，等待上传', 'success');
    
    setTimeout(() => {
      Taro.switchTab({
        url: '/pages/records/index'
      });
    }, 1000);
  };

  const hasWarning = currentAngleIndex === 1;

  return (
    <View className={styles.pageContainer}>
      <View className={styles.customerBar}>
        <View className={styles.customerInfo}>
          <View className={styles.customerAvatar}>
            <Text className={styles.avatarText}>{customer.name.charAt(0)}</Text>
          </View>
          <Text className={styles.customerName}>{customer.name}</Text>
          <Text className={styles.projectName}>{template.name}</Text>
        </View>
      </View>

      <View className={styles.progressBox}>
        <View className={styles.progressHeader}>
          <Text className={styles.progressTitle}>拍摄进度</Text>
          <Text className={styles.progressNum}>
            {completedCount}/{angles.length} ({progressPercent}%)
          </Text>
        </View>
        <View className={styles.progressBar}>
          <View className={styles.progressFill} style={{ width: progressPercent + '%' }} />
        </View>
      </View>

      <View className={styles.photoPreview}>
        {currentPhoto ? (
          <Image
            className={styles.photoImage}
            src={currentPhoto}
            mode="aspectFit"
          />
        ) : (
          <View className={styles.guideOverlay}>
            <Text className={styles.guideTitle}>{currentAngle.name}</Text>
            <Text className={styles.guideDesc}>{currentAngle.description}</Text>
          </View>
        )}
        
        {currentAngle.isRequired && (
          <View className={styles.requiredBadge}>
            <Text>必拍</Text>
          </View>
        )}
        
        {takenPhotos[currentAngle.id] && (
          <View className={styles.doneBadge}>
            <Text>✓</Text>
          </View>
        )}
      </View>

      {hasWarning && (
        <View className={styles.warningTips}>
          <Text className={styles.warningIcon}>⚠️</Text>
          <Text className={styles.warningText}>
            注意：此角度需确保客户面部完全侧向，露出完整鼻梁轮廓线，
            请调整站位距离至约{template.distance}
          </Text>
        </View>
      )}

      <View className={styles.angleList}>
        <Text className={styles.sectionTitle}>
          拍摄角度 ({currentAngleIndex + 1}/{angles.length})
        </Text>
        <ScrollView scrollX className={styles.angleGrid}>
          {angles.map((angle, index) => (
            <View
              key={angle.id}
              className={classnames(
                styles.angleScrollItem,
                styles.angleItem,
                currentAngleIndex === index && styles.active,
                takenPhotos[angle.id] && styles.completed
              )}
              onClick={() => handleAngleClick(index)}
            >
              <View className={styles.anglePreview}>
                {takenPhotos[angle.id] ? (
                  <Image
                    className={styles.previewImage}
                    src={takenPhotos[angle.id].thumbnailUrl}
                    mode="aspectFill"
                  />
                ) : (
                  <Text className={styles.previewPlaceholder}>
                    {angle.direction === 'front' ? '👤' :
                     angle.direction === 'left' ? '👈' :
                     angle.direction === 'right' ? '👉' :
                     angle.direction === 'top' ? '⬆️' : '📷'}
                  </Text>
                )}
                {takenPhotos[angle.id] && (
                  <View className={styles.doneBadge}>
                    <Text>✓</Text>
                  </View>
                )}
                {angle.isRequired && !takenPhotos[angle.id] && (
                  <View className={styles.requiredBadge}>
                    <Text>必拍</Text>
                  </View>
                )}
              </View>
              <View className={styles.angleInfo}>
                <Text className={styles.angleName}>{angle.name}</Text>
                <Text className={classnames(
                  styles.angleStatus,
                  takenPhotos[angle.id] && styles.completed,
                  angle.isRequired && !takenPhotos[angle.id] && styles.required
                )}>
                  {takenPhotos[angle.id] ? '✓ 已拍摄' : (angle.isRequired ? '必须拍摄' : '选拍')}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className={styles.tipsCard}>
        <Text className={styles.tipsTitle}>
          💡 拍摄提示
        </Text>
        <View className={styles.tipsList}>
          {template.tips.slice(0, 3).map((tip, index) => (
            <View key={index}><Text>{tip}</Text></View>
          ))}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.actionButtons}>
          <Button
            className={styles.secondaryBtn}
            onClick={handlePrevAngle}
            disabled={currentAngleIndex === 0}
          >
            上一张
          </Button>
          <Button className={styles.primaryBtn} onClick={handleTakePhoto}>
            {takenPhotos[currentAngle.id] ? '重拍' : '拍摄'}
          </Button>
          <Button
            className={styles.secondaryBtn}
            onClick={handleNextAngle}
            disabled={currentAngleIndex === angles.length - 1}
          >
            下一张
          </Button>
        </View>
        <View style={{ display: 'flex', gap: '16rpx', marginTop: '16rpx' }}>
          <Button
            className={classnames(styles.primaryBtn, completedRequiredCount < requiredCount && styles.disabled)}
            onClick={handleSubmit}
            style={{ height: '80rpx', fontSize: '26rpx' }}
          >
            {completedCount > 0 ? `完成拍摄 (${completedCount}张)` : '完成拍摄'}
          </Button>
        </View>
      </View>
    </View>
  );
};

export default ShootingPage;
