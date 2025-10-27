// 诊断脚本：检查路由配置
// 在你的项目根目录运行：node diagnose.js

const express = require('express');
const router = express.Router();

// 模拟 middleware
const requireTravelerAuth = (req, res, next) => {
  console.log('✓ Auth middleware would be called');
  next();
};

// 模拟 controller
const bookingController = {
  createBooking: () => console.log('✓ createBooking exists'),
  getTravelerBookings: () => console.log('✓ getTravelerBookings exists'),
  getTravelerHistory: () => console.log('✓ getTravelerHistory exists'),
  cancelBookingTraveler: () => console.log('✓ cancelBookingTraveler exists')
};

console.log('\n🔍 诊断开始...\n');

// 检查 1: 加载路由文件
console.log('1️⃣ 检查 bookingRoutes.js 文件:');
try {
  const bookingRoutes = require('./routes/bookingRoutes');
  console.log('✅ bookingRoutes.js 加载成功\n');
} catch (err) {
  console.log('❌ bookingRoutes.js 加载失败:', err.message);
  console.log('   路径是否正确？\n');
}

// 检查 2: 加载 controller
console.log('2️⃣ 检查 bookingController.js 文件:');
try {
  const controller = require('./controllers/bookingController');
  console.log('✅ bookingController.js 加载成功');
  console.log('   导出的方法:', Object.keys(controller));
  
  if (controller.getTravelerHistory) {
    console.log('✅ getTravelerHistory 方法存在\n');
  } else {
    console.log('❌ getTravelerHistory 方法不存在！\n');
  }
} catch (err) {
  console.log('❌ bookingController.js 加载失败:', err.message, '\n');
}

// 检查 3: 测试路由注册
console.log('3️⃣ 检查路由注册:');
router.post('/request', requireTravelerAuth, bookingController.createBooking);
router.get('/traveler/history', requireTravelerAuth, bookingController.getTravelerHistory);
router.get('/traveler', requireTravelerAuth, bookingController.getTravelerBookings);
router.put('/:id/cancel', requireTravelerAuth, bookingController.cancelBookingTraveler);

console.log('✅ 所有路由已注册\n');

// 检查 4: 显示路由层级
console.log('4️⃣ 路由结构:');
router.stack.forEach((layer, index) => {
  if (layer.route) {
    const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
    console.log(`   ${index + 1}. ${methods} ${layer.route.path}`);
  }
});

console.log('\n✅ 诊断完成！\n');
console.log('📝 注意事项:');
console.log('   - 确保已替换 bookingRoutes.js 和 bookingController.js');
console.log('   - 确保已重启服务器 (Ctrl+C 然后 npm start)');
console.log('   - /traveler/history 必须在 /traveler 之前注册');
