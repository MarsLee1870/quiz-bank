import axios from "axios";

// 替換為你的 Google Sheet ID（你已提供）
const SHEET_ID = "1YpFHehDRnsZ21D0yhJN_yfqfkWjjpiee-fQyK8g2C0Y";

// 工作表的名稱（通常為第一個分頁的名稱）
const SHEET_NAME = "老師出題"; // 可依實際名稱修改

// 你的 Google Sheets API Key（建議存放在 .env 檔案中）
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;

export async function getVocabularyData() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;

    const response = await axios.get(url);
    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      console.warn("未抓到資料！");
      return [];
    }

    // 解析欄位：第一列為標題
    const headers = rows[0];
    const data = rows.slice(1).map((row) => {
      const item = {};
      headers.forEach((header, index) => {
        item[header.trim()] = row[index] || "";
      });
      return item;
    });

    return data;
  } catch (error) {
    console.error("抓取單字題庫失敗：", error);
    return [];
  }
}
