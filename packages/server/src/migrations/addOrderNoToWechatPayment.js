/**
 * 数据库迁移脚本：为WechatPayment表添加orderNo字段
 * 
 * 此脚本会：
 * 1. 为所有现有的微信支付记录添加orderNo字段
 * 2. 从attach字段或通过outTradeNo关联订单来获取orderNo
 * 3. 创建orderNo索引
 */

const mongoose = require('mongoose');

// 连接数据库
async function migrate() {
  try {
    // 如果没有连接，则连接数据库
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/card_system');
    }

    console.log('开始迁移：为WechatPayment添加orderNo字段...');

    const db = mongoose.connection.db;
    const wechatPaymentCollection = db.collection('wechatpayments');
    const orderCollection = db.collection('orders');

    // 1. 获取所有没有orderNo字段的微信支付记录
    const paymentsWithoutOrderNo = await wechatPaymentCollection.find({
      orderNo: { $exists: false }
    }).toArray();

    console.log(`找到 ${paymentsWithoutOrderNo.length} 条需要更新的支付记录`);

    let updateCount = 0;
    let errorCount = 0;

    // 2. 批量更新记录
    for (const payment of paymentsWithoutOrderNo) {
      try {
        let orderNo = null;

        // 方法1：从attach字段获取orderNo
        if (payment.attach) {
          orderNo = payment.attach;
        }

        // 方法2：如果attach字段没有，尝试通过outTradeNo查找关联的订单
        if (!orderNo) {
          // 查找引用了此支付记录的订单
          const relatedOrder = await orderCollection.findOne({
            wechatPayment: payment._id
          });
          
          if (relatedOrder) {
            orderNo = relatedOrder.orderNo;
          }
        }

        // 方法3：如果还是没有找到，尝试通过时间范围和金额匹配订单
        if (!orderNo) {
          // 在支付记录创建时间前后1小时内查找相同金额的订单
          const timeRange = 60 * 60 * 1000; // 1小时
          const matchingOrder = await orderCollection.findOne({
            totalAmount: payment.totalFee,
            openid: payment.openid,
            createdAt: {
              $gte: new Date(payment.createdAt.getTime() - timeRange),
              $lte: new Date(payment.createdAt.getTime() + timeRange)
            }
          });

          if (matchingOrder) {
            orderNo = matchingOrder.orderNo;
            console.log(`通过金额和时间匹配找到订单: ${orderNo} -> ${payment.outTradeNo}`);
          }
        }

        // 4. 更新支付记录
        if (orderNo) {
          await wechatPaymentCollection.updateOne(
            { _id: payment._id },
            { $set: { orderNo: orderNo } }
          );
          updateCount++;
          
          if (updateCount % 100 === 0) {
            console.log(`已更新 ${updateCount} 条记录...`);
          }
        } else {
          console.warn(`无法找到支付记录 ${payment.outTradeNo} 对应的订单号`);
          errorCount++;
        }

      } catch (error) {
        console.error(`更新支付记录 ${payment.outTradeNo} 时出错:`, error);
        errorCount++;
      }
    }

    // 3. 创建orderNo索引（如果不存在）
    try {
      await wechatPaymentCollection.createIndex({ orderNo: 1 });
      console.log('已创建orderNo索引');
    } catch (error) {
      if (error.code !== 85) { // 85 = IndexKeySpecsConflict，表示索引已存在
        console.warn('创建orderNo索引时出错:', error.message);
      }
    }

    console.log(`迁移完成！`);
    console.log(`- 成功更新: ${updateCount} 条记录`);
    console.log(`- 失败/跳过: ${errorCount} 条记录`);

    return { success: updateCount, error: errorCount };

  } catch (error) {
    console.error('迁移过程中出错:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  migrate()
    .then((result) => {
      console.log('迁移结果:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('迁移失败:', error);
      process.exit(1);
    });
}

module.exports = { migrate };