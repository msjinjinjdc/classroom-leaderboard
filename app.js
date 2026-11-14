// =========================================================================
// CONFIGURATION & PALETTES (6 CLASSROOM TEAMS + CUSTOMIZABLE REWARDS)
// =========================================================================
const COLOR_PALETTES = {
    brown: { badge: 'bg-amber-900/15 text-amber-950 border-amber-800/30', dot: 'bg-amber-800' },
    green: { badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-600' },
    yellow: { badge: 'bg-yellow-100 text-yellow-900 border-yellow-300', dot: 'bg-yellow-400' },
    white: { badge: 'bg-slate-100 text-slate-800 border-slate-300', dot: 'bg-white border border-slate-400' },
    blue: { badge: 'bg-blue-100 text-blue-800 border-blue-300', dot: 'bg-blue-600' },
    lime: { badge: 'bg-lime-100 text-lime-900 border-lime-300', dot: 'bg-lime-500' }
};

let appConfig = {
    classTitle: "Ms. JinJin's Class Leaderboard",
    adminPin: "1234",
    goalTitle: "Class Milestone: 20 Credits = Ice Cream for Everyone!",
    goalCurrentCredits: 12.5,
    goalTarget: 20,
    enableHouses: true,
    houses: [
        { name: "Brown", color: "brown", icon: "🟤" },
        { name: "Green", color: "green", icon: "🟢" },
        { name: "Yellow", color: "yellow", icon: "🟡" },
        { name: "White", color: "white", icon: "⚪" },
        { name: "Blue", color: "blue", icon: "🔵" },
        { name: "Lime", color: "lime", icon: "🍋" }
    ],
    rewards: [
        { id: 'candy', cost: 5, fullName: 'Candy Treat', icon: '🍬', desc: 'Pick one piece of candy from the classroom treat jar.' },
        { id: 'fruitsnack', cost: 8, fullName: 'Fruit Snack Pack', icon: '🍓', desc: 'Redeem for a pouch of fruit snacks during class.' },
        { id: 'yt45', cost: 10, fullName: '45 Mins YouTube Pass', icon: '📺', desc: 'Watch school-appropriate YouTube during independent work for 45 mins.' },
        { id: 'ytfull', cost: 20, fullName: 'All Class Period YouTube', icon: '🎬', desc: 'Full class period YouTube pass during independent study time.' }
    ],
    defaultAddAmount: 10,
    presetBadges: [
        'Top Helper',
        '3-Week Streak',
        'Lab Leader',
        'Quick Thinker',
        'Peer Mentor',
        'Team Spirit',
        '100% Homework',
        'Focus Pro',
        'Kindness Star',
        'Steady Climber',
        'Fast Finisher'
    ],
    showGoalBar: true,
    showShopTab: true,
    showConfetti: true,
    soundEffects: true
};

// =========================================================================
// APPLICATION STATE & SEED DATA
// =========================================================================
let isAdmin = false;
let currentTab = 'weekly';
let currentHouseFilter = 'ALL';
let weekNumber = 11;
let cheerCount = 0;
let pendingDeleteId = null;
let activeModalStudentId = null;

let students = [
    {
        id: 's1', name: 'Maya L.', avatar: '🦊', house: 'Brown',
        weeklyPoints: 145, allTimePoints: 620,
        badges: ['Top Helper', '3-Week Streak', 'Lab Leader'],
        history: ['Nov 13, 2:15 PM • +15 pts — Led group science lab', 'Nov 12, 10:30 AM • +10 pts — Peer tutoring']
    },
    {
        id: 's2', name: 'Jordan K.', avatar: '🦁', house: 'Green',
        weeklyPoints: 130, allTimePoints: 590,
        badges: ['Quick Thinker', 'Peer Mentor'],
        history: ['Nov 13, 1:40 PM • +10 pts — Solved bonus challenge', 'Nov 11, 3:05 PM • -5 pts — Redeemed 🍬 Candy Treat']
    },
    {
        id: 's3', name: 'Sam R.', avatar: '🐼', house: 'Yellow',
        weeklyPoints: 115, allTimePoints: 510,
        badges: ['Team Spirit'],
        history: ['Nov 13, 11:20 AM • +10 pts — Helped organize supplies', 'Nov 10, 2:50 PM • +5 pts — Active participation']
    },
    {
        id: 's4', name: 'Alex T.', avatar: '🐯', house: 'White',
        weeklyPoints: 95, allTimePoints: 480,
        badges: ['100% Homework'],
        history: ['Nov 12, 9:15 AM • +10 pts — Completed all reading logs']
    },
    {
        id: 's5', name: 'Priya S.', avatar: '🦉', house: 'Blue',
        weeklyPoints: 85, allTimePoints: 445,
        badges: ['Focus Pro', 'Kindness Star'],
        history: ['Nov 13, 10:05 AM • +15 pts — Outstanding presentation']
    },
    {
        id: 's6', name: 'Leo M.', avatar: '🐺', house: 'Lime',
        weeklyPoints: 70, allTimePoints: 390,
        badges: ['Steady Climber'],
        history: ['Nov 11, 1:10 PM • +10 pts — Great teamwork']
    }
];

let hallOfFame = [
    {
        weekLabel: 'Week 10',
        date: '2026-11-06',
        podium: [
            { rank: 1, name: 'Jordan K.', house: 'Green', points: 165 },
            { rank: 2, name: 'Maya L.', house: 'Brown', points: 150 },
            { rank: 3, name: 'Priya S.', house: 'Blue', points: 135 }
        ]
    },
    {
        weekLabel: 'Week 9',
        date: '2026-10-30',
        podium: [
            { rank: 1, name: 'Maya L.', house: 'Brown', points: 170 },
            { rank: 2, name: 'Sam R.', house: 'Yellow', points: 145 },
            { rank: 3, name: 'Alex T.', house: 'White', points: 130 }
        ]
    }
];

// =========================================================================
// UTILITIES (TIMESTAMPS, SOUND, TOASTS, CONFETTI)
// =========================================================================
function formatActivityTimestamp() {
    return new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function showToast(message, color = 'indigo') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const styles = {
        indigo: 'bg-slate-900 text-white border-slate-700',
        emerald: 'bg-emerald-600 text-white border-emerald-500',
        amber: 'bg-amber-500 text-slate-950 border-amber-400',
        rose: 'bg-rose-600 text-white border-rose-500'
    };
    const el = document.createElement('div');
    el.className = `px-4 py-2.5 rounded-2xl border shadow-xl text-xs font-extrabold transition-all duration-300 ${styles[color] || styles.indigo}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(6px)';
        setTimeout(() => el.remove(), 300);
    }, 2600);
}

function playChime(type = 'add') {
    if (!appConfig.soundEffects) return;
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        const notes = type === 'celebrate' ? [523.25, 659.25, 783.99, 1046.5] : type === 'deduct' ? [440, 349.23] : [523.25, 659.25];
        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            gain.gain.setValueAtTime(0.08, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.26);
        });
    } catch (e) { }
}

function triggerCelebration() {
    const maxCheers = students.length;
    if (maxCheers > 0 && cheerCount < maxCheers) {
        cheerCount += 1;
        updateCheerLabel();
    }
    playChime('celebrate');
    if (appConfig.showConfetti && typeof confetti === 'function') {
        confetti({ particleCount: 95, spread: 75, origin: { y: 0.6 } });
    }
    if (cheerCount >= maxCheers && maxCheers > 0) {
        showToast(`All ${maxCheers} students have cheered for the Top 3!`, 'amber');
    } else {
        showToast('Celebrating this week’s Top 3 Podium!', 'amber');
    }
}

function updateCheerLabel() {
    const el = document.getElementById('cheer-counter-label');
    if (!el) return;
    const maxCheers = students.length;
    const capped = Math.min(cheerCount, maxCheers);
    const noun = capped === 1 ? 'person' : 'people';
    el.textContent = `👏 ${capped} / ${maxCheers} ${noun} cheered for the winners!`;
}

// =========================================================================
// RENDERING ENGINE
// =========================================================================
function renderAll() {
    document.getElementById('header-title').textContent = appConfig.classTitle;
    document.getElementById('week-number-label').textContent = weekNumber;
    updateCheerLabel();

    const modePill = document.getElementById('mode-pill');
    const adminBtn = document.getElementById('admin-toggle-btn');
    const adminToolbar = document.getElementById('admin-toolbar');
    const goalEditor = document.getElementById('goal-admin-editor');
    const shopAddBtn = document.getElementById('shop-add-btn');

    if (isAdmin) {
        modePill.textContent = 'Teacher Admin';
        modePill.className = 'px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300';
        adminBtn.innerHTML = '<span>🔓</span> Exit Admin';
        adminBtn.className = 'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-xs transition';
        adminToolbar.classList.remove('hidden');
        goalEditor.classList.remove('hidden');
        if (shopAddBtn) shopAddBtn.classList.remove('hidden');
    } else {
        modePill.textContent = 'Student View';
        modePill.className = 'px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200';
        adminBtn.innerHTML = '<span>🔒</span> Teacher Admin';
        adminBtn.className = 'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-xs transition';
        adminToolbar.classList.add('hidden');
        goalEditor.classList.add('hidden');
        if (shopAddBtn) shopAddBtn.classList.add('hidden');
    }

    const addHouseSelect = document.getElementById('add-house');
    if (addHouseSelect) {
        addHouseSelect.innerHTML = appConfig.houses
            .map(h => `<option value="${escapeHtml(h.name)}">${escapeHtml(h.icon)} Team ${escapeHtml(h.name)}</option>`)
            .join('');
    }

    const goalCard = document.getElementById('goal-card');
    goalCard.classList.toggle('hidden', !appConfig.showGoalBar);
    document.getElementById('goal-title-display').textContent = appConfig.goalTitle;
    document.getElementById('goal-numbers').textContent = `${appConfig.goalCurrentCredits} / ${appConfig.goalTarget} credits`;
    const pct = Math.min(100, Math.max(0, (Number(appConfig.goalCurrentCredits) / Math.max(0.01, Number(appConfig.goalTarget))) * 100));
    document.getElementById('goal-bar-fill').style.width = `${pct}%`;

    if (document.activeElement?.id !== 'inline-goal-title') {
        document.getElementById('inline-goal-title').value = appConfig.goalTitle;
    }
    if (document.activeElement?.id !== 'inline-goal-current') {
        document.getElementById('inline-goal-current').value = appConfig.goalCurrentCredits;
    }
    if (document.activeElement?.id !== 'inline-goal-target') {
        document.getElementById('inline-goal-target').value = appConfig.goalTarget;
    }

    const tabShop = document.getElementById('tab-shop');
    if (tabShop) tabShop.classList.toggle('hidden', !appConfig.showShopTab);
    if (!appConfig.showShopTab && currentTab === 'shop') {
        currentTab = 'weekly';
    }

    const top3 = [...students].sort((a, b) => b.weeklyPoints - a.weeklyPoints).slice(0, 3);
    const podiumMeta = [
        { medal: '🥇 1st Place', ring: 'border-amber-300/60 bg-white/15' },
        { medal: '🥈 2nd Place', ring: 'border-slate-200/40 bg-white/10' },
        { medal: '🥉 3rd Place', ring: 'border-orange-300/40 bg-white/10' }
    ];
    document.getElementById('spotlight-content').innerHTML = top3.map((s, idx) => {
        const houseObj = appConfig.houses.find(h => h.name === s.house);
        const teamLine = (isAdmin && appConfig.enableHouses && houseObj)
            ? `<span class="inline-block mt-1 px-2 py-0.5 rounded-full bg-white/15 text-[11px] font-bold">${escapeHtml(houseObj.icon)} Team ${escapeHtml(s.house)}</span>`
            : '';
        return `
      <div onclick="openStudentModal('${s.id}')" class="cursor-pointer rounded-2xl border ${podiumMeta[idx].ring} p-3.5 backdrop-blur-xs hover:bg-white/20 transition">
        <div class="text-[11px] font-extrabold uppercase tracking-wider text-amber-200">${podiumMeta[idx].medal}</div>
        <div class="mt-1 flex items-center gap-2">
          <span class="text-xl">${s.avatar}</span>
          <span class="font-extrabold text-base truncate">${escapeHtml(s.name)}</span>
        </div>
        <div class="mt-0.5 text-xs font-bold text-indigo-100">${s.weeklyPoints} weekly pts</div>
        ${teamLine}
      </div>
    `;
    }).join('');

    const filterBar = document.getElementById('house-filter-bar');
    if (isAdmin && appConfig.enableHouses && (currentTab === 'weekly' || currentTab === 'allTime')) {
        filterBar.classList.remove('hidden');
        const allBtn = `<button onclick="setHouseFilter('ALL')" class="px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${currentHouseFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}">All Teams</button>`;
        const teamBtns = appConfig.houses.map(h => {
            const active = currentHouseFilter === h.name;
            return `<button onclick="setHouseFilter('${escapeHtml(h.name)}')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${active ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}">${escapeHtml(h.icon)} ${escapeHtml(h.name)}</button>`;
        }).join('');
        filterBar.innerHTML = allBtn + teamBtns;
    } else {
        filterBar.classList.add('hidden');
        currentHouseFilter = 'ALL';
    }

    document.getElementById('view-leaderboard').classList.toggle('hidden', currentTab !== 'weekly' && currentTab !== 'allTime');
    document.getElementById('view-hall').classList.toggle('hidden', currentTab !== 'hall');
    document.getElementById('view-shop').classList.toggle('hidden', currentTab !== 'shop');

    ['weekly', 'allTime', 'hall', 'shop'].forEach(t => {
        const btn = document.getElementById(`tab-${t}`);
        if (!btn) return;
        btn.className = t === currentTab
            ? 'px-3.5 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 text-white shadow-xs transition'
            : 'px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition';
    });

    if (currentTab === 'hall') {
        renderHallOfFame();
    } else if (currentTab === 'shop') {
        renderShop();
    } else {
        renderLeaderboard();
    }
}

function renderLeaderboard() {
    const listEl = document.getElementById('leaderboard-list');
    const houseOrder = appConfig.houses.map(h => h.name);

    let filtered = students.filter(s => {
        if (!isAdmin || !appConfig.enableHouses || currentHouseFilter === 'ALL') return true;
        return s.house === currentHouseFilter;
    });

    if (currentTab === 'allTime') {
        filtered.sort((a, b) => {
            if (isAdmin && appConfig.enableHouses) {
                const diff = houseOrder.indexOf(a.house) - houseOrder.indexOf(b.house);
                if (diff !== 0) return diff;
            }
            return a.name.localeCompare(b.name);
        });
    } else {
        filtered.sort((a, b) => b.weeklyPoints - a.weeklyPoints);
    }

    listEl.innerHTML = filtered.map((s, idx) => {
        const houseObj = appConfig.houses.find(h => h.name === s.house) || appConfig.houses[0];
        const palette = COLOR_PALETTES[houseObj?.color] || COLOR_PALETTES.brown;

        const rankBadge = currentTab === 'weekly'
            ? (idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`)
            : '⭐';

        const teamPillHtml = (isAdmin && appConfig.enableHouses && houseObj)
            ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${palette.badge}">${escapeHtml(houseObj.icon)} ${escapeHtml(s.house)}</span>`
            : '';

        const badgesHtml = (s.badges || []).map(b =>
            `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold">⭐ ${escapeHtml(b)}${isAdmin ? ` <button type="button" onclick="event.stopPropagation(); removeBadgeFromStudent('${s.id}', '${escapeHtml(b)}')" title="Remove badge" class="ml-0.5 text-slate-400 hover:text-rose-600 font-extrabold">✕</button>` : ''}</span>`
        ).join('');

        const badgePresetsHtml = (appConfig.presetBadges || []).map(b =>
            `<option value="${escapeHtml(b)}">⭐ ${escapeHtml(b)}</option>`
        ).join('');

        const badgeAwarderHtml = `
      <div class="inline-flex flex-wrap items-center gap-1.5 bg-amber-50/80 border border-amber-200 rounded-xl p-1">
        <select id="badge-select-${s.id}" onchange="handleBadgeDropdownChange('${s.id}', this.value)"
          class="px-2 py-1 rounded-lg bg-white border border-amber-300 text-xs font-bold text-slate-700 focus:outline-none">
          <option value="">🏅 Award Badge...</option>
          ${badgePresetsHtml}
          <option value="__CUSTOM__">✏️ Custom Badge...</option>
          <option value="__REMOVE_PRESET__">🗑️ Remove Preset Badge...</option>
        </select>
        <input id="badge-custom-${s.id}" type="text" placeholder="Type badge name"
          onkeydown="if(event.key==='Enter'){ event.preventDefault(); awardSelectedBadge('${s.id}'); }"
          class="hidden w-32 px-2 py-1 rounded-lg bg-white border border-amber-300 text-xs font-semibold text-slate-800 focus:outline-none" />
        <select id="badge-remove-select-${s.id}"
          class="hidden px-2 py-1 rounded-lg bg-rose-50 border border-rose-300 text-xs font-bold text-rose-800 focus:outline-none">
          <option value="">Select preset to delete...</option>
          ${badgePresetsHtml}
        </select>
        <button id="badge-action-btn-${s.id}" type="button" onclick="awardSelectedBadge('${s.id}')"
          class="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold transition">
          + Badge
        </button>
      </div>
    `;

        const rewardButtonsHtml = appConfig.rewards.map(r => `
      <button onclick="event.stopPropagation(); applyRewardDeduction('${s.id}', ${r.cost}, '${escapeHtml(r.fullName)}', '${escapeHtml(r.icon)}')"
        class="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-extrabold transition">
        -${r.cost} ${escapeHtml(r.icon)} ${escapeHtml(r.fullName)}
      </button>
    `).join('');

        const teamSelectHtml = appConfig.enableHouses ? `
      <select onclick="event.stopPropagation()" onchange="changeStudentTeam('${s.id}', this.value)"
        class="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700">
        ${appConfig.houses.map(h => `<option value="${escapeHtml(h.name)}" ${h.name === s.house ? 'selected' : ''}>${escapeHtml(h.icon)} ${escapeHtml(h.name)}</option>`).join('')}
      </select>
    ` : '';

        const adminControlsHtml = isAdmin ? `
      <div onclick="event.stopPropagation()" class="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
        <div class="inline-flex items-center gap-1.5 bg-emerald-50/70 border border-emerald-200 rounded-xl p-1">
          <input id="custom-add-${s.id}" type="number" min="1" value="${appConfig.defaultAddAmount}"
            class="w-16 px-2 py-1 rounded-lg bg-white border border-emerald-300 text-xs font-extrabold text-slate-900 focus:outline-none" />
          <button onclick="applyCustomAdd('${s.id}')"
            class="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition">
            + Add
          </button>
        </div>
        <button onclick="applyBrainTeaserAdd('${s.id}')"
          class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-xs transition">
          +2 🧠 Brain Teaser
        </button>
        <button onclick="applyDailyGoodStudentAdd('${s.id}')"
          class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-xs transition">
          +1 🌟 Daily good student reward point
        </button>
        <div class="flex flex-wrap items-center gap-1.5">
          ${rewardButtonsHtml}
        </div>
        ${badgeAwarderHtml}
        <div class="ml-auto flex items-center gap-1.5">
          ${teamSelectHtml}
          <button onclick="openDeleteModal('${s.id}')" title="Remove student"
            class="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 text-xs font-bold transition">
            🗑️
          </button>
        </div>
      </div>
    ` : '';

        const primaryPts = currentTab === 'allTime' ? s.allTimePoints : s.weeklyPoints;
        const secondaryLabel = currentTab === 'allTime' ? `${s.weeklyPoints} this week` : `${s.allTimePoints} all-time`;

        return `
      <div onclick="openStudentModal('${s.id}')" class="cursor-pointer rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 p-4 shadow-xs transition">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-extrabold text-sm text-slate-700 shrink-0">
              ${rankBadge}
            </div>
            <div class="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl shrink-0">
              ${s.avatar}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-extrabold text-sm sm:text-base text-slate-900 truncate">${escapeHtml(s.name)}</span>
                ${teamPillHtml}
              </div>
              <div class="flex items-center gap-1.5 flex-wrap mt-1">
                ${badgesHtml || `<span class="text-xs text-slate-400 truncate">${escapeHtml(s.history?.[0] || '')}</span>`}
              </div>
            </div>
          </div>

          <div class="text-right shrink-0">
            <div class="text-lg sm:text-xl font-extrabold text-indigo-600">${primaryPts} <span class="text-xs font-bold text-slate-400">pts</span></div>
            <div class="text-[11px] font-semibold text-slate-400">${secondaryLabel}</div>
          </div>
        </div>
        ${adminControlsHtml}
      </div>
    `;
    }).join('');
}

