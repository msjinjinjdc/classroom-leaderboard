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
    renderStudioRewards();
    showToast('Added new reward item!', 'emerald');
}

function removeRewardItem(idx) {
    if (appConfig.rewards.length <= 1) {
        showToast('Keep at least one reward item in the menu.', 'rose');
        return;
    }
    appConfig.rewards.splice(idx, 1);
    renderAll();
    renderStudioRewards();
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
    renderStudioPresetBadges();
    showToast(`Removed "${target}" from preset badge menu.`, 'rose');
}

function addPresetBadgeFromStudio() {
    const input = document.getElementById('cfg-new-preset-badge');
    const val = (input?.value || '').trim();
    if (!val) return;
    if (!(appConfig.presetBadges || []).some(b => b.toLowerCase() === val.toLowerCase())) {
        appConfig.presetBadges = [...(appConfig.presetBadges || []), val];
    }
    input.value = '';
    renderAll();
    renderStudioPresetBadges();
    showToast(`Added "${val}" to preset badge menu!`, 'emerald');
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

function openStudio() {
    document.getElementById('cfg-title').value = appConfig.classTitle;
    document.getElementById('cfg-pin').value = appConfig.adminPin;
    document.getElementById('cfg-goal-title').value = appConfig.goalTitle;
    document.getElementById('cfg-goal-target').value = appConfig.goalTarget;
    document.getElementById('cfg-enable-houses').checked = appConfig.enableHouses;
    document.getElementById('cfg-default-add').value = appConfig.defaultAddAmount;
    document.getElementById('cfg-show-goal').checked = appConfig.showGoalBar;
    document.getElementById('cfg-show-shop').checked = appConfig.showShopTab;
    document.getElementById('cfg-show-confetti').checked = appConfig.showConfetti;
    document.getElementById('cfg-sound').checked = appConfig.soundEffects;

    renderStudioHouses();
    renderStudioRewards();
    renderStudioPresetBadges();
    document.getElementById('studio-drawer').classList.remove('hidden');
}

function closeStudio() {
    document.getElementById('studio-drawer').classList.add('hidden');
}

function renderStudioHouses() {
    const container = document.getElementById('cfg-houses-container');
    container.innerHTML = appConfig.houses.map((h, i) => `
    <div class="grid grid-cols-12 gap-2 items-center">
      <input type="text" value="${escapeHtml(h.icon)}" oninput="updateStudioHouse(${i}, 'icon', this.value)"
        class="col-span-2 px-2 py-1.5 rounded-xl border border-slate-300 text-center text-xs font-bold" />
      <input type="text" value="${escapeHtml(h.name)}" oninput="updateStudioHouse(${i}, 'name', this.value)"
        class="col-span-6 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold" />
      <select onchange="updateStudioHouse(${i}, 'color', this.value)"
        class="col-span-4 px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold">
        ${Object.keys(COLOR_PALETTES).map(c => `<option value="${c}" ${h.color === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
    </div>
  `).join('');
}

function renderStudioRewards() {
    const container = document.getElementById('cfg-rewards-container');
    if (!container) return;
    container.innerHTML = appConfig.rewards.map((r, i) => `
    <div class="rounded-xl border border-slate-200 p-3 bg-slate-50/70 space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-extrabold text-slate-500">Reward #${i + 1}</span>
        <button type="button" onclick="removeRewardItem(${i})" class="text-[11px] font-bold text-rose-600 hover:underline">Remove</button>
      </div>
      <div class="grid grid-cols-12 gap-2">
        <input type="text" value="${escapeHtml(r.icon)}" oninput="updateRewardField(${i}, 'icon', this.value)"
          class="col-span-2 px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-center text-xs font-bold" />
        <input type="text" value="${escapeHtml(r.fullName)}" oninput="updateRewardField(${i}, 'fullName', this.value)"
          class="col-span-7 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold" />
        <input type="number" min="1" value="${r.cost}" oninput="updateRewardField(${i}, 'cost', this.value)"
          class="col-span-3 px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-extrabold" />
      </div>
      <input type="text" value="${escapeHtml(r.desc)}" oninput="updateRewardField(${i}, 'desc', this.value)"
        class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs" />
    </div>
  `).join('');
}

function renderStudioPresetBadges() {
    const container = document.getElementById('cfg-preset-badges-container');
    if (!container) return;
    const list = appConfig.presetBadges || [];
    if (!list.length) {
        container.innerHTML = `<span class="text-xs text-slate-400">No preset badges configured. Add one above!</span>`;
        return;
    }
    container.innerHTML = list.map(b => `
    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-bold">
      ⭐ ${escapeHtml(b)}
      <button type="button" onclick="removePresetBadge('${escapeHtml(b)}')" title="Delete preset badge" class="text-amber-700 hover:text-rose-600 font-extrabold">✕</button>
    </span>
  `).join('');
}

function updateStudioHouse(idx, field, val) {
    const oldName = appConfig.houses[idx].name;
    appConfig.houses[idx][field] = val;
    if (field === 'name' && oldName !== val) {
        students.forEach(s => { if (s.house === oldName) s.house = val; });
    }
    renderAll();
}

function updateConfigLive() {
    appConfig.classTitle = document.getElementById('cfg-title').value || 'Classroom Leaderboard';
    appConfig.adminPin = document.getElementById('cfg-pin').value || '1234';
    appConfig.goalTitle = document.getElementById('cfg-goal-title').value || 'Class Milestone';
    appConfig.goalTarget = Math.max(0.01, Number(document.getElementById('cfg-goal-target').value) || 100);
    appConfig.enableHouses = document.getElementById('cfg-enable-houses').checked;
    appConfig.defaultAddAmount = Math.max(1, Number(document.getElementById('cfg-default-add').value) || 10);
    appConfig.showGoalBar = document.getElementById('cfg-show-goal').checked;
    appConfig.showShopTab = document.getElementById('cfg-show-shop').checked;
    appConfig.showConfetti = document.getElementById('cfg-show-confetti').checked;
    appConfig.soundEffects = document.getElementById('cfg-sound').checked;
    renderAll();
}

function triggerTextDownload(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function downloadConfiguredFiles() {
    const cfgJson = JSON.stringify(appConfig, null, 2);

    const exportedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(appConfig.classTitle)}</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"><\/script>
  <link rel="stylesheet" href="style.css" />
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen">
  <header class="bg-white border-b border-slate-200 sticky top-0 z-30">
    <div class="max-w-5xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="font-extrabold text-lg">${escapeHtml(appConfig.classTitle)}</h1>
          <span id="liveBadge" class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-extrabold">Connecting...</span>
        </div>
        <p id="syncStatus" class="text-xs text-slate-500">Initializing Supabase real-time connection...</p>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="loadData()" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold">↻ Sync</button>
        <button id="adminBtn" onclick="toggleAdmin()" class="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-extrabold">🔒 Teacher Admin</button>
      </div>
    </div>
  </header>

  <main class="max-w-5xl mx-auto px-4 py-6 space-y-5">
    <section class="podium-banner rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white p-6 shadow-md">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span class="px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 text-xs font-extrabold uppercase">👑 Weekly Top 3 Podium • Week <span id="wkNum">11</span></span>
        <div class="flex flex-col items-end gap-1">
          <button onclick="sendCheer()" class="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs transition active:scale-95">🎉 Celebrate Top 3</button>
          <span id="cheerLabel" class="text-[11px] font-bold text-amber-200">👏 0 / 0 people cheered for the winners!</span>
        </div>
      </div>
      <div id="podiumGrid" class="grid grid-cols-1 sm:grid-cols-3 gap-3"></div>
    </section>

    <section id="milestoneCard" class="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5">
      <div class="flex items-center justify-between text-xs font-extrabold">
        <span id="msTitle">${escapeHtml(appConfig.goalTitle)}</span>
        <span id="msNumbers" class="text-indigo-600">${appConfig.goalCurrentCredits} / ${appConfig.goalTarget} credits</span>
      </div>
      <div class="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <div id="msFill" class="h-full bg-indigo-600 transition-all" style="width:${Math.min(100, (appConfig.goalCurrentCredits / appConfig.goalTarget) * 100)}%"></div>
      </div>
      <div id="msEditor" class="hidden pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-5 gap-2">
        <input id="msEditTitle" type="text" value="${escapeHtml(appConfig.goalTitle)}" class="sm:col-span-2 px-2.5 py-1.5 rounded-xl border text-xs font-bold" />
        <input id="msEditCurr" type="number" step="any" value="${appConfig.goalCurrentCredits}" placeholder="Earned" class="px-2.5 py-1.5 rounded-xl border text-xs font-bold" />
        <input id="msEditTarget" type="number" step="any" min="0.01" value="${appConfig.goalTarget}" placeholder="Target" class="px-2.5 py-1.5 rounded-xl border text-xs font-bold" />
        <button onclick="saveMilestone()" class="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-extrabold">Save Credits</button>
      </div>
    </section>

    <section id="adminBar" class="hidden rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="text-xs font-extrabold text-amber-900">Teacher Admin Controls</span>
        <button onclick="crownAndReset()" class="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-extrabold">👑 Crown Top 3 & Reset Week</button>
      </div>
      <form onsubmit="addStudent(event)" class="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <input id="newName" required placeholder="Student Name" class="px-3 py-2 rounded-xl border bg-white text-xs" />
        <select id="newHouse" class="px-3 py-2 rounded-xl border bg-white text-xs">
          ${appConfig.houses.map(h => `<option value="${escapeHtml(h.name)}">${escapeHtml(h.icon)} ${escapeHtml(h.name)}</option>`).join('')}
        </select>
        <input id="newBadge" placeholder="Starting badge (optional)" class="px-3 py-2 rounded-xl border bg-white text-xs" />
        <button type="submit" class="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-extrabold">+ Add Student</button>
      </form>
    </section>

    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="inline-flex rounded-xl bg-white p-1 border border-slate-200 gap-1">
        <button id="tWeekly" onclick="setTab('weekly')" class="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-extrabold">Weekly Standings</button>
        <button id="tAll" onclick="setTab('allTime')" class="px-3 py-1.5 rounded-lg text-slate-600 text-xs font-bold">All-Time Points</button>
        <button id="tHall" onclick="setTab('hall')" class="px-3 py-1.5 rounded-lg text-slate-600 text-xs font-bold">🏅 Hall of Fame</button>
        <button id="tShop" onclick="setTab('shop')" class="px-3 py-1.5 rounded-lg text-slate-600 text-xs font-bold">🎁 Reward Menu</button>
      </div>
    </div>

    <div id="boardList" class="space-y-2.5"></div>
    <div id="hallList" class="hidden grid grid-cols-1 md:grid-cols-2 gap-4"></div>
    <div id="shopList" class="hidden space-y-3"></div>
  </main>

  <script src="app.js"><\/script>
</body>
</html>`;

    const exportedCss = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
}

@keyframes floatSlow {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
}

.animate-float {
  animation: floatSlow 3s ease-in-out infinite;
}

.podium-banner {
  position: relative;
  overflow: hidden;
}

#boardList > div {
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

#boardList > div:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
}
`;

    const exportedJs = `const SUPABASE_URL = "PASTE_YOUR_SUPABASE_PROJECT_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE";

const CFG = ${cfgJson};
let sb = null;
let students = [], winners = [], tab = 'weekly', isAdmin = false, cheers = 0, weekNum = 11;

function stamp() {
  return new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

async function initSupabase() {
  const badge = document.getElementById('liveBadge');
  const status = document.getElementById('syncStatus');
  if (SUPABASE_URL.includes('PASTE_YOUR') || SUPABASE_ANON_KEY.includes('PASTE_YOUR')) {
    badge.textContent = 'Setup Needed';
    badge.className = 'px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold';
    status.textContent = '⚠️ Open app.js and paste your Supabase Project URL and Publishable Key';
    return;
  }

  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  await loadData();

  sb.channel('classroom-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => loadData())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'hall_of_fame' }, () => loadData())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'class_settings' }, () => loadData())
    .subscribe((state) => {
      if (state === 'SUBSCRIBED') {
        badge.textContent = '● Live Sync';
        badge.className = 'px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold';
      }
    });
}

async function loadData() {
  if (!sb) return;
  const [sRes, wRes, cRes] = await Promise.all([
    sb.from('students').select('*').order('created_at', { ascending: true }),
    sb.from('hall_of_fame').select('*').order('created_at', { ascending: false }),
    sb.from('class_settings').select('*').eq('id', 1).maybeSingle()
  ]);

  if (sRes.data) {
    students = sRes.data.map(r => ({
      id: r.id,
      name: r.name,
      avatar: r.avatar || '🦊',
      house: r.house || 'Brown',
      weeklyPoints: Number(r.weekly_points || 0),
      allTimePoints: Number(r.all_time_points || 0),
      badges: Array.isArray(r.badges) ? r.badges : [],
      history: Array.isArray(r.history) ? r.history : []
    }));
  }
  if (wRes.data) winners = wRes.data;
  if (cRes.data) {
    weekNum = Number(cRes.data.week_number || 11);
    cheers = Number(cRes.data.cheer_count || 0);
    CFG.goalTitle = cRes.data.goal_title || CFG.goalTitle;
    CFG.goalCurrentCredits = Number(cRes.data.goal_current_credits ?? CFG.goalCurrentCredits);
    CFG.goalTarget = Number(cRes.data.goal_target || CFG.goalTarget);
    if (Array.isArray(cRes.data.rewards) && cRes.data.rewards.length) CFG.rewards = cRes.data.rewards;
    if (Array.isArray(cRes.data.preset_badges) && cRes.data.preset_badges.length) CFG.presetBadges = cRes.data.preset_badges;
  }

  document.getElementById('syncStatus').textContent = 'Connected to Supabase • ' + students.length + ' students';
  render();
}

async function saveSharedSettings() {
  if (!sb) return;
  await sb.from('class_settings').upsert({
    id: 1,
    week_number: weekNum,
    cheer_count: cheers,
    goal_title: CFG.goalTitle,
    goal_current_credits: CFG.goalCurrentCredits,
    goal_target: CFG.goalTarget,
    rewards: CFG.rewards,
    preset_badges: CFG.presetBadges
  });
}

function toggleAdmin() {
  if (isAdmin) { isAdmin = false; render(); return; }
  const p = prompt('Enter Teacher Admin PIN:');
  if (p && p.trim() === String(CFG.adminPin)) {
    isAdmin = true;
    render();
  } else if (p !== null) {
    alert('Incorrect Teacher PIN.');
  }
}

function setTab(t) { tab = t; render(); }

async function addPts(id) {
  const s = students.find(x => x.id === id);
  if (!s || !sb) return;
  const val = Math.max(1, Number(document.getElementById('add-' + id).value || CFG.defaultAddAmount));
  const nextHistory = [stamp() + ' • +' + val + ' pts awarded', ...s.history];
  await sb.from('students').update({
    weekly_points: s.weeklyPoints + val,
    all_time_points: s.allTimePoints + val,
    history: nextHistory
  }).eq('id', id);
  await loadData();
}

async function addBrainTeaser(id) {
  const s = students.find(x => x.id === id);
  if (!s || !sb) return;
  const nextHistory = [stamp() + ' • +2 All-Time pts — 🧠 Brain Teaser', ...s.history];
  await sb.from('students').update({
    all_time_points: s.allTimePoints + 2,
    history: nextHistory
  }).eq('id', id);
  await loadData();
}

async function addDailyGoodStudent(id) {
  const s = students.find(x => x.id === id);
  if (!s || !sb) return;
  const nextHistory = [stamp() + ' • +1 All-Time pt — 🌟 Daily good student reward point', ...s.history];
  await sb.from('students').update({
    all_time_points: s.allTimePoints + 1,
    history: nextHistory
  }).eq('id', id);
  await loadData();
}

async function redeemReward(id, cost, label) {
  const s = students.find(x => x.id === id);
  if (!s || !sb) return;
  if (s.allTimePoints < cost) { alert(s.name + ' needs ' + cost + ' All-Time pts.'); return; }
  const nextHistory = [stamp() + ' • -' + cost + ' All-Time pts — Redeemed ' + label, ...s.history];
  await sb.from('students').update({
    all_time_points: Math.max(0, s.allTimePoints - cost),
    history: nextHistory
  }).eq('id', id);
  await loadData();
}

async function changeTeam(id, house) {
  const s = students.find(x => x.id === id);
  if (!s || !sb) return;
  const nextHistory = [stamp() + ' • Reassigned to Team ' + house, ...s.history];
  await sb.from('students').update({ house, history: nextHistory }).eq('id', id);
  await loadData();
}

async function awardBadge(id) {
  const s = students.find(x => x.id === id);
  const sel = document.getElementById('bsel-' + id);
  if (!s || !sel || !sb) return;
  let badge = sel.value;
  if (badge === '__REMOVE_PRESET__') {
    const toDel = prompt('Type the exact preset badge name to remove from the dropdown:\\n' + (CFG.presetBadges || []).join(', ')) || '';
    if (toDel.trim()) {
      CFG.presetBadges = (CFG.presetBadges || []).filter(b => b.toLowerCase() !== toDel.trim().toLowerCase());
      await saveSharedSettings();
      render();
    }
    return;
  }
  if (badge === '__CUSTOM__') badge = prompt('Enter custom badge name:') || '';
  badge = badge.trim();
  if (!badge) return;
  if (!s.badges.some(b => b.toLowerCase() === badge.toLowerCase())) {
    const nextBadges = [...s.badges, badge];
    const nextHistory = [stamp() + ' • 🏅 Earned badge: ' + badge, ...s.history];
    await sb.from('students').update({ badges: nextBadges, history: nextHistory }).eq('id', id);
  }
  if (!CFG.presetBadges.some(b => b.toLowerCase() === badge.toLowerCase())) {
    CFG.presetBadges.push(badge);
    await saveSharedSettings();
  }
  await loadData();
}

async function removeBadge(id, badge) {
  const s = students.find(x => x.id === id);
  if (!s || !sb) return;
  const nextBadges = s.badges.filter(b => b !== badge);
  const nextHistory = [stamp() + ' • Removed badge: ' + badge, ...s.history];
  await sb.from('students').update({ badges: nextBadges, history: nextHistory }).eq('id', id);
  await loadData();
}

async function delStudent(id) {
  if (!sb || !confirm('Delete this student?')) return;
  await sb.from('students').delete().eq('id', id);
  await loadData();
}

async function addStudent(e) {
  e.preventDefault();
  if (!sb) return;
  const avatars = ['🦊', '🦁', '🐼', '🐯', '🦉', '🐺', '🐨', '🦄', '🐸', '🐧'];
  const name = document.getElementById('newName').value.trim();
  const house = document.getElementById('newHouse').value;
  const badge = document.getElementById('newBadge').value.trim();
  if (!name) return;
  await sb.from('students').insert({
    id: 's' + Date.now(),
    name,
    avatar: avatars[students.length % avatars.length],
    house,
    weekly_points: 0,
    all_time_points: 0,
    badges: badge ? [badge] : [],
    history: [stamp() + ' • Joined class']
  });
  document.getElementById('newName').value = '';
  document.getElementById('newBadge').value = '';
  await loadData();
}

async function saveMilestone() {
  CFG.goalTitle = document.getElementById('msEditTitle').value;
  CFG.goalCurrentCredits = Math.max(0, Number(document.getElementById('msEditCurr').value || 0));
  CFG.goalTarget = Math.max(0.01, Number(document.getElementById('msEditTarget').value || CFG.goalTarget));
  await saveSharedSettings();
  await loadData();
}

async function crownAndReset() {
  if (!sb || !confirm('Crown Top 3 and reset Weekly Points & cheers to 0?')) return;
  const top3 = [...students].sort((a, b) => b.weeklyPoints - a.weeklyPoints).slice(0, 3);
  if (top3.length) {
    await sb.from('hall_of_fame').insert({
      id: 'wk_' + Date.now(),
      week_label: 'Week ' + weekNum,
      date: new Date().toISOString().slice(0, 10),
      podium: top3.map((s, idx) => ({ rank: idx + 1, name: s.name, house: s.house, points: s.weeklyPoints }))
    });
  }
  for (const s of students) {
    await sb.from('students').update({
      weekly_points: 0,
      history: [stamp() + ' • Weekly points reset for Week ' + (weekNum + 1), ...s.history]
    }).eq('id', s.id);
  }
  cheers = 0;
  weekNum += 1;
  await saveSharedSettings();
  confetti({ particleCount: 95, spread: 75, origin: { y: 0.6 } });
  await loadData();
}

async function sendCheer() {
  const maxCheers = students.length;
  if (maxCheers > 0 && cheers < maxCheers) {
    cheers += 1;
    render();
    if (sb) await sb.from('class_settings').upsert({ id: 1, cheer_count: cheers });
  }
  confetti({ particleCount: 95, spread: 75, origin: { y: 0.6 } });
}

async function editExportedReward(idx, field, val) {
  if (field === 'cost') CFG.rewards[idx].cost = Math.max(1, Number(val) || 1);
  else CFG.rewards[idx][field] = val;
  await saveSharedSettings();
}

async function addExportedReward() {
  CFG.rewards.push({ id: 'r' + Date.now(), cost: 5, fullName: 'New Reward', icon: '🎟️', desc: 'Reward description' });
  await saveSharedSettings();
  render();
}

async function removeExportedReward(idx) {
  if (CFG.rewards.length > 1) {
    CFG.rewards.splice(idx, 1);
    await saveSharedSettings();
    render();
  }
}

function render() {
  document.getElementById('adminBtn').textContent = isAdmin ? '🔓 Exit Admin' : '🔒 Teacher Admin';
  document.getElementById('adminBar').classList.toggle('hidden', !isAdmin);
  document.getElementById('msEditor').classList.toggle('hidden', !isAdmin);
  document.getElementById('wkNum').textContent = weekNum;
  document.getElementById('msTitle').textContent = CFG.goalTitle;
  document.getElementById('msNumbers').textContent = CFG.goalCurrentCredits + ' / ' + CFG.goalTarget + ' credits';
  document.getElementById('msFill').style.width = Math.min(100, (CFG.goalCurrentCredits / CFG.goalTarget) * 100) + '%';

  const cappedCheers = Math.min(cheers, students.length);
  document.getElementById('cheerLabel').textContent = '👏 ' + cappedCheers + ' / ' + students.length + (cappedCheers === 1 ? ' person' : ' people') + ' cheered for the winners!';

  const top3 = [...students].sort((a, b) => b.weeklyPoints - a.weeklyPoints).slice(0, 3);
  const medals = ['🥇 1st Place', '🥈 2nd Place', '🥉 3rd Place'];
  document.getElementById('podiumGrid').innerHTML = top3.map((s, i) =>
    '<div class="rounded-2xl bg-white/15 p-3.5"><div class="text-xs font-extrabold text-amber-200">' + medals[i] + '</div><div class="font-extrabold text-base mt-0.5">' + s.avatar + ' ' + s.name + ' (' + s.weeklyPoints + ' pts)</div>' + (isAdmin ? '<div class="text-xs opacity-80">Team ' + s.house + '</div>' : '') + '</div>'
  ).join('');

  document.getElementById('boardList').classList.toggle('hidden', tab === 'hall' || tab === 'shop');
  document.getElementById('hallList').classList.toggle('hidden', tab !== 'hall');
  document.getElementById('shopList').classList.toggle('hidden', tab !== 'shop');

  ['tWeekly', 'tAll', 'tHall', 'tShop'].forEach((btnId, idx) => {
    const key = ['weekly', 'allTime', 'hall', 'shop'][idx];
    document.getElementById(btnId).className = tab === key
      ? 'px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-extrabold'
      : 'px-3 py-1.5 rounded-lg text-slate-600 text-xs font-bold';
  });

  if (tab === 'shop') {
    const addTop = isAdmin ? '<div class="flex justify-end"><button onclick="addExportedReward()" class="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-extrabold">+ Add Reward</button></div>' : '';
    document.getElementById('shopList').innerHTML = addTop + '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">' + CFG.rewards.map((r, idx) => isAdmin
      ? '<div class="rounded-2xl bg-white border-2 border-indigo-200 p-4 space-y-2"><div class="flex justify-between"><span class="text-[10px] font-extrabold text-indigo-600">REWARD #' + (idx + 1) + '</span><button onclick="removeExportedReward(' + idx + ')" class="text-xs text-rose-600 font-bold">✕</button></div><div class="grid grid-cols-3 gap-1.5"><input value="' + r.icon + '" onchange="editExportedReward(' + idx + ',\\'icon\\',this.value)" class="px-2 py-1 border rounded-lg text-center text-xs font-bold"/><input type="number" min="1" value="' + r.cost + '" onchange="editExportedReward(' + idx + ',\\'cost\\',this.value)" class="col-span-2 px-2 py-1 border rounded-lg text-xs font-extrabold"/></div><input value="' + r.fullName + '" onchange="editExportedReward(' + idx + ',\\'fullName\\',this.value)" class="w-full px-2 py-1 border rounded-lg text-xs font-extrabold"/><textarea rows="2" onchange="editExportedReward(' + idx + ',\\'desc\\',this.value)" class="w-full px-2 py-1 border rounded-lg text-xs">' + r.desc + '</textarea></div>'
      : '<div class="rounded-2xl bg-white border border-slate-200 p-5 space-y-2"><div class="flex justify-between items-center"><span class="text-2xl">' + r.icon + '</span><span class="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold">' + r.cost + ' pts</span></div><div class="font-extrabold text-base">' + r.fullName + '</div><p class="text-xs text-slate-500">' + r.desc + '</p></div>'
    ).join('') + '</div>';
    return;
  }

  if (tab === 'hall') {
    document.getElementById('hallList').innerHTML = winners.map(entry =>
      '<div class="rounded-2xl bg-white border p-4 space-y-2"><div class="flex justify-between items-center"><span class="font-extrabold text-sm">🏆 ' + entry.week_label + '</span><span class="text-xs text-slate-400">' + entry.date + '</span></div>' +
      (entry.podium || []).map(p => '<div class="text-xs flex justify-between bg-slate-50 p-2 rounded-lg"><span>#' + p.rank + ' ' + p.name + (isAdmin && p.house ? ' (' + p.house + ')' : '') + '</span><strong>' + p.points + ' pts</strong></div>').join('') +
      '</div>'
    ).join('');
    return;
  }

  const order = CFG.houses.map(h => h.name);
  const list = [...students].sort((a, b) => tab === 'allTime'
    ? (isAdmin ? order.indexOf(a.house) - order.indexOf(b.house) : a.name.localeCompare(b.name))
    : b.weeklyPoints - a.weeklyPoints
  );

  document.getElementById('boardList').innerHTML = list.map((s, i) => {
    const pts = tab === 'allTime' ? s.allTimePoints : s.weeklyPoints;
    const badgePills = (s.badges || []).map(b =>
      '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">⭐ ' + b +
      (isAdmin ? ' <button onclick="removeBadge(\\'' + s.id + '\\',\\'' + b.replace(/'/g, "\\\\'") + '\\')" class="text-slate-400 hover:text-rose-600 font-bold">✕</button>' : '') +
      '</span>'
    ).join(' ');
    const rewardButtons = CFG.rewards.map(r =>
      '<button onclick="redeemReward(\\'' + s.id + '\\',' + r.cost + ',\\'' + r.fullName.replace(/'/g, '') + '\\')" class="px-2 py-1 rounded bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-bold">-' + r.cost + ' ' + r.icon + ' ' + r.fullName + '</button>'
    ).join('');
    const badgeMenu = '<select id="bsel-' + s.id + '" class="px-2 py-1 border border-amber-300 bg-amber-50 rounded text-xs font-bold"><option value="">🏅 Badge...</option>' +
      (CFG.presetBadges || []).map(b => '<option value="' + b + '">⭐ ' + b + '</option>').join('') +
      '<option value="__CUSTOM__">✏️ Custom...</option><option value="__REMOVE_PRESET__">🗑️ Remove Preset...</option></select>' +
      '<button onclick="awardBadge(\\'' + s.id + '\\')" class="px-2 py-1 rounded bg-amber-500 text-slate-950 text-xs font-extrabold">Apply</button>';
    const adminRow = isAdmin ? '<div class="mt-2 pt-2 border-t flex flex-wrap gap-1.5 items-center">' +
      '<input id="add-' + s.id + '" type="number" value="' + CFG.defaultAddAmount + '" class="w-14 px-2 py-1 border rounded text-xs font-bold"/>' +
      '<button onclick="addPts(\\'' + s.id + '\\')" class="px-2.5 py-1 rounded bg-emerald-600 text-white text-xs font-bold">+ Add</button>' +
      '<button onclick="addBrainTeaser(\\'' + s.id + '\\')" class="px-2.5 py-1 rounded bg-emerald-600 text-white text-xs font-bold">+2 🧠 Brain Teaser</button>' +
      '<button onclick="addDailyGoodStudent(\\'' + s.id + '\\')" class="px-2.5 py-1 rounded bg-emerald-600 text-white text-xs font-bold">+1 🌟 Daily good student reward point</button>' +
      rewardButtons +
      badgeMenu +
      '<select onchange="changeTeam(\\'' + s.id + '\\',this.value)" class="px-2 py-1 border rounded text-xs">' + CFG.houses.map(h => '<option ' + (h.name === s.house ? 'selected' : '') + '>' + h.name + '</option>').join('') + '</select>' +
      '<button onclick="delStudent(\\'' + s.id + '\\')" class="px-2 py-1 rounded bg-slate-100 text-xs">🗑️</button></div>' : '';
    return '<div class="rounded-2xl bg-white border p-4"><div class="flex justify-between items-center"><div><span class="font-extrabold">' + (tab === 'weekly' ? '#' + (i + 1) + ' ' : '') + s.avatar + ' ' + s.name + '</span>' + (isAdmin ? ' <span class="text-xs px-2 py-0.5 rounded bg-slate-100 font-bold">' + s.house + '</span>' : '') + '<div class="flex flex-wrap gap-1 mt-1">' + badgePills + '</div><div class="text-xs text-slate-400 mt-0.5">' + (s.history?.[0] || '') + '</div></div><div class="font-extrabold text-indigo-600">' + pts + ' pts</div></div>' + adminRow + '</div>';
  }).join('');
}

initSupabase();
`;

    triggerTextDownload('index.html', exportedHtml, 'text/html;charset=utf-8');
    setTimeout(() => triggerTextDownload('style.css', exportedCss, 'text/css;charset=utf-8'), 250);
    setTimeout(() => triggerTextDownload('app.js', exportedJs, 'application/javascript;charset=utf-8'), 500);
    showToast('Downloaded index.html, style.css & app.js!', 'emerald');
}

// Boot
renderAll();
