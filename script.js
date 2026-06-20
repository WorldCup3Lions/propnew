/* ═════════════════════════════════════════════════════════════════════════
   DAILY PROPS — Game Logic
   ═════════════════════════════════════════════════════════════════════════ */

// ── Sport metadata ──
const SPORT_META = {
    basketball: { icon: "fa-basketball",  color: "#c8102e", label: "Basketball" },
    football:   { icon: "fa-football",    color: "#013369", label: "Football" },
    hockey:     { icon: "fa-hockey-puck", color: "#1d428a", label: "Hockey" },
    soccer:     { icon: "fa-futbol",      color: "#326295", label: "Soccer" },
    baseball:   { icon: "fa-baseball",    color: "#041e42", label: "Baseball" },
    golf:       { icon: "fa-golf-ball-tee", color: "#007a53", label: "Golf" },
    tennis:     { icon: "fa-table-tennis-paddle-ball", color: "#2d6a4f", label: "Tennis" },
    ufc:        { icon: "fa-hand-fist",   color: "#d20a0a", label: "UFC" }
};

// ── Fake leaderboard players ──
const FAKE_PLAYERS = [
    "PropKing99","BetBoss","SwishMoney","TD_Tom","SlapShotSam",
    "GoalLineMike","HoopDreams","ClutchPick","LongShotLucy","FadeMaster",
    "ParlayQueen","OverUnderO","SharpEye","BookieCrusher","NetSwish",
    "DimeDropper","CashOutCarl","WagerWiz","BuckHunter","StakeKing"
];

// ── State ──
let selectedProps = [];
let currentFilter = "all";
let packOpening = false;
let currentPicksDate = null; // which date we're viewing on picks screen
let currentLbTab = "daily";
let countdownInterval = null;

// ═════════════════════════════════════════════════════════════════════════
// HELPERS
// ═════════════════════════════════════════════════════════════════════════

function $(id) { return document.getElementById(id); }
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function getTodayKey() { return window.DAILY_CONFIG.date; }

function lsGet(key) { try { return localStorage.getItem(key); } catch(e) { return null; } }
function lsSet(key, val) { try { localStorage.setItem(key, val); } catch(e) {} }

// ── User ──
function getUsername() { return lsGet('dp_username') || ''; }
function setUsername(name) { lsSet('dp_username', name); }

// ── Day-specific storage helpers ──
function dayKey(dateKey, suffix) { return `dp_${suffix}_${dateKey}`; }

function hasOpenedPack(dateKey) {
    if (!dateKey) dateKey = getTodayKey();
    return lsGet(dayKey(dateKey, 'opened')) === '1';
}
function markOpened(dateKey) {
    if (!dateKey) dateKey = getTodayKey();
    lsSet(dayKey(dateKey, 'opened'), '1');
}

function isLockedIn(dateKey) {
    if (!dateKey) dateKey = getTodayKey();
    return lsGet(dayKey(dateKey, 'locked')) === '1';
}
function setLockedIn(dateKey) {
    if (!dateKey) dateKey = getTodayKey();
    lsSet(dayKey(dateKey, 'locked'), '1');
}

function getPicks(dateKey) {
    if (!dateKey) dateKey = getTodayKey();
    try { return JSON.parse(lsGet(dayKey(dateKey, 'picks'))) || []; } catch(e) { return []; }
}
function setPicks(picks, dateKey) {
    if (!dateKey) dateKey = getTodayKey();
    lsSet(dayKey(dateKey, 'picks'), JSON.stringify(picks));
}

function getPickProps(dateKey) {
    if (!dateKey) dateKey = getTodayKey();
    try { return JSON.parse(lsGet(dayKey(dateKey, 'pickprops'))) || []; } catch(e) { return []; }
}
function setPickProps(props, dateKey) {
    if (!dateKey) dateKey = getTodayKey();
    lsSet(dayKey(dateKey, 'pickprops'), JSON.stringify(props));
}

function getEvent(dateKey) {
    if (!dateKey) dateKey = getTodayKey();
    try { return JSON.parse(lsGet(dayKey(dateKey, 'event'))); } catch(e) { return null; }
}
function setEvent(event, dateKey) {
    if (!dateKey) dateKey = getTodayKey();
    lsSet(dayKey(dateKey, 'event'), JSON.stringify(event));
}

