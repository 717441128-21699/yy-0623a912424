import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatusBadgeProps {
  status: string;
  text?: string;
  className?: string;
}

const statusTextMap: Record<string, string> = {
  waiting: '待拍摄',
  shooting: '拍摄中',
  completed: '已完成',
  cancelled: '已取消',
  pending: '待上传',
  uploading: '上传中',
  success: '已上传',
  failed: '上传失败',
  partial: '部分成功',
  high: '高优先级',
  medium: '中优先级',
  low: '低优先级'
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text, className }) => {
  const displayText = text || statusTextMap[status] || status;
  
  return (
    <View className={classnames(styles.statusBadge, styles[status], className)}>
      <Text>{displayText}</Text>
    </View>
  );
};

export default StatusBadge;
