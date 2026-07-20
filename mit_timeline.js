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
let mitLayoutMode = 'vertical'; // 'vertical' or 'horizontal'
let mitGridExpanded = [false, false, false, false, false, false, false, false]; // whether player grid columns are expanded

// Cloud State Variables
let currentTeamPlanId = null;
let currentTeamEditToken = null;
let currentTeamReadToken = null;
let currentTeamPlanName = '未命名團隊排軸';
let currentTeamPlanOwnerId = null;
let currentTeamSharePassword = null;
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
const mitLayoutSelect = document.getElementById('mit-layout-select');
const mitBtnSave = document.getElementById('mit-btn-save');
const mitBtnLoad = document.getElementById('mit-btn-load');
const mitBtnShare = document.getElementById('mit-btn-share');
const mitBtnImport = document.getElementById('mit-btn-import');
const mitBtnExport = document.getElementById('mit-btn-export');
const mitFileImport = document.getElementById('mit-file-import');
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

        // Restore auth session & handle email auth / password recovery
        sb.auth.onAuthStateChange(async (event, session) => {
            currentUser = session?.user || null;
            updateAuthUI();
            
            if (event === 'PASSWORD_RECOVERY') {
                openAuthModal('reset-password');
                return;
            }
            
            const params = new URLSearchParams(window.location.search);
            const hasShareToken = params.has('mit_view') || params.has('mit_edit');
            
            if (!currentUser && !hasShareToken) {
                openAuthModal('login', true);
            } else {
                isAuthModalPersistent = false;
                closeAuthModal();
                if (currentUser && !hasShareToken) {
                    await loadUserDefaultParty(currentUser);
                }
            }
        });

        // Check if there are sharing tokens in the URL
        const params = new URLSearchParams(window.location.search);
        const hasShareToken = params.has('mit_view') || params.has('mit_edit');
        if (hasShareToken) {
            await handleUrlSharingTokens();
        } else {
            const { data: { session } } = await sb.auth.getSession();
            currentUser = session?.user || null;
            updateAuthUI();
            if (!currentUser) {
                openAuthModal('login', true);
            } else {
                await loadUserDefaultParty(currentUser);
            }
        }

        // Render timeline initially
        renderMitTimeline();
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
        profileArea.style.cssText = 'display:flex; align-items:center; gap:10px; margin-left:auto;';
        document.querySelector('.logo-area').appendChild(profileArea);
    }

    if (currentUser) {
        const username = currentUser.email || '已登入';
        profileArea.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.05); padding:4px 10px; border-radius:20px; border:1px solid var(--border-color);">
                <i class="fa-solid fa-circle-user" style="color:#7c9ef8;"></i>
                <span style="font-size:12px; color:#fff; font-weight:600;">${username}</span>
                <button id="btn-logout" class="btn-mini" style="background:none; border:none; color:var(--color-danger); cursor:pointer;" title="登出"><i class="fa-solid fa-right-from-bracket"></i></button>
            </div>
        `;
        document.getElementById('btn-logout').addEventListener('click', () => {
            window.trackEvent('auth', 'logout');
            sb.auth.signOut();
        });
    } else {
        profileArea.innerHTML = `
            <button id="btn-login" class="btn btn-secondary" style="padding:5px 14px; font-size:12px; display:flex; align-items:center; gap:6px;">
                <i class="fa-solid fa-right-to-bracket"></i> 登入 / 註冊
            </button>
        `;
        document.getElementById('btn-login').addEventListener('click', () => openAuthModal('login'));
    }
}

// ── Auth Modal ──
const _authInputStyle = 'width:100%; box-sizing:border-box; background:#0d0d1a; border:1px solid #333; border-radius:8px; padding:10px 12px; color:#fff; font-size:14px; outline:none; transition:border-color .2s;';
const _authBtnStyle = 'width:100%; padding:11px; background:linear-gradient(135deg,#4f6ef7,#7c9ef8); border:none; border-radius:8px; color:#fff; font-size:14px; font-weight:600; cursor:pointer; transition:opacity .2s;';

let isAuthModalPersistent = false;

function createAuthModal() {
    if (document.getElementById('auth-modal-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'auth-modal-overlay';
    overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(6px); display:none; align-items:center; justify-content:center; z-index:9999;';
    overlay.innerHTML = `
        <div id="auth-modal" style="background:#12121f; border:1px solid #2a2a3f; border-radius:18px; padding:36px 32px; width:380px; max-width:92vw; position:relative; box-shadow:0 24px 60px rgba(0,0,0,0.6);">
            <button id="auth-modal-close" style="position:absolute; top:14px; right:18px; background:none; border:none; color:#555; font-size:20px; cursor:pointer; line-height:1;">✕</button>
            <div id="auth-modal-content"></div>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { 
        if (e.target === overlay && !isAuthModalPersistent) {
            closeAuthModal(); 
        }
    });
    document.getElementById('auth-modal-close').addEventListener('click', () => {
        if (!isAuthModalPersistent) {
            closeAuthModal();
        }
    });
}

function openAuthModal(view = 'login', persistent = false) {
    isAuthModalPersistent = persistent;
    createAuthModal();
    const overlay = document.getElementById('auth-modal-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
    const closeBtn = document.getElementById('auth-modal-close');
    if (closeBtn) {
        closeBtn.style.display = persistent ? 'none' : 'block';
    }
    renderAuthView(view);
}

function closeAuthModal() {
    if (isAuthModalPersistent) return;
    const overlay = document.getElementById('auth-modal-overlay');
    if (overlay) overlay.style.display = 'none';
}

function renderAuthView(view) {
    const content = document.getElementById('auth-modal-content');
    if (!content) return;

    if (view === 'login') {
        content.innerHTML = `
            <h3 style="margin:0 0 6px; color:#fff; font-size:20px; font-weight:700;">歡迎回來</h3>
            <p style="margin:0 0 24px; color:#666; font-size:13px;">登入以儲存並同步你的排軸計畫</p>
            <div style="margin-bottom:14px;">
                <label style="font-size:12px; color:#999; display:block; margin-bottom:6px;">電子郵件</label>
                <input id="auth-email" type="email" placeholder="your@email.com" style="${_authInputStyle}">
            </div>
            <div style="margin-bottom:8px;">
                <label style="font-size:12px; color:#999; display:block; margin-bottom:6px;">密碼</label>
                <input id="auth-password" type="password" placeholder="••••••••" style="${_authInputStyle}">
            </div>
            <div style="text-align:right; margin-bottom:20px;">
                <a href="#" id="go-forgot" style="font-size:12px; color:#7c9ef8; text-decoration:none;">忘記密碼？</a>
            </div>
            <div id="auth-error" style="color:#ff6b6b; font-size:12px; margin-bottom:12px; display:none;"></div>
            <button id="auth-submit" style="${_authBtnStyle}">登入</button>
            <div style="text-align:center; margin-top:18px; font-size:13px; color:#666;">
                還沒有帳號？ <a href="#" id="go-signup" style="color:#7c9ef8; text-decoration:none; font-weight:600;">立即註冊</a>
            </div>
        `;
        document.getElementById('auth-submit').addEventListener('click', handleLogin);
        document.getElementById('auth-email').addEventListener('keydown', e => e.key === 'Enter' && document.getElementById('auth-password').focus());
        document.getElementById('auth-password').addEventListener('keydown', e => e.key === 'Enter' && handleLogin());
        document.getElementById('go-forgot').addEventListener('click', e => { e.preventDefault(); renderAuthView('forgot'); });
        document.getElementById('go-signup').addEventListener('click', e => { e.preventDefault(); renderAuthView('signup'); });

    } else if (view === 'signup') {
        content.innerHTML = `
            <h3 style="margin:0 0 6px; color:#fff; font-size:20px; font-weight:700;">建立帳號</h3>
            <p style="margin:0 0 24px; color:#666; font-size:13px;">註冊後收取驗證信，點擊連結即可啟用</p>
            <div style="margin-bottom:14px;">
                <label style="font-size:12px; color:#999; display:block; margin-bottom:6px;">電子郵件</label>
                <input id="auth-email" type="email" placeholder="your@email.com" style="${_authInputStyle}">
            </div>
            <div style="margin-bottom:14px;">
                <label style="font-size:12px; color:#999; display:block; margin-bottom:6px;">密碼（至少 6 位）</label>
                <input id="auth-password" type="password" placeholder="••••••••" style="${_authInputStyle}">
            </div>
            <div style="margin-bottom:14px;">
                <label style="font-size:12px; color:#999; display:block; margin-bottom:6px;">確認密碼</label>
                <input id="auth-password-confirm" type="password" placeholder="••••••••" style="${_authInputStyle}">
            </div>
            <div style="margin-bottom:20px;">
                <label style="font-size:12px; color:#999; display:block; margin-bottom:6px;">邀請碼</label>
                <input id="auth-invite-code" type="text" placeholder="輸入 6 位邀請碼" maxlength="6" style="${_authInputStyle}; text-transform:uppercase; letter-spacing:4px; font-weight:700;">
            </div>
            <div id="auth-error" style="color:#ff6b6b; font-size:12px; margin-bottom:12px; display:none;"></div>
            <button id="auth-submit" style="${_authBtnStyle}">發送驗證信並註冊</button>
            <div style="text-align:center; margin-top:18px; font-size:13px; color:#666;">
                已有帳號？ <a href="#" id="go-login" style="color:#7c9ef8; text-decoration:none; font-weight:600;">登入</a>
            </div>
        `;
        document.getElementById('auth-submit').addEventListener('click', handleSignup);
        document.getElementById('auth-invite-code').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase(); });
        document.getElementById('go-login').addEventListener('click', e => { e.preventDefault(); renderAuthView('login'); });

    } else if (view === 'forgot') {
        content.innerHTML = `
            <h3 style="margin:0 0 6px; color:#fff; font-size:20px; font-weight:700;">重設密碼</h3>
            <p style="margin:0 0 24px; color:#666; font-size:13px;">輸入你的電子郵件，我們會寄送重設連結。</p>
            <div style="margin-bottom:20px;">
                <label style="font-size:12px; color:#999; display:block; margin-bottom:6px;">電子郵件</label>
                <input id="auth-email" type="email" placeholder="your@email.com" style="${_authInputStyle}">
            </div>
            <div id="auth-error" style="color:#ff6b6b; font-size:12px; margin-bottom:12px; display:none;"></div>
            <button id="auth-submit" style="${_authBtnStyle}">發送重設信</button>
            <div style="text-align:center; margin-top:18px; font-size:13px; color:#666;">
                <a href="#" id="go-login" style="color:#7c9ef8; text-decoration:none;">← 返回登入</a>
            </div>
        `;
        document.getElementById('auth-submit').addEventListener('click', handleForgotPassword);
        document.getElementById('go-login').addEventListener('click', e => { e.preventDefault(); renderAuthView('login'); });

    } else if (view === 'check-email') {
        const msg = content.dataset.message || '請查看你的信箱，點擊驗證連結後即可使用。';
        content.innerHTML = `
            <div style="text-align:center; padding:10px 0;">
                <i class="fa-solid fa-envelope-circle-check" style="font-size:52px; color:#7c9ef8; margin-bottom:18px; display:block;"></i>
                <h3 style="color:#fff; margin:0 0 12px; font-size:20px;">信件已發送！</h3>
                <p style="color:#999; font-size:14px; line-height:1.7; margin:0 0 24px;">${msg}</p>
                <button id="go-login-btn" style="${_authBtnStyle}">返回登入</button>
            </div>
        `;
        document.getElementById('go-login-btn').addEventListener('click', () => renderAuthView('login'));

    } else if (view === 'reset-password') {
        content.innerHTML = `
            <h3 style="margin:0 0 6px; color:#fff; font-size:20px; font-weight:700;">設定新密碼</h3>
            <p style="margin:0 0 24px; color:#666; font-size:13px;">請輸入你的新密碼。</p>
            <div style="margin-bottom:14px;">
                <label style="font-size:12px; color:#999; display:block; margin-bottom:6px;">新密碼（至少 6 位）</label>
                <input id="auth-new-password" type="password" placeholder="••••••••" style="${_authInputStyle}">
            </div>
            <div style="margin-bottom:20px;">
                <label style="font-size:12px; color:#999; display:block; margin-bottom:6px;">確認新密碼</label>
                <input id="auth-new-password-confirm" type="password" placeholder="••••••••" style="${_authInputStyle}">
            </div>
            <div id="auth-error" style="color:#ff6b6b; font-size:12px; margin-bottom:12px; display:none;"></div>
            <button id="auth-submit" style="${_authBtnStyle}">更新密碼</button>
        `;
        document.getElementById('auth-submit').addEventListener('click', handleResetPassword);
    }
}

function showAuthError(msg) {
    const errEl = document.getElementById('auth-error');
    if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
}

async function handleLogin() {
    const email = document.getElementById('auth-email')?.value.trim();
    const password = document.getElementById('auth-password')?.value;
    if (!email || !password) { showAuthError('請填寫所有欄位'); return; }
    const btn = document.getElementById('auth-submit');
    btn.textContent = '登入中...';
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
        btn.textContent = '登入';
        showAuthError(error.message.includes('Invalid') ? '帳號或密碼錯誤' : error.message);
    } else {
        window.trackEvent('auth', 'login', { email });
        closeAuthModal();
    }
}

async function handleSignup() {
    const email = document.getElementById('auth-email')?.value.trim();
    const password = document.getElementById('auth-password')?.value;
    const confirm = document.getElementById('auth-password-confirm')?.value;
    const inviteCode = document.getElementById('auth-invite-code')?.value.trim().toUpperCase();
    if (!email || !password || !confirm || !inviteCode) { showAuthError('請填寫所有欄位'); return; }
    if (password !== confirm) { showAuthError('兩次密碼不一致'); return; }
    if (password.length < 6) { showAuthError('密碼至少需要 6 位'); return; }
    if (inviteCode.length !== 6) { showAuthError('邀請碼格式預析，請確認是否正確'); return; }

    const btn = document.getElementById('auth-submit');
    btn.textContent = '驗證邀請碼中...';

    // Validate invite code
    const { data: codeData, error: codeError } = await sb
        .from('invite_codes')
        .select('code')
        .eq('code', inviteCode)
        .eq('is_active', true)
        .maybeSingle();

    if (codeError || !codeData) {
        btn.textContent = '發送驗證信並註冊';
        showAuthError('邀請碼無效或已失效，請確認後再試');
        return;
    }

    btn.textContent = '發送中...';
    const { error } = await sb.auth.signUp({
        email, password,
        options: {
            emailRedirectTo: window.location.origin + window.location.pathname,
            data: { invite_code: inviteCode }
        }
    });
    if (error) {
        btn.textContent = '發送驗證信並註冊';
        showAuthError(error.message);
    } else {
        window.trackEvent('auth', 'register', { email });
        const content = document.getElementById('auth-modal-content');
        content.dataset.message = `驗證信已寄送至 ${email}，
請點擊信中的連結完成帳號啟用。`;
        renderAuthView('check-email');
    }
}

