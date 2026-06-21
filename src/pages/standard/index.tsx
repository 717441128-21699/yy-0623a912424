import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import TemplateCard from '@/components/TemplateCard';
import { ProjectTemplate } from '@/types';
import { getAllTemplates } from '@/data/templates';
import styles from './index.module.scss';

type CategoryType = 'all' | '面部' | '身体';

const StandardPage: React.FC = () => {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [category, setCategory] = useState<CategoryType>('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const data = getAllTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('[Standard] 加载模板数据失败:', error);
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchCategory = category === 'all' || t.category === category;
    const matchKeyword = !searchKeyword ||
      t.name.includes(searchKeyword) ||
      t.description.includes(searchKeyword);
    return matchCategory && matchKeyword;
  });

  const categories: { key: CategoryType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: '面部', label: '面部项目' },
    { key: '身体', label: '身体项目' }
  ];

  const handleViewTemplate = (template: ProjectTemplate) => {
    console.log('[Standard] 查看模板:', template.name);
    Taro.navigateTo({
      url: '/pages/template-detail?id=' + template.id
    });
  };

  const handleTemplateClick = (template: ProjectTemplate) => {
    handleViewTemplate(template);
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.searchBar}>
        <Input
          className={styles.searchInput}
          placeholder='搜索项目模板...'
          value={searchKeyword}
          onInput={(e) => setSearchKeyword(e.detail.value)}
        />
      </View>

      <View className={styles.guideCard}>
        <Text className={styles.guideTitle}>📸 拍摄小贴士</Text>
        <Text className={styles.guideDesc}>
          拍摄前请确认光线充足、客户面部清洁、头发梳理整齐。
          按照标准姿势引导，确保照片角度准确、曝光正常。
        </Text>
      </View>

      <View className={styles.categoryTabs}>
        {categories.map(item => (
          <View
            key={item.key}
            className={classnames(styles.categoryTab, category === item.key && styles.active)}
            onClick={() => setCategory(item.key)}
          >
            <Text>{item.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.templatesList}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>项目模板</Text>
          <Text className={styles.sectionCount}>共 {filteredTemplates.length} 个</Text>
        </View>

        {filteredTemplates.length > 0 ? (
          filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onClick={handleTemplateClick}
              onView={handleViewTemplate}
            />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无相关项目模板</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default StandardPage;
