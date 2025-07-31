import { File, IFile } from '../models/file';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import archiver from 'archiver';
import { v4 as uuidV4 } from 'uuid';

/**
 * 文件服务层
 * 提供文件管理的核心业务逻辑，包括上传、下载、删除、预览等功能
 */

// 配置文件存储根目录
const UPLOAD_ROOT_DIR = process.env.UPLOAD_ROOT_DIR || path.join(process.cwd(), 'uploads');

// 支持的文件类型配置
const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  spreadsheet: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  text: ['text/plain', 'text/csv', 'application/json'],
  archive: ['application/zip', 'application/x-rar-compressed'],
};

// 文件大小限制（字节）
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '104857600'); // 默认100MB

/**
 * 初始化上传目录
 * 确保上传根目录存在
 */
export function initializeUploadDirectory(): void {
  try {
    if (!fs.existsSync(UPLOAD_ROOT_DIR)) {
      fs.mkdirSync(UPLOAD_ROOT_DIR, { recursive: true });
      console.log(`文件上传目录创建成功: ${UPLOAD_ROOT_DIR}`);
    }
  } catch (error) {
    console.error('创建上传目录失败:', error);
    throw new Error('初始化文件上传目录失败');
  }
}

/**
 * 生成按日期组织的存储路径
 * 格式: yyyy/mm/dd
 */
