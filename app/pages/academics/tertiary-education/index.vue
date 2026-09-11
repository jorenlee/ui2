<script setup>
import { ref, onMounted } from "vue";
import tertiaryJSON from "./tertiary.json";

const tertiary = ref(JSON.parse(JSON.stringify(tertiaryJSON.tertiary)));

const underGrad = ref(true);
const gradStud = ref(false);

const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);

const schoolToggle = (a, b) => {
  underGrad.value = a;
  gradStud.value = b;
};

const isCollegeEnabled = (college) => {
  if (!college) return false;
  return Boolean(
    (college.programs && college.programs.length > 0) ||
    college.vmgItem ||
    college.abbr
  );
};

const getProgramSlug = (p, fallbackLink) => {
  if (!p) return `/academics/tertiary-education/${fallbackLink || ''}`;
  if (p.id) return `/academics/tertiary-education/${p.id}`;
  if (p.content_id) return `/academics/tertiary-education/${p.content_id}`;
  if (p.abbr) return `/academics/tertiary-education/${p.abbr.toLowerCase()}`;
  if (p.title) {
    const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return `/academics/tertiary-education/${slug}`;
  }
  return `/academics/tertiary-education/${fallbackLink || ''}`;
};

// Check if an item is a Graduate degree program (Master, Doctor, JD, PhD, etc.)
const isGraduateProgram = (item) => {
  if (!item || !item.title) return false;
  const title = item.title.trim().toLowerCase();
  const filters = (item.filters || item.filter || "").toLowerCase();
  const category = (item.category || "").toLowerCase();

  return (
    title.includes("doctor") ||
    title.includes("master") ||
    title.includes("ph.d") ||
    title.includes("phd") ||
    title.includes("juris doctor") ||
    title.includes("post-graduate") ||
    title.includes("postgraduate") ||
    /\b(dba|mba|mpa|med|maed|msn|mit|jd)\b/i.test(title) ||
    filters.includes("graduate studies") ||
    filters.includes("school of graduate") ||
    filters.includes("sgs") ||
    category.includes("graduate")
  );
};

// Check if an item is a College VMG / College Info item (NOT a degree program)
const isCollegeVmgItem = (item) => {
  if (!item || !item.title) return false;
  const title = item.title.trim().toLowerCase();
  const filters = (item.filters || item.filter || "").toLowerCase();

  // If title contains degree program indicators, it cannot be a VMG item
  if (
    title.includes("bachelor") ||
    title.startsWith("bs ") ||
    title.startsWith("bs") ||
    title.startsWith("ba ") ||
    title.startsWith("ba") ||
    title.startsWith("bee") ||
    title.startsWith("bpe") ||
    title.startsWith("btle") ||
    title.startsWith("blis") ||
    title.includes("master") ||
    title.includes("doctor") ||
    title.includes("juris doctor")
  ) {
    return false;
  }

  const hasVmgTitle =
    title.includes("vision") ||
    title.includes("mission") ||
    title.includes("goal") ||
    title.includes("vmg") ||
    title.includes("objectives") ||
    title.includes("college info") ||
    title.includes("college overview") ||
    title.includes("about the college");

  const hasVmgFilter =
    filters.includes("vision") ||
    filters.includes("mission") ||
    filters.includes("vmg");

  return hasVmgTitle || hasVmgFilter;
};

// Check if an item is an Undergraduate / Bachelor degree program
const isUndergradProgram = (item) => {
  if (!item || !item.title) return false;
  // Strictly EXCLUDE graduate programs
  if (isGraduateProgram(item)) return false;
  // Strictly EXCLUDE VMG items
  if (isCollegeVmgItem(item)) return false;

  const title = item.title.trim().toLowerCase();
  const filters = (item.filters || item.filter || "").toLowerCase();
  const category = (item.category || "").toLowerCase();

  const hasBachelorKeyword =
    title.includes("bachelor") ||
    title.startsWith("bs ") ||
    title.startsWith("bs") ||
    title.startsWith("ba ") ||
    title.startsWith("ba") ||
    title.startsWith("bee") ||
    title.startsWith("bpe") ||
    title.startsWith("btle") ||
    title.startsWith("blis") ||
    title.includes("diploma") ||
    title.includes("associate");

  const hasAbbrParentheses = /\([a-z0-9-]{2,8}\)/i.test(item.title);
  const hasProgramFilter = filters.includes("programs") || category.includes("programs");

  return hasBachelorKeyword || (hasProgramFilter && hasAbbrParentheses) || hasProgramFilter;
};

