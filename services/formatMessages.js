

const escapeHtml = require("../utils/escapeHtml");
const fetchLiquidation = require("../api/fetchLiquidation");
const fetchLongShortRatioData = require("../api/fetchLongShortRatioData");
const fetchLongShortRatioDataPreviousHour = require("../api/fetchLongShortRatioDataPreviousHour");
const fetchPredictedFundingRate = require('../api/fetchPredictedFundingRate');
const fetchOpenInterestChange = require('../api/fetchOpenInterestChange');



async function formatMessagesPerSymbol(data) {
    const messages = [];

    for (const symbol in data) {
        const candles = data[symbol];
        const latest = candles.at(-1);
        const prev = candles.length >= 2 ? candles.at(-2) : null;
        const displaySymbol = escapeHtml(symbol.replace('_PERP.A', ''));
        const displaySymbolSpot = escapeHtml(symbol.replace('USDT_PERP.A', ''));

        // time
        const now = new Date();  // Lấy thời gian hiện tại
        const options = {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: "Asia/Ho_Chi_Minh"  // Chỉ định múi giờ Hồ Chí Minh
        };
        const formattedTime = now.toLocaleString("vi-VN", options);

        // ===== PHẦN 1: THÔNG TIN GIÁ VÀ VOLUME =====
        const percentChange1 = ((latest.c - latest.o) / latest.o) * 100;
        const buyVolume = latest.bv;
        const sellVolume = latest.v - latest.bv;
        const buyMorePercent = ((buyVolume - sellVolume) / sellVolume) * 100;
        const trend = buyMorePercent > 0 ? "⬆️" : "⬇️";

        const sellTx = latest.tx - latest.btx;
        const buyMorePercentTx = ((latest.btx - sellTx) / sellTx) * 100;
        const trendTX = buyMorePercentTx > 0 ? "⬆️" : "⬇️";

        // Đặt lại locale cho "vi-VN" (hoặc "en-US" nếu muốn dấu "," cho phân cách hàng nghìn)
        const formatNumber = (num) => {
            return Math.round(num).toLocaleString('en-US'); // Làm tròn và dùng định dạng ngắn gọn
        }
        
        // Áp dụng định dạng cho các số volume
        const volumeFormatted = formatNumber(latest.v);
        const buyVolumeFormatted = formatNumber(buyVolume);
        const sellVolumeFormatted = formatNumber(sellVolume);

        // const oiTime = latest?.t
        //     ? new Date(latest.t * 1000).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
        //     : "N/A";
        
        const pricePart = `         ⭐⭐⭐ <code><b><i>${displaySymbolSpot}</i></b></code> ⭐⭐⭐
🔸 <b>Price:</b> ${(latest.c)}
🚀 <b>PriceChange:</b> ${percentChange1.toFixed(1)}%
╰┈➤<a href="https://www.coinglass.com/tv/vi/Binance_${displaySymbol}"> Chart Coinglass </a>
╰┈➤<a href="https://www.coinglass.com/vi/currencies/${displaySymbolSpot}?type=spot"> Check Spot </a>
╰┈➤<a href="https://www.mexc.com/vi-VN/futures/${displaySymbolSpot}_USDT?type=linear_swap&lang=vi-VN"> Trade Mexc  </a>
📊 <b>Volume:</b> ${volumeFormatted} || ${trend} ${buyMorePercent.toFixed(1)}%
📈 <b>Buy:</b> ${buyVolumeFormatted} || 📉 <b>Sell:</b> ${sellVolumeFormatted}


`.trim();




// // ===== PHẦN 2: LIQUIDATION =====
//     const { long = 0, short = 0 } = await fetchLiquidation(displaySymbol);
// // Áp dụng cho long và short
//    const longFormatted = formatNumber(long);
//    const shortFormatted = formatNumber(short);

//    const liquidationPart = `💥 <b>Liquidation</b> 
// 🟢<b> Long:</b> $ ${longFormatted} || 🔴 <b>Short:</b> $ ${shortFormatted}`.trim();


  // ===== PHẦN 3: LONG SHORT RATIO =====
const ratioData = await fetchLongShortRatioData(symbol); // Giờ hiện tại
const previousRatioData = await fetchLongShortRatioDataPreviousHour(symbol); // Giờ trước đó

const ratio = ratioData?.ratio?.toFixed(2) || "N/A";
const longRatio = ratioData?.longRatio?.toFixed(1) || "N/A";
const shortRatio = ratioData?.shortRatio?.toFixed(1) || "N/A";

// Thông tin giờ trước
const previousRatio = previousRatioData?.ratio?.toFixed(2) || "N/A";

const lsrPart = `⚠️ <b>LS Ratio:</b> ${previousRatio} ➤➤ ${ratio}
`.trim();


        // ===== PHẦN 4: PREDICTED FUNDING RATE =====
        const fundingData = await fetchPredictedFundingRate(symbol);
        const predictedRate = fundingData?.value?.toFixed(6) || "N/A";

        // // Kiểm tra nếu predictedRate nằm trong khoảng từ -1 đến -10 và bỏ qua symbol đó nếu điều kiện này thỏa mãn
        // if (predictedRate !== "N/A" && (parseFloat(predictedRate) >= -10 && parseFloat(predictedRate) <= -1)) {
        //     continue; // Bỏ qua symbol này nếu predictedFundingRate trong khoảng từ -1 đến -10
        // }
        // ⏱️ <b>Time:</b> ${fundingTime}
        const fundingTime = fundingData?.update
            ? new Date(fundingData.update).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
            : "N/A";

        const fundingRatePart = `💰 <b>Predicted Funding:</b> ${predictedRate}
`.trim();

// // // ===== PHẦN 5: OPEN INTEREST CHANGE =====
// const oiData = await fetchOpenInterestChange(symbol);
// const oiChange = oiData
//     ? ((oiData.close - oiData.open) / oiData.open * 100).toFixed(2) + '%'
//     : "N/A";

// const openFormatted = oiData?.open ? Math.round(oiData.open).toLocaleString() : "N/A";
// const closeFormatted = oiData?.close ? Math.round(oiData.close).toLocaleString() : "N/A";

// // Sửa lỗi timestamp: nhân với 1000 để đổi sang mili giây
// const oiTime = oiData?.timestamp
//     ? new Date(oiData.timestamp * 1000).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
//     : "N/A";

// const openInterestPart = `
// 📊 <b>OI Change:</b> ${oiChange}
// // 🔓 Open: ${openFormatted}
// // 🔒 Close: ${closeFormatted}
// ⏱️ <b>Time:</b> ${oiTime}
// <b>  「 ✔ ᵛᵉʳᶦᶦᵉᵈ」 </b>
// `.trim();


// ===== PHẦN 5: TIME =====
const oiData = await fetchOpenInterestChange(symbol);
const oiChange = oiData
    ? ((oiData.close - oiData.open) / oiData.open * 100).toFixed(2) + '%'
    : "N/A";

const openFormatted = oiData?.open ? Math.round(oiData.open).toLocaleString() : "N/A";
const closeFormatted = oiData?.close ? Math.round(oiData.close).toLocaleString() : "N/A";

// Sửa lỗi timestamp: nhân với 1000 để đổi sang mili giây
const oiTime = oiData?.timestamp
    ? new Date(oiData.timestamp * 1000).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
    : "N/A";

const openInterestPart = `
⏱️ <b>Time:</b> ${oiTime}

<b>  「 ✔ ᵛᵉʳᶦᶦᵉᵈ」 </b>
`.trim();



// // ===== PHẦN 6: TỔNG KẾT =====
// let summary = "";

// const parsedPredicted = parseFloat(predictedRate);
// const parsedRatio = parseFloat(ratio);
// const parsedOiChange = parseFloat(oiChange.replace('%', ''));

// if (buyMorePercent > 10 && parsedRatio >= 1 && parsedPredicted > 0 && parsedOiChange > 10) {
//     summary = "🔥 <b>LONG mạnh</b>";
// } else if (buyMorePercent > 10 && parsedPredicted <= -1 && parsedPredicted >= -10) {
//     summary = "🧨 <b>LONG theo Funding Rate</b>";
// } else if (buyMorePercent < -10 && parsedPredicted <= -1 && parsedPredicted >= -10) {
//     summary = "💥 <b>SHORT theo Funding Rate</b>";
// } else if (buyMorePercent > 0 && parsedRatio >= 1 && parsedPredicted > 0 && parsedOiChange < 0) {
//     summary = "🟠 <b>3 chỉ số dương, OI giảm</b>";
// } else if (buyMorePercent > 0 && parsedRatio >= 1 && parsedPredicted > 0 && parsedOiChange > 0) {
//     summary = "🟢 <b>LONG full xanh</b>";
// } else if (buyMorePercent > 0 && parsedRatio >= 1 && parsedPredicted > -1 && parsedPredicted <= 0 && parsedOiChange > 0) {
//     summary = "🟡 <b>LONG funding âm nhẹ</b>";
// } else if (buyMorePercent > 0 && parsedRatio < 1 && parsedPredicted > 0 && parsedOiChange > 0) {
//     summary = "🟡 <b>LONG Radio âm</b>";
// } else if (buyMorePercent > 0 && parsedRatio < 1 && parsedPredicted > -1 && parsedPredicted < 0) {
//     summary = "🔁 <b>LONG ngược</b>";
// } else if (buyMorePercent < 0 && parsedRatio < 0 && parsedPredicted < 0 && parsedOiChange < 0) {
//     summary = "🔻 <b>Full âm</b>";
// } else if (buyMorePercent < 0 && parsedRatio < 0 && parsedPredicted < 0 && parsedOiChange > 0) {
//     summary = "🔺 <b>Âm nhưng OI tăng</b>";
// } else if (parsedPredicted <= -1 && parsedPredicted >= -10) {
//     summary = "🔻 <b>Funding Rate âm</b>";
// }

// // // Nếu không có summary (không rõ xu hướng) thì bỏ qua symbol luôn
// // if (!summary) {
// //     continue;
// // }





// let ratioTrend = "";

// const parsedPreviousRatio = parseFloat(previousRatio);

// if (!isNaN(parsedRatio) && !isNaN(parsedPreviousRatio)) {
//     if (parsedRatio > parsedPreviousRatio) {
//         ratioTrend = "📈 LS Ratio tăng";
//     } else if (parsedRatio < parsedPreviousRatio) {
//         ratioTrend = "📉 LS Ratio giảm";
//     } else {
//         ratioTrend = "➖ LS Ratio không đổi";
//     }
// }


// // Gộp finalMessage như cũ
// const summaryPart = summary ? `\n\n📌 <b>Tín hiệu:</b>\n ${summary}\n${ratioTrend ? ratioTrend : ""}` : "";

// const finalMessage = [pricePart, liquidationPart, lsrPart, fundingRatePart, openInterestPart].join('\n\n') + summaryPart;
const finalMessage = [pricePart,fundingRatePart,lsrPart,openInterestPart].join('\n\n') ;


messages.push({
    symbol: displaySymbol,
    message: finalMessage
});

}

    return messages;
}



module.exports = formatMessagesPerSymbol;