function generateDatePath(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

/**
 * 生成唯一文件名
 * 避免文件名冲突
 */
function generateUniqueFileName(originalName: string): string {
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `${baseName}_${timestamp}_${random}${ext}`;
}

/**
 * 计算文件MD5哈希值
 */
function calculateMD5(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * 验证文件类型
 */
function validateFileType(mimeType: string): boolean {
  const allAllowedTypes = Object.values(ALLOWED_FILE_TYPES).flat();
  return allAllowedTypes.includes(mimeType);
}

/**
 * 验证文件大小
 */
function validateFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

/**
 * 上传单个文件
 */
export async function uploadFile(fileData: {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
  uploadBy: string;
  platformId: string;
  isPublic?: boolean;
  tags?: string[];
  description?: string;
}): Promise<IFile> {
  try {
    // 验证文件类型
    if (!validateFileType(fileData.mimeType)) {
      throw new Error(`不支持的文件类型: ${fileData.mimeType}`);
    }

    // 验证文件大小
    if (!validateFileSize(fileData.size)) {
      throw new Error(`文件大小超出限制，最大允许 ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // 生成存储路径
    const datePath = generateDatePath();
    const fileName = generateUniqueFileName(fileData.originalName);
    const relativePath = path.join(datePath, fileName);
    const fullPath = path.join(UPLOAD_ROOT_DIR, relativePath);

    // 确保目录存在
    const dirPath = path.dirname(fullPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // 写入文件
    fs.writeFileSync(fullPath, fileData.buffer);

    // 计算MD5哈希
    const md5Hash = await calculateMD5(fullPath);

    // 创建文件记录
    const fileRecord = new File({
      originalName: fileData.originalName,
      fileName,
      fileType: fileData.mimeType,
      fileExtension: path.extname(fileData.originalName).toLowerCase(),
      fileSize: fileData.size,
      filePath: relativePath,
      fullPath,
      uploadBy: fileData.uploadBy,
      platformId: fileData.platformId,
      isPublic: fileData.isPublic || false,
      tags: fileData.tags || [],
      description: fileData.description,
      md5Hash,
    });

    await fileRecord.save();
    return fileRecord;
  } catch (error) {
    console.error('文件上传失败:', error);
    throw error;
  }
}

/**
 * 批量上传文件
 */
export async function uploadMultipleFiles(filesData: Array<{
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
  uploadBy: string;
  platformId: string;
  isPublic?: boolean;
  tags?: string[];
  description?: string;
}>): Promise<IFile[]> {
  const results: IFile[] = [];
  const errors: string[] = [];

  for (const fileData of filesData) {
    try {
      const result = await uploadFile(fileData);
      results.push(result);
    } catch (error: any) {
      errors.push(`${fileData.originalName}: ${error.message}`);
    }
  }

  if (errors.length > 0) {
    console.warn('部分文件上传失败:', errors);
  }

  return results;
}

/**
 * 获取文件列表
 */
export async function getFileList(params: {
  uploadBy?: string;
  platformId: string;
  page?: number;
  pageSize?: number;
  fileType?: string;
  tags?: string[];
  keyword?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<{
  list: IFile[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const {
    uploadBy,
    platformId,
    page = 1,
    pageSize = 20,
    fileType,
    tags,
    keyword,
    startDate,
    endDate
  } = params;

  const skip = (page - 1) * pageSize;
  const query: any = { platformId, status: 'active' };

  // 用户过滤（如果指定）
  if (uploadBy) {
    query.uploadBy = uploadBy;
  }

  // 文件类型过滤
  if (fileType) {
    query.fileType = new RegExp(fileType, 'i');
  }

  // 标签过滤
  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }

  // 关键词搜索
  if (keyword) {
    query.$or = [
      { originalName: new RegExp(keyword, 'i') },
      { description: new RegExp(keyword, 'i') },
      { tags: new RegExp(keyword, 'i') }
    ];
  }

  // 日期范围过滤
  if (startDate || endDate) {
    query.uploadDate = {};
    if (startDate) query.uploadDate.$gte = startDate;
    if (endDate) query.uploadDate.$lte = endDate;
  }

  const [files, total] = await Promise.all([
    File.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ uploadDate: -1 }),
    File.countDocuments(query)
  ]);

  return {
    list: files,
    total,
    page,
    pageSize
  };
}

/**
 * 根据ID获取文件信息
 */
export async function getFileById(uuid: string, uploadBy?: string, platformId?: string): Promise<IFile | null> {
  const query: any = { uuid, status: 'active' };

  if (uploadBy) query.uploadBy = uploadBy;
  if (platformId) query.platformId = platformId;

  return await File.findOne(query);
}

/**
 * 下载文件
 */
export async function downloadFile(uuid: string, uploadBy?: string, platformId?: string): Promise<{
  file: IFile;
  filePath: string;
}> {
  // 首先尝试无权限限制获取文件
  const file = await getFileById(uuid);
  
  if (!file) {
    throw new Error('文件不存在');
  }

  // 如果是私有文件，检查访问权限
  if (!file.isPublic) {
    // 如果没有提供用户信息，拒绝访问私有文件
    if (!uploadBy || !platformId) {
      throw new Error('私有文件需要认证访问');
    }
    
    // 检查用户是否有权限访问该文件（文件所有者或同平台用户）
    if (file.uploadBy !== uploadBy && file.platformId !== platformId) {
      throw new Error('无权限访问此私有文件');
    }
  }

  if (!fs.existsSync(file.fullPath)) {
    throw new Error('文件已损坏或丢失');
  }

  // 增加下载次数
  await file.incrementDownload();

  return {
    file,
    filePath: file.fullPath
  };
}

/**
 * 批量下载文件（打包为ZIP）
 */
export async function downloadMultipleFiles(
  uuids: string[],
  uploadBy?: string,
  platformId?: string
): Promise<{ zipStream: archiver.Archiver; fileName: string }> {
  const files = await File.find({
    uuid: { $in: uuids },
    ...(uploadBy && { uploadBy }),
    ...(platformId && { platformId }),
    status: 'active'
  });

  if (files.length === 0) {
    throw new Error('没有找到可下载的文件');
  }

  // 创建ZIP归档
  const archive = archiver('zip', { zlib: { level: 9 } });
  const zipFileName = `files_${Date.now()}.zip`;

  // 添加文件到归档
  for (const file of files) {
    if (fs.existsSync(file.fullPath)) {
      archive.file(file.fullPath, { name: file.originalName });
      // 增加下载次数
      await file.incrementDownload();
    }
  }

  return {
    zipStream: archive,
    fileName: zipFileName
  };
}

/**
 * 删除文件（软删除）
 */
export async function deleteFile(uuid: string, uploadBy: string, platformId: string): Promise<boolean> {
  const file = await File.findOne({
    uuid,
    uploadBy,
    platformId,
    status: 'active'
  });

  if (!file) {
    throw new Error('文件不存在或无权限删除');
  }

  await file.softDelete();
  return true;
}

/**
 * 批量删除文件
 */
export async function deleteMultipleFiles(
  uuids: string[],
  uploadBy: string,
  platformId: string
): Promise<{ success: string[]; failed: string[] }> {
  const success: string[] = [];
  const failed: string[] = [];

  for (const uuid of uuids) {
    try {
      await deleteFile(uuid, uploadBy, platformId);
      success.push(uuid);
    } catch (error) {
      failed.push(uuid);
    }
  }

  return { success, failed };
}

/**
 * 物理删除文件（从磁盘删除）
 */
export async function permanentDeleteFile(uuid: string): Promise<boolean> {
  const file = await File.findOne({ uuid });

  if (!file) {
    throw new Error('文件记录不存在');
  }

  try {
    // 删除物理文件
    if (fs.existsSync(file.fullPath)) {
      fs.unlinkSync(file.fullPath);
    }

    // 删除数据库记录
    await File.findOneAndDelete({ uuid });

    return true;
  } catch (error) {
    console.error('物理删除文件失败:', error);
    throw error;
  }
}

/**
 * 获取文件统计信息
 */
export async function getFileStatistics(uploadBy?: string, platformId?: string): Promise<{
  totalFiles: number;
  totalSize: number;
  fileTypeDistribution: Record<string, number>;
  uploadTrend: Array<{ date: string; count: number }>;
}> {
  const query: any = { status: 'active' };
  if (uploadBy) query.uploadBy = uploadBy;
  if (platformId) query.platformId = platformId;

  const [totalFiles, sizeResult, typeResult] = await Promise.all([
    File.countDocuments(query),
    File.aggregate([
      { $match: query },
      { $group: { _id: null, totalSize: { $sum: '$fileSize' } } }
    ]),
    File.aggregate([
      { $match: query },
      { $group: { _id: '$fileType', count: { $sum: 1 } } }
    ])
  ]);

  const totalSize = sizeResult[0]?.totalSize || 0;
  const fileTypeDistribution = typeResult.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  // 获取最近7天的上传趋势
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const trendResult = await File.aggregate([
    {
      $match: {
        ...query,
        uploadDate: { $gte: sevenDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$uploadDate' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const uploadTrend = trendResult.map(item => ({
    date: item._id,
    count: item.count
  }));

  return {
    totalFiles,
    totalSize,
    fileTypeDistribution,
    uploadTrend
  };
}

/**
 * 更新文件权限
 * @param uuid 文件UUID
 * @param userId 用户ID
 * @param platformId 平台ID
 * @param isPublic 是否公开
 * @returns 更新后的文件信息
 */
export async function updateFilePermission(
  uuid: string,
  userId: string,
  platformId: string,
  isPublic: boolean
): Promise<IFile> {
  // 查找文件，确保用户有权限修改
  const file = await File.findOne({
    uuid,
    uploadBy: userId,
    platformId,
    status: 'active'
  });

  if (!file) {
    throw new Error('文件不存在或无权限修改');
  }

  // 更新权限
  file.isPublic = isPublic;

  await file.save();

  return file;
}
