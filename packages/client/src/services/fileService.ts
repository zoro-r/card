import request from '@/utils/request';
import { getFileDomain } from '@/utils/env';

export interface FileItem {
  uuid: string;
  originalName: string;
  fileName: string;
  fileType: string;
  fileExtension: string;
  fileSize: number;
  uploadDate: string;
  uploadBy: string;
  downloadCount: number;
  lastAccessTime?: string;
  tags?: string[];
  description?: string;
  isPublic: boolean;
  md5Hash?: string;
  fileUrl: string;
  thumbnailUrl?: string;
}

export interface FileListResponse {
  list: FileItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FileUploadResponse extends FileItem {}

export interface FileDetailsResponse extends FileItem {}

export interface FileStatisticsResponse extends FileStatistics {}

export interface FileDeleteResponse {
  success: string[];
  failed: string[];
}

export interface FileStatistics {
  totalFiles: number;
  totalSize: number;
  totalSizeFormatted: string;
  fileTypeDistribution: Record<string, number>;
  uploadTrend: Array<{ date: string; count: number }>;
}

export interface FileListParams {
  page?: number;
  pageSize?: number;
  fileType?: string;
  tags?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  showAll?: boolean;
}

/**
 * 文件管理API服务
 */
export class FileService {
  /**
   * 上传单个文件
   */
  static async uploadFile(file: File, options?: {
    tags?: string[];
    description?: string;
    isPublic?: boolean;
  }): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options?.tags && options.tags.length > 0) {
      formData.append('tags', options.tags.join(','));
    }
    if (options?.description) {
      formData.append('description', options.description);
    }
    if (options?.isPublic !== undefined) {
      formData.append('isPublic', options.isPublic.toString());
    }

    return request('/api/files/upload', {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * 批量上传文件
   */
  static async uploadMultipleFiles(files: File[], options?: {
    tags?: string[];
    description?: string;
    isPublic?: boolean;
  }): Promise<FileUploadResponse> {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    if (options?.tags && options.tags.length > 0) {
      formData.append('tags', options.tags.join(','));
    }
    if (options?.description) {
      formData.append('description', options.description);
    }
    if (options?.isPublic !== undefined) {
      formData.append('isPublic', options.isPublic.toString());
    }

    return request('/api/files/upload-multiple', {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * 获取文件列表
   */
  static async getFileList(params: FileListParams = {}): Promise<FileListResponse> {
    return request('/api/files/list', {
      method: 'GET',
      params,
    });
  }

  /**
   * 获取文件详情
   */
  static async getFileDetails(uuid: string): Promise<FileDetailsResponse> {
    return request(`/api/files/${uuid}`, {
      method: 'GET',
    });
  }

  /**
   * 下载文件
   */
  static downloadFile(uuid: string): void {
    window.open(`/api/files/download/${uuid}`);
  }

  /**
   * 获取文件预览URL
   */
  static getPreviewUrl(uuid: string): string {
    const token = localStorage.getItem('token');
    const domain = getFileDomain();
    return `${domain}/api/files/preview/${uuid}?token=${token}`;
  }

  /**
   * 批量下载文件
   */
  static async downloadMultipleFiles(uuids: string[]): Promise<void> {
    const response = await fetch('/api/files/download-multiple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ uuids }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `files_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  }

  /**
   * 删除文件
   */
  static async deleteFile(uuid: string): Promise<void> {
    return request(`/api/files/${uuid}`, {
      method: 'DELETE',
    });
  }

  /**
   * 批量删除文件
   */
  static async deleteMultipleFiles(uuids: string[]): Promise<FileDeleteResponse> {
    return request('/api/files/batch', {
      method: 'DELETE',
      data: { uuids },
    });
  }

  /**
   * 获取文件统计信息
   */
  static async getFileStatistics(showAll: boolean = false): Promise<FileStatisticsResponse> {
    return request('/api/files/statistics', {
      method: 'GET',
      params: { showAll },
    });
  }

  /**
   * 更新文件权限
   */
  static async updateFilePermission(uuid: string, isPublic: boolean): Promise<void> {
    return request(`/api/files/${uuid}/permission`, {
      method: 'PUT',
      data: { isPublic },
    });
  }

  /**
   * 获取文件访问链接
   */
  static getFileAccessUrl(file: FileItem): string {
    const domain = getFileDomain();
    if (file.isPublic) {
      // 公开文件使用公开访问链接
      return `${domain}/api/files/public/preview/${file.uuid}`;
    } else {
      // 私有文件使用需要认证的链接
      return `${domain}/api/files/preview/${file.uuid}`;
    }
  }

  /**
   * 复制文件链接到剪贴板
   */
  static async copyFileLink(file: FileItem): Promise<boolean> {
    try {
      const url = this.getFileAccessUrl(file);
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      // 如果 clipboard API 不可用，使用传统方法
      try {
        const textArea = document.createElement('textarea');
        textArea.value = this.getFileAccessUrl(file);
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const result = document.execCommand('copy');
        document.body.removeChild(textArea);
        return result;
      } catch (fallbackError) {
        console.error('复制链接失败:', fallbackError);
        return false;
      }
    }
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 获取文件类型图标
   */
  static getFileTypeIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return 'file-image';
    if (fileType.includes('pdf')) return 'file-pdf';
    if (fileType.includes('word') || fileType.includes('document')) return 'file-word';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'file-excel';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'file-ppt';
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('compressed')) return 'file-zip';
    if (fileType.includes('text') || fileType.includes('plain')) return 'file-text';
    return 'file';
  }

  /**
   * 判断文件是否可预览
   */
  static isPreviewable(fileType: string): boolean {
    const previewableTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'text/plain', 'text/csv', 'application/json'
    ];
    return previewableTypes.includes(fileType);
  }
}