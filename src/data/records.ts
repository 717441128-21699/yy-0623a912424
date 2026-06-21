import { SupplementTask, PhotoRecord, UploadRecord } from '@/types';

export const mockSupplementTasks: SupplementTask[] = [
  {
    id: 's001',
    customerId: 'c001',
    customerName: '张美丽',
    projectId: 'p001',
    projectName: '鼻部综合',
    missingAngles: ['a006'],
    missingAngleNames: ['仰头位'],
    deadline: '2026-06-23',
    priority: 'high',
    source: 'check',
    createTime: '2026-06-21 16:30',
    isCompleted: false
  },
  {
    id: 's002',
    customerId: 'c003',
    customerName: '刘思琪',
    projectId: 'p003',
    projectName: '自体脂肪填充',
    missingAngles: ['a204', 'a205'],
    missingAngleNames: ['左45度', '右45度'],
    deadline: '2026-06-24',
    priority: 'medium',
    source: 'doctor',
    createTime: '2026-06-20 10:00',
    isCompleted: false
  },
  {
    id: 's003',
    customerId: 'c005',
    customerName: '赵雪婷',
    projectId: 'p004',
    projectName: '面部轮廓',
    missingAngles: ['a306'],
    missingAngleNames: ['仰头位'],
    deadline: '2026-06-25',
    priority: 'low',
    source: 'recheck',
    createTime: '2026-06-19 14:00',
    isCompleted: false
  },
  {
    id: 's004',
    customerId: 'c002',
    customerName: '王佳怡',
    projectId: 'p002',
    projectName: '眼部综合',
    missingAngles: ['a105', 'a106'],
    missingAngleNames: ['向上看', '向下看'],
    deadline: '2026-06-22',
    priority: 'high',
    source: 'check',
    createTime: '2026-06-21 09:00',
    isCompleted: true
  }
];

export const mockPhotoRecords: PhotoRecord[] = [
  {
    id: 'ph001',
    customerId: 'c004',
    customerName: '陈梦瑶',
    projectId: 'p001',
    projectName: '鼻部综合',
    angleId: 'a001',
    angleName: '正面位',
    photoUrl: 'https://picsum.photos/id/64/600/800',
    thumbnailUrl: 'https://picsum.photos/id/64/200/267',
    shootTime: '2026-06-22 10:15',
    uploadStatus: 'success',
    isOffline: false
  },
  {
    id: 'ph002',
    customerId: 'c004',
    customerName: '陈梦瑶',
    projectId: 'p001',
    projectName: '鼻部综合',
    angleId: 'a002',
    angleName: '左侧位',
    photoUrl: 'https://picsum.photos/id/91/600/800',
    thumbnailUrl: 'https://picsum.photos/id/91/200/267',
    shootTime: '2026-06-22 10:16',
    uploadStatus: 'success',
    isOffline: false
  },
  {
    id: 'ph003',
    customerId: 'c002',
    customerName: '王佳怡',
    projectId: 'p002',
    projectName: '眼部综合',
    angleId: 'a101',
    angleName: '正面位',
    photoUrl: 'https://picsum.photos/id/177/600/800',
    thumbnailUrl: 'https://picsum.photos/id/177/200/267',
    shootTime: '2026-06-22 09:45',
    uploadStatus: 'pending',
    isOffline: true,
    exposureLevel: 'dark'
  },
  {
    id: 'ph004',
    customerId: 'c002',
    customerName: '王佳怡',
    projectId: 'p002',
    projectName: '眼部综合',
    angleId: 'a102',
    angleName: '闭眼位',
    photoUrl: 'https://picsum.photos/id/338/600/800',
    thumbnailUrl: 'https://picsum.photos/id/338/200/267',
    shootTime: '2026-06-22 09:46',
    uploadStatus: 'pending',
    isOffline: true,
    angleDeviation: 'slight'
  }
];