async function handleForgotPassword() {
    const email = document.getElementById('auth-email')?.value.trim();
    if (!email) { showAuthError('請輸入電子郵件'); return; }
    const btn = document.getElementById('auth-submit');
    btn.textContent = '發送中...';
    const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname
    });
    if (error) {
        btn.textContent = '發送重設信';
        showAuthError(error.message);
    } else {
        const content = document.getElementById('auth-modal-content');
        content.dataset.message = `重設信已寄送至 ${email}，\n請點擊信中的連結設定新密碼。`;
        renderAuthView('check-email');
    }
}

async function handleResetPassword() {
    const newPw = document.getElementById('auth-new-password')?.value;
    const confirmPw = document.getElementById('auth-new-password-confirm')?.value;
    if (!newPw || !confirmPw) { showAuthError('請填寫所有欄位'); return; }
    if (newPw !== confirmPw) { showAuthError('兩次密碼不一致'); return; }
    if (newPw.length < 6) { showAuthError('密碼至少需要 6 位'); return; }
    const btn = document.getElementById('auth-submit');
    btn.textContent = '更新中...';
    const { error } = await sb.auth.updateUser({ password: newPw });
    if (error) {
        btn.textContent = '更新密碼';
        showAuthError(error.message);
    } else {
        closeAuthModal();
        alert('密碼已成功更新！');
    }
}

// ── 6. Helper Functions ──
function parseDutyTime(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length === 2) {
        return parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
    }
    return parseFloat(timeStr) || 0;
}

function parseTimelineData(timelineList) {
    return (timelineList || []).map((m, idx) => {
        const time = parseDutyTime(m.castingTime || m.hitTime);
        let name = m.skill;
        if (name === 'AA') {
            name = '普通攻擊 (AA)';
        }
        if (!name) {
            if (m.variants && m.variants.length > 0) {
                name = m.variants.map(v => v.skill).join(' / ');
            } else {
                name = m.commonDesc || m.phase || '未命名機制';
            }
        }
        
        // Determine damage type
        let dmgType = '';
        const typeStr = m.type || (m.damage && m.damage[0] && m.damage[0].type) || '';
        if (typeStr.includes('物') || typeStr.toLowerCase().includes('physical')) {
            dmgType = 'physical';
        } else if (typeStr.includes('魔') || typeStr.toLowerCase().includes('magic')) {
            dmgType = 'magic';
        } else if (typeStr.includes('暗') || typeStr.toLowerCase().includes('darkness') || typeStr.includes('無') || typeStr.includes('真') || typeStr.includes('闇')) {
            dmgType = 'darkness';
        }
        
        // Get raw damage
        let rawDamage = 0;
        if (m.damage && m.damage[0] && typeof m.damage[0].amount === 'number') {
            rawDamage = m.damage[0].amount;
        } else if (m.variants && m.variants[0] && m.variants[0].damage && m.variants[0].damage[0] && typeof m.variants[0].damage[0].amount === 'number') {
            rawDamage = m.variants[0].damage[0].amount;
        }
        
        return {
            id: m.id || `mech-${idx}-${Date.now()}`,
            time: time,
            name: name,
            dmgType: dmgType,
            rawDamage: rawDamage
        };
    });
}

async function loadDutyMechanicsForPlan(dutyFile, savedMechanics) {
    try {
        const resp = await fetch(`./data/duties/${dutyFile}`);
        const data = await resp.json();
        const dutyMechs = parseTimelineData(data.timeline);
        
        // Merge saved custom mechanics that aren't in the official duty
        const dutyIds = new Set(dutyMechs.map(dm => dm.id));
        
        // Match up rawDamage for saved mechanics that match by id or name/time
        savedMechanics.forEach(sm => {
            const match = dutyMechs.find(dm => dm.id === sm.id || (dm.name === sm.name && Math.abs(dm.time - sm.time) < 0.1));
            if (match) {
                sm.rawDamage = match.rawDamage;
                sm.dmgType = match.dmgType;
            }
        });
        
        mitBossMechanics = savedMechanics;
    } catch (err) {
        console.error('Failed to reload duty mechanics for plan:', err);
        mitBossMechanics = savedMechanics;
    }
}

function formatTime(sec) {
    const isNegative = sec < 0;
    const absSec = Math.abs(sec);
    const m = Math.floor(absSec / 60).toString().padStart(2, '0');
    const s = Math.floor(absSec % 60).toString().padStart(2, '0');
    const ms = Math.floor(Math.round((absSec * 1000) % 1000)).toString().padStart(3, '0');
    return `${isNegative ? '-' : ''}${m}:${s}.${ms}`;
}

let customJobPanels = {};
try {
    const rawPanels = localStorage.getItem('sked_custom_job_panels');
    if (rawPanels) customJobPanels = JSON.parse(rawPanels);
} catch (e) {}

function getActivePanelSkillIds(jobKey) {
    const jobData = mitSkillsDatabase[jobKey];
    if (!jobData) return new Set();
    if (customJobPanels[jobKey] && Array.isArray(customJobPanels[jobKey]) && customJobPanels[jobKey].length > 0) {
        return new Set(customJobPanels[jobKey]);
    }
    const jobSkills = getPlayerMitSkills(jobKey);
    return new Set(jobSkills.map(s => s.id));
}

function getPlayerMitSkills(jobKey, slotIndex) {
    const jobData = mitSkillsDatabase[jobKey];
    if (!jobData) return [];
    
    let allSkills;
    if (customJobPanels[jobKey] && Array.isArray(customJobPanels[jobKey]) && customJobPanels[jobKey].length > 0) {
        const customIds = new Set(customJobPanels[jobKey]);
        if (Array.isArray(mitTimelineSkills)) {
            mitTimelineSkills.forEach(c => {
                if ((c.jobKey === jobKey || c.jobAbbrev === jobKey) && c.skillKey) {
                    customIds.add(c.skillKey);
                }
            });
        }
        allSkills = jobData.skills.filter(s => customIds.has(s.id));
    } else {
        const teamMitSkillIds = new Set([
            'pld_rep', 'pld_passage', 'pld_veil', 'pld_inter',
            'war_rep', 'war_shake', 'war_nascent',
            'drk_rep', 'drk_missionary', 'drk_tbn', 'drk_oblation',
            'gnb_rep', 'gnb_hol', 'gnb_corundum',
            'whm_temp', 'whm_asy', 'whm_aqua', 'whm_bell', 'whm_pli',
            'sch_soil', 'sch_exp', 'sch_fey', 'sch_pro', 'sch_ser', 'sch_whi',
            'ast_cu', 'ast_sunsign', 'ast_neutral', 'ast_exalt', 'ast_celop', 'ast_horos',
            'sge_kera', 'sge_pan', 'sge_holos', 'sge_physis', 'sge_haima', 'sge_tauro', 'sge_phys2', 'sge_pneuma',
            'mnk_feint', 'drg_feint', 'nin_feint', 'sam_feint', 'rpr_feint', 'vpr_feint',
            'brd_troub', 'mch_tac', 'dnc_samba',
            'blm_addle', 'smn_addle', 'rdm_addle', 'rdm_barrier', 'pct_addle', 'pct_tempera'
        ]);

        const activeSkillKeys = new Set();
        if (Array.isArray(mitTimelineSkills)) {
            mitTimelineSkills.forEach(c => {
                if ((c.jobKey === jobKey || c.jobAbbrev === jobKey) && c.skillKey) {
                    activeSkillKeys.add(c.skillKey);
                }
            });
        }

        allSkills = jobData.skills.filter(s => {
            if (s.passive || s.id.includes('passive')) return false;
            if (activeSkillKeys.has(s.id)) return true;
            if (teamMitSkillIds.has(s.id)) return true;

            const nameLower = (s.name || '').toLowerCase();
            if (nameLower.includes('雪仇') || nameLower.includes('reprisal')) return true;
            if (nameLower.includes('牽制') || nameLower.includes('feint')) return true;
            if (nameLower.includes('昏亂') || nameLower.includes('addle')) return true;
            if (nameLower.includes('行進曲') || nameLower.includes('troubadour')) return true;
            if (nameLower.includes('策勵') || nameLower.includes('tactician')) return true;
            if (nameLower.includes('桑巴') || nameLower.includes('samba')) return true;

            const isMitOrShield = s.tags && (s.tags.includes('減傷') || s.tags.includes('護盾'));
            const isPartyOrTargeted = !s.personal || s.targetable || s.canTargetOther;

            if (isMitOrShield && isPartyOrTargeted) return true;

            return false;
        });
    }
    
    // Check if slot index is valid. If not, just return all utility skills
    if (slotIndex === undefined || slotIndex < 0 || slotIndex >= 8) {
        return allSkills;
    }
    
    const isExpanded = mitGridExpanded[slotIndex] === true;
    if (isExpanded) {
        return allSkills;
    }
    
    // Collapsed: show at most 3 skills.
    // 1. Get skills currently used by this slot
    const usedSkillIds = new Set(
        mitTimelineSkills.filter(c => c.slotIndex === slotIndex).map(c => c.skillKey)
    );
    
    // 2. Put used skills first
    const visible = allSkills.filter(s => usedSkillIds.has(s.id));
    
    // 3. Fill up to 3 with unused skills
    if (visible.length < 3) {
        const unused = allSkills.filter(s => !usedSkillIds.has(s.id));
        for (const s of unused) {
            if (visible.length >= 3) break;
            visible.push(s);
        }
    }
    
    // Keep consistent relative order
    visible.sort((a, b) => allSkills.indexOf(a) - allSkills.indexOf(b));
    
    return visible;
}

function showCustomChoiceDialog(title, message, options) {
    return new Promise((resolve) => {
        const modal = document.getElementById('mit-choice-dialog-modal');
        const titleEl = document.getElementById('mit-choice-title');
        const msgEl = document.getElementById('mit-choice-message');
        const btnsEl = document.getElementById('mit-choice-buttons');
        const closeBtn = document.getElementById('mit-choice-close');

        if (!modal || !titleEl || !msgEl || !btnsEl) {
            resolve(null);
            return;
        }

        titleEl.innerHTML = `<i class="fa-solid fa-circle-question" style="color: #f59e0b;"></i> ${title || '確認操作'}`;
        msgEl.innerHTML = message || '';
        btnsEl.innerHTML = '';

        const cleanup = (val) => {
            modal.classList.remove('active');
            resolve(val);
        };

        if (closeBtn) {
            closeBtn.onclick = () => cleanup(null);
        }

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = `btn ${opt.btnClass || 'btn-secondary'}`;
            btn.style.padding = '8px 14px';
            btn.style.fontSize = '13px';
            btn.style.fontWeight = '600';
            btn.innerHTML = opt.label;
            btn.onclick = () => cleanup(opt.value);
            btnsEl.appendChild(btn);
        });

        modal.classList.add('active');
    });
}

async function addNewCustomTimePoint() {
    const timeStr = prompt('請輸入自訂時間點秒數 (例如 15.5):');
    if (timeStr === null) return;
    const time = parseFloat(timeStr);
    if (isNaN(time) || time < 0) {
        alert('無效的時間格式！');
        return;
    }
    
    const nameStr = prompt('請輸入備註名稱（非必填，可直接留空）:') || '';
    
    mitBossMechanics.push({
        id: `custom-mech-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        time: time,
        name: nameStr.trim(),
        isCustom: true,
        dmgType: ''
    });
    
    mitBossMechanics.sort((a, b) => a.time - b.time);
    renderMitTimeline();
}

async function deleteMechanicRow(mechId) {
    const mech = mitBossMechanics.find(m => m.id === mechId);
    if (!mech) return;

    // Find all scheduled casts at this exact mech.time
    const scheduledCasts = mitTimelineSkills.filter(c => Math.abs(c.startTime - mech.time) <= 1.0);

    if (scheduledCasts.length > 0) {
        const JOB_NAMES = {
            'PLD': '騎士', 'WAR': '戰士', 'DRK': '暗黑騎士', 'GNB': '絕槍戰士',
            'WHM': '白魔導士', 'SCH': '學者', 'AST': '占星術師', 'SGE': '賢者',
            'MNK': '武僧', 'DRG': '龍騎士', 'NIN': '忍者', 'SAM': '武士', 'RPR': '釤鐮客', 'VPR': '毒蛇劍士',
            'BRD': '吟遊詩人', 'MCH': '機工士', 'DNC': '舞者',
            'BLM': '黑魔導士', 'SMN': '召喚師', 'RDM': '赤魔導士', 'PCT': '繪靈法師'
        };

        const jobNamesSet = new Set();
        scheduledCasts.forEach(c => {
            const jName = JOB_NAMES[c.jobKey || c.jobAbbrev] || c.jobKey || c.jobAbbrev;
            if (jName) jobNamesSet.add(jName);
        });

        const jobNamesStr = Array.from(jobNamesSet).join('、');

        const choice = await showCustomChoiceDialog(
            '刪除時間點與技能處理',
            `此時間職業【${jobNamesStr}】有安排技能，要順延至下個時間點嗎？`,
            [
                { label: '<i class="fa-solid fa-angles-right"></i> 順延時間點', value: 'delay', btnClass: 'btn-primary' },
                { label: '<i class="fa-solid fa-trash-can"></i> 刪除技能', value: 'delete', btnClass: 'btn-danger' },
                { label: '取消', value: null, btnClass: 'btn-secondary' }
            ]
        );

        if (choice === null) return;

        if (choice === 'delay') {
            const sortedMechs = [...mitBossMechanics].sort((a, b) => a.time - b.time);
            const nextMech = sortedMechs.find(m => m.id !== mechId && m.time > mech.time);

            if (nextMech) {
                scheduledCasts.forEach(c => {
                    c.startTime = nextMech.time;
                });
            } else {
                scheduledCasts.forEach(c => {
                    c.startTime = parseFloat((c.startTime + 5.0).toFixed(1));
                });
            }
        } else if (choice === 'delete') {
            const castIdsToRemove = new Set(scheduledCasts.map(c => c.id));
            mitTimelineSkills = mitTimelineSkills.filter(c => !castIdsToRemove.has(c.id));
        }
    }

    mitBossMechanics = mitBossMechanics.filter(m => m.id !== mechId);
    renderMitTimeline();
}

async function toggleMitGridSkill(slotIndex, jobKey, skillId, startTime, isChecked) {
    if (isChecked) {
        const jobData = mitSkillsDatabase[jobKey];
        const skill = jobData?.skills.find(s => s.id === skillId);
        const cooldown = skill ? (skill.cooldown || 60) : 60;
        const duration = skill ? (skill.duration || 15) : 15;

        // Check if checking this skill conflicts with any subsequent casts of the same skill for this player
        const conflictingCasts = mitTimelineSkills.filter(c => 
            c.slotIndex === slotIndex && 
            c.skillKey === skillId && 
            c.startTime > startTime && 
            c.startTime < startTime + cooldown
        );

        if (conflictingCasts.length > 0) {
            const skillName = skill ? skill.name : '此技能';
            const choice = await showCustomChoiceDialog(
                '技能冷卻衝突提示',
                `技能【${skillName}】與後續發生的安排卡時間了，要自動後推技能時間呢？還是刪除後續的安排時間？`,
                [
                    { label: '<i class="fa-solid fa-clock-rotate-left"></i> 順延技能時間', value: 'delay', btnClass: 'btn-primary' },
                    { label: '<i class="fa-solid fa-trash-can"></i> 刪除後續技能', value: 'delete', btnClass: 'btn-danger' },
                    { label: '取消', value: null, btnClass: 'btn-secondary' }
                ]
            );

            if (choice === null) {
                renderMitTimeline();
                return;
            }

            if (choice === 'delay') {
                const minAllowedTime = startTime + cooldown;
                const sortedMechs = [...mitBossMechanics].sort((a, b) => a.time - b.time);

                conflictingCasts.forEach(confCast => {
                    const targetMech = sortedMechs.find(m => m.time >= minAllowedTime);
                    if (targetMech) {
                        confCast.startTime = targetMech.time;
                    } else {
                        confCast.startTime = parseFloat(minAllowedTime.toFixed(1));
                    }
                });
            } else if (choice === 'delete') {
                const conflictIds = new Set(conflictingCasts.map(c => c.id));
                mitTimelineSkills = mitTimelineSkills.filter(c => !conflictIds.has(c.id));
            }
        }

        // Clear any duplicate exact cast at startTime
        mitTimelineSkills = mitTimelineSkills.filter(c => 
            !(c.slotIndex === slotIndex && c.skillKey === skillId && Math.abs(c.startTime - startTime) <= 1.0)
        );

        mitTimelineSkills.push({
            id: `cast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            slotIndex: slotIndex,
            jobKey: jobKey,
            jobAbbrev: jobKey,
            skillKey: skillId,
            startTime: startTime,
            duration: duration
        });
    } else {
        mitTimelineSkills = mitTimelineSkills.filter(c => 
            !(c.slotIndex === slotIndex && c.skillKey === skillId && Math.abs(c.startTime - startTime) <= 1.0)
        );
    }
    renderMitTimeline();
}