function renderHallOfFame() {
    const grid = document.getElementById('hall-grid');
    if (!hallOfFame.length) {
        grid.innerHTML = `<div class="col-span-full rounded-2xl bg-white border border-slate-200 p-8 text-center text-sm text-slate-500">No weekly podiums archived yet. Click <strong>Crown Top 3 & Reset Week</strong> in Teacher Admin mode at the end of the week!</div>`;
        return;
    }

    const rankStyles = {
        1: { label: '🥇 1st Place', card: 'bg-amber-50/90 border-amber-200 text-amber-950' },
        2: { label: '🥈 2nd Place', card: 'bg-slate-50 border-slate-200 text-slate-900' },
        3: { label: '🥉 3rd Place', card: 'bg-orange-50/70 border-orange-200 text-orange-950' }
    };

    grid.innerHTML = hallOfFame.map(entry => {
        const podiumRows = (entry.podium || []).map(p => {
            const st = rankStyles[p.rank] || rankStyles[3];
            const teamTag = (isAdmin && appConfig.enableHouses && p.house)
                ? `<span class="ml-1.5 text-[11px] font-bold opacity-75">• Team ${escapeHtml(p.house)}</span>`
                : '';
            return `
        <div class="flex items-center justify-between px-3.5 py-2.5 rounded-xl border ${st.card}">
          <div>
            <span class="text-xs font-extrabold mr-2">${st.label}</span>
            <span class="text-sm font-extrabold">${escapeHtml(p.name)}</span>
            ${teamTag}
          </div>
          <span class="text-xs font-extrabold">${p.points} pts</span>
        </div>
      `;
        }).join('');

        return `
      <div class="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-base font-extrabold text-slate-900">🏆 ${escapeHtml(entry.weekLabel)}</span>
          <span class="text-xs font-semibold text-slate-400">${escapeHtml(entry.date)}</span>
        </div>
        <div class="space-y-2">${podiumRows}</div>
      </div>
    `;
    }).join('');
}