export const mockUploadRecords: UploadRecord[] = [
  {
    id: 'u001',
    customerId: 'c004',
    customerName: '陈梦瑶',
    projectName: '鼻部综合 + 眼部综合',
    projectIds: ['p001', 'p002'],
    photoCount: 12,
    uploadTime: '2026-06-22 10:30',
    status: 'success',
    nurseName: '李护士',
    photos: mockPhotoRecords.filter(p => p.customerId === 'c004').map(p => ({ ...p, uploadStatus: 'success' as const, isOffline: false }))
  },
  {
    id: 'u002',
    customerId: 'c002',
    customerName: '王佳怡',
    projectName: '眼部综合',
    projectIds: ['p002'],
    photoCount: 6,
    uploadTime: '2026-06-22 10:00',
    status: 'pending',
    nurseName: '王护士',
    isOffline: true,
    photos: mockPhotoRecords.filter(p => p.customerId === 'c002').map(p => ({ ...p, uploadStatus: 'pending' as const, isOffline: true }))
  },
  {
    id: 'u003',
    customerId: 'c007',
    customerName: '周子萱',
    projectName: '鼻部综合 + 自体脂肪填充',
    projectIds: ['p001', 'p003'],
    photoCount: 10,
    uploadTime: '2026-06-21 16:30',
    status: 'partial',
    failedCount: 2,
    nurseName: '张护士',
    remark: '2张照片曝光不足，需重拍',
    photos: Array.from({ length: 8 }).map((_, i) => ({
      id: 'ph_u003_' + i,
      customerId: 'c007',
      customerName: '周子萱',
      projectId: 'p001',
      projectName: '鼻部综合',
      angleId: 'a001',
      angleName: i < 5 ? `角度${i + 1}` : `面部${i + 1}`,
      photoUrl: 'https://picsum.photos/id/' + (70 + i) + '/600/800',
      thumbnailUrl: 'https://picsum.photos/id/' + (70 + i) + '/200/267',
      shootTime: '2026-06-21 16:30',
      uploadStatus: i < 8 ? 'success' as const : 'failed' as const,
      isOffline: false
    })).concat([
      {
        id: 'ph_u003_f1',
        customerId: 'c007',
        customerName: '周子萱',
        projectId: 'p001',
        projectName: '鼻部综合',
        angleId: 'a006',
        angleName: '仰头位',
        photoUrl: 'https://picsum.photos/id/80/600/800',
        thumbnailUrl: 'https://picsum.photos/id/80/200/267',
        shootTime: '2026-06-21 16:31',
        uploadStatus: 'failed' as const,
        isOffline: false,
        exposureLevel: 'dark'
      },
      {
        id: 'ph_u003_f2',
        customerId: 'c007',
        customerName: '周子萱',
        projectId: 'p003',
        projectName: '自体脂肪填充',
        angleId: 'a205',
        angleName: '右45度',
        photoUrl: 'https://picsum.photos/id/81/600/800',
        thumbnailUrl: 'https://picsum.photos/id/81/200/267',
        shootTime: '2026-06-21 16:31',
        uploadStatus: 'failed' as const,
        isOffline: false,
        angleDeviation: 'serious'
      }
    ])
  },
  {
    id: 'u004',
    customerId: 'c001',
    customerName: '张美丽',
    projectName: '鼻部综合',
    projectIds: ['p001'],
    photoCount: 6,
    uploadTime: '2026-06-21 15:00',
    status: 'success',
    nurseName: '李护士',
    photos: Array.from({ length: 6 }).map((_, i) => ({
      id: 'ph_u004_' + i,
      customerId: 'c001',
      customerName: '张美丽',
      projectId: 'p001',
      projectName: '鼻部综合',
      angleId: 'a00' + (i + 1),
      angleName: ['正面位', '左侧位', '右侧位', '左斜位', '右斜位', '仰头位'][i] || '角度' + (i + 1),
      photoUrl: 'https://picsum.photos/id/' + (82 + i) + '/600/800',
      thumbnailUrl: 'https://picsum.photos/id/' + (82 + i) + '/200/267',
      shootTime: '2026-06-21 15:00',
      uploadStatus: 'success' as const,
      isOffline: false
    }))
  },
  {
    id: 'u005',
    customerId: 'c003',
    customerName: '刘思琪',
    projectName: '自体脂肪填充',
    projectIds: ['p003'],
    photoCount: 5,
    uploadTime: '2026-06-21 14:00',
    status: 'failed',
    failedCount: 5,
    nurseName: '王护士',
    remark: '网络异常，全部上传失败',
    photos: Array.from({ length: 5 }).map((_, i) => ({
      id: 'ph_u005_' + i,
      customerId: 'c003',
      customerName: '刘思琪',
      projectId: 'p003',
      projectName: '自体脂肪填充',
      angleId: 'a20' + (i + 1),
      angleName: ['正面位', '左侧位', '右侧位', '左45度', '右45度'][i] || '角度' + (i + 1),
      photoUrl: 'https://picsum.photos/id/' + (88 + i) + '/600/800',
      thumbnailUrl: 'https://picsum.photos/id/' + (88 + i) + '/200/267',
      shootTime: '2026-06-21 14:00',
      uploadStatus: 'failed' as const,
      isOffline: false
    }))
  }
];

export const getSupplementTasks = (): SupplementTask[] => {
  return mockSupplementTasks;
};

export const getPendingSupplementTasks = (): SupplementTask[] => {
  return mockSupplementTasks.filter(t => !t.isCompleted);
};

export const getPhotoRecords = (): PhotoRecord[] => {
  return mockPhotoRecords;
};

export const getOfflinePhotos = (): PhotoRecord[] => {
  return mockPhotoRecords.filter(p => p.isOffline && p.uploadStatus === 'pending');
};

export const getUploadRecords = (): UploadRecord[] => {
  return mockUploadRecords;
};
