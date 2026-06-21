import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import { ProjectTemplate } from '@/types';
import styles from './index.module.scss';

interface TemplateCardProps {
  template: ProjectTemplate;
  onView?: (template: ProjectTemplate) => void;
  onClick?: (template: ProjectTemplate) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onView,
  onClick
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(template);
    }
  };

  const handleView = (e: any) => {
    e.stopPropagation();
    if (onView) {
      onView(template);
    }
  };

  const requiredCount = template.angles.filter(a => a.isRequired).length;

  return (
    <View className={styles.templateCard} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <Text className={styles.templateName}>{template.name}</Text>
        <Text className={styles.categoryTag}>{template.category}</Text>
      </View>

      <View className={styles.cardBody}>
        <Text className={styles.description}>{template.description}</Text>
        <View className={styles.infoRow}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>拍摄距离：</Text>
            <Text className={styles.infoValue}>{template.distance}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>光线要求：</Text>
            <Text className={styles.infoValue}>{template.lighting}</Text>
          </View>
        </View>
      </View>

      <View className={styles.cardFooter}>
        <View className={styles.angleCount}>
          <Text className={styles.countNum}>{template.angles.length}</Text>
          <Text>个拍摄角度（必拍{requiredCount}个）</Text>
        </View>
        <Button className={styles.viewBtn} onClick={handleView}>
          查看详情
        </Button>
      </View>
    </View>
  );
};

export default TemplateCard;