function renderShop() {
    const grid = document.getElementById('shop-grid');
    const countBadge = document.getElementById('shop-count-badge');
    if (countBadge) {
        countBadge.textContent = `${appConfig.rewards.length} Active Classroom Reward${appConfig.rewards.length === 1 ? '' : 's'}`;
    }

    grid.innerHTML = appConfig.rewards.map((r, idx) => {
        if (isAdmin) {
            return `
        <div class="rounded-2xl bg-white border-2 border-indigo-200 p-4 shadow-xs space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">Reward #${idx + 1}</span>
            <button onclick="removeRewardItem(${idx})" class="text-xs font-bold text-rose-600 hover:text-rose-800">✕ Remove</button>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 mb-0.5">Icon</label>
              <input type="text" value="${escapeHtml(r.icon)}" oninput="updateRewardField(${idx}, 'icon', this.value)"
                class="w-full px-2 py-1.5 rounded-xl border border-slate-300 text-center text-sm font-bold" />
            </div>
            <div class="col-span-2">
              <label class="block text-[10px] font-bold text-slate-400 mb-0.5">Point Cost</label>
              <input type="number" min="1" value="${r.cost}" oninput="updateRewardField(${idx}, 'cost', this.value)"
                class="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-extrabold" />
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 mb-0.5">Reward Name</label>
            <input type="text" value="${escapeHtml(r.fullName)}" oninput="updateRewardField(${idx}, 'fullName', this.value)"
              class="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-extrabold" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 mb-0.5">Description</label>
            <textarea rows="2" oninput="updateRewardField(${idx}, 'desc', this.value)"
              class="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs">${escapeHtml(r.desc)}</textarea>
          </div>
        </div>
      `;
        }

        return `
      <div class="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-3xl">${escapeHtml(r.icon)}</span>
            <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold">-${r.cost} pts</span>
          </div>
          <h3 class="text-base font-extrabold text-slate-900">${escapeHtml(r.fullName)}</h3>
          <p class="text-xs text-slate-500 leading-relaxed">${escapeHtml(r.desc)}</p>
        </div>
        <div class="pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-400">
          Deducts from All-Time Points only
        </div>
      </div>
    `;
    }).join('');
}