function getResults(dateKey) {
    if (!dateKey) dateKey = getTodayKey();
    try { return JSON.parse(lsGet(dayKey(dateKey, 'results'))) || {}; } catch(e) { return {}; }
}
function setResults(results, dateKey) {
    if (!dateKey) dateKey = getTodayKey();
    lsSet(dayKey(dateKey, 'results'), JSON.stringify(results));
}

// ── Get prop status, checking RESULTS then PAST_RESULTS then localStorage ──
function getPropStatus(propId, dateKey) {
    if (!dateKey) dateKey = getTodayKey();

    // If viewing today, use the live RESULTS object
    if (dateKey === getTodayKey()) {
        return window.RESULTS[propId] || "pending";
    }

    // Past day: check PAST_RESULTS first
    if (window.PAST_RESULTS && window.PAST_RESULTS[dateKey]) {
        return window.PAST_RESULTS[dateKey][propId] || "pending";
    }

    // Then localStorage
    const stored = getResults(dateKey);
    return stored[propId] || "pending";
}

// ── Score calculation ──
function calcScore(dateKey) {
    if (!dateKey) dateKey = getTodayKey();
    const picks = getPicks(dateKey);
    const pickProps = getPickProps(dateKey);
    if (!picks.length || !isLockedIn(dateKey)) return 0;

    let score = 0;
    picks.forEach(id => {
        const status = getPropStatus(id, dateKey);
        if (status === 'hit') {
            const prop = pickProps.find(p => p.id === id);
            if (prop) score += prop.points;
        }
    });
    return score;
}

function getWeeklyScore() {
    const days = getLast7Days();
    let total = 0;
    days.forEach(dk => { total += calcScore(dk); });
    return total;
}

// ── Last 7 days ──
function getLast7Days() {
    const today = new Date(getTodayKey() + 'T12:00:00');
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }
    return days;
}

// ── Lock time ──
function isPicksLocked() {
    const cfg = window.DAILY_CONFIG;
    if (!cfg.lockTime) return false;

    try {
        const tz = cfg.timezone || 'America/New_York';
        const now = new Date();

        // sv-SE locale ALWAYS gives YYYY-MM-DD format — most reliable cross-browser
        const todayStr = now.toLocaleDateString('sv-SE', { timeZone: tz });

        // en-GB locale ALWAYS gives 24-hour HH:MM format — no AM/PM ambiguity
        const timeStr = now.toLocaleTimeString('en-GB', {
            timeZone: tz,
            hour: '2-digit',
            minute: '2-digit'
        });

        const configDate = cfg.date;

        // Config date is in the future → game hasn't started, picks are OPEN
        if (configDate > todayStr) return false;

        // Config date is in the past → game already happened, picks are LOCKED
        if (configDate < todayStr) return true;

        // Config date is TODAY → compare current time vs lock time
        const [curH, curM] = timeStr.split(':').map(Number);
        const [lockH, lockM] = cfg.lockTime.split(':').map(Number);

        const isLocked = (curH * 60 + curM) >= (lockH * 60 + lockM);

        console.log('[Lock Check]', {
            configDate,
            todayInTz: todayStr,
            timeInTz: timeStr,
            lockTime: cfg.lockTime,
            isLocked
        });

        return isLocked;
    } catch (e) {
        console.error('Lock check failed:', e);
        return false;
    }
}

