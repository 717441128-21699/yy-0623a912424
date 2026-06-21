import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Customer, PhotoRecord, UploadRecord, SupplementTask, ProjectTemplate } from '@/types';
import { getTodayCustomers } from '@/data/customers';
import { getTemplateById, getAllTemplates } from '@/data/templates';
import { getSupplementTasks, getUploadRecords, getOfflinePhotos } from '@/data/records';
import { generateId } from '@/utils';

interface ShootSession {
  id: string;
  customerId: string;
  customerName: string;
  projectId: string;
  projectName: string;
  photos: PhotoRecord[];
  isCaseAuthorized: boolean;
  remark: string;
  startTime: string;
  status: 'shooting' | 'completed' | 'submitted';
}

interface AppState {
  customers: Customer[];
  templates: ProjectTemplate[];
  supplementTasks: SupplementTask[];
  uploadRecords: UploadRecord[];
  offlinePhotos: PhotoRecord[];
  
  currentCustomerId: string | null;
  currentProjectIndex: number;
  currentShootSession: ShootSession | null;
  
  setCustomers: (customers: Customer[]) => void;
  setTemplates: (templates: ProjectTemplate[]) => void;
  setSupplementTasks: (tasks: SupplementTask[]) => void;
  setUploadRecords: (records: UploadRecord[]) => void;
  setOfflinePhotos: (photos: PhotoRecord[]) => void;
  
  selectCustomer: (customerId: string) => void;
  getCurrentCustomer: () => Customer | undefined;
  
  startShootSession: (customerId: string, projectId: string) => void;
  updateShootSession: (updates: Partial<ShootSession>) => void;
  addPhotoToSession: (photo: PhotoRecord) => void;
  submitShootSession: () => void;
  clearShootSession: () => void;
  
  findCustomerByNo: (appointmentNo: string) => Customer | undefined;
  findCustomerById: (id: string) => Customer | undefined;
  
  addUploadRecord: (record: UploadRecord) => void;
  addOfflinePhotos: (photos: PhotoRecord[]) => void;
  retryUpload: (recordId: string) => void;
  retryAllOffline: () => void;
  
  loadInitialData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      customers: [],
      templates: [],
      supplementTasks: [],
      uploadRecords: [],
      offlinePhotos: [],
      
      currentCustomerId: null,
      currentProjectIndex: 0,
      currentShootSession: null,
      
      setCustomers: (customers) => set({ customers }),
      setTemplates: (templates) => set({ templates }),
      setSupplementTasks: (tasks) => set({ supplementTasks: tasks }),
      setUploadRecords: (records) => set({ uploadRecords: records }),
      setOfflinePhotos: (photos) => set({ offlinePhotos: photos }),
      
      selectCustomer: (customerId) => {
        set({ currentCustomerId: customerId, currentProjectIndex: 0 });
        
        const customer = get().findCustomerById(customerId);
        if (customer) {
          get().startShootSession(customerId, customer.projectIds[0]);
        }
      },
      
      getCurrentCustomer: () => {
        const { currentCustomerId, customers } = get();
        return customers.find(c => c.id === currentCustomerId);
      },
      
      startShootSession: (customerId, projectId) => {
        const customer = get().findCustomerById(customerId);
        const template = getTemplateById(projectId);
        
        if (!customer || !template) return;
        
        const session: ShootSession = {
          id: 'session_' + generateId(),
          customerId,
          customerName: customer.name,
          projectId,
          projectName: template.name,
          photos: [],
          isCaseAuthorized: customer.isCaseAuthorized,
          remark: '',
          startTime: new Date().toISOString(),
          status: 'shooting'
        };
        
        set({ currentShootSession: session });
        console.log('[Store] 开始拍摄会话:', session.id, customer.name, template.name);
      },
      
      updateShootSession: (updates) => {
        const { currentShootSession } = get();
        if (!currentShootSession) return;
        
        set({
          currentShootSession: {
            ...currentShootSession,
            ...updates
          }
        });
      },
      