// =========================================================================
// NAVIGATION & STUDENT / ADMIN ACTIONS
// =========================================================================
function switchTab(tab) {
    currentTab = tab;
    renderAll();
}

function setHouseFilter(house) {
    currentHouseFilter = house;
    renderAll();
}

function updateInlineMilestone() {
    appConfig.goalTitle = document.getElementById('inline-goal-title').value || 'Class Milestone';
    appConfig.goalCurrentCredits = Math.max(0, Number(document.getElementById('inline-goal-current').value) || 0);
    appConfig.goalTarget = Math.max(0.01, Number(document.getElementById('inline-goal-target').value) || 100);
    renderAll();
}

function updateRewardField(idx, field, value) {
    if (!appConfig.rewards[idx]) return;
    if (field === 'cost') {
        appConfig.rewards[idx].cost = Math.max(1, Number(value) || 1);
    } else {
        appConfig.rewards[idx][field] = value;
    }
    renderLeaderboard();
    renderStudioRewards();
}

function addRewardItem() {
    appConfig.rewards.push({
        id: 'rw_' + Date.now(),
        cost: 5,
        fullName: 'New Classroom Reward',
        icon: '🎟️',
        desc: 'Describe this reward for your students.'
    });
    renderAll();
    showToast('Added new reward item!', 'emerald');
}