function getTimeUntilLock() {
    const cfg = window.DAILY_CONFIG;
    if (!cfg.lockTime) return null;

    try {
        const tz = cfg.timezone || 'America/New_York';
        const now = new Date();

        // Only show countdown when config date is today in the target timezone
        const todayStr = now.toLocaleDateString('sv-SE', { timeZone: tz });
        if (cfg.date !== todayStr) return null;

        // Get current time components in target timezone
        const timeStr = now.toLocaleTimeString('en-GB', {
            timeZone: tz,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const [curH, curM, curS] = timeStr.split(':').map(Number);
        const [lockH, lockM] = cfg.lockTime.split(':').map(Number);

        const curTotalSec = curH * 3600 + curM * 60 + curS;
        const lockTotalSec = lockH * 3600 + lockM * 60;

        const diffSec = lockTotalSec - curTotalSec;
        return diffSec > 0 ? diffSec * 1000 : 0;
    } catch (e) {
        console.error('Countdown failed:', e);
        return null;
    }
}

function formatCountdown(ms) {
    if (ms === null) return '';
    if (ms <= 0) return 'Locked';
    const totalSec = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const pad = n => n.toString().padStart(2, '0');
    if (hrs > 0) return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    return `${pad(mins)}:${pad(secs)}`;
}

// ═════════════════════════════════════════════════════════════════════════
// TOAST
// ═════════════════════════════════════════════════════════════════════════

let toastTimeout;
function showToast(msg, color) {
    const t = $('toast');
    t.textContent = msg;
    t.style.borderColor = color || 'var(--accent)';
    t.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => t.classList.remove('show'), 2500);
}

// ═════════════════════════════════════════════════════════════════════════
// USERNAME
// ═════════════════════════════════════════════════════════════════════════

function submitUsername() {
    const val = $('usernameInput').value.trim();
    if (!val) { $('usernameInput').style.borderColor = 'var(--miss)'; return; }
    setUsername(val);
    $('usernameModal').classList.remove('active');
    initApp();
}

// ═════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ═════════════════════════════════════════════════════════════════════════

function navTo(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const map = { home:'homeScreen', picks:'picksScreen', leaderboard:'leaderboardScreen' };
    $(map[screen]).classList.add('active');

    const navBtn = document.querySelector(`.nav-item[data-screen="${screen}"]`);
    if (navBtn) navBtn.classList.add('active');

    if (screen === 'home') renderHome();
    if (screen === 'picks') renderPicks();
    if (screen === 'leaderboard') renderLeaderboard();

    $('selBar').classList.remove('show');
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    $(id).classList.add('active');
}

// ═════════════════════════════════════════════════════════════════════════
// COUNTDOWN TIMER
// ═════════════════════════════════════════════════════════════════════════

function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();
}

function updateCountdown() {
    const locked = isPicksLocked();
    const ms = getTimeUntilLock();

    // Home countdown
    const homeEl = $('lockCountdown');
    if (ms !== null) {
        homeEl.style.display = 'block';
        if (locked) {
            homeEl.className = 'lock-countdown closed';
            homeEl.innerHTML = '<i class="fa-solid fa-lock mr-1"></i> Picks are locked for today';
        } else {
            homeEl.className = 'lock-countdown open';
            homeEl.innerHTML = `<i class="fa-regular fa-clock mr-1"></i> Picks lock in ${formatCountdown(ms)}`;
        }
    } else {
        homeEl.style.display = 'none';
    }

    // Selection countdown
    const selEl = $('selLockTimer');
    if (selEl && ms !== null && !locked) {
        selEl.style.display = 'block';
        selEl.innerHTML = `<i class="fa-regular fa-clock mr-1"></i> Picks lock in ${formatCountdown(ms)}`;
    } else if (selEl) {
        selEl.style.display = 'none';
    }
}

// ═════════════════════════════════════════════════════════════════════════
// HOME SCREEN
// ═════════════════════════════════════════════════════════════════════════

