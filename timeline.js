window.showCustomConfirm = function(title, message, cancelText = '取消', okText = '確定') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:10000;';
    overlay.innerHTML = `
      <div style="background:#12121f; border:1px solid #2a2a3f; border-radius:16px; padding:28px 24px; width:360px; max-width:90vw; color:#fff; box-shadow:0 24px 60px rgba(0,0,0,0.6);">
        <h3 style="margin:0 0 12px; font-size:16px; font-weight:700; color:#fff;">${title}</h3>
        <p style="margin:0 0 24px; font-size:14px; color:#aaa; line-height:1.5;">${message}</p>
        <div style="display:flex; justify-content:flex-end; gap:12px;">
          <button id="custom-confirm-cancel" style="padding:8px 20px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:8px; color:#fff; cursor:pointer; font-size:14px; transition:background 0.2s;">${cancelText}</button>
          <button id="custom-confirm-ok" style="padding:8px 20px; background:linear-gradient(135deg,#4f6ef7,#7c9ef8); border:none; border-radius:8px; color:#fff; cursor:font-weight:600; font-size:14px; transition:opacity 0.2s;">${okText}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    
    const cleanup = (val) => {
      if (overlay.parentNode) document.body.removeChild(overlay);
      resolve(val);
    };
    
    overlay.querySelector('#custom-confirm-cancel').addEventListener('click', () => cleanup(false));
    overlay.querySelector('#custom-confirm-ok').addEventListener('click', () => cleanup(true));
  });
};

window.showCustomPrompt = function(title, placeholder, defaultValue = '') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:10000;';
    overlay.innerHTML = `
      <div style="background:#12121f; border:1px solid #2a2a3f; border-radius:16px; padding:28px 24px; width:360px; max-width:90vw; color:#fff; box-shadow:0 24px 60px rgba(0,0,0,0.6);">
        <h3 style="margin:0 0 12px; font-size:16px; font-weight:700; color:#fff;">${title}</h3>
        <input id="custom-prompt-input" type="text" placeholder="${placeholder}" value="${defaultValue}" style="width:100%; box-sizing:border-box; background:#0d0d1a; border:1px solid #333; border-radius:8px; padding:10px 12px; color:#fff; font-size:14px; outline:none; margin-bottom:24px;">
        <div style="display:flex; justify-content:flex-end; gap:12px;">
          <button id="custom-prompt-cancel" style="padding:8px 16px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#fff; cursor:pointer; font-size:14px; transition:background 0.2s;">取消</button>
          <button id="custom-prompt-ok" style="padding:8px 20px; background:linear-gradient(135deg,#4f6ef7,#7c9ef8); border:none; border-radius:8px; color:#fff; cursor:pointer; font-weight:600; font-size:14px; transition:opacity 0.2s;">確定</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    
    const input = overlay.querySelector('#custom-prompt-input');
    input.focus();
    input.select();
    
    const cleanup = (val) => {
      document.body.removeChild(overlay);
      resolve(val);
    };
    
    overlay.querySelector('#custom-prompt-cancel').addEventListener('click', () => cleanup(null));
    overlay.querySelector('#custom-prompt-ok').addEventListener('click', () => cleanup(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') cleanup(input.value);
      if (e.key === 'Escape') cleanup(null);
    });
  });
};

window.showCustomSaveChoices = function() {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:10000;';
    overlay.innerHTML = `
      <div style="background:#12121f; border:1px solid #2a2a3f; border-radius:16px; padding:28px 24px; width:380px; max-width:90vw; color:#fff; box-shadow:0 24px 60px rgba(0,0,0,0.6); position:relative;">
        <button id="custom-save-close" style="position:absolute; top:14px; right:18px; background:none; border:none; color:#555; font-size:20px; cursor:pointer; line-height:1;">✕</button>
        <h3 style="margin:0 0 16px; font-size:16px; font-weight:700; color:#fff;">保存紀錄</h3>
        <p style="margin:0 0 24px; font-size:14px; color:#aaa; line-height:1.5;">請選擇您的儲存方式：</p>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <button id="custom-save-existing" style="width:100%; padding:12px; background:linear-gradient(135deg,#4f6ef7,#7c9ef8); border:none; border-radius:8px; color:#fff; cursor:pointer; font-weight:600; font-size:14px; transition:opacity 0.2s;">保存至現有紀錄</button>
          <button id="custom-save-new" style="width:100%; padding:12px; background:rgba(255, 255, 255, 0.05); border:1px solid rgba(255, 255, 255, 0.1); border-radius:8px; color:#fff; cursor:pointer; font-weight:600; font-size:14px; transition:background 0.2s;">保存成新的紀錄</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    
    const cleanup = (val) => {
      document.body.removeChild(overlay);
      resolve(val);
    };
    
    overlay.querySelector('#custom-save-close').addEventListener('click', () => cleanup(null));
    overlay.querySelector('#custom-save-existing').addEventListener('click', () => cleanup('existing'));
    overlay.querySelector('#custom-save-new').addEventListener('click', () => cleanup('new'));
    
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        cleanup(null);
        window.removeEventListener('keydown', handleEsc);
      }
    };
    window.addEventListener('keydown', handleEsc);
  });
};

// Globals and State
const PREPULL_TIME = 10; // Pre-pull time in seconds (allows pre-casting skills before combat starts)
const TRACK_INFO_WIDTH = 180; // Width of the sticky left track info panel in pixels

// 解析 GCD 佔用時間（recast）。繪靈法師等職業有非標準 GCD：
//  - 特殊長 GCD（>= 3 秒，如色彩魔法 3.3、動物彩繪 4、彩虹點滴 6）照技能自身 recast
//  - 一般 GCD（約 2.5 秒）對齊玩家設定的 GCD（可能因技速而異）
//  - 短 GCD（< 1.8 秒，如各種彩繪 1.5 秒）照技能自身 recast
function resolveGcdRecast(parsedRecast, standardGcd) {
  // 充能 / 冷卻型 GCD（如發炎40秒、鑽頭20秒、迴轉飛鋸60秒、大宇宙180秒…）的 recast 欄位
  // 記的是「冷卻時間」，但施放時仍只佔用一個一般 GCD，故超過合理 GCD 長度者一律以標準 GCD 計算。
  if (parsedRecast > 4.5) return standardGcd;
  if (parsedRecast >= 3.0) return parsedRecast;
  if (parsedRecast >= 1.8) return standardGcd;
  return parsedRecast;
}

// 從匯入的技能推測玩家實際 GCD：取連續「一般 GCD」(recast 約 2.5) 之間的間隔中位數。
// 排除彩繪(1.5)、長 GCD(3.3+)，以及卡 GCD / 空窗造成的異常間隔。回傳 null 表示資料不足。
function estimateGcdFromSkills(skills) {
  const gcds = (skills || []).filter(s => s.track === 'gcd').sort((a, b) => a.startTime - b.startTime);
  const gaps = [];
  for (let i = 1; i < gcds.length; i++) {
    const prevRecast = parseTimeToSeconds(gcds[i - 1].recast);
    if (prevRecast >= 1.8 && prevRecast < 3.0) {
      const gap = gcds[i].startTime - gcds[i - 1].startTime;
      if (gap > 1.3 && gap < 2.9) gaps.push(gap);
    }
  }
  if (gaps.length < 2) return null;
  gaps.sort((a, b) => a - b);
  const mid = Math.floor(gaps.length / 2);
  const median = gaps.length % 2 ? gaps[mid] : (gaps[mid - 1] + gaps[mid]) / 2;
  return Math.round(median * 100) / 100;
}

// 判斷推測 GCD 與目前設定是否明顯不同（視為異常）。
function isGcdAnomaly(estimatedGcd, currentGcd) {
  return estimatedGcd != null && Math.abs(estimatedGcd - currentGcd) > 0.05;
}

// 輕量樣式化確認框（timeline.js 自用，回傳 Promise<boolean>）。
function showTimelineConfirm(message, confirmLabel = '確定', cancelLabel = '取消') {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.zIndex = '9999';
    modal.innerHTML = `
      <div class="modal-content" style="width:440px; max-width:92vw; padding:0; overflow:hidden; border-radius:12px; border:1px solid var(--border-color); box-shadow:0 12px 32px rgba(0,0,0,0.6);">
        <div class="modal-header" style="padding:14px 18px; border-bottom:1px solid var(--border-color); display:flex; align-items:center; gap:8px;">
          <h3 style="margin:0; font-size:15px; color:#fff; display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-circle-question" style="color:#f59e0b;"></i> 同步 GCD</h3>
        </div>
        <div class="modal-body" style="padding:18px 20px; display:flex; flex-direction:column; gap:16px;">
          <div style="font-size:14px; color:#e2e8f0; line-height:1.6;">${message}</div>
          <div style="display:flex; gap:10px; justify-content:flex-end;">
            <button class="btn btn-secondary" data-act="cancel" style="padding:8px 14px; font-size:13px; font-weight:600;">${cancelLabel}</button>
            <button class="btn btn-primary" data-act="confirm" style="padding:8px 14px; font-size:13px; font-weight:600;">${confirmLabel}</button>
          </div>
        </div>
      </div>`;
    const done = (val) => { modal.remove(); resolve(val); };
    modal.querySelector('[data-act="cancel"]').onclick = () => done(false);
    modal.querySelector('[data-act="confirm"]').onclick = () => done(true);
    modal.addEventListener('click', (e) => { if (e.target === modal) done(false); });
    document.body.appendChild(modal);
  });
}
let skillsDatabase = {};
let dutiesDatabase = {};
let currentJobId = '';
let currentDutyFile = '';
let timelineGCDDuration = 2.50;
let pixelsPerSecond = 60;
// 個人排軸各時間軸的 FFLogs 匯入資訊（推測 GCD、是否為原始匯入），供「!」提示使用
let timelineImportInfo = {};
let timelineSkills = []; // { instanceId, skillId, name, icon, classification, cast, recast, startTime, duration, track, parentGcdId, relativeOffset, clip, timelineId }
let bossMechanics = [];  // { id, time, name }
let importedPlayerName = null; // Name of the imported player from log API / paste
let activeTimelinesCount = 1;  // Support up to 3 timelines
let timelinePlayers = [null, null, null]; // Player name for each timeline
let playbackState = { isPlaying: false, currentTime: -PREPULL_TIME, animationFrameId: null, startTimeStamp: 0 };
let draggedItem = null;  // { source: 'sidebar'|'timeline', skillId/instanceId, type: 'skill'|'mechanic' }
window.isDraggingInProgress = false;
let currentDutyCategory = '';
let currentUltimatePhaseStarts = {};
let activeTab = 'mit';
let comparePlayers = [];

// Buff Mapping for FFXIV alignment
const BUFF_MAP = {
  // Tank
  '戰逃反應': { duration: 20, color: 'rgba(255, 71, 87, 0.45)', label: '戰逃反應 (+25%)' },
  '解放': { duration: 15, color: 'rgba(255, 71, 87, 0.45)', label: '解放 (直擊暴擊)' },
  '血血狂暴': { duration: 15, color: 'rgba(128, 0, 128, 0.45)', label: '血狂' },
  '無情': { duration: 20, color: 'rgba(255, 170, 0, 0.45)', label: '無情 (+20%)' },
  // Healer
  '連環計': { duration: 15, color: 'rgba(0, 180, 255, 0.45)', label: '連環計 (暴擊率+10%)' },
  '占卜': { duration: 15, color: 'rgba(255, 215, 0, 0.45)', label: '占卜 (傷害+6%)' },
  // Melee
  '義結金蘭': { duration: 15, color: 'rgba(255, 105, 180, 0.45)', label: '義結金蘭 (傷害+5%)' },
  '奪取': { duration: 20, color: 'rgba(138, 43, 226, 0.45)', label: '奪取 (傷害+5%)' },
  '背刺': { duration: 15, color: 'rgba(255, 69, 0, 0.4)', label: '背刺 (自身+10%)' },
  '戰鬥連禱': { duration: 15, color: 'rgba(0, 206, 209, 0.45)', label: '戰鬥連禱 (暴擊率+10%)' },
  // Ranged
  '戰嚎': { duration: 15, color: 'rgba(50, 205, 50, 0.45)', label: '戰嚎 (直擊率+20%)' },
  '光明神的神意之歌': { duration: 15, color: 'rgba(218, 112, 214, 0.45)', label: '神意歌 (傷害最高+6%)' },
  '技巧舞步結束': { duration: 20, color: 'rgba(255, 20, 147, 0.45)', label: '技巧舞步 (傷害+5%)' },
  // Caster
  '無間地獄': { duration: 20, color: 'rgba(75, 0, 130, 0.45)', label: '無間地獄 (傷害+3%)' },
  '鼓勵': { duration: 20, color: 'rgba(220, 20, 60, 0.45)', label: '鼓勵 (魔法傷害+5%)' },
  '灼熱之光': { duration: 30, color: 'rgba(255, 69, 0, 0.45)', label: '灼熱之光 (傷害+3%)' },
  '星空構想': { duration: 20, color: 'rgba(199, 125, 255, 0.45)', label: '星空構想 (+5%)' }
};

// DOM Query Selectors
const jobSelect = document.getElementById('job-select');
const dutySelect = document.getElementById('duty-select');
const gcdInput = document.getElementById('gcd-input');
const skillsList = document.getElementById('skills-list');
const searchInput = document.getElementById('skill-search');
const filterTabs = document.querySelectorAll('.filter-tabs .tab-btn');
const timelineEditor = document.getElementById('timeline-editor');
const timelineRuler = document.getElementById('timeline-ruler');
const playhead = document.getElementById('playhead');

// Tracks
const bossTrack = document.getElementById('boss-track');
let buffTrack = null;
let gcdTrack = null;
let ogcdTrack = null;
const dragTrash = document.getElementById('drag-trash');

// Buttons
const btnImportMenu = document.getElementById('btn-import-menu');
const btnExportMenu = document.getElementById('btn-export-menu');
const btnClear = document.getElementById('btn-clear');
const btnAddMechanic = document.getElementById('btn-add-mechanic');

// Tab Switching & Import Elements
const tabBtnMit = document.getElementById('tab-btn-mit');
const tabBtnTimeline = document.getElementById('tab-btn-timeline');
const tabBtnCompare = document.getElementById('tab-btn-compare');
const mitPlanningView = document.getElementById('mit-planning-view');
const timelineWorkspaceView = document.getElementById('timeline-workspace-view');
const compareWorkspaceView = document.getElementById('compare-workspace-view');
const timelineToolbar = document.getElementById('timeline-toolbar');
// Active Downtime (Untargetable) Intervals: [{ start, end }, ...]
let activeDowntimeIntervals = [];
window.activeDowntimeIntervals = activeDowntimeIntervals;

// Personal Timeline Undo Stack (Max 10 steps)
const MAX_PERSONAL_UNDO_STACK = 10;
let personalUndoStack = [];

function pushPersonalUndoState() {
  const state = {
    timelineSkills: JSON.parse(JSON.stringify(timelineSkills)),
    bossMechanics: JSON.parse(JSON.stringify(bossMechanics)),
    activeTimelinesCount: activeTimelinesCount,
    timelinePlayers: JSON.parse(JSON.stringify(timelinePlayers))
  };
  personalUndoStack.push(state);
  if (personalUndoStack.length > MAX_PERSONAL_UNDO_STACK) {
    personalUndoStack.shift();
  }
  updatePersonalUndoButton();
}

function executePersonalUndo() {
  if (personalUndoStack.length === 0) return;
  const state = personalUndoStack.pop();
  timelineSkills = state.timelineSkills || [];
  bossMechanics = state.bossMechanics || [];
  activeTimelinesCount = state.activeTimelinesCount || 1;
  timelinePlayers = state.timelinePlayers || [null, null, null];
  recalculateTimeline();
  renderTimeline();
  autoSave();
  updatePersonalUndoButton();
}

function clearPersonalUndoStack() {
  personalUndoStack = [];
  updatePersonalUndoButton();
}

function updatePersonalUndoButton() {
  const btn = document.getElementById('btn-undo');
  if (btn) {
    btn.disabled = (personalUndoStack.length === 0);
  }
}

window.pushPersonalUndoState = pushPersonalUndoState;
window.executePersonalUndo = executePersonalUndo;
window.clearPersonalUndoStack = clearPersonalUndoStack;

// Global keyboard shortcut for Ctrl+Z / Cmd+Z
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    const activeElem = document.activeElement;
    if (activeElem && (activeElem.tagName === 'INPUT' || activeElem.tagName === 'TEXTAREA' || activeElem.isContentEditable)) {
      return;
    }
    
    e.preventDefault();
    if (typeof activeTab !== 'undefined' && activeTab === 'mit') {
      if (typeof window.executeMitUndo === 'function') {
        window.executeMitUndo();
      }
    } else {
      executePersonalUndo();
    }
  }
});

// --- Report missing duty downtime to Supabase ---
async function checkAndReportDutyDowntime(dutyKey, dutyName, encounterId, downtimeIntervals, fflogsUrl) {
  const sb = window.supabaseClient;
  if (!sb || downtimeIntervals.length === 0) return;

  try {
    const key = dutyKey || 'custom_duty';
    const localDuty = (typeof mitDutiesDatabase !== 'undefined' && mitDutiesDatabase[key]) ? mitDutiesDatabase[key] : null;
    const hasLocalDowntime = localDuty && localDuty.downtimes && localDuty.downtimes.length > 0;

    if (!hasLocalDowntime) {
      const { error } = await sb
        .from('duty_downtime_reports')
        .insert([{
          duty_key: key,
          duty_name: dutyName || key,
          encounter_id: encounterId || null,
          downtime_periods: downtimeIntervals,
          fflogs_url: fflogsUrl || null,
          status: 'pending'
        }]);
      if (error) {
        console.log('[Downtime Report] Notice:', error.message);
      } else {
        console.log('[Downtime Report] Reported missing downtime for duty:', key);
      }
    }
  } catch (err) {
    console.error('[Downtime Report] Error:', err);
  }
}
window.checkAndReportDutyDowntime = checkAndReportDutyDowntime;

// Tooltip & Modals
const tooltip = document.getElementById('skill-tooltip');
const fileImportInput = document.getElementById('file-import-input');
const savesModal = document.getElementById('saves-modal');
const savesList = document.getElementById('saves-list');
const savesModalClose = document.getElementById('saves-modal-close');

// Option Modals
const importOptionsModal = document.getElementById('import-options-modal');
const importOptionsClose = document.getElementById('import-options-close');
const exportOptionsModal = document.getElementById('export-options-modal');
const exportOptionsClose = document.getElementById('export-options-close');

// Option Buttons
const importOptMit = document.getElementById('import-opt-mit');
const importOptJson = document.getElementById('import-opt-json');
const importOptFflogs = document.getElementById('import-opt-fflogs');
const importOptFflogsApi = document.getElementById('import-opt-fflogs-api');

const exportOptJson = document.getElementById('export-opt-json');
const exportOptText = document.getElementById('export-opt-text');
const exportOptImg = document.getElementById('export-opt-img');
const fflogsModal = document.getElementById('fflogs-modal');
const fflogsModalClose = document.getElementById('fflogs-modal-close');
const btnFflogsCancel = document.getElementById('btn-fflogs-cancel');
const btnFflogsSubmit = document.getElementById('btn-fflogs-submit');
const fflogsPasteArea = document.getElementById('fflogs-paste-area');
const fflogsPlayerName = document.getElementById('fflogs-player-name');
const fflogsClearTimeline = document.getElementById('fflogs-clear-timeline');


// Load Data and Initialize
async function initTimelineApp() {
  try {
    const response = await fetch('./data/jobs_skills.json');
    if (!response.ok) throw new Error('無法讀取技能資料庫！請先執行 scraper.js');
    skillsDatabase = await response.json();
    window.skillsDatabase = skillsDatabase;
    window.bossMechanics = bossMechanics;
    
    // Inject general Potion skill to all jobs
    const potionSkill = {
      id: "potion",
      name: "爆發藥",
      level: "1級",
      classification: "能力",
      cast: "即時",
      recast: "270秒",
      cost: "-",
      range: "0m 0m",
      effect: "使用爆發藥提高屬性 (持續 30 秒)",
      icon: "https://xivapi.com/i/020000/020701_hr1.png",
      aliases: [
        "grade 2 gemdraught of intelligence",
        "grade 2 gemdraught of strength",
        "grade 2 gemdraught of dexterity",
        "grade 2 gemdraught of mind",
        "grade 1 gemdraught of intelligence",
        "grade 1 gemdraught of strength",
        "grade 1 gemdraught of dexterity",
        "grade 1 gemdraught of mind",
        "grade 8 tincture of strength",
        "grade 8 tincture of dexterity",
        "grade 8 tincture of intelligence",
        "grade 8 tincture of mind",
        "grade 7 tincture of strength",
        "grade 7 tincture of dexterity",
        "grade 7 tincture of intelligence",
        "grade 7 tincture of mind",
        "grade 6 tincture of strength",
        "grade 6 tincture of dexterity",
        "grade 6 tincture of intelligence",
        "grade 6 tincture of mind",
        "grade 5 tincture of strength",
        "grade 5 tincture of dexterity",
        "grade 5 tincture of intelligence",
        "grade 5 tincture of mind",
        "potion",
        "tincture",
        "gemdraught"
      ]
    };
    for (const jobKey in skillsDatabase) {
      if (skillsDatabase[jobKey] && skillsDatabase[jobKey].skills) {
        skillsDatabase[jobKey].skills.push(potionSkill);
      }
    }
    
    // 嘗試讀取副本時間軸索引檔
    try {
      const dutyResp = await fetch('./data/duties/index.json');
      if (dutyResp.ok) {
        dutiesDatabase = await dutyResp.json();
        populateDutyDropdown(dutiesDatabase);
      }
    } catch (e) {
      console.warn('無法讀取副本資料庫:', e);
    }
    
    populateJobDropdown();
    setupEventListeners();
  } catch (error) {
    console.error(error);
    if (skillsList) skillsList.innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><p>${error.message}</p></div>`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTimelineApp);
} else {
  initTimelineApp();
}

// Helper: Parse time string to seconds
function parseTimeToSeconds(timeStr) {
  if (!timeStr) return 0;
  if (timeStr.includes('即時')) return 0;
  const match = timeStr.match(/([0-9.]+)\s*秒/);
  return match ? parseFloat(match[1]) : 0;
}

// 1. Setup Dropdown List
function populateJobDropdown() {
  const groups = {
    tank: document.getElementById('tank-group'),
    healer: document.getElementById('healer-group'),
    melee: document.getElementById('melee-group'),
    ranged: document.getElementById('ranged-group'),
    caster: document.getElementById('caster-group')
  };
  
  // Clear groups
  Object.values(groups).forEach(g => g.innerHTML = '');
  
  Object.values(skillsDatabase).forEach(job => {
    const opt = document.createElement('option');
    opt.value = job.id;
    opt.textContent = job.name;
    if (groups[job.category]) {
      groups[job.category].appendChild(opt);
    }
  });
  
  syncCustomDropdown(jobSelect);
}

// 1b. Setup Duty Dropdown List
function populateDutyDropdown(dutiesData, selectedValue = '') {
  if (!dutySelect) return;
  
  // Clear existing options except default one
  dutySelect.innerHTML = '<option value="">無副本 (自訂時間軸)</option>';
  
  const categories = dutiesData.categories || {};
  const duties = dutiesData.duties || [];
  
  // Group duties by category
  const dutiesByCategory = {};
  duties.forEach(duty => {
    if (!dutiesByCategory[duty.category]) {
      dutiesByCategory[duty.category] = [];
    }
    dutiesByCategory[duty.category].push(duty);
  });
  
  // Create grouped options under optgroups (in original category order)
  Object.keys(dutiesByCategory).forEach(catKey => {
    const catLabel = categories[catKey]?.label || catKey;
    const optgroup = document.createElement('optgroup');
    optgroup.label = catLabel;
    
    dutiesByCategory[catKey].forEach(duty => {
      const opt = document.createElement('option');
      opt.value = duty.file;
      opt.textContent = duty.name;
      if (duty.file === selectedValue) {
        opt.selected = true;
      }
      optgroup.appendChild(opt);
    });
    
    dutySelect.appendChild(optgroup);
  });

  // Sync with our custom dropdown
  syncCustomDropdown(dutySelect, dutiesData);
}

// Helper: Parse MM:SS to seconds
function parseDutyTime(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
  }
  return parseFloat(timeStr) || 0;
}

// Load pre-defined duty timeline into boss track
function loadDutyTimeline(dutyData) {
  if (!dutyData || !dutyData.timeline) return;
  
  bossMechanics = [];
  
  if (dutyData.downtimes || dutyData.downtime) {
    activeDowntimeIntervals = dutyData.downtimes || dutyData.downtime;
    window.activeDowntimeIntervals = activeDowntimeIntervals;
  } else {
    activeDowntimeIntervals = [];
    window.activeDowntimeIntervals = [];
  }
  
  dutyData.timeline.forEach((item, index) => {
    // Parse time
    const time = parseDutyTime(item.castingTime || item.hitTime);
    
    // Construct name
    let name = item.skill;
    if (name === 'AA') {
      name = '普通攻擊 (AA)';
    }
    
    if (!name) {
      if (item.variants && item.variants.length > 0) {
        name = item.variants.map(v => v.skill).join(' / ');
      } else {
        name = item.commonDesc || item.phase || '未命名機制';
      }
    }
    
    // Create unique ID
    const id = 'mech_duty_' + index + '_' + Date.now();
    
    bossMechanics.push({
      id,
      time,
      name
    });
  });
  
  recalculateTimeline();
  if (activeTab === 'compare') {
    renderCompareTimeline();
  } else {
    renderTimeline();
  }
  autoSave();
  
  // Auto-scroll to the first boss mechanic to prevent blank screen confusion
  if (bossMechanics.length > 0) {
    const earliestTime = Math.min(...bossMechanics.map(m => m.time));
    setTimeout(() => {
      scrollToTime(earliestTime - 2);
    }, 100);
  }
}

