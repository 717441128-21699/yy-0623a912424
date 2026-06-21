import Taro from '@tarojs/taro';

export const formatTime = (date: Date | string, format: string = 'HH:mm'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  if (format === 'HH:mm') {
    return `${hours}:${minutes}`;
  }
  
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  
  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes);
};

export const formatDate = (date: Date | string): string => {
  return formatTime(date, 'YYYY-MM-DD');
};

export const formatDateTime = (date: Date | string): string => {
  return formatTime(date, 'YYYY-MM-DD HH:mm');
};

export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    waiting: '待拍摄',
    shooting: '拍摄中',
    completed: '已完成',
    cancelled: '已取消',
    pending: '待上传',
    uploading: '上传中',
    success: '已上传',
    failed: '上传失败'
  };
  return statusMap[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    waiting: '#FF7D00',
    shooting: '#1677FF',
    completed: '#00B42A',
    cancelled: '#86909C',
    pending: '#FF7D00',
    uploading: '#1677FF',
    success: '#00B42A',
    failed: '#F53F3F'
  };
  return colorMap[status] || '#86909C';
};

export const showToast = (title: string, icon: 'success' | 'error' | 'none' = 'none') => {
  Taro.showToast({
    title,
    icon,
    duration: 2000
  });
};

export const showLoading = (title: string = '加载中...') => {
  Taro.showLoading({
    title,
    mask: true
  });
};

export const hideLoading = () => {
  Taro.hideLoading();
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const getPriorityText = (priority: string): string => {
  const map: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
  };
  return map[priority] || priority;
};

export const getPriorityColor = (priority: string): string => {
  const map: Record<string, string> = {
    high: '#F53F3F',
    medium: '#FF7D00',
    low: '#1677FF'
  };
  return map[priority] || '#86909C';
};