function calculateRemainingDamage(mech) {
    const rawDmg = mech.rawDamage || 0;
    if (rawDmg === 0) return '-';
    
    let multiplier = 1.0;
    
    // Find all active mitigations covering this mechanic
    mitTimelineSkills.forEach(c => {
        const isActive = mech.time >= c.startTime && mech.time < c.startTime + c.duration;
        if (isActive) {
            const skill = mitSkillsDatabase[c.jobKey || c.jobAbbrev]?.skills.find(s => s.id === c.skillKey);
            if (skill && skill.effects) {
                skill.effects.forEach(eff => {
                    let applies = false;
                    if (eff.type === 'mit_all') {
                        applies = true;
                    } else if (mech.dmgType === 'physical' && eff.type === 'mit_physical') {
                        applies = true;
                    } else if (mech.dmgType === 'magic' && eff.type === 'mit_magic') {
                        applies = true;
                    } else if (mech.dmgType === 'darkness' && eff.type === 'mit_darkness') {
                        applies = true;
                    }
                    
                    if (applies && typeof eff.val === 'number') {
                        multiplier *= (1 - eff.val);
                    }
                });
            }
        }
    });
    
    const finalDmg = Math.round(rawDmg * multiplier);
    return `<span class="${multiplier < 1.0 ? (multiplier <= 0.8 ? 'damage-reduced-heavy' : 'damage-reduced') : 'damage-original'}">${finalDmg.toLocaleString()}</span>`;
}

