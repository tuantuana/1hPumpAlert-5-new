// createApiUrl.js
const dayjs = require('dayjs');
const { API_KEY } = require('../config');



function createApiUrl(symbols) {
    const nowTimestamp = Math.floor(Date.now() / 1000);
    const currentHour = Math.floor(nowTimestamp / 3600) * 3600;
    const from = currentHour - 3600; // 19:00
    const to = from; 


    const symbolParam = symbols.join(',');
    // console.log("📦 from:careate", from, "| to:", to);
    return `https://api.coinalyze.net/v1/ohlcv-history?symbols=${symbolParam}&interval=1hour&from=${from}&to=${to}&api_key=${API_KEY}`;
}

module.exports = {
    createApiUrl,

};