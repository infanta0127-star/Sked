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
const mitLayoutSelect = document.getElementById('mit-layout-select');
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

        // Restore auth session & handle email auth / password recovery
        sb.auth.onAuthStateChange((event, session) => {
            currentUser = session?.user || null;
            updateAuthUI();
            if (event === 'PASSWORD_RECOVERY') {
                openAuthModal('reset-password');
            }
        });

        // Check if there are sharing tokens in the URL
        await handleUrlSharingTokens();

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
        document.getElementById('btn-logout').addEventListener('click', () => sb.auth.signOut());
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
    overlay.addEventListener('click', e => { if (e.target === overlay) closeAuthModal(); });
    document.getElementById('auth-modal-close').addEventListener('click', closeAuthModal);
}

function openAuthModal(view = 'login') {
    createAuthModal();
    document.getElementById('auth-modal-overlay').style.display = 'flex';
    renderAuthView(view);
}

function closeAuthModal() {
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
        let dmgType = 'physical';
        const typeStr = m.type || (m.damage && m.damage[0] && m.damage[0].type) || '';
        if (typeStr.includes('魔') || typeStr.toLowerCase().includes('magic')) {
            dmgType = 'magic';
        } else if (typeStr.includes('暗') || typeStr.toLowerCase().includes('darkness') || typeStr.includes('無')) {
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
    
    const allSkills = jobData.skills.filter(s => 
        s.tags && 
        (s.tags.includes('減傷') || s.tags.includes('護盾') || s.tags.includes('無敵')) && 
        !s.personal
    );
    
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
                <span style="font-size: 9px; font-weight: bold; background: rgba(255, 255, 255, 0.1); padding: 1px 4px; border-radius: 3px;">${slotLabels[i]}</span>
                <img src="${jobData.icon}" />
                <span>${jobData.name}</span>
                ${hasExpandOption ? `
                    <button class="grid-expand-btn" data-slot="${i}" style="background:none; border:none; color:var(--color-text-muted); cursor:pointer; font-size:10px; padding:2px; display:inline-flex; align-items:center;" title="${isExpanded ? '收合技能' : '展開更多'}">
                        <i class="fa-solid fa-${isExpanded ? 'chevron-left' : 'chevron-right'}"></i>
                    </button>
                ` : ''}
            </div>
        `;
        
        // Attach toggle expand listener
        if (hasExpandOption) {
            const btn = th1.querySelector('.grid-expand-btn');
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    mitGridExpanded[i] = !mitGridExpanded[i];
                    renderMitTimeline();
                });
            }
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
                th2.title = `${skill.name}: ${skill.title}`;
                th2.innerHTML = `
                    <div class="skill-header-content">
                        <img src="${skill.icon}" />
                        <span>${skill.name}</span>
                    </div>
                `;
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
                
                // Double click to delete
                pill.addEventListener('dblclick', () => {
                    mitTimelineSkills = mitTimelineSkills.filter(c => c.id !== cast.id);
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
        dmgType: 'physical'
    });
    
    mitBossMechanics.sort((a, b) => a.time - b.time);
    renderMitTimeline();
}

// ── 9. Supabase Operations (Cloud Save/Load/Share) ──

async function saveTeamPlanToSupabase() {
    if (!currentUser) {
        alert('請先登入 Google 帳號後，才能儲存減排計畫至雲端！');
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
        alert('請先登入 Google 以讀取您的雲端計畫！');
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
