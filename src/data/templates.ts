import { ProjectTemplate } from '@/types';

export const mockTemplates: ProjectTemplate[] = [
  {
    id: 'p001',
    name: '鼻部综合',
    category: '面部',
    description: '鼻部整形术前术后标准拍摄模板，包含正面、侧面、斜面等多角度拍摄',
    distance: '1.5米',
    lighting: '自然光 + 补光灯',
    tips: [
      '拍摄前请卸妆，保持面部清洁',
      '头发向后梳理，露出完整面部轮廓',
      '保持自然表情，不要微笑',
      '正视镜头，眼睛平视前方'
    ],
    angles: [
      { id: 'a001', name: '正面位', code: 'front', description: '面部正对镜头，双眼平视前方', direction: 'front', isRequired: true },
      { id: 'a002', name: '左侧位', code: 'left_side', description: '面部完全侧向左边，显示鼻梁侧面轮廓', direction: 'left', isRequired: true },
      { id: 'a003', name: '右侧位', code: 'right_side', description: '面部完全侧向右边，显示鼻梁侧面轮廓', direction: 'right', isRequired: true },
      { id: 'a004', name: '左斜位', code: 'left_oblique', description: '面部向左转45度，显示鼻梁斜面形态', direction: 'oblique', isRequired: true },
      { id: 'a005', name: '右斜位', code: 'right_oblique', description: '面部向右转45度，显示鼻梁斜面形态', direction: 'oblique', isRequired: true },
      { id: 'a006', name: '仰头位', code: 'upward', description: '头部后仰，显示鼻底和鼻孔形态', direction: 'top', isRequired: false }
    ]
  },
  {
    id: 'p002',
    name: '眼部综合',
    category: '面部',
    description: '眼部整形术前术后标准拍摄模板，重点展示双眼皮、眼袋、眼角等细节',
    distance: '1.0米',
    lighting: '环形补光灯 + 自然光',
    tips: [
      '拍摄前请取下隐形眼镜',
      '保持眼部清洁，不要化妆',
      '自然睁眼，不要刻意睁大',
      '眉毛保持自然状态'
    ],
    angles: [
      { id: 'a101', name: '正面位', code: 'eye_front', description: '双眼正视镜头，展示眼部整体形态', direction: 'front', isRequired: true },
      { id: 'a102', name: '闭眼位', code: 'eye_closed', description: '双眼自然闭合，展示眼睑皮肤状态', direction: 'front', isRequired: true },
      { id: 'a103', name: '左侧位', code: 'eye_left', description: '面部侧向左边，展示眼形侧面轮廓', direction: 'left', isRequired: true },
      { id: 'a104', name: '右侧位', code: 'eye_right', description: '面部侧向右边，展示眼形侧面轮廓', direction: 'right', isRequired: true },
      { id: 'a105', name: '向上看', code: 'eye_up', description: '眼球向上转动，展示下眼睑状态', direction: 'top', isRequired: false },
      { id: 'a106', name: '向下看', code: 'eye_down', description: '眼球向下转动，展示上眼睑状态', direction: 'bottom', isRequired: false }
    ]
  },
  {
    id: 'p003',
    name: '自体脂肪填充',
    category: '面部',
    description: '面部脂肪填充术前术后标准拍摄模板，展示面部轮廓和饱满度变化',
    distance: '1.5米',
    lighting: '均匀自然光',
    tips: [
      '拍摄前请卸妆，保持面部清洁',
      '头发向后梳理，露出完整面部',
      '保持自然表情，放松面部肌肉',
      '拍摄时保持相同的光线条件'
    ],
    angles: [
      { id: 'a201', name: '正面位', code: 'fat_front', description: '面部正对镜头，展示正面轮廓饱满度', direction: 'front', isRequired: true },
      { id: 'a202', name: '左侧位', code: 'fat_left', description: '面部完全侧向左边，展示侧面轮廓曲线', direction: 'left', isRequired: true },
      { id: 'a203', name: '右侧位', code: 'fat_right', description: '面部完全侧向右边，展示侧面轮廓曲线', direction: 'right', isRequired: true },
      { id: 'a204', name: '左45度', code: 'fat_left45', description: '面部向左转45度，展示斜面轮廓', direction: 'oblique', isRequired: true },
      { id: 'a205', name: '右45度', code: 'fat_right45', description: '面部向右转45度，展示斜面轮廓', direction: 'oblique', isRequired: true }
    ]
  },
  {
    id: 'p004',
    name: '面部轮廓',
    category: '面部',
    description: '面部轮廓整形术前术后标准拍摄模板，展示下颌线、颧骨等面部骨骼轮廓',
    distance: '1.5米',
    lighting: '侧光 + 正面补光',
    tips: [
      '头发全部向后梳理，完全露出面部轮廓',
      '不要佩戴任何饰品',
      '保持自然表情，咬紧牙关',
      '颈部挺直，双肩放松'
    ],
    angles: [
      { id: 'a301', name: '正面位', code: 'face_front', description: '面部正对镜头，展示正面轮廓比例', direction: 'front', isRequired: true },
      { id: 'a302', name: '左侧位', code: 'face_left', description: '面部完全侧向左边，展示下颌线轮廓', direction: 'left', isRequired: true },
      { id: 'a303', name: '右侧位', code: 'face_right', description: '面部完全侧向右边，展示下颌线轮廓', direction: 'right', isRequired: true },
      { id: 'a304', name: '左斜面', code: 'face_left_oblique', description: '面部向左转45度，展示颧骨和下颌线', direction: 'oblique', isRequired: true },
      { id: 'a305', name: '右斜面', code: 'face_right_oblique', description: '面部向右转45度，展示颧骨和下颌线', direction: 'oblique', isRequired: true },
      { id: 'a306', name: '仰头位', code: 'face_up', description: '头部后仰，展示下颌缘轮廓', direction: 'top', isRequired: false }
    ]
  },
  {
    id: 'p005',
    name: '胸部整形',
    category: '身体',
    description: '胸部整形术前术后标准拍摄模板，展示胸部形态、大小和对称性',
    distance: '2.0米',
    lighting: '均匀柔光',
    tips: [
      '上身赤裸，佩戴一次性内衣',
      '自然站立，双肩放松',
      '双手自然下垂或叉腰',
      '保持相同的拍摄距离和光线'
    ],
    angles: [
      { id: 'a401', name: '正面位', code: 'breast_front', description: '身体正对镜头，展示胸部大小和对称性', direction: 'front', isRequired: true },
      { id: 'a402', name: '左侧位', code: 'breast_left', description: '身体侧向左边，展示胸部侧面轮廓', direction: 'left', isRequired: true },
      { id: 'a403', name: '右侧位', code: 'breast_right', description: '身体侧向右边，展示胸部侧面轮廓', direction: 'right', isRequired: true },
      { id: 'a404', name: '左45度', code: 'breast_left45', description: '身体向左转45度，展示胸部斜面形态', direction: 'oblique', isRequired: true },
      { id: 'a405', name: '右45度', code: 'breast_right45', description: '身体向右转45度，展示胸部斜面形态', direction: 'oblique', isRequired: true }
    ]
  }
];

export const getAllTemplates = (): ProjectTemplate[] => {
  return mockTemplates;
};

export const getTemplateById = (id: string): ProjectTemplate | undefined => {
  return mockTemplates.find(t => t.id === id);
};

export const getTemplatesByCategory = (category: string): ProjectTemplate[] => {
  return mockTemplates.filter(t => t.category === category);
};