function renderHome() {
    const e = window.DAILY_CONFIG.event;
    const meta = SPORT_META[e.sport] || { label: e.sport };

    $('eventTitle').textContent = e.title;
    $('eventSport').textContent = meta.label;
    $('eventSubtitle').textContent = e.subtitle;
    $('eventTime').textContent = e.time;
    $('eventVenue').textContent = e.venue;

    const dateObj = new Date(getTodayKey() + 'T12:00:00');
    $('topDate').textContent = dateObj.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
    $('topUser').textContent = getUsername();

    // CTA
    const cta = $('homeCTA');
    const locked = isPicksLocked();
    const opened = hasOpenedPack();
    const lockedIn = isLockedIn();

    if (locked && !lockedIn) {
        // Time expired and user didn't lock in
        cta.innerHTML = `
            <div class="cta-locked"><i class="fa-solid fa-lock"></i> Picks are locked — you didn't lock in today</div>
        `;
    } else if (!opened) {
        const disabled = locked ? 'disabled' : '';
        const label = locked ? 'Picks Locked' : '<i class="fa-solid fa-box-open" style="margin-right:8px;"></i>Open Pack';
        cta.innerHTML = `
            <p class="cta-msg">Your pack is waiting. Open it to reveal today's props.</p>
            <button class="cta-btn" id="openPackBtn" ${disabled}>${label}</button>
        `;
        if (!locked) {
            $('openPackBtn').addEventListener('click', startPackOpen);
        }
    } else if (!lockedIn) {
        cta.innerHTML = `
            <p class="cta-msg" style="color:var(--accent);">Pack opened! Select your 5 props.</p>
            <button class="cta-btn" id="choosePropsBtn"><i class="fa-solid fa-hand-pointer" style="margin-right:8px;"></i>Choose Props</button>
        `;
        $('choosePropsBtn').addEventListener('click', goToSelection);
    } else {
        cta.innerHTML = `
            <div class="cta-locked" style="color:var(--hit);"><i class="fa-solid fa-circle-check"></i> Picks locked in — check your results!</div>
        `;
    }

    // Quick stats
    $('qsDailyScore').textContent = calcScore(getTodayKey());
    $('qsWeeklyScore').textContent = getWeeklyScore();
    const rank = getPlayerRank();
    $('qsRank').textContent = rank <= 0 ? '--' : '#' + rank;
}

// ═════════════════════════════════════════════════════════════════════════
// PACK OPENING
// ═════════════════════════════════════════════════════════════════════════

function startPackOpen() {
    if (isPicksLocked()) {
        showToast('Picks are locked for today', 'var(--miss)');
        return;
    }
    showScreen('packScreen');
    const dateObj = new Date(getTodayKey() + 'T12:00:00');
    $('packDateLabel').textContent = dateObj.toLocaleDateString('en-US', { month:'short', day:'numeric' }).toUpperCase();

    const pack = $('packEl');
    pack.classList.add('pack-enter', 'pack-float');
    pack.style.transform = '';
    pack.style.opacity = '';
    $('packImg').style.transform = '';
    $('packImg').style.opacity = '';
    $('packTapText').style.opacity = '1';
    $('packGlow').classList.remove('active');
    $('packRays').classList.remove('active');
}

async function triggerPackOpen() {
    if (packOpening) return;
    packOpening = true;

    const pack = $('packEl');
    const glow = $('packGlow');
    const rays = $('packRays');
    const tapText = $('packTapText');
    const img = $('packImg');

    pack.classList.remove('pack-float');
    tapText.style.opacity = '0';

    // Shake
    pack.classList.add('shake');
    await delay(650);
    pack.classList.remove('shake');

    // Glow + rays
    glow.classList.add('active');
    rays.classList.add('active');
    await delay(900);

    // Particles
    createParticleBurst(pack);
    await delay(500);

    // Fade pack
    pack.style.transition = 'all 0.6s ease-in';
    pack.style.transform = 'scale(0.7)';
    pack.style.opacity = '0';
    rays.style.opacity = '0';
    await delay(600);

    markOpened();
    goToSelection();
    packOpening = false;
}

function createParticleBurst(packEl) {
    const rect = packEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const colors = ['#c9a227','#e8c84a','#fcd34d','#ffffff','#fef3c7','#f59e0b'];

    for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const angle = Math.random() * Math.PI * 2;
        const dist = 80 + Math.random() * 180;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        const size = 3 + Math.random() * 7;
        const color = colors[Math.floor(Math.random() * colors.length)];

        p.style.cssText = `left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;background:${color};border-radius:50%;transition:all 0.9s cubic-bezier(0.25,0.46,0.45,0.94);opacity:1;`;
        document.body.appendChild(p);

        requestAnimationFrame(() => {
            p.style.transform = `translate(${dx}px, ${dy}px)`;
            p.style.opacity = '0';
        });
        setTimeout(() => p.remove(), 1000);
    }
}

// ═════════════════════════════════════════════════════════════════════════
// SELECTION SCREEN
// ═════════════════════════════════════════════════════════════════════════

