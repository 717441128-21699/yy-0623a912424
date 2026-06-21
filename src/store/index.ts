import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Customer, PhotoRecord, UploadRecord, SupplementTask, ProjectTemplate } from '@/types';
import { getTodayCustomers } from '@/data/customers';
import { getTemplateById, getAllTemplates } from '@/data/templates';
import { getSupplementTasks, getUploadRecords, getOfflinePhotos } from '@/data/records';
import { generateId } from '@/utils';

interface ProjectPhotoMap {
  [projectId: string]: PhotoRecord[];
}

interface ShootSession {
  id: string;
  customerId: string;
  customerName: string;
  currentProjectId: string;
  projectPhotos: ProjectPhotoMap;
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
  
  isDataLoaded: boolean;
  
  setCustomers: (customers: Customer[]) => void;
  setTemplates: (templates: ProjectTemplate[]) => void;
  setSupplementTasks: (tasks: SupplementTask[]) => void;
  setUploadRecords: (records: UploadRecord[]) => void;
  setOfflinePhotos: (photos: PhotoRecord[]) => void;
  
  selectCustomer: (customerId: string) => void;
  getCurrentCustomer: () => Customer | undefined;
  
  startShootSession: (customerId: string) => void;
  switchProject: (projectId: string) => void;
  updateShootSession: (updates: Partial<ShootSession>) => void;
  addPhotoToSession: (photo: PhotoRecord) => void;
  getSessionPhotosByProject: (projectId: string) => PhotoRecord[];
  getAllSessionPhotos: () => PhotoRecord[];
  submitShootSession: () => UploadRecord | null;
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
      
      isDataLoaded: false,
      
      setCustomers: (customers) => set({ customers }),
      setTemplates: (templates) => set({ templates }),
      setSupplementTasks: (tasks) => set({ supplementTasks: tasks }),
      setUploadRecords: (records) => set({ uploadRecords: records }),
      setOfflinePhotos: (photos) => set({ offlinePhotos: photos }),
      
      selectCustomer: (customerId) => {
        set({ currentCustomerId: customerId, currentProjectIndex: 0 });
        
        const customer = get().findCustomerById(customerId);
        if (customer) {
          get().startShootSession(customerId);
        }
      },
      
      getCurrentCustomer: () => {
        const { currentCustomerId, customers } = get();
        return customers.find(c => c.id === currentCustomerId);
      },
      
      startShootSession: (customerId) => {
        const customer = get().findCustomerById(customerId);
        if (!customer || customer.projectIds.length === 0) return;
        
        const existingSession = get().currentShootSession;
        if (existingSession && existingSession.customerId === customerId) {
          return;
        }
        
        const firstProjectId = customer.projectIds[0];
        const projectPhotos: ProjectPhotoMap = {};
        customer.projectIds.forEach(pid => {
          projectPhotos[pid] = [];
        });
        
        const session: ShootSession = {
          id: 'session_' + generateId(),
          customerId,
          customerName: customer.name,
          currentProjectId: firstProjectId,
          projectPhotos,
          isCaseAuthorized: customer.isCaseAuthorized,
          remark: '',
          startTime: new Date().toISOString(),
          status: 'shooting'
        };
        
        set({ 
          currentShootSession: session,
          currentProjectIndex: 0
        });
        console.log('[Store] 开始拍摄会话:', session.id, customer.name, '共', customer.projectIds.length, '个项目');
      },
      
      switchProject: (projectId) => {
        const { currentShootSession } = get();
        if (!currentShootSession) return;
        
        const customer = get().getCurrentCustomer();
        if (!customer) return;
        
        const projectIndex = customer.projectIds.indexOf(projectId);
        if (projectIndex === -1) return;
        
        set({
          currentShootSession: {
            ...currentShootSession,
            currentProjectId: projectId
          },
          currentProjectIndex: projectIndex
        });
        
        console.log('[Store] 切换项目:', projectId, '索引:', projectIndex);
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
        
        const projectPhotos = currentShootSession.projectPhotos[photo.projectId] || [];
        const existingIndex = projectPhotos.findIndex(p => p.angleId === photo.angleId);
        
        let newProjectPhotos: PhotoRecord[];
        if (existingIndex >= 0) {
          newProjectPhotos = [...projectPhotos];
          newProjectPhotos[existingIndex] = photo;
        } else {
          newProjectPhotos = [...projectPhotos, photo];
        }
        
        const newProjectPhotoMap = {
          ...currentShootSession.projectPhotos,
          [photo.projectId]: newProjectPhotos
        };
        
        set({
          currentShootSession: {
            ...currentShootSession,
            projectPhotos: newProjectPhotoMap
          }
        });
        
        const total = Object.values(newProjectPhotoMap).reduce((sum, arr) => sum + arr.length, 0);
        console.log('[Store] 添加照片:', photo.projectName, photo.angleName, '项目内', newProjectPhotos.length, '张，总计', total, '张');
      },
      
