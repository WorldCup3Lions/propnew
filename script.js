/* ═════════════════════════════════════════════════════════════════════════
   DAILY PROPS — Game Logic (Firebase Real-Time Version)
   ═════════════════════════════════════════════════════════════════════════ */

const firebaseConfig = {
    apiKey: "AIzaSyDXi4rsvMdAO2yM56PKQRPVTtTONGPj_X4",
    authDomain: "daily-props.firebaseapp.com",
    projectId: "daily-props",
    storageBucket: "daily-props.firebasestorage.app",
    messagingSenderId: "396971417731",
    appId: "1:396971417731:web:caadd9263166b91e1d3bb6",
    measurementId: "G-P19GZWC2ZP"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const SPORT_META = { basketball: { label: "Basketball" } };
let selectedProps = [];
let packOpening = false;
let packClicks = 0;
let currentPicksDate = null;
let currentLbTab = "daily";
let countdownInterval = null;
let currentUserProfile = null;
let lbUnsubscribe = null;

function $(id) { return document.getElementById(id); }
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function getTodayKey() { return window.DAILY_CONFIG.date; }
function getUserId() { return auth.currentUser ? auth.currentUser.uid : null; }
function getUsername() { return currentUserProfile ? currentUserProfile.username : 'Loading...'; }

// Local Storage for simple UI state
function lsSet(k,v) { try { localStorage.setItem(k,v); } catch(e) {} }
function lsGet(k) { try { return localStorage.getItem(k); } catch(e) { return null; } }
function hasPackOpenedToday() { return lsGet('dp_packOpened_' + getTodayKey()) === '1'; }
function markPackOpened() { lsSet('dp_packOpened_' + getTodayKey(), '1'); }

function isPicksLocked() {
    var cfg = window.DAILY_CONFIG; if (!cfg || !cfg.lockTime) return false;
    try {
        var now = new Date(); var tz = cfg.timezone || 'America/New_York';
        var todayInTz = now.toLocaleDateString('sv-SE', { timeZone: tz });
        if (cfg.date > todayInTz) return false; if (cfg.date < todayInTz) return true;
        var timeInTz = now.toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit' });
        var tp = timeInTz.split(':'); var lp = cfg.lockTime.split(':');
        return (parseInt(tp[0])*60+parseInt(tp[1])) >= (parseInt(lp[0])*60+parseInt(lp[1]));
    } catch(e) { return false; }
}
function getTimeUntilLock() {
    var cfg = window.DAILY_CONFIG; if (!cfg || !cfg.lockTime) return null;
    try {
        var now = new Date(); var tz = cfg.timezone || 'America/New_York';
        var todayInTz = now.toLocaleDateString('sv-SE', { timeZone: tz });
        if (cfg.date !== todayInTz) return null;
        var timeInTz = now.toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        var tp = timeInTz.split(':'); var lp = cfg.lockTime.split(':');
        var curSec = parseInt(tp[0])*3600+parseInt(tp[1])*60+parseInt(tp[2]); var lockSec = parseInt(lp[0])*3600+parseInt(lp[1])*60;
        var diff = lockSec - curSec; return diff > 0 ? diff * 1000 : 0;
    } catch(e) { return null; }
}
function formatCountdown(ms) { if(!ms||ms<=0) return 'Locked'; var s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60; var p=n=>n<10?'0'+n:''+n; return h>0?p(h)+':'+p(m)+':'+p(sec):p(m)+':'+p(sec); }
function getPropStatus(propId, dateKey) { if (!dateKey) dateKey = getTodayKey(); if (dateKey === getTodayKey()) return window.RESULTS[propId] || "pending"; if (window.PAST_RESULTS && window.PAST_RESULTS[dateKey]) return window.PAST_RESULTS[dateKey][propId] || "pending"; return "pending"; }
function getWeekDays() { const today=new Date(getTodayKey()+'T12:00:00'); const dow=today.getDay(); const m=dow===0?-6:1-dow; const mon=new Date(today); mon.setDate(today.getDate()+m); const d=[]; for(let i=0;i<7;i++){const dd=new Date(mon);dd.setDate(mon.getDate()+i);d.push(dd.toISOString().split('T')[0]);} return d; }

// ── FIRESTORE ──
async function loadUserProfile(uid) { const doc = await db.collection('users').doc(uid).get(); currentUserProfile = doc.exists ? doc.data() : { username: 'NewUser' }; }
async function saveUsernameToDB(username) { if(!getUserId()) return; await db.collection('users').doc(getUserId()).set({ username }, { merge: true }); currentUserProfile.username = username; }
async function savePicksToDB(pickIds, pickProps) { if(!getUserId()) return; const dk=getTodayKey(); await db.collection('picks').doc(getUserId()+'_'+dk).set({ userId:getUserId(), date:dk, pickIds, pickProps, event:window.DAILY_CONFIG.event, locked:true }); updateLeaderboardScore(); }
async function getPicksFromDB(dateKey) { if(!getUserId()) return { locked:false, pickIds:[], pickProps:[] }; const doc = await db.collection('picks').doc(getUserId()+'_'+dateKey).get(); return doc.exists ? doc.data() : { locked:false, pickIds:[], pickProps:[] }; }
async function updateLeaderboardScore() { if(!getUserId()) return; const dk=getTodayKey(); const pd=await getPicksFromDB(dk); if(!pd.locked||!pd.pickProps) return; let s=0; pd.pickIds.forEach(id=>{if(getPropStatus(id,dk)==='hit'){const p=pd.pickProps.find(x=>x.id===id);if(p)s+=p.points;}}); await db.collection('leaderboard').doc(dk).set({ [getUserId()]: { username: getUsername(), score: s } }, { merge: true }); }

// ── AUTH & UI ──
var toastTimeout; function showToast(msg, color) { var t=$('toast'); t.textContent=msg; t.style.borderColor=color||'var(--accent)'; t.classList.add('show'); clearTimeout(toastTimeout); toastTimeout=setTimeout(()=>t.classList.remove('show'),2500); }
function showAuthModal(isSignUp) { $('authTitle').textContent=isSignUp?'Create Account':'Welcome Back'; $('authSubmitBtn').textContent=isSignUp?'Sign Up':'Log In'; $('authToggleBtn').textContent=isSignUp?'Already have an account? Log In':'Need an account? Sign Up'; $('authUsername').style.display=isSignUp?'block':'none'; $('authError').style.display='none'; $('authEmail').value=''; $('authPassword').value=''; $('authUsername').value=''; $('authModal').classList.add('active'); }
function toggleAuthMode() { showAuthModal($('authSubmitBtn').textContent !== 'Sign Up'); }
async function handleAuthSubmit() { const e=$('authEmail').value.trim(), p=$('authPassword').value.trim(), u=$('authUsername').value.trim(), isSu=$('authSubmitBtn').textContent==='Sign Up'; $('authError').style.display='none'; if(!e||!p||(isSu&&!u)){$('authError').textContent='Fill out all fields';$('authError').style.display='block';return;} try { if(isSu){const c=await auth.createUserWithEmailAndPassword(e,p); await db.collection('users').doc(c.user.uid).set({username:u,email:e}); $('authModal').classList.remove('active');} else {await auth.signInWithEmailAndPassword(e,p); $('authModal').classList.remove('active');} } catch(err){$('authError').textContent=err.message;$('authError').style.display='block';} }
function handleLogout() { auth.signOut(); }
function openProfile() { if(getUserId()) $('profileNameInput').value=getUsername(); $('profileModal').classList.add('active'); }
async function saveProfile() { var v=$('profileNameInput').value.trim(); if(!v) return; await saveUsernameToDB(v); $('profileModal').classList.remove('active'); $('topUserName').textContent=v; showToast('Profile saved!','var(--hit)'); updateLeaderboardScore(); }

function navTo(screen) { document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active')); var map={home:'homeScreen',picks:'picksScreen',leaderboard:'leaderboardScreen'}; $(map[screen]).classList.add('active'); var nb=document.querySelector('.nav-item[data-screen="'+screen+'"]'); if(nb) nb.classList.add('active'); if(screen==='home') renderHome(); if(screen==='picks') renderPicks(); if(screen==='leaderboard') listenToLeaderboard(); $('selBar').classList.remove('show'); }
function showScreen(id) { document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); $(id).classList.add('active'); }
function startCountdown() { if(countdownInterval) clearInterval(countdownInterval); countdownInterval=setInterval(updateCountdown,1000); updateCountdown(); }
function updateCountdown() { var locked=isPicksLocked(),ms=getTimeUntilLock(),he=$('lockCountdown'),se=$('selLockTimer'); if(ms!==null){he.style.display='block'; if(locked){he.className='lock-countdown closed';he.innerHTML='<i class="fa-solid fa-lock" style="margin-right:4px;"></i> Picks are locked';}else{he.className='lock-countdown open';he.innerHTML='<i class="fa-regular fa-clock" style="margin-right:4px;"></i> Picks lock in '+formatCountdown(ms);}}else{he.style.display='none';} if(se&&ms!==null&&!locked){se.style.display='block';se.innerHTML='<i class="fa-regular fa-clock" style="margin-right:4px;"></i> Picks lock in '+formatCountdown(ms);}else if(se){se.style.display='none';} }

// ── HOME ──
// ── HOME ──
// ── HOME ──
async function renderHome() { 
    if(!getUserId()) return; 
    var e=window.DAILY_CONFIG.event; $('eventTitle').textContent=e.title; $('eventSport').textContent='BASKETBALL'; $('eventSubtitle').textContent=e.subtitle; $('eventTime').textContent=e.time; $('eventVenue').textContent=e.venue; $('topUserName').textContent=getUsername(); var d=new Date(getTodayKey()+'T12:00:00'); $('topDate').textContent=d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}); 
    
    // Check today's data and global pack state
    const pd = await getPicksFromDB(getTodayKey());
    const op = hasPackOpenedToday() || pd.locked;
    const li = pd.locked;
    const tl = isPicksLocked(); 
    
    var cta=$('homeCTA'); 

    if(li) {
        // User locked in today: Hide the top countdown timer, show green success CTA
        $('lockCountdown').style.display = 'none'; 
        cta.innerHTML='<div class="cta-locked" style="color:var(--hit);"><i class="fa-solid fa-circle-check"></i> Picks locked in!</div>'; 
    } else if(tl) {
        // Time is locked but user didn't lock in: Hide the CTA entirely, let the red top bar be the only message
        cta.innerHTML=''; 
    } else if(!op) {
        // Pack not opened today, show Open Pack button
        cta.innerHTML='<p class="cta-msg">Your pack is waiting.</p><button class="cta-btn" id="openPackBtn"><i class="fa-solid fa-box-open" style="margin-right:8px;"></i>Open Pack</button>';
        $('openPackBtn').addEventListener('click',startPackOpen);
    } else {
        // Pack opened, still need to pick for today
        cta.innerHTML='<p class="cta-msg" style="color:var(--accent);">Pack opened! Select your 5 props.</p><button class="cta-btn" id="choosePropsBtn"><i class="fa-solid fa-hand-pointer" style="margin-right:8px;"></i>Choose Props</button>';
        $('choosePropsBtn').addEventListener('click',goToSelection);
    }
    
    let ts=0; 
    if(li && pd.pickProps) {
        pd.pickIds.forEach(id => {
            if(getPropStatus(id)==='hit'){
                const p=pd.pickProps.find(x=>x.id===id);
                if(p) ts+=p.points;
            }
        }); 
    }
    
    $('qsDailyScore').textContent=ts; 
    $('qsWeeklyScore').textContent=ts; 
    
    // Fetch actual rank from Firestore
    const rank = await getMyRank();
    $('qsRank').textContent = rank > 0 ? '#' + rank : '--';
}