function goToSelection() {
    if (isPicksLocked() && !isLockedIn()) {
        showToast('Picks are locked for today', 'var(--miss)');
        navTo('home');
        return;
    }

    showScreen('selectionScreen');
    selectedProps = [];
    currentFilter = 'all';

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    updateCountdown();

    renderFilters();
    renderPropsGrid();
    updateSelBar();
}

function renderFilters() {
    const bar = $('filterBar');
    const sports = ['all', ...new Set(window.DAILY_CONFIG.props.map(p => p.sport))];
    bar.innerHTML = sports.map(s => {
        const label = s === 'all' ? 'All' : (SPORT_META[s]?.label || s);
        const active = s === currentFilter ? 'active' : '';
        return `<button class="filter-pill ${active}" data-sport="${s}">${label}</button>`;
    }).join('');

    bar.querySelectorAll('.filter-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.sport;
            renderFilters();
            renderPropsGrid();
        });
    });
}

function renderPropsGrid() {
    const grid = $('propsGrid');
    const filtered = currentFilter === 'all'
        ? window.DAILY_CONFIG.props
        : window.DAILY_CONFIG.props.filter(p => p.sport === currentFilter);

    grid.innerHTML = filtered.map((prop, i) => {
        const meta = SPORT_META[prop.sport] || { icon:'fa-circle', color:'#666', label:prop.sport };
        const selected = selectedProps.includes(prop.id) ? 'selected' : '';
        return `
            <div class="prop-card card-enter ${selected}" data-id="${prop.id}"
                 style="animation-delay:${Math.min(i * 0.03, 0.8)}s;">
                <div class="check-indicator"><i class="fa-solid fa-check" style="font-size:11px;"></i></div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                    <div class="sport-icon" style="background:${meta.color}20;color:${meta.color};">
                        <i class="fa-solid ${meta.icon}"></i>
                    </div>
                    <span class="pt-badge pt-${prop.points}">${prop.points}</span>
                </div>
                <p style="font-size:12px;line-height:1.4;font-weight:500;color:var(--fg);">${prop.text}</p>
                <div style="margin-top:6px;font-size:10px;font-weight:700;letter-spacing:1px;color:var(--muted);text-transform:uppercase;">${meta.label}</div>
            </div>
        `;
    }).join('');

    grid.querySelectorAll('.prop-card').forEach(card => {
        card.addEventListener('click', () => toggleProp(parseInt(card.dataset.id)));
    });
}

function toggleProp(id) {
    if (isLockedIn()) return;
    if (isPicksLocked()) return;

    const idx = selectedProps.indexOf(id);
    if (idx > -1) {
        selectedProps.splice(idx, 1);
    } else {
        if (selectedProps.length >= 5) {
            showToast('You can only pick 5 props', 'var(--miss)');
            return;
        }
        selectedProps.push(id);
    }

    document.querySelectorAll('.prop-card').forEach(card => {
        const cid = parseInt(card.dataset.id);
        card.classList.toggle('selected', selectedProps.includes(cid));
    });

    updateSelBar();
}

function randomSelect() {
    if (isLockedIn() || isPicksLocked()) return;
    selectedProps = [];
    const shuffled = [...window.DAILY_CONFIG.props].sort(() => Math.random() - 0.5);
    selectedProps = shuffled.slice(0, 5).map(p => p.id);

    document.querySelectorAll('.prop-card').forEach(card => {
        const cid = parseInt(card.dataset.id);
        card.classList.toggle('selected', selectedProps.includes(cid));
    });

    updateSelBar();
    showToast('5 random props selected!', 'var(--accent)');
}

function updateSelBar() {
    const bar = $('selBar');
    const count = selectedProps.length;
    $('selCount').textContent = `${count}/5 Selected`;

    const btn = $('lockInBtn');
    if (count === 5) {
        btn.disabled = false;
        bar.classList.add('show');
    } else if (count > 0) {
        btn.disabled = true;
        bar.classList.add('show');
    } else {
        bar.classList.remove('show');
    }
}

// ═════════════════════════════════════════════════════════════════════════
// LOCK IN
// ═════════════════════════════════════════════════════════════════════════