function removeRewardItem(idx) {
    if (appConfig.rewards.length <= 1) {
        showToast('Keep at least one reward item in the menu.', 'rose');
        return;
    }
    appConfig.rewards.splice(idx, 1);
    renderAll();
    showToast('Removed reward item.', 'amber');
}

function applyCustomAdd(studentId) {
    const input = document.getElementById(`custom-add-${studentId}`);
    const delta = Math.max(1, Number(input?.value) || appConfig.defaultAddAmount);
    const s = students.find(st => st.id === studentId);
    if (!s) return;

    s.weeklyPoints += delta;
    s.allTimePoints += delta;
    s.history.unshift(`${formatActivityTimestamp()} • +${delta} pts awarded`);
    playChime('add');
    showToast(`+${delta} pts awarded to ${s.name}!`, 'emerald');
    renderAll();
}

function applyBrainTeaserAdd(studentId) {
    const s = students.find(st => st.id === studentId);
    if (!s) return;

    s.allTimePoints += 2;
    s.history.unshift(`${formatActivityTimestamp()} • +2 All-Time pts — 🧠 Brain Teaser`);
    playChime('add');
    showToast(`+2 All-Time pts (Brain Teaser) awarded to ${s.name}!`, 'emerald');
    renderAll();
}

function applyDailyGoodStudentAdd(studentId) {
    const s = students.find(st => st.id === studentId);
    if (!s) return;

    s.allTimePoints += 1;
    s.history.unshift(`${formatActivityTimestamp()} • +1 All-Time pt — 🌟 Daily good student reward point`);
    playChime('add');
    showToast(`+1 All-Time pt (Daily good student reward point) awarded to ${s.name}!`, 'emerald');
    renderAll();
}

