import React, { useState, useEffect } from 'react';
import { View, Text, Button, Input, Textarea, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import StatusBadge from '@/components/StatusBadge';
import { Customer, ProjectTemplate } from '@/types';
import { getCustomerById, getTodayCustomers } from '@/data/customers';
import { getTemplateById } from '@/data/templates';
import { showToast } from '@/utils';
import styles from './index.module.scss';

const ConfirmPage: React.FC = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [isCaseAuthorized, setIsCaseAuthorized] = useState(false);
  const [remark, setRemark] = useState('');

  useEffect(() => {
    const customers = getTodayCustomers();
    const shootingCustomer = customers.find(c => c.status === 'shooting') || customers.find(c => c.status === 'waiting');
    if (shootingCustomer) {
      loadCustomerData(shootingCustomer.id);
    }
  }, []);

  const loadCustomerData = (customerId: string) => {
    try {
      const customerData = getCustomerById(customerId);
      if (customerData) {
        setCustomer(customerData);
        setIsCaseAuthorized(customerData.isCaseAuthorized);
        
        const templateData = customerData.projectIds
          .map(id => getTemplateById(id))
          .filter(Boolean) as ProjectTemplate[];
        setTemplates(templateData);
      }
    } catch (error) {
      console.error('[Confirm] 加载客户数据失败:', error);
    }
  };

  const handleScan = () => {
    Taro.scanCode({
      success: (res) => {
        console.log('[Confirm] 扫码结果:', res.result);
        const customers = getTodayCustomers();
        const found = customers.find(c => c.id === res.result || c.appointmentNo === res.result);
        if (found) {
          loadCustomerData(found.id);
          showToast('客户身份核验成功', 'success');
        } else {
          showToast('未找到对应客户', 'error');
        }
      },
      fail: (error) => {
        console.error('[Confirm] 扫码失败:', error);
        showToast('扫码失败，请重试', 'error');
      }
    });
  };

  const handleProjectClick = (template: ProjectTemplate) => {
    Taro.navigateTo({
      url: '/pages/template-detail?id=' + template.id
    });
  };

  const handleToggleAuth = () => {
    setIsCaseAuthorized(!isCaseAuthorized);
  };

  const handleStartShoot = () => {
    if (!customer) return;
    
    console.log('[Confirm] 开始拍摄:', customer.name);
    showToast('进入拍摄流程', 'success');
    
    Taro.navigateTo({
      url: '/pages/shooting/index?id=' + customer.id
    });
  };

  if (!customer) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.emptyCustomer}>
          <Text className={styles.emptyIcon}>👤</Text>
          <Text className={styles.emptyText}>请先选择或扫描客户</Text>
          <Button className={styles.scanBtn} onClick={handleScan}>
            扫码核对客户
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.pageContainer}>
      <ScrollView scrollY>
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>客户信息</Text>
          <View className={styles.customerInfo}>
            <View className={styles.avatar}>
              <Text className={styles.avatarText}>{customer.name.charAt(0)}</Text>
            </View>
            <View className={styles.infoContent}>
              <View className={styles.customerName}>
                <Text>{customer.name}</Text>
                <StatusBadge status={customer.status} />
              </View>
              <View className={styles.infoRow}>
                <View className={styles.infoItem}>
                  <Text>{customer.gender === 'female' ? '女' : '男'}</Text>
                  <Text>·</Text>
                  <Text>{customer.age}岁</Text>
                </View>
              </View>
              <View className={styles.infoRow}>
                <View className={styles.infoItem}>
                  <Text>电话：{customer.phone}</Text>
                </View>
              </View>
              <View className={styles.infoRow}>
                <View className={styles.infoItem}>
                  <Text>预约号：{customer.appointmentNo}</Text>
                </View>
                {customer.doctorName && (
                  <View className={styles.infoItem}>
                    <Text>医生：{customer.doctorName}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            拍摄项目 ({templates.length})
          </Text>
          <View className={styles.projectList}>
            {templates.map(template => (
              <View
                key={template.id}
                className={styles.projectItem}
                onClick={() => handleProjectClick(template)}
              >
                <View className={styles.projectInfo}>
                  <Text className={styles.projectName}>{template.name}</Text>
                  <Text className={styles.projectDesc}>
                    {template.angles.length}个拍摄角度 · {template.distance}
                  </Text>
                </View>
                <Text className={styles.arrowIcon}>{'>'}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={classnames(styles.section, styles.authSection)}>
          <View className={styles.authHeader}>
            <Text className={styles.authTitle}>案例使用授权</Text>
            <View
              className={classnames(styles.switchWrapper, isCaseAuthorized && styles.active)}
              onClick={handleToggleAuth}
            >
              <View className={styles.switchDot} />
            </View>
          </View>
          
          <View className={styles.authDesc}>
            <Text>
              客户同意将本次拍摄的术前术后照片用于学术交流、案例展示等用途，
              我们将严格保护客户隐私，不会泄露个人身份信息。
            </Text>
          </View>

          {isCaseAuthorized && (
            <View className={styles.authDetails}>
              <View><Text>• 可用于医院内部案例库</Text></View>
              <View><Text>• 可用于医生学术交流</Text></View>
              <View><Text>• 可用于宣传推广（需额外确认）</Text></View>
              <View><Text>• 严格保护个人隐私信息</Text></View>
            </View>
          )}
        </View>

        <View className={classnames(styles.section, styles.remarkSection)}>
          <Text className={styles.sectionTitle}>异常情况备注</Text>
          <Textarea
            className={styles.remarkInput}
            placeholder='如有特殊情况请备注给医生（选填）'
            value={remark}
            onInput={(e) => setRemark(e.detail.value)}
            maxlength={200}
          />
          <Text className={styles.remarkTip}>已输入 {remark.length}/200 字</Text>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <Button
          className={classnames(styles.confirmBtn)}
          onClick={handleStartShoot}
        >
          确认信息并开始拍摄
        </Button>
        <Text className={styles.btnTip}>
          请与客户共同确认以上信息无误
        </Text>
      </View>
    </View>
  );
};

export default ConfirmPage;