function renderMitVerticalGrid(container) {
    container.innerHTML = '';
    
    if (mitBossMechanics.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 100px 20px; text-align: center; color: var(--color-text-muted);">
                <i class="fa-solid fa-table-list" style="font-size: 48px; margin-bottom: 16px; color: var(--color-gcd);"></i>
                <h3>無副本數據</h3>
                <p style="margin-top: 8px; font-size: 14px;">請在左上角選擇副本（例如：絕伊甸 P1）以載入機制，開啟豎版表格減傷規劃！</p>
            </div>
        `;
        return;
    }
    
    const sortedMechs = [...mitBossMechanics].sort((a, b) => a.time - b.time);
    const slotLabels = ['T1', 'T2', 'H1', 'H2', 'D1', 'D2', 'D3', 'D4'];
    
    const table = document.createElement('table');
    table.className = 'mit-grid-table';
    
    const thead = document.createElement('thead');
    
    const tr1 = document.createElement('tr');
    tr1.innerHTML = `
        <th colspan="2" style="background-color: #171b26; padding: 6px 10px; text-align: center; border-right: 2px solid rgba(255, 255, 255, 0.15) !important; z-index: 35;" class="sticky-time">
            <button id="mit-btn-add-custom-time-table" class="btn btn-primary" style="font-size: 11px; padding: 4px 10px; font-weight: 600; width: 100%; justify-content: center; white-space: nowrap;"><i class="fa-solid fa-plus"></i> 新增自訂時間點</button>
        </th>
    `;
    const tableAddBtn = tr1.querySelector('#mit-btn-add-custom-time-table');
    if (tableAddBtn) {
        tableAddBtn.addEventListener('click', addNewCustomTimePoint);
    }
    
    const tr2 = document.createElement('tr');
    tr2.innerHTML = `
        <th class="sticky-time">判定時間</th>
        <th class="sticky-name">機制名稱</th>
    `;
    
    // Save list of visible skills for each player to align tbody columns correctly
    const playerSkillsList = [];
    
    for (let i = 0; i < 8; i++) {
        const jobKey = mitParty[i];
        const jobData = mitSkillsDatabase[jobKey];
        if (!jobData) {
            playerSkillsList.push([]);
            continue;
        }
        
        const allSkills = getPlayerMitSkills(jobKey); // all utility skills
        const skills = getPlayerMitSkills(jobKey, i); // visible skills (collapsed or expanded)
        playerSkillsList.push(skills);
        
        const colspan = Math.max(1, skills.length);
        const isExpanded = mitGridExpanded[i] === true;
        const hasExpandOption = allSkills.length > 3;
        
        const th1 = document.createElement('th');
        th1.colSpan = colspan;
        th1.className = 'player-header-cell job-separator-left';
        th1.innerHTML = `
            <div class="player-header-content">
                <div class="player-header-top">
                    <span class="player-slot-badge">${slotLabels[i]}</span>
                    <img src="${jobData.icon}" />
                </div>
                <div class="player-header-name">${jobData.name}</div>
            </div>
        `;
        
        if (hasExpandOption) {
            th1.classList.add('clickable-header');
            th1.style.cursor = 'pointer';
            th1.title = isExpanded ? '點擊收合技能' : '點擊展開更多技能';
            th1.addEventListener('click', () => {
                mitGridExpanded[i] = !mitGridExpanded[i];
                renderMitTimeline();
            });
        }
        
        tr1.appendChild(th1);
        
        if (skills.length === 0) {
            const th2 = document.createElement('th');
            th2.className = 'skill-header-cell job-separator-left';
            th2.innerHTML = '<span style="color: var(--color-text-muted); font-size: 11px;">無</span>';
            tr2.appendChild(th2);
        } else {
            skills.forEach((skill, sIdx) => {
                const th2 = document.createElement('th');
                th2.className = sIdx === 0 ? 'skill-header-cell job-separator-left' : 'skill-header-cell';
                th2.innerHTML = `
                    <div class="skill-header-content">
                        <img src="${skill.icon}" />
                        <span>${skill.name}</span>
                    </div>
                `;
                
                // Tooltip handlers
                th2.addEventListener('mouseenter', (e) => showMitTooltip(e, skill, jobData.name));
                th2.addEventListener('mouseleave', hideMitTooltip);
                th2.addEventListener('mousemove', (e) => {
                    const tooltip = document.getElementById('skill-tooltip');
                    if (tooltip) {
                        tooltip.style.left = `${e.clientX + 15}px`;
                        tooltip.style.top = `${e.clientY + 15}px`;
                    }
                });
                
                tr2.appendChild(th2);
            });
        }
    }
    
    tr1.insertAdjacentHTML('beforeend', `<th rowspan="2" class="sticky-damage">預計傷害</th>`);
    
    thead.appendChild(tr1);
    thead.appendChild(tr2);
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    
    sortedMechs.forEach(mech => {
        const tr = document.createElement('tr');
        if (mech.isCustom) tr.classList.add('is-custom-row');
        
        const timeStr = formatTime(mech.time);
        const dmgTypeLabel = mech.dmgType ? `<span class="damage-type-badge ${mech.dmgType}">${mech.dmgType === 'physical' ? '物理' : mech.dmgType === 'magic' ? '魔法' : '無屬'}</span>` : '';
        const customBadge = mech.isCustom ? `<span class="custom-row-badge">自訂</span>` : '';

        const tdTime = document.createElement('td');
        tdTime.className = 'sticky-time';
        tdTime.style.userSelect = 'none';
        tdTime.innerHTML = `
            <span>${timeStr}</span>
            <button class="btn-delete-row" title="刪除此時間點"><i class="fa-solid fa-xmark"></i></button>
        `;
        const delBtn = tdTime.querySelector('.btn-delete-row');
        if (delBtn) {
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteMechanicRow(mech.id);
            });
        }
        tr.appendChild(tdTime);
        
        const tdName = document.createElement('td');
        tdName.className = 'sticky-name';
        const displayName = mech.name ? mech.name : '<span style="color:var(--color-text-muted); font-style:italic; font-size:11px;">(點擊編輯備註)</span>';
        tdName.innerHTML = `${displayName} ${customBadge} ${dmgTypeLabel}`;
        tdName.title = '點擊修改備註';
        tdName.style.cursor = 'pointer';

        tdName.addEventListener('click', () => {
            const newName = prompt('請輸入此時間點的備註（非必填，可留空）:', mech.name || '');
            if (newName !== null) {
                mech.name = newName.trim();
                renderMitTimeline();
            }
        });

        tr.appendChild(tdName);
        
        for (let i = 0; i < 8; i++) {
            const jobKey = mitParty[i];
            const skills = playerSkillsList[i];
            
            if (skills.length === 0) {
                const td = document.createElement('td');
                td.className = 'empty-skill-cell job-separator-left';
                td.textContent = '—';
                tr.appendChild(td);
            } else {
                skills.forEach((skill, sIdx) => {
                    const td = document.createElement('td');
                    if (sIdx === 0) td.classList.add('job-separator-left');
                    
                    const casts = mitTimelineSkills.filter(c => c.slotIndex === i && c.skillKey === skill.id);
                    const isCast = casts.some(c => {
                        const firstMatch = sortedMechs.find(m => Math.abs(m.time - c.startTime) <= 0.25);
                        return firstMatch && firstMatch.id === mech.id;
                    });
                    const isActive = !isCast && casts.some(c => mech.time >= c.startTime && mech.time < c.startTime + c.duration);
                    const isCooldown = !isCast && !isActive && casts.some(c => mech.time >= c.startTime + c.duration && mech.time < c.startTime + (skill.cooldown || 60));
                    
                    const wrapper = document.createElement('div');
                    wrapper.className = 'mit-checkbox-wrapper';
                    
                    const input = document.createElement('input');
                    input.type = 'checkbox';
                    input.className = 'mit-checkbox';
                    
                    if (isCast) {
                        input.checked = true;
                        input.addEventListener('change', () => toggleMitGridSkill(i, jobKey, skill.id, mech.time, false));
                    } else if (isActive) {
                        input.checked = false;
                        input.disabled = true;
                        input.classList.add('active-duration');
                        td.title = '持續時間覆蓋中';
                    } else if (isCooldown) {
                        input.checked = false;
                        input.disabled = true;
                        input.classList.add('cooldown');
                        td.title = '技能冷卻中';
                    } else {
                        input.checked = false;
                        input.addEventListener('change', () => toggleMitGridSkill(i, jobKey, skill.id, mech.time, true));
                    }
                    
                    wrapper.appendChild(input);
                    td.appendChild(wrapper);
                    tr.appendChild(td);
                });
            }
        }
        
        const tdDmg = document.createElement('td');
        tdDmg.className = 'sticky-damage';
        tdDmg.innerHTML = calculateRemainingDamage(mech);
        tr.appendChild(tdDmg);
        
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
}

function getPixelsPerSecond() {
    return window.pixelsPerSecond || 15;
}

function populateMitDutyDropdown(dutiesData, selectedValue = '') {
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

    // Append optgroups in original order
    Object.keys(dutiesByCategory).forEach(catKey => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = categories[catKey]?.label || catKey;
        
        dutiesByCategory[catKey].forEach(duty => {
            const option = document.createElement('option');
            option.value = duty.file;
            option.text = duty.name;
            if (duty.file === selectedValue) {
                option.selected = true;
            }
            optgroup.appendChild(option);
        });
        mitDutySelect.appendChild(optgroup);
    });

    // Sync with custom dropdown
    if (typeof window.syncCustomDropdown === 'function') {
        window.syncCustomDropdown(mitDutySelect, dutiesData);
    }
}

// ── 7. Render functions ──

function renderPartySelector() {
    partyGrid.innerHTML = '';
    const availableJobs = Object.keys(mitSkillsDatabase);
    const filterCheckbox = document.getElementById('mit-filter-roles-checkbox');
    const isFiltered = filterCheckbox ? filterCheckbox.checked : false;
    
    const slotLabels = ['T1', 'T2', 'H1', 'H2', 'D1', 'D2', 'D3', 'D4'];
    
    // Role mapping for FFXIV jobs
    const JOB_ROLES = {
        'PLD': 'tank', 'WAR': 'tank', 'DRK': 'tank', 'GNB': 'tank',
        'WHM': 'healer', 'SCH': 'healer', 'AST': 'healer', 'SGE': 'healer',
        'SAM': 'dps', 'MNK': 'dps', 'DRG': 'dps', 'RPR': 'dps', 'VPR': 'dps',
        'BRD': 'dps', 'MCH': 'dps', 'DNC': 'dps',
        'BLM': 'dps', 'SMN': 'dps', 'RDM': 'dps', 'PCT': 'dps'
    };
    
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
        
        // Determine expected role for this slot
        let expectedRole = 'dps';
        if (i < 2) expectedRole = 'tank';
        else if (i < 4) expectedRole = 'healer';
        
        // If filtering is active and currently selected job is mismatched, assign fallback and clear timeline skills on slot
        let currentSelectedJob = mitParty[i];
        if (isFiltered && JOB_ROLES[currentSelectedJob.toUpperCase()] !== expectedRole) {
            const fallbackJob = availableJobs.find(jobKey => (JOB_ROLES[jobKey.toUpperCase()] || 'dps') === expectedRole);
            if (fallbackJob) {
                mitParty[i] = fallbackJob;
                mitTimelineSkills = mitTimelineSkills.filter(cast => cast.slotIndex !== i);
            }
        }
        
        availableJobs.forEach(jobKey => {
            const jobRole = JOB_ROLES[jobKey.toUpperCase()] || 'dps';
            if (isFiltered && jobRole !== expectedRole) {
                return;
            }
            
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
        
        if (typeof window.syncCustomDropdown === 'function') {
            window.syncCustomDropdown(select);
        }
    }
}

async function saveUserDefaultParty() {
    if (!mitParty || mitParty.length !== 8) return;
    
    try {
        localStorage.setItem('sked_default_mit_party', JSON.stringify(mitParty));
        if (currentUser) {
            localStorage.setItem(`sked_default_mit_party_${currentUser.id}`, JSON.stringify(mitParty));
        }
    } catch (e) {}

    if (currentUser) {
        try {
            await sb.auth.updateUser({
                data: { default_mit_party: mitParty }
            });
            await sb.from('profiles').update({
                default_mit_party: mitParty
            }).eq('id', currentUser.id);
        } catch (e) {
            console.warn('Failed to update default_mit_party in profile:', e);
        }
    }

    alert('✅ 已成功保存此隊伍組成為您的個人預設組成！');
}

async function resetUserDefaultParty() {
    const DEFAULT_PARTY = ['PLD', 'DRK', 'WHM', 'SGE', 'SAM', 'RPR', 'BRD', 'PCT'];
    if (!confirm('確定要將隊伍組成重置為預設職業（騎士、暗黑騎士、白魔導士、賢者、武士、釤鐮客、吟遊詩人、繪靈法師）嗎？')) {
        return;
    }

    mitParty = [...DEFAULT_PARTY];

    try {
        localStorage.setItem('sked_default_mit_party', JSON.stringify(mitParty));
        if (currentUser) {
            localStorage.setItem(`sked_default_mit_party_${currentUser.id}`, JSON.stringify(mitParty));
        }
    } catch (e) {}

    if (currentUser) {
        try {
            await sb.auth.updateUser({
                data: { default_mit_party: mitParty }
            });
            await sb.from('profiles').update({
                default_mit_party: mitParty
            }).eq('id', currentUser.id);
        } catch (e) {}
    }

    renderPartySelector();
    renderMitSkillsList();
    renderMitPlayerTracks();
    renderMitTimeline();
    
    alert('🔄 已重置隊伍組成！');
}

async function loadUserDefaultParty(user) {
    let savedParty = user?.user_metadata?.default_mit_party;
    
    if (!savedParty && user) {
        try {
            const { data } = await sb.from('profiles').select('default_mit_party').eq('id', user.id).maybeSingle();
            if (data && Array.isArray(data.default_mit_party) && data.default_mit_party.length === 8) {
                savedParty = data.default_mit_party;
            }
        } catch (e) {}
    }

    if (!savedParty && user) {
        try {
            const raw = localStorage.getItem(`sked_default_mit_party_${user.id}`);
            if (raw) savedParty = JSON.parse(raw);
        } catch (e) {}
    }

    if (!savedParty) {
        try {
            const raw = localStorage.getItem('sked_default_mit_party');
            if (raw) savedParty = JSON.parse(raw);
        } catch (e) {}
    }

    if (Array.isArray(savedParty) && savedParty.length === 8) {
        mitParty = [...savedParty];
        renderPartySelector();
        renderMitSkillsList();
        renderMitPlayerTracks();
        renderMitTimeline();
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
            <div style="display:flex; align-items:center; gap:8px; margin: 12px 0 6px 0; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;">
                <img src="${jobData.icon}" style="width:24px; height:24px; border-radius:4px;" />
                <span style="font-size:13px; font-weight:bold; color:#00f0ff;">${jobData.name}</span>
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
            item.addEventListener('mousemove', (e) => {
                const tooltip = document.getElementById('skill-tooltip');
                if (tooltip) {
                    tooltip.style.left = `${e.clientX + 15}px`;
                    tooltip.style.top = `${e.clientY + 15}px`;
                }
            });
            
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
    if (window.isDraggingInProgress) {
        hideMitTooltip();
        return;
    }
    
    tooltip.style.display = 'block';
    tooltip.style.left = `${e.clientX + 15}px`;
    tooltip.style.top = `${e.clientY + 15}px`;
    
    const rect = tooltip.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        tooltip.style.left = `${e.clientX - rect.width - 15}px`;
    }
    if (rect.bottom > window.innerHeight) {
        tooltip.style.top = `${e.clientY - rect.height - 15}px`;
    }
    
    tooltip.querySelector('.tooltip-icon').src = skill.icon || '';
    tooltip.querySelector('.tooltip-name').textContent = skill.name || '';
    
    const isGcd = skill.cooldown <= 2.5 && skill.cooldown > 0;
    const classification = isGcd ? '魔法' : '能力';
    tooltip.querySelector('.tooltip-badge').textContent = classification;
    
    tooltip.querySelector('.tooltip-lv').textContent = jobName || '防護職業';
    const mpLabel = tooltip.querySelector('#tooltip-mp-label');
    if (mpLabel) mpLabel.textContent = '持續時間:';
    tooltip.querySelector('.tooltip-mp').textContent = skill.duration ? `${skill.duration}秒` : '-';
    
    const castText = '即時';
    const cooldownText = skill.cooldown ? `${skill.cooldown}秒` : '-';
    tooltip.querySelector('.tooltip-times').textContent = `${castText} / ${cooldownText}`;
    
    const scopeText = skill.personal ? '自身/單體' : '小隊/範圍';
    tooltip.querySelector('.tooltip-range').textContent = scopeText;
    
    tooltip.querySelector('.tooltip-description').textContent = skill.title || '無詳細效果說明。';
    
    const badge = tooltip.querySelector('.tooltip-badge');
    badge.style.backgroundColor = classification === '能力' ? 'var(--color-ogcd)' : 'var(--color-gcd)';
}

function hideMitTooltip() {
    const tooltip = document.getElementById('skill-tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
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
    
    // Ensure grid container exists
    let gridContainer = document.getElementById('mit-grid-container');
    if (!gridContainer) {
        gridContainer = document.createElement('div');
        gridContainer.id = 'mit-grid-container';
        mitTimelineEditor.appendChild(gridContainer);
    }
    
    // Calculate total duration based on mechanics & casts
    let maxTime = 120; // Default minimum 120 seconds
    mitBossMechanics.forEach(m => {
        if (m.time > maxTime) maxTime = m.time;
    });
    mitTimelineSkills.forEach(c => {
        if (c.startTime + c.duration > maxTime) maxTime = c.startTime + c.duration;
    });
    
    const totalLength = (maxTime + 15) * pps;
    
    // Toggle layout views
    const ruler = document.getElementById('mit-timeline-ruler');
    const bossTrackWrapper = document.querySelector('.timeline-track-wrapper.boss-track-wrapper');
    const playerTracksContainer = document.getElementById('mit-player-tracks-container');
    const playhead = document.getElementById('mit-playhead');
    
    const bottomBar = document.getElementById('mit-timeline-bottom-bar');

    if (mitLayoutMode === 'vertical') {
        gridContainer.style.display = 'block';
        if (ruler) ruler.style.display = 'none';
        if (bossTrackWrapper) bossTrackWrapper.style.display = 'none';
        if (playerTracksContainer) playerTracksContainer.style.display = 'none';
        if (playhead) playhead.style.display = 'none';
        if (bottomBar) bottomBar.style.display = 'none';
        
        mitTimelineEditor.classList.add('vertical-grid-mode');
        mitTimelineEditor.classList.remove('vertical');
        mitTimelineEditor.style.width = '100%';
        mitTimelineEditor.style.height = '100%';
        
        renderMitVerticalGrid(gridContainer);
    } else {
        gridContainer.style.display = 'none';
        if (ruler) ruler.style.display = '';
        if (bossTrackWrapper) bossTrackWrapper.style.display = '';
        if (playerTracksContainer) playerTracksContainer.style.display = '';
        if (playhead) playhead.style.display = '';
        if (bottomBar) bottomBar.style.display = '';
        
        mitTimelineEditor.classList.remove('vertical-grid-mode');
        mitTimelineEditor.classList.remove('vertical');
        mitTimelineEditor.style.width = `${totalLength + 200}px`;
        mitTimelineEditor.style.height = '';
        
        // Render Ruler
        renderMitRuler(totalLength);
        
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
                pill.style.top = '';
                pill.style.height = '';
                
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
                
                // Tooltip handlers
                pill.addEventListener('mouseenter', (e) => showMitTooltip(e, skillData, mitSkillsDatabase[cast.jobKey]?.name));
                pill.addEventListener('mouseleave', hideMitTooltip);
                pill.addEventListener('mousemove', (e) => {
                    const tooltip = document.getElementById('skill-tooltip');
                    if (tooltip) {
                        tooltip.style.left = `${e.clientX + 15}px`;
                        tooltip.style.top = `${e.clientY + 15}px`;
                    }
                });
                
                // Double click to delete
                pill.addEventListener('dblclick', () => {
                    mitTimelineSkills = mitTimelineSkills.filter(c => c.id !== cast.id);
                    hideMitTooltip();
                    renderMitTimeline();
                });
                
                track.appendChild(pill);
            });
        });
    }
    
    mitLengthDisplay.innerHTML = `<i class="fa-regular fa-clock"></i> 軸總長: ${Math.ceil(maxTime)}s`;
}

function renderMitRuler(widthOrHeight) {
    mitTimelineRuler.innerHTML = '';
    const pps = getPixelsPerSecond();
    const totalSeconds = Math.ceil(widthOrHeight / pps);
    
    for (let sec = 0; sec <= totalSeconds; sec += 5) {
        const tick = document.createElement('div');
        tick.className = sec % 10 === 0 ? 'ruler-tick major' : 'ruler-tick minor';
        
        if (mitLayoutMode === 'vertical') {
            tick.style.top = `${sec * pps}px`;
            tick.style.left = '0';
        } else {
            tick.style.left = `${sec * pps}px`;
            tick.style.top = '';
        }
        
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
        
        if (mitLayoutMode === 'vertical') {
            pill.style.top = `${mech.time * pps}px`;
            pill.style.left = '';
        } else {
            pill.style.left = `${mech.time * pps}px`;
            pill.style.top = '';
        }
        
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
    // Sidebar Collapse Toggle
    const sidebarToggleBtn = document.getElementById('mit-sidebar-toggle');
    const sidebar = document.querySelector('#mit-planning-view .sidebar');
    if (sidebarToggleBtn && sidebar) {
        sidebarToggleBtn.addEventListener('click', () => {
            const isCollapsed = sidebar.classList.toggle('collapsed');
            sidebarToggleBtn.classList.toggle('collapsed', isCollapsed);
            const icon = sidebarToggleBtn.querySelector('i');
            if (icon) {
                icon.className = isCollapsed ? 'fa-solid fa-angle-right' : 'fa-solid fa-angle-left';
            }
            sidebarToggleBtn.title = isCollapsed ? '展開側邊欄' : '收合側邊欄';
        });
    }

    // Search skills filter
    document.getElementById('mit-skill-search').addEventListener('input', renderMitSkillsList);

    // Role filtering checkbox listener
    const filterRolesCheckbox = document.getElementById('mit-filter-roles-checkbox');
    if (filterRolesCheckbox) {
        filterRolesCheckbox.addEventListener('change', () => {
            renderPartySelector();
            renderMitSkillsList();
            renderMitPlayerTracks();
            renderMitTimeline();
        });
    }

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
    mitBtnLoad.addEventListener('click', () => { savesModalMode = 'load'; loadTeamPlansModal(); });
    mitBtnShare.addEventListener('click', openShareModal);
    mitBtnAddMechanic.addEventListener('click', addNewBossMechanic);
    
    const btnSaveParty = document.getElementById('mit-btn-save-party');
    const btnResetParty = document.getElementById('mit-btn-reset-party');
    if (btnSaveParty) btnSaveParty.addEventListener('click', saveUserDefaultParty);
    if (btnResetParty) btnResetParty.addEventListener('click', resetUserDefaultParty);
    
    if (mitBtnImport) {
        mitBtnImport.addEventListener('click', openMitImportOptionsModal);
    }
    if (mitFileImport) {
        mitFileImport.addEventListener('change', importTeamPlanJSON);
    }
    if (mitBtnExport) {
        mitBtnExport.addEventListener('click', exportTeamPlanJSON);
    }

    // Modal listeners for Team Timeline import
    const mitImportOptJson = document.getElementById('mit-import-opt-json');
    const mitImportOptFflogs = document.getElementById('mit-import-opt-fflogs');
    const mitImportOptionsClose = document.getElementById('mit-import-options-close');
    const mitImportOptionsModal = document.getElementById('mit-import-options-modal');

    if (mitImportOptJson && mitFileImport) {
        mitImportOptJson.addEventListener('click', () => {
            if (mitImportOptionsModal) mitImportOptionsModal.classList.remove('active');
            mitFileImport.click();
        });
    }
    if (mitImportOptFflogs) {
        mitImportOptFflogs.addEventListener('click', () => {
            if (mitImportOptionsModal) mitImportOptionsModal.classList.remove('active');
            openMitFFLogsModal();
        });
    }
    if (mitImportOptionsClose && mitImportOptionsModal) {
        mitImportOptionsClose.addEventListener('click', () => {
            mitImportOptionsModal.classList.remove('active');
        });
    }
    if (mitImportOptionsModal) {
        mitImportOptionsModal.addEventListener('click', e => {
            if (e.target === mitImportOptionsModal) mitImportOptionsModal.classList.remove('active');
        });
    }

    // FFLogs modal events for Team Timeline
    const mitFflogsModal = document.getElementById('mit-fflogs-api-modal');
    const mitFflogsCloseBtn = document.getElementById('mit-fflogs-api-modal-close');
    const mitFflogsCancelBtn = document.getElementById('mit-fflogs-api-cancel');
    const mitFflogsFetchBtn = document.getElementById('mit-fflogs-api-fetch-report');
    const mitFflogsImportBtn = document.getElementById('mit-fflogs-api-import');
    const mitFflogsUrlInput = document.getElementById('mit-fflogs-api-url');

    if (mitFflogsCloseBtn && mitFflogsModal) mitFflogsCloseBtn.addEventListener('click', () => mitFflogsModal.classList.remove('active'));
    if (mitFflogsCancelBtn && mitFflogsModal) mitFflogsCancelBtn.addEventListener('click', () => mitFflogsModal.classList.remove('active'));
    if (mitFflogsFetchBtn) mitFflogsFetchBtn.addEventListener('click', mitFflogsFetchReport);
    if (mitFflogsImportBtn) mitFflogsImportBtn.addEventListener('click', mitFflogsImport);
    if (mitFflogsUrlInput) mitFflogsUrlInput.addEventListener('keydown', e => { if (e.key === 'Enter') mitFflogsFetchReport(); });
    if (mitFflogsModal) mitFflogsModal.addEventListener('click', e => { if (e.target === mitFflogsModal) mitFflogsModal.classList.remove('active'); });

    // Job Skill Panel modal listeners
    const btnSelectPanel = document.getElementById('mit-btn-select-panel');
    const panelModalClose = document.getElementById('mit-panel-skills-close');
    const btnSaveCustomPanel = document.getElementById('mit-btn-save-custom-panel');
    const panelSkillsModal = document.getElementById('mit-panel-skills-modal');

    if (btnSelectPanel) btnSelectPanel.addEventListener('click', openMitPanelSkillsModal);
    if (panelModalClose) panelModalClose.addEventListener('click', closeMitPanelSkillsModal);
    if (btnSaveCustomPanel) btnSaveCustomPanel.addEventListener('click', handleSaveCustomPanels);
    if (panelSkillsModal) {
        panelSkillsModal.addEventListener('click', (e) => {
            if (e.target === panelSkillsModal) closeMitPanelSkillsModal();
        });
    }

    // Category Tabs switching
    const panelTabsContainer = document.getElementById('mit-panel-tabs');
    if (panelTabsContainer) {
        panelTabsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.panel-tab-btn');
            if (btn && btn.dataset.cat) {
                panelSelectedCategory = btn.dataset.cat;
                renderPanelTabs();
                renderPanelSkillsGrid();
            }
        });
    }

    // Context Menu items
    const ctxAdd = document.getElementById('mit-ctx-add');
    const ctxRemove = document.getElementById('mit-ctx-remove');
    if (ctxAdd) {
        ctxAdd.addEventListener('click', () => {
            if (contextMenuTargetSkillId) {
                toggleSkillInPanel(panelSelectedJob, contextMenuTargetSkillId);
            }
            hideSkillContextMenu();
        });
    }
    if (ctxRemove) {
        ctxRemove.addEventListener('click', () => {
            if (contextMenuTargetSkillId) {
                toggleSkillInPanel(panelSelectedJob, contextMenuTargetSkillId);
            }
            hideSkillContextMenu();
        });
    }

    // Hide context menu on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#mit-skill-context-menu')) {
            hideSkillContextMenu();
        }
    });

    const btnAddCustomTime = document.getElementById('mit-btn-add-custom-time');
    if (btnAddCustomTime) btnAddCustomTime.addEventListener('click', addNewCustomTimePoint);

    const mitBtnClear = document.getElementById('mit-btn-clear');
    if (mitBtnClear) {
        mitBtnClear.addEventListener('click', async () => {
            const ok = await window.showCustomConfirm('清空團隊技能排軸', '確定要清空團隊技能排軸的所有技能安排嗎？');
            if (ok) {
                mitTimelineSkills = [];
                window.mitTimelineSkills = [];
                renderMitTimeline();
            }
        });
    }

    // Layout select change event
    if (mitLayoutSelect) {
        mitLayoutSelect.addEventListener('change', (e) => {
            mitLayoutMode = e.target.value;
            renderMitTimeline();
        });
    }

    // Duty dropdown load events
    mitDutySelect.addEventListener('change', async (e) => {
        const dutyFile = e.target.value;
        populateMitDutyDropdown(mitDutiesDatabase, dutyFile);
        if (!dutyFile) {
            mitBossMechanics = [];
            renderMitTimeline();
            return;
        }
        
        try {
            const resp = await fetch(`./data/duties/${dutyFile}`);
            const data = await resp.json();
            mitBossMechanics = parseTimelineData(data.timeline);
            
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

    const tabBtnCompare = document.getElementById('tab-btn-compare');
    if (tabBtnCompare) {
        tabBtnCompare.addEventListener('click', () => {
            if (window.bossMechanics) {
                window.bossMechanics = JSON.parse(JSON.stringify(mitBossMechanics));
                if (typeof window.renderCompareTimeline === 'function') window.renderCompareTimeline();
            }
        });
    }
}

function handleMitDrop(e, trackContent) {
    try {
        const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
        const rect = trackContent.getBoundingClientRect();
        
        let dropTime;
        if (mitLayoutMode === 'vertical') {
            const dropY = e.clientY - rect.top;
            dropTime = Math.max(0, dropY / getPixelsPerSecond());
        } else {
            const dropX = e.clientX - rect.left;
            dropTime = Math.max(0, dropX / getPixelsPerSecond());
        }

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
        dmgType: ''
    });
    
    mitBossMechanics.sort((a, b) => a.time - b.time);
    renderMitTimeline();
}

// ── 9. Supabase Operations (Cloud Save/Load/Share) ──

let savesModalMode = 'load'; // 'load' or 'save'

async function saveTeamPlanToSupabase() {
    if (!currentUser) {
        alert('請先登入帳號後，才能保存計畫紀錄！');
        return;
    }

    try {
        const choice = await window.showCustomSaveChoices();
        if (choice === null) return;

        if (choice === 'existing') {
            savesModalMode = 'save';
            await loadTeamPlansModal();
        } else if (choice === 'new') {
            let defaultName = currentTeamPlanName;
            if (currentTeamPlanName === '未命名團隊排軸') {
                let dutyName = '無副本';
                if (mitDutySelect.value && mitDutySelect.value !== 'custom') {
                    const selectedOption = mitDutySelect.options[mitDutySelect.selectedIndex];
                    if (selectedOption) {
                        dutyName = selectedOption.text.trim();
                    }
                }
                
                let baseName = dutyName.replace(/\s*\(([^)]+)\)/, '-$1').replace(/\s+/g, '-');
                if (baseName === '無副本-(自訂時間軸)') {
                    baseName = '無副本';
                }
                
                const { data: existingPlans, error: fetchErr } = await sb.from('team_plans')
                    .select('name')
                    .eq('owner_id', currentUser.id)
                    .eq('duty_key', mitDutySelect.value || 'custom');
                
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
            currentTeamPlanName = name.trim();

            const { data, error } = await sb.from('team_plans')
                .insert({
                    owner_id: currentUser.id,
                    duty_key: mitDutySelect.value || 'custom',
                    name: currentTeamPlanName,
                    party: mitParty,
                    mits: mitTimelineSkills,
                    custom_mechanics: mitBossMechanics,
                    custom_panels: customJobPanels
                })
                .select()
                .single();

            if (error) throw error;
            
            currentTeamPlanId = data.id;
            currentTeamEditToken = data.edit_token;
            currentTeamReadToken = data.read_token;
            currentTeamPlanOwnerId = data.owner_id;
            window.trackEvent('team_planner', 'save_cloud', { type: 'new', name: currentTeamPlanName, duty: mitDutySelect.value || 'custom' });
            alert('新雲端排軸計畫儲存成功！');
        }
    } catch (err) {
        alert(`保存失敗: ${err.message}`);
    }
}

function getMitDutyName(dutyFile) {
    if (!dutyFile || dutyFile === 'custom') return '自訂時間軸';
    if (mitDutiesDatabase && mitDutiesDatabase.duties) {
        const duty = mitDutiesDatabase.duties.find(d => d.file === dutyFile);
        if (duty) return duty.name;
    }
    if (window.dutiesDatabase && window.dutiesDatabase.duties) {
        const duty = window.dutiesDatabase.duties.find(d => d.file === dutyFile);
        if (duty) return duty.name;
    }
    return dutyFile;
}

async function loadTeamPlansModal() {
    if (!currentUser) {
        alert('請先登入以讀取您的雲端計畫！');
        return;
    }

    try {
        const { data: plans, error } = await sb.from('team_plans')
            .select('id, name, duty_key, updated_at')
            .eq('owner_id', currentUser.id)
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
                
                li.innerHTML = `
                    <div style="cursor:pointer; flex:1;">
                        <strong>${plan.name}</strong><br/>
                        <span style="font-size:10px; color:var(--color-text-muted);">副本: ${getMitDutyName(plan.duty_key)} | 更新於 ${new Date(plan.updated_at).toLocaleString()}</span>
                    </div>
                    <div class="save-actions" style="display:flex; align-items:center;">
                        <button class="btn btn-secondary btn-mini btn-mini-rename" style="padding: 2px 6px; margin-right: 5px;" title="重新命名"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-danger btn-mini btn-mini-del" style="padding: 2px 6px;" title="刪除"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;
                
                // Click to load or overwrite
                li.querySelector('div').addEventListener('click', async () => {
                    if (savesModalMode === 'save') {
                        const ok = await window.showCustomConfirm('覆蓋存檔', `確定要覆蓋「${plan.name}」嗎？`);
                        if (ok) {
                            try {
                                const { error: updErr } = await sb.from('team_plans')
                                    .update({
                                        party: mitParty,
                                        mits: mitTimelineSkills,
                                        custom_mechanics: mitBossMechanics,
                                        custom_panels: customJobPanels,
                                        updated_at: new Date()
                                    })
                                    .eq('id', plan.id);
                                if (updErr) throw updErr;
                                window.trackEvent('team_planner', 'save_cloud', { type: 'existing', name: plan.name, duty: mitDutySelect.value || 'custom' });
                                alert(`「${plan.name}」覆蓋保存成功！`);
                                currentTeamPlanId = plan.id;
                                currentTeamPlanName = plan.name;
                                savesModal.classList.remove('active');
                            } catch (updErr) {
                                alert(`覆蓋儲存失敗: ${updErr.message}`);
                            }
                        }
                    } else {
                        await loadTeamPlanById(plan.id);
                        savesModal.classList.remove('active');
                    }
                });
                
                // Click to rename
                li.querySelector('.btn-mini-rename').addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const newName = await window.showCustomPrompt('重新命名雲端存檔', '請輸入新的存檔名稱：', plan.name);
                    if (newName === null) return;
                    if (newName.trim() === '') {
                        alert('名稱不能為空！');
                        return;
                    }
                    
                    try {
                        const { error: renameErr } = await sb.from('team_plans')
                            .update({ name: newName.trim(), updated_at: new Date() })
                            .eq('id', plan.id);
                        if (renameErr) throw renameErr;
                        alert('重命名成功！');
                        await loadTeamPlansModal(); // Refresh modal list
                    } catch (err) {
                        alert(`重命名失敗: ${err.message}`);
                    }
                });

                // Click to delete
                li.querySelector('.btn-mini-del').addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const ok = await window.showCustomConfirm('刪除存檔', `確定要刪除「${plan.name}」嗎？此動作無法復原。`);
                    if (ok) {
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
        currentTeamPlanOwnerId = plan.owner_id;

        // Apply state
        mitDutySelect.value = plan.duty_key || '';
        populateMitDutyDropdown(mitDutiesDatabase, plan.duty_key || '');
        mitParty = plan.party || [];
        mitTimelineSkills = plan.mits || [];
        if (plan.custom_panels && typeof plan.custom_panels === 'object') {
            customJobPanels = plan.custom_panels;
        }
        
        if (plan.duty_key && plan.duty_key !== 'custom') {
            await loadDutyMechanicsForPlan(plan.duty_key, plan.custom_mechanics || []);
        } else {
            mitBossMechanics = plan.custom_mechanics || [];
        }

        renderPartySelector();
        renderMitSkillsList();
        renderMitPlayerTracks();
        renderMitTimeline();
        
        // Save to window globally for quick sync
        window.mitTimelineSkills = mitTimelineSkills;
        window.mitParty = mitParty;
        
        window.trackEvent('team_planner', 'load_cloud', { name: plan.name, duty: plan.duty_key });
        alert(`已載入「${plan.name}」！`);
    } catch (err) {
        alert(`載入計畫失敗: ${err.message}`);
    }
}