function applyRewardDeduction(studentId, cost, rewardName, icon) {
    const s = students.find(st => st.id === studentId);
    if (!s) return;
    if (s.allTimePoints < cost) {
        showToast(`${s.name} needs ${cost} All-Time pts (has ${s.allTimePoints}).`, 'rose');
        return;
    }
    s.allTimePoints = Math.max(0, s.allTimePoints - cost);
    s.history.unshift(`${formatActivityTimestamp()} • -${cost} All-Time pts — Redeemed ${icon} ${rewardName}`);
    playChime('deduct');
    showToast(`${s.name} redeemed ${icon} ${rewardName} (-${cost} All-Time pts)`, 'amber');
    renderAll();
}

function changeStudentTeam(studentId, newHouse) {
    const s = students.find(st => st.id === studentId);
    if (!s) return;
    s.house = newHouse;
    s.history.unshift(`${formatActivityTimestamp()} • Reassigned to Team ${newHouse}`);
    showToast(`Moved ${s.name} to Team ${newHouse}`, 'indigo');
    renderAll();
}

function handleBadgeDropdownChange(studentId, val) {
    const customInput = document.getElementById(`badge-custom-${studentId}`);
    const removeSelect = document.getElementById(`badge-remove-select-${studentId}`);
    const actionBtn = document.getElementById(`badge-action-btn-${studentId}`);
    if (!customInput || !removeSelect || !actionBtn) return;

    customInput.classList.add('hidden');
    removeSelect.classList.add('hidden');

    if (val === '__CUSTOM__') {
        customInput.classList.remove('hidden');
        customInput.focus();
        actionBtn.textContent = '+ Badge';
        actionBtn.className = 'px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold transition';
    } else if (val === '__REMOVE_PRESET__') {
        removeSelect.classList.remove('hidden');
        removeSelect.focus();
        actionBtn.textContent = 'Remove Preset';
        actionBtn.className = 'px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition';
    } else {
        customInput.value = '';
        actionBtn.textContent = '+ Badge';
        actionBtn.className = 'px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold transition';
    }
}

function awardSelectedBadge(studentId) {
    const selectEl = document.getElementById(`badge-select-${studentId}`);
    const customInput = document.getElementById(`badge-custom-${studentId}`);
    const removeSelect = document.getElementById(`badge-remove-select-${studentId}`);
    if (!selectEl) return;

    if (selectEl.value === '__REMOVE_PRESET__') {
        const presetToDelete = (removeSelect?.value || '').trim();
        if (!presetToDelete) {
            showToast('Choose which preset badge to remove from the dropdown.', 'amber');
            return;
        }
        removePresetBadge(presetToDelete);
        return;
    }

    let badgeName = selectEl.value === '__CUSTOM__'
        ? (customInput?.value || '').trim()
        : (selectEl.value || '').trim();

    if (!badgeName) {
        showToast('Choose a preset badge or type a custom badge name first.', 'amber');
        return;
    }

    awardBadgeToStudent(studentId, badgeName);
    selectEl.value = '';
    if (customInput) {
        customInput.value = '';
        customInput.classList.add('hidden');
    }
}