function openLockInModal() {
    if (selectedProps.length !== 5) return;
    if (isPicksLocked()) {
        showToast('Picks are locked for today', 'var(--miss)');
        return;
    }

    const container = $('lockInPicks');
    let totalPts = 0;

    container.innerHTML = selectedProps.map(id => {
        const prop = window.DAILY_CONFIG.props.find(p => p.id === id);
        const meta = SPORT_META[prop.sport] || { icon:'fa-circle', color:'#666', label:prop.sport };
        totalPts += prop.points;
        return `
            <div style="display:flex;align-items:center;gap:8px;padding:8px;border-radius:8px;background:var(--card);">
                <div class="sport-icon" style="background:${meta.color}20;color:${meta.color};width:24px;height:24px;font-size:11px;">
                    <i class="fa-solid ${meta.icon}"></i>
                </div>
                <span style="flex:1;font-size:12px;font-weight:500;">${prop.text}</span>
                <span class="pt-badge pt-${prop.points}" style="width:22px;height:22px;font-size:11px;">${prop.points}</span>
            </div>
        `;
    }).join('');

    container.innerHTML += `<div style="text-align:right;font-size:14px;font-weight:700;color:var(--accent);margin-top:4px;">Max potential: ${totalPts} pts</div>`;

    $('lockInModal').classList.add('active');
}

function closeLockInModal() {
    $('lockInModal').classList.remove('active');
}

function confirmLockIn() {
    const dateKey = getTodayKey();

    // Save picks and full prop data
    setPicks(selectedProps, dateKey);
    const pickPropData = selectedProps.map(id => {
        return window.DAILY_CONFIG.props.find(p => p.id === id);
    }).filter(Boolean);
    setPickProps(pickPropData, dateKey);

    // Save event info for past viewing
    setEvent(window.DAILY_CONFIG.event, dateKey);

    // Save today's results snapshot
    setResults(window.RESULTS, dateKey);

    setLockedIn(dateKey);
    closeLockInModal();

    spawnConfetti();
    showToast('Picks locked in! Good luck!', 'var(--hit)');

    setTimeout(() => navTo('picks'), 600);
}

function spawnConfetti() {
    const colors = ['#c9a227','#e8c84a','#22c55e','#ef4444','#3b82f6','#f59e0b','#ec4899'];
    for (let i = 0; i < 60; i++) {
        const c = document.createElement('div');
        c.className = 'confetti';
        const x = Math.random() * window.innerWidth;
        const size = 5 + Math.random() * 8;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const dur = 1.5 + Math.random() * 2;
        const delayMs = Math.random() * 0.5;

        c.style.cssText = `left:${x}px;top:-10px;width:${size}px;height:${size*0.6}px;background:${color};border-radius:2px;animation:confettiFall ${dur}s ease-in ${delayMs}s forwards;`;
        document.body.appendChild(c);
        setTimeout(() => c.remove(), (dur + delayMs) * 1000 + 100);
    }
}

// ═════════════════════════════════════════════════════════════════════════
// PICKS SCREEN (with history)
// ═════════════════════════════════════════════════════════════════════════

function renderPicks() {
    if (!currentPicksDate) currentPicksDate = getTodayKey();
    renderDateNav();
    renderPicksForDate(currentPicksDate);
}

function renderDateNav() {
    const days = getLast7Days();
    const nav = $('dateNav');
    const todayKey = getTodayKey();

    nav.innerHTML = days.map(dk => {
        const d = new Date(dk + 'T12:00:00');
        const dayName = d.toLocaleDateString('en-US', { weekday:'short' });
        const dayNum = d.getDate();
        const isToday = dk === todayKey;
        const isActive = dk === currentPicksDate;
        const hasPicks = isLockedIn(dk);

        let cls = 'date-pill';
        if (isActive) cls += ' active';
        if (hasPicks) cls += ' has-picks';
        if (isToday) cls += ' today';

        return `
            <button class="${cls}" data-date="${dk}">
                <div class="date-pill-day">${dayName}</div>
                <div class="date-pill-date">${dayNum}</div>
            </button>
        `;
    }).join('');

    nav.querySelectorAll('.date-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPicksDate = btn.dataset.date;
            renderPicks();
        });
    });
}

