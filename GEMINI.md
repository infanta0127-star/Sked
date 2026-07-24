# 專案代理指南 (FFXIV 戰鬥排軸助手 / Sked)

> 本檔與 `GEMINI.md` 內容相同，供不同 AI 代理讀取。**修改其一時請同步另一個。**

前端純靜態網站，部署在 GitHub Pages。主要檔案：`index.html`、`index.css`、`timeline.js`、`mit_timeline.js`。

## 發布新版 / 觸發前端更新通知

線上已開著舊分頁的使用者每 60 秒抓一次 `version.json`，若伺服器版本號與頁面內烘焙的 `APP_VERSION` 不同，就會在右下角跳出「重新整理」通知。

**要讓使用者收到更新通知，發版時務必同步把下面兩處改成同一個、且更高的版本號：**

1. `version.json` 的 `version`
2. `timeline.js` 的 `APP_VERSION`

⚠️ **兩者必須完全一致。** 只改其中一個會導致：新載入的使用者一進來就跳通知、刷新後仍不消失（無限迴圈）。

### 版本號規則（主.次.修 / SemVer）

| 段位 | 何時 +1 | 例 |
|------|---------|-----|
| 修訂號 | 修 bug、改文字、調樣式等小改動 | `1.0.0 → 1.0.1` |
| 次版本 | 新增功能（右側歸零） | `1.0.1 → 1.1.0` |
| 主版本 | 破壞性大改版（右側歸零） | `1.9.0 → 2.0.0` |

### 注意

- header 標籤的 `(Patch 7.1)` 是**遊戲版本**，與 `APP_VERSION` 無關，需在 `index.html` 手動維護。
- header 的版本號部分（`#app-version`）會由 `APP_VERSION` 自動填入，不用手改。
- 改完 commit + push 到 `main`（GitHub Pages 由 `main` 部署）。

## 更新日誌（Changelog）

點擊 header 版本號會開啟「更新日誌」彈窗，內容讀自 Supabase `changelog` 表（最近 10 筆，`add-changelog-table.sql`）。**發新版時，請在 `changelog` 表新增一筆對應版本號的資料**（或作者自行進 DB 編修）。

- 內容寫「一般使用者看得懂的功能更新」，以及**與一般使用者有關的 bug 修復**（例如某技能顯示錯誤、匯入漏東西）；**不要**列上報、除錯、內部技術調整、管理後台 (`sked-management-portal.html`) 等管理性/開發性項目。
- ⚠️ **管理後台 (sked-management-portal.html)、除錯上報、內部技術調整等項目不屬於前台功能更新，不需要 Bump 版本號，也不需要產出 Changelog / SQL。**
- `content` 每一行 = 一條項目（換行分隔）。前端唯讀，寫入僅透過 Supabase Dashboard / service_role。
- 每次發版 Bump 版本號時，務必主動提供一份對應新版本號的 SQL `INSERT INTO public.changelog (version, released_at, content) VALUES ('...', 'YYYY-MM-DD HH:MI+08', '...');` 語法給作者至 Supabase 執行。

## 開發前務必先同步與權威狀態確認

作者以多台電腦、多個 AI 代理、多個對話視窗交替開發。

1. **開工前務必先 `git pull`**，避免落後遠端造成衝突。
2. ⚠️ **禁止憑對話紀錄/摘要推算版本號與專案狀態**：在更新版本號（`version.json` / `timeline.js` 的 `APP_VERSION`）或修改關鍵指標前，**務必先執行 `git log` 或直接檢視實體檔案確認當前最新狀態**，絕不能單憑聊天紀錄或上下文摘要推算！