function removePresetBadge(badgeName) {
    const target = String(badgeName || '').trim();
    if (!target) return;
    appConfig.presetBadges = (appConfig.presetBadges || []).filter(b => b !== target);
    renderAll();
    showToast(`Removed "${target}" from preset badge menu.`, 'rose');
}


function awardBadgeToStudent(studentId, rawBadge) {
    const s = students.find(st => st.id === studentId);
    const badge = String(rawBadge || '').trim();
    if (!s || !badge) return;

    s.badges = s.badges || [];
    if (s.badges.some(b => b.toLowerCase() === badge.toLowerCase())) {
        showToast(`${s.name} already has the "${badge}" badge!`, 'amber');
        return;
    }

    s.badges.push(badge);
    if (!(appConfig.presetBadges || []).some(b => b.toLowerCase() === badge.toLowerCase())) {
        appConfig.presetBadges = [...(appConfig.presetBadges || []), badge];
    }
    s.history.unshift(`${formatActivityTimestamp()} • 🏅 Earned badge: ${badge}`);
    playChime('add');
    showToast(`Awarded ⭐ ${badge} to ${s.name}!`, 'emerald');
    renderAll();
    if (activeModalStudentId === studentId) openStudentModal(studentId);
}

function removeBadgeFromStudent(studentId, badgeName) {
    const s = students.find(st => st.id === studentId);
    if (!s) return;
    s.badges = (s.badges || []).filter(b => b !== badgeName);
    s.history.unshift(`${formatActivityTimestamp()} • Removed badge: ${badgeName}`);
    showToast(`Removed "${badgeName}" from ${s.name}.`, 'rose');
    renderAll();
    if (activeModalStudentId === studentId) openStudentModal(studentId);
}

function handleAddStudent(e) {
    e.preventDefault();
    const nameInput = document.getElementById('add-name');
    const houseInput = document.getElementById('add-house');
    const badgeInput = document.getElementById('add-badge');

    const name = nameInput.value.trim();
    if (!name) return;
    const avatars = ['🦊', '🦁', '🐼', '🐯', '🦉', '🐺', '🐨', '🦄', '🐸', '🐧'];
    const badge = badgeInput.value.trim();

    students.push({
        id: 's' + Date.now(),
        name,
        avatar: avatars[students.length % avatars.length],
        house: houseInput.value || appConfig.houses[0]?.name || 'Brown',
        weeklyPoints: 0,
        allTimePoints: 0,
        badges: badge ? [badge] : [],
        history: [`${formatActivityTimestamp()} • Joined the classroom leaderboard`]
    });

    nameInput.value = '';
    badgeInput.value = '';
    playChime('add');
    showToast(`Added ${name} to the leaderboard!`, 'emerald');
    renderAll();
}

function handleAdminToggle() {
    if (isAdmin) {
        isAdmin = false;
        showToast('Switched to Student View.', 'indigo');
        renderAll();
        return;
    }
    document.getElementById('pin-input').value = '';
    document.getElementById('pin-error').classList.add('hidden');
    document.getElementById('pin-modal').classList.remove('hidden');
    setTimeout(() => document.getElementById('pin-input').focus(), 50);
}

function closePinModal() {
    document.getElementById('pin-modal').classList.add('hidden');
}

function submitPinUnlock(e) {
    e.preventDefault();
    const val = document.getElementById('pin-input').value.trim();
    if (val === String(appConfig.adminPin)) {
        unlockAdminSuccess();
    } else {
        document.getElementById('pin-error').classList.remove('hidden');
    }
}

function instantDemoUnlock() {
    unlockAdminSuccess();
}

function unlockAdminSuccess() {
    isAdmin = true;
    closePinModal();
    showToast('Teacher Admin Mode Unlocked!', 'amber');
    renderAll();
}

function openResetConfirmModal() {
    const top3 = [...students].sort((a, b) => b.weeklyPoints - a.weeklyPoints).slice(0, 3);
    const summary = top3.map((s, i) => `<strong>#${i + 1} ${escapeHtml(s.name)}</strong> (${s.weeklyPoints} pts)`).join(', ');
    document.getElementById('reset-modal-body').innerHTML =
        `This will archive Week ${weekNumber}’s podium (${summary}) into the <strong>Hall of Fame</strong>, reset all students’ <strong>Weekly Points</strong> to 0, and clear the weekly cheer counter.`;
    document.getElementById('reset-modal').classList.remove('hidden');
}

function closeResetConfirmModal() {
    document.getElementById('reset-modal').classList.add('hidden');
}

