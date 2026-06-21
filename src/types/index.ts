export interface Customer {
  id: string;
  name: string;
  phone: string;
  gender: 'male' | 'female';
  age: number;
  appointmentTime: string;
  appointmentNo: string;
  projectIds: string[];
  projectNames: string[];
  status: 'waiting' | 'shooting' | 'completed' | 'cancelled';
  roomNo?: string;
  doctorName?: string;
  isCaseAuthorized: boolean;
  remark?: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  angles: PhotoAngle[];
  distance: string;
  lighting: string;
  tips: string[];
}

export interface PhotoAngle {
  id: string;
  name: string;
  code: string;
  description: string;
  direction: 'front' | 'left' | 'right' | 'top' | 'bottom' | 'oblique';
  isRequired: boolean;
  exampleImage?: string;
}

export interface PhotoRecord {
  id: string;
  customerId: string;
  customerName: string;
  projectId: string;
  projectName: string;
  angleId: string;
  angleName: string;
  photoUrl: string;
  thumbnailUrl: string;
  shootTime: string;
  uploadStatus: 'pending' | 'uploading' | 'success' | 'failed';
  isOffline: boolean;
  exposureLevel?: 'normal' | 'dark' | 'bright';
  angleDeviation?: 'normal' | 'slight' | 'serious';
  remark?: string;
}

export interface SupplementTask {
  id: string;
  customerId: string;
  customerName: string;
  projectId: string;
  projectName: string;
  missingAngles: string[];
  missingAngleNames: string[];
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  source: 'check' | 'recheck' | 'doctor';
  createTime: string;
  isCompleted: boolean;
}

export interface UploadRecord {
  id: string;
  customerId: string;
  customerName: string;
  projectName: string;
  photoCount: number;
  uploadTime: string;
  status: 'success' | 'failed' | 'partial' | 'pending';
  failedCount?: number;
  isOffline?: boolean;
  nurseName: string;
  remark?: string;
}

export type CustomerStatus = Customer['status'];
export type UploadStatus = PhotoRecord['uploadStatus'];
export type PriorityLevel = SupplementTask['priority'];
