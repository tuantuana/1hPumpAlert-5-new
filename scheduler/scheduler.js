// ❌ Đừng import ../index nữa
// const fetchAllData = require('../index'); ← gây lỗi

// ✅ Thay bằng import trực tiếp hàm
const fetchAllData = require('../services/fetchAllData');
const cron = require('node-cron');

module.exports = () => {
    cron.schedule('0 * * * *', () => {
        console.log('⏰ [CRON] Đến phút 0 rồi!, đang chạy fetchAllData...');
        fetchAllData();
    });
};
