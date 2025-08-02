import { Context, Next } from 'koa';
import * as fileService from '../service/file';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { success, fail } from '../utils/tool';

/**
 * 文件管理控制器
 * 处理文件相关的HTTP请求，包括上传、下载、删除、预览等操作
 */

const streamPipeline = promisify(pipeline);

// 类型定义：multer 文件对象
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
  filepath?: string; // 兼容性
  originalFilename?: string; // 兼容性
}

/**
 * 上传单个文件
 * POST /api/files/upload
 */
export async function uploadFileAPI(ctx: Context, next: Next): Promise<void> {
  try {
    const { user } = ctx.state;
    const file = (ctx.request as any).file; // @koa/multer adds file property for single upload

    if (!file) {
      ctx.body = fail('请选择要上传的文件');
      return;
    }

    const { tags, description, isPublic } = ctx.request.body as Record<string, any>;

    // 读取文件内容
    const buffer = fs.readFileSync(file.path);

    // 修复中文文件名编码问题
    let originalName = file.originalname || 'unknown';
    try {
      // 尝试修复编码（如果之前没有修复）
      if (originalName && originalName.includes('�')) {
        originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      }
    } catch (error) {
      console.warn('文件名编码修复失败，使用原始文件名:', error);
    }

    const result = await fileService.uploadFile({
      buffer,
      originalName,
      mimeType: file.mimetype || 'application/octet-stream',
      size: file.size,
      uploadBy: user.uuid,
      platformId: user.platformId,
      isPublic: isPublic === 'true',
      tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
      description: description || undefined
    });

    ctx.body = success({
      uuid: result.uuid,
      originalName: result.originalName,
      fileSize: result.fileSize,
      fileType: result.fileType,
      uploadDate: result.uploadDate,
      fileUrl: `/api/files/preview/${result.uuid}`,
      previewUrl: `/api/files/preview/${result.uuid}`,
      downloadUrl: `/api/files/download/${result.uuid}`
    }, '文件上传成功');
  } catch (error: any) {
    console.error('文件上传失败:', error);
    ctx.body = fail(error.message || '文件上传失败');
  }
}

/**
 * 批量上传文件
 * POST /api/files/upload-multiple
 */
export async function uploadMultipleFilesAPI(ctx: Context, next: Next): Promise<void> {
  try {
    const { user } = ctx.state;
    const files = (ctx.request as any).files; // @koa/multer adds files property for array upload

    if (!files || !Array.isArray(files) || files.length === 0) {
      ctx.body = fail('请选择要上传的文件');
      return;
    }

    const { tags, description, isPublic } = ctx.request.body as Record<string, any>;

    const filesData = files.map((file: MulterFile) => {
      // 修复中文文件名编码问题
      let originalName = file.originalname || 'unknown';
      try {
        // 尝试修复编码（如果之前没有修复）
        if (originalName && originalName.includes('�')) {
          originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        }
      } catch (error) {
        console.warn('文件名编码修复失败，使用原始文件名:', error);
      }

      return {
        buffer: fs.readFileSync(file.path),
        originalName,
        mimeType: file.mimetype || 'application/octet-stream',
        size: file.size,
        uploadBy: user.uuid,
        platformId: user.platformId,
        isPublic: isPublic === 'true',
        tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
        description: description || undefined
      };
    });

    const results = await fileService.uploadMultipleFiles(filesData);

    ctx.body = success(results.map(result => ({
      uuid: result.uuid,
      originalName: result.originalName,
      fileSize: result.fileSize,
      fileType: result.fileType,
      uploadDate: result.uploadDate,
      fileUrl: (result as any).fileUrl,
      thumbnailUrl: (result as any).thumbnailUrl
    })), `成功上传 ${results.length} 个文件`);
  } catch (error: any) {
    console.error('批量上传失败:', error);
    ctx.body = fail(error.message || '批量上传失败');
  }
}

/**
 * 获取文件列表
 * GET /api/files/list
 */
