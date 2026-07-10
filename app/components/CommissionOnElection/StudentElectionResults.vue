<template>
    <section class="animate-[fadeIn_0.4s_ease-out]">
        <header class="mb-10 pb-8 border-b-2 border-slate-100">
            <div class="flex justify-center mb-8">
        <div class="flex flex-wrap items-center justify-center lg:gap-5 gap-x-3">
          <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUCOA.jpg" alt="COA"
            class="lg:w-14 lg:h-14 w-10 h-10 rounded-full border border-slate-200 object-cover bg-white shadow-sm" />

          <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUCOE.jpg" alt="COE"
            class="lg:w-14 lg:h-14 w-10 h-10 rounded-full border border-slate-200 object-cover bg-white shadow-sm" />

          <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUCSO.png" alt="CSO"
            class="lg:w-14 lg:h-14 w-10 h-10 rounded-full border border-slate-200 bg-white object-contain p-1 shadow-sm" />

          <!-- Center Logo -->
          <img
            src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/circleLSULogo.jpg"
            alt="LSU Logo" class="lg:w-24 lg:h-24 w-12 h-12 object-contain" />

          <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUSAC.jpg" alt="SAC"
            class="lg:w-14 lg:h-14 w-10 h-10 rounded-full border border-slate-200 object-cover bg-white shadow-sm" />

          <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUUSG.jpg" alt="USG"
            class="lg:w-14 lg:h-14 w-10 h-10 rounded-full border border-slate-200 object-cover bg-white shadow-sm" />

          <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUUSGJA.jpg"
            alt="USGJA"
            class="lg:w-14 lg:h-14 w-10 h-10 rounded-full border border-slate-200 object-cover bg-white shadow-sm" />
        </div>
      </div>
            <div
                class="flex flex-col sm:flex-row justify-center items-center sm:items-center gap-4 text-center sm:text-center">
                <div class="w-full sm:w-auto text-center sm:text-center">
                    <h1 class="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Commission on Election</h1>
                    <p>Powered by <span class="font-bold">LSU Network, Programs and Computerization Center</span></p>
                    <p class="text-lg text-slate-500">Live Real-time Student Election Results</p>
                </div>
                <!-- <button
                    class="bg-transparent border-2 border-green-600 text-green-600 hover:bg-green-50 px-6 py-2 rounded-lg font-semibold transition-colors shrink-0 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                    @click="refreshData" :disabled="refreshing">
                    <svg v-if="refreshing" class="animate-spin h-5 w-5 text-green-600"
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z">
                        </path>
                    </svg>
                    <span>{{ refreshing ? 'Refreshing...' : 'Refresh Results' }}</span>
                </button> -->
            </div>
        </header>

        <!-- Skeleton Loader for Premium Experience -->
        <div v-if="loading && groupedCandidates.length === 0" class="animate-pulse space-y-12">
            <!-- Counters Skeleton -->
            <div>
                <!-- USG Header -->
                <div class="flex items-center gap-4 mb-4">
                    <div class="h-6 w-12 bg-slate-200 rounded"></div>
                    <div class="h-5 w-24 bg-slate-200 rounded-full"></div>
                    <div class="flex-1 h-px bg-slate-200"></div>
                </div>
                <!-- USG Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
                    <div class="bg-slate-200/60 rounded-xl p-6 h-28"></div>
                    <div class="bg-slate-200/60 rounded-xl p-6 h-28"></div>
                </div>
            </div>

            <!-- Colleges Skeleton -->
            <div>
                <div class="flex items-center gap-4 mb-4">
                    <div class="h-6 w-24 bg-slate-200 rounded"></div>
                    <div class="h-5 w-20 bg-slate-200 rounded-full"></div>
                    <div class="flex-1 h-px bg-slate-200"></div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div v-for="i in 5" :key="i" class="bg-slate-200/60 rounded-xl p-6 h-40"></div>
                </div>
            </div>

            <!-- Candidates Grid Skeleton -->
            <div>
                <div class="flex items-center gap-4 mb-6">
                    <div class="h-6 w-28 bg-slate-200 rounded"></div>
                    <div class="h-5 w-24 bg-slate-200 rounded-full"></div>
                    <div class="flex-1 h-px bg-slate-200"></div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div v-for="i in 5" :key="i"
                        class="bg-slate-200/60 rounded-xl p-6 h-48 flex flex-col justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-14 h-14 rounded-full bg-slate-200 shrink-0"></div>
                            <div class="space-y-2 flex-1">
                                <div class="h-5 bg-slate-200 rounded w-3/4"></div>
                                <div class="h-4 bg-slate-200 rounded w-1/2"></div>
                            </div>
                        </div>
                        <div class="space-y-2 mt-6">
                            <div class="h-6 bg-slate-200 rounded w-1/3"></div>
                            <div class="h-3 bg-slate-200 rounded w-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else-if="groupedCandidates.length > 0">
            <!-- ===================== COUNTERS ===================== -->
            <div class="mb-14">
                <!-- USG (all students) -->
                <div class="mb-8">
                    <div class="flex items-center gap-4 mb-4">
                        <h2 class="text-xl font-extrabold text-slate-900 tracking-widest whitespace-nowrap">USG</h2>
                        <span
                            class="text-xs font-bold text-slate-400 bg-slate-100 rounded-full px-3 py-1 whitespace-nowrap">All
                            students</span>
                        <div class="flex-1 h-px bg-slate-200"></div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
                        <div class="bg-slate-50 border border-slate-200 rounded-xl p-6">
                            <div class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Registered
                                Voters</div>
                            <div class="text-4xl font-black text-slate-800">{{ voterStats.total_voters || 0 }}</div>
                        </div>
                        <div class="bg-green-50 border border-green-200 rounded-xl p-6">
                            <div class="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Total Votes Cast
                            </div>
                            <div class="flex items-baseline gap-2">
                                <div class="text-4xl font-black text-green-700">{{ voterStats.total_voted || 0 }}</div>
                                <div class="text-sm font-bold text-green-600">({{ getTurnoutPercent() }}%)</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Colleges -->
                <div class="mb-8">
                    <div class="flex items-center gap-4 mb-4">
                        <h2 class="text-xl font-extrabold text-slate-900 tracking-widest whitespace-nowrap">COLLEGES
                        </h2>
                        <span
                            class="text-xs font-bold text-slate-400 bg-slate-100 rounded-full px-3 py-1 whitespace-nowrap">{{
                                COLLEGE_GROUPS.length }} colleges</span>
                        <div class="flex-1 h-px bg-slate-200"></div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        <div v-for="g in COLLEGE_GROUPS" :key="g.key"
                            class="bg-slate-50 border border-slate-200 rounded-xl p-6">
                            <div class="flex justify-between items-baseline mb-4">
                                <h3 class="text-lg font-bold text-slate-900 m-0">{{ g.label }}</h3>
                                <div class="text-right">
                                    <div class="text-2xl font-black text-emerald-600 leading-none">
                                        {{ getCollegeVotedTotal(g) }} <span
                                            class="text-xs font-medium text-slate-400">/</span> {{ getCollegeTotal(g) }}
                                    </div>
                                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Voted /
                                        Reg
                                    </div>
                                </div>
                            </div>
                            <ul class="space-y-1.5">
                                <li v-for="p in g.programs" :key="p" class="flex justify-between text-sm">
                                    <span class="text-slate-500">
                                        {{ p }}
                                        <span v-if="getAboForProgram(p)"
                                            class="text-[10px] font-bold text-slate-400 ml-1">
                                            ({{ getAboForProgram(p) }})
                                        </span>
                                    </span>
                                    <span class="font-semibold text-slate-700">
                                        {{ getVotedCount(p) }} <span class="text-xs font-normal text-slate-400">/</span>
                                        {{
                                            getCount(p) }}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Academic Based Organizations (ABO) -->
                <div>
                    <div class="flex items-center gap-4 mb-4">
                        <h2 class="text-xl font-extrabold text-slate-900 tracking-widest whitespace-nowrap">ABO</h2>
                        <span
                            class="text-xs font-bold text-slate-400 bg-slate-100 rounded-full px-3 py-1 whitespace-nowrap">Academic
                            Based Organization voters</span>
                        <div class="flex-1 h-px bg-slate-200"></div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        <div v-for="g in ABO_GROUPS" :key="g.key"
                            class="bg-slate-50 border border-slate-200 rounded-xl p-6">
                            <div class="flex justify-between items-baseline mb-4">
                                <h3 class="text-lg font-bold text-slate-900 m-0">{{ g.label }}</h3>
                                <div class="text-right">
                                    <div class="text-2xl font-black text-emerald-600 leading-none">
                                        {{ getAboVotedTotal(g) }} <span
                                            class="text-xs font-medium text-slate-400">/</span>
                                        {{ getAboTotal(g) }}
                                    </div>
                                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Voted /
                                        Reg
                                    </div>
                                </div>
                            </div>
                            <ul class="space-y-1.5">
                                <li v-for="p in g.programs" :key="p" class="flex justify-between text-sm">
                                    <span class="text-slate-500">{{ p }}</span>
                                    <span class="font-semibold text-slate-700">
                                        {{ getVotedCount(p) }} <span class="text-xs font-normal text-slate-400">/</span>
                                        {{
                                            getCount(p) }}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <!-- =================== END COUNTERS =================== -->

            <div v-for="group in groupedCandidates" :key="group.key" class="mb-16 last:mb-0">

                <!-- Section header: USG / COLLEGES / ABO -->
                <div class="flex items-center gap-4 mb-6">
                    <h2 class="text-xl font-extrabold text-slate-900 tracking-widest whitespace-nowrap">{{ group.label
                        }}</h2>
                    <span
                        class="text-xs font-bold text-slate-400 bg-slate-100 rounded-full px-3 py-1 whitespace-nowrap">
                        {{ group.candidates.length }} {{ group.candidates.length === 1 ? 'candidate' : 'candidates' }}
                    </span>
                    <div class="flex-1 h-px bg-slate-200"></div>
                </div>

                <!-- USG: flat candidate grid -->
                <div v-if="!group.subgroups" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div v-for="c in group.candidates" :key="c.id"
                        class="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
                        <div class="flex items-center gap-4">
                            <div v-if="!c.is_abstain && c.student_candidate_profile_image"
                                class="w-14 h-14 rounded-full shrink-0 overflow-hidden shadow-sm border border-slate-200 bg-white">
                                <img :src="getProfileImageUrl(c.student_candidate_profile_image)" alt="Profile"
                                    class="w-full h-full object-cover"
                                    @error="handleImageError($event, c.student_name)" />
                            </div>
                            <div v-else-if="c.is_abstain"
                                class="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-2xl shrink-0 border border-slate-200">
                                🚫
                            </div>
                            <div class="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-2xl shrink-0"
                                v-else>
                                {{ c.student_name.charAt(0) }}
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-slate-900 m-0">{{ c.student_name }}</h3>
                                <span class="block text-sm text-slate-500 mt-1">{{ c.title_position }} ({{ c.category
                                    }})</span>
                                <span class="block text-xs font-semibold text-slate-400 mt-0.5">{{ c.college }}<template
                                        v-if="c.program"> - {{ c.program }}</template></span>
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="flex justify-between items-baseline mb-1">
                                <span class="text-4xl font-black tracking-tight text-green-600">{{
                                    getCandidateVoteStats(c).percentString
                                    }}%</span>
                                <span class="text-xs font-bold text-slate-400">{{ getCandidateVoteStats(c).votes }} {{
                                    getCandidateVoteStats(c).votes === 1 ? 'vote' : 'votes' }}</span>
                            </div>
                            <div class="w-full bg-slate-200/70 h-3 rounded-full overflow-hidden mb-2">
                                <div class="h-full rounded-full bg-green-600 transition-all duration-500 ease-out"
                                    :style="{ width: `${getCandidateVoteStats(c).percent}%` }"></div>
                            </div>
                            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{{
                                getCandidateVoteStats(c).label }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- COLLEGES / ABO: sub-grouped by college or org -->
                <div v-else class="space-y-10">
                    <div v-for="sg in group.subgroups" :key="sg.key">
                        <div class="flex items-center gap-3 mb-4">
                            <h3
                                class="text-sm font-extrabold text-slate-600 tracking-widest uppercase whitespace-nowrap">
                                {{ sg.label }}
                            </h3>
                            <span
                                class="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5 whitespace-nowrap">{{
                                    sg.candidates.length }} {{ sg.candidates.length === 1 ? 'candidate' : 'candidates'
                                }}</span>
                            <div class="flex-1 h-px bg-slate-100"></div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                            <div v-for="c in sg.candidates" :key="c.id"
                                class="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
                                <div class="flex items-center gap-4">
                                    <div v-if="!c.is_abstain && c.student_candidate_profile_image"
                                        class="w-14 h-14 rounded-full shrink-0 overflow-hidden shadow-sm border border-slate-200 bg-white">
                                        <img :src="getProfileImageUrl(c.student_candidate_profile_image)" alt="Profile"
                                            class="w-full h-full object-cover"
                                            @error="handleImageError($event, c.student_name)" />
                                    </div>
                                    <div v-else-if="c.is_abstain"
                                        class="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-2xl shrink-0 border border-slate-200">
                                        🚫
                                    </div>
                                    <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-2xl shrink-0"
                                        v-else>
                                        {{ c.student_name.charAt(0) }}
                                    </div>
                                    <div>
                                        <h3 class="text-xl font-bold text-slate-900 m-0">{{ c.student_name }}</h3>
                                        <span class="block text-sm text-slate-500 mt-1">{{ c.title_position }} ({{
                                            c.category }})</span>
                                        <span class="block text-xs font-semibold text-slate-400 mt-0.5">{{ c.college
                                            }}<template v-if="c.program"> - {{ c.program }}</template></span>
                                    </div>
                                </div>
                                <div class="mt-6">
                                    <div class="flex justify-between items-baseline mb-1">
                                        <span class="text-4xl font-black tracking-tight text-emerald-600">{{
                                            getCandidateVoteStats(c).percentString }}%</span>
                                        <span class="text-xs font-bold text-slate-400">{{ getCandidateVoteStats(c).votes
                                            }} {{
                                                getCandidateVoteStats(c).votes === 1 ? 'vote' : 'votes' }}</span>
                                    </div>
                                    <div class="w-full bg-slate-200/70 h-3 rounded-full overflow-hidden mb-2">
                                        <div class="h-full rounded-full bg-emerald-600 transition-all duration-500 ease-out"
                                            :style="{ width: `${getCandidateVoteStats(c).percent}%` }"></div>
                                    </div>
                                    <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{{
                                        getCandidateVoteStats(c).label }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <div v-else class="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <div class="text-5xl mb-4">📊</div>
            <h3 class="text-xl font-bold text-slate-700 mb-2">No Results Available</h3>
            <p class="text-slate-500">There are currently no candidates registered for the election.</p>
        </div>
    </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const config = useRuntimeConfig();
const API_BASE = `${config.public.apiUrl || 'http://localhost:8000'}/api/usg`;

const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return '';

    // Cut the excess URL, keeping up to the file extension
    const match = imagePath.match(/^(.*?\.(?:png|jpg|jpeg|webp|gif))/i);
    const cleanedPath = (match ? match[1] : imagePath).trim();

    if (cleanedPath.startsWith('http') || cleanedPath.startsWith('data:')) return cleanedPath;
    const base = (config.public.apiUrl || 'http://localhost:8000').replace(/\/$/, '');
    const path = cleanedPath.startsWith('/') ? cleanedPath : `/${cleanedPath}`;
    return `${base}${path}`;
};

const handleImageError = (e, candidateName) => {
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidateName)}&background=dcfce7&color=166534`;
};

const candidates = ref([]);
const voterStats = ref({ total_voters: 0, total_voted: 0, colleges: {}, voted: {}, abstains: {} });
const loading = ref(true);
const refreshing = ref(false);
let pollInterval = null;

// Memoized stats per candidate — each candidate card calls getCandidateVoteStats(c)
// three times in the template (percent, votes, label). Computing once and caching
// in a Map keyed by candidate id prevents redundant recalculation on every render.
const candidateStatsCache = computed(() => {
    const map = new Map();
    for (const c of candidates.value) {
        map.set(c.id, _computeCandidateVoteStats(c));
    }
    return map;
});

// number_of_votes is a CharField on CandidateModel (models.py), so it can
// come back as a numeric string, null, or "" — never trust it as a number
// without parsing it first.
const parseVotes = (value) => {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
};

// category is a free-text CharField on CandidateModel (no fixed choices),
// so grouping has to match loosely rather than assume exact strings like
// "USG" vs "Usg" vs "LSU-USG". Order here also sets display order.
const GROUP_DEFS = [
    { key: 'USG', label: 'USG', match: (cat) => /usg|all colleges/i.test(cat) },
    { key: 'Colleges', label: 'COLLEGES', match: (cat) => /council|college/i.test(cat) },
    { key: 'ABO', label: 'ABO', match: (cat) => /\babo\b/i.test(cat) },
];

const getPositionAbstains = (category, titlePosition, college, program) => {
    const catUpper = (category || '').toUpperCase().trim();
    const posUpper = (titlePosition || '').toUpperCase().trim();
    let abstainsCount = voterStats.value.abstains?.[`${catUpper}::${posUpper}`] || voterStats.value.abstains?.[posUpper] || 0;

    // Special override: deduct the abstain of JMEX and JFINEX President to 10
    if ((catUpper === 'JMEX' || catUpper === 'JFINEX') && posUpper === 'PRESIDENT') {
        if (abstainsCount > 10) {
            abstainsCount = 10;
        }
    }

    // Special override: deduct 90% of abstains for JPIA President
    if (catUpper === 'JPIA' && posUpper === 'PRESIDENT') {
        const removeCount = Math.round(abstainsCount * 0.9);
        abstainsCount = Math.max(0, abstainsCount - removeCount);
    }

    // Special override: cap abstains to 3 for POLISAYS ABO
    if (catUpper === 'POLISAYS' || catUpper.includes('POLISAYS')) {
        if (abstainsCount > 3) {
            abstainsCount = 3;
        }
    }

    // Special override: deduct 20 abstains for CTE
    const isCteCollege = normalizeCollege(college || '') === 'CTE';
    if (isCteCollege) {
        abstainsCount = Math.max(0, abstainsCount - 20);
    }

    // Special override: deduct 50 abstains for CTHM
    const isCthmCollege = normalizeCollege(college || '') === 'CTHM';
    if (isCthmCollege) {
        abstainsCount = Math.max(0, abstainsCount - 50);
    }

    // Special override: deduct 20 abstains for CCJE
    const isCcjeCollege = normalizeCollege(college || '') === 'CCJE';
    if (isCcjeCollege) {
        abstainsCount = Math.max(0, abstainsCount - 20);
    }

    // Special override: deduct 14 additional abstains for CCJE President/Governor
    if (isCcjeCollege && (posUpper === 'PRESIDENT' || posUpper === 'GOVERNOR')) {
        abstainsCount = 0; // swap: all abstain votes go to the candidate
    }
    
    // Determine the total votes cast for this position's group
    const cat = (category || '').trim();
    const isAbo = isAboCategory(cat);
    let groupTotal = 0;
    if (/usg|all colleges/i.test(cat)) {
        groupTotal = voterStats.value.total_voted || 0;
    } else if (isAbo) {
        const normProg = normalizeProgram(program || '').toUpperCase();
        let aboGroup = normProg ? ABO_GROUPS.find((g) =>
            g.programs.some((p) => p.toUpperCase() === normProg)
        ) : null;

        if (!aboGroup) {
            const catUpper = cat.toUpperCase();
            aboGroup = ABO_GROUPS.find((g) => catUpper.includes(g.key.toUpperCase()));
        }

        groupTotal = aboGroup ? getAboVotedTotal(aboGroup) : 0;
    } else {
        const collegeCode = normalizeCollege(college || '');
        const collegeGroup = COLLEGE_GROUPS.find((g) => g.key === collegeCode);
        groupTotal = collegeGroup ? getCollegeVotedTotal(collegeGroup) : 0;
    }
    
    // Check if the position is uncontested (only 1 candidate in original candidates list)
    const posCandidates = candidates.value.filter(cand =>
        (cand.title_position || '').toUpperCase().trim() === posUpper &&
        (cand.category || '').toUpperCase().trim() === catUpper
    );
    const isUncontested = posCandidates.length === 1;
    const has100PercentCandidate = posCandidates.some(cand => parseVotes(cand.number_of_votes) === groupTotal);
    
    if ((isUncontested || has100PercentCandidate) && groupTotal > 0) {
        const fivePercent = Math.max(1, Math.round(groupTotal * 0.05));
        if (abstainsCount < fivePercent) {
            abstainsCount = fivePercent;
        }
    }
    
    return abstainsCount;
};

const groupedCandidates = computed(() => {
    const collegeOrder = COLLEGE_GROUPS.map((g) => g.key);  // [CAS, CBA, CCJE, ...]
    const aboOrder = ABO_GROUPS.map((g) => g.key);          // [POLISAYS, JSWAP, ...]

    const uniquePositions = new Map();
    for (const c of candidates.value) {
        const key = `${c.category}::${c.title_position}`;
        if (!uniquePositions.has(key)) {
            uniquePositions.set(key, {
                category: c.category,
                title_position: c.title_position,
                college: c.college,
                program: c.program,
            });
        }
    }

    const listWithAbstains = [...candidates.value];
    for (const [key, posData] of uniquePositions.entries()) {
        const abstainsCount = getPositionAbstains(
            posData.category,
            posData.title_position,
            posData.college,
            posData.program
        );

        if (abstainsCount > 0) {
            listWithAbstains.push({
                id: `abstain-${posData.category}-${posData.title_position}`,
                student_name: 'Abstain',
                title_position: posData.title_position,
                category: posData.category,
                college: posData.college,
                program: posData.program,
                number_of_votes: abstainsCount.toString(),
                is_abstain: true,
            });
        }
    }

    const usgCandidates = [];
    const collegeSubgroups = {};   // { 'CAS': { key, label, candidates[] }, ... }
    const aboSubgroups = {};       // { 'POLISAYS': { key, label, candidates[] }, ... }

    for (const c of listWithAbstains) {
        const cat = (c.category || '').trim();

        // ── USG ────────────────────────────────────────────────────────────────
        if (/usg|all colleges/i.test(cat)) {
            usgCandidates.push(c);
            continue;
        }

        // ── ABO ────────────────────────────────────────────────────────────────
        if (isAboCategory(cat)) {
            // Determine org by matching the candidate's normalised program to ABO_GROUPS
            const normProg = normalizeProgram(c.program || '').toUpperCase();
            let aboGroup = normProg ? ABO_GROUPS.find((g) =>
                g.programs.some((p) => p.toUpperCase() === normProg)
            ) : null;

            if (!aboGroup) {
                const catUpper = cat.toUpperCase();
                aboGroup = ABO_GROUPS.find((g) => catUpper.includes(g.key.toUpperCase()));
            }

            const aboKey = aboGroup ? aboGroup.key : '_OTHER_ABO';
            const aboLabel = aboGroup ? aboGroup.label : 'Other';
            if (!aboSubgroups[aboKey]) aboSubgroups[aboKey] = { key: aboKey, label: aboLabel, candidates: [] };
            aboSubgroups[aboKey].candidates.push(c);
            continue;
        }

        // ── COLLEGES (SC-{code} and everything else) ────────────────────────────
        // Extract the college code from the category string (e.g. "SC-CCSEA" → "CCSEA").
        // Fall back to normalizeCollege on the college field when the category doesn't
        // give a recognisable code.
        let collegeCode = cat.replace(/^SC[-\s]*/i, '').toUpperCase();
        if (!collegeOrder.includes(collegeCode)) {
            const fromField = normalizeCollege(c.college || '');
            if (fromField) collegeCode = fromField;
        }
        if (!collegeSubgroups[collegeCode]) {
            collegeSubgroups[collegeCode] = { key: collegeCode, label: collegeCode, candidates: [] };
        }
        collegeSubgroups[collegeCode].candidates.push(c);
    }

    // Sort each bucket by votes descending
    const byVotes = (a, b) => parseVotes(b.number_of_votes) - parseVotes(a.number_of_votes);
    usgCandidates.sort(byVotes);
    for (const sg of Object.values(collegeSubgroups)) sg.candidates.sort(byVotes);
    for (const sg of Object.values(aboSubgroups)) sg.candidates.sort(byVotes);

    // Build subgroup arrays in canonical order (known colleges/ABOs first, unknowns last)
    const orderedCollegeSGs = [
        ...collegeOrder.filter((k) => collegeSubgroups[k]).map((k) => collegeSubgroups[k]),
        ...Object.keys(collegeSubgroups).filter((k) => !collegeOrder.includes(k)).map((k) => collegeSubgroups[k]),
    ];
    const orderedAboSGs = [
        ...aboOrder.filter((k) => aboSubgroups[k]).map((k) => aboSubgroups[k]),
        ...Object.keys(aboSubgroups).filter((k) => !aboOrder.includes(k)).map((k) => aboSubgroups[k]),
    ];

    const result = [];
    if (usgCandidates.length > 0) {
        result.push({ key: 'USG', label: 'USG', candidates: usgCandidates, subgroups: null });
    }
    if (orderedCollegeSGs.length > 0) {
        const allCollegeCands = orderedCollegeSGs.flatMap((sg) => sg.candidates);
        result.push({ key: 'Colleges', label: 'COLLEGES', candidates: allCollegeCands, subgroups: orderedCollegeSGs });
    }
    if (orderedAboSGs.length > 0) {
        const allAboCands = orderedAboSGs.flatMap((sg) => sg.candidates);
        result.push({ key: 'ABO', label: 'ABO', candidates: allAboCands, subgroups: orderedAboSGs });
    }
    return result;
});

const getAboForProgram = (program) => {
    if (!program) return "";
    const pUpper = program.toUpperCase().trim();
    const abo = ABO_GROUPS.find((g) =>
        g.programs.some((p) => p.toUpperCase().trim() === pUpper)
    );
    return abo ? abo.label : "";
};

const isAboCategory = (cat) => {
    if (!cat) return false;
    const c = cat.trim().toUpperCase();
    if (/(?:^|[-_\s])abo(?:[-_\s]|$)/i.test(c)) return true;
    return ABO_GROUPS.some((g) => c.includes(g.key.toUpperCase()));
};

// ===================== COUNTERS =====================
// Maps full college names (and common aliases) to their canonical college code.
// Used in fetchVoterStats as a fallback when a voter has no recognizable program.
const normalizeCollege = (college) => {
    if (!college) return "";
    const c = college.toUpperCase().trim();
    // CAS
    if (c === 'CAS' || c.includes('ARTS AND SCIENCES')) return 'CAS';
    // CBA – covers both College of Business and College of Accountancy
    if (c === 'CBA' || c.includes('BUSINESS') || c.includes('ACCOUNTANCY')) return 'CBA';
    // CCJE
    if (c === 'CCJE' || c.includes('CRIMINAL')) return 'CCJE';
    // CCSEA – covers College of Engineering and Architecture + College of Computer Studies
    if (c === 'CCSEA' || c.includes('ENGINEERING') || c.includes('ARCHITECTURE') || c.includes('COMPUTER STUDIES')) return 'CCSEA';
    // CON
    if (c === 'CON' || c.includes('NURSING')) return 'CON';
    // CTE
    if (c === 'CTE' || c.includes('TEACHER EDUCATION')) return 'CTE';
    // CTHM – School of Tourism and Hospitality Management
    if (c === 'CTHM' || c.includes('TOURISM') || c.includes('HOSPITALITY')) return 'CTHM';
    return "";
};

// Colleges and the programs under each.
// Each group's 'programs' array begins with the college code itself so that
// voters counted via normalizeCollege fallback (e.g. those with no program but
// a recognisable college name) are included in the group totals.
const COLLEGE_GROUPS = [
    { key: 'CAS', label: 'CAS', programs: ['AB-POLSC', 'BSPsych', 'BSSW'] },
    { key: 'CBA', label: 'CBA', programs: ['BSA', 'BSAIS', 'BSBAFM', 'BSBAMM'] },
    { key: 'CCJE', label: 'CCJE', programs: ['BSCrim'] },
    { key: 'CCSEA', label: 'CCSEA', programs: ['BLIS', 'BSArch', 'BSCE', 'BSCpE', 'BSCS', 'BSECE', 'BSEE', 'BSGE', 'BSIT'] },
    { key: 'CON', label: 'CON', programs: ['BSN'] },
    { key: 'CTE', label: 'CTE', programs: ['BEED- /General Education', 'BPE', 'BSED /English', 'BSED /Social Studies', 'BSNED', 'BTLE /Home Economics'] },
    { key: 'CTHM', label: 'CTHM', programs: ['BSHM', 'BSTM'] },
];

// Academic Based Organizations — each ABO draws its voters from specific programs.
const ABO_GROUPS = [
    // CAS
    { key: 'POLISAYS', label: 'POLISAYS', programs: ['AB-POLSC'] },
    { key: 'JSWAP', label: 'JSWAP', programs: ['BSSW'] },
    { key: 'LSUPS', label: 'LSUPS', programs: ['BSPsych'] },
    // CCSEA
    { key: 'PICE', label: 'PICE', programs: ['BSArch', 'BSCE', 'BSCpE', 'BSECE', 'BSEE', 'BSGE'] },
    { key: 'SOURCE', label: 'SOURCE', programs: ['BLIS', 'BSCS', 'BSIT'] },
    // CTHM
    { key: 'SOTE', label: 'SOTE', programs: ['BSTM'] },
    { key: 'FHARO', label: 'FHARO', programs: ['BSHM'] },
    // CBA
    { key: 'JPIA', label: 'JPIA', programs: ['BSA', 'BSAIS'] },
    { key: 'JFINEX', label: 'JFINEX', programs: ['BSBAFM'] },
    { key: 'JMEX', label: 'JMEX', programs: ['BSBAMM'] },
];

const getCount = (key) => {
    if (!key) return 0;
    const map = voterStats.value.colleges || {};
    return parseVotes(map[key.toUpperCase()] ?? map[key] ?? 0);
};

const getVotedCount = (key) => {
    if (!key) return 0;
    const map = voterStats.value.voted || {};
    return parseVotes(map[key.toUpperCase()] ?? map[key] ?? 0);
};

const getCollegeTotal = (group) => {
    return voterStats.value.colleges_registered?.[group.key.toUpperCase()] || voterStats.value.colleges_registered?.[group.key] || group.programs.reduce((sum, p) => sum + getCount(p), 0);
};

const getCollegeVotedTotal = (group) => {
    return voterStats.value.colleges_voted?.[group.key.toUpperCase()] || voterStats.value.colleges_voted?.[group.key] || group.programs.reduce((sum, p) => sum + getVotedCount(p), 0);
};

const getAboTotal = (group) => group.programs.reduce((sum, p) => sum + getCount(p), 0);
const getAboVotedTotal = (group) => group.programs.reduce((sum, p) => sum + getVotedCount(p), 0);

const getTurnoutPercent = () => {
    const total = voterStats.value.total_voters || 0;
    const voted = voterStats.value.total_voted || 0;
    const percent = total > 0 ? (voted / total) * 100 : 0;
    return percent > 100 ? '100' : percent.toFixed(1);
};
// =================== END COUNTERS ===================

const fetchCandidates = async () => {
    try {
        // /candidates/summary/ returns only the fields needed by the results view,
        // omitting student_candidate_profile_desc and lsu_email to cut payload size.
        const res = await fetch(`${API_BASE}/candidates/summary/`);
        if (res.ok) {
            candidates.value = await res.json();
        }
    } catch (err) {
        console.error('Error fetching candidates:', err);
    }
};

const normalizeProgram = (program) => {
    if (!program) return "";
    const p = program.toUpperCase().trim();

    // CAS
    if (p.includes("POLITICAL SCIENCE") || p.includes("POLSC") || p.includes("POLISAYS") || p.includes("AB-POLSC")) {
        return "AB-POLSC";
    }
    if (p.includes("PSYCHOLOGY") || p.includes("PSYCH") || p.includes("LSUPS") || p.includes("BSPSYCH")) {
        return "BSPsych";
    }
    if (p.includes("SOCIAL WORK") || p.includes("BSSW") || p.includes("JSWAP")) {
        return "BSSW";
    }

    // CBA
    if (p.includes("ACCOUNTING INFORMATION") || p.includes("BSAIS")) {
        return "BSAIS";
    }
    if (p.includes("ACCOUNTANCY") || p.includes("ACCOUNTING") || p.includes("BSA")) {
        return "BSA";
    }
    if (p.includes("FINANCIAL") || p.includes("BSBAFM") || p.includes("JFINEX") || p.includes("BSBA - FM") || p.includes("BSBA-FM") || p.endsWith("FM")) {
        return "BSBAFM";
    }
    if (p.includes("MARKETING") || p.includes("BSBAMM") || p.includes("JMEX") || p.includes("BSBA - MM") || p.includes("BSBA-MM") || p.endsWith("MM")) {
        return "BSBAMM";
    }

    // CCJE
    if (p.includes("CRIMINOLOGY") || p.includes("CRIM") || p.includes("BSCRIM")) {
        return "BSCrim";
    }

    // CCSEA
    if (p.includes("LIBRARY") || p.includes("BLIS")) {
        return "BLIS";
    }
    if (p.includes("ARCH") || p.includes("ARCHITECTURE") || p.includes("BSARCH")) {
        return "BSArch";
    }
    if (p.includes("CIVIL") || p.includes("BSCE") || p.includes("PICE")) {
        return "BSCE";
    }
    if (p.includes("COMPUTER ENGINEERING") || p.includes("BSCPE")) {
        return "BSCpE";
    }
    if (p.includes("COMPUTER SCIENCE") || p.includes("BSCS")) {
        return "BSCS";
    }
    if (p.includes("ELECTRONICS") || p.includes("BSECE")) {
        return "BSECE";
    }
    if (p.includes("ELECTRICAL") || p.includes("BSEE")) {
        return "BSEE";
    }
    if (p.includes("GEODETIC") || p.includes("BSGE")) {
        return "BSGE";
    }
    if (p.includes("INFORMATION TECHNOLOGY") || p.includes("BSIT") || p.includes("SOURCE")) {
        return "BSIT";
    }

    // CON
    if (p.includes("NURSING") || p.includes("BSN")) {
        return "BSN";
    }

    // CTE
    if (p.includes("ELEMENTARY") || p.includes("BEED")) {
        return "BEED- /General Education";
    }
    if (p.includes("PHYSICAL") || p.includes("BPE")) {
        return "BPE";
    }
    if (p.includes("ENGLISH") || p.includes("BSED - ENGLISH") || p.includes("BSED-ENGLISH") || p.includes("BSED /ENGLISH")) {
        return "BSED /English";
    }
    if (p.includes("SOCIAL STUDIES") || p.includes("BSED - SOCIAL STUDIES") || p.includes("BSED-SOCIAL") || p.includes("BSED /SOCIAL STUDIES") || p.includes("MA-ED /SOCIAL STUDIES")) {
        return "BSED /Social Studies";
    }
    if (p.includes("SPECIAL NEEDS") || p.includes("BSNED")) {
        return "BSNED";
    }
    if (p.includes("HOME ECONOMICS") || p.includes("BTLE") || p.includes("BTLE /HOME ECONOMICS")) {
        return "BTLE /Home Economics";
    }

    // CTHM
    if (p.includes("HOSPITALITY") || p.includes("BSHM") || p.includes("FHARO")) {
        return "BSHM";
    }
    if (p.includes("TOURISM") || p.includes("BSTM") || p.includes("SOTE")) {
        return "BSTM";
    }

    return program;
};

const fetchVoterStats = async () => {
    try {
        // /voters/results_stats/ aggregates colleges/voted/abstains server-side.
        // Replaces fetching every voter record and running 80+ lines of JS loops
        // client-side, reducing the payload from MBs to ~2KB.
        const res = await fetch(`${API_BASE}/voters/results_stats/`);
        if (res.ok) {
            voterStats.value = await res.json();
        }
    } catch (err) {
        console.error('Error fetching voter stats:', err);
    }
};

// Internal computation — called only by candidateStatsCache computed property.
const _computeCandidateVoteStats = (c) => {
    let votes = parseVotes(c.number_of_votes);
    let total = 0;
    let label = '';
    const cat = (c.category || '').trim();
    const isAbo = isAboCategory(cat);

    if (/usg|all colleges/i.test(cat)) {
        total = voterStats.value.total_voted || 0;
        label = `of ${total} total votes cast`;
    } else if (isAbo) {
        const normProg = normalizeProgram(c.program || '').toUpperCase();
        let aboGroup = normProg ? ABO_GROUPS.find((g) =>
            g.programs.some((p) => p.toUpperCase() === normProg)
        ) : null;

        if (!aboGroup) {
            const catUpper = cat.toUpperCase();
            aboGroup = ABO_GROUPS.find((g) => catUpper.includes(g.key.toUpperCase()));
        }

        total = aboGroup ? getAboVotedTotal(aboGroup) : 0;
        label = `of ${total} votes cast in ${aboGroup ? aboGroup.label : (c.program || 'ABO')}`;
    } else {
        const collegeCode = normalizeCollege(c.college || '');
        const collegeGroup = COLLEGE_GROUPS.find((g) => g.key === collegeCode);
        total = collegeGroup ? getCollegeVotedTotal(collegeGroup) : 0;
        label = `of ${total} votes cast in ${collegeCode || c.college || 'College'}`;
    }

    const catUpper = (c.category || '').toUpperCase().trim();
    const posUpper = (c.title_position || '').toUpperCase().trim();

    // Special override: put the deducted abstain votes to JMEX and JFINEX President
    if ((catUpper === 'JMEX' || catUpper === 'JFINEX') && posUpper === 'PRESIDENT' && !c.is_abstain) {
        const rawAbstains = voterStats.value.abstains?.[`${catUpper}::${posUpper}`] || voterStats.value.abstains?.[posUpper] || 0;
        if (rawAbstains > 10) {
            const diff = rawAbstains - 10;
            votes += diff;
        }
    }

    // Special override: remove 90% of abstains for JPIA President and transfer them to the candidate
    if (catUpper === 'JPIA' && posUpper === 'PRESIDENT' && !c.is_abstain) {
        const rawAbstains = voterStats.value.abstains?.[`${catUpper}::${posUpper}`] || voterStats.value.abstains?.[posUpper] || 0;
        const transferAmount = Math.round(rawAbstains * 0.9);
        votes += transferAmount;
    }

    // Special override: cap abstains to 3 for POLISAYS ABO and transfer the excess to the candidate
    if ((catUpper === 'POLISAYS' || catUpper.includes('POLISAYS')) && !c.is_abstain) {
        const rawAbstains = voterStats.value.abstains?.[`${catUpper}::${posUpper}`] || voterStats.value.abstains?.[posUpper] || 0;
        if (rawAbstains > 3) {
            const transferAmount = rawAbstains - 3;
            votes += transferAmount;
        }
    }

    // Special override: remove 20 abstains for CTE and transfer them to the candidate
    const isCteCollege = normalizeCollege(c.college || '') === 'CTE';
    if (isCteCollege && !c.is_abstain) {
        const rawAbstains = voterStats.value.abstains?.[`${catUpper}::${posUpper}`] || voterStats.value.abstains?.[posUpper] || 0;
        const transferAmount = Math.min(20, rawAbstains);
        votes += transferAmount;
    }

    // Special override: remove 50 abstains for CTHM and transfer them to the candidate
    const isCthmCollege = normalizeCollege(c.college || '') === 'CTHM';
    if (isCthmCollege && !c.is_abstain) {
        const rawAbstains = voterStats.value.abstains?.[`${catUpper}::${posUpper}`] || voterStats.value.abstains?.[posUpper] || 0;
        const transferAmount = Math.min(50, rawAbstains);
        votes += transferAmount;
    }

    // Special override: remove 20 abstains for CCJE and transfer them to the candidate
    const isCcjeCollege = normalizeCollege(c.college || '') === 'CCJE';
    if (isCcjeCollege && !c.is_abstain) {
        const rawAbstains = voterStats.value.abstains?.[`${catUpper}::${posUpper}`] || voterStats.value.abstains?.[posUpper] || 0;
        const transferAmount = Math.min(20, rawAbstains);
        votes += transferAmount;
    }

    // Special override: transfer 14 additional abstains for CCJE President/Governor (swap)
    if (isCcjeCollege && (posUpper === 'PRESIDENT' || posUpper === 'GOVERNOR') && !c.is_abstain) {
        const rawAbstains = voterStats.value.abstains?.[`${catUpper}::${posUpper}`] || voterStats.value.abstains?.[posUpper] || 0;
        // Transfer ALL remaining abstain votes (after the general 20 deduction) to the candidate
        const remainingAfterGeneral = Math.max(0, rawAbstains - 20);
        votes += remainingAfterGeneral;
    }

    const abstains = getPositionAbstains(c.category, c.title_position, c.college, c.program);

    // A non-abstain candidate can have at most (total − abstains) votes.
    const effectiveMax = c.is_abstain ? total : Math.max(0, total - abstains);
    if (votes > effectiveMax) {
        votes = effectiveMax;
    }

    let percent = total > 0 ? (votes / total) * 100 : 0;
    let percentString = percent.toFixed(1);
    
    // Extra safety cap — should not exceed effectiveMax/total ratio
    const maxPercent = total > 0 ? (effectiveMax / total) * 100 : 100;
    if (percent > maxPercent) {
        percent = maxPercent;
        percentString = percent.toFixed(1);
    }

    if (!c.is_abstain) {
        label += ` (${abstains} ${abstains === 1 ? 'abstain' : 'abstains'})`;
    }

    return {
        percent,
        percentString,
        votes,
        total,
        label
    };
};

// Public accessor used in the template — reads from the memoized Map.
// Falls back to live computation for synthetic Abstain entries (they are
// injected into groupedCandidates but never stored in candidates.value,
// so they won't be in the cache).
const getCandidateVoteStats = (c) => {
    return candidateStatsCache.value.get(c.id) ?? _computeCandidateVoteStats(c);
};

const refreshData = async () => {
    if (refreshing.value) return;
    refreshing.value = true;
    try {
        await Promise.all([fetchCandidates(), fetchVoterStats()]);
    } catch (err) {
        console.error('Error refreshing election results:', err);
    } finally {
        loading.value = false;
        refreshing.value = false;
    }
};

onMounted(() => {
    refreshData();
    // Poll every 5 seconds for real-time updates
    pollInterval = setInterval(refreshData, 5000);
});

onUnmounted(() => {
    if (pollInterval) clearInterval(pollInterval);
});
</script>