      addPhotoToSession: (photo) => {
        const { currentShootSession } = get();
        if (!currentShootSession) return;
        
        const existingIndex = currentShootSession.photos.findIndex(p => p.angleId === photo.angleId);
        let newPhotos: PhotoRecord[];
        
        if (existingIndex >= 0) {
          newPhotos = [...currentShootSession.photos];
          newPhotos[existingIndex] = photo;
        } else {
          newPhotos = [...currentShootSession.photos, photo];
        }
        
        set({
          currentShootSession: {
            ...currentShootSession,
            photos: newPhotos
          }
        });
        
        console.log('[Store] 添加照片到会话:', photo.angleName, '共', newPhotos.length, '张');
      },
      
      submitShootSession: () => {
        const { currentShootSession, uploadRecords, offlinePhotos } = get();
        if (!currentShootSession || currentShootSession.photos.length === 0) return;
        
        const photos = currentShootSession.photos;
        const isOffline = Math.random() > 0.5;
        
        const uploadRecord: UploadRecord = {
          id: 'upload_' + generateId(),
          customerId: currentShootSession.customerId,
          customerName: currentShootSession.customerName,
          projectName: currentShootSession.projectName,
          photoCount: photos.length,
          uploadTime: new Date().toISOString(),
          status: isOffline ? 'pending' : 'success',
          isOffline: isOffline,
          nurseName: '当前护士',
          remark: currentShootSession.remark || undefined
        };
        
        const newUploadRecords = [uploadRecord, ...uploadRecords];
        const newOfflinePhotos = isOffline ? [...photos, ...offlinePhotos] : offlinePhotos;
        
        set({
          uploadRecords: newUploadRecords,
          offlinePhotos: newOfflinePhotos,
          currentShootSession: {
            ...currentShootSession,
            status: 'submitted'
          }
        });
        
        console.log('[Store] 提交拍摄会话:', photos.length, '张照片', isOffline ? '（离线暂存）' : '（已上传）');
        
        return uploadRecord;
      },
      
      clearShootSession: () => {
        set({ currentShootSession: null });
      },
      
      findCustomerByNo: (appointmentNo) => {
        const { customers } = get();
        return customers.find(c => 
          c.appointmentNo === appointmentNo || 
          c.id === appointmentNo ||
          c.phone.includes(appointmentNo)
        );
      },
      
      findCustomerById: (id) => {
        const { customers } = get();
        return customers.find(c => c.id === id);
      },
      
      addUploadRecord: (record) => {
        const { uploadRecords } = get();
        set({ uploadRecords: [record, ...uploadRecords] });
      },
      
      addOfflinePhotos: (photos) => {
        const { offlinePhotos } = get();
        set({ offlinePhotos: [...photos, ...offlinePhotos] });
      },
      
      retryUpload: (recordId) => {
        const { uploadRecords } = get();
        const updatedRecords = uploadRecords.map(r => {
          if (r.id === recordId) {
            return { ...r, status: 'success' as const, isOffline: false, failedCount: 0 };
          }
          return r;
        });
        set({ uploadRecords: updatedRecords });
        console.log('[Store] 重试上传:', recordId);
      },
      
      retryAllOffline: () => {
        const { uploadRecords, offlinePhotos } = get();
        const updatedRecords = uploadRecords.map(r => {
          if (r.isOffline && r.status === 'pending') {
            return { ...r, status: 'success' as const, isOffline: false };
          }
          if (r.status === 'failed') {
            return { ...r, status: 'success' as const, failedCount: 0 };
          }
          return r;
        });
        set({ uploadRecords: updatedRecords, offlinePhotos: [] });
        console.log('[Store] 全部重试离线照片');
      },
      
      loadInitialData: () => {
        const customers = getTodayCustomers();
        const templates = getAllTemplates();
        const supplementTasks = getSupplementTasks();
        const uploadRecords = getUploadRecords();
        const offlinePhotos = getOfflinePhotos();
        
        set({
          customers,
          templates,
          supplementTasks,
          uploadRecords,
          offlinePhotos
        });
        
        console.log('[Store] 初始数据加载完成', 
          customers.length, '位客户',
          templates.length, '个模板',
          uploadRecords.length, '条上传记录'
        );
      }
    }),
    {
      name: 'medical-photo-storage',
      partialize: (state) => ({
        customers: state.customers,
        uploadRecords: state.uploadRecords,
        offlinePhotos: state.offlinePhotos,
        currentCustomerId: state.currentCustomerId,
        currentShootSession: state.currentShootSession,
        supplementTasks: state.supplementTasks
      })
    }
  )
);