// Add this new helper function right below renderHome
async function getMyRank() {
    if (!getUserId()) return 0;
    const dk = getTodayKey();
    try {
        const doc = await db.collection('leaderboard').doc(dk).get();
        if (!doc.exists) return 0;
        
        const data = doc.data();
        const entries = Object.keys(data).map(uid => ({
            uid: uid,
            score: data[uid].score
        }));
        
        // Sort highest score to lowest
        entries.sort((a, b) => b.score - a.score);
        
        // Find current user's position
        const index = entries.findIndex(e => e.uid === getUserId());
        return index >= 0 ? index + 1 : 0; // +1 because ranks start at 1
    } catch (e) {
        console.error("Error fetching rank:", e);
        return 0;
    }
}

// ── PACK (3-Click Animation) ──
function startPackOpen() { if(isPicksLocked()){showToast('Picks are locked','var(--miss)');return;} showScreen('packScreen'); var d=new Date(getTodayKey()+'T12:00:00'); $('packDateLabel').textContent=d.toLocaleDateString('en-US',{month:'short',day:'numeric'}).toUpperCase(); var p=$('packEl'); p.classList.add('pack-enter','pack-float'); p.style.transform=''; p.style.opacity=''; $('packTapText').style.opacity='1'; $('packGlow').classList.remove('active'); $('packRays').classList.remove('active'); packClicks = 0; updatePackDots(); }
function updatePackDots() { for(let i=1; i<=3; i++) { const dot = $('packDot'+i); if(dot) dot.classList.toggle('active', i <= packClicks); } }