      getSessionPhotosByProject: (projectId) => {
        const { currentShootSession } = get();
        if (!currentShootSession) return [];
        return currentShootSession.projectPhotos[projectId] || [];
      },
      
      getAllSessionPhotos: () => {
        const { currentShootSession } = get();
        if (!currentShootSession) return [];
        return Object.values(currentShootSession.projectPhotos).flat();
      },
      
      submitShootSession: () => {
        const { currentShootSession, uploadRecords, offlinePhotos } = get();
        if (!currentShootSession) return null;
        
        const allPhotos = Object.values(currentShootSession.projectPhotos).flat();
        if (allPhotos.length === 0) return null;
        
        const customer = get().getCurrentCustomer();
        const projectNames = customer?.projectNames?.join('、') || '多项目';
        
        const isOffline = get().offlinePhotos.length > 0 || Math.random() > 0.6;
        
        const uploadRecord: UploadRecord = {
          id: 'upload_' + generateId(),
          customerId: currentShootSession.customerId,
          customerName: currentShootSession.customerName,
          projectName: projectNames,
          photoCount: allPhotos.length,
          uploadTime: new Date().toISOString(),
          status: isOffline ? 'pending' : 'success',
          isOffline: isOffline,
          nurseName: '当前护士',
          remark: currentShootSession.remark || undefined
        };
        
        const newUploadRecords = [uploadRecord, ...uploadRecords];
        const newOfflinePhotos = isOffline ? [...allPhotos, ...offlinePhotos] : offlinePhotos;
        
        set({
          uploadRecords: newUploadRecords,
          offlinePhotos: newOfflinePhotos,
          currentShootSession: {
            ...currentShootSession,
            status: 'submitted'
          }
        });
        
        console.log('[Store] 提交拍摄会话:', allPhotos.length, '张照片', 
          '项目数:', Object.keys(currentShootSession.projectPhotos).length,
          isOffline ? '（离线暂存）' : '（已上传）');
        
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
        const { uploadRecords } = get();
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
        const state = get();
        
        if (state.customers.length === 0) {
          const customers = getTodayCustomers();
          set({ customers });
          console.log('[Store] 加载客户数据:', customers.length, '位');
        } else {
          console.log('[Store] 客户数据已存在，跳过加载');
        }
        
        if (state.templates.length === 0) {
          const templates = getAllTemplates();
          set({ templates });
          console.log('[Store] 加载模板数据:', templates.length, '个');
        } else {
          console.log('[Store] 模板数据已存在，跳过加载');
        }
        
        if (state.supplementTasks.length === 0) {
          const supplementTasks = getSupplementTasks();
          set({ supplementTasks });
          console.log('[Store] 加载待补任务:', supplementTasks.length, '个');
        } else {
          console.log('[Store] 待补任务已存在，跳过加载');
        }
        
        if (state.uploadRecords.length === 0) {
          const uploadRecords = getUploadRecords();
          set({ uploadRecords });
          console.log('[Store] 加载上传记录:', uploadRecords.length, '条');
        } else {
          console.log('[Store] 上传记录已存在，跳过加载');
        }
        
        if (state.offlinePhotos.length === 0) {
          const offlinePhotos = getOfflinePhotos();
          set({ offlinePhotos });
          console.log('[Store] 加载离线照片:', offlinePhotos.length, '张');
        } else {
          console.log('[Store] 离线照片已存在，跳过加载');
        }
        
        set({ isDataLoaded: true });
      }
    }),
    {
      name: 'medical-photo-storage',
      partialize: (state) => ({
        customers: state.customers,
        templates: state.templates,
        uploadRecords: state.uploadRecords,
        offlinePhotos: state.offlinePhotos,
        currentCustomerId: state.currentCustomerId,
        currentProjectIndex: state.currentProjectIndex,
        currentShootSession: state.currentShootSession,
        supplementTasks: state.supplementTasks,
        isDataLoaded: state.isDataLoaded
      })
    }
  )
);