function executeCrownAndReset() {
    const top3 = [...students].sort((a, b) => b.weeklyPoints - a.weeklyPoints).slice(0, 3);
    const stamp = formatActivityTimestamp();
    const today = new Date().toISOString().slice(0, 10);

    if (top3.length > 0) {
        hallOfFame.unshift({
            weekLabel: `Week ${weekNumber}`,
            date: today,
            podium: top3.map((s, idx) => ({
                rank: idx + 1,
                name: s.name,
                house: s.house,
                points: s.weeklyPoints
            }))
        });
    }

    students.forEach(s => {
        s.weeklyPoints = 0;
        s.history.unshift(`${stamp} • Weekly points reset for Week ${weekNumber + 1}`);
    });

    cheerCount = 0;
    weekNumber += 1;
    closeResetConfirmModal();
    playChime('celebrate');
    if (appConfig.showConfetti && typeof confetti === 'function') {
        confetti({ particleCount: 95, spread: 75, origin: { y: 0.6 } });
    }
    showToast(`Week ${weekNumber - 1} Top 3 crowned! Weekly points & cheers reset.`, 'amber');
    renderAll();
}

function openDeleteModal(studentId) {
    const s = students.find(st => st.id === studentId);
    if (!s) return;
    pendingDeleteId = studentId;
    document.getElementById('delete-modal-body').innerHTML =
        `Are you sure you want to remove <strong>${escapeHtml(s.name)}</strong> from the leaderboard? This action cannot be undone.`;
    document.getElementById('delete-modal').classList.remove('hidden');
}

function closeDeleteModal() {
    pendingDeleteId = null;
    document.getElementById('delete-modal').classList.add('hidden');
}

function executeDeleteStudent() {
    if (!pendingDeleteId) return;
    const target = students.find(st => st.id === pendingDeleteId);
    students = students.filter(st => st.id !== pendingDeleteId);
    if (cheerCount > students.length) cheerCount = students.length;
    closeDeleteModal();
    if (target) showToast(`Removed ${target.name} from the class.`, 'rose');
    renderAll();
}

function openStudentModal(studentId) {
    const s = students.find(st => st.id === studentId);
    if (!s) return;
    activeModalStudentId = studentId;
    document.getElementById('modal-avatar').textContent = s.avatar;
    document.getElementById('modal-name').textContent = s.name;

    const houseBadge = document.getElementById('modal-house-badge');
    const houseObj = appConfig.houses.find(h => h.name === s.house);
    if (isAdmin && appConfig.enableHouses && houseObj) {
        const palette = COLOR_PALETTES[houseObj.color] || COLOR_PALETTES.brown;
        houseBadge.className = `inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${palette.badge}`;
        houseBadge.textContent = `${houseObj.icon} Team ${s.house}`;
        houseBadge.classList.remove('hidden');
    } else {
        houseBadge.classList.add('hidden');
    }

    document.getElementById('modal-weekly').textContent = `${s.weeklyPoints} pts`;
    document.getElementById('modal-alltime').textContent = `${s.allTimePoints} pts`;

    document.getElementById('modal-badges').innerHTML = (s.badges && s.badges.length)
        ? s.badges.map(b => `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">⭐ ${escapeHtml(b)}${isAdmin ? ` <button type="button" onclick="removeBadgeFromStudent('${s.id}', '${escapeHtml(b)}')" title="Remove badge" class="ml-1 text-amber-700 hover:text-rose-600 font-extrabold">✕</button>` : ''}</span>`).join('')
        : `<span class="text-xs text-slate-400">No badges earned yet.</span>`;

    const modalAwarder = document.getElementById('modal-badge-awarder');
    if (modalAwarder) {
        if (isAdmin) {
            modalAwarder.classList.remove('hidden');
            modalAwarder.innerHTML = `
        <select id="modal-badge-select" onchange="const inp=document.getElementById('modal-badge-custom'); if(this.value==='__CUSTOM__'){inp.classList.remove('hidden');inp.focus();}else{inp.classList.add('hidden');inp.value='';}"
          class="px-2.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50/60 text-xs font-bold text-slate-800">
          <option value="">🏅 Select preset badge...</option>
          ${(appConfig.presetBadges || []).map(b => `<option value="${escapeHtml(b)}">⭐ ${escapeHtml(b)}</option>`).join('')}
          <option value="__CUSTOM__">✏️ Custom Badge...</option>
        </select>
        <input id="modal-badge-custom" type="text" placeholder="Custom badge name"
          onkeydown="if(event.key==='Enter'){ event.preventDefault(); const v=this.value.trim(); if(v) awardBadgeToStudent('${s.id}', v); }"
          class="hidden px-2.5 py-1.5 rounded-xl border border-amber-300 text-xs font-semibold" />
        <button type="button" onclick="const sel=document.getElementById('modal-badge-select'); const inp=document.getElementById('modal-badge-custom'); const val=sel.value==='__CUSTOM__'?inp.value:sel.value; if(val.trim()) awardBadgeToStudent('${s.id}', val);"
          class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold transition">
          + Award Badge
        </button>
      `;
        } else {
            modalAwarder.classList.add('hidden');
            modalAwarder.innerHTML = '';
        }
    }

    document.getElementById('modal-history').innerHTML = (s.history && s.history.length)
        ? s.history.map(item => `<div class="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">${escapeHtml(item)}</div>`).join('')
        : `<div class="text-xs text-slate-400">No recent activity recorded.</div>`;

    document.getElementById('student-modal').classList.remove('hidden');
}

function closeStudentModal() {
    activeModalStudentId = null;
    document.getElementById('student-modal').classList.add('hidden');
}



// Boot
renderAll();
