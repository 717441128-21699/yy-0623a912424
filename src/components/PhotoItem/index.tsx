import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import { PhotoRecord } from '@/types';
import styles from './index.module.scss';

interface PhotoItemProps {
  photo: PhotoRecord;
  showAngleLabel?: boolean;
  showStatus?: boolean;
  onClick?: (photo: PhotoRecord) => void;
}

const PhotoItem: React.FC<PhotoItemProps> = ({
  photo,
  showAngleLabel = true,
  showStatus = true,
  onClick
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(photo);
    }
  };

  const hasWarning = photo.exposureLevel !== 'normal' && photo.exposureLevel !== undefined ||
                     photo.angleDeviation !== 'normal' && photo.angleDeviation !== undefined;

  const getStatusIcon = () => {
    if (photo.isOffline && photo.uploadStatus === 'pending') {
      return 'offline';
    }
    return photo.uploadStatus;
  };

  const getStatusText = () => {
    if (photo.isOffline && photo.uploadStatus === 'pending') {
      return '离';
    }
    switch (photo.uploadStatus) {
      case 'success': return '✓';
      case 'pending': return '·';
      case 'failed': return '!';
      default: return '';
    }
  };

  return (
    <View className={styles.photoItem} onClick={handleClick}>
      <Image
        className={styles.photoImage}
        src={photo.thumbnailUrl}
        mode="aspectFill"
      />
      
      {showStatus && (
        <View className={classnames(styles.statusIcon, styles[getStatusIcon()])}>
          <Text>{getStatusText()}</Text>
        </View>
      )}

      {hasWarning && (
        <View className={styles.warningBadge}>
          <Text>需注意</Text>
        </View>
      )}

      {showAngleLabel && (
        <View className={styles.angleLabel}>
          <Text className={styles.labelText}>{photo.angleName}</Text>
        </View>
      )}
    </View>
  );
};

export default PhotoItem;
