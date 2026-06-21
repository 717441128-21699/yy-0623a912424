import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import { useAppStore } from '@/store';
import { getTemplateById, getAllTemplates } from '@/data/templates';
import { ProjectTemplate } from '@/types';
import styles from './index.module.scss';

const TemplateDetailPage: React.FC = () => {
  const storeTemplates = useAppStore(state => state.templates);
  const router = useRouter();
  const [templateId, setTemplateId] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const id = router.params?.id || '';
    if (id) {
      setTemplateId(id);
      console.log('[TemplateDetail] 模板ID:', id);
    } else {
      if (retryCount < 5) {
        const timer = setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, [router.params, retryCount]);

  const template = useMemo<ProjectTemplate | undefined>(() => {
    if (!templateId) return undefined;
    
    const fromStore = storeTemplates.find(t => t.id === templateId);
    if (fromStore) {
      return fromStore;
    }
    
    const allTemplates = getAllTemplates();
    const fromAll = allTemplates.find(t => t.id === templateId);
    if (fromAll) {
      return fromAll;
    }
    
    const fromData = getTemplateById(templateId);
    if (fromData) {
      return fromData;
    }
    
    return undefined;
  }, [templateId, storeTemplates]);

  const getDirectionIcon = (direction: string) => {
    const icons: Record<string, string> = {
      front: '👤',
      left: '👈',
      right: '👉',
      top: '⬆️',
      bottom: '⬇️',
      oblique: '🔄'
    };
    return icons[direction] || '📷';
  };

  const getDirectionText = (direction: string) => {
    const texts: Record<string, string> = {
      front: '正面',
      left: '左侧',
      right: '右侧',
      top: '仰视',
      bottom: '俯视',
      oblique: '斜面'
    };
    return texts[direction] || direction;
  };

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

  const requiredCount = template.angles.filter(a => a.isRequired).length;

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
          <Text className={styles.infoLabel}>拍摄角度</Text>
          <Text className={styles.infoValue}>{template.angles.length}个</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          拍摄角度列表（必拍 {requiredCount} 个）
        </Text>
        <View className={styles.angleList}>
          {template.angles.map((angle, index) => (
            <View key={angle.id} className={styles.angleItem}>
              <View className={styles.anglePreview}>
                <Text style={{ fontSize: '40rpx' }}>
                  {getDirectionIcon(angle.direction)}
                </Text>
              </View>
              <View className={styles.angleInfo}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx' }}>
                  <Text className={styles.angleName}>
                    {index + 1}. {angle.name}
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
                </View>
                <Text className={styles.angleDesc}>{angle.description}</Text>
                <View className={styles.directionTag}>
                  <Text>{getDirectionText(angle.direction)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>拍摄注意事项</Text>
        <View className={styles.tipsList}>
          {template.tips.map((tip, index) => (
            <View key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12rpx' }}>
              <Text className={styles.tipIcon}>✓</Text>
              <Text>{tip}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default TemplateDetailPage;
