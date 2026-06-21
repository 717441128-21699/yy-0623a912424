import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import { useAppStore } from '@/store';
import { getAllTemplates, getTemplateById } from '@/data/templates';
import { ProjectTemplate } from '@/types';
import styles from './index.module.scss';

const TemplateDetailPage: React.FC = () => {
  const storeTemplates = useAppStore(state => state.templates);
  const getCurrentCustomer = useAppStore(state => state.getCurrentCustomer);
  const getSessionPhotosByProject = useAppStore(state => state.getSessionPhotosByProject);
  const router = useRouter();
  const [templateId, setTemplateId] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const id = router.params?.id || '';
    if (id) {
      setTemplateId(id);
    } else {
      if (retryCount < 5) {
        const timer = setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, [router.params, retryCount]);

  const customer = getCurrentCustomer();

  const template = useMemo<ProjectTemplate | undefined>(() => {
    if (!templateId) return undefined;
    
    if (storeTemplates.length > 0) {
      const fromStore = storeTemplates.find(t => t.id === templateId);
      if (fromStore) return fromStore;
    }
    
    const allTemplates = getAllTemplates();
    const fromAll = allTemplates.find(t => t.id === templateId);
    if (fromAll) return fromAll;
    
    const fromData = getTemplateById(templateId);
    if (fromData) return fromData;
    
    return undefined;
  }, [templateId, storeTemplates]);

  const requiredAngles = useMemo(() => {
    return template?.angles.filter(a => a.isRequired) || [];
  }, [template]);

  const optionalAngles = useMemo(() => {
    return template?.angles.filter(a => !a.isRequired) || [];
  }, [template]);

  const completedAngleIds = useMemo(() => {
    if (!templateId || !customer) return new Set<string>();
    const photos = getSessionPhotosByProject(templateId);
    return new Set(photos.map(p => p.angleId));
  }, [templateId, customer, getSessionPhotosByProject]);

  const completedRequired = useMemo(() => {
    return requiredAngles.filter(a => completedAngleIds.has(a.id)).length;
  }, [requiredAngles, completedAngleIds]);

  const getDirectionIcon = useCallback((direction: string) => {
    const icons: Record<string, string> = {
      front: '👤',
      left: '👈',
      right: '👉',
      top: '⬆️',
      bottom: '⬇️',
      oblique: '🔄'
    };
    return icons[direction] || '📷';
  }, []);

  const getDirectionText = useCallback((direction: string) => {
    const texts: Record<string, string> = {
      front: '正面',
      left: '左侧',
      right: '右侧',
      top: '仰视',
      bottom: '俯视',
      oblique: '斜面'
    };
    return texts[direction] || direction;
  }, []);

  if (!template) {
    return (
      <View className={styles.pageContainer}>
        <View style={{ padding: '100rpx 32rpx', textAlign: 'center' }}>
          <Text style={{ fontSize: '48rpx', display: 'block', marginBottom: '24rpx' }}>🔍</Text>
          <Text style={{ fontSize: '28rpx', color: '#86909C' }}>
            {templateId ? '项目模板不存在' : '正在加载项目详情...'}
          </Text>
        </View>
      </View>
    );
  }

  const renderAngleList = (angles: typeof template.angles, showCompleted: boolean) => {
    return angles.map((angle, index) => {
      const isCompleted = completedAngleIds.has(angle.id);
      return (
        <View key={angle.id} className={styles.angleItem}>
          <View className={styles.anglePreview}>
            <Text style={{ fontSize: '40rpx' }}>
              {getDirectionIcon(angle.direction)}
            </Text>
            {isCompleted && (
              <View className={styles.doneBadge}>
                <Text>✓</Text>
              </View>
            )}
          </View>
          <View className={styles.angleInfo}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx' }}>
              <Text className={styles.angleName}>
                {showCompleted ? `${index + 1}. ` : ''}{angle.name}
              </Text>
              {angle.isRequired ? (
                <View className={styles.requiredBadge}>
                  <Text>必拍</Text>
                </View>
              ) : (
                <View className={styles.optionalBadge}>
                  <Text>选拍</Text>
                </View>
              )}
              {customer && isCompleted && (
                <View className={styles.completedTag}>
                  <Text>已拍摄</Text>
                </View>
              )}
            </View>
            <Text className={styles.angleDesc}>{angle.description}</Text>
            <View className={styles.directionTag}>
              <Text>{getDirectionText(angle.direction)}</Text>
            </View>
          </View>
        </View>
      );
    });
  };

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      <View className={styles.headerCard}>
        <Text className={styles.templateName}>{template.name}</Text>
        <View className={styles.templateCategory}>
          <Text>{template.category}项目</Text>
        </View>
        <Text className={styles.templateDesc}>{template.description}</Text>
      </View>

      <View className={styles.infoGrid}>
        <View className={styles.infoCard}>
          <Text className={styles.infoIcon}>📏</Text>
          <Text className={styles.infoLabel}>拍摄距离</Text>
          <Text className={styles.infoValue}>{template.distance}</Text>
        </View>
        <View className={styles.infoCard}>
          <Text className={styles.infoIcon}>💡</Text>
          <Text className={styles.infoLabel}>光线要求</Text>
          <Text className={styles.infoValue}>{template.lighting}</Text>
        </View>
        <View className={styles.infoCard}>
          <Text className={styles.infoIcon}>📸</Text>
          <Text className={styles.infoLabel}>必拍角度</Text>
          <Text className={styles.infoValue}>
            {customer 
              ? `${completedRequired}/${requiredAngles.length}已完成` 
              : `共${requiredAngles.length}个`
            }
          </Text>
        </View>
      </View>

      {customer && (
        <View className={styles.progressCard}>
          <View className={styles.progressHeader}>
            <Text className={styles.progressTitle}>拍摄完成情况</Text>
            <Text className={styles.progressNum}>
              {completedRequired}/{requiredAngles.length}
            </Text>
          </View>
          <View className={styles.progressBar}>
            <View 
              className={styles.progressFill} 
              style={{ width: requiredAngles.length > 0 
                ? Math.round((completedRequired / requiredAngles.length) * 100) + '%' 
                : '0%' 
              }} 
            />
          </View>
          {completedRequired < requiredAngles.length && (
            <Text className={styles.progressTip}>
              ⚠️ 还有 {requiredAngles.length - completedRequired} 个必拍角度未完成
            </Text>
          )}
          {completedRequired === requiredAngles.length && requiredAngles.length > 0 && (
            <Text className={styles.progressTip}>
              ✅ 所有必拍角度已完成
            </Text>
          )}
        </View>
      )}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          必拍角度（{requiredAngles.length}个）
        </Text>
        <View className={styles.angleList}>
          {renderAngleList(requiredAngles, true)}
        </View>
      </View>

      {optionalAngles.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            选拍角度（{optionalAngles.length}个）
          </Text>
          <View className={styles.angleList}>
            {renderAngleList(optionalAngles, true)}
          </View>
        </View>
      )}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>📋 拍摄小提示</Text>
        <View className={styles.tipsCard}>
          <View className={styles.tipsRow}>
            <Text className={styles.tipsIcon}>📏</Text>
            <View className={styles.tipsContent}>
              <Text className={styles.tipsTitle}>拍摄距离</Text>
              <Text className={styles.tipsText}>请保持相机与客户距离约 {template.distance}，确保取景框内面部完整、比例合适</Text>
            </View>
          </View>
          <View className={styles.tipsRow}>
            <Text className={styles.tipsIcon}>💡</Text>
            <View className={styles.tipsContent}>
              <Text className={styles.tipsTitle}>光线要求</Text>
              <Text className={styles.tipsText}>{template.lighting}，避免强逆光和脸部阴影</Text>
            </View>
          </View>
          {template.tips.slice(0, 4).map((tip, index) => (
            <View key={index} className={styles.tipsRow}>
              <Text className={styles.tipsIcon}>✓</Text>
              <View className={styles.tipsContent}>
                <Text className={styles.tipsTitle}>注意事项 {index + 1}</Text>
                <Text className={styles.tipsText}>{tip}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default TemplateDetailPage;
