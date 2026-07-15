import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ── 1. Supabase Initialization ──
const SUPABASE_URL = 'https://bvsvmuktyhkoekjamwkm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2c3ZtdWt0eWhrb2VramFtd2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwODI2ODYsImV4cCI6MjA5OTY1ODY4Nn0.w2LmPAdI5pF2_IxQdgOb1bYkf6P5CbEXxRoSx1p6h94';
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export sb client to window so timeline.js can access it for Tab 2 saving/loading
window.supabaseClient = sb;

// ── 2. Local State Variables ──
let mitSkillsDatabase = {};
let mitDutiesDatabase = {};
let mitParty = ['PLD', 'DRK', 'WHM', 'SGE', 'SAM', 'RPR', 'BRD', 'PCT'];
let mitTimelineSkills = []; // [{ id, slotIndex, jobAbbrev, skillKey, startTime, duration }]
let mitBossMechanics = [];
let currentMitDutyFile = '';

// Cloud State Variables
let currentTeamPlanId = null;
let currentTeamEditToken = null;
let currentTeamReadToken = null;
let currentTeamPlanName = '未命名團隊減排';
let currentUser = null;

// ── 3. DOM Elements ──
const partyGrid = document.getElementById('party-select-grid');
const mitSkillsList = document.getElementById('mit-skills-list');
const mitPlayerTracksContainer = document.getElementById('mit-player-tracks-container');
const mitTimelineEditor = document.getElementById('mit-timeline-editor');
const mitTimelineRuler = document.getElementById('mit-timeline-ruler');
const mitBossTrack = document.getElementById('mit-boss-track');
const mitPlayhead = document.getElementById('mit-playhead');
const mitDragTrash = document.getElementById('mit-drag-trash');
const mitLengthDisplay = document.getElementById('mit-timeline-length-display');

// Toolbar Buttons
const mitDutySelect = document.getElementById('mit-duty-select');
const mitBtnSave = document.getElementById('mit-btn-save');
const mitBtnLoad = document.getElementById('mit-btn-load');
const mitBtnShare = document.getElementById('mit-btn-share');
const mitBtnAddMechanic = document.getElementById('mit-btn-add-mechanic');

// Tab Switching
const tabBtnMit = document.getElementById('tab-btn-mit');
const tabBtnTimeline = document.getElementById('tab-btn-timeline');

// ── 4. Initialize Application ──
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch Mitigation Skills database
        const skillsResp = await fetch('./data/mit_skills.json');
        mitSkillsDatabase = await skillsResp.json();
        
        // Fetch Duties database
        const dutiesResp = await fetch('./data/duties/index.json');
        mitDutiesDatabase = await dutiesResp.json();

        // Populate Duty Select dropdown
        populateMitDutyDropdown(mitDutiesDatabase);

        // Bind events & listeners
        setupMitEventListeners();
        renderPartySelector();
        renderMitSkillsList();
        renderMitPlayerTracks();

        // Restore auth session & handle oauth redirect
        sb.auth.onAuthStateChange((event, session) => {
            currentUser = session?.user || null;
            updateAuthUI();
        });

        // Check if there are sharing tokens in the URL
        await handleUrlSharingTokens();
    } catch (err) {
        console.error('Initialization error in mit_timeline.js:', err);
    }
});

