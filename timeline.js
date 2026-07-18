window.showCustomConfirm = function(title, message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:10000;';
    overlay.innerHTML = `
      <div style="background:#12121f; border:1px solid #2a2a3f; border-radius:16px; padding:28px 24px; width:360px; max-width:90vw; color:#fff; box-shadow:0 24px 60px rgba(0,0,0,0.6);">
        <h3 style="margin:0 0 12px; font-size:16px; font-weight:700; color:#fff;">${title}</h3>
        <p style="margin:0 0 24px; font-size:14px; color:#aaa; line-height:1.5;">${message}</p>
        <div style="display:flex; justify-content:flex-end; gap:12px;">
          <button id="custom-confirm-cancel" style="padding:8px 16px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#fff; cursor:pointer; font-size:14px; transition:background 0.2s;">取消</button>
          <button id="custom-confirm-ok" style="padding:8px 20px; background:linear-gradient(135deg,#4f6ef7,#7c9ef8); border:none; border-radius:8px; color:#fff; cursor:pointer; font-weight:600; font-size:14px; transition:opacity 0.2s;">確定</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    
    const cleanup = (val) => {
      document.body.removeChild(overlay);
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
let skillsDatabase = {};
let dutiesDatabase = {};
let currentJobId = '';
let currentDutyFile = '';
let timelineGCDDuration = 2.50;
let pixelsPerSecond = 60;
let timelineSkills = []; // { instanceId, skillId, name, icon, classification, cast, recast, startTime, duration, track, parentGcdId, relativeOffset, clip, timelineId }
let bossMechanics = [];  // { id, time, name }
let importedPlayerName = null; // Name of the imported player from log API / paste
let activeTimelinesCount = 1;  // Support up to 3 timelines
let timelinePlayers = [null, null, null]; // Player name for each timeline
let playbackState = { isPlaying: false, currentTime: -PREPULL_TIME, animationFrameId: null, startTimeStamp: 0 };
let draggedItem = null;  // { source: 'sidebar'|'timeline', skillId/instanceId, type: 'skill'|'mechanic' }

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
  '灼熱之光': { duration: 30, color: 'rgba(255, 69, 0, 0.45)', label: '灼熱之光 (傷害+3%)' }
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
const mitPlanningView = document.getElementById('mit-planning-view');
const timelineWorkspaceView = document.getElementById('timeline-workspace-view');
const timelineToolbar = document.getElementById('timeline-toolbar');

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
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('./data/jobs_skills.json');
    if (!response.ok) throw new Error('無法讀取技能資料庫！請先執行 scraper.js');
    skillsDatabase = await response.json();
    
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
    skillsList.innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><p>${error.message}</p></div>`;
  }
});

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
  renderTimeline();
  autoSave();
}