const isCollegeMatch = (cmsItem, college) => {
  if (!cmsItem || !college) return false;
  const cAbbr = (college.abbr || "").trim().toLowerCase();
  const cTitle = (college.title || "").trim().toLowerCase();
  const filters = (cmsItem.filters || cmsItem.filter || "").toLowerCase();
  const title = (cmsItem.title || "").toLowerCase();

  // 1. Exact or regex word boundary check on abbreviation
  if (cAbbr) {
    const regexAbbr = new RegExp(`(^|[^a-zA-Z0-9])${cAbbr}([^a-zA-Z0-9]|$)`, "i");
    if (regexAbbr.test(filters) || regexAbbr.test(title)) return true;
  }

  // 2. Full college title in filters or title
  if (cTitle && (filters.includes(cTitle) || title.includes(cTitle))) return true;

  // 3. Check known college keywords / aliases
  const aliases = {
    cas: ["arts and sciences", "college of arts and sciences"],
    cba: ["business and accountancy", "college of business and accountancy"],
    ccje: ["criminal justice", "criminal justice education", "college of criminal justice"],
    ccsea: [
      "computer studies",
      "engineering and architecture",
      "engineering, and architecture",
      "college of computer studies",
      "college of engineering",
    ],
    con: ["college of nursing", "nursing department", "school of nursing"],
    cte: ["teacher education", "college of teacher education", "education department"],
    cthm: ["tourism and hospitality", "hospitality management", "college of tourism"],
    cmls: ["medical laboratory science", "college of medical laboratory"],
    sgs: ["graduate studies", "school of graduate studies", "graduate school"],
  };

  const collegeAliases = aliases[cAbbr] || [];
  for (const alias of collegeAliases) {
    if (filters.includes(alias) || title.includes(alias)) return true;
  }

  // 4. Check if CMS item title matches any default programs defined for this college in tertiary.json
  if (Array.isArray(college.programs)) {
    for (const prog of college.programs) {
      const pTitle = (prog.title || "").trim().toLowerCase();
      const pAbbr = (prog.abbr || "").trim().toLowerCase();
      if (pAbbr) {
        const regexPAbbr = new RegExp(`(^|[^a-zA-Z0-9])${pAbbr}([^a-zA-Z0-9]|$)`, "i");
        if (regexPAbbr.test(title) || regexPAbbr.test(filters)) return true;
      }
      if (pTitle && (title.includes(pTitle) || pTitle.includes(title))) return true;
    }
  }

  return false;
};

const getCollegeVmgSlug = (college) => {
  if (college.vmgItem && (college.vmgItem.id || college.vmgItem.content_id)) {
    return `/academics/tertiary-education/${college.vmgItem.id || college.vmgItem.content_id}`;
  }
  if (college.abbr) {
    return `/academics/tertiary-education/${college.abbr.toLowerCase()}`;
  }
  if (college.link) {
    return `/academics/tertiary-education/${college.link}`;
  }
  return `/academics/tertiary-education`;
};

// Helper to remove duplicate programs by normalized title
const dedupePrograms = (programs) => {
  const seen = new Set();
  return programs.filter((p) => {
    if (!p || !p.title) return false;
    const norm = p.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (seen.has(norm)) return false;
    seen.add(norm);
    return true;
  });
};

