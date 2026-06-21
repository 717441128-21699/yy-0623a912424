import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Button, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { ProjectTemplate, PhotoRecord } from '@/types';
import { useAppStore } from '@/store';
import { getTemplateById } from '@/data/templates';
import { showToast, generateId } from '@/utils';
import styles from './index.module.scss';

interface QualityCheck {
  exposure: 'normal' | 'dark' | 'bright';
  angle: 'normal' | 'slight' | 'serious';
}

const ShootingPage: React.FC = () => {
  const currentShootSession = useAppStore(state => state.currentShootSession);
  const getCurrentCustomer = useAppStore(state => state.getCurrentCustomer);
  const addPhotoToSession = useAppStore(state => state.addPhotoToSession);
  const submitShootSession = useAppStore(state => state.submitShootSession);
  const updateShootSession = useAppStore(state => state.updateShootSession);
  const startShootSession = useAppStore(state => state.startShootSession);
  
  const customer = getCurrentCustomer();
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string>('');
  const [lastQuality, setLastQuality] = useState<QualityCheck | null>(null);

  const [projectTemplates, setProjectTemplates] = useState<ProjectTemplate[]>([]);

  useEffect(() => {
    if (customer && customer.projectIds.length > 0) {
      const templates = customer.projectIds
        .map(id => getTemplateById(id))
        .filter(Boolean) as ProjectTemplate[];
      setProjectTemplates(templates);
      
      if (!currentShootSession || currentShootSession.customerId !== customer.id) {
        startShootSession(customer.id, customer.projectIds[0]);
      }
    }
  }, [customer, currentShootSession, startShootSession]);

  const currentTemplate = projectTemplates[currentProjectIndex];
  
  const angles = currentTemplate?.angles || [];
  const currentAngle = angles[currentAngleIndex];
  
  const sessionPhotos = currentShootSession?.photos || [];
  
  const currentProjectPhotos = useMemo(() => {
    if (!currentTemplate || !currentShootSession) return [];
    return sessionPhotos.filter(p => p.projectId === currentTemplate.id);
  }, [currentTemplate, currentShootSession, sessionPhotos]);

  const getPhotoForAngle = useCallback((angleId: string) => {
    return currentProjectPhotos.find(p => p.angleId === angleId);
  }, [currentProjectPhotos]);

  const simulateQualityCheck = useCallback((): QualityCheck => {
    const exposureRandom = Math.random();
    const angleRandom = Math.random();
    
    let exposure: QualityCheck['exposure'] = 'normal';
    let angle: QualityCheck['angle'] = 'normal';
    
    if (exposureRandom < 0.15) exposure = 'dark';
    else if (exposureRandom < 0.25) exposure = 'bright';
    
    if (angleRandom < 0.2) angle = 'slight';
    else if (angleRandom < 0.25) angle = 'serious';
    
    return { exposure, angle };
  }, []);

  const getQualityText = (quality: QualityCheck) => {
    const texts: string[] = [];
    if (quality.exposure === 'dark') texts.push('曝光偏暗');
    if (quality.exposure === 'bright') texts.push('曝光过亮');
    if (quality.angle === 'slight') texts.push('角度轻微偏差');
    if (quality.angle === 'serious') texts.push('角度偏差较大');
    return texts.length > 0 ? texts.join('、') : '正常';
  };

  const hasQualityIssue = (quality: QualityCheck | null) => {
    if (!quality) return false;
    return quality.exposure !== 'normal' || quality.angle !== 'normal';
  };

  const handleTakePhoto = useCallback(() => {
    if (!customer || !currentTemplate || !currentAngle) return;
    
    console.log('[Shooting] 拍摄照片:', currentAngle.name);
    
    const quality = simulateQualityCheck();
    setLastQuality(quality);
    
    const photoId = 'ph_' + generateId();
    const photoRecord: PhotoRecord = {
      id: photoId,
      customerId: customer.id,
      customerName: customer.name,
      projectId: currentTemplate.id,
      projectName: currentTemplate.name,
      angleId: currentAngle.id,
      angleName: currentAngle.name,
      photoUrl: 'https://picsum.photos/id/' + (64 + currentAngleIndex + currentProjectIndex * 10) + '/600/800',
      thumbnailUrl: 'https://picsum.photos/id/' + (64 + currentAngleIndex + currentProjectIndex * 10) + '/200/267',
      shootTime: new Date().toISOString(),
      uploadStatus: 'pending',
      isOffline: true,
      exposureLevel: quality.exposure,
      angleDeviation: quality.angle
    };
    
    addPhotoToSession(photoRecord);
    setCurrentPhotoUrl(photoRecord.photoUrl);
    
    if (hasQualityIssue(quality)) {
      showToast('注意：' + getQualityText(quality), 'none');
    } else {
      showToast('拍摄成功', 'success');
    }
    
    if (currentAngleIndex < angles.length - 1) {
      setTimeout(() => {
        setCurrentAngleIndex(currentAngleIndex + 1);
        const nextPhoto = getPhotoForAngle(angles[currentAngleIndex + 1].id);
        setCurrentPhotoUrl(nextPhoto ? nextPhoto.photoUrl : '');
        setLastQuality(null);
      }, 800);
    }
  }, [customer, currentTemplate, currentAngle, currentAngleIndex, angles, 
      addPhotoToSession, simulateQualityCheck, getPhotoForAngle]);

  const handleAngleClick = useCallback((index: number) => {
    setCurrentAngleIndex(index);
    const photo = getPhotoForAngle(angles[index].id);
    setCurrentPhotoUrl(photo ? photo.photoUrl : '');
    if (photo) {
      setLastQuality({
        exposure: photo.exposureLevel || 'normal',
        angle: photo.angleDeviation || 'normal'
      });
    } else {
      setLastQuality(null);
    }
  }, [angles, getPhotoForAngle]);

  const handleProjectChange = useCallback((index: number) => {
    if (!customer || index >= customer.projectIds.length) return;
    
    setCurrentProjectIndex(index);
    setCurrentAngleIndex(0);
    setCurrentPhotoUrl('');
    setLastQuality(null);
    
    startShootSession(customer.id, customer.projectIds[index]);
  }, [customer, startShootSession]);

  const handlePrevAngle = useCallback(() => {
    if (currentAngleIndex > 0) {
      const prevIndex = currentAngleIndex - 1;
      setCurrentAngleIndex(prevIndex);
      const photo = getPhotoForAngle(angles[prevIndex].id);
      setCurrentPhotoUrl(photo ? photo.photoUrl : '');
      if (photo) {
        setLastQuality({
          exposure: photo.exposureLevel || 'normal',
          angle: photo.angleDeviation || 'normal'
        });
      } else {
        setLastQuality(null);
      }
    }
  }, [currentAngleIndex, angles, getPhotoForAngle]);

  const handleNextAngle = useCallback(() => {
    if (currentAngleIndex < angles.length - 1) {
      const nextIndex = currentAngleIndex + 1;
      setCurrentAngleIndex(nextIndex);
      const photo = getPhotoForAngle(angles[nextIndex].id);
      setCurrentPhotoUrl(photo ? photo.photoUrl : '');
      if (photo) {
        setLastQuality({
          exposure: photo.exposureLevel || 'normal',
          angle: photo.angleDeviation || 'normal'
        });
      } else {
        setLastQuality(null);
      }
    }
  }, [currentAngleIndex, angles, getPhotoForAngle]);

  const handleSubmit = useCallback(() => {
    const totalRequired = projectTemplates.reduce((sum, t) => 
      sum + t.angles.filter(a => a.isRequired).length, 0
    );
    const completedRequired = projectTemplates.reduce((sum, t) => 
      sum + t.angles.filter(a => 
        a.isRequired && sessionPhotos.some(p => p.angleId === a.id && p.projectId === t.id)
      ).length, 0
    );
    
    if (completedRequired < totalRequired) {
      showToast(`还有 ${totalRequired - completedRequired} 个必拍角度未完成`, 'error');
      return;
    }
    
    if (sessionPhotos.length === 0) {
      showToast('请先拍摄照片', 'error');
      return;
    }
    
    console.log('[Shooting] 提交照片:', sessionPhotos.length, '张');
    
    const record = submitShootSession();
    
    showToast('照片已提交，等待上传', 'success');
    
    setTimeout(() => {
      Taro.switchTab({
        url: '/pages/records/index'
      });
    }, 1000);
  }, [projectTemplates, sessionPhotos, submitShootSession]);

  if (!customer || !currentTemplate) {
    return (
      <View className={styles.pageContainer}>
        <View style={{ padding: '100rpx 32rpx', textAlign: 'center' }}>
          <Text style={{ fontSize: '28rpx', color: '#86909C' }}>
            请先从今日拍摄选择客户
          </Text>
          <Button
            style={{ marginTop: '32rpx', height: '80rpx', lineHeight: '80rpx', 
                     background: '#1677FF', color: '#fff', borderRadius: '48rpx',
                     fontSize: '28rpx', border: 'none' }}
            onClick={() => Taro.switchTab({ url: '/pages/today/index' })}
          >
            去选择客户
          </Button>
        </View>
      </View>
    );
  }

  const completedCount = currentProjectPhotos.length;
  const requiredCount = angles.filter(a => a.isRequired).length;
  const completedRequiredCount = angles.filter(a => 
    a.isRequired && currentProjectPhotos.some(p => p.angleId === a.id)
  ).length;
  const progressPercent = angles.length > 0 
    ? Math.round((completedCount / angles.length) * 100) 
    : 0;

  const totalPhotos = sessionPhotos.length;
  const totalRequired = projectTemplates.reduce((sum, t) => 
    sum + t.angles.filter(a => a.isRequired).length, 0
  );
  const totalCompletedRequired = projectTemplates.reduce((sum, t) => 
    sum + t.angles.filter(a => 
      a.isRequired && sessionPhotos.some(p => p.angleId === a.id && p.projectId === t.id)
    ).length, 0
  );

  return (
    <View className={styles.pageContainer}>
      <View className={styles.customerBar}>
        <View className={styles.customerInfo}>
          <View className={styles.customerAvatar}>
            <Text className={styles.avatarText}>{customer.name.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text className={styles.customerName}>{customer.name}</Text>
            <View style={{ display: 'flex', gap: '16rpx', marginTop: '4rpx' }}>
              {projectTemplates.map((t, idx) => (
                <Text
                  key={t.id}
                  style={{
                    fontSize: '22rpx',
                    padding: '2rpx 10rpx',
                    borderRadius: '8rpx',
                    background: idx === currentProjectIndex 
                      ? '#1677FF' 
                      : '#E6F4FF',
                    color: idx === currentProjectIndex ? '#fff' : '#1677FF'
                  }}
                  onClick={() => handleProjectChange(idx)}
                >
                  {t.name}
                </Text>
              ))}
            </View>
          </View>
        </View>
        <Text style={{ fontSize: '24rpx', color: '#86909C' }}>
          共{totalPhotos}张 / 必拍{totalCompletedRequired}/{totalRequired}
        </Text>
      </View>

      <View className={styles.progressBox}>
        <View className={styles.progressHeader}>
          <Text className={styles.progressTitle}>
            {currentTemplate.name}拍摄进度
          </Text>
          <Text className={styles.progressNum}>
            {completedCount}/{angles.length} ({progressPercent}%)
          </Text>
        </View>
        <View className={styles.progressBar}>
          <View className={styles.progressFill} style={{ width: progressPercent + '%' }} />
        </View>
      </View>

      <View className={styles.photoPreview}>
        {currentPhotoUrl ? (
          <Image
            className={styles.photoImage}
            src={currentPhotoUrl}
            mode="aspectFit"
          />
        ) : (
          <View className={styles.guideOverlay}>
            <Text className={styles.guideTitle}>{currentAngle?.name || '准备拍摄'}</Text>
            <Text className={styles.guideDesc}>
              {currentAngle?.description || '请选择拍摄角度'}
            </Text>
          </View>
        )}
        
        {currentAngle?.isRequired && (
          <View className={styles.requiredBadge}>
            <Text>必拍</Text>
          </View>
        )}
        
        {getPhotoForAngle(currentAngle?.id || '') && (
          <View className={styles.doneBadge}>
            <Text>✓</Text>
          </View>
        )}
      </View>

      {lastQuality && hasQualityIssue(lastQuality) && (
        <View className={styles.warningTips}>
          <Text className={styles.warningIcon}>⚠️</Text>
          <Text className={styles.warningText}>
            照片质量提示：{getQualityText(lastQuality)}，建议确认是否重拍
          </Text>
        </View>
      )}
      
      {lastQuality && !hasQualityIssue(lastQuality) && currentPhotoUrl && (
        <View style={{ 
          margin: '16rpx 32rpx',
          padding: '16rpx',
          background: '#E8FFEA',
          borderRadius: '12rpx',
          display: 'flex',
          alignItems: 'center',
          gap: '12rpx'
        }}>
          <Text>✅</Text>
          <Text style={{ fontSize: '26rpx', color: '#00B42A' }}>
            照片质量正常
          </Text>
        </View>
      )}

      <View className={styles.angleList}>
        <Text className={styles.sectionTitle}>
          拍摄角度 ({currentAngleIndex + 1}/{angles.length})
        </Text>
        <ScrollView scrollX className={styles.angleGrid}>
          {angles.map((angle, index) => {
            const photo = getPhotoForAngle(angle.id);
            const hasIssue = photo && (
              photo.exposureLevel !== 'normal' && photo.exposureLevel !== undefined ||
              photo.angleDeviation !== 'normal' && photo.angleDeviation !== undefined
            );
            
            return (
              <View
                key={angle.id}
                className={classnames(
                  styles.angleScrollItem,
                  styles.angleItem,
                  currentAngleIndex === index && styles.active,
                  photo && styles.completed
                )}
                onClick={() => handleAngleClick(index)}
              >
                <View className={styles.anglePreview}>
                  {photo ? (
                    <Image
                      className={styles.previewImage}
                      src={photo.thumbnailUrl}
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
                  {photo && (
                    <View className={styles.doneBadge}>
                      <Text>✓</Text>
                    </View>
                  )}
                  {angle.isRequired && !photo && (
                    <View className={styles.requiredBadge}>
                      <Text>必拍</Text>
                    </View>
                  )}
                  {hasIssue && (
                    <View style={{
                      position: 'absolute',
                      top: '16rpx',
                      left: '16rpx',
                      padding: '4rpx 10rpx',
                      background: '#F53F3F',
                      color: '#fff',
                      fontSize: '20rpx',
                      borderRadius: '8rpx',
                      zIndex: 10
                    }}>
                      <Text>需注意</Text>
                    </View>
                  )}
                </View>
                <View className={styles.angleInfo}>
                  <Text className={styles.angleName}>{angle.name}</Text>
                  <Text className={classnames(
                    styles.angleStatus,
                    photo && styles.completed,
                    angle.isRequired && !photo && styles.required
                  )}>
                    {photo ? '✓ 已拍摄' : (angle.isRequired ? '必须拍摄' : '选拍')}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      <View className={styles.tipsCard}>
        <Text className={styles.tipsTitle}>
          💡 拍摄提示
        </Text>
        <View className={styles.tipsList}>
          {currentTemplate.tips.slice(0, 3).map((tip, index) => (
            <View key={index}><Text>{tip}</Text></View>
          ))}
          <View><Text>拍摄距离：{currentTemplate.distance}</Text></View>
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
            {getPhotoForAngle(currentAngle?.id || '') ? '重拍' : '拍摄'}
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
            className={classnames(styles.primaryBtn, 
              totalCompletedRequired < totalRequired && styles.disabled)}
            onClick={handleSubmit}
            style={{ height: '80rpx', fontSize: '26rpx' }}
          >
            {totalPhotos > 0 ? `完成拍摄 (${totalPhotos}张)` : '完成拍摄'}
          </Button>
        </View>
      </View>
    </View>
  );
};

export default ShootingPage;