// Load boss mechanics from database, handles combining phases for Ultimate duties
async function loadDuty(dutyFile, forceScroll = true) {
  if (!dutyFile) {
    bossMechanics = [];
    currentDutyCategory = '';
    currentUltimatePhaseStarts = {};
    recalculateTimeline();
    renderTimeline();
    autoSave();
    return;
  }

  const dutiesData = dutiesDatabase.duties || [];
  const selectedDuty = dutiesData.find(d => d.file === dutyFile || d.key === dutyFile);
  if (!selectedDuty) return;

  const isUltimate = selectedDuty.category && selectedDuty.category.startsWith('ultimate');

  if (isUltimate) {
    if (currentDutyCategory === selectedDuty.category) {
      // Switching phase within the same Ultimate
      currentDutyFile = selectedDuty.file;
      if (dutySelect) {
        dutySelect.value = currentDutyFile;
        populateDutyDropdown(dutiesDatabase, currentDutyFile);
      }
      if (forceScroll) {
        const startSec = currentUltimatePhaseStarts[currentDutyFile] || 0;
        scrollToTime(startSec - 2);
      }
      autoSave();
      return;
    }

    // Load all phases of the ultimate (exclude duplicate "all" files)
    const phaseDuties = dutiesData.filter(d => d.category === selectedDuty.category && !d.key.toLowerCase().includes('all'));
    let combinedTimeline = [];
    currentUltimatePhaseStarts = {};
    
    for (const pd of phaseDuties) {
      const resp = await fetch(`./data/duties/${pd.file}`);
      if (resp.ok) {
        const dData = await resp.json();
        if (dData && dData.timeline) {
          combinedTimeline.push(...dData.timeline);
          const times = dData.timeline.map(m => parseDutyTime(m.castingTime || m.hitTime));
          if (times.length > 0) {
            currentUltimatePhaseStarts[pd.file] = Math.min(...times);
          } else {
            currentUltimatePhaseStarts[pd.file] = 0;
          }
        }
      }
    }

    // Sort combinedTimeline by hitTime/castingTime
    combinedTimeline.sort((a, b) => {
      const tA = parseDutyTime(a.castingTime || a.hitTime);
      const tB = parseDutyTime(b.castingTime || b.hitTime);
      return tA - tB;
    });

    currentDutyFile = selectedDuty.file;
    currentDutyCategory = selectedDuty.category;
    
    loadDutyTimeline({ timeline: combinedTimeline });
    
    if (forceScroll) {
      const startSec = currentUltimatePhaseStarts[currentDutyFile] || 0;
      setTimeout(() => {
        scrollToTime(startSec - 2);
      }, 150);
    }
  } else {
    // Normal duty
    currentDutyCategory = '';
    currentUltimatePhaseStarts = {};
    const response = await fetch(`./data/duties/${selectedDuty.file}`);
    if (!response.ok) throw new Error('無法載入副本資料');
    const dutyData = await response.json();
    currentDutyFile = selectedDuty.file;
    loadDutyTimeline(dutyData);
  }
}

// 2. Setup Event Listeners
function setupEventListeners() {
  // Global dragstart and dragend listeners to manage dragging status
  document.addEventListener('dragstart', () => {
    window.isDraggingInProgress = true;
    const tooltipEl = document.getElementById('skill-tooltip');
    if (tooltipEl) tooltipEl.style.display = 'none';
  });
  document.addEventListener('dragend', () => {
    window.isDraggingInProgress = false;
    draggedItem = null;
  });
  // Tab Switcher event listeners
  if (tabBtnMit && tabBtnTimeline && tabBtnCompare) {
    tabBtnMit.addEventListener('click', () => {
      activeTab = 'mit';
      tabBtnMit.classList.add('active');
      tabBtnTimeline.classList.remove('active');
      tabBtnCompare.classList.remove('active');
      mitPlanningView.classList.remove('hidden');
      timelineWorkspaceView.classList.add('hidden');
      compareWorkspaceView.classList.add('hidden');
      timelineToolbar.classList.add('hidden');
      window.trackEvent('navigation', 'tab_switch', { target: '團隊技能排軸', code: 'team' });
    });

    tabBtnTimeline.addEventListener('click', () => {
      activeTab = 'personal';
      tabBtnTimeline.classList.add('active');
      tabBtnMit.classList.remove('active');
      tabBtnCompare.classList.remove('active');
      timelineWorkspaceView.classList.remove('hidden');
      timelineToolbar.classList.remove('hidden');
      mitPlanningView.classList.add('hidden');
      compareWorkspaceView.classList.add('hidden');
      
      // Show all personal toolbar items
      document.getElementById('job-select-group').style.display = '';
      document.getElementById('btn-cloud-save').style.display = '';
      document.getElementById('btn-cloud-load').style.display = '';
      document.getElementById('btn-export-menu').style.display = '';
      document.getElementById('btn-add-timeline-track').style.display = '';
      document.getElementById('toolbar-divider').style.display = '';
      if (btnImportMenu) {
        btnImportMenu.innerHTML = `<i class="fa-solid fa-file-import"></i> 匯入`;
      }
      
      window.trackEvent('navigation', 'tab_switch', { target: '個人技能排軸', code: 'personal' });
    });

    tabBtnCompare.addEventListener('click', () => {
      activeTab = 'compare';
      tabBtnCompare.classList.add('active');
      tabBtnMit.classList.remove('active');
      tabBtnTimeline.classList.remove('active');
      compareWorkspaceView.classList.remove('hidden');
      timelineToolbar.classList.remove('hidden');
      mitPlanningView.classList.add('hidden');
      timelineWorkspaceView.classList.add('hidden');
      
      // Hide irrelevant personal toolbar items
      document.getElementById('job-select-group').style.display = 'none';
      document.getElementById('btn-cloud-save').style.display = 'none';
      document.getElementById('btn-cloud-load').style.display = 'none';
      document.getElementById('btn-export-menu').style.display = 'none';
      document.getElementById('btn-add-timeline-track').style.display = 'none';
      document.getElementById('toolbar-divider').style.display = 'none';
      if (btnImportMenu) {
        btnImportMenu.innerHTML = `<i class="fa-solid fa-file-import"></i> 匯入FFLog`;
      }
      
      renderCompareTimeline();
      window.trackEvent('navigation', 'tab_switch', { target: '多人施法比較', code: 'compare' });
    });
  }

  // MacroMate 巨集小幫手 入口按鈕
  const macromateBtn = document.getElementById('macromate-btn');
  if (macromateBtn) {
    macromateBtn.addEventListener('click', async () => {
      window.trackEvent?.('navigation', 'macromate_btn_click');
      const ok = await window.showCustomConfirm(
        '是否要前往巨集小幫手？',
        '點擊確定將另開視窗',
        '取消',
        '確定'
      );
      if (ok) {
        window.trackEvent?.('navigation', 'macromate_confirm');
        window.open('https://infanta0127-star.github.io/MacroMate/', '_blank', 'noopener');
      } else {
        window.trackEvent?.('navigation', 'macromate_cancel');
      }
    });
  }

  // Import from team mitigation planner event listener
  if (importOptMit) {
    importOptMit.addEventListener('click', () => {
      importOptionsModal.classList.remove('active');
      window.trackEvent('personal_planner', 'click_import_from_team_btn');
      if (!window.mitParty || !window.mitTimelineSkills) {
        alert('尚未在團隊排軸頁籤中規劃技能，請先在「團隊技能排軸」中規劃。');
        return;
      }
      const mappedData = {
        duty: document.getElementById('mit-duty-select').value,
        party: window.mitParty,
        mits: window.mitTimelineSkills,
        customMechanics: window.mitBossMechanics || []
      };
      importFfxivMitigationPlan(mappedData);
    });
  }

  // Hook up Tab 2 Cloud Save & Load
  const btnCloudSave = document.getElementById('btn-cloud-save');
  const btnCloudLoad = document.getElementById('btn-cloud-load');

  if (btnCloudSave) {
    btnCloudSave.addEventListener('click', saveIndivPlanToSupabase);
  }
  if (btnCloudLoad) {
    btnCloudLoad.addEventListener('click', () => { savesModalMode = 'load'; loadIndivPlansModal(); });
  }

  // Job selection change
  jobSelect.addEventListener('change', async (e) => {
    if (timelineSkills.length > 0) {
      const ok = await window.showCustomConfirm('切換職業', '切換職業將清空目前的時間軸，確定要繼續嗎？');
      if (!ok) {
        jobSelect.value = currentJobId;
        syncCustomDropdown(jobSelect);
        return;
      }
    }
    currentJobId = e.target.value;
    timelineSkills = [];
    bossMechanics = [];
    importedPlayerName = null;
    activeTimelinesCount = 1;
    timelinePlayers = [null, null, null];
    loadJobSkills(currentJobId);
    recalculateTimeline();
    renderTimeline();
    autoSave();
  });

  // Duty selection change
  dutySelect.addEventListener('change', async (e) => {
    const dutyFile = e.target.value;
    populateDutyDropdown(dutiesDatabase, dutyFile);
    
    const dutiesData = dutiesDatabase.duties || [];
    const selectedDuty = dutiesData.find(d => d.file === dutyFile);
    const currentDuty = dutiesData.find(d => d.file === currentDutyFile);
    const isSameUltimate = selectedDuty && currentDuty &&
                           selectedDuty.category && selectedDuty.category.startsWith('ultimate') &&
                           selectedDuty.category === currentDuty.category;
    
    if (!isSameUltimate && bossMechanics.length > 0 && !confirm('載入新副本將清空目前首領機制軌道，確定要繼續嗎？')) {
      dutySelect.value = currentDutyFile;
      populateDutyDropdown(dutiesDatabase, currentDutyFile);
      return;
    }
    
    try {
      clearPersonalUndoStack();
      await loadDuty(dutyFile);
    } catch (err) {
      console.error(err);
      alert('載入副本失敗: ' + err.message);
      dutySelect.value = '';
      currentDutyFile = '';
      populateDutyDropdown(dutiesDatabase, '');
    }
  });

  // GCD Input change
  gcdInput.addEventListener('change', (e) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val) || val < 1.50) val = 1.50;
    if (val > 3.00) val = 3.00;
    e.target.value = val.toFixed(2);
    timelineGCDDuration = val;
    
    // Set custom property on HTML element to scale background slots
    document.documentElement.style.setProperty('--gcd-val', val);
    
    recalculateTimeline();
    renderTimeline();
    autoSave();
  });

  // Sidebar Tabs Filter
  filterTabs.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterTabs.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      filterSidebarSkills();
    });
  });

  // Search filter
  searchInput.addEventListener('input', filterSidebarSkills);

  // Action Menus
  if (btnImportMenu) {
    btnImportMenu.addEventListener('click', () => {
      if (activeTab === 'compare') {
        window.trackEvent('多人比較', 'click_import_fflogs_btn');
        openFFLogsApiModal();
      } else {
        importOptionsModal.classList.add('active');
      }
    });
  }
  if (importOptionsClose) {
    importOptionsClose.addEventListener('click', () => {
      importOptionsModal.classList.remove('active');
    });
  }
  
  if (btnExportMenu) {
    btnExportMenu.addEventListener('click', () => {
      exportOptionsModal.classList.add('active');
    });
  }
  if (exportOptionsClose) {
    exportOptionsClose.addEventListener('click', () => {
      exportOptionsModal.classList.remove('active');
    });
  }

  // Import Options
  if (importOptJson) {
    importOptJson.addEventListener('click', () => {
      importOptionsModal.classList.remove('active');
      fileImportInput.click();
    });
  }
  fileImportInput.addEventListener('change', importTimelineJSON);

  if (importOptFflogsApi) {
    importOptFflogsApi.addEventListener('click', () => {
      importOptionsModal.classList.remove('active');
      window.trackEvent('個人排軸', 'click_import_fflogs_btn');
      openFFLogsApiModal();
    });
  }

  if (fflogsModalClose) {
    fflogsModalClose.addEventListener('click', () => fflogsModal.classList.remove('active'));
  }

  if (btnFflogsCancel) {
    btnFflogsCancel.addEventListener('click', () => fflogsModal.classList.remove('active'));
  }

  if (btnFflogsSubmit) {
    btnFflogsSubmit.addEventListener('click', () => {
      const text = fflogsPasteArea.value;
      if (!text.trim()) {
        alert('請貼上 FF Logs 事件文字！');
        return;
      }
      const playerName = fflogsPlayerName.value.trim();
      const clearBefore = fflogsClearTimeline.checked;
      
      (async () => {
        try {
          let targetTimelineId = 1;
          let autoClear = clearBefore;
          
          if (timelineSkills.length > 0) {
            const choice = await promptImportTargetChoice();
            if (!choice) return; // Cancelled
            if (choice.action === 'new') {
              activeTimelinesCount++;
              targetTimelineId = activeTimelinesCount;
              autoClear = false;
            } else {
              targetTimelineId = choice.timelineId;
              autoClear = true;
            }
          }
          
          const count = importFflogsEvents(text, playerName, autoClear, targetTimelineId);
          if (count > 0) {
            alert(`已成功解析並匯入 ${count} 個技能事件！`);
            fflogsModal.classList.remove('active');
          } else {
            alert('解析失敗：找不到符合當前特職的技能事件。請確認您貼上的文字格式正確且包含您的特職技能。');
          }
        } catch (err) {
          alert(`匯入出錯: ${err.message}`);
        }
      })();
    });
  }

  // Export Options
  if (exportOptJson) {
    exportOptJson.addEventListener('click', () => {
      exportOptionsModal.classList.remove('active');
      exportTimelineJSON();
    });
  }

  if (exportOptText) {
    exportOptText.addEventListener('click', () => {
      exportOptionsModal.classList.remove('active');
      copyTextTimeline();
    });
  }

  if (exportOptImg) {
    exportOptImg.addEventListener('click', () => {
      exportOptionsModal.classList.remove('active');
      downloadTimelineImage();
    });
  }

  const btnUndo = document.getElementById('btn-undo');
  if (btnUndo) {
    btnUndo.addEventListener('click', () => {
      executePersonalUndo();
    });
  }

  btnClear.addEventListener('click', () => {
    if (confirm('確定要清空時間軸嗎？')) {
      clearPersonalUndoStack();
      timelineSkills = [];
      bossMechanics = [];
      importedPlayerName = null;
      activeTimelinesCount = 1;
      timelinePlayers = [null, null, null];
      recalculateTimeline();
      renderTimeline();
      autoSave();
    }
  });

  // Add Boss Mechanic Button
  btnAddMechanic.addEventListener('click', () => {
    const name = prompt('請輸入機制名稱（例如：全體AOE、死刑、分攤）:');
    if (!name) return;
    
    // Position it at the end of the ruler or 5s if empty
    let time = 5.0;
    if (bossMechanics.length > 0) {
      time = Math.max(...bossMechanics.map(m => m.time)) + 5.0;
    }
    
    pushPersonalUndoState();
    bossMechanics.push({
      id: 'mech_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      time: Math.round(time),
      name: name
    });
    
    renderTimeline();
    autoSave();
  });

  // Modal Close Events
  savesModalClose.addEventListener('click', () => savesModal.classList.remove('active'));
  const choiceModal = document.getElementById('fflogs-import-choice-modal');
  window.addEventListener('click', (e) => {
    if (e.target === savesModal) savesModal.classList.remove('active');
    if (e.target === fflogsModal) fflogsModal.classList.remove('active');
    if (e.target === importOptionsModal) importOptionsModal.classList.remove('active');
    if (e.target === exportOptionsModal) exportOptionsModal.classList.remove('active');
    if (e.target === choiceModal) choiceModal.classList.remove('active');
  });

  // Drag and drop events for tracks (Boss track only, GCD/oGCD bound dynamically)
  bossTrack.addEventListener('dragover', (e) => {
    e.preventDefault();
    bossTrack.classList.add('drag-hover');
  });
  bossTrack.addEventListener('dragleave', () => {
    bossTrack.classList.remove('drag-hover');
  });
  bossTrack.addEventListener('drop', (e) => {
    e.preventDefault();
    bossTrack.classList.remove('drag-hover');
    handleDrop(e, bossTrack.dataset.trackType, 1);
  });

  // Add Timeline Track Button
  const btnAddTimelineTrack = document.getElementById('btn-add-timeline-track');
  if (btnAddTimelineTrack) {
    btnAddTimelineTrack.addEventListener('click', () => {
      if (activeTimelinesCount >= 3) {
        showToast('⚠️ 最多只能新增 3 條時間軸記錄');
        return;
      }
      pushPersonalUndoState();
      activeTimelinesCount++;
      recalculateTimeline();
      renderTimeline();
      autoSave();
      showToast(`✅ 已新增排軸 ${activeTimelinesCount}`);
    });
  }

  // Trash Bin Drag-Drop
  dragTrash.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragTrash.classList.add('drag-hover');
  });
  
  dragTrash.addEventListener('dragleave', () => {
    dragTrash.classList.remove('drag-hover');
  });
  
  dragTrash.addEventListener('drop', (e) => {
    e.preventDefault();
    dragTrash.classList.remove('drag-hover');
    handleTrashDrop(e);
  });

  // Enable horizontal scrolling with mouse wheel on timeline containers
  const outerContainers = document.querySelectorAll('.timeline-container-outer');
  outerContainers.forEach(container => {
    container.addEventListener('wheel', (e) => {
      // If team planner is in vertical grid mode, let it scroll vertically natively
      const mitEditor = container.querySelector('#mit-timeline-editor');
      if (mitEditor && mitEditor.classList.contains('vertical-grid-mode')) {
        return;
      }
      
      if (e.deltaY !== 0) {
        e.preventDefault();
        if (e.ctrlKey) {
          container.scrollTop += e.deltaY;
        } else {
          container.scrollLeft += e.deltaY;
        }
      }
    }, { passive: false });
  });
}

// 3. Load skills into left sidebar
function loadJobSkills(jobId) {
  const job = skillsDatabase[jobId];
  if (!job) return;
  
  skillsList.innerHTML = '';
  
  job.skills.forEach(skill => {
    const card = document.createElement('div');
    card.className = 'skill-card';
    card.draggable = true;
    card.dataset.skillId = skill.id;
    
    // Set classification type color
    let typeColor = 'var(--color-text-muted)';
    if (skill.id.includes('tank_action') || skill.id.includes('healer_action') || skill.id.includes('melee_action') || skill.id.includes('ranged_action') || skill.id.includes('caster_action')) {
      typeColor = 'var(--color-role)';
    } else if (skill.classification === '戰技' || skill.classification === '魔法') {
      typeColor = 'var(--color-gcd)';
    } else if (skill.classification === '能力') {
      typeColor = 'var(--color-ogcd)';
    }
    card.style.setProperty('--type-color', typeColor);
    
    card.innerHTML = `
      <img class="skill-card-icon" src="${skill.icon}" alt="${skill.name}" onerror="this.src='https://via.placeholder.com/40'">
      <div class="skill-card-info">
        <span class="skill-card-name">${skill.name}</span>
        <div class="skill-card-meta">
          <span>${skill.classification}</span>
          <span>Lv.${skill.level}</span>
        </div>
      </div>
    `;
    
    // Click card to append to timeline
    card.addEventListener('click', () => {
      appendSkillToTimeline(skill);
    });

    // Drag start
    card.addEventListener('dragstart', (e) => {
      window.isDraggingInProgress = true;
      hideTooltip();
      draggedItem = { source: 'sidebar', skillId: skill.id, type: 'skill' };
      card.classList.add('dragging');
      e.dataTransfer.setData('text/plain', skill.id);
    });
    
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });

    // Mouse over for tooltip
    card.addEventListener('mousemove', (e) => showTooltip(e, skill));
    card.addEventListener('mouseleave', hideTooltip);

    skillsList.appendChild(card);
  });
  
  filterSidebarSkills();
}

// 4. Sidebar search and tab filters
function filterSidebarSkills() {
  const activeTab = document.querySelector('.filter-tabs .tab-btn.active').dataset.filter;
  const searchText = searchInput.value.toLowerCase().trim();
  const cards = skillsList.querySelectorAll('.skill-card');
  
  let matchCount = 0;
  
  cards.forEach(card => {
    const skillId = card.dataset.skillId;
    const skill = skillsDatabase[currentJobId].skills.find(s => s.id === skillId);
    if (!skill) return;
    
    const matchesSearch = skill.name.toLowerCase().includes(searchText) || skill.effect.toLowerCase().includes(searchText);
    
    let matchesTab = false;
    if (activeTab === 'all') {
      matchesTab = true;
    } else if (activeTab === 'gcd') {
      matchesTab = (skill.classification === '戰技' || skill.classification === '魔法') && !skillId.includes('action__0'); // Filter out role action GCDs if they exist, keep standard GCD
    } else if (activeTab === 'ogcd') {
      matchesTab = skill.classification === '能力' && !skillId.includes('action__0');
    } else if (activeTab === 'role') {
      matchesTab = skillId.includes('action__0') || skillId.startsWith('tank_action__') || skillId.startsWith('healer_action__') || skillId.startsWith('melee_action__') || skillId.startsWith('ranged_action__') || skillId.startsWith('caster_action__');
    }
    
    if (matchesSearch && matchesTab) {
      card.style.display = 'flex';
      matchCount++;
    } else {
      card.style.display = 'none';
    }
  });

  if (matchCount === 0 && currentJobId) {
    if (!skillsList.querySelector('.empty-search-state')) {
      const empty = document.createElement('div');
      empty.className = 'empty-state empty-search-state';
      empty.innerHTML = `<i class="fa-solid fa-magnifying-glass-minus"></i><p>沒有找到符合條件的技能</p>`;
      skillsList.appendChild(empty);
    }
  } else {
    const empty = skillsList.querySelector('.empty-search-state');
    if (empty) empty.remove();
  }
}

// 5. Append Skill to Timeline (via click)
function appendSkillToTimeline(skill) {
  if (!currentJobId) return;
  
  const parsedRecast = parseTimeToSeconds(skill.recast);
  const parsedCast = parseTimeToSeconds(skill.cast);
  const isGcd = (skill.classification === '戰技' || skill.classification === '魔法');
  
  // Decide track
  const track = isGcd ? 'gcd' : 'ogcd';
  
  let startTime = 0;
  let parentGcdId = null;
  let relativeOffset = 0;
  
  if (isGcd) {
    // Find the end time of the last placed GCD
    const gcds = timelineSkills.filter(s => s.track === 'gcd').sort((a, b) => a.startTime - b.startTime);
    if (gcds.length > 0) {
      const lastGcd = gcds[gcds.length - 1];
      startTime = lastGcd.startTime + lastGcd.duration;
    }
  } else {
    // For oGCD, try to place it at the end of the last GCD's cast time
    const gcds = timelineSkills.filter(s => s.track === 'gcd').sort((a, b) => a.startTime - b.startTime);
    if (gcds.length > 0) {
      const lastGcd = gcds[gcds.length - 1];
      parentGcdId = lastGcd.instanceId;
      
      // Calculate active weave slot offset
      const weavedCount = timelineSkills.filter(s => s.track === 'ogcd' && s.parentGcdId === lastGcd.instanceId).length;
      relativeOffset = parseTimeToSeconds(lastGcd.cast) + (weavedCount * 0.7) + 0.1;
      startTime = lastGcd.startTime + relativeOffset;
    } else {
      // Placing oGCD at current playhead or end of timeline
      const allSkills = timelineSkills.sort((a, b) => a.startTime - b.startTime);
      if (allSkills.length > 0) {
        startTime = allSkills[allSkills.length - 1].startTime + 1.0;
      }
    }
  }
  
  const instanceId = 'skill_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  
  timelineSkills.push({
    instanceId,
    skillId: skill.id,
    name: skill.name,
    icon: skill.icon,
    classification: skill.classification,
    cast: skill.cast,
    recast: skill.recast,
    startTime: Math.round(startTime * 1000) / 1000,
    duration: Math.max(parsedCast, isGcd ? timelineGCDDuration : 0.6),
    track,
    parentGcdId,
    relativeOffset,
    clip: 0,
    idle: 0
  });
  
  recalculateTimeline();
  renderTimeline();
  autoSave();
  
  // Scroll timeline to make the new skill visible
  scrollToTime(startTime);
}

