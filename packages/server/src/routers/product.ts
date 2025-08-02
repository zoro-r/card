import Router from '@koa/router';
import { ProductController } from '@/controller/product';
import { authMiddleware, authenticateToken } from '@/middleware/auth';

const productRouter = new Router();

// 管理后台课程管理路由
productRouter.get('/admin/products', authMiddleware, ProductController.getProductList);
productRouter.post('/admin/products', authMiddleware, ProductController.createProduct);
productRouter.get('/admin/products/statistics', authMiddleware, ProductController.getProductStatistics);
productRouter.get('/admin/products/search', authMiddleware, ProductController.searchProducts);
productRouter.get('/admin/products/recommended', authMiddleware, ProductController.getRecommendedProducts);
productRouter.get('/admin/products/featured', authMiddleware, ProductController.getFeaturedProducts);
productRouter.post('/admin/products/batch-delete', authMiddleware, ProductController.batchDeleteProducts);
productRouter.post('/admin/products/batch-update-status', authMiddleware, ProductController.batchUpdateStatus);

productRouter.get('/admin/products/:productId', authMiddleware, ProductController.getProductDetail);
productRouter.put('/admin/products/:productId', authMiddleware, ProductController.updateProduct);
productRouter.delete('/admin/products/:productId', authMiddleware, ProductController.deleteProduct);

// 课程特有功能路由
productRouter.post('/admin/products/:productId/enroll', authMiddleware, ProductController.enrollStudent);
productRouter.post('/admin/products/:productId/rating', authMiddleware, ProductController.updateRating);

// 小程序端课程接口路由
productRouter.get('/wechat/:platformId/products', ProductController.getWechatProductList);
productRouter.get('/wechat/:platformId/products/search', ProductController.searchWechatProducts);
productRouter.get('/wechat/:platformId/products/recommended', ProductController.getWechatRecommendedProducts);
productRouter.get('/wechat/:platformId/products/featured', ProductController.getWechatFeaturedProducts);
productRouter.get('/wechat/:platformId/products/:productId', ProductController.getWechatProductDetail);

export default function(router: Router) {
  router.use('/api', productRouter.routes());
}