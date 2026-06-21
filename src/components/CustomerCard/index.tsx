import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import StatusBadge from '@/components/StatusBadge';
import { Customer } from '@/types';
import { formatTime } from '@/utils';
import styles from './index.module.scss';

interface CustomerCardProps {
  customer: Customer;
  showAction?: boolean;
  actionText?: string;
  onAction?: (customer: Customer) => void;
  onClick?: (customer: Customer) => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  showAction = true,
  actionText,
  onAction,
  onClick
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(customer);
    }
  };

  const handleAction = (e: any) => {
    e.stopPropagation();
    if (onAction) {
      onAction(customer);
    }
  };

  const getActionText = () => {
    if (actionText) return actionText;
    switch (customer.status) {
      case 'waiting':
        return '开始拍摄';
      case 'shooting':
        return '继续拍摄';
      case 'completed':
        return '查看详情';
      default:
        return '查看';
    }
  };

  const getActionType = () => {
    if (customer.status === 'completed' || customer.status === 'cancelled') {
      return 'secondary';
    }
    return 'primary';
  };

  return (
    <View className={styles.customerCard} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <View className={styles.customerInfo}>
          <View className={styles.avatar}>
            <Text className={styles.avatarText}>{customer.name.charAt(0)}</Text>
          </View>
          <View className={styles.infoContent}>
            <View style={{ display: 'flex', alignItems: 'center' }}>
              <Text className={styles.customerName}>{customer.name}</Text>
              {customer.isCaseAuthorized && (
                <Text className={styles.caseTag}>案例授权</Text>
              )}
            </View>
            <View className={styles.customerMeta}>
              <Text>{customer.gender === 'female' ? '女' : '男'}</Text>
              <Text>·</Text>
              <Text>{customer.age}岁</Text>
              <Text>·</Text>
              <Text>{customer.phone}</Text>
            </View>
          </View>
        </View>
        <StatusBadge status={customer.status} />
      </View>

      <View className={styles.cardBody}>
        <View className={styles.projectTags}>
          {customer.projectNames.map((name, index) => (
            <Text key={index} className={styles.projectTag}>{name}</Text>
          ))}
        </View>
      </View>

      <View className={styles.cardFooter}>
        <View className={styles.footerLeft}>
          <View className={styles.footerItem}>
            <Text>预约号：</Text>
            <Text className={styles.timeText}>{customer.appointmentNo}</Text>
          </View>
          <View className={styles.footerItem}>
            <Text>{formatTime(customer.appointmentTime)}</Text>
          </View>
        </View>
        {showAction && customer.status !== 'cancelled' && (
          <Button
            className={classnames(styles.actionBtn, getActionType() === 'secondary' && styles.secondary)}
            onClick={handleAction}
          >
            {getActionText()}
          </Button>
        )}
      </View>
    </View>
  );
};

export default CustomerCard;
