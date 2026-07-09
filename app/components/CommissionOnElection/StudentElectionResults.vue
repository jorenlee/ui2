<template>
    <section class="animate-[fadeIn_0.4s_ease-out]">
        <header class="mb-10 pb-8 border-b-2 border-slate-100">
            <div class="flex flex-col items-center justify-center w-full mb-8 gap-6">
                <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/lsu-corporate-logo-green.png"
                    alt="LSU Logo" class="h-20 sm:h-24 object-contain drop-shadow-sm" />
                <div class="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                    <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUCOA.jpg"
                        alt="COA"
                        class="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover shadow-md border-2 border-white" />
                    <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUCOE.jpg"
                        alt="COE"
                        class="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover shadow-md border-2 border-white" />
                    <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUCSO.png"
                        alt="CSO"
                        class="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-contain bg-white shadow-md border-2 border-white p-1" />
                    <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUSAC.jpg"
                        alt="SAC"
                        class="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover shadow-md border-2 border-white" />
                    <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUUSG.jpg"
                        alt="USG"
                        class="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover shadow-md border-2 border-white" />
                    <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUUSGJA.jpg"
                        alt="USGJA"
                        class="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover shadow-md border-2 border-white" />
                </div>
            </div>
            <div
                class="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 text-center sm:text-left">
                <div class="w-full sm:w-auto text-center sm:text-left">
                    <h1 class="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Commission on Election</h1>
                    <p class="text-lg text-slate-500">Live Real-time Student Election Results</p>
                </div>
                <button
                    class="bg-transparent border-2 border-green-600 text-green-600 hover:bg-green-50 px-6 py-2 rounded-lg font-semibold transition-colors shrink-0"
                    @click="refreshData">
                    Refresh Results
                </button>
            </div>
        </header>

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
                    <h2 class="text-xl font-extrabold text-slate-900 tracking-widest whitespace-nowrap">COLLEGES</h2>
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
                                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Voted / Reg
                                </div>
                            </div>
                        </div>
                        <ul class="space-y-1.5">
                            <li v-for="p in g.programs" :key="p" class="flex justify-between text-sm">
                                <span class="text-slate-500">
                                    {{ p }}
                                    <span v-if="getAboForProgram(p)" class="text-[10px] font-bold text-slate-400 ml-1">
                                        ({{ getAboForProgram(p) }})
                                    </span>
                                </span>
                                <span class="font-semibold text-slate-700">
                                    {{ getVotedCount(p) }} <span class="text-xs font-normal text-slate-400">/</span> {{
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
                                    {{ getAboVotedTotal(g) }} <span class="text-xs font-medium text-slate-400">/</span>
                                    {{ getAboTotal(g) }}
                                </div>
                                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Voted / Reg
                                </div>
                            </div>
                        </div>
                        <ul class="space-y-1.5">
                            <li v-for="p in g.programs" :key="p" class="flex justify-between text-sm">
                                <span class="text-slate-500">{{ p }}</span>
                                <span class="font-semibold text-slate-700">
                                    {{ getVotedCount(p) }} <span class="text-xs font-normal text-slate-400">/</span> {{
                                    getCount(p) }}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <!-- =================== END COUNTERS =================== -->

        <div v-if="groupedCandidates.length > 0">
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
let pollInterval = null;

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
        let abstainsCount = voterStats.value.abstains?.[posData.title_position] || 0;
        const isCcje = normalizeCollege(posData.college || '') === 'CCJE';
        if (isCcje) {
            const ccjeCandidates = candidates.value.filter(cand => 
                normalizeCollege(cand.college || '') === 'CCJE' && 
                cand.title_position === posData.title_position
            );
            let maxVotes = 0;
            for (const cand of ccjeCandidates) {
                const v = parseVotes(cand.number_of_votes);
                if (v > maxVotes) maxVotes = v;
            }
            const collegeCode = normalizeCollege(posData.college || '');
            const collegeGroup = COLLEGE_GROUPS.find((g) => g.key === collegeCode);
            const total = collegeGroup ? getCollegeVotedTotal(collegeGroup) : 0;
            abstainsCount = Math.max(0, total - maxVotes);
        }

        const showAbstain = isCcje 
            ? (voterStats.value.abstains?.[posData.title_position] || 0) > 0 
            : abstainsCount > 0;

        if (showAbstain) {
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
    { key: 'CAS', label: 'CAS', programs: ['CAS', 'AB-POLSC', 'BSPsych', 'BSSW'] },
    { key: 'CBA', label: 'CBA', programs: ['CBA', 'BSA', 'BSAIS', 'BSBAFM', 'BSBAMM'] },
    { key: 'CCJE', label: 'CCJE', programs: ['CCJE', 'BSCrim'] },
    { key: 'CCSEA', label: 'CCSEA', programs: ['CCSEA', 'BLIS', 'BSArch', 'BSCE', 'BSCpE', 'BSCS', 'BSECE', 'BSEE', 'BSGE', 'BSIT'] },
    { key: 'CON', label: 'CON', programs: ['CON', 'BSN'] },
    { key: 'CTE', label: 'CTE', programs: ['CTE', 'BEED- /General Education', 'BPE', 'BSED /English', 'BSED /Social Studies', 'BSNED', 'BTLE /Home Economics'] },
    { key: 'CTHM', label: 'CTHM', programs: ['CTHM', 'BSHM', 'BSTM'] },
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
    return group.programs.reduce((sum, p) => sum + getCount(p), 0);
};

const getCollegeVotedTotal = (group) => {
    return group.programs.reduce((sum, p) => sum + getVotedCount(p), 0);
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
        const res = await fetch(`${API_BASE}/candidates/`);
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
    if (p.includes("FINANCIAL") || p.includes("BSBAFM") || p.includes("JFINEX")) {
        return "BSBAFM";
    }
    if (p.includes("MARKETING") || p.includes("BSBAMM") || p.includes("JMEX")) {
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
        const res = await fetch(`${API_BASE}/voters/`);
        if (res.ok) {
            const voters = await res.json();

            const total_voters = voters.length;
            let total_voted = 0;

            const colleges = {};
            const voted = {};
            const abstains = {};

            for (const voter of voters) {
                const p_raw = voter.program || "";
                const c_raw = voter.college || "";

                const p_norm = normalizeProgram(p_raw);
                const c_norm = c_raw.toUpperCase().trim();

                const hasVoted = voter.has_voted === true || voter.has_voted === "True" || voter.has_voted === "Yes" || voter.has_voted === "1";

                if (hasVoted) {
                    total_voted += 1;
                }

                // Count registered.
                // Primary: index by normalised program code (e.g. "AB-POLSC").
                // Fallback: when the program field is empty/unrecognised, index by
                //   normalised college code (e.g. "CAS") so the college-level totals
                //   still capture these voters without double-counting.
                if (p_norm) {
                    const p_norm_upper = p_norm.toUpperCase();
                    colleges[p_norm_upper] = (colleges[p_norm_upper] || 0) + 1;
                    if (p_norm_upper !== p_norm) {
                        colleges[p_norm] = (colleges[p_norm] || 0) + 1;
                    }
                } else if (c_norm) {
                    const c_code = normalizeCollege(c_norm);
                    if (c_code) {
                        colleges[c_code] = (colleges[c_code] || 0) + 1;
                    }
                }

                // Count voted (same primary/fallback logic).
                if (hasVoted) {
                    if (p_norm) {
                        const p_norm_upper = p_norm.toUpperCase();
                        voted[p_norm_upper] = (voted[p_norm_upper] || 0) + 1;
                        if (p_norm_upper !== p_norm) {
                            voted[p_norm] = (voted[p_norm] || 0) + 1;
                        }
                    } else if (c_norm) {
                        const c_code = normalizeCollege(c_norm);
                        if (c_code) {
                            voted[c_code] = (voted[c_code] || 0) + 1;
                        }
                    }
                }

                // Count abstains.
                if (voter.voted_candidates && Array.isArray(voter.voted_candidates)) {
                    for (const vc of voter.voted_candidates) {
                        if (vc.student_name === 'Abstain' && vc.lsu_id_number === 'ABSTAIN') {
                            const pos = vc.title_position;
                            if (pos) {
                                abstains[pos] = (abstains[pos] || 0) + 1;
                            }
                        }
                    }
                }
            }

            voterStats.value = {
                total_voters,
                total_voted,
                colleges,
                voted,
                abstains
            };
            ;
        }
    } catch (err) {
        console.error('Error fetching voter stats:', err);
    }
};

const getCandidateVoteStats = (c) => {
    let votes = parseVotes(c.number_of_votes);
    let total = 0;
    let label = '';
    const cat = (c.category || '').trim();

    if (/usg|all colleges/i.test(cat)) {
        total = voterStats.value.total_voted || 0;
        label = `of ${total} total votes cast`;
    } else if (isAboCategory(cat)) {
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

    const abstains = voterStats.value.abstains?.[c.title_position] || 0;

    // CCJE is exempt from the abstain deduction (small population — all-abstain
    // scenarios are valid and should not distort the percentages).
    const isCcje = normalizeCollege(c.college || '') === 'CCJE';

    // For CCJE, calculate display/label abstains as total - max(candidate_votes)
    let displayAbstains = abstains;
    if (isCcje) {
        const ccjeCandidates = candidates.value.filter(cand => 
            normalizeCollege(cand.college || '') === 'CCJE' && 
            cand.title_position === c.title_position
        );
        let maxVotes = 0;
        for (const cand of ccjeCandidates) {
            const v = parseVotes(cand.number_of_votes);
            if (v > maxVotes) maxVotes = v;
        }
        displayAbstains = Math.max(0, total - maxVotes);
    }

    // A non-abstain candidate can have at most (total − abstains) votes, UNLESS
    // the candidate belongs to CCJE, in which case use the plain total.
    const effectiveMax = (c.is_abstain || isCcje) ? total : Math.max(0, total - abstains);
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
        label += ` (${displayAbstains} ${displayAbstains === 1 ? 'abstain' : 'abstains'})`;
    }

    return {
        percent,
        percentString,
        votes,
        total,
        label
    };
};

const refreshData = async () => {
    await Promise.all([fetchCandidates(), fetchVoterStats()]);
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