const fetchCMSPrograms = async () => {
  try {
    const res = await $fetch(endpoint.value + "/api/cms/content/list/").catch(() => null);
    if (res && Array.isArray(res)) {
      const cloned = JSON.parse(JSON.stringify(tertiaryJSON.tertiary));

      cloned.forEach((t) => {
        // ── 1. Undergraduate Studies Colleges ──
        if (t.under_grad) {
          t.under_grad.forEach((tu) => {
            if (tu.list) {
              tu.list.forEach((college) => {
                const cAbbr = (college.abbr || "").toLowerCase();
                if (!cAbbr) return;

                // Find CMS list items corresponding to this college that are STRICTLY UNDERGRADUATE programs
                const cmsItems = res.filter((item) => {
                  if (!item) return false;
                  return isCollegeMatch(item, college) && isUndergradProgram(item);
                });

                if (cmsItems.length > 0) {
                  // Dynamically map CMS list items directly to college programs (deduplicated)
                  const mapped = cmsItems.map((cmsItem) => {
                    return {
                      id: cmsItem.id || cmsItem.content_id,
                      title: cmsItem.title,
                      description: cmsItem.descriptions || cmsItem.description || "",
                      filters: cmsItem.filters || "",
                      cmsData: cmsItem,
                    };
                  });
                  college.programs = dedupePrograms(mapped);
                }

                // Find College VMG / College Info item from CMS for this college
                const vmgItem = res.find((item) => {
                  if (!item) return false;
                  return isCollegeMatch(item, college) && isCollegeVmgItem(item);
                });

                if (vmgItem) {
                  college.vmgItem = {
                    id: vmgItem.id || vmgItem.content_id,
                    title: vmgItem.title || `${college.abbr} Vision Mission Goal`,
                    description: vmgItem.descriptions || vmgItem.description || "",
                    filters: vmgItem.filters || "",
                    cmsData: vmgItem,
                  };
                }
              });
            }
          });
        }

        // ── 2. Graduate Studies (SGS) ──
        if (t.grad_stud) {
          t.grad_stud.forEach((tg) => {
            if (tg.list) {
              tg.list.forEach((college) => {
                // Find all Graduate CMS items
                const gradCmsItems = res.filter((item) => {
                  if (!item) return false;
                  return isGraduateProgram(item) || isCollegeMatch(item, college);
                });

                // Attach matching CMS item IDs to grad programs in Graduate School categories
                if (college.category && Array.isArray(college.category)) {
                  college.category.forEach((cat) => {
                    if (cat.programs && Array.isArray(cat.programs)) {
                      cat.programs.forEach((p) => {
                        const pTitle = (p.title || "").toLowerCase().trim();
                        const pNorm = pTitle.replace(/[^a-z0-9]/g, "");

                        const matchedCms = gradCmsItems.find((ci) => {
                          const ciTitle = (ci.title || "").toLowerCase().trim();
                          const ciNorm = ciTitle.replace(/[^a-z0-9]/g, "");
                          return (
                            ciTitle.includes(pTitle) ||
                            pTitle.includes(ciTitle) ||
                            ciNorm.includes(pNorm) ||
                            pNorm.includes(ciNorm)
                          );
                        });

                        if (matchedCms) {
                          p.id = matchedCms.id || matchedCms.content_id;
                          p.cmsData = matchedCms;
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
      tertiary.value = cloned;
    }
  } catch (error) {
    console.error("Error fetching CMS content list for colleges:", error);
  }
};

onMounted(async () => {
  await fetchCMSPrograms();
});
</script>

<template>
  <div class="bg-gray-50">
    <Header />

    <!-- ── HERO BANNER ── -->
    <div class="relative overflow-hidden">
      <Banner />
      <img
        src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
        class="hidden max-lg:block w-full h-36 object-none align-top" />
      <div class="absolute inset-0 flex items-center px-[5%] pointer-events-none">
        <h1 class="uppercase text-white text-lg lg:text-2xl tracking-[0.18em] pointer-events-auto">
          Tertiary Education
        </h1>
      </div>
    </div>

    <!-- ── BREADCRUMB ── -->
    <nav class="bg-white border-b border-gray-200 px-[5%]">
      <ul
        class="flex items-center flex-wrap gap-x-1.5 h-10 text-[0.72rem] text-gray-500 overflow-x-auto whitespace-nowrap list-none m-0 p-0">
        <li class="flex items-center gap-1.5">
          <a href="/" class="text-green-900 no-underline capitalize hover:underline">Home</a>
        </li>
        <li class="flex items-center gap-1.5">
          <i class="fas fa-chevron-right text-[0.6rem] text-gray-400"></i>
          <a href="/academics/tertiary-education"
            class="text-green-900 no-underline capitalize hover:underline">Academics</a>
        </li>
        <li class="flex items-center gap-1.5">
          <i class="fas fa-chevron-right text-[0.6rem] text-gray-400"></i>
          <a href="/academics/tertiary-education"
            class="text-green-900 no-underline capitalize hover:underline">Tertiary Education</a>
        </li>
        <li class="flex items-center gap-1.5">
          <i class="fas fa-chevron-right text-[0.6rem] text-gray-400"></i>
          <span class="capitalize text-gray-400">Degree Programs</span>
        </li>
      </ul>
    </nav>

    <!-- ── MAIN CONTENT ── -->
    <div class="max-w-[1280px] mx-auto px-[5%] pt-10 pb-16">
      <div class="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 lg:gap-10 items-start">

        <!-- LEFT SIDEBAR NAV -->
        <aside class="sticky top-6">
          <div class="text-[0.65rem] font-bold tracking-[0.2em] text-gray-400 mb-3 pl-4">BROWSE BY</div>
          <div v-for="(t, i) in tertiary" :key="i">
            <!-- Undergrad tab -->
            <div v-for="(tu, j) in t.under_grad" :key="'u' + j"
              class="flex items-center gap-2.5 py-3 px-4 mb-1 bg-white border border-gray-200 cursor-pointer transition-all duration-150"
              :class="underGrad
                ? 'border-l-[3px] border-l-green-900'
                : 'border-l-[3px] border-l-transparent hover:border-l-green-700 hover:bg-green-50'"
              @click="schoolToggle(true, false)">
              <span class="w-[5px] h-[5px] shrink-0 transition-colors duration-150"
                :class="underGrad ? 'bg-green-900' : 'bg-gray-300'"></span>
              <span class="text-xs font-semibold tracking-wide uppercase transition-colors duration-150"
                :class="underGrad ? 'text-green-900' : 'text-gray-600'">{{ tu.title }}</span>
            </div>
            <!-- Graduate tab -->
            <div v-for="(tu, j) in t.grad_stud" :key="'g' + j"
              class="flex items-center gap-2.5 py-3 px-4 mb-1 bg-white border border-gray-200 cursor-pointer transition-all duration-150"
              :class="gradStud
                ? 'border-l-[3px] border-l-green-900'
                : 'border-l-[3px] border-l-transparent hover:border-l-green-700 hover:bg-green-50'"
              @click="schoolToggle(false, true)">
              <span class="w-[5px] h-[5px] shrink-0 transition-colors duration-150"
                :class="gradStud ? 'bg-green-900' : 'bg-gray-300'"></span>
              <span class="text-xs font-semibold tracking-wide uppercase transition-colors duration-150"
                :class="gradStud ? 'text-green-900' : 'text-gray-600'">{{ tu.title }}</span>
            </div>
          </div>
        </aside>

        <!-- RIGHT CONTENT AREA -->
        <main>
          <div v-for="(t, i) in tertiary" :key="i">

            <!-- ── UNDERGRADUATE ── -->
            <div v-for="(tu, j) in t.under_grad" :key="'ug' + j" v-show="underGrad" class="mb-8">
              <!-- Section heading -->
              <div class="flex items-center gap-4 mb-5">
                <span class="block w-7 h-0.5 bg-green-900 shrink-0"></span>
                <span class="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-green-900">{{ tu.title }}</span>
              </div>

              <!-- Accordion list -->
              <div class="flex flex-col gap-0.5">
                <div v-for="(a, k) in tu.list" :key="k"
                  class="bg-white border border-gray-200 transition-all duration-150" :class="[
                    a.active && isCollegeEnabled(a)
                      ? 'border-l-[3px] border-l-green-900'
                      : 'border-l-[3px] border-l-transparent',
                    isCollegeEnabled(a)
                      ? 'hover:border-l-green-900'
                      : 'opacity-60'
                  ]">
                  <!-- Card Header -->
                  <div class="flex items-center justify-between py-3.5 px-4 gap-4"
                    :class="isCollegeEnabled(a) ? 'cursor-pointer' : 'cursor-default'"
                    @click="isCollegeEnabled(a) && (a.active = !a.active)">
                    <div class="flex items-baseline gap-3 min-w-0">
                      <span
                        class="text-[0.65rem] font-bold tracking-wider font-mono whitespace-nowrap px-1.5 py-0.5 border shrink-0"
                        :class="isCollegeEnabled(a)
                          ? 'text-green-900 bg-green-50 border-green-200'
                          : 'text-gray-400 bg-gray-100 border-gray-200'">{{
                          a.abbr }}</span>
                      <span class="text-[0.82rem] font-semibold text-left leading-snug"
                        :class="isCollegeEnabled(a) ? 'text-gray-900' : 'text-gray-400'">{{ a.title
                      }}</span>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                      <span v-if="!isCollegeEnabled(a)"
                        class="text-[0.6rem] font-bold tracking-wider uppercase text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-sm whitespace-nowrap"
                      >Coming Soon</span>
                      <div v-if="isCollegeEnabled(a)" class="text-green-900 text-xs w-5 text-center">
                        <i class="fas" :class="a.active ? 'fa-minus' : 'fa-plus'"></i>
                      </div>
                    </div>
                  </div>

                  <!-- Card Body -->
                  <div v-if="a.active && isCollegeEnabled(a)" class="border-t border-gray-100 bg-gray-50 px-5 py-4">
                    <!-- College Level Info & VMG Link -->
                    <div class="mb-3.5 pb-3 border-b border-gray-200">
                      <NuxtLink
                        :to="getCollegeVmgSlug(a)"
                        class="flex items-center justify-between p-3 bg-green-900/5 hover:bg-green-900/10 border border-green-900/20 rounded-lg text-green-900 transition-all group no-underline shadow-sm"
                      >
                        <div class="flex items-center gap-3 min-w-0">
                          <div class="w-8 h-8 rounded-md bg-green-900 text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
                            <i class="fas fa-bullseye"></i>
                          </div>
                          <div class="min-w-0">
                            <div class="text-xs font-extrabold uppercase tracking-wide group-hover:text-green-950 flex items-center gap-2 truncate">
                              <span class="truncate">{{ a.vmgItem?.title || `${a.abbr} Vision, Mission & Goals` }}</span>
                              <span class="text-[0.6rem] bg-green-100 text-green-900 font-mono px-1.5 py-0.5 rounded border border-green-200 shrink-0">College Info</span>
                            </div>
                            <div class="text-[0.7rem] text-gray-600 truncate">
                              View Vision, Mission, Goals & Objectives for {{ a.title }}
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center gap-1.5 text-xs font-bold text-green-900 shrink-0 group-hover:translate-x-0.5 transition-transform ml-2">
                          <span class="hidden sm:inline">View VMG</span>
                          <i class="fas fa-chevron-right text-[0.65rem]"></i>
                        </div>
                      </NuxtLink>
                    </div>

                    <!-- Degree Programs List -->
                    <div class="text-[0.65rem] font-bold tracking-[0.15em] text-gray-500 uppercase mb-2">
                      DEGREE PROGRAMS
                    </div>

                    <ul class="list-none m-0 p-0 pl-2 border-l-2 border-gray-200">
                      <li v-for="(p, l) in a.programs" :key="l"
                        class="flex items-baseline gap-2 py-1 border-b border-dashed border-gray-200 last:border-b-0 group">
                        <span class="text-green-900 text-xs shrink-0 font-bold">—</span>
                        <NuxtLink :to="getProgramSlug(p, a.link)"
                          class="text-[0.78rem] text-gray-800 transition-colors duration-100 group-hover:text-green-900 group-hover:font-semibold no-underline flex-1">
                          {{ p.title }}
                        </NuxtLink>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── GRADUATE STUDIES ── -->
            <div v-for="(tu, j) in t.grad_stud" :key="'gs' + j" v-show="gradStud" class="mb-8">
              <!-- Section heading -->
              <div class="flex items-center gap-4 mb-5">
                <span class="block w-7 h-0.5 bg-green-900 shrink-0"></span>
                <span class="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-green-900">{{ tu.title }}</span>
              </div>

              <div v-for="(a, k) in tu.list" :key="k"
                class="bg-white border border-gray-200 border-l-[3px] border-l-green-900 mb-1">
                <!-- Grad Card Identity Panel -->
                <div
                  class="flex items-center gap-5 py-4 px-5 cursor-pointer border-b border-gray-100 transition-colors duration-150 hover:bg-green-50/30"
                  @click="a.active = !a.active">
                  <img
                    src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/colleges/gradschool2025.jpg"
                    class="w-12 h-auto shrink-0" :alt="a.logo" />
                  <div class="flex-1 text-[0.82rem] font-bold text-green-900 uppercase tracking-wide">{{ a.title }}
                  </div>
                  <div class="text-[0.68rem] text-gray-400 flex items-center gap-1.5 whitespace-nowrap">
                    <i class="fas text-green-900" :class="a.active ? 'fa-minus' : 'fa-plus'"></i>
                    {{ a.active ? 'Collapse' : 'View Programs' }}
                  </div>
                </div>

                <!-- Grad Card Programs -->
                <div v-if="a.active" class="p-5 bg-gray-50">
                  <NuxtLink :to="getProgramSlug(a, 'programs')"
                    class="block text-[0.78rem] font-bold uppercase tracking-wider text-green-900 no-underline hover:underline mb-4 pb-2 border-b border-gray-200">{{
                      a.title }}</NuxtLink>

                  <ul class="list-none p-0 m-0">
                    <li v-for="(c, l) in a.category" :key="l" class="mb-4">
                      <div
                        class="text-[0.72rem] font-bold tracking-widest uppercase text-gray-500 mb-2 pl-3 border-l-2 border-green-900">
                        {{ c.title }}</div>
                      <ul class="list-none p-0 m-0">
                        <li v-for="(p, m) in c.programs" :key="m" class="py-0.5 pl-5 group">
                          <NuxtLink :to="getProgramSlug(p, 'programs')"
                            class="text-[0.78rem] text-gray-800 transition-colors duration-100 group-hover:text-green-900 group-hover:font-semibold no-underline block">
                            {{ p.title }}
                          </NuxtLink>
                          <div v-for="(j, n) in p.major" :key="n" class="text-[0.72rem] text-gray-500 pl-3">
                            <span v-if="j !== ''">&#8212; {{ j }}</span>
                          </div>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
    <Footer />
  </div>
</template>

<style scoped>
</style>