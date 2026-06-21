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
  isInitialSeedDone: boolean;
  isNetworkOnline: boolean;
  
  setCustomers: (customers: Customer[]) => void;
  setTemplates: (templates: ProjectTemplate[]) => void;
  setSupplementTasks: (tasks: SupplementTask[]) => void;
  setUploadRecords: (records: UploadRecord[]) => void;
  setOfflinePhotos: (photos: PhotoRecord[]) => void;
  setNetworkStatus: (online: boolean) => void;
  toggleNetworkStatus: () => void;
  
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
  
  getRecordById: (recordId: string) => UploadRecord | undefined;
  
  addUploadRecord: (record: UploadRecord) => void;
  addOfflinePhotos: (photos: PhotoRecord[]) => void;
  retryUpload: (recordId: string) => void;
  retrySinglePhoto: (recordId: string, photoId: string) => void;
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
      isInitialSeedDone: false,
      isNetworkOnline: true,
      
      setCustomers: (customers) => set({ customers }),
      setTemplates: (templates) => set({ templates }),
      setSupplementTasks: (tasks) => set({ supplementTasks: tasks }),
      setUploadRecords: (records) => set({ uploadRecords: records }),
      setOfflinePhotos: (photos) => set({ offlinePhotos: photos }),
      setNetworkStatus: (online) => {
        set({ isNetworkOnline: online });
        console.log('[Store] 网络状态:', online ? '在线' : '离线');
      },
      toggleNetworkStatus: () => {
        const current = get().isNetworkOnline;
        set({ isNetworkOnline: !current });
        console.log('[Store] 切换网络状态:', !current ? '在线' : '离线');
      },
      
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
        const { currentShootSession, uploadRecords, offlinePhotos, isNetworkOnline } = get();
        if (!currentShootSession) return null;
        
        const allPhotos = Object.values(currentShootSession.projectPhotos).flat();
        if (allPhotos.length === 0) return null;
        
        const customer = get().getCurrentCustomer();
        const projectNames = customer?.projectNames?.join('、') || '多项目';
        const projectIds = customer?.projectIds || [];
        
        const processedPhotos = allPhotos.map(p => ({
          ...p,
          uploadStatus: isNetworkOnline ? 'success' as const : 'pending' as const,
          isOffline: !isNetworkOnline
        }));
        
        const uploadRecord: UploadRecord = {
          id: 'upload_' + generateId(),
          customerId: currentShootSession.customerId,
          customerName: currentShootSession.customerName,
          projectName: projectNames,
          projectIds,
          photoCount: processedPhotos.length,
          uploadTime: new Date().toISOString(),
          status: isNetworkOnline ? 'success' : 'pending',
          isOffline: !isNetworkOnline,
          failedCount: 0,
          nurseName: '当前护士',
          remark: currentShootSession.remark || undefined,
          photos: processedPhotos
        };
        
        const newUploadRecords = [uploadRecord, ...uploadRecords];
        const newOfflinePhotos = isNetworkOnline 
          ? offlinePhotos 
          : [...processedPhotos, ...offlinePhotos];
        
        set({
          uploadRecords: newUploadRecords,
          offlinePhotos: newOfflinePhotos,
          currentShootSession: {
            ...currentShootSession,
            status: 'submitted'
          }
        });
        
        console.log('[Store] 提交拍摄会话:', 
          processedPhotos.length, '张照片',
          '项目数:', Object.keys(currentShootSession.projectPhotos).length,
          isNetworkOnline ? '（网络在线，上传成功）' : '（网络离线，暂存本地）'
        );
        
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
      
      getRecordById: (recordId) => {
        const { uploadRecords } = get();
        return uploadRecords.find(r => r.id === recordId);
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
        const { uploadRecords, offlinePhotos } = get();
        const targetRecord = uploadRecords.find(r => r.id === recordId);
        if (!targetRecord) return;
        
        const updatedPhotos = targetRecord.photos?.map(p => ({
          ...p,
          uploadStatus: 'success' as const,
          isOffline: false
        })) || [];
        
        const updatedRecords = uploadRecords.map(r => {
          if (r.id === recordId) {
            return { 
              ...r, 
              status: 'success' as const, 
              isOffline: false, 
              failedCount: 0,
              photos: updatedPhotos
            };
          }
          return r;
        });
        
        let newOfflinePhotos = offlinePhotos;
        if (targetRecord.photos && targetRecord.photos.length > 0) {
          const photoIds = new Set(targetRecord.photos.map(p => p.id));
          newOfflinePhotos = offlinePhotos.filter(p => !photoIds.has(p.id));
        }
        
        set({ uploadRecords: updatedRecords, offlinePhotos: newOfflinePhotos });
        console.log('[Store] 重试上传记录:', recordId, targetRecord.customerName);
      },
      
      retrySinglePhoto: (recordId, photoId) => {
        const { uploadRecords, offlinePhotos } = get();
        const targetRecord = uploadRecords.find(r => r.id === recordId);
        if (!targetRecord || !targetRecord.photos) return;
        
        const updatedPhotos = targetRecord.photos.map(p => {
          if (p.id === photoId) {
            return { ...p, uploadStatus: 'success' as const, isOffline: false };
          }
          return p;
        });
        
        const allSuccess = updatedPhotos.every(p => p.uploadStatus === 'success');
        const failedCount = updatedPhotos.filter(p => p.uploadStatus === 'failed').length;
        
        const updatedRecords = uploadRecords.map(r => {
          if (r.id === recordId) {
            return {
              ...r,
              photos: updatedPhotos,
              status: allSuccess 
                ? (r.isOffline ? 'success' : 'success') as const
                : (failedCount > 0 ? (failedCount === updatedPhotos.length ? 'failed' as const : 'partial' as const) : r.status),
              isOffline: allSuccess ? false : r.isOffline,
              failedCount: allSuccess ? 0 : failedCount
            };
          }
          return r;
        });
        
        const newOfflinePhotos = offlinePhotos.filter(p => p.id !== photoId);
        
        set({ uploadRecords: updatedRecords, offlinePhotos: newOfflinePhotos });
        console.log('[Store] 重试单张照片:', recordId, photoId);
      },
      
      retryAllOffline: () => {
        const { uploadRecords } = get();
        const updatedRecords = uploadRecords.map(r => {
          const updatedPhotos = r.photos?.map(p => ({
            ...p,
            uploadStatus: 'success' as const,
            isOffline: false
          }));
          
          return {
            ...r,
            status: 'success' as const,
            isOffline: false,
            failedCount: 0,
            photos: updatedPhotos
          };
        });
        
        set({ uploadRecords: updatedRecords, offlinePhotos: [] });
        console.log('[Store] 全部重试离线照片完成');
      },
      
      loadInitialData: () => {
        const state = get();
        
        if (state.isInitialSeedDone) {
          console.log('[Store] 初始种子已完成，跳过加载');
          set({ isDataLoaded: true });
          return;
        }
        
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
          offlinePhotos,
          isInitialSeedDone: true,
          isDataLoaded: true
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
        templates: state.templates,
        uploadRecords: state.uploadRecords,
        offlinePhotos: state.offlinePhotos,
        currentCustomerId: state.currentCustomerId,
        currentProjectIndex: state.currentProjectIndex,
        currentShootSession: state.currentShootSession,
        supplementTasks: state.supplementTasks,
        isDataLoaded: state.isDataLoaded,
        isInitialSeedDone: state.isInitialSeedDone,
        isNetworkOnline: state.isNetworkOnline
      })
    }
  )
);
