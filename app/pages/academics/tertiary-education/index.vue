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

const isBachelorProgram = (item) => {
  if (!item || !item.title) return false;
  const title = item.title.trim().toLowerCase();
  const filters = (item.filters || item.filter || "").toLowerCase();
  const category = (item.category || "").toLowerCase();

  const hasBachelorTitle =
    title.includes("bachelor") ||
    title.startsWith("bs ") ||
    title.startsWith("bs") ||
    title.startsWith("ba ") ||
    title.includes("bachelor of");

  const hasAbbrParentheses = /\([a-z0-9-]{2,8}\)/i.test(item.title);
  const hasProgramFilter = filters.includes("programs") || category.includes("programs");

  return hasBachelorTitle || (hasProgramFilter && hasAbbrParentheses);
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

const fetchCMSPrograms = async () => {
  try {
    const res = await $fetch(endpoint.value + "/api/cms/content/list/").catch(() => null);
    if (res && Array.isArray(res)) {
      const cloned = JSON.parse(JSON.stringify(tertiaryJSON.tertiary));

      cloned.forEach((t) => {
        if (t.under_grad) {
          t.under_grad.forEach((tu) => {
            if (tu.list) {
              tu.list.forEach((college) => {
                const cAbbr = (college.abbr || "").toLowerCase();
                if (!cAbbr) return;

                // 1. Find CMS list items corresponding to this college and filter ONLY Bachelor programs
                const cmsItems = res.filter((item) => {
                  if (!item) return false;
                  const filters = (item.filters || item.filter || "").toLowerCase();
                  const title = (item.title || "").toLowerCase();
                  const desc = (item.descriptions || item.description || "").toLowerCase();

                  const matchesCollege =
                    filters.includes(cAbbr) ||
                    title.includes(cAbbr) ||
                    desc.includes(cAbbr);

                  return matchesCollege && isBachelorProgram(item);
                });

                if (cmsItems.length > 0) {
                  // Dynamically map CMS list items directly to college programs
                  college.programs = cmsItems.map((cmsItem) => {
                    return {
                      id: cmsItem.id || cmsItem.content_id,
                      title: cmsItem.title,
                      description: cmsItem.descriptions || cmsItem.description || "",
                      filters: cmsItem.filters || "",
                      cmsData: cmsItem,
                    };
                  });
                }

                // 2. Find College VMG / College Info item from CMS for this college (e.g., CCSEA Vision Mission Goal)
                const vmgItem = res.find((item) => {
                  if (!item) return false;
                  const filters = (item.filters || item.filter || "").toLowerCase();
                  const title = (item.title || "").toLowerCase();
                  const desc = (item.descriptions || item.description || "").toLowerCase();

                  const matchesCollege =
                    filters.includes(cAbbr) ||
                    title.includes(cAbbr) ||
                    desc.includes(cAbbr) ||
                    (college.title && title.includes(college.title.toLowerCase()));

                  const isVmgKeyword =
                    filters.includes("vision") ||
                    filters.includes("mission") ||
                    filters.includes("goal") ||
                    filters.includes("college") ||
                    title.includes("vision") ||
                    title.includes("mission") ||
                    title.includes("goal") ||
                    title.includes("vmg") ||
                    desc.includes("vision") ||
                    desc.includes("mission") ||
                    desc.includes("goal");

                  const isNotBachelor = !isBachelorProgram(item);

                  return matchesCollege && (isVmgKeyword || isNotBachelor);
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
                  class="bg-white border border-gray-200 transition-all duration-150" :class="a.active
                    ? 'border-l-[3px] border-l-green-900'
                    : 'border-l-[3px] border-l-transparent hover:border-l-green-900'">
                  <!-- Card Header -->
                  <div class="flex items-center justify-between py-3.5 px-4 cursor-pointer gap-4"
                    @click="a.active = !a.active">
                    <div class="flex items-baseline gap-3 min-w-0">
                      <span
                        class="text-[0.65rem] font-bold tracking-wider text-green-900 font-mono whitespace-nowrap bg-green-50 px-1.5 py-0.5 border border-green-200 shrink-0">{{
                          a.abbr }}</span>
                      <span class="text-[0.82rem] font-semibold text-gray-900 text-left leading-snug">{{ a.title
                      }}</span>
                    </div>
                    <div class="text-green-900 text-xs shrink-0 w-5 text-center">
                      <i class="fas" :class="a.active ? 'fa-minus' : 'fa-plus'"></i>
                    </div>
                  </div>

                  <!-- Card Body -->
                  <div v-if="a.active" class="border-t border-gray-100 bg-gray-50 px-5 py-4">
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

    <!-- ── COMING SOON ── -->
    <section class="cs-section bg-[#0f2413] py-20 px-[5%] text-center relative overflow-hidden">
      <div class="relative z-10 max-w-[640px] mx-auto">
        <div class="text-[0.65rem] font-bold tracking-[0.3em] text-green-500 mb-3">UPCOMING</div>
        <h2 class="text-2xl lg:text-3xl font-extrabold text-white tracking-wide uppercase mb-5">More Courses Coming Soon
        </h2>
        <div class="w-10 h-0.5 bg-green-500 mx-auto mb-6"></div>
        <p class="text-sm text-white/65 leading-relaxed mb-8">
          We are continuously expanding our academic offerings. Stay tuned for
          exciting new programs and courses designed to prepare you for the future.
        </p>
        <div class="flex flex-wrap justify-center gap-2 mb-7">
          <span
            class="border border-white/25 text-white/85 px-3.5 py-1 text-[0.72rem] font-semibold tracking-wider uppercase cursor-default transition-all duration-200 hover:bg-green-500/10 hover:border-green-500">Graduate
            Programs</span>
          <span
            class="border border-white/25 text-white/85 px-3.5 py-1 text-[0.72rem] font-semibold tracking-wider uppercase cursor-default transition-all duration-200 hover:bg-green-500/10 hover:border-green-500">Professional
            Courses</span>
          <span
            class="border border-white/25 text-white/85 px-3.5 py-1 text-[0.72rem] font-semibold tracking-wider uppercase cursor-default transition-all duration-200 hover:bg-green-500/10 hover:border-green-500">Certifications</span>
        </div>
        <p class="text-xs text-white/40">
          <i class="fas fa-bell text-yellow-400 mr-1"></i>&nbsp; Check back regularly for updates.
        </p>
      </div>
    </section>

    <Footer />
  </div>
</template>

<style scoped>
/* Pseudo-element grid overlay — the only thing Tailwind can't handle inline */
.cs-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(90deg,
      transparent,
      transparent 59px,
      rgba(255, 255, 255, 0.02) 60px);
  pointer-events: none;
}
</style>