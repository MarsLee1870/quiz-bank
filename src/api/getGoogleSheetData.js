import axios from "axios";

// ✅ 所有資料庫的 Sheet ID（依照你的分類）
const SHEET_IDS = {
  grammar: "1ogWRn4sToJkGr8RtW5Xfwl1hyYGfjUW94CTcCQV1UZY",      // 文法題庫
  vocabulary: "1YpFHehDRnsZ21D0yhJN_yfqfkWjjpiee-fQyK8g2C0Y",             // 單字題庫
  reading: "1TqULIcnpq6P4nTEFcKF0XVMLQj_hL4ek-CVtW8R2KiE",       // 閱讀題庫
};

// ✅ 你的 Google Sheets API Key
const API_KEY = "AIzaSyAlhC7fp6oXCrQE1fk37GMp5760-iLb5bg";

// ✅ 取得指定分頁資料的函式
const getGoogleSheetData = async (sheetType, sheetName) => {
  try {
    const sheetId = SHEET_IDS[sheetType];
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${API_KEY}`;

    const response = await axios.get(url);
    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      console.warn("⚠️ 沒有抓到任何資料！");
      return [];
    }

    // 將每一列轉成物件（第一列是欄位名稱）
    const headers = rows[0];
    const questions = rows.slice(1).map((row) => {
      return headers.reduce((obj, header, index) => {
        obj[header] = row[index] || ""; // 若沒填則為空字串
        return obj;
      }, {});
    });

    return questions;
  } catch (error) {
    console.error("❌ 無法讀取 Google Sheet 資料：", error);
    return [];
  }
};

// ✅ 加上 export default，App.jsx 才能正確匯入
export default getGoogleSheetData;
