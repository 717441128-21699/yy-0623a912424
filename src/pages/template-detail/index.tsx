import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { ProjectTemplate } from '@/types';
import { getTemplateById } from '@/data/templates';
import styles from './index.module.scss';

const TemplateDetailPage: React.FC = () => {
  const [template, setTemplate] = useState<ProjectTemplate | null>(null);

  useEffect(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = (currentPage as any).options || {};
    
    const templateId = options.id || 'p001';
    const data = getTemplateById(templateId);
    if (data) {
      setTemplate(data);
    }
  }, []);

  if (!template) {
    return (
      <View className={styles.pageContainer}>
        <Text>加载中...</Text>
      </View>
    );
  }

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
        <Text className={styles.sectionTitle}>拍摄角度 ({requiredCount}个必拍)</Text>
        <View className={styles.angleList}>
          {template.angles.map((angle, index) => (
            <View key={angle.id} className={styles.angleItem}>
              <View className={styles.anglePreview}>
                <Text>{getDirectionIcon(angle.direction)}</Text>
              </View>
              <View className={styles.angleInfo}>
                <View className={styles.angleName}>
                  <Text>{index + 1}. {angle.name}</Text>
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
            <View key={index}>
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