function createShareModal() {
    if (document.getElementById('share-modal-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'share-modal-overlay';
    overlay.innerHTML = `
        <div id="share-modal">
            <button id="share-modal-close" style="position:absolute; top:14px; right:18px; background:none; border:none; color:#555; font-size:20px; cursor:pointer; line-height:1;">✕</button>
            <h3>分享減排計畫</h3>
            <div class="share-form-group">
                <label for="share-permission">權限設定</label>
                <select id="share-permission" class="share-select" disabled style="opacity: 0.8; background: rgba(0,0,0,0.2);">
                    <option value="view" selected>僅查看 (唯讀模式)</option>
                </select>
            </div>
            <div class="share-form-group">
                <label for="share-password">分享密碼 (必須為 8 碼)</label>
                <div class="share-password-wrapper">
                    <input type="text" id="share-password" class="share-password-input" placeholder="輸入或生成 8 碼英數字" maxlength="8" style="text-transform:uppercase;">
                    <button id="share-btn-password-action" class="share-btn-secondary" style="white-space:nowrap; min-width:100px;">生成密碼</button>
                </div>
            </div>
            <div class="share-form-group" style="margin-bottom:10px;">
                <label for="share-url">分享網址</label>
                <div class="share-password-wrapper">
                    <input type="text" id="share-url" class="share-password-input" placeholder="請先完成密碼設定" readonly style="background:rgba(0,0,0,0.2); font-size:12px;">
                    <button id="share-btn-url-action" class="share-btn-primary" style="width: auto; white-space: nowrap; min-width: 100px;" disabled>生成網址</button>
                </div>
            </div>

            <!-- Delete Share Record Button -->
            <div id="share-delete-section" class="share-form-group" style="margin-bottom:0; display:none;">
                <button id="share-btn-delete-record" class="btn btn-secondary" style="width:100%; color:var(--color-danger); border-color:rgba(239,68,68,0.4); background:rgba(239,68,68,0.1); padding:8px 0; font-size:13px; font-weight:600;">
                    <i class="fa-solid fa-trash-can"></i> 刪除分享紀錄
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    
    // Close events
    const overlayClose = () => closeShareModal();
    overlay.addEventListener('click', e => { if (e.target === overlay) overlayClose(); });
    document.getElementById('share-modal-close').addEventListener('click', overlayClose);
    document.getElementById('share-btn-delete-record').addEventListener('click', handleShareDelete);
    
    const pwdInput = document.getElementById('share-password');
    const pwdBtn = document.getElementById('share-btn-password-action');
    const urlInput = document.getElementById('share-url');
    const urlBtn = document.getElementById('share-btn-url-action');
    
    // Function to check password and update UI states
    const updateUIState = () => {
        const val = pwdInput.value.trim().toUpperCase();
        pwdInput.value = val;
        
        // If URL has already been generated, don't allow modifying states
        if (urlInput.value) return;
        
        if (val.length === 0) {
            pwdBtn.innerText = '生成密碼';
            urlBtn.disabled = true;
            urlInput.placeholder = '請先完成密碼設定';
        } else {
            pwdBtn.innerText = '複製密碼';
            if (val.length === 8) {
                urlBtn.disabled = false;
                urlInput.placeholder = '點擊右側生成網址';
            } else {
                urlBtn.disabled = true;
                urlInput.placeholder = '密碼長度必須為 8 碼';
            }
        }
    };
    
    pwdInput.addEventListener('input', updateUIState);
    
    // Password button click action
    pwdBtn.addEventListener('click', async () => {
        const val = pwdInput.value.trim().toUpperCase();
        if (pwdBtn.innerText.startsWith('生成密碼') || val.length === 0) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let pass = '';
            for (let i = 0; i < 8; i++) {
                pass += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            pwdInput.value = pass;
            updateUIState();
        } else {
            // Copy mode
            await navigator.clipboard.writeText(pwdInput.value);
            const origText = pwdBtn.innerText;
            pwdBtn.innerText = '已複製！';
            pwdBtn.style.borderColor = '#4ade80';
            pwdBtn.style.color = '#4ade80';
            setTimeout(() => {
                pwdBtn.innerText = origText;
                pwdBtn.style.borderColor = '';
                pwdBtn.style.color = '';
            }, 1500);
        }
    });
    
    // URL button click action
    urlBtn.addEventListener('click', async () => {
        if (urlBtn.innerText.startsWith('生成網址')) {
            await handleShareApply();
        } else {
            // Copy mode
            await navigator.clipboard.writeText(urlInput.value);
            const origText = urlBtn.innerText;
            urlBtn.innerText = '已複製！';
            urlBtn.style.borderColor = '#4ade80';
            urlBtn.style.color = '#4ade80';
            setTimeout(() => {
                urlBtn.innerText = origText;
                urlBtn.style.borderColor = '';
                urlBtn.style.color = '';
            }, 1500);
        }
    });
}

async function openShareModal() {
    if (!currentTeamPlanId) {
        alert('請先「保存紀錄」之後，再分享連結！');
        return;
    }
    
    // Check ownership
    if (!currentUser || currentUser.id !== currentTeamPlanOwnerId) {
        alert('只有計畫的擁有者才能修改分享與密碼設定！\n（若您是擁有者，請確認您已登入）');
        return;
    }
    createShareModal();
    
    // Fetch latest share status from DB
    try {
        const { data } = await sb.from('team_plans')
            .select('share_password, read_token, edit_token')
            .eq('id', currentTeamPlanId)
            .maybeSingle();
            
        if (data) {
            currentTeamSharePassword = data.share_password || null;
            if (data.read_token) currentTeamReadToken = data.read_token;
            if (data.edit_token) currentTeamEditToken = data.edit_token;
        }
    } catch (e) {
        console.warn('Error fetching plan share status:', e);
    }

    const permissionSelect = document.getElementById('share-permission');
    const pwdInput = document.getElementById('share-password');
    const pwdBtn = document.getElementById('share-btn-password-action');
    const urlInput = document.getElementById('share-url');
    const urlBtn = document.getElementById('share-btn-url-action');
    const deleteSection = document.getElementById('share-delete-section');
    
    permissionSelect.value = 'view';
    permissionSelect.disabled = true;
    
    if (currentTeamSharePassword) {
        // Already shared
        pwdInput.value = currentTeamSharePassword;
        pwdInput.disabled = true;
        pwdBtn.innerText = '複製密碼';
        pwdBtn.disabled = false;
        pwdBtn.style.borderColor = '';
        pwdBtn.style.color = '';
        
        const shareUrl = `${window.location.origin}${window.location.pathname}?mit_view=${currentTeamReadToken}`;
        urlInput.value = shareUrl;
        urlBtn.innerText = '複製網址';
        urlBtn.disabled = false;
        urlBtn.style.backgroundColor = '';
        urlBtn.style.borderColor = '';
        urlBtn.style.color = '';
        
        deleteSection.style.display = 'block';
    } else {
        // Not shared yet
        pwdInput.value = '';
        pwdInput.disabled = false;
        pwdInput.placeholder = '輸入或生成 8 碼英數字';
        
        pwdBtn.innerText = '生成密碼';
        pwdBtn.disabled = false;
        pwdBtn.style.borderColor = '';
        pwdBtn.style.color = '';
        
        urlInput.value = '';
        urlInput.placeholder = '請先完成密碼設定';
        
        urlBtn.innerText = '生成網址';
        urlBtn.disabled = true;
        urlBtn.style.backgroundColor = '';
        urlBtn.style.borderColor = '';
        urlBtn.style.color = '';
        
        deleteSection.style.display = 'none';
    }
    
    document.getElementById('share-modal-overlay').style.display = 'flex';
}

function closeShareModal() {
    const overlay = document.getElementById('share-modal-overlay');
    if (overlay) overlay.style.display = 'none';
}

async function handleShareApply() {
    const permission = document.getElementById('share-permission').value;
    const password = document.getElementById('share-password').value.trim().toUpperCase();
    
    if (password.length !== 8) {
        alert('分享密碼必須為 8 碼英數字！');
        return;
    }
    
    try {
        const { data, error } = await sb.from('team_plans')
            .update({ share_password: password })
            .eq('id', currentTeamPlanId)
            .select();
            
        if (error) throw error;
        if (!data || data.length === 0) {
            throw new Error('設定失敗！您沒有修改此計畫分享設定的權限（必須是計畫擁有者）。');
        }
        
        currentTeamSharePassword = password;
        
        const token = (permission === 'edit') ? currentTeamEditToken : currentTeamReadToken;
        const paramName = (permission === 'edit') ? 'mit_edit' : 'mit_view';
        
        if (!token) {
            alert('無法獲取分享憑證！請重新儲存本計畫後再試。');
            return;
        }

        try {
            localStorage.setItem(`sked_mit_pwd_${token}`, password);
        } catch (e) {}
        
        const shareUrl = `${window.location.origin}${window.location.pathname}?${paramName}=${token}`;
        window.trackEvent('team_planner', 'share_link', { type: permission });
        
        // Auto-copy the share URL
        await navigator.clipboard.writeText(shareUrl);
        
        // Display share URL in input
        const urlInput = document.getElementById('share-url');
        urlInput.value = shareUrl;
        
        // Change URL button to Copy button
        const urlBtn = document.getElementById('share-btn-url-action');
        urlBtn.innerText = '複製網址';
        
        // Change Password button to Copy button
        const pwdBtn = document.getElementById('share-btn-password-action');
        pwdBtn.innerText = '複製密碼';
        
        // Disable password input & permission select to prevent edits
        document.getElementById('share-password').disabled = true;
        document.getElementById('share-permission').disabled = true;
        
        // Show delete section
        const deleteSection = document.getElementById('share-delete-section');
        if (deleteSection) deleteSection.style.display = 'block';
        
        // Temporarily highlight the URL button green to show success
        const origBg = urlBtn.style.backgroundColor;
        urlBtn.style.backgroundColor = '#16a34a'; // Green bg
        urlBtn.style.color = '#fff';
        setTimeout(() => {
            urlBtn.style.backgroundColor = origBg;
        }, 1500);
        
    } catch (err) {
        alert(`設定分享密碼失敗: ${err.message}`);
    }
}

async function handleShareDelete() {
    if (!currentTeamPlanId) return;
    
    if (!confirm('確定要刪除現有的分享紀錄與密碼嗎？\n刪除後原本的分享連結與密碼將會失效，您可以重新生成新的分享連結與密碼。')) {
        return;
    }
    
    try {
        const { error } = await sb.from('team_plans')
            .update({ share_password: null })
            .eq('id', currentTeamPlanId);
            
        if (error) throw error;
        
        try {
            if (currentTeamReadToken) localStorage.removeItem(`sked_mit_pwd_${currentTeamReadToken}`);
            if (currentTeamEditToken) localStorage.removeItem(`sked_mit_pwd_${currentTeamEditToken}`);
        } catch (e) {}

        currentTeamSharePassword = null;
        alert('已成功刪除分享紀錄！您可以重新設定密碼並生成新的分享網址。');
        
        openShareModal();
    } catch (err) {
        alert(`刪除分享紀錄失敗: ${err.message}`);
    }
}

async function handleUrlSharingTokens() {
    const params = new URLSearchParams(window.location.search);
    const mitViewToken = params.get('mit_view');
    const mitEditToken = params.get('mit_edit');
    const token = mitViewToken || mitEditToken;
    
    if (token) {
        // Show only the Team Planner page, hide header tabs
        const tabBtnTimeline = document.getElementById('tab-btn-timeline');
        const tabBtnCompare = document.getElementById('tab-btn-compare');
        if (tabBtnTimeline) tabBtnTimeline.style.display = 'none';
        if (tabBtnCompare) tabBtnCompare.style.display = 'none';

        const mitPlanningView = document.getElementById('mit-planning-view');
        const timelineWorkspaceView = document.getElementById('timeline-workspace-view');
        const compareWorkspaceView = document.getElementById('compare-workspace-view');
        const timelineToolbar = document.getElementById('timeline-toolbar');
        
        if (mitPlanningView) mitPlanningView.classList.remove('hidden');
        if (timelineWorkspaceView) timelineWorkspaceView.classList.add('hidden');
        if (compareWorkspaceView) compareWorkspaceView.classList.add('hidden');
        if (timelineToolbar) timelineToolbar.classList.add('hidden');

        // Disable selectors
        const dutySelect = document.getElementById('mit-duty-select');
        const layoutSelect = document.getElementById('mit-layout-select');
        if (dutySelect) {
            dutySelect.disabled = true;
            dutySelect.style.pointerEvents = 'none';
            dutySelect.style.opacity = '0.7';
        }
        if (layoutSelect) {
            layoutSelect.disabled = true;
            layoutSelect.style.pointerEvents = 'none';
            layoutSelect.style.opacity = '0.7';
        }

        // Hide top right buttons
        const btnSave = document.getElementById('mit-btn-save');
        const btnLoad = document.getElementById('mit-btn-load');
        const btnShare = document.getElementById('mit-btn-share');
        const btnImport = document.getElementById('mit-btn-import');
        const btnExport = document.getElementById('mit-btn-export');
        if (btnSave) btnSave.style.display = 'none';
        if (btnLoad) btnLoad.style.display = 'none';
        if (btnShare) btnShare.style.display = 'none';
        if (btnImport) btnImport.style.display = 'none';
        if (btnExport) btnExport.style.display = 'none';

        try {
            // Check local browser cache for previously verified password
            const storageKey = `sked_mit_pwd_${token}`;
            let cachedPwd = localStorage.getItem(storageKey);

            // 1. Initial trial call (using cached password if available)
            let { data, error } = await sb.rpc('get_team_plan_by_token', {
                p_token: token,
                p_password: cachedPwd ? cachedPwd.trim().toUpperCase() : null
            }).maybeSingle();

            if (error) throw error;
            if (!data) {
                alert('分享連結無效或該減排計畫已遭刪除！');
                return;
            }

            // Fallback check by plan ID if token key missed
            if (data.password_required && !data.password_correct && data.id) {
                const planStorageKey = `sked_mit_pwd_${data.id}`;
                const cachedPlanPwd = localStorage.getItem(planStorageKey);
                if (cachedPlanPwd) {
                    const ret = await sb.rpc('get_team_plan_by_token', {
                        p_token: token,
                        p_password: cachedPlanPwd.trim().toUpperCase()
                    }).maybeSingle();
                    if (ret.data && ret.data.password_correct) {
                        data = ret.data;
                        cachedPwd = cachedPlanPwd.trim().toUpperCase();
                        try {
                            localStorage.setItem(storageKey, cachedPwd);
                        } catch (e) {}
                    }
                }
            }

            // If cached password failed verification, clear cached entry
            if (cachedPwd && data.password_required && !data.password_correct) {
                localStorage.removeItem(storageKey);
                if (data.id) localStorage.removeItem(`sked_mit_pwd_${data.id}`);
                cachedPwd = null;
            }
            
            // 2. Loop password prompt if required and incorrect
            let pwd = null;
            while (data.password_required && !data.password_correct) {
                pwd = prompt('請輸入 8 碼分享密碼：');
                if (pwd === null) {
                    alert('拒絕存取：您必須輸入正確密碼才能查看本計畫。');
                    openAuthModal('login', true); // Force persistent auth overlay
                    return;
                }
                
                const formattedPwd = pwd.trim().toUpperCase();
                const ret = await sb.rpc('get_team_plan_by_token', { p_token: token, p_password: formattedPwd }).maybeSingle();
                if (ret.error) {
                    alert(`驗證密碼失敗: ${ret.error.message}`);
                    continue;
                }
                
                if (ret.data && ret.data.password_correct) {
                    data = ret.data;
                    try {
                        localStorage.setItem(storageKey, formattedPwd);
                        if (data.id) localStorage.setItem(`sked_mit_pwd_${data.id}`, formattedPwd);
                    } catch (e) {}
                } else {
                    alert('密碼錯誤！請重新輸入。');
                }
            }

            currentTeamPlanId = data.id;
            currentTeamEditToken = data.edit_token;
            currentTeamReadToken = data.read_token;
            currentTeamPlanName = data.name;
            currentTeamPlanOwnerId = data.owner_id;

            // Apply state
            mitDutySelect.value = data.duty_key || '';
            populateMitDutyDropdown(mitDutiesDatabase, data.duty_key || '');
            mitParty = data.party || [];
            mitTimelineSkills = data.mits || [];
            if (data.custom_panels && typeof data.custom_panels === 'object') {
                customJobPanels = data.custom_panels;
            }
            
            if (data.duty_key && data.duty_key !== 'custom') {
                await loadDutyMechanicsForPlan(data.duty_key, data.custom_mechanics || []);
            } else {
                mitBossMechanics = data.custom_mechanics || [];
            }

            // If we only have view access, hide the edit buttons
            const isReadMode = (token === data.read_token);
            if (isReadMode) {
                mitBtnSave.style.display = 'none';
                mitBtnAddMechanic.style.display = 'none';
                mitDragTrash.style.display = 'none';
                document.getElementById('party-select-grid').style.pointerEvents = 'none';
                document.getElementById('mit-skills-list').style.pointerEvents = 'none';
                alert(`以「唯讀模式」載入團隊排軸計畫：「${data.name}」`);
            } else {
                alert(`以「編輯模式」載入團隊排軸計畫：「${data.name}」`);
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
            alert(`載入分享計畫失敗: ${err.message || err}`);
        }
    }
}

function exportTeamPlanJSON() {
    window.trackEvent('team_planner', 'export_json', { duty: mitDutySelect.value || 'custom' });
    const data = {
        duty: mitDutySelect.value || 'custom',
        party: mitParty,
        mits: mitTimelineSkills,
        customMechanics: mitBossMechanics
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTeamPlanName || 'team_plan'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importTeamPlanJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const data = JSON.parse(event.target.result);
            if (!data.duty || !data.party || !data.mits) {
                throw new Error('JSON 檔案格式不符合團隊排軸計畫（必須包含 duty, party, mits）！');
            }
            
            if (mitTimelineSkills.length > 0 || mitBossMechanics.length > 0) {
                const ok = await window.showCustomConfirm('覆蓋編輯內容', '匯入此計畫將覆蓋目前的編輯內容，確定要繼續嗎？');
                if (!ok) {
                    return;
                }
            }
            
            // 1. Set party
            mitParty = data.party || [];
            
            // 2. Load the official duty mechanics first if a duty key is specified
            let dutyMechs = [];
            let dutyFile = data.duty;
            const dutyObj = mitDutiesDatabase.duties ? mitDutiesDatabase.duties.find(d => d.key === dutyFile || d.file === dutyFile) : null;
            if (dutyObj) {
                dutyFile = dutyObj.file;
            }
            
            if (dutyFile && dutyFile !== 'custom') {
                mitDutySelect.value = dutyFile;
                populateMitDutyDropdown(mitDutiesDatabase, dutyFile);
                // Fetch official duty mechanics
                try {
                    const resp = await fetch(`./data/duties/${dutyFile}`);
                    if (resp.ok) {
                        const dutyData = await resp.json();
                        dutyMechs = parseTimelineData(dutyData.timeline);
                    }
                } catch (err) {
                    console.error('Failed to pre-load duty mechanics on import:', err);
                }
            } else {
                mitDutySelect.value = '';
                populateMitDutyDropdown(mitDutiesDatabase, '');
            }
            
            // 3. Parse custom mechanics / imported mechanics
            let parsedCustom = [];
            if (data.customMechanics && Array.isArray(data.customMechanics)) {
                parsedCustom = data.customMechanics;
            } else if (data.customRowsByDuty && data.customRowsByDuty[data.duty]) {
                data.customRowsByDuty[data.duty].forEach((cr, idx) => {
                    const time = parseDutyTime(cr.hitTime || cr.castingTime || cr.hitTime);
                    parsedCustom.push({
                        id: cr.id || `custom-imported-${idx}-${Date.now()}`,
                        time: time,
                        name: cr.skill || '未命名自訂機制',
                        dmgType: cr.dmgType || '',
                        rawDamage: cr.rawDamage || 0
                    });
                });
            }
            
            // Merge custom mechanics with official duty mechanics
            const dutyIds = new Set(dutyMechs.map(dm => dm.id));
            const uniqueCustom = parsedCustom.filter(pc => !dutyIds.has(pc.id));
            
            // Re-match rawDamage for any custom ones that match duty mechanics by time & name
            parsedCustom.forEach(pc => {
                const match = dutyMechs.find(dm => dm.id === pc.id || (dm.name === pc.name && Math.abs(dm.time - pc.time) < 0.1));
                if (match) {
                    pc.rawDamage = match.rawDamage;
                    pc.dmgType = match.dmgType;
                }
            });
            
            mitBossMechanics = [...dutyMechs, ...uniqueCustom];
            
            // 4. Parse mits
            let parsedMits = [];
            if (Array.isArray(data.mits)) {
                // If it is already Format A (array of casts), use it directly but regenerate IDs to avoid duplicates
                parsedMits = data.mits.map(c => ({
                    ...c,
                    id: c.id || `cast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                }));
            } else if (typeof data.mits === 'object' && data.mits !== null) {
                // Format B (dictionary of casts where values are indices of the timeline array)
                for (const [key, times] of Object.entries(data.mits)) {
                    const parts = key.split('-');
                    if (parts.length >= 3) {
                        const dutyKey = parts[0];
                        if (dutyKey !== data.duty) continue;
                        
                        const slotStr = parts[1];
                        const slotIndex = parseInt(slotStr.replace('p', ''), 10);
                        const skillKey = parts.slice(2).join('-');
                        const jobKey = mitParty[slotIndex];
                        
                        if (Array.isArray(times) && jobKey) {
                            times.forEach(time => {
                                const jobData = mitSkillsDatabase[jobKey];
                                const skill = jobData?.skills.find(s => s.id === skillKey);
                                const duration = skill ? skill.duration : 15;
                                
                                // Resolve mechanic index to actual seconds
                                const mech = mitBossMechanics[time];
                                const startTime = mech ? mech.time : time;
                                
                                parsedMits.push({
                                    id: `cast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                    slotIndex: slotIndex,
                                    jobKey: jobKey,
                                    jobAbbrev: jobKey,
                                    skillKey: skillKey,
                                    startTime: startTime,
                                    duration: duration
                                });
                            });
                        }
                    }
                }
            }
            mitTimelineSkills = parsedMits;
            
            // 5. Update global window references for quick sync
            window.mitTimelineSkills = mitTimelineSkills;
            window.mitParty = mitParty;
            
            // 6. Refresh UI
            renderPartySelector();
            renderMitSkillsList();
            renderMitPlayerTracks();
            renderMitTimeline();
            
            window.trackEvent('team_planner', 'import_json', { duty: data.duty });
            alert('成功匯入團隊排軸計畫！');
        } catch (err) {
            alert(`匯入失敗: ${err.message}`);
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

// ============================================================
// FFLogs Import Module for Team Timeline (團隊技能排軸)
// ============================================================
let mitFflogsReportCode = null;
let mitFflogsFights = [];

function normalizeJobToAbbrev(jobStr) {
    if (!jobStr) return null;
    const s = jobStr.toLowerCase().replace(/[\s_]/g, '');
    const map = {
        'paladin': 'PLD', 'pld': 'PLD',
        'warrior': 'WAR', 'war': 'WAR',
        'darkknight': 'DRK', 'drk': 'DRK',
        'gunbreaker': 'GNB', 'gnb': 'GNB',
        'whitemage': 'WHM', 'whm': 'WHM',
        'scholar': 'SCH', 'sch': 'SCH',
        'astrologian': 'AST', 'ast': 'AST',
        'sage': 'SGE', 'sge': 'SGE',
        'monk': 'MNK', 'mnk': 'MNK',
        'dragoon': 'DRG', 'drg': 'DRG',
        'ninja': 'NIN', 'nin': 'NIN',
        'samurai': 'SAM', 'sam': 'SAM',
        'reaper': 'RPR', 'rpr': 'RPR',
        'viper': 'VPR', 'vpr': 'VPR',
        'bard': 'BRD', 'brd': 'BRD',
        'machinist': 'MCH', 'mch': 'MCH',
        'dancer': 'DNC', 'dnc': 'DNC',
        'blackmage': 'BLM', 'blm': 'BLM',
        'summoner': 'SMN', 'smn': 'SMN',
        'redmage': 'RDM', 'rdm': 'RDM',
        'pictomancer': 'PCT', 'pct': 'PCT'
    };
    return map[s] || null;
}

function openMitImportOptionsModal() {
    const modal = document.getElementById('mit-import-options-modal');
    if (modal) modal.classList.add('active');
}

function openMitFFLogsModal() {
    const modal = document.getElementById('mit-fflogs-api-modal');
    if (!modal) return;
    document.getElementById('mit-fflogs-api-url').value = '';
    document.getElementById('mit-fflogs-api-fight-section').style.display = 'none';
    document.getElementById('mit-fflogs-api-options-section').style.display = 'none';
    document.getElementById('mit-fflogs-api-import').style.display = 'none';
    mitFflogsSetStatus('');
    mitFflogsReportCode = null;
    modal.classList.add('active');
}

function mitFflogsSetStatus(msg, isError = false) {
    const el = document.getElementById('mit-fflogs-api-status');
    if (!el) return;
    el.style.display = msg ? 'block' : 'none';
    el.style.color = isError ? '#ff6b6b' : 'var(--color-text-muted)';
    el.innerHTML = msg;
}

function extractUrlParamsHelper(url) {
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

async function mitFflogsFetchReport() {
    const urlInput = document.getElementById('mit-fflogs-api-url').value.trim();
    const extractFn = window.extractReportCode || function(url) {
        const m = url.match(/reports\/([A-Za-z0-9]+)/);
        return m ? m[1] : null;
    };
    const code = extractFn(urlInput);
    if (!code) {
        mitFflogsSetStatus('⚠️ 請輸入有效的 FFLogs 報告連結（例如 https://www.fflogs.com/reports/ABC123）', true);
        return;
    }
    mitFflogsReportCode = code;
    mitFflogsSetStatus('<i class="fa-solid fa-spinner fa-spin"></i> 正在查詢報告...');

    const queryFn = window.fflogsQuery;
    if (!queryFn) {
        mitFflogsSetStatus('❌ FFLogs API 模組尚未載入', true);
        return;
    }

    try {
        const data = await queryFn(`
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
        mitFflogsFights = report.fights || [];

        if (mitFflogsFights.length === 0) {
            mitFflogsSetStatus('⚠️ 找不到戰鬥段落', true);
            return;
        }

        const fightSel = document.getElementById('mit-fflogs-api-fight-select');
        fightSel.innerHTML = '';
        mitFflogsFights.forEach(f => {
            const dur = ((f.endTime - f.startTime) / 1000).toFixed(0);
            const label = `${f.name}${f.kill ? ' ✅' : ''} (${Math.floor(dur/60)}:${String(dur%60).padStart(2,'0')})`;
            fightSel.innerHTML += `<option value="${f.id}">${label}</option>`;
        });

        document.getElementById('mit-fflogs-api-fight-section').style.display = 'flex';
        document.getElementById('mit-fflogs-api-options-section').style.display = 'flex';
        document.getElementById('mit-fflogs-api-import').style.display = 'inline-flex';

        const urlParams = extractUrlParamsHelper(urlInput);
        if (urlParams.fight !== null) {
            const matchedFight = mitFflogsFights.find(f => f.id === urlParams.fight);
            if (matchedFight) {
                fightSel.value = matchedFight.id;
            }
        }

        mitFflogsSetStatus('');
    } catch (err) {
        mitFflogsSetStatus(`❌ 查詢失敗：${err.message}`, true);
    }
}

function matchMitSkill(jobAbbrev, abilityName) {
    if (!abilityName || !mitSkillsDatabase[jobAbbrev]) return null;
    const jobData = mitSkillsDatabase[jobAbbrev];
    const evNameLower = abilityName.toLowerCase().trim();

    // 1. Direct match in mitSkillsDatabase
    for (const s of jobData.skills) {
        if (s.name.toLowerCase() === evNameLower) return s;
        if (s.aliases && s.aliases.some(a => a.toLowerCase() === evNameLower)) return s;
        if (s.levelRestrictions) {
            for (const key in s.levelRestrictions) {
                if (s.levelRestrictions[key].name && s.levelRestrictions[key].name.toLowerCase() === evNameLower) {
                    return s;
                }
            }
        }
    }

    // 2. Cross-match via window.skillsDatabase if available
    const JOB_MAP_LOCAL = {
        "PLD": "paladin", "WAR": "warrior", "DRK": "darkknight", "GNB": "gunbreaker",
        "WHM": "whitemage", "SCH": "scholar", "AST": "astrologian", "SGE": "sage",
        "MNK": "monk", "DRG": "dragoon", "NIN": "ninja", "SAM": "samurai",
        "RPR": "reaper", "VPR": "viper", "BRD": "bard", "MCH": "machinist",
        "DNC": "dancer", "BLM": "blackmage", "SMN": "summoner", "RDM": "redmage",
        "PCT": "pictomancer"
    };

    const jobId = JOB_MAP_LOCAL[jobAbbrev];
    const fullJobData = window.skillsDatabase ? window.skillsDatabase[jobId] : null;

    if (fullJobData && fullJobData.skills) {
        const matchedFullSkill = fullJobData.skills.find(s => {
            if (s.name.toLowerCase() === evNameLower) return true;
            if (s.aliases && s.aliases.some(a => a.toLowerCase() === evNameLower)) return true;
            return false;
        });

        if (matchedFullSkill) {
            const ChineseName = matchedFullSkill.name.toLowerCase();
            for (const s of jobData.skills) {
                if (s.name.toLowerCase() === ChineseName) return s;
                if (s.levelRestrictions) {
                    for (const key in s.levelRestrictions) {
                        if (s.levelRestrictions[key].name && s.levelRestrictions[key].name.toLowerCase() === ChineseName) {
                            return s;
                        }
                    }
                }
            }
        }
    }

    return null;
}

function parsePlayerDetailsFlat(pd) {
    const players = [];
    if (!pd) return players;
    const details = pd?.data?.playerDetails || pd?.playerDetails || pd || {};
    for (const role of Object.values(details)) {
        if (Array.isArray(role)) {
            for (const p of role) {
                if (p.id && p.name) {
                    players.push({ id: p.id, name: p.name, type: p.type || '' });
                }
            }
        }
    }
    return players;
}

function isFeintAbility(nameLower) {
    return nameLower === '牽制' || nameLower === 'feint';
}

function isAddleAbility(nameLower) {
    return nameLower === '昏亂' || nameLower === 'addle';
}

function isPhysRangedMitAbility(nameLower) {
    return nameLower === '吟遊詩人的行進曲' || nameLower === '吟遊詩人的吟唱' || nameLower === 'troubadour' ||
           nameLower === '策勵' || nameLower === 'tactician' ||
           nameLower === '防守之桑巴' || nameLower === '桑巴' || nameLower === 'shield samba';
}

function matchAndAdaptMitSkill(targetJobAbbrev, abilityName) {
    if (!abilityName || !mitSkillsDatabase[targetJobAbbrev]) return null;
    const nameLower = abilityName.toLowerCase().trim();

    // 1. Feint adaptation for Melee DPS
    if (isFeintAbility(nameLower)) {
        const feintSkill = mitSkillsDatabase[targetJobAbbrev].skills.find(s => s.name === '牽制' || (s.aliases && s.aliases.some(a => a.toLowerCase() === 'feint')));
        if (feintSkill) return feintSkill;
    }

    // 2. Addle adaptation for Casters
    if (isAddleAbility(nameLower)) {
        const addleSkill = mitSkillsDatabase[targetJobAbbrev].skills.find(s => s.name === '昏亂' || (s.aliases && s.aliases.some(a => a.toLowerCase() === 'addle')));
        if (addleSkill) return addleSkill;
    }

    // 3. Phys Ranged 15% mit adaptation for Phys Ranged
    if (isPhysRangedMitAbility(nameLower)) {
        const physMitSkill = mitSkillsDatabase[targetJobAbbrev].skills.find(s => 
            s.id === 'brd_troub' || s.id === 'mch_tac' || s.id === 'dnc_samba' ||
            s.name === '吟遊詩人的行進曲' || s.name === '策勵' || s.name === '防守之桑巴'
        );
        if (physMitSkill) return physMitSkill;
    }

    // 4. Standard match fallback
    return matchMitSkill(targetJobAbbrev, abilityName);
}

async function mitFflogsImport() {
    const fightId = parseInt(document.getElementById('mit-fflogs-api-fight-select').value);
    const clearFirst = document.getElementById('mit-fflogs-api-clear-timeline').checked;
    const urlInput = document.getElementById('mit-fflogs-api-url').value.trim();

    if (!mitFflogsReportCode || !fightId) return;

    const importBtn = document.getElementById('mit-fflogs-api-import');
    importBtn.disabled = true;
    mitFflogsSetStatus('<i class="fa-solid fa-spinner fa-spin"></i> 正在驗證隊伍組成...');

    const queryFn = window.fflogsQuery;
    try {
        // Step 1: Fetch playerDetails for fight
        const pdData = await queryFn(`
            query($code: String!, $fightId: [Int]!) {
                reportData {
                    report(code: $code) {
                        playerDetails(fightIDs: $fightId)
                    }
                }
            }
        `, { code: mitFflogsReportCode, fightId: [fightId] });

        const rawPlayers = parsePlayerDetailsFlat(pdData.reportData.report.playerDetails);
        const logPlayers = [];
        for (const p of rawPlayers) {
            const jobAbbrev = normalizeJobToAbbrev(p.type);
            if (jobAbbrev) {
                logPlayers.push({ id: p.id, name: p.name, type: p.type, jobAbbrev });
            }
        }

        // Step 2 & 3: Dynamically match log players to mitParty slots 0..7
        const JOB_ROLES = {
            'PLD': 'tank', 'WAR': 'tank', 'DRK': 'tank', 'GNB': 'tank',
            'WHM': 'healer', 'SCH': 'healer', 'AST': 'healer', 'SGE': 'healer',
            'MNK': 'melee', 'DRG': 'melee', 'NIN': 'melee', 'SAM': 'melee', 'RPR': 'melee', 'VPR': 'melee',
            'BRD': 'phys_ranged', 'MCH': 'phys_ranged', 'DNC': 'phys_ranged',
            'BLM': 'caster', 'SMN': 'caster', 'RDM': 'caster', 'PCT': 'caster'
        };

        const playerSlotMap = {};
        const usedLogPlayerIds = new Set();
        let matchFailed = false;

        for (let slotIdx = 0; slotIdx < 8; slotIdx++) {
            const targetJob = mitParty[slotIdx];
            const targetRole = JOB_ROLES[targetJob] || 'dps';

            let matchedPlayer = null;

            if (slotIdx < 4) {
                // Tanks (0, 1) and Healers (2, 3): exact job match required!
                matchedPlayer = logPlayers.find(p => p.jobAbbrev === targetJob && !usedLogPlayerIds.has(p.id));
            } else {
                // DPS slots (4, 5, 6, 7): match by exact job first, or by DPS role
                matchedPlayer = logPlayers.find(p => p.jobAbbrev === targetJob && !usedLogPlayerIds.has(p.id));
                if (!matchedPlayer) {
                    matchedPlayer = logPlayers.find(p => JOB_ROLES[p.jobAbbrev] === targetRole && !usedLogPlayerIds.has(p.id));
                }
            }

            if (!matchedPlayer) {
                matchFailed = true;
                break;
            }

            usedLogPlayerIds.add(matchedPlayer.id);
            playerSlotMap[matchedPlayer.id] = {
                slotIndex: slotIdx,
                jobAbbrev: targetJob,
                logJobAbbrev: matchedPlayer.jobAbbrev,
                name: matchedPlayer.name
            };
        }

        if (matchFailed) {
            const mismatchMsg = '此Log的坦補職業與你的隊伍組成不匹配，請確認隊伍組成後再重新匯入。';
            mitFflogsSetStatus(`⚠️ ${mismatchMsg}`, true);
            alert(mismatchMsg);
            importBtn.disabled = false;
            return;
        }

        mitFflogsSetStatus('<i class="fa-solid fa-spinner fa-spin"></i> 正在抓取團隊技能事件...');

        // Step 4: Fetch cast events
        const fight = mitFflogsFights.find(f => f.id === fightId);
        const fightStart = fight ? fight.startTime : 0;
        const urlParams = extractUrlParamsHelper(urlInput);
        let filterExpr = "";
        if (urlParams.phase !== null) {
            filterExpr = `encounterPhase = ${urlParams.phase}`;
        }

        const eventsData = await queryFn(`
            query($code: String!, $fightId: Int!, $filterExpr: String) {
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
                            filterExpression: $filterExpr
                            limit: 10000
                        ) { data }
                    }
                }
            }
        `, {
            code: mitFflogsReportCode,
            fightId,
            filterExpr: filterExpr || null
        });

        const events = eventsData.reportData.report.events.data || [];
        if (events.length === 0) {
            mitFflogsSetStatus('⚠️ 沒有找到施放事件', true);
            importBtn.disabled = false;
            return;
        }

        const abilities = eventsData.reportData.report.masterData?.abilities || [];
        const abilityMap = {};
        abilities.forEach(a => { abilityMap[a.gameID] = a.name; });

        let alignmentStart = fightStart;
        if (urlParams.phase !== null) {
            const castEvents = events.filter(ev => ev.type === 'cast' || ev.type === 'begincast');
            if (castEvents.length > 0) {
                alignmentStart = Math.min(...castEvents.map(ev => ev.timestamp));
            }
        }

        const parsedEvents = [];
        for (const ev of events) {
            if (ev.type !== 'cast' && ev.type !== 'begincast') continue;
            const playerInfo = playerSlotMap[ev.sourceID];
            if (!playerInfo) continue;

            const abilityName = abilityMap[ev.abilityGameID];
            if (!abilityName) continue;

            const matched = matchAndAdaptMitSkill(playerInfo.jobAbbrev, abilityName);
            if (!matched) continue;

            const activePanelIds = getActivePanelSkillIds(playerInfo.jobAbbrev);
            if (!activePanelIds.has(matched.id)) continue;

            const relSec = (ev.timestamp - alignmentStart) / 1000;
            if (relSec < 0) continue;

            parsedEvents.push({
                type: ev.type,
                timestamp: ev.timestamp,
                relSec,
                slotIndex: playerInfo.slotIndex,
                jobAbbrev: playerInfo.jobAbbrev,
                skill: matched
            });
        }

        parsedEvents.sort((a, b) => a.timestamp - b.timestamp);

        // Deduplicate begincast vs cast & ghost events per player/skill
        const uniqueEvents = [];
        const castHistory = {};
        const lastPushedTime = {};

        for (const pe of parsedEvents) {
            const key = `${pe.slotIndex}_${pe.skill.id}`;
            const castDuration = 0;
            let eventTime = pe.relSec;

            if (pe.type === 'begincast') {
                pe.completionTime = pe.relSec;
            } else {
                pe.completionTime = pe.relSec;
                const lastBegin = castHistory[key];
                let shouldSkip = false;
                if (lastBegin !== undefined) {
                    const diff = pe.relSec - lastBegin;
                    if (diff >= 0 && diff <= castDuration + 0.5) {
                        shouldSkip = true;
                    }
                    castHistory[key] = undefined;
                }
                if (shouldSkip) continue;
            }

            const cdWindow = Math.max(12, (pe.skill.cooldown || 15) - 3);
            if (lastPushedTime[key] !== undefined) {
                const timeDiff = eventTime - lastPushedTime[key];
                if (timeDiff >= 0 && timeDiff < cdWindow) continue;
            }

            if (pe.type === 'begincast') {
                castHistory[key] = pe.relSec;
            }
            lastPushedTime[key] = eventTime;
            uniqueEvents.push(pe);
        }

        if (uniqueEvents.length === 0) {
            mitFflogsSetStatus('⚠️ 沒有找到匹配的團隊技能事件', true);
            importBtn.disabled = false;
            return;
        }

        if (!Array.isArray(mitBossMechanics)) mitBossMechanics = [];

        const newMitSkills = uniqueEvents.map(pe => {
            let castTime = Math.round(pe.relSec * 10) / 10;
            let matchedExistingMech = false;

            if (mitBossMechanics.length > 0) {
                const closestMech = mitBossMechanics.reduce((closest, mech) => {
                    const diff = Math.abs(mech.time - pe.relSec);
                    return diff < closest.diff ? { mech, diff } : closest;
                }, { mech: null, diff: Infinity });

                if (closestMech.mech && closestMech.diff <= 0.5) {
                    castTime = closestMech.mech.time;
                    matchedExistingMech = true;
                }
            }

            if (!matchedExistingMech) {
                const existsRow = mitBossMechanics.some(m => Math.abs(m.time - castTime) < 0.1);
                if (!existsRow) {
                    mitBossMechanics.push({
                        id: `custom-mech-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                        time: castTime,
                        name: 'Log 施放點',
                        isCustom: true,
                        dmgType: ''
                    });
                }
            }

            return {
                id: `cast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                slotIndex: pe.slotIndex,
                jobKey: pe.jobAbbrev,
                jobAbbrev: pe.jobAbbrev,
                skillKey: pe.skill.id,
                startTime: castTime,
                duration: pe.skill.duration || 15
            };
        });

        mitBossMechanics.sort((a, b) => a.time - b.time);

        if (clearFirst) {
            mitTimelineSkills = newMitSkills;
        } else {
            mitTimelineSkills = [...mitTimelineSkills, ...newMitSkills];
        }

        window.mitTimelineSkills = mitTimelineSkills;
        renderMitTimeline();

        importBtn.disabled = false;

        const fightSel = document.getElementById('mit-fflogs-api-fight-select');
        const selectedFightText = fightSel && fightSel.selectedIndex !== -1 ? fightSel.options[fightSel.selectedIndex].text : '';

        if (window.trackEvent) {
            window.trackEvent('team_planner', 'import_fflogs', { url: urlInput, fight: selectedFightText });
        }

        const modal = document.getElementById('mit-fflogs-api-modal');
        if (modal) modal.classList.remove('active');

        const toastMsg = `✅ 成功匯入 ${newMitSkills.length} 個團隊技能事件`;
        alert(toastMsg);

    } catch (err) {
        mitFflogsSetStatus(`❌ 匯入失敗：${err.message}`, true);
        importBtn.disabled = false;
    }
}

// ============================================================
// Job Skill Panel Selection Modal & Context Menu Module
// ============================================================

let panelSelectedJob = 'PLD';
let panelSelectedCategory = 'mit';
let contextMenuTargetSkillId = null;

function openMitPanelSkillsModal() {
    const modal = document.getElementById('mit-panel-skills-modal');
    if (!modal) return;
    
    panelSelectedJob = mitParty[0] || 'PLD';
    panelSelectedCategory = 'mit';
    
    renderPanelJobSelector();
    renderPanelTabs();
    renderPanelSkillsGrid();
    
    modal.classList.add('active');
}

function closeMitPanelSkillsModal() {
    const modal = document.getElementById('mit-panel-skills-modal');
    if (modal) modal.classList.remove('active');
    hideSkillContextMenu();
}

function renderPanelJobSelector() {
    const container = document.getElementById('mit-panel-job-selector');
    if (!container) return;
    container.innerHTML = '';
    
    const availableJobs = Object.keys(mitSkillsDatabase);
    availableJobs.forEach(jobKey => {
        const jobData = mitSkillsDatabase[jobKey];
        if (!jobData) return;
        
        const btn = document.createElement('button');
        btn.className = `job-btn ${jobKey === panelSelectedJob ? 'active' : ''}`;
        btn.innerHTML = `
            <img src="${jobData.icon}" alt="${jobData.name}" />
            <span>${jobData.name}</span>
        `;
        btn.addEventListener('click', () => {
            panelSelectedJob = jobKey;
            renderPanelJobSelector();
            renderPanelTabs();
            renderPanelSkillsGrid();
        });
        container.appendChild(btn);
    });
}

function renderPanelTabs() {
    const tabsContainer = document.getElementById('mit-panel-tabs');
    if (!tabsContainer) return;
    
    const tabBtns = tabsContainer.querySelectorAll('.panel-tab-btn');
    tabBtns.forEach(btn => {
        const cat = btn.dataset.cat;
        if (cat === panelSelectedCategory) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const countSpan = document.getElementById('mit-panel-count');
    if (countSpan) {
        const activeSkills = getPlayerMitSkills(panelSelectedJob);
        countSpan.textContent = activeSkills.length;
    }
}

function getJobSkillsByCategory(jobKey, category) {
    const jobData = mitSkillsDatabase[jobKey];
    if (!jobData) return [];

    const isTankOrHealer = ['PLD', 'WAR', 'DRK', 'GNB', 'WHM', 'SCH', 'AST', 'SGE'].includes(jobKey);
    const activeSkillIds = new Set(getPlayerMitSkills(jobKey).map(s => s.id));

    if (category === 'panel') {
        return jobData.skills.filter(s => activeSkillIds.has(s.id));
    }

    const healerAoEIds = new Set([
        'whm_bell', 'whm_pli', 'whm_ass', 'whm_asy',
        'sch_whi', 'sch_fey', 'sch_ser', 'sch_csl', 'sch_dt',
        'ast_celop', 'ast_horos', 'ast_macromos',
        'sge_phys2', 'sge_pneuma', 'sge_philo'
    ]);

    return jobData.skills.filter(s => {
        if (s.passive || s.id.includes('passive')) return false;

        const isMitOrShield = s.tags && (s.tags.includes('減傷') || s.tags.includes('護盾') || s.tags.includes('無敵'));
        const isBuff = s.tags && s.tags.includes('團輔');
        const isHealOrHot = s.tags && (s.tags.includes('HOT') || s.tags.includes('恢復') || s.tags.includes('治療'));

        if (category === 'mit') {
            return isMitOrShield || (isTankOrHealer && !s.personal && !isBuff);
        } else if (category === 'buff') {
            return isBuff || (s.title && (s.title.includes('傷害') || s.title.includes('暴擊')));
        } else if (category === 'heal') {
            return isHealOrHot || healerAoEIds.has(s.id) || (isTankOrHealer && !isMitOrShield && !isBuff);
        }
        return true;
    });
}

function renderPanelSkillsGrid() {
    const grid = document.getElementById('mit-panel-skills-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const skills = getJobSkillsByCategory(panelSelectedJob, panelSelectedCategory);
    const activeSkillIds = new Set(getPlayerMitSkills(panelSelectedJob).map(s => s.id));

    if (skills.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px; color: var(--color-text-muted);">
                <i class="fa-solid fa-folder-open" style="font-size: 24px; margin-bottom: 8px; opacity: 0.5;"></i>
                <p style="margin: 0; font-size: 13px;">此分類下尚無技能</p>
            </div>
        `;
        return;
    }

    skills.forEach(skill => {
        const isInPanel = activeSkillIds.has(skill.id);
        const card = document.createElement('div');
        card.className = `panel-skill-card ${isInPanel ? 'in-panel' : ''}`;
        
        const isGcd = skill.cooldown <= 2.5 && skill.cooldown > 0;
        const metaText = `${isGcd ? '魔法' : '能力'}${skill.duration ? ' · ' + skill.duration + '秒' : ''}`;

        card.innerHTML = `
            <img src="${skill.icon}" alt="${skill.name}" />
            <div class="panel-skill-info">
                <div class="panel-skill-name">${skill.name}</div>
                <div class="panel-skill-meta">
                    <span>${metaText}</span>
                    <span class="panel-badge ${isInPanel ? 'active' : 'inactive'}">${isInPanel ? '已在面板' : '未在面板'}</span>
                </div>
            </div>
        `;

        card.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSkillInPanel(panelSelectedJob, skill.id);
        });

        card.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showSkillContextMenu(e, skill.id, isInPanel);
        });

        grid.appendChild(card);
    });
}

function toggleSkillInPanel(jobKey, skillId) {
    if (!customJobPanels[jobKey] || !Array.isArray(customJobPanels[jobKey])) {
        customJobPanels[jobKey] = getPlayerMitSkills(jobKey).map(s => s.id);
    }

    const idx = customJobPanels[jobKey].indexOf(skillId);
    if (idx !== -1) {
        customJobPanels[jobKey].splice(idx, 1);
    } else {
        customJobPanels[jobKey].push(skillId);
    }

    renderPanelTabs();
    renderPanelSkillsGrid();
}

function showSkillContextMenu(e, skillId, isInPanel) {
    contextMenuTargetSkillId = skillId;
    const menu = document.getElementById('mit-skill-context-menu');
    if (!menu) return;

    const addBtn = document.getElementById('mit-ctx-add');
    const removeBtn = document.getElementById('mit-ctx-remove');

    if (addBtn) addBtn.style.display = isInPanel ? 'none' : 'flex';
    if (removeBtn) removeBtn.style.display = isInPanel ? 'flex' : 'none';

    menu.style.display = 'block';
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;

    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) menu.style.left = `${e.clientX - rect.width}px`;
    if (rect.bottom > window.innerHeight) menu.style.top = `${e.clientY - rect.height}px`;
}

function hideSkillContextMenu() {
    const menu = document.getElementById('mit-skill-context-menu');
    if (menu) menu.style.display = 'none';
    contextMenuTargetSkillId = null;
}

async function handleSaveCustomPanels() {
    try {
        localStorage.setItem('sked_custom_job_panels', JSON.stringify(customJobPanels));
    } catch (e) {}

    if (currentTeamPlanId && currentUser) {
        try {
            await sb.from('team_plans')
                .update({ custom_panels: customJobPanels })
                .eq('id', currentTeamPlanId);
        } catch (err) {
            console.warn('Error saving custom panels to DB:', err);
        }
    }

    renderMitSkillsList();
    renderMitPlayerTracks();
    renderMitTimeline();

    closeMitPanelSkillsModal();
    alert('✅ 已成功保存您的職業技能面板設定！');
}