export async function getFileListAPI(ctx: Context, next: Next): Promise<void> {
  try {
    const { user } = ctx.state;
    const {
      page = '1',
      pageSize = '20',
      fileType,
      tags,
      keyword,
      startDate,
      endDate,
      showAll = 'false'
    } = ctx.query as Record<string, any>;

    const params = {
      uploadBy: showAll === 'true' ? undefined : user.uuid,
      platformId: user.platformId,
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string),
      fileType: fileType as string,
      tags: tags ? (tags as string).split(',').map((tag: string) => tag.trim()) : undefined,
      keyword: keyword as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined
    };

    const result = await fileService.getFileList(params);

    ctx.body = success({
      list: result.list.map(file => ({
        uuid: file.uuid,
        originalName: file.originalName,
        fileType: file.fileType,
        fileExtension: file.fileExtension,
        fileSize: file.fileSize,
        uploadDate: file.uploadDate,
        uploadBy: file.uploadBy,
        downloadCount: file.downloadCount,
        lastAccessTime: file.lastAccessTime,
        tags: file.tags,
        description: file.description,
        isPublic: file.isPublic,
        fileUrl: (file as any).fileUrl,
        thumbnailUrl: (file as any).thumbnailUrl
      })),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize
    }, '获取文件列表成功');
  } catch (error: any) {
    console.error('获取文件列表失败:', error);
    ctx.body = fail(error.message || '获取文件列表失败');
  }
}

/**
 * 下载单个文件
 * GET /api/files/download/:uuid
 */
export async function downloadFileAPI(ctx: Context, next: Next): Promise<void> {
  try {
    const { uuid } = ctx.params;

    // 尝试获取用户信息（可能为空，用于私有文件权限检查）
    let uploadBy: string | undefined;
    let platformId: string | undefined;

    // 如果请求包含认证信息，提取用户数据
    if (ctx.state.user) {
      uploadBy = ctx.state.user.uuid;
      platformId = ctx.state.user.platformId;
    } else {
      // 尝试从token参数中解析用户信息
      const token = ctx.query.token as string;
      if (token) {
        try {
          const { verifyToken } = await import('@/service/user');
          const decoded = verifyToken(token);
          if (decoded) {
            uploadBy = decoded.uuid;
            platformId = decoded.platformId;
          }
        } catch (error) {
          // Token验证失败，继续尝试下载（可能是公开文件）
        }
      }
    }

    const result = await fileService.downloadFile(uuid, uploadBy, platformId);

    // 设置响应头
    ctx.set('Content-Type', result.file.fileType);
    ctx.set('Content-Disposition', `attachment; filename="${encodeURIComponent(result.file.originalName)}"`);
    ctx.set('Content-Length', result.file.fileSize.toString());

    // 流式传输文件
    ctx.body = fs.createReadStream(result.filePath);
    ctx.status = 200;
  } catch (error: any) {
    console.error('文件下载失败:', error);

    // 根据错误类型设置不同的状态码
    if (error.message.includes('需要认证') || error.message.includes('无权限')) {
      ctx.status = 403;
    } else if (error.message.includes('不存在')) {
      ctx.status = 404;
    } else {
      ctx.status = 500;
    }

    ctx.body = fail(error.message || '文件下载失败');
  }
}

/**
 * 预览文件
 * GET /api/files/preview/:uuid
 */
export async function previewFileAPI(ctx: Context, next: Next): Promise<void> {
  try {
    const { uuid } = ctx.params;
    const { user } = ctx.state;

    const result = await fileService.downloadFile(
      uuid,
      user.uuid,
      user.platformId
    );

    // 设置响应头用于在线预览
    ctx.set('Content-Type', result.file.fileType);
    ctx.set('Content-Disposition', `inline; filename="${encodeURIComponent(result.file.originalName)}"`);
    ctx.set('Content-Length', result.file.fileSize.toString());

    // 对于图片文件，设置缓存头
    if (result.file.fileType.startsWith('image/')) {
      ctx.set('Cache-Control', 'public, max-age=31536000');
    }

    // 流式传输文件
    ctx.body = fs.createReadStream(result.filePath);
    ctx.status = 200;
  } catch (error: any) {
    console.error('文件预览失败:', error);
    ctx.status = 404;
    ctx.body = fail(error.message || '文件预览失败');
  }
}

/**
 * 批量下载文件（ZIP）
 * POST /api/files/download-multiple
 */
export async function downloadMultipleFilesAPI(ctx: Context, next: Next): Promise<void> {
  try {
    const { uuids } = ctx.request.body as Record<string, any>;
    const { user } = ctx.state;

    if (!uuids || !Array.isArray(uuids) || uuids.length === 0) {
      ctx.body = fail('请提供要下载的文件ID列表');
      return;
    }

    const result = await fileService.downloadMultipleFiles(
      uuids,
      user.uuid,
      user.platformId
    );

    // 设置响应头
    ctx.set('Content-Type', 'application/zip');
    ctx.set('Content-Disposition', `attachment; filename="${result.fileName}"`);

    // 完成归档并发送
    result.zipStream.finalize();
    ctx.body = result.zipStream;
    ctx.status = 200;
  } catch (error: any) {
    console.error('批量下载失败:', error);
    ctx.body = fail(error.message || '批量下载失败');
  }
}

