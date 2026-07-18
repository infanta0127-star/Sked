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
        sb.auth.onAuthStateChange((event, session) => {
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
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function getPlayerMitSkills(jobKey, slotIndex) {
    const jobData = mitSkillsDatabase[jobKey];
    if (!jobData) return [];
    
    const healerAoEIds = new Set([
        'whm_bell', 'whm_pli', 'whm_ass', 'whm_asy',
        'sch_whi', 'sch_fey', 'sch_ser', 'sch_csl', 'sch_dt',
        'ast_celop', 'ast_horos', 'ast_macromos',
        'sge_phys2', 'sge_pneuma', 'sge_philo'
    ]);

    const isTankOrHealer = ['PLD', 'WAR', 'DRK', 'GNB', 'WHM', 'SCH', 'AST', 'SGE'].includes(jobKey);

    const allSkills = jobData.skills.filter(s => {
        if (s.passive || s.id.includes('passive')) return false;
        
        const isMitOrShield = s.tags && (s.tags.includes('減傷') || s.tags.includes('護盾') || s.tags.includes('無敵'));
        const isAllowedPersonal = isTankOrHealer || !s.personal;
        
        if (isMitOrShield && isAllowedPersonal) return true;
        
        // Or if it is in our healer AoE whitelist
        if (healerAoEIds.has(s.id)) return true;
        
        // Or if it's one of the group damage buffs we added
        if (s.tags && s.tags.includes('團輔')) return true;
        
        return false;
    });
    
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

function toggleMitGridSkill(slotIndex, jobKey, skillId, startTime, isChecked) {
    if (isChecked) {
        const jobData = mitSkillsDatabase[jobKey];
        const skill = jobData?.skills.find(s => s.id === skillId);
        const duration = skill ? skill.duration : 15;
        
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
            !(c.slotIndex === slotIndex && c.skillKey === skillId && c.startTime === startTime)
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
        <th rowspan="2" class="sticky-time">判定時間</th>
        <th rowspan="2" class="sticky-name">機制名稱</th>
    `;
    
    const tr2 = document.createElement('tr');
    
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
        th1.className = 'player-header-cell';
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
            th2.className = 'skill-header-cell';
            th2.innerHTML = '<span style="color: var(--color-text-muted); font-size: 11px;">無</span>';
            tr2.appendChild(th2);
        } else {
            skills.forEach(skill => {
                const th2 = document.createElement('th');
                th2.className = 'skill-header-cell';
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
        
        const timeStr = formatTime(mech.time);
        const dmgTypeLabel = mech.dmgType ? `<span class="damage-type-badge ${mech.dmgType}">${mech.dmgType === 'physical' ? '物理' : mech.dmgType === 'magic' ? '魔法' : '無屬'}</span>` : '';
        
        const tdTime = document.createElement('td');
        tdTime.className = 'sticky-time';
        tdTime.textContent = timeStr;
        tr.appendChild(tdTime);
        
        const tdName = document.createElement('td');
        tdName.className = 'sticky-name';
        tdName.innerHTML = `${mech.name} ${dmgTypeLabel}`;
        tr.appendChild(tdName);
        
        for (let i = 0; i < 8; i++) {
            const jobKey = mitParty[i];
            const skills = playerSkillsList[i];
            
            if (skills.length === 0) {
                const td = document.createElement('td');
                td.className = 'empty-skill-cell';
                td.textContent = '—';
                tr.appendChild(td);
            } else {
                skills.forEach(skill => {
                    const td = document.createElement('td');
                    
                    const casts = mitTimelineSkills.filter(c => c.slotIndex === i && c.skillKey === skill.id);
                    const isCast = casts.some(c => c.startTime === mech.time);
                    const isActive = casts.some(c => mech.time > c.startTime && mech.time < c.startTime + c.duration);
                    const isCooldown = casts.some(c => mech.time > c.startTime && mech.time < c.startTime + (skill.cooldown || 60));
                    
                    const wrapper = document.createElement('div');
                    wrapper.className = 'mit-checkbox-wrapper';
                    
                    const input = document.createElement('input');
                    input.type = 'checkbox';
                    input.className = 'mit-checkbox';
                    
                    if (isCast) {
                        input.checked = true;
                        input.addEventListener('change', () => toggleMitGridSkill(i, jobKey, skill.id, mech.time, false));
                    } else if (isActive) {
                        input.checked = true;
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
    
    if (mitLayoutMode === 'vertical') {
        gridContainer.style.display = 'block';
        if (ruler) ruler.style.display = 'none';
        if (bossTrackWrapper) bossTrackWrapper.style.display = 'none';
        if (playerTracksContainer) playerTracksContainer.style.display = 'none';
        if (playhead) playhead.style.display = 'none';
        
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
    
    if (mitBtnImport && mitFileImport) {
        mitBtnImport.addEventListener('click', () => mitFileImport.click());
        mitFileImport.addEventListener('change', importTeamPlanJSON);
    }
    if (mitBtnExport) {
        mitBtnExport.addEventListener('click', exportTeamPlanJSON);
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
                    custom_mechanics: mitBossMechanics
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
                <select id="share-permission" class="share-select">
                    <option value="view">僅查看 (唯讀模式)</option>
                    <option value="edit">可編輯 (共同編輯模式)</option>
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
        </div>
    `;
    document.body.appendChild(overlay);
    
    // Close events
    const overlayClose = () => closeShareModal();
    overlay.addEventListener('click', e => { if (e.target === overlay) overlayClose(); });
    document.getElementById('share-modal-close').addEventListener('click', overlayClose);
    
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

function openShareModal() {
    if (!currentTeamPlanId) {
        alert('請先點選「儲存至雲端」以儲存本計畫後，方可生成分享連結！');
        return;
    }
    
    // Check ownership
    if (!currentUser || currentUser.id !== currentTeamPlanOwnerId) {
        alert('只有計畫的擁有者才能修改分享與密碼設定！\n（若您是擁有者，請確認您已登入）');
        return;
    }
    createShareModal();
    
    const permissionSelect = document.getElementById('share-permission');
    const pwdInput = document.getElementById('share-password');
    const pwdBtn = document.getElementById('share-btn-password-action');
    const urlInput = document.getElementById('share-url');
    const urlBtn = document.getElementById('share-btn-url-action');
    
    // Reset all elements to initial state
    permissionSelect.value = 'view';
    permissionSelect.disabled = false;
    
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
        
        const token = (permission === 'edit') ? currentTeamEditToken : currentTeamReadToken;
        const paramName = (permission === 'edit') ? 'mit_edit' : 'mit_view';
        
        if (!token) {
            alert('無法獲取分享憑證！請重新儲存本計畫後再試。');
            return;
        }
        
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
        
        // Disable password input & permission select to prevent edits
        document.getElementById('share-password').disabled = true;
        document.getElementById('share-permission').disabled = true;
        
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

async function handleUrlSharingTokens() {
    const params = new URLSearchParams(window.location.search);
    const mitViewToken = params.get('mit_view');
    const mitEditToken = params.get('mit_edit');
    const token = mitViewToken || mitEditToken;
    
    if (token) {
        try {
            // 1. Initial trial call without password
            let { data, error } = await sb.rpc('get_team_plan_by_token', { p_token: token, p_password: null }).maybeSingle();
            if (error) throw error;
            if (!data) {
                alert('分享連結無效或該減排計畫已遭刪除！');
                return;
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
                
                const ret = await sb.rpc('get_team_plan_by_token', { p_token: token, p_password: pwd.trim().toUpperCase() }).maybeSingle();
                if (ret.error) {
                    alert(`驗證密碼失敗: ${ret.error.message}`);
                    continue;
                }
                
                if (ret.data && ret.data.password_correct) {
                    data = ret.data;
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
                                const mech = dutyMechs[time];
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