function handlePackClick() {
    if (packOpening || packClicks >= 3) return;
    packClicks++;
    updatePackDots();
    
    var pack = $('packEl');
    // Use class for quick wiggle, then remove
    pack.classList.remove('wiggle');
    void pack.offsetWidth; // trigger reflow
    pack.classList.add('wiggle');
    
    if (packClicks === 3) {
        packOpening = true;
        $('packTapText').style.opacity = '0';
        setTimeout(startPackOpenSequence, 150); // Very quick transition
    }
}

async function startPackOpenSequence() {
    var pack=$('packEl'), glow=$('packGlow'), rays=$('packRays');
    pack.classList.remove('pack-float', 'wiggle'); 
    glow.classList.add('active'); rays.classList.add('active'); await delay(800);
    createParticleBurst(pack); await delay(400);
    pack.style.transition='all 0.5s ease-in'; pack.style.transform='scale(0.7)'; pack.style.opacity='0'; rays.style.opacity='0'; await delay(500);
    markPackOpened(); // Save state to localStorage
    goToSelection(); 
    packOpening = false;
}

function createParticleBurst(el){var r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,cols=['#c9a227','#e8c84a','#fcd34d','#fff'];for(var i=0;i<40;i++){var p=document.createElement('div');p.className='particle';var a=Math.random()*Math.PI*2,d=80+Math.random()*180,s=3+Math.random()*7,c=cols[Math.floor(Math.random()*cols.length)];p.style.cssText='left:'+cx+'px;top:'+cy+'px;width:'+s+'px;height:'+s+'px;background:'+c+';border-radius:50%;transition:all 0.9s ease-out;opacity:1;';document.body.appendChild(p);(function(e,x,y){requestAnimationFrame(function(){e.style.transform='translate('+x+'px,'+y+'px)';e.style.opacity='0';})})(p,Math.cos(a)*d,Math.sin(a)*d);setTimeout(function(el){return function(){el.remove()}}(p),1000);}}