function renderPicksForDate(dateKey) {
    const picks = getPicks(dateKey);
    const locked = isLockedIn(dateKey);
    const list = $('picksList');
    const noMsg = $('noPicksMsg');
    const eventInfo = $('picksEventInfo');
    const isToday = dateKey === getTodayKey();

    // Event info for past days
    const evt = getEvent(dateKey);
    if (!isToday && evt) {
        const meta = SPORT_META[evt.sport] || { label: evt.sport };
        eventInfo.style.display = 'block';
        eventInfo.innerHTML = `<strong>${evt.title}</strong> — ${evt.subtitle} &middot; ${meta.label}`;
    } else {
        eventInfo.style.display = 'none';
    }

    if (!locked || picks.length === 0) {
        list.innerHTML = '';
        noMsg.style.display = 'block';
        noMsg.querySelector('p').textContent = isToday ? 'No picks yet today. Open your pack first!' : 'No picks this day.';
        $('picksHitPts').textContent = '0';
        $('picksPendPts').textContent = '0';
        $('picksMissPts').textContent = '0';
        $('picksTotalPts').textContent = '0';
        return;
    }

    noMsg.style.display = 'none';

    const pickProps = getPickProps(dateKey);
    let hitPts = 0, pendPts = 0, missPts = 0;

    list.innerHTML = picks.map((id, i) => {
        const prop = pickProps.find(p => p.id === id);
        if (!prop) return '';
        const status = getPropStatus(id, dateKey);
        const meta = SPORT_META[prop.sport] || { icon:'fa-circle', color:'#666', label:prop.sport };

        let statusHtml = '';
        if (status === 'hit') {
            statusHtml = `<span class="status-badge status-hit"><i class="fa-solid fa-check"></i> Hit</span>`;
            hitPts += prop.points;
        } else if (status === 'miss') {
            statusHtml = `<span class="status-badge status-miss"><i class="fa-solid fa-xmark"></i> Miss</span>`;
            missPts += prop.points;
        } else {
            statusHtml = `<span class="status-badge status-pending"><i class="fa-solid fa-clock"></i> Pending</span>`;
            pendPts += prop.points;
        }

        const resultClass = `result-${status}`;
        const ptsNote = status === 'hit' ? `<div class="pick-pts hit">+${prop.points} points</div>` : '';

        return `
            <div class="pick-card ${resultClass} card-enter" style="animation-delay:${i * 0.08}s;">
                <div class="pick-meta">
                    <div class="pick-meta-left">
                        <div class="sport-icon" style="background:${meta.color}20;color:${meta.color};">
                            <i class="fa-solid ${meta.icon}"></i>
                        </div>
                        <span class="pick-sport-label">${meta.label}</span>
                    </div>
                    <div class="pick-meta-right">
                        <span class="pt-badge pt-${prop.points}">${prop.points}</span>
                        ${statusHtml}
                    </div>
                </div>
                <div class="pick-text">${prop.text}</div>
                ${ptsNote}
            </div>
        `;
    }).join('');

    $('picksHitPts').textContent = hitPts;
    $('picksPendPts').textContent = pendPts;
    $('picksMissPts').textContent = missPts;
    $('picksTotalPts').textContent = hitPts;
}

// ═════════════════════════════════════════════════════════════════════════
// LEADERBOARD
// ═════════════════════════════════════════════════════════════════════════

function getPlayerRank() {
    const entries = getLeaderboardData();
    const idx = entries.findIndex(e => e.isMe);
    return idx + 1;
}

function getLeaderboardData() {
    const seedStr = getTodayKey() + currentLbTab;
    let seed = 0;
    for (let i = 0; i < seedStr.length; i++) seed = ((seed << 5) - seed) + seedStr.charCodeAt(i);

    function seededRandom() {
        seed = (seed * 16807 + 0) % 2147483647;
        return (seed - 1) / 2147483646;
    }

    const entries = [];
    const myName = getUsername() || 'You';
    const myScore = currentLbTab === 'daily' ? calcScore(getTodayKey()) : getWeeklyScore();

    entries.push({
        name: myName,
        score: myScore,
        isMe: true,
        avatar: myName.substring(0, 2).toUpperCase(),
        avatarColor: 'var(--accent)'
    });

    FAKE_PLAYERS.forEach(name => {
        const base = currentLbTab === 'daily'
            ? (5 + Math.floor(seededRandom() * 20))
            : (15 + Math.floor(seededRandom() * 60));
        entries.push({
            name: name,
            score: base,
            isMe: false,
            avatar: name.substring(0, 2).toUpperCase(),
            avatarColor: `hsl(${Math.floor(seededRandom() * 360)}, 50%, 35%)`
        });
    });

    entries.sort((a, b) => b.score - a.score);
    return entries;
}