// 2. Setup Event Listeners
function setupEventListeners() {
  // Tab Switcher event listeners
  if (tabBtnMit && tabBtnTimeline) {
    tabBtnMit.addEventListener('click', () => {
      tabBtnMit.classList.add('active');
      tabBtnTimeline.classList.remove('active');
      mitPlanningView.classList.remove('hidden');
      timelineWorkspaceView.classList.add('hidden');
      timelineToolbar.classList.add('hidden');
      window.trackEvent('navigation', 'tab_switch', { target: 'team' });
    });

    tabBtnTimeline.addEventListener('click', () => {
      tabBtnTimeline.classList.add('active');
      tabBtnMit.classList.remove('active');
      timelineWorkspaceView.classList.remove('hidden');
      timelineToolbar.classList.remove('hidden');
      mitPlanningView.classList.add('hidden');
      window.trackEvent('navigation', 'tab_switch', { target: 'personal' });
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
    if (bossMechanics.length > 0 && !confirm('載入新副本將清空目前首領機制軌道，確定要繼續嗎？')) {
      dutySelect.value = currentDutyFile;
      populateDutyDropdown(dutiesDatabase, currentDutyFile);
      return;
    }
    
    currentDutyFile = dutyFile;
    if (!dutyFile) {
      bossMechanics = [];
      recalculateTimeline();
      renderTimeline();
      autoSave();
      return;
    }
    
    try {
      const response = await fetch(`./data/duties/${dutyFile}`);
      if (!response.ok) throw new Error('無法載入副本資料');
      const dutyData = await response.json();
      loadDutyTimeline(dutyData);
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
      importOptionsModal.classList.add('active');
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

  if (importOptFflogs) {
    importOptFflogs.addEventListener('click', () => {
      importOptionsModal.classList.remove('active');
      if (!currentJobId) {
        alert('請先選擇職業再匯入 FF Logs！');
        return;
      }
      fflogsPasteArea.value = '';
      fflogsModal.classList.add('active');
    });
  }

  if (importOptFflogsApi) {
    importOptFflogsApi.addEventListener('click', () => {
      importOptionsModal.classList.remove('active');
      if (!currentJobId) {
        alert('請先選擇職業再使用 FFLogs API 匯入！');
        return;
      }
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
  btnClear.addEventListener('click', () => {
    if (confirm('確定要清空時間軸嗎？')) {
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
        container.scrollLeft += e.deltaY;
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
    startTime: Math.round(startTime * 10) / 10,
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

// 6. Snapping & Weaving Calculation Engine
function recalculateTimeline() {
  for (let tId = 1; tId <= activeTimelinesCount; tId++) {
    const gcds = timelineSkills.filter(s => s.track === 'gcd' && (s.timelineId || 1) === tId).sort((a, b) => a.startTime - b.startTime);
    const ogcds = timelineSkills.filter(s => s.track === 'ogcd' && (s.timelineId || 1) === tId);
    
    let nextAvailableGcdTime = -PREPULL_TIME;
    
    for (let i = 0; i < gcds.length; i++) {
      const gcd = gcds[i];
      
      // 1. Magnetic snapping: GCDs can't overlap with the previous GCD
      if (gcd.startTime < nextAvailableGcdTime) {
        gcd.startTime = nextAvailableGcdTime;
      }
      
      // Round to 1 decimal place to prevent floating point inaccuracies
      gcd.startTime = Math.round(gcd.startTime * 10) / 10;
      
      const parsedRecast = parseTimeToSeconds(gcd.recast);
      const parsedCast = parseTimeToSeconds(gcd.cast);
      const recastVal = (parsedRecast >= 1.8) ? timelineGCDDuration : parsedRecast;
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
        
        ogcd.startTime = Math.round(ogcd.startTime * 10) / 10;
        ogcd.relativeOffset = Math.round(ogcd.relativeOffset * 10) / 10;
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
      nextAvailableGcdTime = Math.round(nextAvailableGcdTime * 10) / 10;
    }
    
    // 3b. Calculate idle times between GCDs
    for (let i = 0; i < gcds.length; i++) {
      const gcd = gcds[i];
      const normalGcdEnd = gcd.startTime + gcd.duration;
      const currentLockEnd = normalGcdEnd + gcd.clip;
      const availableTime = Math.round(Math.max(normalGcdEnd, currentLockEnd) * 10) / 10;
      
      if (i < gcds.length - 1) {
        const nextGcd = gcds[i + 1];
        if (nextGcd.startTime > availableTime) {
          gcd.idle = Math.round((nextGcd.startTime - availableTime) * 10) / 10;
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
      ogcd.startTime = Math.round(ogcd.startTime * 10) / 10;
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
      
      const groupHtml = `
        <div class="timeline-group" data-timeline-id="${i}" style="border-bottom: 2px solid rgba(255,255,255,0.05); margin-bottom: 8px;">
          <div class="timeline-group-header" style="display:flex; height:24px; background:rgba(255,255,255,0.03); align-items:center;" title="${hoverTitle}">
            <div class="track-info" style="width:180px; flex-shrink:0; background:#0f1118; border-right:2px solid rgba(255,255,255,0.1); height:100%; display:flex; align-items:center; padding:0 15px; font-size:11px; font-weight:bold; color:var(--color-text-muted); sticky:left; left:0; z-index:5; box-shadow:4px 0 10px rgba(0,0,0,0.2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              排軸 ${i} ${userTag}
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
    
    const castTime = parseTimeToSeconds(skill.cast);
    
    // Recast locking mesh
    if (skill.duration > castTime) {
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

    // Amber idle warning placed in the empty gap before the next GCD block
    if (skill.idle >= 2.0) {
      const idleWarning = document.createElement('div');
      idleWarning.className = 'gcd-clip-warning gcd-idle-warning';
      idleWarning.style.left = `${(skill.startTime + skill.duration + skill.clip + PREPULL_TIME) * pixelsPerSecond}px`;
      idleWarning.style.width = `${skill.idle * pixelsPerSecond}px`;
      idleWarning.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> 空轉 ${skill.idle.toFixed(1)}s`;
      if (targetGcdTrack) targetGcdTrack.appendChild(idleWarning);
    }
    
    // Drag handlers
    el.addEventListener('dragstart', (e) => {
      draggedItem = { source: 'timeline', instanceId: skill.instanceId, type: 'skill' };
      e.dataTransfer.setData('text/plain', skill.instanceId);
    });
    
    // Tooltip
    const originalSkill = skillsDatabase[currentJobId].skills.find(s => s.id === skill.skillId);
    el.addEventListener('mousemove', (e) => showTooltip(e, originalSkill));
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
    
    // Drag handlers
    el.addEventListener('dragstart', (e) => {
      draggedItem = { source: 'timeline', instanceId: skill.instanceId, type: 'skill' };
      e.dataTransfer.setData('text/plain', skill.instanceId);
    });
    
    // Tooltip
    const originalSkill = skillsDatabase[currentJobId].skills.find(s => s.id === skill.skillId);
    el.addEventListener('mousemove', (e) => showTooltip(e, originalSkill));
    el.addEventListener('mouseleave', hideTooltip);
    
    const targetOgcdTrack = document.getElementById('ogcd-track-' + (skill.timelineId || 1)) || ogcdTrack;
    if (targetOgcdTrack) targetOgcdTrack.appendChild(el);
  });
  
  // 7. Update Status Indicator Panel
  updateStatusPanel();
}

// Helper: Format seconds to M:SS
function formatTime(seconds) {
  const isNegative = seconds < 0;
  const absSeconds = Math.abs(seconds);
  const m = Math.floor(absSeconds / 60);
  const s = Math.floor(absSeconds % 60);
  const ms = Math.floor((absSeconds % 1) * 10);
  return `${isNegative ? '-' : ''}${m}:${s.toString().padStart(2, '0')}.${ms}`;
}

function scrollToTime(timeSeconds) {
  const scrollContainer = timelineEditor.parentElement;
  scrollContainer.scrollLeft = TRACK_INFO_WIDTH + (timeSeconds + PREPULL_TIME) * pixelsPerSecond - 100;
}

// 8. Handle Drag-and-Drop Drop logic
function handleDrop(e, targetTrackType) {
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
      const gcds = timelineSkills.filter(s => s.track === 'gcd').sort((a, b) => a.startTime - b.startTime);
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
      startTime: Math.round(startTime * 10) / 10,
      duration: Math.max(parsedCast, isGcd ? timelineGCDDuration : 0.6),
      track: isGcd ? 'gcd' : 'ogcd',
      parentGcdId,
      relativeOffset,
      clip: 0,
      idle: 0
    });
    
  } else if (draggedItem.source === 'timeline') {
    // Drop from timeline -> move existing item
    if (draggedItem.type === 'skill') {
      const skill = timelineSkills.find(s => s.instanceId === draggedItem.instanceId);
      if (!skill) return;
      
      if (skill.track === 'gcd') {
        skill.startTime = Math.round(rawTime * 2) / 2;
      } else {
        // oGCD move: re-calculate parent GCD relationship
        const gcds = timelineSkills.filter(s => s.track === 'gcd').sort((a, b) => a.startTime - b.startTime);
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
  const idleGcds = timelineSkills.filter(s => s.track === 'gcd' && s.idle >= 2.0);
  
  let clipText = '';
  if (clippedGcds.length > 0) {
    const totalClip = clippedGcds.reduce((acc, curr) => acc + curr.clip, 0);
    clipText += `卡 GCD (共 ${clippedGcds.length} 處 / ${totalClip.toFixed(1)}秒)`;
  }
  
  if (idleGcds.length > 0) {
    const totalIdle = idleGcds.reduce((acc, curr) => acc + curr.idle, 0);
    if (clipText) clipText += ' | ';
    clipText += `GCD 空轉 (共 ${idleGcds.length} 處 / ${totalIdle.toFixed(1)}秒)`;
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
  const dutyObj = dutiesDatabase.duties ? dutiesDatabase.duties.find(d => d.key === dutyKey) : null;
  let dutyData = null;
  if (dutyObj) {
    try {
      const response = await fetch(`./data/duties/${dutyObj.file}`);
      if (response.ok) {
        dutyData = await response.json();
      }
    } catch (e) {
      console.warn('無法載入副本詳細資料:', e);
    }
  }

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
    if (dutyObj && dutyData) {
      currentDutyFile = dutyObj.file;
      dutySelect.value = currentDutyFile;
      populateDutyDropdown(dutiesDatabase, currentDutyFile);
      loadDutyTimeline(dutyData);
    } else {
      currentDutyFile = '';
      dutySelect.value = '';
      populateDutyDropdown(dutiesDatabase, '');
      bossMechanics = [];
    }
    
    // Also copy custom mechanics from the team plan
    if (data.customMechanics && data.customMechanics.length > 0) {
      bossMechanics = JSON.parse(JSON.stringify(data.customMechanics));
      bossMechanics.sort((a, b) => a.time - b.time);
    }
    
    timelineSkills = [];
    const jobDb = skillsDatabase[jobId];
    if (jobDb) {
      // Filter casts for selected player slot
      const casts = data.mits.filter(c => c.slotIndex === selectedMember.index);
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
    const lower = rawName.toLowerCase();
    
    // Direct match in translation table
    if (skillTranslation[lower]) {
      return skillTranslation[lower];
    }
    
    // Direct check if it matches database skill name (Traditional Chinese)
    const exactMatch = jobDb.skills.find(s => s.name === rawName);
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
        duration: Math.max(castTime, isGcd ? timelineGCDDuration : 0.6),
        track: isGcd ? 'gcd' : 'ogcd',
        isGcd: isGcd,
        parentGcdId: null,
        relativeOffset: 0
      });
    } else {
      // Casts event
      if (castTime > 0) {
        // Look back for a starts-casting event of same skill within 3.5s
        const alreadyParsed = finalSkills.find(s => s.skillId === skill.id && Math.abs(s.startTime - (ev.time - castTime)) < 2.0);
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
          duration: Math.max(castTime, isGcd ? timelineGCDDuration : 0.6),
          track: isGcd ? 'gcd' : 'ogcd',
          isGcd: isGcd,
          parentGcdId: null,
          relativeOffset: 0
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
          duration: 0.6, // default instant duration
          track: isGcd ? 'gcd' : 'ogcd',
          isGcd: isGcd,
          parentGcdId: null,
          relativeOffset: 0
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
    // Find closest preceding GCD
    const parent = gcds.slice().reverse().find(g => g.startTime <= ogcd.startTime);
    if (parent) {
      ogcd.parentGcdId = parent.instanceId;
      ogcd.relativeOffset = ogcd.startTime - parent.startTime;
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
      startTime: Math.round(s.startTime * 10) / 10,
      duration: s.duration,
      track: s.track,
      parentGcdId: s.parentGcdId,
      relativeOffset: Math.round(s.relativeOffset * 10) / 10,
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
function copyTextTimeline() {
  if (timelineSkills.length === 0) {
    alert('時間軸目前無任何技能！');
    return;
  }
  
  // Combine skills and mechanics, sorted by time
  const items = [];
  timelineSkills.forEach(s => {
    items.push({
      time: s.startTime,
      text: s.track === 'gcd' ? `[${s.name}]` : `(${s.name})`,
      type: 'skill'
    });
  });
  
  bossMechanics.forEach(m => {
    items.push({
      time: m.time,
      text: `==== 首領機制: ${m.name} ====`,
      type: 'mechanic'
    });
  });
  
  items.sort((a, b) => a.time - b.time);
  
  let result = `=== FFXIV 排軸文字檔 (${skillsDatabase[currentJobId]?.name} | GCD: ${timelineGCDDuration.toFixed(2)}s) ===\n`;
  items.forEach(item => {
    const timeStr = formatTime(item.time);
    result += `${timeStr}  ${item.text}\n`;
  });
  
  navigator.clipboard.writeText(result).then(() => {
    alert('複製文字排軸成功！您可以貼到 Discord 或記事本了！');
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
    const castTime = parseTimeToSeconds(skill.cast);
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

    // Amber idle overlay
    if (skill.idle >= 2.0) {
      ctx.fillStyle = 'rgba(255, 165, 0, 0.15)';
      const idleX = x + (skill.duration + skill.clip) * pixelsPerSecond;
      ctx.fillRect(idleX, 163, skill.idle * pixelsPerSecond, 54);
      
      ctx.fillStyle = '#ffa500';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(`空轉 ${skill.idle.toFixed(1)}s`, idleX + 5, 185);
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
  if (!skill) return;
  
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
  tooltip.querySelector('.tooltip-name').textContent = skill.name;
  tooltip.querySelector('.tooltip-badge').textContent = skill.classification;
  tooltip.querySelector('.tooltip-lv').textContent = `Lv.${skill.level}`;
  tooltip.querySelector('.tooltip-mp').textContent = skill.cost || '-';
  tooltip.querySelector('.tooltip-times').textContent = `${skill.cast} / ${skill.recast}`;
  tooltip.querySelector('.tooltip-range').textContent = skill.range;
  tooltip.querySelector('.tooltip-description').textContent = skill.effect;
  
  // Set badge color based on type
  const badge = tooltip.querySelector('.tooltip-badge');
  badge.style.backgroundColor = skill.classification === '能力' ? 'var(--color-ogcd)' : 'var(--color-gcd)';
}

function hideTooltip() {
  tooltip.style.display = 'none';
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
        
        let baseName = dutyName.replace(/\s*\(([^)]+)\)/, '-$1').replace(/\s+/g, '-');
        if (baseName === '無副本-(自訂時間軸)') {
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
        const response = await fetch(`./data/duties/${currentDutyFile}`);
        if (response.ok) {
          const dutyData = await response.json();
          loadDutyTimeline(dutyData);
        }
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
let currentVersionTag = null;
let updatePopupShown = false;

async function initVersionCheck() {
  try {
    const response = await fetch('./index.html?t=' + Date.now(), { method: 'HEAD', cache: 'no-cache' });
    if (response.ok) {
      currentVersionTag = response.headers.get('etag') || response.headers.get('last-modified');
      console.log('[Version Check] Initialized with version tag:', currentVersionTag);
    }
  } catch (e) {
    console.error('[Version Check] Failed to initialize:', e);
  }
  
  // Check for updates every 60 seconds
  setInterval(checkForUpdates, 60000);
}

async function checkForUpdates() {
  if (updatePopupShown) return;
  try {
    const response = await fetch('./index.html?t=' + Date.now(), { method: 'HEAD', cache: 'no-cache' });
    if (response.ok) {
      const newVersionTag = response.headers.get('etag') || response.headers.get('last-modified');
      if (newVersionTag && currentVersionTag && newVersionTag !== currentVersionTag) {
        showUpdateNotification();
      }
    }
  } catch (e) {
    console.warn('[Version Check] Check failed:', e);
  }
}

function showUpdateNotification() {
  if (updatePopupShown) return;
  updatePopupShown = true;
  
  const toast = document.createElement('div');
  toast.className = 'update-toast';
  toast.innerHTML = `
    <div class="update-toast-header">
      <i class="fa-solid fa-cloud-arrow-down"></i>
      <span>系統有新版本發布！</span>
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
  document.getElementById('fflogs-api-import').style.display = 'none';
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

    let statusMsg = `✅ 找到 ${fflogsApiFights.length} 個戰鬥段落，請選擇後匯入。`;
    if (urlParams.phase !== null) {
      statusMsg += ` (已偵測到第 ${urlParams.phase} 階段過濾，匯入時將自動對齊)`;
    }
    fflogsApiSetStatus(statusMsg);

  } catch (err) {
    fflogsApiSetStatus(`❌ 查詢失敗：${err.message}`, true);
  }
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
  if (selectedPlayer) {
    const playerJob = selectedPlayer.type.toLowerCase();
    if (playerJob !== currentJobId && skillsDatabase[playerJob]) {
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

  let targetTimelineId = 1;
  let autoClear = clearFirst;
  
  if (timelineSkills.length > 0) {
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
  let filterExpr = "";
  if (urlParams.phase !== null) {
    filterExpr = `encounterPhase = ${urlParams.phase}`;
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

    const events = data.reportData.report.events.data || [];
    if (events.length === 0) {
      fflogsApiSetStatus('⚠️ 沒有找到施放事件，請確認玩家選擇是否正確', true);
      document.getElementById('fflogs-api-import').disabled = false;
      return;
    }

    // Build ability ID -> name map
    const abilities = data.reportData.report.masterData?.abilities || [];
    const abilityMap = {};
    abilities.forEach(a => {
      abilityMap[a.gameID] = a.name;
    });

    // Determine the base timestamp for alignment
    let alignmentStart = fightStart;
    if (urlParams.phase !== null) {
      const castEvents = events.filter(ev => ev.type === 'cast' || ev.type === 'begincast');
      if (castEvents.length > 0) {
        alignmentStart = Math.min(...castEvents.map(ev => ev.timestamp));
      }
    }

    // Match skills to database
    const activeJobData = skillsDatabase[currentJobId];
    if (!activeJobData) throw new Error('找不到當前職業技能資料');

    const parsedEvents = [];
    for (const ev of events) {
      if (ev.type !== 'cast' && ev.type !== 'begincast') continue;
      
      const abilityName = abilityMap[ev.abilityGameID];
      if (!abilityName) continue;

      const evNameLower = abilityName.toLowerCase();
      const matched = activeJobData.skills.find(s =>
        s.name.toLowerCase() === evNameLower ||
        (s.aliases && s.aliases.some(alias => alias.toLowerCase() === evNameLower))
      );
      if (!matched) continue;

      const relSec = (ev.timestamp - alignmentStart) / 1000;
      if (relSec < 0) continue;

      parsedEvents.push({
        type: ev.type,
        timestamp: ev.timestamp,
        relSec,
        skill: matched
      });
    }

    parsedEvents.sort((a, b) => a.timestamp - b.timestamp);

    // Deduplicate begins casting vs casts
    const uniqueEvents = [];
    const castHistory = {};
    for (const pe of parsedEvents) {
      const key = pe.skill.id;
      if (pe.type === 'begincast') {
        castHistory[key] = pe.relSec;
        uniqueEvents.push(pe);
      } else {
        const lastBegin = castHistory[key];
        if (lastBegin !== undefined && (pe.relSec - lastBegin) < 10) {
          continue;
        }
        const castDuration = parseTimeToSeconds(pe.skill.cast);
        let adjustedTime = pe.relSec;
        if (castDuration > 0) {
          adjustedTime = Math.max(0, pe.relSec - castDuration);
        }
        pe.relSec = adjustedTime;
        uniqueEvents.push(pe);
      }
    }

    // Build raw entries
    const rawSkills = [];
    uniqueEvents.forEach(pe => {
      const isGcd = (pe.skill.classification === '戰技' || pe.skill.classification === '魔法');
      const track = isGcd ? 'gcd' : 'ogcd';
      const castDur = parseTimeToSeconds(pe.skill.cast);
      const duration = Math.max(castDur, isGcd ? timelineGCDDuration : 0.6);

      rawSkills.push({
        skillId: pe.skill.id,
        name: pe.skill.name,
        icon: pe.skill.icon,
        classification: pe.skill.classification,
        cast: pe.skill.cast,
        recast: pe.skill.recast,
        startTime: pe.relSec,
        duration: duration,
        track: track,
        isGcd: isGcd,
        parentGcdId: null,
        relativeOffset: 0
      });
    });

    if (rawSkills.length === 0) {
      fflogsApiSetStatus('⚠️ 沒有找到匹配的施放事件，請確認玩家選擇是否正確', true);
      document.getElementById('fflogs-api-import').disabled = false;
      return;
    }

    const playerSel = document.getElementById('fflogs-api-player-select');
    const selectedPlayerOption = playerSel && playerSel.selectedIndex !== -1 ? playerSel.options[playerSel.selectedIndex] : null;
    const selectedPlayerName = selectedPlayerOption ? selectedPlayerOption.text.split(' (')[0] : '';
    importedPlayerName = selectedPlayerName || null;
    timelinePlayers[targetTimelineId - 1] = selectedPlayerName || null;

    if (autoClear) {
      timelineSkills = timelineSkills.filter(s => (s.timelineId || 1) !== targetTimelineId);
    }

    // Parent oGCDs to GCDs
    rawSkills.forEach(s => {
      s.instanceId = 'skill_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    });

    const gcds = rawSkills.filter(s => s.isGcd).sort((a, b) => a.startTime - b.startTime);
    const ogcds = rawSkills.filter(s => !s.isGcd);

    ogcds.forEach(ogcd => {
      const parent = gcds.slice().reverse().find(g => g.startTime <= ogcd.startTime);
      if (parent) {
        ogcd.parentGcdId = parent.instanceId;
        ogcd.relativeOffset = ogcd.startTime - parent.startTime;
      } else {
        ogcd.parentGcdId = null;
        ogcd.relativeOffset = 0;
      }
    });

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
        startTime: Math.round(s.startTime * 10) / 10,
        duration: s.duration,
        track: s.track,
        parentGcdId: s.parentGcdId,
        relativeOffset: Math.round(s.relativeOffset * 10) / 10,
        clip: 0,
        idle: 0,
        timelineId: targetTimelineId
      });
    });

    recalculateTimeline();
    renderTimeline();
    autoSave();

    const modal = document.getElementById('fflogs-api-modal');
    if (modal) modal.classList.remove('active');
    showToast(`✅ 成功匯入 ${rawSkills.length} 個技能事件`);

  } catch (err) {
    fflogsApiSetStatus(`❌ 匯入失敗：${err.message}`, true);
    document.getElementById('fflogs-api-import').disabled = false;
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
