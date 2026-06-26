<script setup>
import tertiaryJSON from "./tertiary.json";
const tertiary = ref(tertiaryJSON.tertiary);

const underGrad = ref(true);
const gradStud = ref(false);

const schoolToggle = (a, b) => {
  underGrad.value = a;
  gradStud.value = b;
};
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
                    <a :href="`/academics/tertiary-education/${a.link}`" class="block no-underline">
                      <ul class="list-none m-0 p-0 pl-2 border-l-2 border-gray-200">
                        <li v-for="(p, l) in a.programs" :key="l"
                          class="flex items-baseline gap-2 py-1 border-b border-dashed border-gray-200 last:border-b-0 group">
                          <span class="text-green-900 text-xs shrink-0 font-bold">—</span>
                          <span
                            class="text-[0.78rem] text-gray-800 transition-colors duration-100 group-hover:text-green-900 group-hover:font-semibold">{{
                              p.title }}</span>
                        </li>
                      </ul>
                    </a>
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
                  <a href="/academics/tertiary-education/programs"
                    class="block text-[0.78rem] font-bold uppercase tracking-wider text-green-900 no-underline hover:underline mb-4 pb-2 border-b border-gray-200">{{
                      a.title }}</a>

                  <ul class="list-none p-0 m-0">
                    <li v-for="(c, l) in a.category" :key="l" class="mb-4">
                      <div
                        class="text-[0.72rem] font-bold tracking-widest uppercase text-gray-500 mb-2 pl-3 border-l-2 border-green-900">
                        {{ c.title }}</div>
                      <ul class="list-none p-0 m-0">
                        <li v-for="(p, m) in c.programs" :key="m" class="py-0.5 pl-5 group">
                          <div
                            class="text-[0.78rem] text-gray-800 transition-colors duration-100 group-hover:text-green-900 group-hover:font-semibold">
                            {{ p.title }}</div>
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