function renderLeaderboard() {
    const entries = getLeaderboardData();
    const list = $('lbList');

    const medalColors = { 1: '#fcd34d', 2: '#c0c0c0', 3: '#cd7f32' };

    list.innerHTML = entries.map((entry, i) => {
        const rank = i + 1;
        const isMe = entry.isMe;

        let rankDisplay;
        if (rank <= 3) {
            rankDisplay = `<i class="fa-solid fa-trophy" style="color:${medalColors[rank]};font-size:18px;"></i>`;
        } else {
            rankDisplay = `<span style="font-size:14px;font-weight:700;color:var(--muted);">${rank}</span>`;
        }

        return `
            <div class="lb-row ${isMe ? 'is-me' : ''}">
                <div class="lb-rank">${rankDisplay}</div>
                <div class="lb-avatar" style="background:${entry.avatarColor};">${entry.avatar}</div>
                <div class="lb-name ${isMe ? 'me' : ''}">${entry.name}${isMe ? ' (You)' : ''}</div>
                <div>
                    <span class="lb-score ${isMe ? 'me' : ''}">${entry.score}</span>
                    <span class="lb-score-unit">pts</span>
                </div>
            </div>
        `;
    }).join('');
}

// ═════════════════════════════════════════════════════════════════════════
// AUTO-SAVE RESULTS — ensures past days have data in localStorage
// ═════════════════════════════════════════════════════════════════════════

function autoSaveTodayData() {
    const dk = getTodayKey();
    // Save current results snapshot
    setResults(window.RESULTS, dk);
    // Save event info
    setEvent(window.DAILY_CONFIG.event, dk);
}

// ═════════════════════════════════════════════════════════════════════════
// INIT
// ═════════════════════════════════════════════════════════════════════════

function initApp() {
    if (!getUsername()) {
        $('usernameModal').classList.add('active');
        setTimeout(() => $('usernameInput').focus(), 100);
        return;
    }

    autoSaveTodayData();
    currentPicksDate = getTodayKey();
    renderHome();
    startCountdown();
}

// ── Event listeners ──
document.addEventListener('DOMContentLoaded', () => {
    // Username
    $('usernameSubmit').addEventListener('click', submitUsername);
    $('usernameInput').addEventListener('keydown', e => { if (e.key === 'Enter') submitUsername(); });

    // Nav buttons
    $('navHome').addEventListener('click', () => navTo('home'));
    $('navPicks').addEventListener('click', () => navTo('picks'));
    $('navLb').addEventListener('click', () => navTo('leaderboard'));

    // Pack click
    $('packEl').addEventListener('click', triggerPackOpen);

    // Random select
    $('randomBtn').addEventListener('click', randomSelect);

    // Lock in flow
    $('lockInBtn').addEventListener('click', openLockInModal);
    $('lockInCancel').addEventListener('click', closeLockInModal);
    $('lockInConfirm').addEventListener('click', confirmLockIn);

    // Leaderboard tabs
    $('lbTabDaily').addEventListener('click', () => {
        currentLbTab = 'daily';
        $('lbTabDaily').classList.add('active');
        $('lbTabWeekly').classList.remove('active');
        renderLeaderboard();
    });
    $('lbTabWeekly').addEventListener('click', () => {
        currentLbTab = 'weekly';
        $('lbTabWeekly').classList.add('active');
        $('lbTabDaily').classList.remove('active');
        renderLeaderboard();
    });

    initApp();
});

// ── Confetti keyframe (injected dynamically) ──
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes confettiFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
`;
document.head.appendChild(confettiStyle);