// Calculate effective cast times considering Lightspeed (光速), Swiftcast (迅速詠唱), Triplecast (三重詠唱)
function calculateGcdEffectiveCastTimes(gcds, ogcds) {
  // 1. Gather Lightspeed (光速) active intervals: [{ start, end }]
  const lightspeedIntervals = ogcds
    .filter(o => (o.skillId && (o.skillId.includes('lightspeed') || o.skillId === 'lightspeed')) || (o.name && o.name.includes('光速')))
    .map(o => ({ start: o.startTime, end: o.startTime + 15.0 }));

  // 2. Gather Swiftcast (迅速詠唱) instances: [{ start, end, used: false }]
  const swiftcasts = ogcds
    .filter(o => (o.skillId && o.skillId.includes('swiftcast')) || (o.name && o.name.includes('迅速詠唱')))
    .map(o => ({ start: o.startTime, end: o.startTime + 10.0, used: false }));

  // 3. Gather Triplecast (三重詠唱) instances: [{ start, end, charges: 3 }]
  const triplecasts = ogcds
    .filter(o => (o.skillId && o.skillId.includes('triplecast')) || (o.name && o.name.includes('三重詠唱')))
    .map(o => ({ start: o.startTime, end: o.startTime + 15.0, charges: 3 }));

  for (const gcd of gcds) {
    const rawCast = parseTimeToSeconds(gcd.cast);
    if (rawCast <= 0) {
      gcd.effectiveCast = 0;
      continue;
    }

    let cast = rawCast;

    // Check Lightspeed (光速): reduces cast time by 2.5s
    const isLightspeed = lightspeedIntervals.some(ls => gcd.startTime >= (ls.start - 0.05) && gcd.startTime < ls.end);
    if (isLightspeed) {
      cast = Math.max(0, cast - 2.5);
    }

    // If still has cast time, check Triplecast
    if (cast > 0) {
      const tc = triplecasts.find(t => t.charges > 0 && gcd.startTime >= (t.start - 0.05) && gcd.startTime < t.end);
      if (tc) {
        cast = 0;
        tc.charges--;
      }
    }

    // If still has cast time, check Swiftcast
    if (cast > 0) {
      const sc = swiftcasts.find(s => !s.used && gcd.startTime >= (s.start - 0.05) && gcd.startTime < s.end);
      if (sc) {
        cast = 0;
        sc.used = true;
      }
    }

    gcd.effectiveCast = cast;
  }
}

// 6. Snapping & Weaving Calculation Engine
function recalculateTimeline() {
  for (let tId = 1; tId <= activeTimelinesCount; tId++) {
    const gcds = timelineSkills.filter(s => s.track === 'gcd' && (s.timelineId || 1) === tId).sort((a, b) => a.startTime - b.startTime);
    const ogcds = timelineSkills.filter(s => s.track === 'ogcd' && (s.timelineId || 1) === tId);
    
    // Calculate effective cast times considering Lightspeed / Swiftcast / Triplecast
    calculateGcdEffectiveCastTimes(gcds, ogcds);

    let nextAvailableGcdTime = -PREPULL_TIME;
    
    for (let i = 0; i < gcds.length; i++) {
      const gcd = gcds[i];
      
      // 1. Magnetic snapping: GCDs can't overlap with the previous GCD
      if (gcd.startTime < nextAvailableGcdTime) {
        gcd.startTime = nextAvailableGcdTime;
      }
      
      // Round to 3 decimal places to prevent floating point inaccuracies
      gcd.startTime = Math.round(gcd.startTime * 1000) / 1000;
      
      const parsedRecast = parseTimeToSeconds(gcd.recast);
      const parsedCast = (gcd.effectiveCast !== undefined) ? gcd.effectiveCast : parseTimeToSeconds(gcd.cast);
      const recastVal = resolveGcdRecast(parsedRecast, timelineGCDDuration);
      gcd.duration = Math.max(parsedCast, recastVal);
      
      // 2. Position all oGCDs parented to this GCD block
      const myOgcds = ogcds.filter(o => o.parentGcdId === gcd.instanceId).sort((a, b) => a.relativeOffset - b.relativeOffset);
      
      let currentLockEnd = gcd.startTime + parsedCast;
      
      for (const ogcd of myOgcds) {
        ogcd.startTime = gcd.startTime + ogcd.relativeOffset;
        
        if (ogcd.startTime < gcd.startTime + parsedCast) {
          ogcd.startTime = gcd.startTime + parsedCast;
          ogcd.relativeOffset = ogcd.startTime - gcd.startTime;
        }
        
        if (ogcd.startTime < currentLockEnd) {
          ogcd.startTime = currentLockEnd;
          ogcd.relativeOffset = ogcd.startTime - gcd.startTime;
        }
        
        ogcd.startTime = Math.round(ogcd.startTime * 1000) / 1000;
        ogcd.relativeOffset = Math.round(ogcd.relativeOffset * 1000) / 1000;
        currentLockEnd = ogcd.startTime + 0.6;
      }
      
      // 3. Check for GCD clipping
      const normalGcdEnd = gcd.startTime + gcd.duration;
      if (currentLockEnd > normalGcdEnd) {
        const calculatedClip = currentLockEnd - normalGcdEnd;
        if (calculatedClip >= 2.0) {
          gcd.clip = 0;
          nextAvailableGcdTime = normalGcdEnd;
        } else {
          gcd.clip = calculatedClip;
          nextAvailableGcdTime = currentLockEnd;
        }
      } else {
        gcd.clip = 0;
        nextAvailableGcdTime = normalGcdEnd;
      }
      nextAvailableGcdTime = Math.round(nextAvailableGcdTime * 1000) / 1000;
    }
    
    // 3b. Calculate idle times between GCDs
    for (let i = 0; i < gcds.length; i++) {
      const gcd = gcds[i];
      const normalGcdEnd = gcd.startTime + gcd.duration;
      const currentLockEnd = normalGcdEnd + gcd.clip;
      const availableTime = Math.round(Math.max(normalGcdEnd, currentLockEnd) * 1000) / 1000;
      
      if (i < gcds.length - 1) {
        const nextGcd = gcds[i + 1];
        if (nextGcd.startTime > availableTime) {
          gcd.idle = Math.round((nextGcd.startTime - availableTime) * 1000) / 1000;
        } else {
          gcd.idle = 0;
        }
      } else {
        gcd.idle = 0;
      }
    }
    
    // 4. Place orphaned oGCDs absolutely
    const orphanOgcds = ogcds.filter(o => !o.parentGcdId);
    for (const ogcd of orphanOgcds) {
      ogcd.startTime = Math.round(ogcd.startTime * 1000) / 1000;
    }
  }
}

