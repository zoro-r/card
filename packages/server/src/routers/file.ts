import Router from '@koa/router';
import * as fileController from '../controller/file';
import { authMiddleware } from '../middleware/auth';
import multer from '@koa/multer';
import { initializeUploadDirectory } from '../service/file';

/**
 * 文件管理路由模块
 * 定义文件上传、下载、删除、预览等RESTful API路由
 */

// 初始化上传目录
initializeUploadDirectory();

// 配置multer中间件用于处理文件上传
const upload = multer({
  dest: 'temp/', // 临时文件目录
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600'), // 100MB
    files: 10 // 最多10个文件
  },
  fileFilter: (req, file, cb) => {
    // 修复中文文件名编码问题
    if (file.originalname) {
      // 将文件名从latin1编码转换为utf8
      file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    }

    // 基本的文件类型验证
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv', 'application/json',
      'application/zip', 'application/x-rar-compressed'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`不支持的文件类型: ${file.mimetype}`), false);
    }
  }
});

/**
 * 注册文件管理相关路由
 * @param router - Koa Router实例
 */
export default function fileRouter(router: Router) {

  // 文件上传相关路由

  /**
   * 上传单个文件
   * POST /api/files/upload
   * 需要认证，支持表单上传
   */
  router.post(
    '/api/files/upload',
    authMiddleware,
    upload.single('file'),
    fileController.uploadFileAPI
  );

  /**
   * 批量上传文件
   * POST /api/files/upload-multiple
   * 需要认证，支持多文件上传
   */
  router.post(
    '/api/files/upload-multiple',
    authMiddleware,
    upload.array('files', 10),
    fileController.uploadMultipleFilesAPI
  );

  // 文件查询相关路由

  /**
   * 获取文件列表
   * GET /api/files/list
   * 支持分页、筛选、搜索
   */
  router.get(
    '/api/files/list',
    authMiddleware,
    fileController.getFileListAPI
  );

  /**
   * 获取文件统计信息
   * GET /api/files/statistics
   * 返回文件数量、大小、类型分布等统计数据
   */
  router.get(
    '/api/files/statistics',
    authMiddleware,
    fileController.getFileStatisticsAPI
  );

  /**
   * 获取文件详情
   * GET /api/files/:uuid
   * 根据文件UUID获取详细信息
   */
  router.get(
    '/api/files/:uuid',
    authMiddleware,
    fileController.getFileDetailsAPI
  );

  /**
   * 更新文件权限
   * PUT /api/files/:uuid/permission
   * 修改文件的公开/私有权限
   */
  router.put(
    '/api/files/:uuid/permission',
    authMiddleware,
    fileController.updateFilePermissionAPI
  );

  // 文件下载相关路由

  /**
   * 下载文件
   * GET /api/files/download/:uuid
   * 下载指定文件，支持断点续传
   */
  router.get(
    '/api/files/download/:uuid',
    authMiddleware,
    fileController.downloadFileAPI
  );

  /**
   * 预览文件
   * GET /api/files/preview/:uuid
   * 在线预览文件，适用于图片、PDF等
   */
  router.get(
    '/api/files/preview/:uuid',
    authMiddleware,
    fileController.previewFileAPI
  );

  /**
   * 批量下载（ZIP）
   * POST /api/files/download-multiple
   * 将多个文件打包为ZIP下载
   */
  router.post(
    '/api/files/download-multiple',
    authMiddleware,
    fileController.downloadMultipleFilesAPI
  );

  // 文件删除相关路由

  /**
   * 删除文件
   * DELETE /api/files/:uuid
   * 软删除指定文件
   */
  router.delete(
    '/api/files/:uuid',
    authMiddleware,
    fileController.deleteFileAPI
  );

  /**
   * 批量删除文件
   * DELETE /api/files/batch
   * 批量软删除多个文件
   */
  router.delete(
    '/api/files/batch',
    authMiddleware,
    fileController.deleteMultipleFilesAPI
  );

  // 公开访问路由（不需要认证）

  /**
   * 公开文件预览
   * GET /api/files/public/preview/:uuid
   * 预览标记为公开的文件
   */
  router.get(
    '/api/files/public/preview/:uuid',
    async (ctx) => {
      try {
        const { uuid } = ctx.params;
        const fileService = require('../service/file');

        // 不传用户信息，但验证是否为公开文件
        const file = await fileService.getFileById(uuid);

        if (!file || !file.isPublic) {
          ctx.status = 404;
          ctx.body = {
            success: false,
            message: '文件不存在或不允许公开访问'
          };
          return;
        }

        const result = await fileService.downloadFile(uuid);

        // 设置响应头用于在线预览
        ctx.set('Content-Type', result.file.fileType);
        ctx.set('Content-Disposition', `inline; filename="${encodeURIComponent(result.file.originalName)}"`);
        ctx.set('Content-Length', result.file.fileSize.toString());
        ctx.set('Cache-Control', 'public, max-age=31536000');

        // 流式传输文件
        const fs = require('fs');
        ctx.body = fs.createReadStream(result.filePath);
        ctx.status = 200;
      } catch (error) {
        console.error('公开文件预览失败:', error);
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: '文件预览失败'
        };
      }
    }
  );

  /**
   * 公开文件下载
   * GET /api/files/public/download/:uuid
   * 下载标记为公开的文件
   */
  router.get(
    '/api/files/public/download/:uuid',
    async (ctx) => {
      try {
        const { uuid } = ctx.params;
        const fileService = require('../service/file');

        const file = await fileService.getFileById(uuid);

        if (!file || !file.isPublic) {
          ctx.status = 404;
          ctx.body = {
            success: false,
            message: '文件不存在或不允许公开访问'
          };
          return;
        }

        const result = await fileService.downloadFile(uuid);

        // 设置响应头
        ctx.set('Content-Type', result.file.fileType);
        ctx.set('Content-Disposition', `attachment; filename="${encodeURIComponent(result.file.originalName)}"`);
        ctx.set('Content-Length', result.file.fileSize.toString());

        // 流式传输文件
        const fs = require('fs');
        ctx.body = fs.createReadStream(result.filePath);
        ctx.status = 200;
      } catch (error) {
        console.error('公开文件下载失败:', error);
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: '文件下载失败'
        };
      }
    }
  );
}
