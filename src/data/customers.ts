import { Customer } from '@/types';

export const mockCustomers: Customer[] = [
  {
    id: 'c001',
    name: '张美丽',
    phone: '138****1234',
    gender: 'female',
    age: 28,
    appointmentTime: '2026-06-22 09:00',
    appointmentNo: 'A001',
    projectIds: ['p001'],
    projectNames: ['鼻部综合'],
    status: 'waiting',
    roomNo: '1号拍摄间',
    doctorName: '李医生',
    isCaseAuthorized: false
  },
  {
    id: 'c002',
    name: '王佳怡',
    phone: '139****5678',
    gender: 'female',
    age: 32,
    appointmentTime: '2026-06-22 09:30',
    appointmentNo: 'A002',
    projectIds: ['p002'],
    projectNames: ['眼部综合'],
    status: 'shooting',
    roomNo: '2号拍摄间',
    doctorName: '陈医生',
    isCaseAuthorized: true
  },
  {
    id: 'c003',
    name: '刘思琪',
    phone: '137****9012',
    gender: 'female',
    age: 25,
    appointmentTime: '2026-06-22 10:00',
    appointmentNo: 'A003',
    projectIds: ['p003'],
    projectNames: ['自体脂肪填充'],
    status: 'waiting',
    roomNo: '1号拍摄间',
    doctorName: '王医生',
    isCaseAuthorized: false
  },
  {
    id: 'c004',
    name: '陈梦瑶',
    phone: '136****3456',
    gender: 'female',
    age: 30,
    appointmentTime: '2026-06-22 10:30',
    appointmentNo: 'A004',
    projectIds: ['p001', 'p002'],
    projectNames: ['鼻部综合', '眼部综合'],
    status: 'completed',
    roomNo: '3号拍摄间',
    doctorName: '李医生',
    isCaseAuthorized: true
  },
  {
    id: 'c005',
    name: '赵雪婷',
    phone: '135****7890',
    gender: 'female',
    age: 27,
    appointmentTime: '2026-06-22 11:00',
    appointmentNo: 'A005',
    projectIds: ['p004'],
    projectNames: ['面部轮廓'],
    status: 'waiting',
    roomNo: '2号拍摄间',
    doctorName: '张医生',
    isCaseAuthorized: false
  },
  {
    id: 'c006',
    name: '孙雅琳',
    phone: '134****2345',
    gender: 'female',
    age: 35,
    appointmentTime: '2026-06-22 14:00',
    appointmentNo: 'A006',
    projectIds: ['p005'],
    projectNames: ['胸部整形'],
    status: 'waiting',
    roomNo: '1号拍摄间',
    doctorName: '王医生',
    isCaseAuthorized: true
  },
  {
    id: 'c007',
    name: '周子萱',
    phone: '133****6789',
    gender: 'female',
    age: 29,
    appointmentTime: '2026-06-22 14:30',
    appointmentNo: 'A007',
    projectIds: ['p001', 'p003'],
    projectNames: ['鼻部综合', '自体脂肪填充'],
    status: 'cancelled',
    roomNo: '3号拍摄间',
    doctorName: '陈医生',
    isCaseAuthorized: false
  },
  {
    id: 'c008',
    name: '吴雨桐',
    phone: '132****0123',
    gender: 'female',
    age: 26,
    appointmentTime: '2026-06-22 15:00',
    appointmentNo: 'A008',
    projectIds: ['p002'],
    projectNames: ['眼部综合'],
    status: 'waiting',
    roomNo: '2号拍摄间',
    doctorName: '李医生',
    isCaseAuthorized: false
  }
];

export const getTodayCustomers = (): Customer[] => {
  return mockCustomers;
};

export const getCustomerById = (id: string): Customer | undefined => {
  return mockCustomers.find(c => c.id === id);
};

export const getCustomersByStatus = (status: Customer['status']): Customer[] => {
  return mockCustomers.filter(c => c.status === status);
};