// ── 5. Auth UI Helpers ──
function updateAuthUI() {
    let profileArea = document.getElementById('user-profile-area');
    if (!profileArea) {
        profileArea = document.createElement('div');
        profileArea.id = 'user-profile-area';
        profileArea.style.display = 'flex';
        profileArea.style.alignItems = 'center';
        profileArea.style.gap = '10px';
        profileArea.style.marginLeft = 'auto';
        document.querySelector('.logo-area').appendChild(profileArea);
    }

    if (currentUser) {
        const username = currentUser.user_metadata?.custom_claims?.global_name || currentUser.user_metadata?.full_name || currentUser.email || '已登入';
        const avatarUrl = currentUser.user_metadata?.avatar_url;
        profileArea.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.05); padding:4px 10px; border-radius:20px; border:1px solid var(--border-color);">
                ${avatarUrl ? `<img src="${avatarUrl}" style="width:20px; height:20px; border-radius:50%;" />` : '<i class="fa-solid fa-user"></i>'}
                <span style="font-size:12px; color:#fff; font-weight:600;">${username}</span>
                <button id="btn-logout" class="btn-mini" style="background:none; border:none; color:var(--color-danger); cursor:pointer;" title="登出"><i class="fa-solid fa-right-from-bracket"></i></button>
            </div>
        `;
        document.getElementById('btn-logout').addEventListener('click', () => sb.auth.signOut());
    } else {
        profileArea.innerHTML = `
            <button id="btn-login" class="btn btn-secondary" style="padding: 5px 12px; font-size:12px;"><i class="fa-brands fa-discord"></i> 登入 Discord</button>
        `;
        document.getElementById('btn-login').addEventListener('click', () => {
            sb.auth.signInWithOAuth({
                provider: 'discord',
                options: {
                    redirectTo: window.location.origin + window.location.pathname
                }
            });
        });
    }
}

// ── 6. Helper Functions ──
function getPixelsPerSecond() {
    return window.pixelsPerSecond || 15;
}

function populateMitDutyDropdown(dutiesData) {
    mitDutySelect.innerHTML = '<option value="">無副本 (自訂時間軸)</option>';
    const duties = dutiesData.duties || [];
    
    // Group duties by category
    const categories = dutiesData.categories || {};
    const dutiesByCategory = {};
    duties.forEach(duty => {
        if (!dutiesByCategory[duty.category]) {
            dutiesByCategory[duty.category] = [];
        }
        dutiesByCategory[duty.category].push(duty);
    });

    Object.keys(dutiesByCategory).forEach(catKey => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = categories[catKey] || catKey;
        
        dutiesByCategory[catKey].forEach(duty => {
            const option = document.createElement('option');
            option.value = duty.file;
            option.text = duty.name;
            optgroup.appendChild(option);
        });
        mitDutySelect.appendChild(optgroup);
    });
}

// ── 7. Render functions ──

function renderPartySelector() {
    partyGrid.innerHTML = '';
    const availableJobs = Object.keys(mitSkillsDatabase);
    
    const slotLabels = ['T1', 'T2', 'H1', 'H2', 'D1', 'D2', 'D3', 'D4'];
    
    for (let i = 0; i < 8; i++) {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.gap = '2px';
        
        const label = document.createElement('span');
        label.textContent = slotLabels[i];
        label.style.fontSize = '9px';
        label.style.fontWeight = 'bold';
        label.style.color = 'var(--color-text-muted)';
        
        const select = document.createElement('select');
        select.dataset.slot = i;
        
        availableJobs.forEach(jobKey => {
            const option = document.createElement('option');
            option.value = jobKey;
            option.text = mitSkillsDatabase[jobKey].name;
            if (mitParty[i] === jobKey) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        
        select.addEventListener('change', (e) => {
            mitParty[i] = e.target.value;
            // Shift skills scheduled on this track to match the new job's keys, or clear them if mismatch
            mitTimelineSkills = mitTimelineSkills.filter(cast => cast.slotIndex !== i);
            renderMitSkillsList();
            renderMitPlayerTracks();
            renderMitTimeline();
        });
        
        wrapper.appendChild(label);
        wrapper.appendChild(select);
        partyGrid.appendChild(wrapper);
    }
}

function renderMitSkillsList() {
    mitSkillsList.innerHTML = '';
    const searchQuery = document.getElementById('mit-skill-search').value.toLowerCase();
    
    // Get unique active jobs in party
    const activeJobs = [...new Set(mitParty)];
    
    activeJobs.forEach(jobKey => {
        const jobData = mitSkillsDatabase[jobKey];
        if (!jobData) return;
        
        const filteredSkills = jobData.skills.filter(s => {
            return s.name.toLowerCase().includes(searchQuery) ||
                   (s.title && s.title.toLowerCase().includes(searchQuery));
        });
        
        if (filteredSkills.length === 0) return;
        
        const section = document.createElement('div');
        section.className = 'job-skills-section';
        section.innerHTML = `
            <div style="display:flex; align-items:center; gap:6px; margin: 12px 0 6px 0; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;">
                <img src="${jobData.icon}" style="width:16px; height:16px; border-radius:3px;" />
                <span style="font-size:11px; font-weight:bold; color:#00f0ff;">${jobData.name}</span>
            </div>
        `;
        
        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        grid.style.gap = '6px';
        
        filteredSkills.forEach(skill => {
            const item = document.createElement('div');
            item.className = 'skill-card drag-source';
            item.draggable = true;
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.gap = '6px';
            item.style.padding = '5px 8px';
            item.style.background = 'rgba(255,255,255,0.03)';
            item.style.border = '1px solid var(--border-color)';
            item.style.borderRadius = '6px';
            item.style.cursor = 'grab';
            
            item.innerHTML = `
                <img src="${skill.icon}" style="width:20px; height:20px; border-radius:3px;" />
                <span style="font-size:11px; font-weight:500; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${skill.name}</span>
            `;
            
            // Tooltip handlers
            item.addEventListener('mouseenter', (e) => showMitTooltip(e, skill, jobData.name));
            item.addEventListener('mouseleave', hideMitTooltip);
            
            // Drag start
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    sourceType: 'sidebar',
                    jobKey: jobKey,
                    skillKey: skill.id,
                    duration: skill.duration
                }));
                e.dataTransfer.effectAllowed = 'copy';
            });
            
            grid.appendChild(item);
        });
        
        section.appendChild(grid);
        mitSkillsList.appendChild(section);
    });
}

function showMitTooltip(e, skill, jobName) {
    const tooltip = document.getElementById('skill-tooltip');
    if (!tooltip) return;
    
    tooltip.querySelector('.tooltip-name').textContent = skill.name;
    tooltip.querySelector('.tooltip-icon').src = skill.icon;
    tooltip.querySelector('.tooltip-job').textContent = `${jobName} (持續時間: ${skill.duration}s)`;
    tooltip.querySelector('.tooltip-mp').textContent = skill.cooldown ? `${skill.cooldown}秒` : '-';
    tooltip.querySelector('.tooltip-times').textContent = `冷卻 / CD`;
    tooltip.querySelector('.tooltip-range').textContent = skill.tags ? skill.tags.join(', ') : '減傷';
    tooltip.querySelector('.tooltip-description').textContent = skill.title || '無詳細效果說明。';
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = `${rect.right + 10}px`;
    tooltip.style.top = `${rect.top}px`;
    tooltip.classList.add('active');
}

function hideMitTooltip() {
    const tooltip = document.getElementById('skill-tooltip');
    if (tooltip) tooltip.classList.remove('active');
}

function renderMitPlayerTracks() {
    mitPlayerTracksContainer.innerHTML = '';
    const slotLabels = ['T1', 'T2', 'H1', 'H2', 'D1', 'D2', 'D3', 'D4'];
    
    for (let i = 0; i < 8; i++) {
        const jobKey = mitParty[i];
        const jobData = mitSkillsDatabase[jobKey];
        if (!jobData) continue;
        
        const trackWrapper = document.createElement('div');
        trackWrapper.className = 'player-track-wrapper';
        
        const trackHeader = document.createElement('div');
        trackHeader.className = 'player-track-header';
        trackHeader.innerHTML = `
            <span style="font-size:10px; font-weight:bold; color:var(--color-gcd); background:rgba(0,240,255,0.1); padding:2px 4px; border-radius:3px; min-width:20px; text-align:center;">${slotLabels[i]}</span>
            <img src="${jobData.icon}" />
            <span>${jobData.name}</span>
        `;
        
        const trackContent = document.createElement('div');
        trackContent.className = 'player-track-content';
        trackContent.dataset.slotIndex = i;
        trackContent.dataset.jobKey = jobKey;
        
        // Drag and drop event listeners
        trackContent.addEventListener('dragover', (e) => {
            e.preventDefault();
            trackContent.classList.add('drag-hover');
        });
        
        trackContent.addEventListener('dragleave', () => {
            trackContent.classList.remove('drag-hover');
        });
        
        trackContent.addEventListener('drop', (e) => {
            e.preventDefault();
            trackContent.classList.remove('drag-hover');
            handleMitDrop(e, trackContent);
        });
        
        trackWrapper.appendChild(trackHeader);
        trackWrapper.appendChild(trackContent);
        mitPlayerTracksContainer.appendChild(trackWrapper);
    }
}

function renderMitTimeline() {
    const pps = getPixelsPerSecond();
    
    // Calculate total duration based on mechanics & casts
    let maxTime = 120; // Default minimum 120 seconds
    mitBossMechanics.forEach(m => {
        if (m.time > maxTime) maxTime = m.time;
    });
    mitTimelineSkills.forEach(c => {
        if (c.startTime + c.duration > maxTime) maxTime = c.startTime + c.duration;
    });
    
    const totalWidth = (maxTime + 15) * pps;
    mitTimelineEditor.style.width = `${totalWidth + 200}px`;
    mitLengthDisplay.innerHTML = `<i class="fa-regular fa-clock"></i> 軸總長: ${Math.ceil(maxTime)}s`;

    // Render Ruler
    renderMitRuler(totalWidth);

    // Render Boss Mechanics Track
    renderMitBossMechanics();

    // Render Player Track items
    const trackContents = document.querySelectorAll('.player-track-content');
    trackContents.forEach(track => {
        const slotIdx = parseInt(track.dataset.slotIndex);
        track.innerHTML = '';
        
        const casts = mitTimelineSkills.filter(c => c.slotIndex === slotIdx);
        casts.forEach(cast => {
            const skillData = mitSkillsDatabase[cast.jobKey]?.skills.find(s => s.id === cast.skillKey);
            if (!skillData) return;
            
            const pill = document.createElement('div');
            pill.className = 'placed-mit-pill';
            pill.draggable = true;
            pill.style.left = `${cast.startTime * pps}px`;
            pill.style.width = `${cast.duration * pps}px`;
            
            pill.innerHTML = `
                <img src="${skillData.icon}" />
                <span class="placed-mit-pill-name">${skillData.name}</span>
            `;
            
            // Drag moves timeline items
            pill.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    sourceType: 'timeline',
                    castId: cast.id
                }));
                // Set active dragging item styling
                setTimeout(() => pill.style.opacity = '0.5', 0);
            });
            
            pill.addEventListener('dragend', () => {
                pill.style.opacity = '1';
            });
            
            // Double click to delete
            pill.addEventListener('dblclick', () => {
                mitTimelineSkills = mitTimelineSkills.filter(c => c.id !== cast.id);
                renderMitTimeline();
            });
            
            track.appendChild(pill);
        });
    });
}

function renderMitRuler(width) {
    mitTimelineRuler.innerHTML = '';
    const pps = getPixelsPerSecond();
    const totalSeconds = Math.ceil(width / pps);
    
    for (let sec = 0; sec <= totalSeconds; sec += 5) {
        const tick = document.createElement('div');
        tick.className = sec % 10 === 0 ? 'ruler-tick major' : 'ruler-tick minor';
        tick.style.left = `${sec * pps}px`;
        
        if (sec % 10 === 0) {
            const label = document.createElement('span');
            label.className = 'ruler-label';
            const mins = Math.floor(sec / 60);
            const secs = sec % 60;
            label.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
            tick.appendChild(label);
        }
        mitTimelineRuler.appendChild(tick);
    }
}

function renderMitBossMechanics() {
    mitBossTrack.innerHTML = '';
    const pps = getPixelsPerSecond();
    
    mitBossMechanics.forEach(mech => {
        const pill = document.createElement('div');
        pill.className = `mechanic-pill ${mech.dmgType || 'physical'}`;
        pill.draggable = true;
        pill.style.left = `${mech.time * pps}px`;
        
        pill.innerHTML = `
            <span class="mechanic-name">${mech.name}</span>
            <span class="mechanic-time">${Math.floor(mech.time)}s</span>
        `;
        
        // Drag boss mechanics on timeline
        pill.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify({
                sourceType: 'mechanic',
                mechId: mech.id
            }));
            setTimeout(() => pill.style.opacity = '0.5', 0);
        });
        
        pill.addEventListener('dragend', () => {
            pill.style.opacity = '1';
        });

        // Double click to edit or delete
        pill.addEventListener('dblclick', () => {
            const newName = prompt('請輸入新的機制名稱:', mech.name);
            if (newName === null) return;
            if (newName.trim() === '') {
                mitBossMechanics = mitBossMechanics.filter(m => m.id !== mech.id);
            } else {
                mech.name = newName.trim();
            }
            renderMitTimeline();
        });
        
        mitBossTrack.appendChild(pill);
    });
}

// ── 8. Event and Drag Drop Handlers ──

function setupMitEventListeners() {
    // Search skills filter
    document.getElementById('mit-skill-search').addEventListener('input', renderMitSkillsList);

    // Zooming updates
    document.querySelector('.timeline-container-outer').addEventListener('scroll', (e) => {
        // Sync scroll header if needed
    });

    // Trash bin drop listener
    mitDragTrash.addEventListener('dragover', (e) => e.preventDefault());
    mitDragTrash.addEventListener('drop', (e) => {
        e.preventDefault();
        try {
            const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
            if (dragData.sourceType === 'timeline') {
                mitTimelineSkills = mitTimelineSkills.filter(c => c.id !== dragData.castId);
                renderMitTimeline();
            } else if (dragData.sourceType === 'mechanic') {
                mitBossMechanics = mitBossMechanics.filter(m => m.id !== dragData.mechId);
                renderMitTimeline();
            }
        } catch (err) {}
    });

    // Save, Load, and Share button clicks
    mitBtnSave.addEventListener('click', saveTeamPlanToSupabase);
    mitBtnLoad.addEventListener('click', loadTeamPlansModal);
    mitBtnShare.addEventListener('click', generateTeamShareUrl);
    mitBtnAddMechanic.addEventListener('click', addNewBossMechanic);

    // Duty dropdown load events
    mitDutySelect.addEventListener('change', async (e) => {
        const dutyFile = e.target.value;
        if (!dutyFile) {
            mitBossMechanics = [];
            renderMitTimeline();
            return;
        }
        
        try {
            const resp = await fetch(`./data/duties/${dutyFile}`);
            const data = await resp.json();
            
            // Map mechanics
            mitBossMechanics = (data.timeline || []).map((m, idx) => ({
                id: m.id || `mech-${idx}-${Date.now()}`,
                time: m.time,
                name: m.name,
                dmgType: m.dmgType || 'physical'
            }));
            
            renderMitTimeline();
        } catch (err) {
            alert(`載入機制失敗: ${err.message}`);
        }
    });

    // Sync boss mechanics when switching between tabs
    tabBtnMit.addEventListener('click', () => {
        if (window.bossMechanics) {
            mitBossMechanics = JSON.parse(JSON.stringify(window.bossMechanics));
            renderMitTimeline();
        }
    });

    tabBtnTimeline.addEventListener('click', () => {
        if (window.bossMechanics) {
            window.bossMechanics = JSON.parse(JSON.stringify(mitBossMechanics));
            // Trigger Tab 2 re-render
            if (typeof window.recalculateTimeline === 'function') window.recalculateTimeline();
            if (typeof window.renderTimeline === 'function') window.renderTimeline();
        }
    });
}

function handleMitDrop(e, trackContent) {
    try {
        const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
        const rect = trackContent.getBoundingClientRect();
        const dropX = e.clientX - rect.left;
        const dropTime = Math.max(0, dropX / getPixelsPerSecond());

        if (dragData.sourceType === 'sidebar') {
            // Drag a new mitigation from the list
            const newCast = {
                id: crypto.randomUUID(),
                slotIndex: parseInt(trackContent.dataset.slotIndex),
                jobKey: dragData.jobKey,
                skillKey: dragData.skillKey,
                startTime: parseFloat(dropTime.toFixed(1)),
                duration: dragData.duration || 15
            };
            mitTimelineSkills.push(newCast);
            renderMitTimeline();
        } else if (dragData.sourceType === 'timeline') {
            // Drag and reposition an existing cast
            const cast = mitTimelineSkills.find(c => c.id === dragData.castId);
            if (cast) {
                cast.slotIndex = parseInt(trackContent.dataset.slotIndex);
                cast.jobKey = trackContent.dataset.jobKey;
                cast.startTime = parseFloat(dropTime.toFixed(1));
                renderMitTimeline();
            }
        }
    } catch (err) {
        console.error('Error handling drop on mitigation track:', err);
    }
}

function addNewBossMechanic() {
    const timeStr = prompt('請輸入機制出現的時間秒數 (例如 25.5):');
    if (timeStr === null) return;
    const time = parseFloat(timeStr);
    if (isNaN(time) || time < 0) {
        alert('無效的時間格式！');
        return;
    }
    const name = prompt('請輸入首領機制名稱:');
    if (!name || name.trim() === '') return;
    
    mitBossMechanics.push({
        id: `custom-mech-${Date.now()}`,
        time: time,
        name: name.trim(),
        dmgType: 'physical'
    });
    
    mitBossMechanics.sort((a, b) => a.time - b.time);
    renderMitTimeline();
}

// ── 9. Supabase Operations (Cloud Save/Load/Share) ──

async function saveTeamPlanToSupabase() {
    if (!currentUser) {
        alert('請先登入 Discord 帳號後，才能儲存減排計畫至雲端！');
        return;
    }

    const name = prompt('請輸入雲端減排計畫名稱:', currentTeamPlanName);
    if (name === null) return;
    if (name.trim() === '') {
        alert('計畫名稱不能為空！');
        return;
    }
    currentTeamPlanName = name.trim();

    try {
        const payload = {
            dutyKey: mitDutySelect.value,
            party: mitParty,
            mits: mitTimelineSkills,
            customMechanics: mitBossMechanics
        };

        if (currentTeamPlanId) {
            // Update existing plan
            const { error } = await sb.from('team_plans')
                .update({
                    name: currentTeamPlanName,
                    party: mitParty,
                    mits: mitTimelineSkills,
                    custom_mechanics: mitBossMechanics,
                    updated_at: new Date()
                })
                .eq('id', currentTeamPlanId);

            if (error) throw error;
            alert('雲端減排計畫更新成功！');
        } else {
            // Create a new team plan
            const { data, error } = await sb.from('team_plans')
                .insert({
                    owner_id: currentUser.id,
                    duty_key: mitDutySelect.value || 'custom',
                    name: currentTeamPlanName,
                    party: mitParty,
                    mits: mitTimelineSkills,
                    custom_mechanics: mitBossMechanics
                })
                .select()
                .single();

            if (error) throw error;
            
            currentTeamPlanId = data.id;
            currentTeamEditToken = data.edit_token;
            currentTeamReadToken = data.read_token;
            alert('新雲端減排計畫儲存成功！');
        }
    } catch (err) {
        alert(`雲端儲存失敗: ${err.message}`);
    }
}

async function loadTeamPlansModal() {
    if (!currentUser) {
        alert('請先登入 Discord 以讀取您的雲端計畫！');
        return;
    }

    try {
        const { data: plans, error } = await sb.from('team_plans')
            .select('id, name, duty_key, updated_at')
            .eq('owner_id', currentUser.id)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        // Reuse the saves modal or alert lists
        const savesModal = document.getElementById('saves-modal');
        const savesList = document.getElementById('saves-list');
        
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
                
                li.innerHTML = `
                    <div style="cursor:pointer; flex:1;">
                        <strong>${plan.name}</strong><br/>
                        <span style="font-size:10px; color:var(--color-text-muted);">副本: ${plan.duty_key} | 更新於 ${new Date(plan.updated_at).toLocaleString()}</span>
                    </div>
                    <button class="btn btn-danger btn-mini" style="padding: 2px 6px;" title="刪除"><i class="fa-solid fa-trash"></i></button>
                `;
                
                // Click to load
                li.querySelector('div').addEventListener('click', async () => {
                    await loadTeamPlanById(plan.id);
                    savesModal.classList.remove('active');
                });
                
                // Click to delete
                li.querySelector('button').addEventListener('click', async (e) => {
                    e.stopPropagation();
                    if (confirm(`確定要刪除「${plan.name}」嗎？此動作無法復原。`)) {
                        const { error: delErr } = await sb.from('team_plans').delete().eq('id', plan.id);
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

async function loadTeamPlanById(planId) {
    try {
        const { data: plan, error } = await sb.from('team_plans')
            .select('*')
            .eq('id', planId)
            .single();

        if (error) throw error;

        currentTeamPlanId = plan.id;
        currentTeamEditToken = plan.edit_token;
        currentTeamReadToken = plan.read_token;
        currentTeamPlanName = plan.name;

        // Apply state
        mitDutySelect.value = plan.duty_key || '';
        mitParty = plan.party || [];
        mitTimelineSkills = plan.mits || [];
        mitBossMechanics = plan.custom_mechanics || [];

        renderPartySelector();
        renderMitSkillsList();
        renderMitPlayerTracks();
        renderMitTimeline();
        
        // Save to window globally for quick sync
        window.mitTimelineSkills = mitTimelineSkills;
        window.mitParty = mitParty;
        
        alert(`已載入「${plan.name}」！`);
    } catch (err) {
        alert(`載入計畫失敗: ${err.message}`);
    }
}

async function generateTeamShareUrl() {
    if (!currentTeamReadToken) {
        alert('請先點選「儲存至雲端」以儲存本計畫後，方可生成分享連結！');
        return;
    }
    const shareUrl = `${window.location.origin}${window.location.pathname}?mit_view=${currentTeamReadToken}`;
    const editUrl = currentTeamEditToken ? `${window.location.origin}${window.location.pathname}?mit_edit=${currentTeamEditToken}` : '';
    
    // Copy read url to clipboard
    try {
        await navigator.clipboard.writeText(shareUrl);
        alert(`分享連結已複製到剪貼簿！\n\n閱讀模式: ${shareUrl}\n\n協同編輯模式: ${editUrl || '無'}`);
    } catch (err) {
        prompt('請手動複製分享連結:', shareUrl);
    }
}

async function handleUrlSharingTokens() {
    const params = new URLSearchParams(window.location.search);
    const mitViewToken = params.get('mit_view');
    const mitEditToken = params.get('mit_edit');
    const token = mitViewToken || mitEditToken;
    
    if (token) {
        try {
            // Call RPC function to read team plan by token
            const { data, error } = await sb.rpc('get_team_plan_by_token', { p_token: token }).maybeSingle();
            if (error) throw error;
            if (!data) {
                alert('分享連結無效或該減排計畫已遭刪除！');
                return;
            }

            currentTeamPlanId = data.id;
            currentTeamEditToken = data.edit_token;
            currentTeamReadToken = data.read_token;
            currentTeamPlanName = data.name;

            // Apply state
            mitDutySelect.value = data.duty_key || '';
            mitParty = data.party || [];
            mitTimelineSkills = data.mits || [];
            mitBossMechanics = data.custom_mechanics || [];

            // If we only have view access, hide the edit buttons
            const isReadMode = (token === data.read_token);
            if (isReadMode) {
                mitBtnSave.style.display = 'none';
                mitBtnAddMechanic.style.display = 'none';
                mitDragTrash.style.display = 'none';
                document.getElementById('party-select-grid').style.pointerEvents = 'none';
                document.getElementById('mit-skills-list').style.pointerEvents = 'none';
                alert(`以「唯讀模式」載入團隊減排計畫：「${data.name}」`);
            } else {
                alert(`以「編輯模式」載入團隊減排計畫：「${data.name}」`);
            }

            renderPartySelector();
            renderMitSkillsList();
            renderMitPlayerTracks();
            renderMitTimeline();

            // Save to window globally for quick sync
            window.mitTimelineSkills = mitTimelineSkills;
            window.mitParty = mitParty;
        } catch (err) {
            console.error('Error loading shared token plan:', err);
        }
    }
}