/**
 * 删除文件
 * DELETE /api/files/:uuid
 */
export async function deleteFileAPI(ctx: Context, next: Next): Promise<void> {
  try {
    const { uuid } = ctx.params;
    const { user } = ctx.state;

    await fileService.deleteFile(uuid, user.uuid, user.platformId);

    ctx.body = success(null, '文件删除成功');
  } catch (error: any) {
    console.error('文件删除失败:', error);
    ctx.body = fail(error.message || '文件删除失败');
  }
}

/**
 * 批量删除文件
 * DELETE /api/files/batch
 */
export async function deleteMultipleFilesAPI(ctx: Context, next: Next): Promise<void> {
  try {
    const { uuids } = ctx.request.body as Record<string, any>;
    const { user } = ctx.state;

    if (!uuids || !Array.isArray(uuids) || uuids.length === 0) {
      ctx.body = fail('请提供要删除的文件ID列表');
      return;
    }

    const result = await fileService.deleteMultipleFiles(
      uuids,
      user.uuid,
      user.platformId
    );

    ctx.body = success(result, `成功删除 ${result.success.length} 个文件，失败 ${result.failed.length} 个`);
  } catch (error: any) {
    console.error('批量删除失败:', error);
    ctx.body = fail(error.message || '批量删除失败');
  }
}

/**
 * 获取文件详情
 * GET /api/files/:uuid
 */
export async function getFileDetailsAPI(ctx: Context, next: Next): Promise<void> {
  try {
    const { uuid } = ctx.params;
    const { user } = ctx.state;

    const file = await fileService.getFileById(uuid, user.uuid, user.platformId);

    if (!file) {
      ctx.body = fail('文件不存在或无权限访问');
      return;
    }

    ctx.body = success({
      uuid: file.uuid,
      originalName: file.originalName,
      fileName: file.fileName,
      fileType: file.fileType,
      fileExtension: file.fileExtension,
      fileSize: file.fileSize,
      uploadDate: file.uploadDate,
      uploadBy: file.uploadBy,
      downloadCount: file.downloadCount,
      lastAccessTime: file.lastAccessTime,
      tags: file.tags,
      description: file.description,
      isPublic: file.isPublic,
      md5Hash: file.md5Hash,
      fileUrl: (file as any).fileUrl,
      thumbnailUrl: (file as any).thumbnailUrl
    }, '获取文件详情成功');
  } catch (error: any) {
    console.error('获取文件详情失败:', error);
    ctx.body = fail(error.message || '获取文件详情失败');
  }
}

/**
 * 获取文件统计信息
 * GET /api/files/statistics
 */
export async function getFileStatisticsAPI(ctx: Context, next: Next): Promise<void> {
  try {
    const { user } = ctx.state;
    const { showAll = 'false' } = ctx.query;

    const stats = await fileService.getFileStatistics(
      showAll === 'true' ? undefined : user.uuid,
      user.platformId
    );

    ctx.body = success({
      totalFiles: stats.totalFiles,
      totalSize: stats.totalSize,
      totalSizeFormatted: formatFileSize(stats.totalSize),
      fileTypeDistribution: stats.fileTypeDistribution,
      uploadTrend: stats.uploadTrend
    }, '获取文件统计成功');
  } catch (error: any) {
    console.error('获取文件统计失败:', error);
    ctx.body = fail(error.message || '获取文件统计失败');
  }
}

/**
 * 更新文件权限
 * PUT /api/files/:uuid/permission
 */
export async function updateFilePermissionAPI(ctx: Context, next: Next): Promise<void> {
  try {
    const { uuid } = ctx.params;
    const { user } = ctx.state;
    const { isPublic } = ctx.request.body as Record<string, any>;

    if (typeof isPublic !== 'boolean') {
      ctx.body = fail('权限参数格式错误');
      return;
    }

    const file = await fileService.updateFilePermission(
      uuid,
      user.uuid,
      user.platformId,
      isPublic
    );

    ctx.body = success({
      uuid: file.uuid,
      isPublic: file.isPublic,
      updatedAt: file.updatedAt
    }, `文件权限已更新为${isPublic ? '公开' : '私有'}`);
  } catch (error: any) {
    console.error('更新文件权限失败:', error);
    ctx.body = fail(error.message || '更新文件权限失败');
  }
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