// 7. Core Rendering Engine
function renderTimeline() {
  document.documentElement.style.setProperty('--pixels-per-second', `${pixelsPerSecond}px`);
  
  // Update the Add Track button state
  const btnAddTimelineTrack = document.getElementById('btn-add-timeline-track');
  if (btnAddTimelineTrack) {
    btnAddTimelineTrack.disabled = (activeTimelinesCount >= 3);
  }

  // 0. Render Dynamic Tracks
  const tracksContainer = document.getElementById('personal-timeline-tracks-container');
  if (tracksContainer) {
    tracksContainer.innerHTML = '';
    for (let i = 1; i <= activeTimelinesCount; i++) {
      const playerName = timelinePlayers[i - 1];
      const isImported = playerName !== null;
      const hoverTitle = isImported ? `匯入玩家: ${playerName}` : `自訂排軸 ${i}`;
      const userTag = isImported ? `<span style="font-size:10px; color:#00f0ff; margin-left:6px;" title="${hoverTitle}"><i class="fa-solid fa-user-tag"></i> ${playerName}</span>` : '';

      const impInfo = timelineImportInfo[i];
      const showAnomaly = impInfo && impInfo.raw && isGcdAnomaly(impInfo.estimatedGcd, timelineGCDDuration);
      const anomalyHint = showAnomaly ? `匯入的 GCD 與預設 ${timelineGCDDuration.toFixed(2)} 不同，推測為「${impInfo.estimatedGcd.toFixed(2)} 秒」` : '';
      const anomalyTag = showAnomaly
        ? `<button class="gcd-anomaly-hint" data-timeline-id="${i}" title="${anomalyHint}" style="background:none; border:none; color:#f59e0b; cursor:pointer; font-size:11px; margin-left:4px; flex-shrink:0;"><i class="fa-solid fa-circle-exclamation"></i></button>`
        : '';

      const groupHtml = `
        <div class="timeline-group" data-timeline-id="${i}" style="border-bottom: 2px solid rgba(255,255,255,0.05); margin-bottom: 8px;">
          <div class="timeline-group-header" style="display:flex; height:24px; background:rgba(255,255,255,0.03); align-items:center;">
            <div class="track-info" style="width:180px; flex-shrink:0; background:#0f1118; border-right:2px solid rgba(255,255,255,0.1); height:100%; display:flex; align-items:center; justify-content:space-between; padding:0 8px 0 12px; font-size:11px; font-weight:bold; color:var(--color-text-muted); sticky:left; left:0; z-index:5; box-shadow:4px 0 10px rgba(0,0,0,0.2); white-space:nowrap; overflow:hidden;">
              <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1; min-width:0;" title="${hoverTitle}">
                排軸 ${i} ${userTag}
              </span>
              ${anomalyTag}
              <button class="btn-delete-timeline-track" data-timeline-id="${i}" title="刪除排軸 ${i}" style="background:none; border:none; color:var(--color-text-muted); cursor:pointer; font-size:11px; padding:2px 6px; border-radius:4px; transition:all 0.2s; flex-shrink:0; margin-left:4px;">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
            <div style="flex:1; border-right: 1px solid rgba(255,255,255,0.05); height:100%;"></div>
          </div>
          
          <!-- Buff Alignment Track -->
          <div class="timeline-track-wrapper buff-track-wrapper">
            <div class="track-info">
              <span class="track-title"><i class="fa-solid fa-wand-magic-sparkles"></i> 團輔覆蓋 (Buffs)</span>
            </div>
            <div class="timeline-track track-content" id="buff-track-${i}" data-track-type="buff" data-timeline-id="${i}"></div>
          </div>
          
          <!-- GCD Skill Track -->
          <div class="timeline-track-wrapper gcd-track-wrapper">
            <div class="track-info">
              <span class="track-title"><i class="fa-solid fa-bolt"></i> 戰技 / 魔法 (GCD)</span>
            </div>
            <div class="timeline-track track-content" id="gcd-track-${i}" data-track-type="gcd" data-timeline-id="${i}">
              <div class="gcd-slots-bg" id="gcd-slots-bg-${i}"></div>
            </div>
          </div>
          
          <!-- oGCD Skill Track -->
          <div class="timeline-track-wrapper ogcd-track-wrapper">
            <div class="track-info">
              <span class="track-title"><i class="fa-solid fa-hourglass-start"></i> 能力技 (oGCD)</span>
            </div>
            <div class="timeline-track track-content" id="ogcd-track-${i}" data-track-type="ogcd" data-timeline-id="${i}"></div>
          </div>
        </div>
      `;
      tracksContainer.innerHTML += groupHtml;
    }

    // Bind GCD anomaly hint「!」(個人排軸僅提示，不做同步)
    tracksContainer.querySelectorAll('.gcd-anomaly-hint').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tid = parseInt(btn.dataset.timelineId, 10);
        const info = timelineImportInfo[tid];
        if (info && info.estimatedGcd != null) {
          showToast(`匯入的 GCD 與預設 ${timelineGCDDuration.toFixed(2)} 不同，推測為「${info.estimatedGcd.toFixed(2)} 秒」`);
        }
      });
    });

    // Bind delete timeline track listeners
    tracksContainer.querySelectorAll('.btn-delete-timeline-track').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const targetId = parseInt(btn.dataset.timelineId, 10);
        if (!targetId) return;

        if (activeTimelinesCount === 1) {
          const ok = await window.showCustomConfirm('清空排軸', '確定要清空排軸 1 的所有技能紀錄嗎？');
          if (!ok) return;
          pushPersonalUndoState();
          timelineSkills = timelineSkills.filter(s => (s.timelineId || 1) !== 1);
          timelinePlayers[0] = null;
          importedPlayerName = null;
          recalculateTimeline();
          renderTimeline();
          autoSave();
          showToast('✅ 已清空排軸 1');
        } else {
          const ok = await window.showCustomConfirm('刪除排軸', `確定要刪除「排軸 ${targetId}」及其所有的技能紀錄嗎？`);
          if (!ok) return;
          pushPersonalUndoState();

          // Remove skills belonging to targetId
          timelineSkills = timelineSkills.filter(s => (s.timelineId || 1) !== targetId);

          // Shift down timelineId for skills > targetId
          timelineSkills.forEach(s => {
            const tId = s.timelineId || 1;
            if (tId > targetId) {
              s.timelineId = tId - 1;
            }
          });

          // Update timelinePlayers array
          timelinePlayers.splice(targetId - 1, 1);
          timelinePlayers.push(null);
          importedPlayerName = timelinePlayers[0];

          activeTimelinesCount = Math.max(1, activeTimelinesCount - 1);
          recalculateTimeline();
          renderTimeline();
          autoSave();
          showToast(`✅ 已刪除排軸 ${targetId}`);
        }
      });
    });
  }

  // 0b. Bind drag-drop listeners to the dynamically created tracks
  for (let i = 1; i <= activeTimelinesCount; i++) {
    const tGcd = document.getElementById(`gcd-track-${i}`);
    const tOgcd = document.getElementById(`ogcd-track-${i}`);
    
    [tGcd, tOgcd].forEach(track => {
      if (!track) return;
      track.addEventListener('dragover', (e) => {
        e.preventDefault();
        track.classList.add('drag-hover');
      });
      track.addEventListener('dragleave', () => {
        track.classList.remove('drag-hover');
      });
      track.addEventListener('drop', (e) => {
        e.preventDefault();
        track.classList.remove('drag-hover');
        const tId = parseInt(track.dataset.timelineId) || 1;
        handleDrop(e, track.dataset.trackType, tId);
      });
    });
  }

  // 0c. Set backward compatibility track references
  buffTrack = document.getElementById('buff-track-1');
  gcdTrack = document.getElementById('gcd-track-1');
  ogcdTrack = document.getElementById('ogcd-track-1');

  // Clean static tracks (boss only)
  bossTrack.innerHTML = '';
  
  // Remove existing boss lines
  const lines = timelineEditor.querySelectorAll('.boss-line');
  lines.forEach(l => l.remove());
  
  // 1. Calculate Timeline Max Width
  let maxTime = 60; // Base 1 min
  timelineSkills.forEach(s => {
    maxTime = Math.max(maxTime, s.startTime + (s.duration || 2.5) + 5);
  });
  bossMechanics.forEach(m => {
    maxTime = Math.max(maxTime, m.time + 10);
  });
  
  const timelineWidth = (maxTime + PREPULL_TIME) * pixelsPerSecond;
  timelineEditor.style.width = `${timelineWidth + 200}px`;
  
  // 2. Draw Ticks in Ruler
  timelineRuler.innerHTML = '';

  for (let t = -PREPULL_TIME; t <= maxTime; t += 0.5) {
    const tick = document.createElement('div');
    tick.style.left = `${180 + (t + PREPULL_TIME) * pixelsPerSecond}px`;
    
    if (t % 5 === 0) {
      tick.className = 'ruler-tick major';
      tick.innerHTML = `<span>${formatTime(t)}</span>`;
    } else if (t % 1 === 0) {
      tick.className = 'ruler-tick minor';
    } else if (pixelsPerSecond >= 80) {
      tick.className = 'ruler-tick subminor';
    } else {
      continue;
    }
    timelineRuler.appendChild(tick);
  }
  
  // 3. Draw Boss Mechanics Track & Vertical Guides
  bossMechanics.forEach(mech => {
    const el = document.createElement('div');
    el.className = 'placed-mechanic';
    el.draggable = true;
    el.dataset.instanceId = mech.id;
    el.style.left = `${(mech.time + PREPULL_TIME) * pixelsPerSecond}px`;
    
    el.innerHTML = `
      <div class="mechanic-time">${formatTime(mech.time)}</div>
      <div class="mechanic-name" title="${mech.name}">${mech.name}</div>
    `;
    
    // Drag handlers
    el.addEventListener('dragstart', (e) => {
      isDraggingInProgress = true;
      hideTooltip();
      draggedItem = { source: 'timeline', instanceId: mech.id, type: 'mechanic' };
      e.dataTransfer.setData('text/plain', mech.id);
    });
    
    // Click to rename
    el.addEventListener('dblclick', () => {
      const newName = prompt('請輸入新的機制名稱:', mech.name);
      if (newName) {
        mech.name = newName;
        renderTimeline();
        autoSave();
      }
    });
    
    bossTrack.appendChild(el);
    
    // Draw vertical guide line
    const guide = document.createElement('div');
    guide.className = 'boss-line';
    guide.style.left = `${180 + (mech.time + PREPULL_TIME) * pixelsPerSecond}px`;
    timelineEditor.appendChild(guide);
  });
  
  // 3b. Draw Combat Start Line (0.0s)
  const startLine = document.createElement('div');
  startLine.className = 'combat-start-line';
  startLine.style.left = `${180 + PREPULL_TIME * pixelsPerSecond}px`;
  
  const startLabel = document.createElement('span');
  startLabel.className = 'combat-start-label';
  startLabel.innerHTML = '<i class="fa-solid fa-flag-checkered"></i> 開怪 (Pull)';
  startLine.appendChild(startLabel);
  timelineEditor.appendChild(startLine);
  
  // 3c. Draw Downtime (Untargetable) Overlays
  const existingDowntimes = timelineEditor.querySelectorAll('.downtime-overlay');
  existingDowntimes.forEach(el => el.remove());

  activeDowntimeIntervals.forEach((dt) => {
    const dtEl = document.createElement('div');
    dtEl.className = 'downtime-overlay';
    dtEl.style.left = `${180 + (dt.start + PREPULL_TIME) * pixelsPerSecond}px`;
    dtEl.style.width = `${(dt.end - dt.start) * pixelsPerSecond}px`;
    
    dtEl.innerHTML = `
      <div class="downtime-overlay-label">
        <i class="fa-solid fa-eye-slash"></i> BOSS 無敵 (${dt.start.toFixed(1)}s ~ ${dt.end.toFixed(1)}s)
      </div>
    `;
    timelineEditor.appendChild(dtEl);
  });
  
  // 4. Draw Buff Track Overlays
  timelineSkills.forEach(skill => {
    const buffConfig = BUFF_MAP[skill.name];
    if (buffConfig) {
      const overlay = document.createElement('div');
      overlay.className = 'buff-overlay';
      overlay.style.left = `${(skill.startTime + PREPULL_TIME) * pixelsPerSecond}px`;
      overlay.style.width = `${buffConfig.duration * pixelsPerSecond}px`;
      overlay.style.backgroundColor = buffConfig.color;
      overlay.style.borderColor = buffConfig.color.replace('0.45', '0.8').replace('0.4', '0.8');
      overlay.innerHTML = `<img src="${skill.icon}" style="width:16px;height:16px;margin-right:6px;border-radius:3px;"> ${buffConfig.label}`;
      
      const targetBuffTrack = document.getElementById('buff-track-' + (skill.timelineId || 1)) || buffTrack;
      if (targetBuffTrack) targetBuffTrack.appendChild(overlay);
    }
  });

  // 5. Draw Placed GCDs
  const gcds = timelineSkills.filter(s => s.track === 'gcd');
  gcds.forEach(skill => {
    const el = document.createElement('div');
    el.className = 'placed-skill gcd-type';
    el.draggable = true;
    el.dataset.instanceId = skill.instanceId;
    el.style.left = `${(skill.startTime + PREPULL_TIME) * pixelsPerSecond}px`;
    el.style.width = `${skill.duration * pixelsPerSecond}px`;
    
    el.innerHTML = `
      <img src="${skill.icon}" alt="${skill.name}">
      <span class="placed-skill-name">${skill.name}</span>
    `;
    
    if (skill.isInterrupted) {
      el.classList.add('interrupted-skill');
      const badge = document.createElement('span');
      badge.className = 'interrupted-badge';
      badge.textContent = '!';
      el.appendChild(badge);
    }

    const castTime = (skill.effectiveCast !== undefined) ? skill.effectiveCast : parseTimeToSeconds(skill.cast);

    // Recast locking mesh（中斷的施放只顯示開頭，不畫 recast 條）
    if (skill.duration > castTime && !skill.isInterrupted) {
      const recastMesh = document.createElement('div');
      recastMesh.className = 'recast-lock-indicator';
      recastMesh.style.left = `${castTime * pixelsPerSecond}px`;
      recastMesh.style.width = `${(skill.duration - castTime) * pixelsPerSecond}px`;
      el.appendChild(recastMesh);
    }
    
    const targetGcdTrack = document.getElementById('gcd-track-' + (skill.timelineId || 1)) || gcdTrack;

    // Red clip overlay placed in the gap after the current GCD block
    if (skill.clip > 0) {
      const clipWarning = document.createElement('div');
      clipWarning.className = 'gcd-clip-warning';
      clipWarning.style.left = `${(skill.startTime + skill.duration + PREPULL_TIME) * pixelsPerSecond}px`;
      clipWarning.style.width = `${skill.clip * pixelsPerSecond}px`;
      clipWarning.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> 卡 ${skill.clip.toFixed(1)}s`;
      if (targetGcdTrack) targetGcdTrack.appendChild(clipWarning);
    }

    // Delay or Idle warning placed in the gap before the next GCD block
    if (skill.idle > 0.05) {
      const isIdle = skill.idle > timelineGCDDuration;
      const label = isIdle ? '空轉' : '延遲';
      const warningClass = isIdle ? 'gcd-clip-warning gcd-idle-warning' : 'gcd-clip-warning gcd-delay-warning';
      const idleWarning = document.createElement('div');
      idleWarning.className = warningClass;
      idleWarning.style.left = `${(skill.startTime + skill.duration + skill.clip + PREPULL_TIME) * pixelsPerSecond}px`;
      idleWarning.style.width = `${skill.idle * pixelsPerSecond}px`;
      idleWarning.innerHTML = `<i class="fa-solid fa-clock"></i> ${label} ${skill.idle.toFixed(2)}s`;
      if (targetGcdTrack) targetGcdTrack.appendChild(idleWarning);
    }
    
    // Drag handlers
    el.addEventListener('dragstart', (e) => {
      isDraggingInProgress = true;
      hideTooltip();
      draggedItem = { source: 'timeline', instanceId: skill.instanceId, type: 'skill' };
      e.dataTransfer.setData('text/plain', skill.instanceId);
    });
    
    // Tooltip
    const originalSkill = skillsDatabase[currentJobId].skills.find(s => s.id === skill.skillId);
    const tooltipSkill = originalSkill ? { ...originalSkill, startTime: skill.startTime, isInterrupted: !!skill.isInterrupted } : skill;
    el.addEventListener('mousemove', (e) => showTooltip(e, tooltipSkill));
    el.addEventListener('mouseleave', hideTooltip);
    
    if (targetGcdTrack) targetGcdTrack.appendChild(el);
  });
  
  // 6. Draw Placed oGCDs (Pills)
  const ogcds = timelineSkills.filter(s => s.track === 'ogcd');
  ogcds.forEach(skill => {
    const el = document.createElement('div');
    el.className = 'ogcd-pill';
    el.draggable = true;
    el.dataset.instanceId = skill.instanceId;
    el.style.left = `${(skill.startTime + PREPULL_TIME) * pixelsPerSecond}px`;
    
    // Is role action color?
    const isRole = skill.skillId.includes('tank_action') || skill.skillId.includes('healer_action') || skill.skillId.includes('melee_action') || skill.skillId.includes('ranged_action') || skill.skillId.includes('caster_action');
    if (isRole) {
      el.classList.add('role-type');
    }
    
    el.innerHTML = `
      <img src="${skill.icon}" alt="${skill.name}">
      <span class="ogcd-pill-name">${skill.name}</span>
    `;
    
    if (skill.isInterrupted) {
      el.classList.add('interrupted-skill');
      const badge = document.createElement('span');
      badge.className = 'interrupted-badge';
      badge.textContent = '!';
      el.appendChild(badge);
    }
    
    // Drag handlers
    el.addEventListener('dragstart', (e) => {
      isDraggingInProgress = true;
      hideTooltip();
      draggedItem = { source: 'timeline', instanceId: skill.instanceId, type: 'skill' };
      e.dataTransfer.setData('text/plain', skill.instanceId);
    });
    
    // Tooltip
    const originalSkill = skillsDatabase[currentJobId].skills.find(s => s.id === skill.skillId);
    const tooltipSkill = originalSkill ? { ...originalSkill, startTime: skill.startTime, isInterrupted: !!skill.isInterrupted } : skill;
    el.addEventListener('mousemove', (e) => showTooltip(e, tooltipSkill));
    el.addEventListener('mouseleave', hideTooltip);
    
    const targetOgcdTrack = document.getElementById('ogcd-track-' + (skill.timelineId || 1)) || ogcdTrack;
    if (targetOgcdTrack) targetOgcdTrack.appendChild(el);
  });
  
  // 7. Update Status Indicator Panel
  updateStatusPanel();
}

// Helper: Format seconds to M:SS.SSS
function formatTime(seconds) {
  const isNegative = seconds < 0;
  const absSeconds = Math.abs(seconds);
  const m = Math.floor(absSeconds / 60);
  const s = Math.floor(absSeconds % 60);
  const ms = Math.floor(Math.round((absSeconds * 1000) % 1000));
  return `${isNegative ? '-' : ''}${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

function scrollToTime(timeSeconds) {
  const scrollContainer = activeTab === 'compare' ? 
    document.querySelector('#compare-workspace-view .timeline-container-outer') : 
    timelineEditor.parentElement;
  if (scrollContainer) {
    scrollContainer.scrollLeft = TRACK_INFO_WIDTH + (timeSeconds + PREPULL_TIME) * pixelsPerSecond - 100;
  }
}

// 8. Handle Drag-and-Drop Drop logic
function handleDrop(e, targetTrackType, targetTimelineId = 1) {
  pushPersonalUndoState();
  const rect = timelineEditor.getBoundingClientRect();
  const mouseX = e.clientX - rect.left - TRACK_INFO_WIDTH;
  const rawTime = Math.max(-PREPULL_TIME, (mouseX / pixelsPerSecond) - PREPULL_TIME);
  
  if (draggedItem.source === 'sidebar') {
    // Drop from sidebar -> create new item
    const skillId = draggedItem.skillId;
    const skill = skillsDatabase[currentJobId].skills.find(s => s.id === skillId);
    if (!skill) return;
    
    const isGcd = (skill.classification === '戰技' || skill.classification === '魔法');
    const parsedRecast = parseTimeToSeconds(skill.recast);
    const parsedCast = parseTimeToSeconds(skill.cast);
    
    const instanceId = 'skill_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    
    let startTime = rawTime;
    let parentGcdId = null;
    let relativeOffset = 0;
    
    if (isGcd) {
      // Snap to nearest 0.5s slot or GCD boundary
      startTime = Math.round(startTime * 2) / 2;
    } else {
      // Find parent GCD
      const gcds = timelineSkills.filter(s => s.track === 'gcd' && (s.timelineId || 1) === targetTimelineId).sort((a, b) => a.startTime - b.startTime);
      const parent = gcds.reverse().find(g => g.startTime <= rawTime);
      if (parent) {
        parentGcdId = parent.instanceId;
        relativeOffset = rawTime - parent.startTime;
        startTime = parent.startTime + relativeOffset;
      }
    }
    
    timelineSkills.push({
      instanceId,
      skillId: skill.id,
      name: skill.name,
      icon: skill.icon,
      classification: skill.classification,
      cast: skill.cast,
      recast: skill.recast,
      startTime: Math.round(startTime * 1000) / 1000,
      duration: Math.max(parsedCast, isGcd ? timelineGCDDuration : 0.6),
      track: isGcd ? 'gcd' : 'ogcd',
      parentGcdId,
      relativeOffset,
      clip: 0,
      idle: 0,
      timelineId: targetTimelineId
    });
    
  } else if (draggedItem.source === 'timeline') {
    // Drop from timeline -> move existing item
    if (draggedItem.type === 'skill') {
      const skill = timelineSkills.find(s => s.instanceId === draggedItem.instanceId);
      if (!skill) return;
      
      // Move to target timeline track
      skill.timelineId = targetTimelineId;
      
      if (skill.track === 'gcd') {
        skill.startTime = Math.round(rawTime * 2) / 2;
      } else {
        // oGCD move: re-calculate parent GCD relationship within target timeline
        const gcds = timelineSkills.filter(s => s.track === 'gcd' && (s.timelineId || 1) === targetTimelineId).sort((a, b) => a.startTime - b.startTime);
        const parent = gcds.reverse().find(g => g.startTime <= rawTime);
        if (parent) {
          skill.parentGcdId = parent.instanceId;
          skill.relativeOffset = rawTime - parent.startTime;
        } else {
          skill.parentGcdId = null;
          skill.startTime = rawTime;
        }
      }
    } else if (draggedItem.type === 'mechanic') {
      const mech = bossMechanics.find(m => m.id === draggedItem.instanceId);
      if (mech) {
        mech.time = Math.round(rawTime * 2) / 2; // snap to 0.5s
      }
    }
  }
  
  recalculateTimeline();
  renderTimeline();
  autoSave();
}

// Drop onto Trash Bin
function handleTrashDrop(e) {
  if (draggedItem.source === 'timeline') {
    pushPersonalUndoState();
    if (draggedItem.type === 'skill') {
      timelineSkills = timelineSkills.filter(s => s.instanceId !== draggedItem.instanceId);
      // Clean up parents for nested child oGCDs
      timelineSkills.forEach(s => {
        if (s.parentGcdId === draggedItem.instanceId) {
          s.parentGcdId = null;
        }
      });
    } else if (draggedItem.type === 'mechanic') {
      bossMechanics = bossMechanics.filter(m => m.id !== draggedItem.instanceId);
    }
    
    recalculateTimeline();
    renderTimeline();
    autoSave();
  }
}

// 9. Playback preview
function togglePlayback() {
  if (playbackState.isPlaying) {
    pausePlayback();
  } else {
    startPlayback();
  }
}

function startPlayback() {
  playbackState.isPlaying = true;
  playhead.style.display = 'block';
  
  playbackState.startTimeStamp = performance.now() - (playbackState.currentTime * 1000);
  
  function updatePlayhead(timestamp) {
    const elapsedSeconds = (timestamp - playbackState.startTimeStamp) / 1000;
    playbackState.currentTime = elapsedSeconds;
    
    // Update playhead left position
    playhead.style.left = `${TRACK_INFO_WIDTH + (playbackState.currentTime + PREPULL_TIME) * pixelsPerSecond}px`;
    
    // Auto-scroll timeline to keep playhead centered
    const scrollContainer = timelineEditor.parentElement;
    const viewWidth = scrollContainer.clientWidth;
    const playheadPos = TRACK_INFO_WIDTH + (playbackState.currentTime + PREPULL_TIME) * pixelsPerSecond;
    if (playheadPos > scrollContainer.scrollLeft + viewWidth * 0.7) {
      scrollContainer.scrollLeft = playheadPos - viewWidth * 0.3;
    }
    
    // Check if we hit the end of the timeline
    let maxTime = 60;
    timelineSkills.forEach(s => { maxTime = Math.max(maxTime, s.startTime + s.duration); });
    if (playbackState.currentTime > maxTime) {
      stopPlayback();
    } else {
      playbackState.animationFrameId = requestAnimationFrame(updatePlayhead);
    }
  }
  
  playbackState.animationFrameId = requestAnimationFrame(updatePlayhead);
}

function pausePlayback() {
  playbackState.isPlaying = false;
  if (playbackState.animationFrameId) {
    cancelAnimationFrame(playbackState.animationFrameId);
  }
}

function stopPlayback() {
  pausePlayback();
  playbackState.currentTime = -PREPULL_TIME;
  playhead.style.left = `${TRACK_INFO_WIDTH}px`;
  playhead.style.display = 'none';
  timelineEditor.parentElement.scrollLeft = 0;
}

// 10. Status Indicator Logic
function updateStatusPanel() {
  const displayLength = document.getElementById('timeline-length-display');
  const displayClip = document.getElementById('gcd-clip-display');
  
  let maxTime = 0;
  timelineSkills.forEach(s => {
    maxTime = Math.max(maxTime, s.startTime + s.duration);
  });
  
  displayLength.innerHTML = `<i class="fa-regular fa-clock"></i> 軸總長: ${maxTime.toFixed(1)} 秒`;
  
  const clippedGcds = timelineSkills.filter(s => s.track === 'gcd' && s.clip > 0);
  const delayGcds = timelineSkills.filter(s => s.track === 'gcd' && s.idle > 0.05 && s.idle <= timelineGCDDuration);
  const idleGcds = timelineSkills.filter(s => s.track === 'gcd' && s.idle > timelineGCDDuration);
  
  let clipText = '';
  if (clippedGcds.length > 0) {
    const totalClip = clippedGcds.reduce((acc, curr) => acc + curr.clip, 0);
    clipText += `卡 GCD (${clippedGcds.length} 處 / ${totalClip.toFixed(2)}s)`;
  }
  
  if (delayGcds.length > 0) {
    const totalDelay = delayGcds.reduce((acc, curr) => acc + curr.idle, 0);
    if (clipText) clipText += ' | ';
    clipText += `延遲 (${delayGcds.length} 處 / ${totalDelay.toFixed(2)}s)`;
  }

  if (idleGcds.length > 0) {
    const totalIdle = idleGcds.reduce((acc, curr) => acc + curr.idle, 0);
    if (clipText) clipText += ' | ';
    clipText += `空轉 (${idleGcds.length} 處 / ${totalIdle.toFixed(2)}s)`;
  }
  
  if (clipText) {
    displayClip.className = 'danger';
    displayClip.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${clipText}`;
  } else {
    displayClip.className = 'safe';
    displayClip.innerHTML = `<i class="fa-solid fa-circle-check"></i> GCD 無卡頓 / 空轉`;
  }
}

// 11. Profile Persistance & LocalStorage
function autoSave() {
  if (!currentJobId) return;
  const data = getExportableData();
  localStorage.setItem('ffxiv_timeline_autosave', JSON.stringify(data));
}

function getExportableData() {
  return {
    jobId: currentJobId,
    gcd: timelineGCDDuration,
    dutyFile: currentDutyFile,
    importedPlayerName: timelinePlayers[0],
    activeTimelinesCount: activeTimelinesCount,
    timelinePlayers: timelinePlayers,
    skills: timelineSkills.map(s => ({
      skillId: s.skillId,
      startTime: s.startTime,
      parentGcdId: s.parentGcdId,
      relativeOffset: s.relativeOffset,
      timelineId: s.timelineId || 1
    })),
    mechanics: bossMechanics
  };
}

function loadPlanData(data) {
  if (!data || !skillsDatabase[data.jobId]) return;
  
  currentJobId = data.jobId;
  jobSelect.value = currentJobId;
  syncCustomDropdown(jobSelect);
  timelineGCDDuration = data.gcd || 2.50;
  gcdInput.value = timelineGCDDuration.toFixed(2);
  
  currentDutyFile = data.dutyFile || '';
  if (dutySelect) {
    dutySelect.value = currentDutyFile;
    populateDutyDropdown(dutiesDatabase, currentDutyFile);
  }
  
  loadJobSkills(currentJobId);
  
  activeTimelinesCount = data.activeTimelinesCount || 1;
  timelinePlayers = data.timelinePlayers || [data.importedPlayerName || null, null, null];
  importedPlayerName = timelinePlayers[0];

  // Reconstruct timeline skills
  const job = skillsDatabase[currentJobId];
  timelineSkills = [];
  
  data.skills.forEach(s => {
    const skill = job.skills.find(x => x.id === s.skillId);
    if (!skill) return;
    
    const parsedRecast = parseTimeToSeconds(skill.recast);
    const parsedCast = parseTimeToSeconds(skill.cast);
    const isGcd = (skill.classification === '戰技' || skill.classification === '魔法');
    const instanceId = 'skill_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    
    timelineSkills.push({
      instanceId,
      skillId: skill.id,
      name: skill.name,
      icon: skill.icon,
      classification: skill.classification,
      cast: skill.cast,
      recast: skill.recast,
      startTime: s.startTime,
      duration: Math.max(parsedCast, isGcd ? timelineGCDDuration : 0.6),
      track: isGcd ? 'gcd' : 'ogcd',
      parentGcdId: s.parentGcdId,
      relativeOffset: s.relativeOffset,
      clip: 0,
      idle: 0,
      timelineId: s.timelineId || 1
    });
  });
  
  // Re-parent oGCD references to match the new random instanceIds
  // Map old index positions to new instanceIds
  const oldGcds = data.skills.filter(s => !s.parentGcdId); // We assume ordering was preserved
  const newGcds = timelineSkills.filter(s => s.track === 'gcd');
  
  timelineSkills.filter(s => s.track === 'ogcd').forEach(ogcd => {
    // Find old parent index in data.skills
    const oldParentGcdIndex = data.skills.findIndex(x => x.parentGcdId === null && data.skills.filter(y => !y.parentGcdId).indexOf(x) === data.skills.filter(y => !y.parentGcdId).indexOf(data.skills.find(z => z.parentGcdId === ogcd.parentGcdId)));
    
    // Find which GCD was parent in original
    const origGcdParentIndex = data.skills.findIndex(x => x.parentGcdId === null && data.skills.filter(y => !y.parentGcdId).indexOf(x) === data.skills.filter(y => !y.parentGcdId).indexOf(data.skills.find(z => z.parentGcdId === ogcd.parentGcdId)));
    
    const dataOgcd = data.skills.find(x => x.startTime === ogcd.startTime); // simple matching
    if (dataOgcd && dataOgcd.parentGcdId) {
      // Find parent index among GCDs in data
      const dataGcdsOnly = data.skills.filter(x => {
        const item = job.skills.find(s => s.id === x.skillId);
        return item && (item.classification === '戰技' || item.classification === '魔法');
      });
      const parentIdx = dataGcdsOnly.findIndex(x => x.startTime <= dataOgcd.startTime); // approximate parent
      
      if (parentIdx !== -1 && newGcds[parentIdx]) {
        ogcd.parentGcdId = newGcds[parentIdx].instanceId;
      }
    }
  });

  bossMechanics = data.mechanics || [];
  
  recalculateTimeline();
  renderTimeline();
}

// 12. Save Profile (Modal)
function saveTimelineProfile() {
  if (!currentJobId) {
    alert('請先選擇職業並排入技能再儲存！');
    return;
  }
  
  const name = prompt('請輸入排軸存檔名稱（如：騎士 - M4S雙開場）:');
  if (!name) return;
  
  const profiles = JSON.parse(localStorage.getItem('ffxiv_timeline_profiles') || '[]');
  
  profiles.push({
    id: 'plan_' + Date.now(),
    name: name,
    jobId: currentJobId,
    gcd: timelineGCDDuration,
    dutyFile: currentDutyFile,
    importedPlayerName: timelinePlayers[0],
    activeTimelinesCount: activeTimelinesCount,
    timelinePlayers: timelinePlayers,
    skills: timelineSkills.map(s => ({
      skillId: s.skillId,
      startTime: s.startTime,
      parentGcdId: s.parentGcdId,
      relativeOffset: s.relativeOffset,
      timelineId: s.timelineId || 1
    })),
    mechanics: bossMechanics,
    updatedAt: new Date().toISOString()
  });
  
  localStorage.setItem('ffxiv_timeline_profiles', JSON.stringify(profiles));
  alert('排軸存檔成功！');
}

function getDutyName(dutyFile) {
  if (!dutyFile) return '自訂時間軸';
  if (dutiesDatabase && dutiesDatabase.duties) {
    const duty = dutiesDatabase.duties.find(d => d.file === dutyFile);
    if (duty) return duty.name;
  }
  return dutyFile;
}

// Open load save modal
function openLoadModal() {
  const profiles = JSON.parse(localStorage.getItem('ffxiv_timeline_profiles') || '[]');
  
  savesList.innerHTML = '';
  
  if (profiles.length === 0) {
    savesList.innerHTML = '<li style="color:var(--color-text-muted);text-align:center;padding:20px;">無儲存的檔案</li>';
  } else {
    profiles.forEach(p => {
      const li = document.createElement('li');
      li.className = 'save-item';
      li.innerHTML = `
        <div class="save-info">
          <span class="save-name">${p.name}</span>
          <span class="save-details">職業: ${skillsDatabase[p.jobId]?.name || p.jobId} | 副本: ${getDutyName(p.dutyFile)} | GCD: ${p.gcd.toFixed(2)}s | 儲存時間: ${new Date(p.updatedAt).toLocaleString()}</span>
        </div>
        <div class="save-actions">
          <button class="btn btn-secondary btn-mini-edit" data-id="${p.id}"><i class="fa-solid fa-pen"></i> 重新命名</button>
          <button class="btn btn-secondary btn-mini-load" data-id="${p.id}"><i class="fa-solid fa-folder-open"></i> 開啟</button>
          <button class="btn btn-danger btn-mini-del" data-id="${p.id}"><i class="fa-solid fa-trash"></i> 刪除</button>
        </div>
      `;
      
      // Edit event
      li.querySelector('.btn-mini-edit').addEventListener('click', () => {
        const newName = prompt('請輸入新的名稱：', p.name);
        if (newName === null) return;
        if (newName.trim() === '') {
          alert('名稱不能為空！');
          return;
        }
        p.name = newName.trim();
        p.updatedAt = new Date().toISOString();
        localStorage.setItem('ffxiv_timeline_profiles', JSON.stringify(profiles));
        openLoadModal(); // Reload list
      });
      
      // Load event
      li.querySelector('.btn-mini-load').addEventListener('click', () => {
        loadPlanData(p);
        savesModal.classList.remove('active');
      });
      
      // Delete event
      li.querySelector('.btn-mini-del').addEventListener('click', () => {
        if (confirm(`確認要刪除 "${p.name}" 嗎？`)) {
          const updated = profiles.filter(x => x.id !== p.id);
          localStorage.setItem('ffxiv_timeline_profiles', JSON.stringify(updated));
          openLoadModal(); // Reload modal list
        }
      });
      
      savesList.appendChild(li);
    });
  }
  
  savesModal.classList.add('active');
}

// 13. Import & Export JSON Files
function exportTimelineJSON() {
  if (!currentJobId) {
    alert('無排軸資料可匯出！');
    return;
  }
  const data = getExportableData();
  window.trackEvent('personal_planner', 'export_json', { job: currentJobId });
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `ffxiv_timeline_${currentJobId}_${timelineGCDDuration.toFixed(2)}s.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const JOB_MAP = {
  "PLD": { id: "paladin", name: "騎士" },
  "WAR": { id: "warrior", name: "戰士" },
  "DRK": { id: "darkknight", name: "暗黑騎士" },
  "GNB": { id: "gunbreaker", name: "絕槍戰士" },
  "WHM": { id: "whitemage", name: "白魔道士" },
  "SCH": { id: "scholar", name: "學者" },
  "AST": { id: "astrologian", name: "占星術師" },
  "SGE": { id: "sage", name: "賢者" },
  "MNK": { id: "monk", name: "武僧" },
  "DRG": { id: "dragoon", name: "龍騎士" },
  "NIN": { id: "ninja", name: "忍者" },
  "SAM": { id: "samurai", name: "武士" },
  "RPR": { id: "reaper", name: "奪魂者" },
  "VPR": { id: "viper", name: "毒蛇劍士" },
  "BRD": { id: "bard", name: "吟遊詩人" },
  "MCH": { id: "machinist", name: "機工士" },
  "DNC": { id: "dancer", name: "舞者" },
  "BLM": { id: "blackmage", name: "黑魔道士" },
  "SMN": { id: "summoner", name: "召喚士" },
  "RDM": { id: "redmage", name: "赤魔道士" },
  "PCT": { id: "pictomancer", name: "繪靈法師" }
};

const SKILL_NAME_MAP = {
  // Tanks
  "drk_rep": "雪仇",
  "drk_dmissi": "暗黑佈道",
  "pld_rep": "雪仇",
  "pld_div": "聖光幕阻",
  "pld_poa": "武裝戍衛",
  "war_rep": "雪仇",
  "war_sio": "擺脫",
  "gnb_rep": "雪仇",
  "gnb_heart": "光之心",
  
  // Healers
  "whm_temper": "節制",
  "whm_liturgy": "禮儀之鈴",
  "whm_benis": "神祝禱",
  "whm_aquaveil": "水流幕",
  "whm_asylum": "庇護所",
  
  // SCH
  "sch_prot": "野戰治療陣",
  "sch_illum": "異想的祥光",
  "sch_whisper": "仙光的低語",
  "sch_indom": "不撓之策",
  "sch_recit": "秘策",
  "sch_tact": "疾風怒濤之計",
  "sch_diss": "轉化",
  "sch_covan": "慰藉",
  "sch_seraphism": "熾天附體",
  
  // AST
  "ast_colt": "命運之輪",
  "ast_oppo": "天星沖日",
  "ast_macromos": "大宇宙",
  "ast_sunsign": "太陽星座",
  "ast_netl": "中庸之界",
  "ast_netl_S": "太陽星座",
  "ast_horo": "天宮圖",
  
  // SGE
  "sge_kera": "堅角清汁",
  "sge_holos": "整體論",
  "sge_panha": "泛輸血",
  "sge_philo": "智慧之愛",
  "sge_tauro": "白牛清汁",
  "sge_haima": "輸血",
  "sge_zoe": "活化",
  "sge_pneuma": "魂靈風息",
  "sge_ep2": "均衡預後II",
  
  // Melees
  "rpr_feint": "牽制",
  "sam_feint": "牽制",
  "mnk_feint": "牽制",
  "drg_feint": "牽制",
  "nin_feint": "牽制",
  "vpr_feint": "牽制",
  "mnk_mantra": "真言",
  
  // Ranged DPS
  "brd_troub": "行吟",
  "brd_nature": "大地神的抒情戀歌",
  "mch_tact": "策動",
  "mch_dismantle": "拆卸",
  "dnc_samba": "防守之桑巴",
  "dnc_waltz": "治療華爾茲",
  "dnc_improv": "即興表演",
  
  // Casters
  "pct_addle": "昏亂",
  "pct_tcoat": "坦培拉塗層",
  "pct_tgrassy": "油性坦培拉塗層",
  "pct_tgrassa": "油性坦培拉塗層",
  "smn_addle": "昏亂",
  "smn_aegis": "阻礙之光", // fallback check: smn's aegis is 守護之光
  "smn_radiant": "守護之光",
  "rdm_addle": "昏亂",
  "rdm_magick": "抗死",
  "rdm_mbarrier": "抗死",
  "blm_addle": "昏亂",
  "blm_ward": "魔罩"
};

// Fallback addition for 守護之光
SKILL_NAME_MAP["smn_aegis"] = "守護之光";

function getCombinedTimeline(defaultTimeline, customRows) {
  const combined = defaultTimeline.map((item, idx) => ({
    time: parseDutyTime(item.castingTime || item.hitTime),
    name: item.skill,
    originalIndex: idx,
    isCustom: false
  }));
  
  if (customRows && Array.isArray(customRows)) {
    customRows.forEach(row => {
      combined.push({
        time: parseDutyTime(row.hitTime || row.castingTime),
        name: row.skill,
        originalIndex: -1,
        isCustom: true
      });
    });
  }
  
  combined.sort((a, b) => {
    if (a.time !== b.time) return a.time - b.time;
    if (a.isCustom && !b.isCustom) return 1;
    if (!a.isCustom && b.isCustom) return -1;
    return 0;
  });
  
  return combined;
}

function getEventTimeByIndex(combinedTimeline, index) {
  if (index < 0) return 0;
  if (index < combinedTimeline.length) {
    return combinedTimeline[index].time;
  }
  if (combinedTimeline.length > 0) {
    return combinedTimeline[combinedTimeline.length - 1].time;
  }
  return 0;
}

function showJobSelectionModal(activePartyMembers, onSelect) {
  // Create modal element
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'job-select-modal';
  
  const content = document.createElement('div');
  content.className = 'modal-content';
  
  const header = document.createElement('div');
  header.className = 'modal-header';
  header.innerHTML = `
    <h3><i class="fa-solid fa-users"></i> 選擇要匯入排軸的特職</h3>
    <span class="modal-close" id="job-modal-close">&times;</span>
  `;
  
  const body = document.createElement('div');
  body.className = 'modal-body';
  body.innerHTML = `
    <p style="margin-bottom: 15px; color: var(--color-text-muted); font-size: 14px;">
      偵測到 FFXIV Mitigation Planning 隊伍排軸。請選擇您想要將哪個特職的技能匯入到目前的時間軸中：
    </p>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;" id="job-options-container">
    </div>
  `;
  
  content.appendChild(header);
  content.appendChild(body);
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  const optionsContainer = modal.querySelector('#job-options-container');
  activePartyMembers.forEach(member => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-secondary';
    btn.style.justifyContent = 'center';
    btn.style.padding = '12px 10px';
    btn.style.fontSize = '14px';
    btn.innerHTML = `<span style="font-weight:bold; margin-right: 5px;">[${member.jobAbbrev}]</span> ${member.jobInfo.name}`;
    btn.addEventListener('click', () => {
      onSelect(member);
      closeModal();
    });
    optionsContainer.appendChild(btn);
  });
  
  const closeBtn = modal.querySelector('#job-modal-close');
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  function closeModal() {
    modal.classList.remove('active');
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
  }
}

async function importFfxivMitigationPlan(data) {
  if (timelineSkills.length > 0) {
    const ok = await window.showCustomConfirm('清空時間軸', '匯入新排軸將清空目前的時間軸與技能，確定要繼續嗎？');
    if (!ok) return;
  }

  const dutyKey = data.duty;
  window.trackEvent('personal_planner', 'import_from_team', { duty: dutyKey });
  const dutyObj = dutiesDatabase.duties ? dutiesDatabase.duties.find(d => 
    d.key === dutyKey || 
    d.file === dutyKey || 
    (dutyKey && d.key.toLowerCase() === dutyKey.toLowerCase()) || 
    (dutyKey && d.file.toLowerCase() === dutyKey.toLowerCase())
  ) : null;

  const activePartyMembers = [];
  data.party.forEach((jobAbbrev, idx) => {
    const hasCasts = data.mits.some(c => c.slotIndex === idx);
    if (hasCasts) {
      activePartyMembers.push({
        index: idx,
        jobAbbrev: jobAbbrev,
        jobInfo: JOB_MAP[jobAbbrev] || { id: jobAbbrev.toLowerCase(), name: jobAbbrev }
      });
    }
  });

  if (activePartyMembers.length === 0) {
    alert('團隊排軸計畫中沒有任何特職的技能施放紀錄！');
    return;
  }

  showJobSelectionModal(activePartyMembers, async (selectedMember) => {
    const jobInfo = selectedMember.jobInfo;
    const jobId = jobInfo.id;
    
    currentJobId = jobId;
    jobSelect.value = jobId;
    syncCustomDropdown(jobSelect);
    loadJobSkills(jobId);
    
    // Setup Boss Mechanics
    let officialMechs = [];
    if (dutyObj) {
      await loadDuty(dutyObj.file, false);
      officialMechs = JSON.parse(JSON.stringify(bossMechanics));
      if (dutySelect) {
        dutySelect.value = dutyObj.file;
        populateDutyDropdown(dutiesDatabase, dutyObj.file);
      }
    } else {
      currentDutyFile = '';
      if (dutySelect) {
        dutySelect.value = '';
        populateDutyDropdown(dutiesDatabase, '');
      }
      bossMechanics = [];
    }
    
    // Copy custom mechanics from the team plan
    let parsedCustom = [];
    if (data.customMechanics && data.customMechanics.length > 0) {
      parsedCustom = JSON.parse(JSON.stringify(data.customMechanics));
    } else if (data.customRowsByDuty && data.customRowsByDuty[data.duty]) {
      data.customRowsByDuty[data.duty].forEach((cr, idx) => {
        const time = parseDutyTime(cr.hitTime || cr.castingTime);
        parsedCustom.push({
          id: cr.id || `custom-imported-${idx}-${Date.now()}`,
          time: time,
          name: cr.skill || '未命名自訂機制'
        });
      });
    }
    
    // Concatenate unsorted list (matching Format B indices)
    const unsortedMechs = [...officialMechs, ...parsedCustom];
    
    bossMechanics = [...officialMechs, ...parsedCustom];
    bossMechanics.sort((a, b) => a.time - b.time);
    
    // Normalize data.mits to Format A array of casts
    let normalizedCasts = [];
    if (Array.isArray(data.mits)) {
      normalizedCasts = data.mits;
    } else if (typeof data.mits === 'object' && data.mits !== null) {
      for (const [key, times] of Object.entries(data.mits)) {
        const parts = key.split('-');
        if (parts.length >= 3) {
          const dutyKey = parts[0];
          if (dutyKey !== data.duty) continue;
          
          const slotStr = parts[1];
          const slotIndex = parseInt(slotStr.replace('p', ''), 10);
          const skillKey = parts.slice(2).join('-');
          const jobKey = data.party[slotIndex];
          
          if (Array.isArray(times) && jobKey) {
            times.forEach(time => {
              const mech = unsortedMechs[time];
              const startTime = mech ? mech.time : time;
              normalizedCasts.push({
                slotIndex: slotIndex,
                skillKey: skillKey,
                startTime: startTime
              });
            });
          }
        }
      }
    }
    
    timelineSkills = [];
    const jobDb = skillsDatabase[jobId];
    if (jobDb) {
      // Filter casts for selected player slot
      const casts = normalizedCasts.filter(c => c.slotIndex === selectedMember.index);
      casts.forEach(c => {
        const chineseName = SKILL_NAME_MAP[c.skillKey] || c.skillKey;
        const skill = jobDb.skills.find(s => s.name === chineseName);
        if (!skill) {
          console.warn('在技能資料庫中找不到技能:', chineseName);
          return;
        }
        
        const parsedCast = parseTimeToSeconds(skill.cast);
        const isGcd = (skill.classification === '戰技' || skill.classification === '魔法');
        const instanceId = 'skill_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        
        timelineSkills.push({
          instanceId,
          skillId: skill.id,
          name: skill.name,
          icon: skill.icon,
          classification: skill.classification,
          cast: skill.cast,
          recast: skill.recast,
          startTime: c.startTime,
          duration: Math.max(parsedCast, isGcd ? timelineGCDDuration : 0.6),
          track: isGcd ? 'gcd' : 'ogcd',
          parentGcdId: null,
          relativeOffset: 0,
          clip: 0,
          idle: 0
        });
      });
    }
    
    recalculateTimeline();
    renderTimeline();
    autoSave();
    alert(`已成功將團隊減傷中 ${jobInfo.name} (Slot ${selectedMember.index + 1}) 的減傷排招載入到個人時間軸！`);
  });
}

function importTimelineJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (data.duty && data.party && data.mits) {
        await importFfxivMitigationPlan(data);
      } else if (data.jobId && data.skills) {
        loadPlanData(data);
        window.trackEvent('personal_planner', 'import_json', { job: data.jobId });
        alert('匯入成功！');
      } else {
        throw new Error('匯入的 JSON 檔案格式不正確！');
      }
    } catch (err) {
      alert(`匯入失敗: ${err.message}`);
    }
  };
  reader.readAsText(file);
}

function importFflogsEvents(text, filterPlayer, clearTimeline, targetTimelineId = 1) {
  if (!currentJobId) throw new Error('請先選擇特職');
  const jobDb = skillsDatabase[currentJobId];
  if (!jobDb) throw new Error('技能資料庫中找不到該特職資料');

  const lines = text.split(/\r?\n/);
  const events = [];

  // Parse lines
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Regex to match timestamp at the beginning of the line
    // e.g. -00:00.491 or 00:00.222 or 02:42.198 or [00:00.222]
    // The timestamp can have a minus sign for pre-pull (e.g. -00:00.491)
    const timeMatch = line.match(/^\s*\[?(-?\d+):(\d+)(?:\.(\d+))?\]?/);
    let timeInSeconds = null;
    let restOfLine = '';

    if (timeMatch) {
      const isMinus = timeMatch[0].includes('-');
      const minutes = parseInt(timeMatch[1].replace('-', ''), 10);
      const seconds = parseInt(timeMatch[2], 10);
      const ms = timeMatch[3] ? parseFloat('0.' + timeMatch[3]) : 0;
      timeInSeconds = minutes * 60 + seconds + ms;
      if (isMinus) timeInSeconds = -timeInSeconds;
      restOfLine = line.substring(timeMatch[0].length).trim();
    } else {
      // ss.SSS
      const timeMatchSec = line.match(/^\s*\[?(-?\d+)(?:\.(\d+))?\]?/);
      if (timeMatchSec) {
        const isMinus = timeMatchSec[0].includes('-');
        const seconds = parseInt(timeMatchSec[1].replace('-', ''), 10);
        const ms = timeMatchSec[2] ? parseFloat('0.' + timeMatchSec[2]) : 0;
        timeInSeconds = seconds + ms;
        if (isMinus) timeInSeconds = -timeInSeconds;
        restOfLine = line.substring(timeMatchSec[0].length).trim();
      }
    }

    if (timeInSeconds === null) continue; // Not a valid line with timestamp

    // Split by verb to find actor and skill
    // Verbs: begins casting, starts casting, casts, 開始施放, 施放, 唱え始めた, 唱えた, 実行した, begins, starts
    const verbMatch = restOfLine.match(/(?:begins casting|starts casting|casts|開始施放|施放|唱え始めた|唱えた|実行した|begins|starts)\s+(.+)$/i);
    let actorName = '';
    let eventDetail = restOfLine;
    let isStartCast = /begins casting|starts casting|開始施放|唱え始めた|starts|begins/i.test(restOfLine);

    if (verbMatch) {
      // The actor name is everything before the verb
      const verbIndex = restOfLine.indexOf(verbMatch[0]);
      actorName = restOfLine.substring(0, verbIndex).trim();
      eventDetail = verbMatch[1].trim();
    }

    // Clean event detail (e.g. "Fall Malefic on Boss" -> "Fall Malefic")
    // Split by " on " or " 對 " or " 於 " (or just take target out)
    const targetMatch = eventDetail.match(/^(.+?)\s+(?:on|對|於)\s+/i);
    let skillRawName = eventDetail;
    if (targetMatch) {
      skillRawName = targetMatch[1].trim();
    }
    
    // Clean any parenthetical suffix (e.g., "(1.44 sec)" or similar)
    skillRawName = skillRawName.replace(/\(.*?\)/g, '').trim();

    events.push({
      time: timeInSeconds,
      actor: actorName,
      skillRawName: skillRawName,
      isStartCast: isStartCast,
      originalLine: line
    });
  }

  if (events.length === 0) return 0;

  // Translation table mapping English and Simplified Chinese to Chinese in database (Traditional Chinese)
  const skillTranslation = {
    // Astrologian English -> Traditional Chinese
    "malefic": "凶星",
    "malefic ii": "災星",
    "malefic iii": "禍星",
    "malefic iv": "煞星",
    "fall malefic": "落陷凶星",
    "benefic": "吉星",
    "benefic ii": "福星",
    "combust": "燒灼",
    "combust ii": "熾灼",
    "combust iii": "焚灼",
    "lightspeed": "光速",
    "helios": "陽星",
    "ascend": "生辰",
    "essential dignity": "先天稟賦",
    "astral draw": "星極抽卡",
    "umbral draw": "靈極抽卡",
    "play i": "出卡I",
    "play ii": "出卡II",
    "play iii": "出卡III",
    "aspected benefic": "吉星相位",
    "aspected helios": "陽星相位",
    "gravity": "重力",
    "gravity ii": "中重力",
    "synastry": "星位合圖",
    "divination": "占卜",
    "collective unconscious": "命運之輪",
    "celestial opposition": "天星衝日",
    "earthly star": "地星",
    "stellar detonation": "星體爆轟",
    "stellar burst": "星體爆轟",
    "stellar explosion": "星體爆轟",
    "starry burst": "星體爆轟",
    "minor arcana": "小奧秘卡",
    "celestial intersection": "天星交錯",
    "horoscope": "天宮圖",
    "neutral sect": "中間學派",
    "exaltation": "擢升",
    "macrocosmos": "大宇宙",
    "microcosmos": "小宇宙",
    "oracle": "神諭",
    "helios conjunction": "陽星合相",
    "aspected helios ii": "陽星合相",
    "sun sign": "太陽星座",
    "sunsign": "太陽星座",
    "the balance": "太陽神之衡",
    "balance": "太陽神之衡",
    "the arrow": "放浪神之箭",
    "arrow": "放浪神之箭",
    "the spire": "建築神之塔",
    "spire": "建築神之塔",
    "the spear": "戰爭神之槍",
    "spear": "戰爭神之槍",
    "the bole": "世界樹之幹",
    "bole": "世界樹之幹",
    "the ewer": "河流神之瓶",
    "ewer": "河流神之瓶",
    "lord of crowns": "王冠之領主",
    "lady of crowns": "王冠之貴婦",
    "crown play": "小奧秘卡",
    "grade 2 gemdraught of intelligence": "爆發藥",
    "grade 2 gemdraught of strength": "爆發藥",
    "grade 2 gemdraught of dexterity": "爆發藥",
    "grade 2 gemdraught of mind": "爆發藥",
    "grade 1 gemdraught of intelligence": "爆發藥",
    "grade 1 gemdraught of strength": "爆發藥",
    "grade 1 gemdraught of dexterity": "爆發藥",
    "grade 1 gemdraught of mind": "爆發藥",
    "grade 8 tincture of strength": "爆發藥",
    "grade 8 tincture of dexterity": "爆發藥",
    "grade 8 tincture of intelligence": "爆發藥",
    "grade 8 tincture of mind": "爆發藥",
    "grade 7 tincture of strength": "爆發藥",
    "grade 7 tincture of dexterity": "爆發藥",
    "grade 7 tincture of intelligence": "爆發藥",
    "grade 7 tincture of mind": "爆發藥",
    "grade 6 tincture of strength": "爆發藥",
    "grade 6 tincture of dexterity": "爆發藥",
    "grade 6 tincture of intelligence": "爆發藥",
    "grade 6 tincture of mind": "爆發藥",
    "grade 5 tincture of strength": "爆發藥",
    "grade 5 tincture of dexterity": "爆發藥",
    "grade 5 tincture of intelligence": "爆發藥",
    "grade 5 tincture of mind": "爆發藥",
    "potion": "爆發藥",
    "tincture": "爆發藥",
    "gemdraught": "爆發藥",
    "爆发药": "爆發藥",
    
    // Healer role actions
    "repose": "沉靜",
    "esuna": "復原",
    "lucid dreaming": "醒夢",
    "swiftcast": "即刻詠唱",
    "surecast": "沉穩詠唱",
    "rescue": "營救",

    // Simplified Chinese -> Traditional Chinese (in case some players use SC client logs)
    "灾星": "災星",
    "祸星": "禍星",
    "煞星": "煞星",
    "坠星": "落陷凶星",
    "发牌i": "出卡I",
    "发牌1": "出卡I",
    "發牌i": "出卡I",
    "發牌1": "出卡I",
    "出卡i": "出卡I",
    "出卡1": "出卡I",
    "发牌ii": "出卡II",
    "发牌2": "出卡II",
    "發牌ii": "出卡II",
    "發牌2": "出卡II",
    "出卡ii": "出卡II",
    "出卡2": "出卡II",
    "发牌iii": "出卡III",
    "发牌3": "出卡III",
    "發牌iii": "出卡III",
    "發牌3": "出卡III",
    "出卡iii": "出卡III",
    "出卡3": "出卡III",
    "阳星": "陽星",
    "先天禀赋": "先天稟賦",
    "星极抽卡": "星極抽卡",
    "灵极抽卡": "靈極抽卡",
    "阳星相位": "陽星相位",
    "命运之轮": "命運之輪",
    "天星冲日": "天星衝日",
    "星体爆轰": "星體爆轟",
    "小奥秘卡": "小奧秘卡",
    "天星交错": "天星交錯",
    "天宫图": "天宮圖",
    "中间学派": "中間學派",
    "阳星合相": "陽星合相",
    "即刻咏唱": "即刻詠唱",
    "沉稳咏唱": "沉穩詠唱",
    "营救": "營救",
    "沉静": "沉靜",
    "天星沖日": "天星衝日"
  };

  // Helper function to resolve skill name to Traditional Chinese database name
  function resolveSkillName(rawName) {
    const cleaned = rawName.replace(/\[HQ\]/gi, '').trim();
    const lower = cleaned.toLowerCase();
    
    // Special check for potions/tinctures/gemdraughts/幻药
    if (lower.includes("爆发药") || lower.includes("爆發藥") || lower.includes("幻药") || lower.includes("幻藥") || lower.includes("potion") || lower.includes("tincture") || lower.includes("gemdraught")) {
      return "爆發藥";
    }
    
    // Direct match in translation table
    if (skillTranslation[lower]) {
      return skillTranslation[lower];
    }
    
    // Direct check if it matches database skill name (Traditional Chinese)
    const exactMatch = jobDb.skills.find(s => s.name === cleaned);
    if (exactMatch) return exactMatch.name;

    // Check with normalized name
    const normalizedMatch = jobDb.skills.find(s => s.name.toLowerCase() === lower);
    if (normalizedMatch) return normalizedMatch.name;

    // Try a partial matches or case-insensitive matches
    for (let key in skillTranslation) {
      if (lower.includes(key)) {
        return skillTranslation[key];
      }
    }

    return null;
  }

  // Identify matching skill objects for each event
  const matchedEvents = [];
  events.forEach(ev => {
    const dbName = resolveSkillName(ev.skillRawName);
    if (dbName) {
      const skill = jobDb.skills.find(s => s.name === dbName);
      if (skill) {
        matchedEvents.push({
          ...ev,
          skill: skill,
          skillId: skill.id
        });
      }
    }
  });

  if (matchedEvents.length === 0) return 0;

  // Auto-detect player name if filterPlayer is not provided
  let targetPlayer = filterPlayer;
  if (!targetPlayer) {
    const actorCounts = {};
    matchedEvents.forEach(ev => {
      if (ev.actor) {
        actorCounts[ev.actor] = (actorCounts[ev.actor] || 0) + 1;
      }
    });

    // Find actor with max counts
    let maxActor = '';
    let maxCount = 0;
    for (const actor in actorCounts) {
      if (actorCounts[actor] > maxCount) {
        maxCount = actorCounts[actor];
        maxActor = actor;
      }
    }
    targetPlayer = maxActor;
    console.log('Auto-detected target player from log:', targetPlayer);
  }
  importedPlayerName = targetPlayer || null;
  timelinePlayers[targetTimelineId - 1] = targetPlayer || null;

  // Filter events by player (if targetPlayer is determined)
  let filteredEvents = matchedEvents;
  if (targetPlayer) {
    const targetLower = targetPlayer.toLowerCase();
    filteredEvents = matchedEvents.filter(ev => ev.actor && ev.actor.toLowerCase() === targetLower);
    if (filteredEvents.length === 0) {
      // fallback: if filter failed entirely, keep original matches
      filteredEvents = matchedEvents;
    }
  }

  // Deduplicate and resolve startTime for each cast
  const finalSkills = [];

  // Sort events by time
  filteredEvents.sort((a, b) => a.time - b.time);

  filteredEvents.forEach((ev) => {
    const skill = ev.skill;
    const isGcd = (skill.classification === '戰技' || skill.classification === '魔法');
    const castTime = parseTimeToSeconds(skill.cast);

    if (ev.isStartCast) {
      // Starts casting event
      finalSkills.push({
        skillId: skill.id,
        name: skill.name,
        icon: skill.icon,
        classification: skill.classification,
        cast: skill.cast,
        recast: skill.recast,
        startTime: ev.time,
        completionTime: ev.time + castTime,
        duration: Math.max(castTime, isGcd ? timelineGCDDuration : 0.6),
        track: isGcd ? 'gcd' : 'ogcd',
        isGcd: isGcd,
        parentGcdId: null,
        relativeOffset: 0,
        isStartCast: true
      });
    } else {
      // Casts event
      if (castTime > 0) {
        // Look back for a starts-casting event of same skill within 2.0s
        // ONLY match against skills that were explicitly added via isStartCast starts-casting events
        const alreadyParsed = finalSkills.find(s => s.skillId === skill.id && s.isStartCast === true && Math.abs(s.startTime - (ev.time - castTime)) < 2.0);
        if (alreadyParsed) {
          // Yes, already recorded when it started casting, skip
          return;
        }
        // No starts-casting event found, we insert it starting at (ev.time - castTime)
        finalSkills.push({
          skillId: skill.id,
          name: skill.name,
          icon: skill.icon,
          classification: skill.classification,
          cast: skill.cast,
          recast: skill.recast,
          startTime: ev.time - castTime,
          completionTime: ev.time,
          duration: Math.max(castTime, isGcd ? timelineGCDDuration : 0.6),
          track: isGcd ? 'gcd' : 'ogcd',
          isGcd: isGcd,
          parentGcdId: null,
          relativeOffset: 0,
          isStartCast: false
        });
      } else {
        // Instant cast
        finalSkills.push({
          skillId: skill.id,
          name: skill.name,
          icon: skill.icon,
          classification: skill.classification,
          cast: skill.cast,
          recast: skill.recast,
          startTime: ev.time,
          completionTime: ev.time,
          duration: 0.6, // default instant duration
          track: isGcd ? 'gcd' : 'ogcd',
          isGcd: isGcd,
          parentGcdId: null,
          relativeOffset: 0,
          isStartCast: false
        });
      }
    }
  });

  if (finalSkills.length === 0) return 0;

  // Clear timeline if requested
  if (clearTimeline) {
    timelineSkills = timelineSkills.filter(s => (s.timelineId || 1) !== targetTimelineId);
  }

  // Parent oGCDs to preceding GCDs
  // First, generate random instanceId for each final skill
  finalSkills.forEach(s => {
    s.instanceId = 'skill_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  });

  const gcds = finalSkills.filter(s => s.isGcd).sort((a, b) => a.startTime - b.startTime);
  const ogcds = finalSkills.filter(s => !s.isGcd);

  ogcds.forEach(ogcd => {
    // Find closest preceding GCD based on completion times
    const parent = gcds.slice().reverse().find(g => g.completionTime <= ogcd.completionTime);
    if (parent) {
      ogcd.parentGcdId = parent.instanceId;
      ogcd.relativeOffset = ogcd.completionTime - parent.startTime;
    } else {
      ogcd.parentGcdId = null;
      ogcd.relativeOffset = 0;
    }
  });

  // Push to timelineSkills
  finalSkills.forEach(s => {
    timelineSkills.push({
      instanceId: s.instanceId,
      skillId: s.skillId,
      name: s.name,
      icon: s.icon,
      classification: s.classification,
      cast: s.cast,
      recast: s.recast,
      startTime: Math.round(s.startTime * 1000) / 1000,
      duration: s.duration,
      track: s.track,
      parentGcdId: s.parentGcdId,
      relativeOffset: Math.round(s.relativeOffset * 1000) / 1000,
      clip: 0,
      idle: 0,
      timelineId: targetTimelineId
    });
  });

  recalculateTimeline();
  renderTimeline();
  autoSave();

  return finalSkills.length;
}

// 14. Copy Text Rotation (Clipboard)
async function copyTextTimeline() {
  if (timelineSkills.length === 0) {
    alert('時間軸目前無任何技能！');
    return;
  }
  
  const includeMechanics = await window.showCustomConfirm('匯出文字軸', '是否要包含首領機制？', '否', '是');
  
  // Combine skills and mechanics, sorted by time
  const items = [];
  timelineSkills.forEach(s => {
    items.push({
      time: s.startTime,
      text: s.track === 'gcd' ? `[${s.name}]` : `(${s.name})`,
      type: 'skill'
    });
  });
  
  if (includeMechanics && bossMechanics && bossMechanics.length > 0) {
    bossMechanics.forEach(m => {
      items.push({
        time: m.time,
        text: `==== 首領機制: ${m.name} ====`,
        type: 'mechanic'
      });
    });
  }
  
  items.sort((a, b) => a.time - b.time);
  
  let result = `=== FFXIV 排軸文字檔 (${skillsDatabase[currentJobId]?.name || ''} | GCD: ${timelineGCDDuration.toFixed(2)}s) ===\n`;
  items.forEach(item => {
    const timeStr = formatTime(item.time);
    result += `${timeStr}  ${item.text}\n`;
  });
  
  navigator.clipboard.writeText(result).then(() => {
    if (typeof showToast === 'function') {
      showToast('✅ 複製文字排軸成功！已複製到剪貼簿。');
    } else {
      alert('複製文字排軸成功！您可以貼到 Discord 或記事本了！');
    }
  }).catch(err => {
    console.error('Clipboard copy failed:', err);
    alert('複製失敗，瀏覽器拒絕了剪貼簿訪問。');
  });
}

// 15. Canvas Rendering for Long Image Download
async function downloadTimelineImage() {
  if (timelineSkills.length === 0) {
    alert('時間軸中無任何內容可匯出圖片！');
    return;
  }
  window.trackEvent('personal_planner', 'export_image', { job: currentJobId });
  
  let maxTime = 60;
  timelineSkills.forEach(s => { maxTime = Math.max(maxTime, s.startTime + s.duration); });
  bossMechanics.forEach(m => { maxTime = Math.max(maxTime, m.time); });
  
  const canvas = document.getElementById('export-canvas');
  const ctx = canvas.getContext('2d');
  
  // Set dimensions (fixed headers + timeline width)
  const headerWidth = 180;
  const tWidth = (maxTime + PREPULL_TIME) * pixelsPerSecond + 50;
  const totalWidth = headerWidth + tWidth;
  const totalHeight = 40 + 60 + 50 + 80 + 80 + 20; // Ruler, Boss, Buff, GCD, oGCD, footer
  
  canvas.width = totalWidth;
  canvas.height = totalHeight;
  
  // Backing fill
  ctx.fillStyle = '#0e1017';
  ctx.fillRect(0, 0, totalWidth, totalHeight);
  
  // Draw Track backgrounds
  ctx.fillStyle = '#12141c';
  ctx.fillRect(0, 0, totalWidth, 40); // Ruler
  
  // Track dividers
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  
  const yTracks = [40, 100, 150, 230, 310];
  yTracks.forEach(y => {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(totalWidth, y);
    ctx.stroke();
  });
  
  // Draw headers
  ctx.fillStyle = '#12141c';
  ctx.fillRect(0, 40, headerWidth, totalHeight - 40);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(headerWidth, 0);
  ctx.lineTo(headerWidth, totalHeight);
  ctx.stroke();
  
  // Track title labels
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('首領機制 (Boss)', 15, 75);
  ctx.fillText('團輔覆蓋 (Buffs)', 15, 130);
  ctx.fillText('戰技/魔法 (GCD)', 15, 195);
  ctx.fillText('能力技 (oGCD)', 15, 275);
  
  // Draw ruler ticks
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px monospace';
  for (let t = -PREPULL_TIME; t <= maxTime; t += 1) {
    const x = headerWidth + (t + PREPULL_TIME) * pixelsPerSecond;
    ctx.beginPath();
    ctx.moveTo(x, 25);
    ctx.lineTo(x, 40);
    ctx.stroke();
    
    if (t % 5 === 0) {
      ctx.fillText(formatTime(t), x + 4, 20);
    }
  }
  
  // Draw pull line (0.0s)
  const pullX = headerWidth + PREPULL_TIME * pixelsPerSecond;
  ctx.save();
  ctx.strokeStyle = '#ff4757';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pullX, 40);
  ctx.lineTo(pullX, totalHeight);
  ctx.stroke();
  
  // Draw pull line label banner
  ctx.fillStyle = '#ff4757';
  ctx.beginPath();
  ctx.roundRect(pullX - 2, 42, 68, 16, 3);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px sans-serif';
  ctx.fillText('開怪 (Pull)', pullX + 5, 53);
  ctx.restore();
  
  // Load & draw skill icons helper
  const loadedImages = {};
  const loadImg = (src) => new Promise((resolve) => {
    if (loadedImages[src]) return resolve(loadedImages[src]);
    const img = new Image();
    img.onload = () => {
      loadedImages[src] = img;
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
  
  // Pre-load all icons on timeline
  const uniqueIcons = [...new Set(timelineSkills.map(s => s.icon))];
  await Promise.all(uniqueIcons.map(loadImg));
  
  // 1. Draw Boss Mechanics
  bossMechanics.forEach(mech => {
    const x = headerWidth + (mech.time + PREPULL_TIME) * pixelsPerSecond;
    
    // Vertical dashed red line
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 51, 51, 0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x, 40);
    ctx.lineTo(x, totalHeight);
    ctx.stroke();
    ctx.restore();
    
    // Badge card
    ctx.fillStyle = 'rgba(70, 20, 22, 0.95)';
    ctx.strokeStyle = '#ff3333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, 50, 96, 36, 6);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#ffb3b3';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(mech.name, x + 6, 77);
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = '8px monospace';
    ctx.fillText(formatTime(mech.time), x + 6, 62);
  });
  
  // 2. Draw Buff Overlays
  timelineSkills.forEach(skill => {
    const buffConfig = BUFF_MAP[skill.name];
    if (buffConfig) {
      const x = headerWidth + (skill.startTime + PREPULL_TIME) * pixelsPerSecond;
      const w = buffConfig.duration * pixelsPerSecond;
      
      ctx.fillStyle = buffConfig.color;
      ctx.strokeStyle = buffConfig.color.replace('0.45', '0.8');
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.roundRect(x, 108, w, 32, 6);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#ffe0a3';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(buffConfig.label, x + 10, 128);
    }
  });
  
  // 3. Draw GCD blocks
  const gcds = timelineSkills.filter(s => s.track === 'gcd');
  for (const skill of gcds) {
    const x = headerWidth + (skill.startTime + PREPULL_TIME) * pixelsPerSecond;
    const w = skill.duration * pixelsPerSecond;
    
    // Card fill
    ctx.fillStyle = '#161a23';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, 163, w, 54, 8);
    ctx.fill();
    ctx.stroke();
    
    // Left boundary accent
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(x, 163, 3, 54);
    
    // Cast and Recast locking indicators
    const castTime = (skill.effectiveCast !== undefined) ? skill.effectiveCast : parseTimeToSeconds(skill.cast);
    if (castTime > 0) {
      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.fillRect(x + 3, 163, castTime * pixelsPerSecond - 3, 54);
    }
    
    // Draw icon image
    const iconImg = loadedImages[skill.icon];
    if (iconImg) {
      ctx.drawImage(iconImg, x + 8, 171, 38, 38);
    }
    
    // Text label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(skill.name, x + 52, 195);
    
    // Red clip overlay
    if (skill.clip > 0) {
      ctx.fillStyle = 'rgba(255, 71, 87, 0.35)';
      const clipX = x + skill.duration * pixelsPerSecond;
      ctx.fillRect(clipX, 163, skill.clip * pixelsPerSecond, 54);
      
      ctx.fillStyle = '#ff8b94';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(`卡 ${skill.clip.toFixed(1)}s`, clipX + 5, 185);
    }

    // Delay / Idle warning overlay
    if (skill.idle > 0.05) {
      const isIdle = skill.idle > timelineGCDDuration;
      const label = isIdle ? '空轉' : '延遲';
      const idleX = x + (skill.duration + skill.clip) * pixelsPerSecond;
      ctx.fillStyle = isIdle ? 'rgba(239, 68, 68, 0.18)' : 'rgba(245, 158, 11, 0.15)';
      ctx.fillRect(idleX, 163, skill.idle * pixelsPerSecond, 54);
      
      ctx.fillStyle = isIdle ? '#f87171' : '#fbbf24';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(`${label} ${skill.idle.toFixed(2)}s`, idleX + 5, 185);
    }
  }
  
  // 4. Draw oGCD blocks (Pills)
  const ogcds = timelineSkills.filter(s => s.track === 'ogcd');
  for (const skill of ogcds) {
    const x = headerWidth + (skill.startTime + PREPULL_TIME) * pixelsPerSecond;
    
    // Card fill
    ctx.fillStyle = '#1e1826';
    const isRole = skill.skillId.includes('tank_action') || skill.skillId.includes('healer_action') || skill.skillId.includes('melee_action') || skill.skillId.includes('ranged_action') || skill.skillId.includes('caster_action');
    ctx.strokeStyle = isRole ? '#d800ff' : '#ffaa00';
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.roundRect(x, 250, 110, 40, 20); // standard pill shape
    ctx.fill();
    ctx.stroke();
    
    // Draw icon image
    const iconImg = loadedImages[skill.icon];
    if (iconImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + 20, 270, 15, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(iconImg, x + 5, 255, 30, 30);
      ctx.restore();
    }
    
    // Text label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(skill.name, x + 40, 274);
  }
  
  // Download file trigger
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `ffxiv_timeline_${currentJobId}_plan.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// 16. Custom Tooltip Popup Card
function showTooltip(e, skill) {
  if (!skill || window.isDraggingInProgress) {
    hideTooltip();
    return;
  }
  
  tooltip.style.display = 'block';
  tooltip.style.left = `${e.clientX + 15}px`;
  tooltip.style.top = `${e.clientY + 15}px`;
  
  // Prevent tooltip from overflowing the viewport
  const rect = tooltip.getBoundingClientRect();
  if (rect.right > window.innerWidth) {
    tooltip.style.left = `${e.clientX - rect.width - 15}px`;
  }
  if (rect.bottom > window.innerHeight) {
    tooltip.style.top = `${e.clientY - rect.height - 15}px`;
  }
  
  tooltip.querySelector('.tooltip-icon').src = skill.icon;
  tooltip.querySelector('.tooltip-name').textContent = skill.isInterrupted ? `⚠️ [施法中斷] ${skill.name}` : skill.name;
  tooltip.querySelector('.tooltip-badge').textContent = skill.isInterrupted ? '施法中斷' : skill.classification;
  tooltip.querySelector('.tooltip-lv').textContent = `Lv.${skill.level || '?'}`;
  const mpLabel = tooltip.querySelector('#tooltip-mp-label');
  if (mpLabel) mpLabel.textContent = '消費 MP:';
  tooltip.querySelector('.tooltip-mp').textContent = skill.cost || '-';
  tooltip.querySelector('.tooltip-times').textContent = `${skill.cast || '-'} / ${skill.recast || '-'}`;
  tooltip.querySelector('.tooltip-range').textContent = skill.range || '-';
  tooltip.querySelector('.tooltip-description').textContent = skill.isInterrupted ? '（玩家於讀條過程中移動或取消，未完成施放）' : (skill.effect || '');
  
  // Set badge color based on type
  const badge = tooltip.querySelector('.tooltip-badge');
  badge.style.backgroundColor = skill.isInterrupted ? '#ef4444' : (skill.classification === '能力' ? 'var(--color-ogcd)' : 'var(--color-gcd)');

  // Hover guide and current time display
  const hoverGuide = document.getElementById('hover-guide');
  if (hoverGuide) hoverGuide.style.display = 'none';
  const compareHoverGuide = document.getElementById('compare-hover-guide');
  if (compareHoverGuide) compareHoverGuide.style.display = 'none';

  const activeHoverGuide = document.getElementById(activeTab === 'compare' ? 'compare-hover-guide' : 'hover-guide');
  const tooltipTime = document.getElementById('tooltip-time');
  const tooltipTimeVal = document.getElementById('tooltip-time-val');
  
  if (typeof skill.startTime === 'number') {
    if (activeHoverGuide) {
      activeHoverGuide.style.display = 'block';
      activeHoverGuide.style.left = `${TRACK_INFO_WIDTH + (skill.startTime + PREPULL_TIME) * pixelsPerSecond}px`;
    }
    if (tooltipTime && tooltipTimeVal) {
      tooltipTime.style.display = 'block';
      const playerSuffix = skill.playerName ? ` [${skill.playerName}]` : '';
      tooltipTimeVal.textContent = `開始時間：${formatTime(skill.startTime)}${playerSuffix}`;
    }
  } else {
    if (activeHoverGuide) activeHoverGuide.style.display = 'none';
    if (tooltipTime) tooltipTime.style.display = 'none';
  }
}

function hideTooltip() {
  tooltip.style.display = 'none';
  const hoverGuide = document.getElementById('hover-guide');
  if (hoverGuide) hoverGuide.style.display = 'none';
  const compareHoverGuide = document.getElementById('compare-hover-guide');
  if (compareHoverGuide) compareHoverGuide.style.display = 'none';
  const tooltipTime = document.getElementById('tooltip-time');
  if (tooltipTime) tooltipTime.style.display = 'none';
}

// ── Supabase Integration for Individual Plans ──
let currentIndivPlanId = null;
let currentIndivEditToken = null;
let currentIndivReadToken = null;
let currentIndivPlanName = '未命名個人排軸';
let savesModalMode = 'load'; // 'load' or 'save'

async function saveIndivPlanToSupabase() {
  const sb = window.supabaseClient;
  if (!sb) {
    alert('資料庫尚未就緒！請先於團隊技能排軸頁籤中登入。');
    return;
  }
  
  // Retrieve user session
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    alert('請先在團隊技能排軸頁面登入，才能保存計畫紀錄！');
    return;
  }

  try {
    const choice = await window.showCustomSaveChoices();
    if (choice === null) return;

    if (choice === 'existing') {
      savesModalMode = 'save';
      await loadIndivPlansModal();
    } else if (choice === 'new') {
      let defaultName = currentIndivPlanName;
      if (currentIndivPlanName === '未命名個人排軸') {
        let dutyName = '無副本';
        if (dutySelect && dutySelect.value && dutySelect.value !== 'custom') {
          const selectedOption = dutySelect.options[dutySelect.selectedIndex];
          if (selectedOption) {
            dutyName = selectedOption.text.trim();
          }
        }
        
        let baseName = dutyName.replace(/\s*\(P\d+.*?\)/gi, '').replace(/\s*\(All\)/gi, '').replace(/\s*\(自訂時間軸\)/g, '').trim().replace(/\s+/g, '-');
        if (!baseName || baseName === '無副本-(自訂時間軸)') {
          baseName = '無副本';
        }
        
        const { data: existingPlans, error: fetchErr } = await sb.from('individual_plans')
          .select('name')
          .eq('owner_id', session.user.id);
        
        let nextNum = 1;
        if (!fetchErr && existingPlans) {
          const names = existingPlans.map(p => p.name);
          let maxNum = 0;
          const escapedBase = baseName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const regex = new RegExp(`^${escapedBase}-(\\d+)$`);
          names.forEach(n => {
            const match = n.match(regex);
            if (match) {
              const num = parseInt(match[1], 10);
              if (num > maxNum) maxNum = num;
            }
          });
          nextNum = maxNum + 1;
        }
        defaultName = `${baseName}-${nextNum}`;
      }

      const name = await window.showCustomPrompt('保存紀錄', '請輸入新的存檔名稱：', defaultName);
      if (name === null) return;
      if (name.trim() === '') {
        alert('計畫名稱不能為空！');
        return;
      }
      currentIndivPlanName = name.trim();

      const skillsToSave = [...timelineSkills];
      if (currentDutyFile || activeTimelinesCount > 1 || timelinePlayers.some(p => p !== null)) {
        skillsToSave.push({ 
          isMetadata: true, 
          dutyFile: currentDutyFile, 
          player: timelinePlayers[0],
          activeTimelinesCount: activeTimelinesCount,
          timelinePlayers: timelinePlayers
        });
      }

      const { data, error } = await sb.from('individual_plans')
        .insert({
          owner_id: session.user.id,
          job_id: currentJobId,
          name: currentIndivPlanName,
          skills: skillsToSave,
          gcd: timelineGCDDuration
        })
        .select()
        .single();

      if (error) throw error;

      currentIndivPlanId = data.id;
      currentIndivEditToken = data.edit_token;
      currentIndivReadToken = data.read_token;
      window.trackEvent('personal_planner', 'save_cloud', { type: 'new', name: currentIndivPlanName, job: currentJobId });
      alert('雲端個人排軸建立成功！');
    }
  } catch (err) {
    alert(`保存失敗: ${err.message}`);
  }
}

async function loadIndivPlansModal() {
  const sb = window.supabaseClient;
  if (!sb) {
    alert('資料庫尚未就緒！請先於團隊技能排軸頁籤中登入。');
    return;
  }

  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    alert('請先在團隊技能排軸頁面登入以讀取您的雲端個人排軸！');
    return;
  }

  try {
    const { data: plans, error } = await sb.from('individual_plans')
      .select('id, name, job_id, skills, updated_at')
      .eq('owner_id', session.user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    const savesModal = document.getElementById('saves-modal');
    const savesList = document.getElementById('saves-list');
    const savesModalTitle = document.querySelector('#saves-modal .modal-header h3');
    
    if (savesModalTitle) {
      savesModalTitle.innerHTML = `<i class="fa-solid fa-folder-open"></i> ${savesModalMode === 'save' ? '選擇欲覆蓋的存檔' : '選擇讀取的雲端存檔'}`;
    }
    
    savesList.innerHTML = '';
    if (plans.length === 0) {
      savesList.innerHTML = '<li class="empty-state">尚無雲端儲存紀錄</li>';
    } else {
      plans.forEach(plan => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.padding = '8px 12px';
        li.style.borderBottom = '1px solid var(--border-color)';
        
        const meta = (plan.skills || []).find(s => s.isMetadata);
        const dutyFile = meta ? meta.dutyFile : '';
        const dutyName = getDutyName(dutyFile);
        const jobName = skillsDatabase[plan.job_id]?.name || plan.job_id;

        li.innerHTML = `
          <div style="cursor:pointer; flex:1;">
            <strong>${plan.name}</strong><br/>
            <span style="font-size:10px; color:var(--color-text-muted);">職業: ${jobName} | 副本: ${dutyName} | 更新於 ${new Date(plan.updated_at).toLocaleString()}</span>
          </div>
          <div class="save-actions" style="display:flex; align-items:center;">
            <button class="btn btn-secondary btn-mini btn-mini-rename" style="padding: 2px 6px; margin-right: 5px;" title="重新命名"><i class="fa-solid fa-pen"></i></button>
            <button class="btn btn-danger btn-mini btn-mini-del" style="padding: 2px 6px;" title="刪除"><i class="fa-solid fa-trash"></i></button>
          </div>
        `;
        
        li.querySelector('div').addEventListener('click', async () => {
          if (savesModalMode === 'save') {
            const ok = await window.showCustomConfirm('覆蓋存檔', `確定要覆蓋「${plan.name}」嗎？`);
            if (ok) {
              try {
                const skillsToSave = [...timelineSkills];
                if (currentDutyFile || activeTimelinesCount > 1 || timelinePlayers.some(p => p !== null)) {
                  skillsToSave.push({ 
                    isMetadata: true, 
                    dutyFile: currentDutyFile, 
                    player: timelinePlayers[0],
                    activeTimelinesCount: activeTimelinesCount,
                    timelinePlayers: timelinePlayers
                  });
                }
                const { error: updErr } = await sb.from('individual_plans')
                  .update({
                    skills: skillsToSave,
                    gcd: timelineGCDDuration,
                    updated_at: new Date()
                  })
                  .eq('id', plan.id);
                if (updErr) throw updErr;
                window.trackEvent('personal_planner', 'save_cloud', { type: 'existing', name: plan.name, job: currentJobId });
                alert(`「${plan.name}」覆蓋保存成功！`);
                currentIndivPlanId = plan.id;
                currentIndivPlanName = plan.name;
                savesModal.classList.remove('active');
              } catch (updErr) {
                alert(`覆蓋儲存失敗: ${updErr.message}`);
              }
            }
          } else {
            await loadIndivPlanById(plan.id);
            savesModal.classList.remove('active');
          }
        });
        
        li.querySelector('.btn-mini-rename').addEventListener('click', async (e) => {
          e.stopPropagation();
          const newName = await window.showCustomPrompt('重新命名雲端存檔', '請輸入新的存檔名稱：', plan.name);
          if (newName === null) return;
          if (newName.trim() === '') {
            alert('名稱不能為空！');
            return;
          }
          
          try {
            const { error: renameErr } = await sb.from('individual_plans')
              .update({ name: newName.trim(), updated_at: new Date() })
              .eq('id', plan.id);
            if (renameErr) throw renameErr;
            alert('重命名成功！');
            await loadIndivPlansModal();
          } catch (err) {
            alert(`重命名失敗: ${err.message}`);
          }
        });
        
        li.querySelector('.btn-mini-del').addEventListener('click', async (e) => {
          e.stopPropagation();
          const ok = await window.showCustomConfirm('刪除存檔', `確定要刪除「${plan.name}」嗎？`);
          if (ok) {
            const { error: delErr } = await sb.from('individual_plans').delete().eq('id', plan.id);
            if (delErr) {
              alert('刪除失敗');
            } else {
              li.remove();
            }
          }
        });
        
        savesList.appendChild(li);
      });
    }
    
    savesModal.classList.add('active');
  } catch (err) {
    alert(`讀取雲端清單失敗: ${err.message}`);
  }
}

async function loadIndivPlanById(planId) {
  const sb = window.supabaseClient;
  if (!sb) return;

  try {
    const { data: plan, error } = await sb.from('individual_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) throw error;

    currentIndivPlanId = plan.id;
    currentIndivEditToken = plan.edit_token;
    currentIndivReadToken = plan.read_token;
    currentIndivPlanName = plan.name;
    window.trackEvent('personal_planner', 'load_cloud', { name: plan.name, job: plan.job_id });

    currentJobId = plan.job_id;
    jobSelect.value = plan.job_id;
    syncCustomDropdown(jobSelect);
    loadJobSkills(plan.job_id);

    const meta = (plan.skills || []).find(s => s.isMetadata);
    currentDutyFile = meta ? meta.dutyFile : '';
    importedPlayerName = meta ? meta.player : null;
    activeTimelinesCount = meta && meta.activeTimelinesCount ? meta.activeTimelinesCount : 1;
    timelinePlayers = meta && meta.timelinePlayers ? meta.timelinePlayers : [importedPlayerName, null, null];
    
    if (dutySelect) {
      dutySelect.value = currentDutyFile;
      populateDutyDropdown(dutiesDatabase, currentDutyFile);
    }

    timelineSkills = (plan.skills || []).filter(s => !s.isMetadata);
    timelineGCDDuration = parseFloat(plan.gcd) || 2.50;

    // Load boss mechanics from duty file if it exists
    if (currentDutyFile) {
      try {
        await loadDuty(currentDutyFile, false);
      } catch (err) {
        console.error('Failed to load duty mechanics for cloud save:', err);
      }
    } else {
      bossMechanics = [];
    }

    recalculateTimeline();
    renderTimeline();
    alert(`已載入個人排軸「${plan.name}」！`);
  } catch (err) {
    alert(`載入計畫失敗: ${err.message}`);
  }
}

function syncCustomDropdown(selectEl) {
  if (!selectEl) return;
  
  let containerId = selectEl.id ? (selectEl.id + '-custom-container') : null;
  if (!containerId) {
    if (!selectEl.dataset.customId) {
      selectEl.dataset.customId = 'custom-select-' + Math.random().toString(36).substring(2, 9);
    }
    containerId = selectEl.dataset.customId + '-container';
  }
  
  let container = document.getElementById(containerId);
  
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.className = 'custom-dropdown-container';
    
    const trigger = document.createElement('div');
    trigger.className = 'custom-dropdown-trigger';
    trigger.innerHTML = `
      <span class="custom-dropdown-trigger-text"></span>
      <i class="fa-solid fa-chevron-down"></i>
    `;
    container.appendChild(trigger);
    
    const menu = document.createElement('div');
    menu.className = 'custom-dropdown-menu';
    container.appendChild(menu);
    
    selectEl.parentNode.insertBefore(container, selectEl.nextSibling);
    selectEl.style.display = 'none';
    
    trigger.addEventListener('click', (e) => {
      if (selectEl.disabled) return;
      e.stopPropagation();
      const isActive = container.classList.contains('active');
      
      document.querySelectorAll('.custom-dropdown-container').forEach(c => {
        if (c !== container) c.classList.remove('active');
      });
      
      container.classList.toggle('active');
      
      if (!isActive) {
        const val = selectEl.value;
        const activeItem = menu.querySelector(`.custom-dropdown-item[data-value="${val}"]`);
        if (activeItem) {
          const catKey = activeItem.dataset.category;
          if (catKey) {
            const header = menu.querySelector(`.custom-dropdown-header[data-category="${catKey}"]`);
            if (header) {
              menu.scrollTop = header.offsetTop;
            }
          } else {
            menu.scrollTop = activeItem.offsetTop - 10;
          }
        }
      }
    });
    
    document.addEventListener('click', () => {
      container.classList.remove('active');
    });
    
    selectEl.addEventListener('change', () => {
      updateCustomDropdownSelection(selectEl, container);
    });
  }
  
  const menu = container.querySelector('.custom-dropdown-menu');
  menu.innerHTML = '';
  
  // Parse options and optgroups from the select element
  Array.from(selectEl.children).forEach(child => {
    if (child.tagName === 'OPTION') {
      // Skip disabled placeholder option if there are other options
      if (child.disabled && selectEl.children.length > 1) return;
      
      const item = document.createElement('div');
      item.className = 'custom-dropdown-item';
      item.dataset.value = child.value;
      item.textContent = child.textContent;
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        selectEl.value = child.value;
        selectEl.dispatchEvent(new Event('change'));
        container.classList.remove('active');
      });
      menu.appendChild(item);
    } else if (child.tagName === 'OPTGROUP') {
      const catKey = child.label || child.id || Math.random().toString();
      const header = document.createElement('div');
      header.className = 'custom-dropdown-header';
      header.dataset.category = catKey;
      header.textContent = child.label;
      menu.appendChild(header);
      
      Array.from(child.children).forEach(opt => {
        const item = document.createElement('div');
        item.className = 'custom-dropdown-item';
        item.dataset.value = opt.value;
        item.dataset.category = catKey;
        item.textContent = opt.textContent;
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          selectEl.value = opt.value;
          selectEl.dispatchEvent(new Event('change'));
          container.classList.remove('active');
        });
        menu.appendChild(item);
      });
    }
  });
  
  if (selectEl.disabled) {
    container.classList.add('disabled');
    container.style.pointerEvents = 'none';
    container.style.opacity = '0.6';
  } else {
    container.classList.remove('disabled');
    container.style.pointerEvents = '';
    container.style.opacity = '';
  }
  
  updateCustomDropdownSelection(selectEl, container);
}

function updateCustomDropdownSelection(selectEl, container) {
  const val = selectEl.value;
  const triggerText = container.querySelector('.custom-dropdown-trigger-text');
  const items = container.querySelectorAll('.custom-dropdown-item');
  
  const selectedOpt = selectEl.querySelector(`option[value="${val}"]`) || selectEl.querySelector('option:checked') || selectEl.querySelector('option');
  let foundText = selectedOpt ? selectedOpt.textContent : '請選擇...';
  
  items.forEach(item => {
    if (item.dataset.value === val) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
  
  triggerText.textContent = foundText;
}

window.syncCustomDropdown = syncCustomDropdown;

// ── 18. Auto-Update Version Check ──
// 目前執行版本（烘焙進部署的檔案裡）。每次要發布新版時，
// 同步更新此常數與 version.json 內的 version 欄位即可觸發更新通知。
//
// 版本號規則（主.次.修 / SemVer）：
//   修訂號 +1：修 bug、改文字、調樣式等小改動      1.0.0 → 1.0.1
//   次版本 +1：新增功能（右側歸零）                1.0.1 → 1.1.0
//   主版本 +1：破壞性大改版（右側歸零）            1.9.0 → 2.0.0
// 註：header 的「(Patch 7.1)」是遊戲版本，與此無關，需在 index.html 手動維護。
const APP_VERSION = '1.8.4';
let updatePopupShown = false;

// Global Toast Notification Helper
function showToast(message, duration = 3000) {
  let toastContainer = document.getElementById('global-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'global-toast-container';
    toastContainer.className = 'global-toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'global-toast-item';
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}
window.showToast = showToast;

function initVersionCheck() {
  console.log('[Version Check] Current app version:', APP_VERSION);
  // 將 header 版本標籤同步為目前版本（Patch 標註仍由 HTML 手動維護）
  const versionEl = document.getElementById('app-version');
  if (versionEl) versionEl.textContent = APP_VERSION;
  // 立即檢查一次，之後每 60 秒檢查一次
  checkForUpdates();
  setInterval(checkForUpdates, 60000);
}

async function checkForUpdates() {
  if (updatePopupShown) return;
  try {
    const response = await fetch('./version.json?t=' + Date.now(), { cache: 'no-cache' });
    if (response.ok) {
      const data = await response.json();
      if (data.version && data.version !== APP_VERSION) {
        console.log('[Version Check] New version available:', data.version, '(current:', APP_VERSION + ')');
        showUpdateNotification(data.version);
      }
    }
  } catch (e) {
    console.warn('[Version Check] Check failed:', e);
  }
}

function showUpdateNotification(newVersion) {
  if (updatePopupShown) return;
  updatePopupShown = true;

  const toast = document.createElement('div');
  toast.className = 'update-toast';
  toast.innerHTML = `
    <div class="update-toast-header">
      <i class="fa-solid fa-cloud-arrow-down"></i>
      <span>系統有新版本發布！${newVersion ? ` (v${newVersion})` : ''}</span>
    </div>
    <div class="update-toast-body">
      請重新整理頁面以啟用最新功能與樣式。
    </div>
    <div class="update-toast-actions">
      <button class="btn-update-refresh" id="btn-toast-reload">
        <i class="fa-solid fa-arrows-rotate"></i> 重新整理
      </button>
    </div>
  `;

  toast.querySelector('#btn-toast-reload').addEventListener('click', () => {
    window.location.reload();
  });

  document.body.appendChild(toast);
}

// Start checking
initVersionCheck();

// ── Changelog (更新日誌) ──
function initChangelog() {
  const btn = document.getElementById('version-tag-btn');
  const modal = document.getElementById('changelog-modal');
  const closeBtn = document.getElementById('changelog-close');
  if (!btn || !modal) return;

  btn.addEventListener('click', openChangelogModal);
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openChangelogModal(); }
  });
  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
}

async function openChangelogModal() {
  const modal = document.getElementById('changelog-modal');
  const body = document.getElementById('changelog-body');
  if (!modal || !body) return;

  modal.classList.add('active');
  body.innerHTML = '<div class="changelog-loading" style="text-align:center; color: var(--color-text-muted); padding: 24px 0;"><i class="fa-solid fa-spinner fa-spin"></i> 載入中...</div>';

  const sb = window.supabaseClient;
  if (!sb) {
    body.innerHTML = '<div class="changelog-empty">目前無法載入更新日誌，請稍後再試。</div>';
    return;
  }

  try {
    const { data, error } = await sb
      .from('changelog')
      .select('version, released_at, content')
      .order('released_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    renderChangelog(data || []);
  } catch (e) {
    console.warn('[Changelog] load failed:', e);
    body.innerHTML = '<div class="changelog-empty">目前無法載入更新日誌，請稍後再試。</div>';
  }
}

function renderChangelog(entries) {
  const body = document.getElementById('changelog-body');
  if (!body) return;

  if (!entries.length) {
    body.innerHTML = '<div class="changelog-empty">目前尚無更新日誌。</div>';
    return;
  }

  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const fmtDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
      timeZone: 'Asia/Taipei'
    });
  };

  body.innerHTML = entries.map(en => {
    const items = String(en.content || '')
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => `<li>${esc(l)}</li>`)
      .join('');
    return `
      <div class="changelog-entry">
        <div class="changelog-entry-head">
          <span class="changelog-date">${fmtDate(en.released_at)}</span>
          <span class="changelog-version">v${esc(en.version)}</span>
        </div>
        <ul class="changelog-list">${items || '<li>—</li>'}</ul>
      </div>`;
  }).join('');
}

initChangelog();


// ============================================================
// FFLogs API Import Module
// ============================================================
const FFLOGS_EDGE_FN = 'https://bvsvmuktyhkoekjamwkm.supabase.co/functions/v1/fflogs-proxy';

// --- GraphQL helper ---
async function fflogsQuery(query, variables = {}) {
  const res = await fetch(FFLOGS_EDGE_FN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Edge Function error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map(e => e.message).join(', '));
  return json.data;
}

// --- Extract report code from FFLogs URL ---
function extractReportCode(url) {
  const m = url.match(/reports\/([A-Za-z0-9]+)/);
  return m ? m[1] : null;
}

window.fflogsQuery = fflogsQuery;
window.extractReportCode = extractReportCode;

// --- Modal state ---
let fflogsApiReportCode = null;
let fflogsApiFights = [];
let fflogsApiPlayers = [];

function openFFLogsApiModal() {
  const modal = document.getElementById('fflogs-api-modal');
  if (!modal) return;
  // Reset state
  document.getElementById('fflogs-api-url').value = '';
  document.getElementById('fflogs-api-fight-section').style.display = 'none';
  document.getElementById('fflogs-api-player-section').style.display = 'none';
  document.getElementById('fflogs-api-options-section').style.display = 'none';
  const importBtn = document.getElementById('fflogs-api-import');
  if (importBtn) {
    importBtn.style.display = 'none';
    importBtn.disabled = false;
  }
  fflogsApiSetStatus('');
  fflogsApiReportCode = null;
  modal.classList.add('active');
}

function fflogsApiSetStatus(msg, isError = false) {
  const el = document.getElementById('fflogs-api-status');
  if (!el) return;
  el.style.display = msg ? 'block' : 'none';
  el.style.color = isError ? '#ff6b6b' : 'var(--color-text-muted)';
  el.innerHTML = msg;
}

// --- Fetch report fights + players ---
// --- Parse playerDetails JSON blob into flat array ---
function parsePlayerDetails(pd) {
  const players = [];
  if (!pd) return players;
  // pd may be the raw JSON scalar returned by FFLogs
  const details = pd?.data?.playerDetails || pd?.playerDetails || pd || {};
  for (const role of Object.values(details)) {
    if (Array.isArray(role)) {
      for (const p of role) {
        if (p.id && p.name) players.push({ id: p.id, name: p.name, type: p.type || '' });
      }
    }
  }
  return players;
}

// --- Populate player selector from a fight's playerDetails ---
async function fflogsApiUpdatePlayers(fightId) {
  const playerSel = document.getElementById('fflogs-api-player-select');
  if (!playerSel || !fflogsApiReportCode) return;

  playerSel.disabled = true;
  playerSel.innerHTML = '<option>正在載入玩家...</option>';

  try {
    const data = await fflogsQuery(`
      query($code: String!, $fightId: [Int]!) {
        reportData {
          report(code: $code) {
            playerDetails(fightIDs: $fightId)
          }
        }
      }
    `, { code: fflogsApiReportCode, fightId: [fightId] });

    const pd = data.reportData.report.playerDetails;
    fflogsApiPlayers = parsePlayerDetails(pd);

    playerSel.innerHTML = '';
    if (fflogsApiPlayers.length > 0) {
      fflogsApiPlayers.forEach(p => {
        playerSel.innerHTML += `<option value="${p.id}">${p.name} (${p.type})</option>`;
      });
      document.getElementById('fflogs-api-player-section').style.display = 'flex';
    } else {
      playerSel.innerHTML = '<option value="0">全部玩家</option>';
    }
  } catch {
    playerSel.innerHTML = '<option value="0">無法載入玩家</option>';
  }
  playerSel.disabled = false;
}

// --- Extract URL query parameters helper ---
function extractUrlParams(url) {
  try {
    const urlObj = new URL(url);
    const fight = urlObj.searchParams.get('fight');
    const phase = urlObj.searchParams.get('phase');
    return {
      fight: fight ? parseInt(fight) : null,
      phase: phase ? parseInt(phase) : null
    };
  } catch {
    const fightMatch = url.match(/[?&]fight=(\d+)/);
    const phaseMatch = url.match(/[?&]phase=(\d+)/);
    return {
      fight: fightMatch ? parseInt(fightMatch[1]) : null,
      phase: phaseMatch ? parseInt(phaseMatch[1]) : null
    };
  }
}

// 依 FFLogs 戰鬥英文名稱比對出對應的本站副本檔（使用 index.json 的 fflogsAliases 別名表）。
// 若傳入 phaseParam 且同分類存在對應相位副本，優先回傳該相位；否則回傳別名表指定的副本。
// 找不到時回傳 null。
function matchDutyByFflogsName(fightName, phaseParam, dutiesDb) {
  const db = dutiesDb || (typeof dutiesDatabase !== 'undefined' ? dutiesDatabase : (window.dutiesDatabase || {}));
  if (!fightName || !db || !db.fflogsAliases) return null;

  const norm = String(fightName).toLowerCase().trim();
  let matchedFile = null;
  for (const [keyword, file] of Object.entries(db.fflogsAliases)) {
    if (keyword && norm.includes(String(keyword).toLowerCase())) {
      matchedFile = file;
      break;
    }
  }
  if (!matchedFile) return null;

  const duties = db.duties || [];
  const matchedDuty = duties.find(d => d.file === matchedFile);

  // 相位偏好：URL 帶 phase 且同分類有對應相位副本時優先選用
  if (matchedDuty && phaseParam != null) {
    const phaseDuty = duties.find(d =>
      d.category === matchedDuty.category &&
      !/&/.test(d.key) && !/all/i.test(d.key) &&
      new RegExp(`_P${phaseParam}\\b`, 'i').test(d.key)
    );
    if (phaseDuty) return phaseDuty.file;
  }

  return matchedFile;
}
window.matchDutyByFflogsName = matchDutyByFflogsName;

async function fflogsApiFetchReport() {
  const urlInput = document.getElementById('fflogs-api-url').value.trim();
  const code = extractReportCode(urlInput);
  if (!code) {
    fflogsApiSetStatus('⚠️ 請輸入有效的 FFLogs 報告連結（例如 https://www.fflogs.com/reports/ABC123）', true);
    return;
  }
  fflogsApiReportCode = code;
  fflogsApiSetStatus('<i class="fa-solid fa-spinner fa-spin"></i> 正在查詢報告...');

  try {
    const data = await fflogsQuery(`
      query($code: String!) {
        reportData {
          report(code: $code) {
            fights(killType: All) {
              id name kill startTime endTime
            }
          }
        }
      }
    `, { code });

    const report = data.reportData.report;
    fflogsApiFights = report.fights || [];

    if (fflogsApiFights.length === 0) {
      fflogsApiSetStatus('⚠️ 找不到戰鬥段落', true);
      return;
    }

    // Populate fight selector
    const fightSel = document.getElementById('fflogs-api-fight-select');
    fightSel.innerHTML = '';
    fflogsApiFights.forEach(f => {
      const dur = ((f.endTime - f.startTime) / 1000).toFixed(0);
      const label = `${f.name}${f.kill ? ' ✅' : ''} (${Math.floor(dur/60)}:${String(dur%60).padStart(2,'0')})`;
      fightSel.innerHTML += `<option value="${f.id}">${label}</option>`;
    });
    document.getElementById('fflogs-api-fight-section').style.display = 'flex';
    document.getElementById('fflogs-api-options-section').style.display = 'flex';
    document.getElementById('fflogs-api-import').style.display = 'inline-flex';

    // Parse URL params for auto-select
    const urlParams = extractUrlParams(urlInput);
    let targetFightId = fflogsApiFights[0].id;

    if (urlParams.fight !== null) {
      const matchedFight = fflogsApiFights.find(f => f.id === urlParams.fight);
      if (matchedFight) {
        targetFightId = matchedFight.id;
        fightSel.value = targetFightId;
      }
    }

    // Load players for the target fight
    await fflogsApiUpdatePlayers(targetFightId);

    // 自動匹配已知副本並載入其時間軸
    fflogsApiAutoMatchDuty(targetFightId, urlInput);

    fflogsApiSetStatus('');

  } catch (err) {
    fflogsApiSetStatus(`❌ 查詢失敗：${err.message}`, true);
    if (window.trackEvent) {
      window.trackEvent(activeTab === 'compare' ? '多人比較' : '個人排軸', 'fetch_fflogs_error', {
        'FFLogs 報告連結': urlInput,
        '錯誤訊息': err.message
      });
    }
  }
}

// 依選定戰鬥自動匹配並選取對應副本（個人 / 多人比較模式共用 duty-select）
function fflogsApiAutoMatchDuty(fightId, urlInput) {
  const fight = fflogsApiFights.find(f => f.id === fightId);
  if (!fight || !dutySelect) return;
  const phaseParam = extractUrlParams(urlInput || '').phase;
  const dutyFile = matchDutyByFflogsName(fight.name, phaseParam, dutiesDatabase);
  if (!dutyFile || dutySelect.value === dutyFile) return;
  dutySelect.value = dutyFile;
  if (typeof syncCustomDropdown === 'function') syncCustomDropdown(dutySelect, dutiesDatabase);
  dutySelect.dispatchEvent(new Event('change', { bubbles: true }));
}

function deriveEncounterPhaseFromDuty() {
  const sel = document.getElementById('duty-select') || document.getElementById('mit-duty-select');
  const v = sel ? sel.value : '';
  if (!v) return null;
  if (/&/.test(v) || /all/i.test(v)) return null;
  const m = v.match(/_P(\d+)/i) || v.match(/\bP(\d+)\b/i);
  return m ? parseInt(m[1], 10) : null;
}

// --- Fetch casts and import ---
async function fflogsApiImport() {
  const fightId = parseInt(document.getElementById('fflogs-api-fight-select').value);
  const sourceId = parseInt(document.getElementById('fflogs-api-player-select').value);
  const clearFirst = document.getElementById('fflogs-api-clear-timeline').checked;
  const urlInput = document.getElementById('fflogs-api-url').value.trim();

  if (!fflogsApiReportCode || !fightId) return;

  // Check if player's job matches current active job and prompt auto-switch if mismatch
  const selectedPlayer = fflogsApiPlayers.find(p => p.id === sourceId);
  if (activeTab !== 'compare' && selectedPlayer) {
    const playerJob = selectedPlayer.type.toLowerCase();
    if (skillsDatabase[playerJob]) {
      if (!currentJobId || timelineSkills.length === 0) {
        // Automatically set active job if none chosen yet or timeline is empty
        currentJobId = playerJob;
        jobSelect.value = currentJobId;
        syncCustomDropdown(jobSelect);
        loadJobSkills(currentJobId);
      } else if (playerJob !== currentJobId) {
        const playerJobName = skillsDatabase[playerJob]?.name || playerJob;
        const currentJobName = skillsDatabase[currentJobId]?.name || currentJobId;
        const ok = await window.showCustomConfirm(
          '職業不符',
          `您選擇的玩家職業是「${playerJobName}」，但目前時間軸是「${currentJobName}」。\n是否要自動切換為「${playerJobName}」並開始匯入？`
        );
        if (!ok) {
          fflogsApiSetStatus('⚠️ 匯入已取消（職業不符）', true);
          return;
        }
        
        // Switch active job
        currentJobId = playerJob;
        jobSelect.value = currentJobId;
        syncCustomDropdown(jobSelect);
        loadJobSkills(currentJobId);
        timelineSkills = [];
        bossMechanics = [];
      }
    }
  }

  let targetTimelineId = 1;
  let autoClear = clearFirst;
  
  if (activeTab !== 'compare' && timelineSkills.length > 0) {
    const choice = await promptImportTargetChoice();
    if (!choice) {
      document.getElementById('fflogs-api-import').disabled = false;
      fflogsApiSetStatus('⚠️ 匯入已取消', true);
      return;
    }
    
    if (choice.action === 'new') {
      activeTimelinesCount++;
      targetTimelineId = activeTimelinesCount;
      autoClear = false;
    } else {
      targetTimelineId = choice.timelineId;
      autoClear = true;
    }
  }

  fflogsApiSetStatus('<i class="fa-solid fa-spinner fa-spin"></i> 正在抓取施放事件...');
  document.getElementById('fflogs-api-import').disabled = true;

  // Find fight start time
  const fight = fflogsApiFights.find(f => f.id === fightId);
  const fightStart = fight ? fight.startTime : 0;

  // Build filterExpression if phase parameter is present
  const urlParams = extractUrlParams(urlInput);
  let targetPhase = urlParams.phase;
  if (targetPhase === null) {
    targetPhase = deriveEncounterPhaseFromDuty();
  }
  let filterExpr = "";
  if (targetPhase !== null) {
    filterExpr = `encounterPhase = ${targetPhase}`;
  }

  try {
    const data = await fflogsQuery(`
      query($code: String!, $fightId: Int!, $sourceId: Int!, $filterExpr: String) {
        reportData {
          report(code: $code) {
            masterData {
              abilities {
                gameID
                name
              }
            }
            targetabilityEvents: events(
              fightIDs: [$fightId]
              dataType: All
              hostilityType: Enemies
              filterExpression: "type = 'targetabilityupdate'"
              limit: 10000
            ) { data }
            events(
              fightIDs: [$fightId]
              dataType: Casts
              sourceID: $sourceId
              filterExpression: $filterExpr
              limit: 10000
            ) { data }
          }
        }
      }
    `, {
      code: fflogsApiReportCode,
      fightId,
      sourceId,
      filterExpr: filterExpr || null
    });

    const events = data.reportData?.report?.events?.data || [];
    if (events.length === 0) {
      fflogsApiSetStatus('⚠️ 沒有找到施放事件，請確認玩家選擇是否正確', true);
      document.getElementById('fflogs-api-import').disabled = false;
      return;
    }

    // Process Targetability (Downtime) Events
    const rawTargetability = data.reportData?.report?.targetabilityEvents?.data || [];
    const downtimeIntervals = [];
    let downtimeStart = null;

    rawTargetability.forEach(ev => {
      const relSec = Math.max(0, (ev.timestamp - fightStart) / 1000);
      const isUntargetable = (ev.targetable === 0 || ev.targetable === false || ev.targetable === '0');
      
      if (isUntargetable && downtimeStart === null) {
        downtimeStart = relSec;
      } else if (!isUntargetable && downtimeStart !== null) {
        if (relSec > downtimeStart + 0.5) {
          downtimeIntervals.push({
            start: Math.round(downtimeStart * 1000) / 1000,
            end: Math.round(relSec * 1000) / 1000
          });
        }
        downtimeStart = null;
      }
    });

    if (downtimeStart !== null) {
      const fightEndRel = Math.max(0, (fight.endTime - fightStart) / 1000);
      if (fightEndRel > downtimeStart + 0.5) {
        downtimeIntervals.push({
          start: Math.round(downtimeStart * 1000) / 1000,
          end: Math.round(fightEndRel * 1000) / 1000
        });
      }
    }

    if (downtimeIntervals.length > 0) {
      activeDowntimeIntervals = downtimeIntervals;
      window.activeDowntimeIntervals = activeDowntimeIntervals;
      const dutySel = document.getElementById('duty-select');
      const currentDutyKey = dutySel ? dutySel.value : '';
      const selectedFightSel = document.getElementById('fflogs-api-fight-select');
      const selectedFightTxt = selectedFightSel && selectedFightSel.selectedIndex !== -1 ? selectedFightSel.options[selectedFightSel.selectedIndex].text : '';
      checkAndReportDutyDowntime(currentDutyKey, selectedFightTxt, fightId, downtimeIntervals, urlInput);
    }

    // Build ability ID -> name map
    const abilities = data.reportData.report.masterData?.abilities || [];
    const abilityMap = {};
    abilities.forEach(a => {
      abilityMap[a.gameID] = a.name;
    });

    // Determine the base timestamp for alignment
    let alignmentStart = fightStart;

    // Match skills to database
    const targetJobData = activeTab === 'compare' ? skillsDatabase[selectedPlayer.type.toLowerCase()] : skillsDatabase[currentJobId];
    if (!targetJobData) throw new Error('找不到該玩家職業的技能資料');

    const parsedEvents = [];
    for (const ev of events) {
      if (ev.type !== 'cast' && ev.type !== 'begincast') continue;
      
      const abilityName = abilityMap[ev.abilityGameID];
      if (!abilityName) continue;

      const evNameLower = abilityName.toLowerCase();
      const matched = targetJobData.skills.find(s => {
        if (s.id === 'potion') {
          return evNameLower.includes("爆发药") || 
                 evNameLower.includes("爆發藥") || 
                 evNameLower.includes("幻药") || 
                 evNameLower.includes("幻藥") || 
                 evNameLower.includes("potion") || 
                 evNameLower.includes("tincture") || 
                 evNameLower.includes("gemdraught");
        }
        return s.name.toLowerCase() === evNameLower ||
               (s.aliases && s.aliases.some(alias => alias.toLowerCase() === evNameLower));
      });
      if (!matched) continue;

      const relSec = (ev.timestamp - alignmentStart) / 1000;
      if (relSec < -PREPULL_TIME) continue;

      parsedEvents.push({
        type: ev.type,
        timestamp: ev.timestamp,
        relSec,
        skill: matched,
        abilityGameID: ev.abilityGameID
      });
    }

    parsedEvents.sort((a, b) => a.timestamp - b.timestamp);

    // 從「原始施放事件流」判斷斷讀條：FFLogs 中一次硬讀條會送出 begincast，緊接著送出
    // 同一個 abilityGameID 的 cast（讀條完成）。若某個 begincast 的下一個 cast 事件是
    // 「不同技能」（玩家改放了即時技）或根本沒有下一個 cast，代表這次讀條被中斷了。
    // 用原始（未過濾）事件流計算，才能涵蓋「打斷讀條的即時技不在資料庫」的情況。
    const rawCastStream = events
      .filter(e => e.type === 'cast' || e.type === 'begincast')
      .sort((a, b) => a.timestamp - b.timestamp);
    const interruptedBeginKeys = new Set();
    for (let i = 0; i < rawCastStream.length; i++) {
      const e = rawCastStream[i];
      if (e.type !== 'begincast') continue;
      const next = rawCastStream[i + 1];
      const completed = next && next.type === 'cast' && next.abilityGameID === e.abilityGameID;
      if (!completed) interruptedBeginKeys.add(e.timestamp + '_' + e.abilityGameID);
    }

    // Deduplicate begins casting vs casts & detect interrupted casts
    const uniqueEvents = [];
    const sortedEvList = parsedEvents;
    const n = sortedEvList.length;
    const processed = new Array(n).fill(false);

    for (let i = 0; i < n; i++) {
      if (processed[i]) continue;
      const ev = sortedEvList[i];
      const castDuration = parseTimeToSeconds(ev.skill.cast);

      if (ev.type === 'begincast') {
        if (interruptedBeginKeys.has(ev.timestamp + '_' + ev.abilityGameID)) {
          // Interrupted cast (施法中斷)
          ev.completionTime = ev.relSec + (castDuration > 0 ? castDuration : 1.5);
          ev.isInterrupted = true;
          uniqueEvents.push(ev);
        } else {
          // Completed cast: consume the matching completion `cast` so it isn't rendered twice
          ev.isInterrupted = false;
          ev.completionTime = ev.relSec + castDuration;
          for (let j = i + 1; j < n; j++) {
            if (!processed[j] && sortedEvList[j].type === 'cast' && sortedEvList[j].skill.id === ev.skill.id) {
              processed[j] = true;
              ev.completionTime = sortedEvList[j].relSec;
              break;
            }
          }
          uniqueEvents.push(ev);
        }
      } else if (ev.type === 'cast') {
        ev.completionTime = ev.relSec;
        ev.isInterrupted = false;
        uniqueEvents.push(ev);
      }
    }

    // Build raw entries
    const rawSkills = [];
    uniqueEvents.forEach(pe => {
      const isGcd = (pe.skill.classification === '戰技' || pe.skill.classification === '魔法');
      const track = isGcd ? 'gcd' : 'ogcd';
      const castDur = parseTimeToSeconds(pe.skill.cast);
      const gcdDur = activeTab === 'compare' ? 2.50 : timelineGCDDuration;
      const gcdOccupancy = resolveGcdRecast(parseTimeToSeconds(pe.skill.recast), gcdDur);
      const duration = Math.max(castDur, isGcd ? gcdOccupancy : 0.6);

      rawSkills.push({
        skillId: pe.skill.id,
        name: pe.skill.name,
        icon: pe.skill.icon,
        classification: pe.skill.classification,
        cast: pe.skill.cast,
        recast: pe.skill.recast,
        startTime: pe.relSec,
        completionTime: pe.completionTime,
        duration: duration,
        track: track,
        isGcd: isGcd,
        isInterrupted: !!pe.isInterrupted,
        parentGcdId: null,
        relativeOffset: 0
      });
    });

    if (rawSkills.length === 0) {
      fflogsApiSetStatus('⚠️ 沒有找到匹配的施放事件，請確認玩家選擇是否正確', true);
      document.getElementById('fflogs-api-import').disabled = false;
      return;
    }

    const fightSel = document.getElementById('fflogs-api-fight-select');
    const selectedFightOption = fightSel && fightSel.selectedIndex !== -1 ? fightSel.options[fightSel.selectedIndex] : null;
    const selectedFightText = selectedFightOption ? selectedFightOption.text : '';

    const playerSel = document.getElementById('fflogs-api-player-select');
    const selectedPlayerOption = playerSel && playerSel.selectedIndex !== -1 ? playerSel.options[playerSel.selectedIndex] : null;
    const selectedPlayerName = selectedPlayerOption ? selectedPlayerOption.text.split(' (')[0] : '';
    
    const fflogsReportPayload = {
      'FFLogs 報告連結': urlInput,
      '選擇戰鬥段落': selectedFightText,
      '選擇玩家': selectedPlayerName
    };
    
    // Parent oGCDs to GCDs
    rawSkills.forEach(s => {
      s.instanceId = 'skill_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    });

    const gcds = rawSkills.filter(s => s.isGcd).sort((a, b) => a.startTime - b.startTime);
    const ogcds = rawSkills.filter(s => !s.isGcd);

    ogcds.forEach(ogcd => {
      // Find closest preceding GCD based on completion times
      const parent = gcds.slice().reverse().find(g => g.completionTime <= ogcd.completionTime);
      if (parent) {
        ogcd.parentGcdId = parent.instanceId;
        ogcd.relativeOffset = ogcd.completionTime - parent.startTime;
      } else {
        ogcd.parentGcdId = null;
        ogcd.relativeOffset = 0;
      }
    });

    if (activeTab === 'compare') {
      const playerObj = {
        name: selectedPlayerName || '未命名玩家',
        jobId: selectedPlayer.type.toLowerCase(),
        jobName: targetJobData.name,
        jobIcon: targetJobData.skills[0]?.icon || './icons/general/potion.png',
        gcd: 2.50,
        skills: rawSkills.map(s => ({
          instanceId: s.instanceId,
          skillId: s.skillId,
          name: s.name,
          icon: s.icon,
          classification: s.classification,
          cast: s.cast,
          recast: s.recast,
          startTime: Math.round(s.startTime * 1000) / 1000,
          duration: s.duration,
          track: s.track,
          parentGcdId: s.parentGcdId,
          relativeOffset: Math.round(s.relativeOffset * 1000) / 1000,
          clip: 0,
          idle: 0,
          isInterrupted: !!s.isInterrupted
        }))
      };

      // 依原始 log 時間匯入，不吸附到 GCD 格線；推測玩家實際 GCD 供「!」提示/同步用
      playerObj.estimatedGcd = estimateGcdFromSkills(playerObj.skills);
      playerObj.rawImport = true;

      // Check if player already exists in list, if so replace, else add
      const existingIdx = comparePlayers.findIndex(p => p.name === playerObj.name);
      if (existingIdx !== -1) {
        comparePlayers[existingIdx] = playerObj;
      } else {
        comparePlayers.push(playerObj);
      }
      
      renderCompareTimeline();
      window.trackEvent('多人比較', 'import_fflogs', fflogsReportPayload);
    } else {
      importedPlayerName = selectedPlayerName || null;
      timelinePlayers[targetTimelineId - 1] = selectedPlayerName || null;

      if (autoClear) {
        timelineSkills = timelineSkills.filter(s => (s.timelineId || 1) !== targetTimelineId);
      }

      // Push to global timelineSkills
      rawSkills.forEach(s => {
        timelineSkills.push({
          instanceId: s.instanceId,
          skillId: s.skillId,
          name: s.name,
          icon: s.icon,
          classification: s.classification,
          cast: s.cast,
          recast: s.recast,
          startTime: Math.round(s.startTime * 1000) / 1000,
          duration: s.duration,
          track: s.track,
          parentGcdId: s.parentGcdId,
          relativeOffset: Math.round(s.relativeOffset * 1000) / 1000,
          clip: 0,
          idle: 0,
          isInterrupted: !!s.isInterrupted,
          timelineId: targetTimelineId
        });
      });

      // 依原始 log 時間匯入，不呼叫 recalculateTimeline 吸附；記錄推測 GCD 供「!」提示
      const estGcd = estimateGcdFromSkills(rawSkills);
      timelineImportInfo[targetTimelineId] = { estimatedGcd: estGcd, raw: true };
      renderTimeline();
      autoSave();
      window.trackEvent('個人排軸', 'import_fflogs', fflogsReportPayload);
    }

    const modal = document.getElementById('fflogs-api-modal');
    if (modal) modal.classList.remove('active');
    const importBtn = document.getElementById('fflogs-api-import');
    if (importBtn) importBtn.disabled = false;
    showToast(`✅ 成功匯入 ${rawSkills.length} 個技能事件`);

  } catch (err) {
    fflogsApiSetStatus(`❌ 匯入失敗：${err.message}`, true);
    document.getElementById('fflogs-api-import').disabled = false;
    if (window.trackEvent) {
      const urlForErr = (document.getElementById('fflogs-api-url') || {}).value || '';
      window.trackEvent(activeTab === 'compare' ? '多人比較' : '個人排軸', 'import_fflogs_error', {
        'FFLogs 報告連結': urlForErr.trim(),
        '錯誤訊息': err.message
      });
    }
  }
}

// --- Wire up modal events (after DOM ready) ---
document.addEventListener('DOMContentLoaded', () => {
  const modal        = document.getElementById('fflogs-api-modal');
  const closeBtn     = document.getElementById('fflogs-api-modal-close');
  const cancelBtn    = document.getElementById('fflogs-api-cancel');
  const fetchBtn     = document.getElementById('fflogs-api-fetch-report');
  const importBtn    = document.getElementById('fflogs-api-import');
  const urlInput     = document.getElementById('fflogs-api-url');
  const fightSelect  = document.getElementById('fflogs-api-fight-select');

  if (closeBtn)  closeBtn.addEventListener('click',  () => modal.classList.remove('active'));
  if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.remove('active'));
  if (fetchBtn)  fetchBtn.addEventListener('click',  fflogsApiFetchReport);
  if (importBtn) importBtn.addEventListener('click', fflogsApiImport);
  if (urlInput)  urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') fflogsApiFetchReport(); });
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });
  if (fightSelect) {
    fightSelect.addEventListener('change', () => {
      const fightId = parseInt(fightSelect.value);
      if (fightId) {
        fflogsApiUpdatePlayers(fightId);
        fflogsApiAutoMatchDuty(fightId, urlInput ? urlInput.value.trim() : '');
      }
    });
  }
});

// Helper for choosing import target track when timeline has existing events
function promptImportTargetChoice() {
  return new Promise((resolve) => {
    const modal = document.getElementById('fflogs-import-choice-modal');
    const buttonsContainer = document.getElementById('fflogs-import-choice-buttons');
    const closeBtn = document.getElementById('fflogs-import-choice-close');
    const cancelBtn = document.getElementById('fflogs-import-choice-cancel');
    
    if (!modal || !buttonsContainer) {
      resolve(null);
      return;
    }
    
    buttonsContainer.innerHTML = '';
    
    // 1. New timeline option (if count < 3)
    if (activeTimelinesCount < 3) {
      const btnNew = document.createElement('button');
      btnNew.className = 'btn btn-accent';
      btnNew.style.width = '100%';
      btnNew.style.justifyContent = 'flex-start';
      btnNew.style.padding = '10px 14px';
      btnNew.style.fontSize = '13px';
      btnNew.innerHTML = `<i class="fa-solid fa-folder-plus" style="margin-right:8px;"></i> 新增為新排軸 (排軸 ${activeTimelinesCount + 1})`;
      btnNew.addEventListener('click', () => {
        modal.classList.remove('active');
        resolve({ action: 'new' });
      });
      buttonsContainer.appendChild(btnNew);
    }
    
    // 2. Overwrite option for each active timeline
    for (let i = 1; i <= activeTimelinesCount; i++) {
      const btnOverwrite = document.createElement('button');
      btnOverwrite.className = 'btn btn-secondary';
      btnOverwrite.style.width = '100%';
      btnOverwrite.style.justifyContent = 'flex-start';
      btnOverwrite.style.padding = '10px 14px';
      btnOverwrite.style.fontSize = '13px';
      
      const playerName = timelinePlayers[i - 1];
      const playerText = playerName ? ` (${playerName})` : '';
      btnOverwrite.innerHTML = `<i class="fa-solid fa-arrow-right-to-bracket" style="margin-right:8px;"></i> 覆蓋 排軸 ${i}${playerText}`;
      btnOverwrite.addEventListener('click', () => {
        modal.classList.remove('active');
        resolve({ action: 'overwrite', timelineId: i });
      });
      buttonsContainer.appendChild(btnOverwrite);
    }
    
    const cleanup = () => {
      modal.classList.remove('active');
      resolve(null);
    };
    
    closeBtn.onclick = cleanup;
    cancelBtn.onclick = cleanup;
    
    modal.classList.add('active');
  });
}

// --- Multiplayer Cast Comparison Functions ---

function recalculatePlayerTimeline(player) {
  const gcds = player.skills.filter(s => s.track === 'gcd').sort((a, b) => a.startTime - b.startTime);
  const ogcds = player.skills.filter(s => s.track === 'ogcd');
  
  calculateGcdEffectiveCastTimes(gcds, ogcds);
  
  let nextAvailableGcdTime = -PREPULL_TIME;
  const playerGcdDuration = player.gcd || 2.50;
  
  for (let i = 0; i < gcds.length; i++) {
    const gcd = gcds[i];
    
    if (gcd.startTime < nextAvailableGcdTime) {
      gcd.startTime = nextAvailableGcdTime;
    }
    
    gcd.startTime = Math.round(gcd.startTime * 1000) / 1000;
    
    const parsedRecast = parseTimeToSeconds(gcd.recast);
    const parsedCast = (gcd.effectiveCast !== undefined) ? gcd.effectiveCast : parseTimeToSeconds(gcd.cast);
    const recastVal = resolveGcdRecast(parsedRecast, playerGcdDuration);
    gcd.duration = Math.max(parsedCast, recastVal);
    
    const myOgcds = ogcds.filter(o => o.parentGcdId === gcd.instanceId).sort((a, b) => a.relativeOffset - b.relativeOffset);
    
    let currentLockEnd = gcd.startTime + parsedCast;
    
    for (const ogcd of myOgcds) {
      ogcd.startTime = gcd.startTime + ogcd.relativeOffset;
      
      if (ogcd.startTime < gcd.startTime + parsedCast) {
        ogcd.startTime = gcd.startTime + parsedCast;
        ogcd.relativeOffset = ogcd.startTime - gcd.startTime;
      }
      
      if (ogcd.startTime < currentLockEnd) {
        ogcd.startTime = currentLockEnd;
        ogcd.relativeOffset = ogcd.startTime - gcd.startTime;
      }
      
      ogcd.startTime = Math.round(ogcd.startTime * 1000) / 1000;
      ogcd.relativeOffset = Math.round(ogcd.relativeOffset * 1000) / 1000;
      currentLockEnd = ogcd.startTime + 0.6;
    }
    
    const normalGcdEnd = gcd.startTime + gcd.duration;
    if (currentLockEnd > normalGcdEnd) {
      const calculatedClip = currentLockEnd - normalGcdEnd;
      if (calculatedClip >= 2.0) {
        gcd.clip = 0;
        nextAvailableGcdTime = normalGcdEnd;
      } else {
        gcd.clip = calculatedClip;
        nextAvailableGcdTime = currentLockEnd;
      }
    } else {
      gcd.clip = 0;
      nextAvailableGcdTime = normalGcdEnd;
    }
    nextAvailableGcdTime = Math.round(nextAvailableGcdTime * 1000) / 1000;
  }
  
  // Calculate idle times
  for (let i = 0; i < gcds.length; i++) {
    const gcd = gcds[i];
    const normalGcdEnd = gcd.startTime + gcd.duration;
    const currentLockEnd = normalGcdEnd + gcd.clip;
    const availableTime = Math.round(Math.max(normalGcdEnd, currentLockEnd) * 1000) / 1000;
    
    if (i < gcds.length - 1) {
      const nextGcd = gcds[i + 1];
      if (nextGcd.startTime > availableTime) {
        gcd.idle = Math.round((nextGcd.startTime - availableTime) * 1000) / 1000;
      } else {
        gcd.idle = 0;
      }
    } else {
      gcd.idle = 0;
    }
  }
  
  // Orphaned ogcds
  const orphanOgcds = ogcds.filter(o => !o.parentGcdId);
  for (const ogcd of orphanOgcds) {
    ogcd.startTime = Math.round(ogcd.startTime * 1000) / 1000;
  }
}

function renderCompareTimeline() {
  const container = document.getElementById('compare-timeline-tracks-container');
  const playerListEl = document.getElementById('compare-players-list');
  const lengthDisplay = document.getElementById('compare-timeline-length-display');
  
  if (!container || !playerListEl) return;
  
  // 1. Render Left Sidebar Player List
  if (comparePlayers.length === 0) {
    playerListEl.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-users"></i>
        <p>請使用匯入按鈕匯入 FFXIV Log</p>
      </div>
    `;
    container.innerHTML = '';
    lengthDisplay.innerHTML = `<i class="fa-regular fa-clock"></i> 軸總長: 0s`;
    return;
  }

  // Draw Downtime Overlays in Compare View
  const compareEditor = document.getElementById('compare-timeline-editor');
  if (compareEditor) {
    const existingDowntimes = compareEditor.querySelectorAll('.downtime-overlay');
    existingDowntimes.forEach(el => el.remove());

    activeDowntimeIntervals.forEach((dt) => {
      const dtEl = document.createElement('div');
      dtEl.className = 'downtime-overlay';
      dtEl.style.left = `${180 + (dt.start + PREPULL_TIME) * pixelsPerSecond}px`;
      dtEl.style.width = `${(dt.end - dt.start) * pixelsPerSecond}px`;
      
      dtEl.innerHTML = `
        <div class="downtime-overlay-label">
          <i class="fa-solid fa-eye-slash"></i> BOSS 無敵 (${dt.start.toFixed(1)}s ~ ${dt.end.toFixed(1)}s)
        </div>
      `;
      compareEditor.appendChild(dtEl);
    });
  }
  
  // Render player cards in sidebar
  playerListEl.innerHTML = '';
  comparePlayers.forEach((p, idx) => {
    const card = document.createElement('div');
    card.className = 'compare-player-card';
    card.style.cssText = 'background-color: rgba(255,255,255,0.03); padding: 12px; border-radius: 6px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px;';
    const showAnomaly = p.rawImport && isGcdAnomaly(p.estimatedGcd, p.gcd);
    const anomalyBtn = showAnomaly
      ? `<button class="gcd-anomaly-btn" data-index="${idx}" title="匯入時間與設定的 GCD 不同，點擊同步" style="background:none; border:none; color:#f59e0b; cursor:pointer; font-size:14px; margin-right:2px; flex-shrink:0;"><i class="fa-solid fa-circle-exclamation"></i></button>`
      : '';

    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 80%;">
          <img src="${p.jobIcon}" style="width: 20px; height: 20px; border-radius: 3px; flex-shrink: 0;">
          <span style="font-weight: 600; font-size: 13px; color: var(--color-text-normal); overflow: hidden; text-overflow: ellipsis;">${p.name} (${p.jobName})</span>
        </div>
        <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
          ${anomalyBtn}
          <button class="btn-delete-player" data-index="${idx}" style="background: none; border: none; color: var(--color-danger); cursor: pointer; font-size: 13px;" title="刪除此成員"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--color-text-muted);">
        <label style="white-space: nowrap;"><i class="fa-solid fa-clock"></i> GCD (秒):</label>
        <input type="number" class="compare-gcd-input custom-input" data-index="${idx}" value="${p.gcd.toFixed(2)}" step="0.01" min="1.50" max="3.00" style="width: 60px; height: 24px; padding: 2px 4px; font-size: 12px; text-align: center;">
      </div>
    `;

    // Bind anomaly「!」→ 詢問是否依此時間軸同步玩家 GCD
    const anomalyEl = card.querySelector('.gcd-anomaly-btn');
    if (anomalyEl) {
      anomalyEl.addEventListener('click', async () => {
        const est = p.estimatedGcd;
        const ok = await showTimelineConfirm(
          `推測該玩家的 GCD 為「<strong>${est.toFixed(2)} 秒</strong>」，是否要依此時間軸同步玩家設定的 GCD 值？<br><span style="color:var(--color-text-muted); font-size:13px;">確定的話將會更新時間軸，並將部分技能排軸往後推。</span>`,
          '確定', '取消'
        );
        if (!ok) return;
        p.gcd = est;
        p.rawImport = false;
        recalculatePlayerTimeline(p);
        renderCompareTimeline();
      });
    }

    // Bind delete click
    card.querySelector('.btn-delete-player').addEventListener('click', () => {
      comparePlayers.splice(idx, 1);
      renderCompareTimeline();
    });
    
    // Bind GCD change
    card.querySelector('.compare-gcd-input').addEventListener('change', (e) => {
      let val = parseFloat(e.target.value);
      if (isNaN(val) || val < 1.50) val = 1.50;
      if (val > 3.00) val = 3.00;
      e.target.value = val.toFixed(2);
      comparePlayers[idx].gcd = val;
      comparePlayers[idx].rawImport = false;
      recalculatePlayerTimeline(comparePlayers[idx]);
      renderCompareTimeline();
    });
    
    playerListEl.appendChild(card);
  });
  
  // 2. Render Timeline Editor Tracks
  container.innerHTML = '';
  
  // Find maximum time to scale the editor width
  let maxTime = 120; // default 2 minutes
  bossMechanics.forEach(m => {
    if (m.time > maxTime) maxTime = m.time;
  });
  comparePlayers.forEach(p => {
    p.skills.forEach(s => {
      if (s.startTime + s.duration > maxTime) maxTime = s.startTime + s.duration;
    });
  });
  
  const timelineWidth = (maxTime + PREPULL_TIME) * pixelsPerSecond;
  const editorWidth = timelineWidth + 200;
  
  // Draw compare ruler ticks
  const rulerEl = document.getElementById('compare-timeline-ruler');
  rulerEl.innerHTML = '';
  rulerEl.parentElement.style.width = `${editorWidth}px`;
  rulerEl.style.width = `${editorWidth}px`;
  for (let t = -PREPULL_TIME; t <= maxTime; t += 0.5) {
    const tick = document.createElement('div');
    tick.style.left = `${180 + (t + PREPULL_TIME) * pixelsPerSecond}px`;
    
    if (t % 5 === 0) {
      tick.className = 'ruler-tick major';
      tick.innerHTML = `<span>${formatTime(t)}</span>`;
    } else if (t % 1 === 0) {
      tick.className = 'ruler-tick minor';
    } else if (pixelsPerSecond >= 80) {
      tick.className = 'ruler-tick subminor';
    } else {
      continue;
    }
    rulerEl.appendChild(tick);
  }
  
  // Render Boss Track in comparison view
  const bossTrackEl = document.getElementById('compare-boss-track');
  bossTrackEl.innerHTML = '';
  // Remove all boss guide lines in compare-timeline
  const existingGuides = rulerEl.parentElement.querySelectorAll('.boss-line, .combat-start-line');
  existingGuides.forEach(g => g.remove());
  
  bossMechanics.forEach(mech => {
    const el = document.createElement('div');
    el.className = 'placed-mechanic';
    el.style.left = `${(mech.time + PREPULL_TIME) * pixelsPerSecond}px`;
    el.innerHTML = `<span class="mechanic-name">${mech.name}</span>`;
    
    // Custom tooltip
    el.addEventListener('mousemove', (e) => {
      tooltip.style.display = 'block';
      tooltip.style.left = `${e.clientX + 15}px`;
      tooltip.style.top = `${e.clientY + 15}px`;
      tooltip.querySelector('.tooltip-icon').src = './icons/general/potion.png';
      tooltip.querySelector('.tooltip-name').textContent = mech.name;
      tooltip.querySelector('.tooltip-badge').textContent = '首領機制';
      tooltip.querySelector('.tooltip-badge').style.backgroundColor = 'var(--color-danger)';
      tooltip.querySelector('.tooltip-lv').textContent = '-';
      tooltip.querySelector('.tooltip-mp').textContent = '-';
      tooltip.querySelector('.tooltip-times').textContent = '即時';
      tooltip.querySelector('.tooltip-range').textContent = '-';
      tooltip.querySelector('.tooltip-description').textContent = `首領於第 ${formatTime(mech.time)} 施放機制「${mech.name}」`;
    });
    el.addEventListener('mouseleave', hideTooltip);
    bossTrackEl.appendChild(el);
    
    // Boss guide line
    const guide = document.createElement('div');
    guide.className = 'boss-line';
    guide.style.left = `${180 + (mech.time + PREPULL_TIME) * pixelsPerSecond}px`;
    rulerEl.parentElement.appendChild(guide);
  });
  
  // Combat pull start line
  const startLine = document.createElement('div');
  startLine.className = 'combat-start-line';
  startLine.style.left = `${180 + PREPULL_TIME * pixelsPerSecond}px`;
  const startLabel = document.createElement('span');
  startLabel.className = 'combat-start-label';
  startLabel.innerHTML = '<i class="fa-solid fa-flag-checkered"></i> 開怪 (Pull)';
  startLine.appendChild(startLabel);
  rulerEl.parentElement.appendChild(startLine);

  // Update total length display
  lengthDisplay.innerHTML = `<i class="fa-regular fa-clock"></i> 軸總長: ${Math.ceil(maxTime)}s`;

  // Draw Player Tracks
  comparePlayers.forEach((p, pIdx) => {
    const group = document.createElement('div');
    group.className = 'timeline-group';
    group.style.cssText = 'border-bottom: 2px solid rgba(255,255,255,0.05); margin-bottom: 8px; position: relative;';
    group.innerHTML = `
      <div class="timeline-group-header" style="display:flex; height:24px; background:rgba(255,255,255,0.03); align-items:center;">
        <div class="track-info" style="width:180px; flex-shrink:0; background:#0f1118; border-right:2px solid rgba(255,255,255,0.1); height:100%; display:flex; align-items:center; padding:0 15px; font-size:11px; font-weight:bold; color:var(--color-text-normal); sticky:left; left:0; z-index:5; box-shadow:4px 0 10px rgba(0,0,0,0.2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          <img src="${p.jobIcon}" style="width:14px; height:14px; margin-right:6px; border-radius:2px;">
          ${p.name} (${p.jobName})
        </div>
        <div style="flex:1; border-right: 1px solid rgba(255,255,255,0.05); height:100%;"></div>
      </div>
      
      <!-- Buff Track -->
      <div class="timeline-track-wrapper buff-track-wrapper">
        <div class="track-info">
          <span class="track-title"><i class="fa-solid fa-wand-magic-sparkles"></i> 團輔覆蓋 (Buffs)</span>
        </div>
        <div class="timeline-track track-content" id="compare-buff-track-${pIdx}"></div>
      </div>
      
      <!-- GCD Skill Track -->
      <div class="timeline-track-wrapper gcd-track-wrapper">
        <div class="track-info">
          <span class="track-title"><i class="fa-solid fa-bolt"></i> 戰技 / 魔法 (GCD)</span>
        </div>
        <div class="timeline-track track-content" id="compare-gcd-track-${pIdx}">
          <div class="gcd-slots-bg" style="background-size: calc(${pixelsPerSecond}px * ${p.gcd}) 100%;"></div>
        </div>
      </div>
      
      <!-- oGCD Skill Track -->
      <div class="timeline-track-wrapper ogcd-track-wrapper">
        <div class="track-info">
          <span class="track-title"><i class="fa-solid fa-hourglass-start"></i> 能力技 (oGCD)</span>
        </div>
        <div class="timeline-track track-content" id="compare-ogcd-track-${pIdx}"></div>
      </div>
    `;
    container.appendChild(group);
    
    const tGcd = group.querySelector(`#compare-gcd-track-${pIdx}`);
    const tOgcd = group.querySelector(`#compare-ogcd-track-${pIdx}`);
    const tBuff = group.querySelector(`#compare-buff-track-${pIdx}`);
    
    // Draw Buff Overlays
    p.skills.forEach(skill => {
      const buffConfig = BUFF_MAP[skill.name];
      if (buffConfig) {
        const overlay = document.createElement('div');
        overlay.className = 'buff-overlay';
        overlay.style.left = `${(skill.startTime + PREPULL_TIME) * pixelsPerSecond}px`;
        overlay.style.width = `${buffConfig.duration * pixelsPerSecond}px`;
        overlay.style.backgroundColor = buffConfig.color;
        overlay.style.borderColor = buffConfig.color.replace('0.45', '0.8').replace('0.4', '0.8');
        overlay.innerHTML = `<img src="${skill.icon}" style="width:16px;height:16px;margin-right:6px;border-radius:3px;"> ${buffConfig.label}`;
        tBuff.appendChild(overlay);
      }
    });
    
    // Draw GCD skills
    const gcds = p.skills.filter(s => s.track === 'gcd');
    gcds.forEach(skill => {
      const el = document.createElement('div');
      el.className = 'placed-skill gcd-type';
      el.style.left = `${(skill.startTime + PREPULL_TIME) * pixelsPerSecond}px`;
      el.style.width = `${skill.duration * pixelsPerSecond}px`;
      el.innerHTML = `
        <img src="${skill.icon}" alt="${skill.name}">
        <span class="placed-skill-name">${skill.name}</span>
      `;
      
      if (skill.isInterrupted) {
        el.classList.add('interrupted-skill');
        const badge = document.createElement('span');
        badge.className = 'interrupted-badge';
        badge.textContent = '!';
        el.appendChild(badge);
      }
      
      const castTime = (skill.effectiveCast !== undefined) ? skill.effectiveCast : parseTimeToSeconds(skill.cast);
      if (skill.duration > castTime && !skill.isInterrupted) {
        const recastMesh = document.createElement('div');
        recastMesh.className = 'recast-lock-indicator';
        recastMesh.style.left = `${castTime * pixelsPerSecond}px`;
        recastMesh.style.width = `${(skill.duration - castTime) * pixelsPerSecond}px`;
        el.appendChild(recastMesh);
      }
      
      if (skill.clip > 0) {
        const clipWarning = document.createElement('div');
        clipWarning.className = 'gcd-clip-warning';
        clipWarning.style.left = `${(skill.startTime + skill.duration + PREPULL_TIME) * pixelsPerSecond}px`;
        clipWarning.style.width = `${skill.clip * pixelsPerSecond}px`;
        clipWarning.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> 卡 ${skill.clip.toFixed(3)}s`;
        tGcd.appendChild(clipWarning);
      }
      
      if (skill.idle >= 2.0) {
        const idleWarning = document.createElement('div');
        idleWarning.className = 'gcd-clip-warning gcd-idle-warning';
        idleWarning.style.left = `${(skill.startTime + skill.duration + skill.clip + PREPULL_TIME) * pixelsPerSecond}px`;
        idleWarning.style.width = `${skill.idle * pixelsPerSecond}px`;
        idleWarning.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> 空轉 ${skill.idle.toFixed(3)}s`;
        tGcd.appendChild(idleWarning);
      }
      
      const originalSkill = skillsDatabase[p.jobId]?.skills.find(s => s.id === skill.skillId) || skill;
      const tooltipSkill = { ...originalSkill, startTime: skill.startTime, playerName: p.name, isInterrupted: !!skill.isInterrupted };
      el.addEventListener('mousemove', (e) => showTooltip(e, tooltipSkill));
      el.addEventListener('mouseleave', hideTooltip);
      
      tGcd.appendChild(el);
    });
    
    // Draw oGCD skills
    const ogcds = p.skills.filter(s => s.track === 'ogcd');
    ogcds.forEach(skill => {
      const el = document.createElement('div');
      el.className = 'ogcd-pill';
      el.style.left = `${(skill.startTime + PREPULL_TIME) * pixelsPerSecond}px`;
      
      const isRole = skill.skillId.includes('tank_action') || skill.skillId.includes('healer_action') || skill.skillId.includes('melee_action') || skill.skillId.includes('ranged_action') || skill.skillId.includes('caster_action');
      if (isRole) el.classList.add('role-type');
      
      if (skill.isInterrupted) {
        el.classList.add('interrupted-skill');
        const badge = document.createElement('span');
        badge.className = 'interrupted-badge';
        badge.textContent = '!';
        el.appendChild(badge);
      }

      el.innerHTML += `
        <img src="${skill.icon}" alt="${skill.name}">
        <span class="ogcd-pill-name">${skill.name}</span>
      `;
      
      const originalSkill = skillsDatabase[p.jobId]?.skills.find(s => s.id === skill.skillId) || skill;
      const tooltipSkill = { ...originalSkill, startTime: skill.startTime, playerName: p.name, isInterrupted: !!skill.isInterrupted };
      el.addEventListener('mousemove', (e) => showTooltip(e, tooltipSkill));
      el.addEventListener('mouseleave', hideTooltip);
      
      tOgcd.appendChild(el);
    });
  });
}

window.renderCompareTimeline = renderCompareTimeline;