// ── SELECTION ──
function goToSelection(){if(isPicksLocked()){showToast('Picks are locked','var(--miss)');navTo('home');return;} showScreen('selectionScreen'); selectedProps=[]; document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active')); updateCountdown(); renderSelectionHeader(); renderPropsGrid(); updateSelBar(); }

function renderSelectionHeader() {
    var e = window.DAILY_CONFIG.event;
    $('selEventCard').innerHTML = '<div style="font-family:Oswald;font-weight:700;font-size:22px;color:var(--accent);letter-spacing:1px;">' + e.title + '</div><div style="font-size:13px;color:var(--muted);margin-top:2px;">' + e.subtitle + ' &middot; ' + e.time + '</div>';
}

function renderPropsGrid(){
    var grid=$('propsGrid'), props=window.DAILY_CONFIG.props, teams=window.DAILY_CONFIG.teams;
    grid.innerHTML=props.map(function(prop,i){
        var sel=selectedProps.indexOf(prop.id)>-1?'selected':'';
        var teamColor = teams[prop.team] ? teams[prop.team].color : '#c9a227';
        var teamLabel = prop.team === 'GAME' ? '' : prop.team + ' — ';
        return '<div class="prop-card card-enter '+sel+'" data-id="'+prop.id+'" style="animation-delay:'+Math.min(i*0.03,0.8)+'s; border-color: '+teamColor+';">' +
            '<div class="check-indicator"><i class="fa-solid fa-check" style="font-size:11px;"></i></div>' +
            '<div class="card-sport">BASKETBALL</div>' +
            '<div class="card-points">POINTS: '+prop.points+'</div>' +
            '<div class="card-team-player" style="color:'+teamColor+';">'+teamLabel + prop.player+'</div>' +
            '<div class="card-line">'+prop.line+'</div>' +
        '</div>';
    }).join('');
    grid.querySelectorAll('.prop-card').forEach(function(card){card.addEventListener('click',function(){toggleProp(parseInt(card.dataset.id));});});
}

function toggleProp(id){if(isPicksLocked())return;var idx=selectedProps.indexOf(id);if(idx>-1)selectedProps.splice(idx,1);else{if(selectedProps.length>=5){showToast('Max 5 props','var(--miss)');return;}selectedProps.push(id);}document.querySelectorAll('.prop-card').forEach(function(c){c.classList.toggle('selected',selectedProps.indexOf(parseInt(c.dataset.id))>-1);});updateSelBar();}
function randomSelect(){if(isPicksLocked())return;selectedProps=[];var sh=window.DAILY_CONFIG.props.slice().sort(function(){return Math.random()-0.5;});selectedProps=sh.slice(0,5).map(function(p){return p.id;});document.querySelectorAll('.prop-card').forEach(function(c){c.classList.toggle('selected',selectedProps.indexOf(parseInt(c.dataset.id))>-1);});updateSelBar();showToast('5 random props selected!','var(--accent)');}
function updateSelBar(){var b=$('selBar'),c=selectedProps.length;$('selCount').textContent=c+'/5 Selected';var btn=$('lockInBtn');if(c===5){btn.disabled=false;b.classList.add('show')}else if(c>0){btn.disabled=true;b.classList.add('show')}else{b.classList.remove('show')}}

// ── LOCK IN ──
function openLockInModal(){if(selectedProps.length!==5||isPicksLocked())return;var c=$('lockInPicks'),t=0,teams=window.DAILY_CONFIG.teams;c.innerHTML=selectedProps.map(function(id){var p=window.DAILY_CONFIG.props.find(x=>x.id===id);t+=p.points;var tc=teams[p.team]?teams[p.team].color:'#c9a227';var tl=p.team==='GAME'?'':p.team+' — ';return '<div style="display:flex;align-items:center;gap:8px;padding:8px;border-radius:8px;background:var(--card);border-left:4px solid '+tc+';"><div style="flex:1;"><div style="font-size:11px;color:var(--muted);">'+tl+p.player+'</div><div style="font-size:12px;font-weight:500;">'+p.line+'</div></div><span style="font-family:Oswald;font-weight:700;font-size:14px;color:var(--accent);">POINTS: '+p.points+'</span></div>';}).join('')+'<div style="text-align:right;font-size:14px;font-weight:700;color:var(--accent);margin-top:4px;">Max: '+t+' pts</div>';$('lockInModal').classList.add('active');}
function closeLockInModal(){$('lockInModal').classList.remove('active');}
async function confirmLockIn(){var pickPropData=selectedProps.map(id=>window.DAILY_CONFIG.props.find(p=>p.id===id)).filter(Boolean); await savePicksToDB(selectedProps,pickPropData); closeLockInModal(); spawnConfetti(); showToast('Picks locked in!','var(--hit)'); setTimeout(function(){navTo('picks')},600);}
function spawnConfetti(){var cols=['#c9a227','#e8c84a','#22c55e','#ef4444','#3b82f6'];for(var i=0;i<60;i++){var c=document.createElement('div');c.className='confetti';c.style.cssText='left:'+Math.random()*window.innerWidth+'px;top:-10px;width:'+(5+Math.random()*8)+'px;height:'+(3+Math.random()*5)+'px;background:'+cols[Math.floor(Math.random()*cols.length)]+';border-radius:2px;animation:confettiFall '+(1.5+Math.random()*2)+'s ease-in '+(Math.random()*0.5)+'s forwards;';document.body.appendChild(c);setTimeout(function(el){return function(){el.remove()}}(c),4000);}}

// ── PICKS SCREEN ──
async function renderPicks() { if(!currentPicksDate) currentPicksDate=getTodayKey(); renderDateNav(); await renderPicksForDate(currentPicksDate); }
function renderDateNav() { var days=getWeekDays(), nav=$('dateNav'), tk=getTodayKey(); nav.innerHTML=days.map(function(dk){var d=new Date(dk+'T12:00:00'),dn=d.toLocaleDateString('en-US',{weekday:'short'}),dd=d.getDate(),f=dk>tk,cls='date-pill'; if(dk===currentPicksDate)cls+=' active'; if(f)cls+=' future'; return '<button class="'+cls+'" data-date="'+dk+'"><div class="date-pill-day">'+dn+'</div><div class="date-pill-date">'+dd+'</div></button>';}).join(''); nav.querySelectorAll('.date-pill:not(.future)').forEach(function(btn){btn.addEventListener('click',function(){currentPicksDate=btn.dataset.date;renderPicks();});}); }

async function renderPicksForDate(dateKey) {
    var list=$('picksList'), noMsg=$('noPicksMsg'), evtInfo=$('picksEventInfo'), isToday=dateKey===getTodayKey(), teams=window.DAILY_CONFIG.teams;
    
    // Fetch the picks data for the specific date
    var pd = await getPicksFromDB(dateKey);
    var locked = pd.locked; 
    var picks = pd.pickIds || []; 
    var pp = pd.pickProps || [];

    // If the picks data has an event saved, display it
    if(pd.event){ 
        evtInfo.style.display='block';
        evtInfo.innerHTML='<strong>'+pd.event.title+'</strong> — '+pd.event.subtitle; 
    } else { 
        evtInfo.style.display='none'; 
    }

    // If no locked picks exist for this date
    if(!locked || !picks.length){ 
        list.innerHTML=''; 
        noMsg.style.display='block'; 
        noMsg.querySelector('p').textContent = isToday ? 'No picks yet today.' : 'No picks this day.'; 
        $('picksHitPts').textContent='0'; 
        $('picksPendPts').textContent='0'; 
        $('picksMissPts').textContent='0'; 
        $('picksTotalPts').textContent='0'; 
        return; 
    }

    noMsg.style.display='none'; 
    var hp=0, pep=0, mp=0;

    list.innerHTML = picks.map(function(id, i){
        var prop = pp.find(p => p.id === id); 
        if(!prop) return '';
        var status = getPropStatus(id, dateKey), tc = teams[prop.team] ? teams[prop.team].color : '#c9a227';
        var tl = prop.team === 'GAME' ? '' : prop.team + ' — ';
        var statusHtml='', rc='result-'+status;

        if(status==='hit'){statusHtml='<span class="status-badge status-hit"><i class="fa-solid fa-check"></i> Hit</span>';hp+=prop.points;}
        else if(status==='miss'){statusHtml='<span class="status-badge status-miss"><i class="fa-solid fa-xmark"></i> Miss</span>';mp+=prop.points;}
        else{statusHtml='<span class="status-badge status-pending"><i class="fa-solid fa-clock"></i> Pending</span>';pep+=prop.points;}

        var ptsNote = status==='hit' ? '<div class="pick-pts hit">+'+prop.points+' points</div>' : '';

        return '<div class="pick-card '+rc+' card-enter" style="animation-delay:'+i*0.08+'s;"><div class="pick-meta"><div class="pick-meta-left"><span class="pick-sport-label">BASKETBALL</span><span class="pick-player-label" style="color:'+tc+';">'+tl+prop.player+'</span></div><div class="pick-meta-right"><span class="pick-pts-label">POINTS: '+prop.points+'</span>'+statusHtml+'</div></div><div class="pick-text">'+prop.line+'</div>'+ptsNote+'</div>';
    }).join('');

    $('picksHitPts').textContent=hp; 
    $('picksPendPts').textContent=pep; 
    $('picksMissPts').textContent=mp; 
    $('picksTotalPts').textContent=hp;
}

// ── LEADERBOARD ──
function listenToLeaderboard() { if(lbUnsubscribe)lbUnsubscribe(); const dk=getTodayKey(); lbUnsubscribe=db.collection('leaderboard').doc(dk).onSnapshot((doc)=>{var list=$('lbList'),mc={1:'#fcd34d',2:'#c0c0c0',3:'#cd7f32'},entries=[]; if(doc.exists){const data=doc.data();Object.keys(data).forEach(uid=>{entries.push({name:data[uid].username,score:data[uid].score,isMe:uid===getUserId()});});} entries.sort((a,b)=>b.score-a.score); list.innerHTML=entries.map(function(e,i){var r=i+1,rd=r<=3?'<i class="fa-solid fa-trophy" style="color:'+mc[r]+';font-size:18px;"></i>':'<span style="font-size:14px;font-weight:700;color:var(--muted);">'+r+'</span>';var avC=e.isMe?'var(--accent)':'hsl('+(e.name.charCodeAt(0)*20)+',50%,35%)';return '<div class="lb-row '+(e.isMe?'is-me':'')+'"><div class="lb-rank">'+rd+'</div><div class="lb-avatar" style="background:'+avC+';">'+e.name.substring(0,2).toUpperCase()+'</div><div class="lb-name '+(e.isMe?'me':'')+'">'+e.name+(e.isMe?' (You)':'')+'</div><div><span class="lb-score '+(e.isMe?'me':'')+'">'+e.score+'</span><span class="lb-score-unit">pts</span></div></div>';}).join(''); if(entries.length===0)list.innerHTML='<div class="no-picks-msg"><p>No scores yet today.</p></div>';}); }

// ── INIT ──
auth.onAuthStateChanged(async (user) => {
    if (user) {
        await loadUserProfile(user.uid);
        $('topUserName').textContent = getUsername();
        $('logoutBtn').style.display = 'flex';
        $('topUserBtn').onclick = openProfile;
        currentPicksDate = getTodayKey(); renderHome(); startCountdown();
    } else {
        currentUserProfile = null; $('topUserName').textContent = 'Log In'; $('logoutBtn').style.display = 'none';
        $('topUserBtn').onclick = function() { showAuthModal(false); };
        showAuthModal(false);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    $('authSubmitBtn').addEventListener('click', handleAuthSubmit);
    $('authToggleBtn').addEventListener('click', toggleAuthMode);
    $('logoutBtn').addEventListener('click', handleLogout);
    $('profileCancel').addEventListener('click', function() { $('profileModal').classList.remove('active'); });
    $('profileSave').addEventListener('click', saveProfile);
    $('navHome').addEventListener('click', function() { navTo('home'); });
    $('navPicks').addEventListener('click', function() { navTo('picks'); });
    $('navLb').addEventListener('click', function() { navTo('leaderboard'); });
    $('packEl').addEventListener('click', handlePackClick);
    $('randomBtn').addEventListener('click', randomSelect);
    $('lockInBtn').addEventListener('click', openLockInModal);
    $('lockInCancel').addEventListener('click', closeLockInModal);
    $('lockInConfirm').addEventListener('click', confirmLockIn);
    $('lbTabDaily').addEventListener('click', function() { currentLbTab='daily'; $('lbTabDaily').classList.add('active'); $('lbTabWeekly').classList.remove('active'); listenToLeaderboard(); });
    $('lbTabWeekly').addEventListener('click', function() { currentLbTab='weekly'; $('lbTabWeekly').classList.add('active'); $('lbTabDaily').classList.remove('active'); listenToLeaderboard(); });
});

var cs = document.createElement('style'); cs.textContent = '@keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }'; document.head.appendChild(cs);