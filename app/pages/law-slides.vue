<template>
  <div
    class="min-h-screen text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors duration-500 relative overflow-x-hidden"
    :class="isDark ? 'bg-[#060911] text-slate-100' : 'bg-[#f4f1ea] text-slate-900'"
  >
    <!-- Background Ambient Lighting / Subtle Noise -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div
        class="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[130px] opacity-25"
        :class="isDark ? 'bg-emerald-600' : 'bg-emerald-400'"
      ></div>
      <div
        class="absolute top-1/3 -right-40 w-96 h-96 rounded-full blur-[140px] opacity-20"
        :class="isDark ? 'bg-amber-500' : 'bg-amber-300'"
      ></div>
      <div
        class="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full blur-[150px] opacity-15"
        :class="isDark ? 'bg-blue-600' : 'bg-blue-300'"
      ></div>
      <!-- Subtle scales watermark -->
      <div class="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none">
        <i class="fa-solid fa-scale-balanced text-[600px]"></i>
      </div>
    </div>

    <!-- Main Navigation Bar -->
    <header
      class="sticky top-0 z-40 backdrop-blur-md border-b px-4 sm:px-6 py-3 transition-colors duration-300"
      :class="isDark ? 'bg-[#090d16]/85 border-amber-500/20 shadow-lg shadow-black/40' : 'bg-[#f4f1ea]/90 border-amber-700/20 shadow-md'"
    >
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <!-- Logo / Title -->
        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="group flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-950 flex items-center justify-center shadow-md border border-emerald-500/40 group-hover:scale-105 transition-transform">
              <i class="fa-solid fa-scale-balanced text-amber-400 text-lg"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold tracking-widest uppercase text-amber-500 font-mono">Legal Ethics & Jurisprudence</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-emerald-900/60 text-emerald-300 border border-emerald-500/30">CPRA 2023</span>
              </div>
              <h1 class="text-base sm:text-lg font-serif font-bold tracking-tight" :class="isDark ? 'text-white' : 'text-slate-900'">
                The Lawyer's Oath <span class="hidden md:inline font-normal text-xs text-amber-400/80">&bull; Our Commitment, Our Promise</span>
              </h1>
            </div>
          </NuxtLink>
        </div>

        <!-- Center Controls: Progress & Jump -->
        <div class="hidden lg:flex items-center gap-3">
          <button
            @click="prevSlide"
            :disabled="currentSlideIndex === 0"
            class="w-8 h-8 rounded-lg flex items-center justify-center border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            :class="isDark ? 'border-slate-700 hover:bg-slate-800 text-amber-400' : 'border-slate-300 hover:bg-slate-200 text-amber-700'"
            title="Previous (Left Arrow)"
          >
            <i class="fa-solid fa-chevron-left text-xs"></i>
          </button>

          <div class="flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-mono" :class="isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-300'">
            <span class="text-amber-500 font-bold">{{ currentSlideIndex + 1 }}</span>
            <span class="text-slate-500">/</span>
            <span class="text-slate-400">{{ slides.length }}</span>
          </div>

          <button
            @click="nextSlide"
            :disabled="currentSlideIndex === slides.length - 1"
            class="w-8 h-8 rounded-lg flex items-center justify-center border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            :class="isDark ? 'border-slate-700 hover:bg-slate-800 text-amber-400' : 'border-slate-300 hover:bg-slate-200 text-amber-700'"
            title="Next (Right Arrow / Space)"
          >
            <i class="fa-solid fa-chevron-right text-xs"></i>
          </button>

          <!-- Current Chapter Badge -->
          <div
            class="px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5"
            :class="isDark ? 'bg-amber-950/40 border-amber-500/30 text-amber-300' : 'bg-amber-100 border-amber-300 text-amber-800'"
          >
            <i :class="currentSlide.chapterIcon || 'fa-solid fa-book-bookmark'" class="text-[10px]"></i>
            <span class="truncate max-w-[170px]">{{ currentSlide.chapter }}</span>
          </div>
        </div>

        <!-- Action Tools: Grid, Fullscreen, Speech, Theme -->
        <div class="flex items-center gap-2">
          <!-- Play / Autoplay -->
          <button
            @click="toggleAutoplay"
            class="px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all"
            :class="isAutoplay 
              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md' 
              : isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-200 text-slate-700'"
            title="Autoplay slideshow"
          >
            <i :class="isAutoplay ? 'fa-solid fa-pause' : 'fa-solid fa-play'" class="text-[11px]"></i>
            <span class="hidden sm:inline">{{ isAutoplay ? 'Pause' : 'Auto' }}</span>
          </button>

          <!-- Speech Read / Voice Narration -->
          <button
            @click="toggleSpeech"
            class="px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all"
            :class="isSpeaking 
              ? 'bg-emerald-600 text-white font-bold border-emerald-400 animate-pulse' 
              : isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-200 text-slate-700'"
            title="Narrate slide content via Speech Synthesis"
          >
            <i :class="isSpeaking ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-low'" class="text-[11px]"></i>
            <span class="hidden md:inline">{{ isSpeaking ? 'Reading...' : 'Voice' }}</span>
          </button>

          <!-- Grid Overview Modal / View -->
          <button
            @click="isGridView = !isGridView"
            class="px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all"
            :class="isGridView 
              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400' 
              : isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-200 text-slate-700'"
            title="All Slides Grid (G)"
          >
            <i class="fa-solid fa-table-cells-large text-[11px]"></i>
            <span class="hidden sm:inline">Index</span>
          </button>

          <!-- Oath Comparison Modal -->
          <button
            @click="showOathModal = true"
            class="px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all"
            :class="isDark ? 'border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300' : 'border-amber-600/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-900'"
            title="Compare Traditional vs CPRA New Lawyer's Oath"
          >
            <i class="fa-solid fa-scroll text-[11px] text-amber-400"></i>
            <span class="hidden md:inline">CPRA Oath</span>
          </button>

          <!-- Theme Toggle -->
          <button
            @click="isDark = !isDark"
            class="w-8 h-8 rounded-lg border flex items-center justify-center transition-all"
            :class="isDark ? 'border-slate-700 hover:bg-slate-800 text-amber-400' : 'border-slate-300 hover:bg-slate-200 text-amber-700'"
            title="Toggle Light / Dark Mode"
          >
            <i :class="isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'" class="text-xs"></i>
          </button>

          <!-- Fullscreen Toggle -->
          <button
            @click="toggleFullscreen"
            class="w-8 h-8 rounded-lg border flex items-center justify-center transition-all"
            :class="isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-200 text-slate-700'"
            title="Toggle Fullscreen (F)"
          >
            <i :class="isFullscreen ? 'fa-solid fa-compress' : 'fa-solid fa-expand'" class="text-xs"></i>
          </button>
        </div>
      </div>

      <!-- Linear Progress Bar -->
      <div class="w-full bg-slate-800/40 h-1 mt-3 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500 transition-all duration-300"
          :style="{ width: `${((currentSlideIndex + 1) / slides.length) * 100}%` }"
        ></div>
      </div>
    </header>

    <!-- MAIN PRESENTATION CANVAS -->
    <main class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-center min-h-[calc(100vh-130px)]">

      <!-- GRID OVERVIEW VIEW (IF ACTIVE) -->
      <section v-if="isGridView" class="animate-fadeIn pb-12">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 class="text-2xl font-serif font-bold flex items-center gap-2.5" :class="isDark ? 'text-white' : 'text-slate-900'">
              <i class="fa-solid fa-book-open-reader text-amber-400"></i>
              Presentation Directory & Syllabus
            </h2>
            <p class="text-xs text-slate-400">Click any slide to jump directly into presentation mode</p>
          </div>

          <!-- Search & Filter Controls -->
          <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div class="relative flex-1 sm:w-64">
              <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search cases, quotes, topics..."
                class="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                :class="isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'"
              />
            </div>

            <select
              v-model="selectedChapter"
              class="px-3 py-1.5 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              :class="isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'"
            >
              <option value="">All Chapters ({{ slides.length }})</option>
              <option v-for="ch in chapters" :key="ch" :value="ch">{{ ch }}</option>
            </select>
          </div>
        </div>

        <!-- Grid of Slides -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="s in filteredSlides"
            :key="s.id"
            @click="jumpToSlide(s.index)"
            class="group cursor-pointer rounded-xl p-4 border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden flex flex-col justify-between"
            :class="[
              s.index === currentSlideIndex 
                ? 'ring-2 ring-amber-400 border-amber-400/80 bg-amber-500/10' 
                : isDark ? 'bg-slate-900/70 border-slate-800 hover:border-amber-500/40' : 'bg-white border-slate-200 hover:border-amber-600/40'
            ]"
          >
            <!-- Top tag & number -->
            <div>
              <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                <span class="font-bold text-amber-500">#{{ s.index + 1 }}</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-300 truncate max-w-[120px]">
                  {{ s.badge || s.type }}
                </span>
              </div>
              <h3 class="text-sm font-semibold line-clamp-2 mb-1 group-hover:text-amber-400 transition-colors" :class="isDark ? 'text-white' : 'text-slate-900'">
                {{ s.title }}
              </h3>
              <p class="text-xs line-clamp-3" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                {{ s.subtitle || s.quote || s.tagline || (s.bullets && s.bullets[0] && s.bullets[0].title) }}
              </p>
            </div>

            <!-- Bottom chapter link -->
            <div class="mt-4 pt-2 border-t flex items-center justify-between text-[10px] text-slate-500" :class="isDark ? 'border-slate-800' : 'border-slate-100'">
              <span class="truncate">{{ s.chapter }}</span>
              <i class="fa-solid fa-arrow-right opacity-0 group-hover:opacity-100 transition-opacity text-amber-400"></i>
            </div>
          </div>
        </div>

        <div v-if="filteredSlides.length === 0" class="text-center py-12 text-slate-500">
          <i class="fa-solid fa-circle-question text-3xl mb-2 text-slate-600"></i>
          <p>No slides matched your search query "{{ searchQuery }}".</p>
        </div>
      </section>

      <!-- PRESENTATION SLIDE STAGE -->
      <div v-else class="relative w-full flex flex-col items-center justify-center">

        <!-- 16:9 Aspect Presentation Frame -->
        <div
          class="w-full rounded-2xl border transition-all duration-500 shadow-2xl relative overflow-hidden backdrop-blur-xl"
          :class="[
            isDark 
              ? 'bg-gradient-to-br from-[#0b101c]/95 via-[#0e1626]/90 to-[#071317]/95 border-amber-500/25 shadow-amber-950/20' 
              : 'bg-gradient-to-br from-[#ffffff]/95 via-[#fcfbf9]/95 to-[#f6f3eb]/95 border-amber-800/20 shadow-slate-400/20',
            isFullscreen ? 'h-[86vh]' : 'min-h-[580px] sm:min-h-[640px]'
          ]"
        >
          <!-- Corner Ornamental Accents -->
          <div class="absolute top-0 left-0 w-16 h-16 pointer-events-none border-t-2 border-l-2 rounded-tl-2xl" :class="isDark ? 'border-amber-500/40' : 'border-amber-600/40'"></div>
          <div class="absolute top-0 right-0 w-16 h-16 pointer-events-none border-t-2 border-r-2 rounded-tr-2xl" :class="isDark ? 'border-amber-500/40' : 'border-amber-600/40'"></div>
          <div class="absolute bottom-0 left-0 w-16 h-16 pointer-events-none border-b-2 border-l-2 rounded-bl-2xl" :class="isDark ? 'border-amber-500/40' : 'border-amber-600/40'"></div>
          <div class="absolute bottom-0 right-0 w-16 h-16 pointer-events-none border-b-2 border-r-2 rounded-br-2xl" :class="isDark ? 'border-amber-500/40' : 'border-amber-600/40'"></div>

          <!-- Slide Top Header Strip inside Frame -->
          <div class="px-6 sm:px-10 pt-6 flex items-center justify-between text-xs border-b pb-4" :class="isDark ? 'border-slate-800/80 text-slate-400' : 'border-amber-900/10 text-slate-600'">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span class="font-mono uppercase tracking-wider text-amber-500 font-bold">{{ currentSlide.chapter }}</span>
              <span class="text-slate-500 hidden sm:inline">&bull;</span>
              <span class="hidden sm:inline font-sans text-slate-400">{{ currentSlide.badge || 'Slide ' + (currentSlideIndex + 1) }}</span>
            </div>
            <div class="flex items-center gap-3 font-mono">
              <span class="text-slate-500 text-[11px] hidden sm:inline">Use &larr; &rarr; keys</span>
              <span class="px-2 py-0.5 rounded font-bold" :class="isDark ? 'bg-slate-800 text-amber-400' : 'bg-slate-200 text-amber-900'">
                {{ currentSlideIndex + 1 }} / {{ slides.length }}
              </span>
            </div>
          </div>

          <!-- DYNAMIC SLIDE CONTENT TEMPLATES -->
          <div class="p-6 sm:p-10 lg:p-12 overflow-y-auto max-h-[calc(100%-80px)]">

            <!-- TEMPLATE 1: HERO / COVER SLIDE -->
            <div v-if="currentSlide.type === 'hero'" class="flex flex-col items-center justify-center text-center py-6 sm:py-12 animate-fadeIn">
              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 border" :class="isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-100 border-amber-300 text-amber-900'">
                <i class="fa-solid fa-award"></i> {{ currentSlide.tagline }}
              </div>
              
              <h1 class="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight mb-4 max-w-4xl" :class="isDark ? 'text-white' : 'text-slate-900'">
                {{ currentSlide.title }}
              </h1>
              
              <p class="text-lg sm:text-2xl font-serif italic text-amber-400/90 max-w-2xl mb-8">
                "{{ currentSlide.subtitle }}"
              </p>

              <!-- Golden Divider -->
              <div class="flex items-center gap-4 my-4 w-48 justify-center">
                <span class="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></span>
                <i class="fa-solid fa-scale-balanced text-amber-400 text-lg"></i>
                <span class="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mt-8 text-left">
                <div v-for="(feat, fIdx) in currentSlide.features" :key="fIdx" class="p-4 rounded-xl border backdrop-blur-sm transition-transform hover:-translate-y-1" :class="isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-slate-200'">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <i :class="feat.icon"></i>
                  </div>
                  <h4 class="font-bold text-sm mb-1" :class="isDark ? 'text-white' : 'text-slate-900'">{{ feat.title }}</h4>
                  <p class="text-xs text-slate-400">{{ feat.desc }}</p>
                </div>
              </div>

              <div class="mt-8 flex items-center gap-3">
                <button
                  @click="nextSlide"
                  class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-900/30 flex items-center gap-2 group transition-all"
                >
                  <span>Begin Lecture Deck</span>
                  <i class="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                </button>
              </div>
            </div>

            <!-- TEMPLATE 2: POEM / TRIBUTE (ILLUMINATED VERSE) -->
            <div v-else-if="currentSlide.type === 'poem'" class="max-w-4xl mx-auto py-2 animate-fadeIn">
              <div class="text-center mb-6">
                <span class="text-xs uppercase tracking-widest font-mono text-amber-500 font-bold block mb-1">
                  {{ currentSlide.author || 'Tula / Panitikan ng Legal Ethics' }}
                </span>
                <h2 class="text-2xl sm:text-4xl font-serif font-bold" :class="isDark ? 'text-white' : 'text-slate-900'">
                  {{ currentSlide.title }}
                </h2>
                <p class="text-xs sm:text-sm italic text-slate-400 mt-1">{{ currentSlide.subtitle }}</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <!-- Stanzas Card with Parchment border -->
                <div class="p-6 sm:p-8 rounded-2xl border relative overflow-hidden backdrop-blur-sm" :class="isDark ? 'bg-slate-900/70 border-amber-500/30 shadow-xl' : 'bg-amber-50/80 border-amber-700/30 shadow-md'">
                  <div class="absolute top-2 right-4 text-4xl opacity-10 font-serif">❝</div>
                  <div class="space-y-4 font-serif text-sm sm:text-base leading-relaxed tracking-wide italic" :class="isDark ? 'text-amber-100' : 'text-amber-950'">
                    <p v-for="(stanza, sIdx) in currentSlide.stanzas" :key="sIdx" class="border-l-2 border-amber-500/40 pl-3">
                      {{ stanza }}
                    </p>
                  </div>
                </div>

                <!-- Analysis & Moral Reflection -->
                <div class="space-y-4">
                  <div class="p-5 rounded-xl border" :class="isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'">
                    <h3 class="text-sm font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2 mb-2 font-mono">
                      <i class="fa-solid fa-lightbulb"></i> Ethical Reflection
                    </h3>
                    <p class="text-sm leading-relaxed" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
                      {{ currentSlide.reflection }}
                    </p>
                  </div>

                  <div v-if="currentSlide.keyTakeaway" class="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                    <div class="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
                      <i class="fa-solid fa-shield-halved"></i> Key Admonition
                    </div>
                    <p class="text-xs font-medium" :class="isDark ? 'text-emerald-200' : 'text-emerald-900'">
                      {{ currentSlide.keyTakeaway }}
                    </p>
                  </div>

                  <div class="flex items-center gap-3 pt-2">
                    <button
                      @click="toggleSpeech"
                      class="px-4 py-2 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all"
                      :class="isDark ? 'border-amber-500/40 text-amber-300 hover:bg-amber-500/10' : 'border-amber-700/40 text-amber-900 hover:bg-amber-100'"
                    >
                      <i class="fa-solid fa-microphone-lines"></i>
                      <span>Recite Verse Aloud</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- TEMPLATE 3: QUOTE / PROCLAMATION -->
            <div v-else-if="currentSlide.type === 'quote'" class="max-w-4xl mx-auto py-6 flex flex-col items-center justify-center text-center animate-fadeIn">
              <div class="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 text-amber-400 text-2xl shadow-lg">
                <i :class="currentSlide.icon || 'fa-solid fa-quote-left'"></i>
              </div>

              <blockquote class="text-xl sm:text-3xl lg:text-4xl font-serif font-medium leading-relaxed mb-6 max-w-3xl" :class="isDark ? 'text-slate-100' : 'text-slate-900'">
                &ldquo;{{ currentSlide.quote }}&rdquo;
              </blockquote>

              <div class="flex flex-col items-center">
                <div class="h-0.5 w-12 bg-amber-400 my-2"></div>
                <cite class="not-italic font-bold text-base sm:text-lg text-amber-500">{{ currentSlide.author }}</cite>
                <span class="text-xs text-slate-400 mt-0.5">{{ currentSlide.source }}</span>
              </div>

              <!-- Commentary Box below Quote -->
              <div v-if="currentSlide.commentary" class="mt-8 p-5 rounded-2xl border max-w-2xl text-left backdrop-blur-sm" :class="isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'">
                <div class="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 mb-1 flex items-center gap-2">
                  <i class="fa-solid fa-gavel"></i> Jurisprudential Relevance
                </div>
                <p class="text-xs sm:text-sm leading-relaxed">
                  {{ currentSlide.commentary }}
                </p>
              </div>
            </div>

            <!-- TEMPLATE 4: STATISTICS & REALITY CHECK -->
            <div v-else-if="currentSlide.type === 'stats'" class="max-w-5xl mx-auto py-4 animate-fadeIn">
              <div class="text-center mb-8">
                <span class="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border text-rose-400 border-rose-500/30 bg-rose-500/10">
                  <i class="fa-solid fa-triangle-exclamation mr-1"></i> The Crisis in Practice
                </span>
                <h2 class="text-2xl sm:text-4xl font-serif font-bold mt-2" :class="isDark ? 'text-white' : 'text-slate-900'">
                  {{ currentSlide.title }}
                </h2>
                <p class="text-sm text-slate-400 mt-1 max-w-2xl mx-auto">{{ currentSlide.subtitle }}</p>
              </div>

              <!-- Stat Cards Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                <div
                  v-for="(st, sIdx) in currentSlide.stats"
                  :key="sIdx"
                  class="p-6 rounded-2xl border backdrop-blur-sm relative overflow-hidden transition-all hover:scale-[1.02]"
                  :class="isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'"
                >
                  <div class="text-4xl sm:text-5xl font-extrabold font-serif mb-2" :class="st.highlightClass || 'text-rose-500'">
                    {{ st.value }}
                  </div>
                  <h4 class="text-sm font-bold uppercase tracking-wider mb-2 font-mono" :class="isDark ? 'text-slate-200' : 'text-slate-800'">
                    {{ st.label }}
                  </h4>
                  <p class="text-xs leading-relaxed" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                    {{ st.description }}
                  </p>
                </div>
              </div>

              <!-- Context Callout -->
              <div class="p-5 rounded-2xl border flex items-start gap-4" :class="isDark ? 'bg-amber-950/20 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'">
                <i class="fa-solid fa-heart-pulse text-2xl text-amber-500 shrink-0 mt-1"></i>
                <div class="text-xs sm:text-sm space-y-1">
                  <strong class="font-bold block text-sm">Critical Reflection for Law Students and Practitioners:</strong>
                  <p class="leading-relaxed">{{ currentSlide.advisory }}</p>
                </div>
              </div>
            </div>

            <!-- TEMPLATE 5: LANDMARK CASE DIGEST -->
            <div v-else-if="currentSlide.type === 'case'" class="max-w-5xl mx-auto py-2 animate-fadeIn">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-4 mb-6" :class="isDark ? 'border-slate-800' : 'border-slate-200'">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="px-2.5 py-0.5 rounded text-[11px] font-bold font-mono tracking-wider uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      {{ currentSlide.sanction || 'Disciplinary Action' }}
                    </span>
                    <span class="text-xs font-mono text-slate-400">{{ currentSlide.docket }}</span>
                  </div>
                  <h2 class="text-xl sm:text-3xl font-serif font-bold text-amber-400">
                    {{ currentSlide.caseTitle }}
                  </h2>
                </div>
                <div class="text-right text-xs text-slate-400 font-mono hidden sm:block">
                  <div>{{ currentSlide.promulgated }}</div>
                  <div class="text-[11px] text-amber-500/80">{{ currentSlide.canonVioldated }}</div>
                </div>
              </div>

              <!-- Facts, Issue, Ruling Grid -->
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- FACTS (1 Col or 2 Col) -->
                <div class="lg:col-span-1 p-5 rounded-xl border backdrop-blur-sm" :class="isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'">
                  <div class="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-amber-500 mb-3">
                    <i class="fa-solid fa-file-lines"></i> Salient Facts
                  </div>
                  <p class="text-xs sm:text-sm leading-relaxed" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
                    {{ currentSlide.facts }}
                  </p>
                </div>

                <!-- ISSUE & RULING (2 Cols) -->
                <div class="lg:col-span-2 space-y-4">
                  <!-- Issue -->
                  <div class="p-4 rounded-xl border" :class="isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'">
                    <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                      <i class="fa-solid fa-circle-question mr-1"></i> Core Issue
                    </span>
                    <p class="text-xs sm:text-sm font-medium" :class="isDark ? 'text-slate-200' : 'text-slate-800'">
                      {{ currentSlide.issue }}
                    </p>
                  </div>

                  <!-- Ruling -->
                  <div class="p-5 rounded-xl border relative overflow-hidden" :class="isDark ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-emerald-50 border-emerald-300'">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <i class="fa-solid fa-gavel"></i> Supreme Court Ruling
                      </span>
                      <span class="text-xs font-extrabold px-2 py-0.5 rounded uppercase" :class="currentSlide.verdict === 'DISBARRED' ? 'bg-red-600 text-white' : 'bg-amber-500 text-slate-950'">
                        {{ currentSlide.verdict }}
                      </span>
                    </div>
                    <p class="text-xs sm:text-sm leading-relaxed mb-3" :class="isDark ? 'text-emerald-100' : 'text-emerald-950'">
                      {{ currentSlide.ruling }}
                    </p>

                    <div v-if="currentSlide.ratio" class="pt-3 border-t border-emerald-500/20 text-xs italic" :class="isDark ? 'text-emerald-300/80' : 'text-emerald-800'">
                      <strong>Doctrine:</strong> {{ currentSlide.ratio }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- TEMPLATE 6: COMPARATIVE MATRIX / PILLARS -->
            <div v-else-if="currentSlide.type === 'matrix'" class="max-w-5xl mx-auto py-2 animate-fadeIn">
              <div class="text-center mb-8">
                <span class="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border text-amber-400 border-amber-500/30 bg-amber-500/10">
                  {{ currentSlide.badge }}
                </span>
                <h2 class="text-2xl sm:text-4xl font-serif font-bold mt-2" :class="isDark ? 'text-white' : 'text-slate-900'">
                  {{ currentSlide.title }}
                </h2>
                <p class="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl mx-auto">{{ currentSlide.subtitle }}</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  v-for="(col, cIdx) in currentSlide.columns"
                  :key="cIdx"
                  class="p-5 rounded-2xl border transition-all hover:-translate-y-1 backdrop-blur-sm flex flex-col justify-between"
                  :class="isDark ? 'bg-slate-900/60 border-slate-800 hover:border-amber-500/40' : 'bg-white border-slate-200 hover:border-amber-600/40 shadow-sm'"
                >
                  <div>
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      <i :class="col.icon"></i>
                    </div>
                    <span class="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Pillar {{ cIdx + 1 }}</span>
                    <h3 class="text-base font-bold mb-2" :class="isDark ? 'text-white' : 'text-slate-900'">
                      {{ col.title }}
                    </h3>
                    <p class="text-xs leading-relaxed" :class="isDark ? 'text-slate-300' : 'text-slate-600'">
                      {{ col.description }}
                    </p>
                  </div>
                  <div v-if="col.citation" class="mt-4 pt-2 border-t text-[10px] font-mono text-amber-500/80" :class="isDark ? 'border-slate-800' : 'border-slate-100'">
                    {{ col.citation }}
                  </div>
                </div>
              </div>

              <div v-if="currentSlide.summaryNotice" class="mt-6 p-4 rounded-xl border text-center text-xs" :class="isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'">
                {{ currentSlide.summaryNotice }}
              </div>
            </div>

            <!-- TEMPLATE 7: OATH ANALYSIS / SACRED PLEDGE CLAUSE -->
            <div v-else-if="currentSlide.type === 'oath-clause'" class="max-w-4xl mx-auto py-2 animate-fadeIn">
              <div class="text-center mb-6">
                <span class="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                  {{ currentSlide.clauseBadge || "The Lawyer's Oath" }}
                </span>
                <h2 class="text-2xl sm:text-4xl font-serif font-bold mt-2" :class="isDark ? 'text-white' : 'text-slate-900'">
                  {{ currentSlide.title }}
                </h2>
              </div>

              <!-- Main Clause Highlight -->
              <div class="p-6 sm:p-8 rounded-2xl border-2 mb-6 text-center relative overflow-hidden backdrop-blur-md" :class="isDark ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-emerald-950/40 border-amber-500/40 shadow-xl' : 'bg-amber-50/90 border-amber-600/40 shadow-md'">
                <p class="text-xl sm:text-2xl lg:text-3xl font-serif font-bold leading-relaxed tracking-wide" :class="isDark ? 'text-amber-300' : 'text-amber-900'">
                  &ldquo;{{ currentSlide.clauseText }}&rdquo;
                </p>
              </div>

              <!-- Key Responsibilities & Judicial Interpretations -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-5 rounded-xl border" :class="isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'">
                  <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 mb-2">
                    <i class="fa-solid fa-landmark"></i> Juridical Meaning
                  </h4>
                  <p class="text-xs sm:text-sm leading-relaxed" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
                    {{ currentSlide.meaning }}
                  </p>
                </div>

                <div class="p-5 rounded-xl border" :class="isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'">
                  <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-2">
                    <i class="fa-solid fa-ban"></i> Common Prohibited Breaches
                  </h4>
                  <ul class="text-xs sm:text-sm space-y-1.5 list-disc list-inside" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
                    <li v-for="(b, bIdx) in currentSlide.prohibitions" :key="bIdx">{{ b }}</li>
                  </ul>
                </div>
              </div>

              <!-- Case Law Anchor -->
              <div v-if="currentSlide.caseAnchor" class="mt-4 p-4 rounded-xl border flex items-center gap-3" :class="isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'">
                <i class="fa-solid fa-scale-unbalanced-flip text-amber-400"></i>
                <div class="text-xs">
                  <span class="font-bold text-amber-400">{{ currentSlide.caseAnchor.title }}</span>: {{ currentSlide.caseAnchor.rule }}
                </div>
              </div>
            </div>

            <!-- TEMPLATE 8: GENERAL SLIDE / BULLET CARDS -->
            <div v-else class="max-w-4xl mx-auto py-2 animate-fadeIn">
              <div class="text-center mb-6">
                <span class="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border text-amber-400 border-amber-500/30 bg-amber-500/10">
                  {{ currentSlide.badge }}
                </span>
                <h2 class="text-2xl sm:text-4xl font-serif font-bold mt-2" :class="isDark ? 'text-white' : 'text-slate-900'">
                  {{ currentSlide.title }}
                </h2>
                <p v-if="currentSlide.subtitle" class="text-xs sm:text-sm text-slate-400 mt-1">{{ currentSlide.subtitle }}</p>
              </div>

              <!-- Content Cards -->
              <div class="space-y-4">
                <div
                  v-for="(bullet, bIdx) in currentSlide.bullets"
                  :key="bIdx"
                  class="p-5 rounded-xl border flex items-start gap-4 transition-all hover:translate-x-1"
                  :class="isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'"
                >
                  <div class="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs shrink-0 font-mono font-bold mt-0.5">
                    {{ bIdx + 1 }}
                  </div>
                  <div class="space-y-1">
                    <h4 v-if="bullet.title" class="font-bold text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">
                      {{ bullet.title }}
                    </h4>
                    <p class="text-xs sm:text-sm leading-relaxed" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
                      {{ bullet.desc || bullet }}
                    </p>
                  </div>
                </div>
              </div>

              <div v-if="currentSlide.citation" class="mt-6 text-center text-xs font-mono text-slate-500">
                Source: {{ currentSlide.citation }}
              </div>
            </div>

          </div>

          <!-- Bottom Slide Footer Toolbar -->
          <div class="absolute bottom-0 inset-x-0 px-6 sm:px-10 py-3 border-t backdrop-blur-md flex items-center justify-between text-xs" :class="isDark ? 'bg-slate-950/70 border-slate-800/80 text-slate-400' : 'bg-white/70 border-slate-200 text-slate-600'">
            <div class="flex items-center gap-3">
              <button
                @click="prevSlide"
                :disabled="currentSlideIndex === 0"
                class="flex items-center gap-1.5 px-3 py-1 rounded border transition-all disabled:opacity-20"
                :class="isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'"
              >
                <i class="fa-solid fa-arrow-left"></i> Previous
              </button>
              <button
                @click="nextSlide"
                :disabled="currentSlideIndex === slides.length - 1"
                class="flex items-center gap-1.5 px-3 py-1 rounded border transition-all disabled:opacity-20 font-semibold"
                :class="isDark ? 'border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300' : 'border-amber-600/40 bg-amber-500/20 hover:bg-amber-500/30 text-amber-900'"
              >
                Next <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>

            <!-- Jump to Slide Selector -->
            <div class="flex items-center gap-2">
              <span class="hidden sm:inline text-[11px] text-slate-500">Jump:</span>
              <select
                :value="currentSlideIndex"
                @change="jumpToSlide(Number($event.target.value))"
                class="px-2 py-0.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500"
                :class="isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'"
              >
                <option v-for="(s, idx) in slides" :key="s.id" :value="idx">
                  {{ idx + 1 }}. {{ (s.title || 'Slide ' + (idx + 1)).slice(0, 32) }}...
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Thumbnail Navigation Strip Below Frame -->
        <div class="w-full mt-4 flex items-center gap-2 overflow-x-auto py-2 px-1 scrollbar select-none">
          <button
            v-for="(s, idx) in slides"
            :key="s.id"
            @click="jumpToSlide(idx)"
            class="h-8 min-w-[36px] px-2 rounded-lg text-xs font-mono border transition-all flex items-center justify-center shrink-0"
            :class="idx === currentSlideIndex
              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 scale-105 shadow-md'
              : isDark 
                ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700' 
                : 'bg-white border-slate-200 text-slate-600 hover:text-black hover:border-slate-300'"
            :title="s.title || 'Slide ' + (idx + 1)"
          >
            {{ idx + 1 }}
          </button>
        </div>
      </div>
    </main>

    <!-- CPRA OATH COMPARISON MODAL -->
    <div
      v-if="showOathModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      @click.self="showOathModal = false"
    >
      <div
        class="w-full max-w-4xl max-h-[90vh] rounded-2xl border p-6 sm:p-8 overflow-y-auto relative shadow-2xl"
        :class="isDark ? 'bg-[#0d1322] border-amber-500/40 text-slate-100' : 'bg-white border-amber-700/30 text-slate-900'"
      >
        <button
          @click="showOathModal = false"
          class="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center border text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>

        <div class="text-center mb-6">
          <span class="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Supreme Court of the Philippines &bull; A.M. No. 22-09-01-SC
          </span>
          <h2 class="text-2xl sm:text-3xl font-serif font-bold mt-2">
            The Lawyer's Oath: Traditional vs. New CPRA
          </h2>
          <p class="text-xs text-slate-400 mt-1">Comparing the 1917 Form 28 Oath with the modern 2023 CPRA Oath</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Traditional Oath -->
          <div class="p-5 rounded-xl border relative" :class="isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'">
            <div class="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <i class="fa-solid fa-history"></i> Traditional Oath (Form 28)
            </div>
            <p class="text-xs sm:text-sm font-serif leading-relaxed italic" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
              "I, ____________, do solemnly swear that I will maintain allegiance to the Republic of the Philippines; I will support its Constitution and obey laws as well as the legal orders of the duly constituted authorities therein; I will do no falsehood, nor consent to the doing of any in court; I will not wittingly nor willingly promote or sue any groundless, false or unlawful suit, or give aid nor consent to the same; I will delay no man for money or malice, and will conduct myself as a lawyer according to the best of my knowledge and discretion with all good fidelity as well to the courts as to my clients; and I impose upon myself this voluntary obligations without any mental reservation or purpose of evasion. So help me God."
            </p>
          </div>

          <!-- New CPRA Oath -->
          <div class="p-5 rounded-xl border-2 relative" :class="isDark ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-emerald-50/70 border-emerald-600/40'">
            <div class="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span class="flex items-center gap-1.5"><i class="fa-solid fa-sparkles"></i> NEW CPRA OATH (2023)</span>
              <span class="px-2 py-0.5 rounded text-[10px] bg-emerald-600 text-white font-extrabold">CURRENT</span>
            </div>
            <p class="text-xs sm:text-sm font-serif leading-relaxed italic" :class="isDark ? 'text-emerald-100' : 'text-emerald-950'">
              "I, ____________, do solemnly swear (or affirm):<br><br>
              That I accept the <span class="font-bold underline text-amber-400">honor, privilege, duty, and responsibility</span> of practicing law in the Philippines as an <span class="font-bold underline text-amber-400">officer of the court in the interest of justice</span>;<br><br>
              That I will support the Constitution and obey the laws as well as the legal orders of the duly constituted authorities therein;<br><br>
              That I will do no falsehood, nor consent to its commission;<br><br>
              That I will not wittingly or willingly promote or sue any groundless, false, or unlawful suit, nor give aid nor consent to the same;<br><br>
              That I will not delay any person's cause for money or malice;<br><br>
              That I will conduct myself as a lawyer according to the <span class="font-bold underline text-amber-400">Code of Professional Responsibility and Accountability and the Rules of Court</span>, with all good fidelity to the courts, to the <span class="font-bold underline text-amber-400">legal profession, to my clients, and to society</span>;<br><br>
              That I impose this obligation upon myself voluntarily, without mental reservation or purpose of evasion.<br><br>
              So help me God."
            </p>
          </div>
        </div>

        <!-- Key Innovations List -->
        <div class="mt-6 p-4 rounded-xl border" :class="isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'">
          <h4 class="text-xs font-bold font-mono uppercase tracking-wider text-amber-500 mb-2">Key Modernizations in the CPRA:</h4>
          <ul class="text-xs grid grid-cols-1 sm:grid-cols-2 gap-2" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
            <li class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-400"></i> Added option to "affirm" (secular inclusivity)</li>
            <li class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-400"></i> Explicitly references "Accountability"</li>
            <li class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-400"></i> Added fidelity to the Legal Profession & Society</li>
            <li class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-400"></i> Elevates role: "Officer of court in the interest of justice"</li>
          </ul>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

// SEO Meta
useHead({
  title: "The Lawyer's Oath & Legal Ethics | Interactive Lecture Slides",
  meta: [
    { name: 'description', content: 'Comprehensive interactive lecture slides on Legal Ethics, The Lawyer\'s Oath, CPRA 2023, Landmark Supreme Court Case Law, and Professional Responsibility.' }
  ]
});

// UI Reactive State
const isDark = ref(true);
const isFullscreen = ref(false);
const isGridView = ref(false);
const showOathModal = ref(false);
const isSpeaking = ref(false);
const isAutoplay = ref(false);
const autoplayTimer = ref(null);
const currentSlideIndex = ref(0);
const searchQuery = ref('');
const selectedChapter = ref('');

// Slide Chapters definition
const chapters = [
  'Chapter 1: The Calling & The Hidden Crisis',
  'Chapter 2: Learned Profession vs Business',
  'Chapter 3: Cynicism & Historical Hostility',
  'Chapter 4: Putting Career on Stake: Disbarment Cases',
  'Chapter 5: The Sacred Lawyer\'s Oath & The CPRA',
  'Chapter 6: Landmark Case Digests & Breaches',
  'Chapter 7: Four-Fold Duties & True Happiness'
];

// Comprehensive Slide Catalog extracted from the 123-page PDF
const slides = ref([
  // SLIDE 1: COVER
  {
    id: 'slide-1',
    type: 'hero',
    chapter: 'Chapter 1: The Calling & The Hidden Crisis',
    chapterIcon: 'fa-solid fa-scale-balanced',
    badge: 'Opening Lecture',
    tagline: 'Legal Ethics & Professional Responsibility',
    title: 'The Lawyer\'s Oath',
    subtitle: 'Our Commitment ........ Our Promise',
    features: [
      { icon: 'fa-solid fa-gavel', title: 'Noble Calling', desc: 'A learned profession grounded on intellectual technique and public service.' },
      { icon: 'fa-solid fa-shield-halved', title: 'The CPRA Code', desc: 'Code of Professional Responsibility and Accountability (A.M. No. 22-09-01-SC).' },
      { icon: 'fa-solid fa-scroll', title: 'Sacred Covenant', desc: 'Not a mere formality, but a source of solemn lifelong obligations.' }
    ]
  },

  // SLIDE 2: IDENTITY
  {
    id: 'slide-2',
    type: 'quote',
    title: 'Yes, I Am a Lawyer',
    chapter: 'Chapter 1: The Calling & The Hidden Crisis',
    badge: 'Professional Identity',
    icon: 'fa-solid fa-user-tie',
    quote: 'YES, I AM A LAWYER.',
    author: 'The Title of Honor',
    source: 'The Roll of Attorneys of the Supreme Court',
    commentary: 'The title "Atty." is not an academic degree or a license for commerce. It is a badge of trust bestowed only upon individuals of proven moral integrity, intellect, and devotion to the administration of justice.'
  },

  // SLIDE 3: POEM - DAKILANG ABOGADO
  {
    id: 'slide-3',
    type: 'poem',
    title: 'Dakilang Abogado',
    chapter: 'Chapter 1: The Calling & The Hidden Crisis',
    badge: 'Tula ng Paggunita',
    author: 'Himig at Panunumpa',
    subtitle: 'Pagkilala sa dangal at pag-iingat sa tawag ng tukso',
    stanzas: [
      'Alam kong hindi madali tungkuling hawak mo ngayon; ang \'yong talino\'t galing, labis ang paghanga namin. Paglilingkod mong wagas, pagsisilbi mong tapat.',
      'Ang iyong integridad, pati na ang moralidad — \'yan ang katangian mong sa iyo\'y mag-aangat.',
      'Dangal ng iyong pangalan, ganda ng kalooban; yamang di maaagaw, gandang panghahawakan.',
      'Sana\'y huwag agawin \'to ng inggit at ng tukso; maling gawi ay ingatan mo, batas ay tutukan mo.'
    ],
    reflection: 'Ang pagsasanay sa batas ay hindi lamang pagpapamalas ng galing sa argumento; ito ay patuloy na pakikibaka upang panatilihing dalisay ang budhi sa harap ng kapangyarihan, salapi, at katanyagan.',
    keyTakeaway: 'Ang galing na walang integridad ay panganib sa lipunan.'
  },

  // SLIDE 4: JOHN W. DAVIS QUOTE
  {
    id: 'slide-4',
    type: 'quote',
    title: 'We Build No Bridges (John W. Davis)',
    chapter: 'Chapter 1: The Calling & The Hidden Crisis',
    badge: 'The Lawyer\'s Mission',
    icon: 'fa-solid fa-feather-pointed',
    quote: 'True, we [lawyers] build no bridges. We raise no towers. We construct no engines. We paint no pictures—unless as amateurs for our own principal amusement. There is little of all that we do which the eye of man can see. But we smooth out difficulties; we relieve stress; we correct mistakes; we take up other men\'s burdens and by our efforts we make possible the peaceful life of men in a peaceful state.',
    author: 'John W. Davis',
    source: 'Former Solicitor General & Presidential Nominee',
    commentary: 'Lawyers are the unseen architects of social order. Without the steadying hand of law and honest counselors, no skyscraper could stand, no bridge could be protected, and civilization would descend into anarchy.'
  },

  // SLIDE 5: STATS - SUICIDE & DEPRESSION
  {
    id: 'slide-5',
    type: 'stats',
    title: 'The Silent Epidemic in Legal Practice',
    chapter: 'Chapter 1: The Calling & The Hidden Crisis',
    badge: 'Crisis Diagnostics',
    subtitle: 'Behind courtroom victories lies an alarming toll on mental and emotional wellbeing.',
    stats: [
      { value: '3rd', label: 'Cause of Death', description: 'Suicide is the 3rd leading cause of death among attorneys, trailing only cancer and heart disease.' },
      { value: 'nearly 6x', label: 'Suicide Rate', description: 'The rate of death by suicide for lawyers is nearly 6 times that of the general population.' },
      { value: '3.6x', label: 'Depression Odds', description: 'Lawyers top the list of professionals suffering from major depressive disorder — 3.6x higher than employed persons.' }
    ],
    advisory: 'Suicide is preventable. Most victims exhibit warning signs before a crisis. The legal fraternity must build compassion, dismantle stigma, and prioritize mental health alongside professional competence.'
  },

  // SLIDE 6: STATS - DISSATISFACTION & SUBSTANCE ABUSE
  {
    id: 'slide-6',
    type: 'stats',
    title: 'Emotional Dissatisfaction & Discipline',
    chapter: 'Chapter 1: The Calling & The Hidden Crisis',
    badge: 'Empirical Data',
    subtitle: 'Statistics revealing the relationship between personal distress and disciplinary offenses.',
    stats: [
      { value: 'Over 50%', label: 'Workforce Dissatisfaction', description: 'More than half of practicing lawyers describe themselves as emotionally dissatisfied with their work and lives.' },
      { value: '50%', label: 'Disciplinary Offenses', description: '50% of lawyers facing disciplinary action admitted to abusing drugs or alcohol as coping mechanisms.' },
      { value: '#1', label: 'Divorce Rates', description: 'Lawyers experience significantly higher divorce rates compared to other licensed professions.' }
    ],
    advisory: 'Burnout, alcoholism, and emotional detachment directly impair a lawyer\'s ability to discharge fidelity to clients and courts, leading to malpractice and disbarment.'
  },

  // SLIDE 7: PSYCHOLOGY TODAY QUOTE
  {
    id: 'slide-7',
    type: 'quote',
    title: 'The Formula for a Psychological Crisis',
    chapter: 'Chapter 1: The Calling & The Hidden Crisis',
    badge: 'Psychological Analysis',
    icon: 'fa-solid fa-brain',
    quote: 'The practice of law can be demanding and exceedingly stressful. Even the most balanced and well-adjusted lawyer at some point eventually succumbs to the pressures of working in the legal field. Put an ordinary individual with unresolved issues and inadequate defenses in a hyper-competitive environment such as the law, and you have the formula for a psychological crisis.',
    author: 'Psychology Today',
    source: 'Therapy Matters: The Depressed Lawyer',
    commentary: 'Legal ethics is not only a regulatory mandate; it is a vital psychological compass that prevents a lawyer from succumbing to ruthless competition and existential emptiness.'
  },

  // SLIDE 8: TRIPARTITE ROLE OF LAWYERS
  {
    id: 'slide-8',
    type: 'matrix',
    title: 'The Tripartite Identity of the Modern Lawyer',
    chapter: 'Chapter 2: Learned Profession vs Business',
    badge: 'The Harvard Model',
    subtitle: 'Harvard Law School Professionalism Project Essay',
    columns: [
      { icon: 'fa-solid fa-book-journal-whills', title: 'Technical Expert', description: 'Master of statutory frameworks, procedural rules, and legal doctrine, applying rigor to protect rights.', citation: 'Harvard Project p. 11' },
      { icon: 'fa-solid fa-hand-holding-heart', title: 'Wise Counselor', description: 'Advising clients not merely on what is legally permissible, but what is morally upright and prudent.', citation: 'Harvard Project p. 12' },
      { icon: 'fa-solid fa-chess-king', title: 'Decisive Leader', description: 'Leaders who do not just passively advise, but shape institutions, decide policy, and uphold justice.', citation: 'Harvard Project p. 14' },
      { icon: 'fa-solid fa-compass', title: 'Ethical Steward', description: 'Given the breadth of these roles, their ethical duties to society are correspondingly broad and absolute.', citation: 'Harvard Project p. 16' }
    ],
    summaryNotice: 'A lawyer who acts merely as a hired gun reduces an honorable calling into transactional expedience.'
  },

  // SLIDE 9: CHIEF JUSTICE WARREN WINKLER QUOTE
  {
    id: 'slide-9',
    type: 'quote',
    title: 'A Learned & Noble Profession',
    chapter: 'Chapter 2: Learned Profession vs Business',
    badge: 'Judicial Proclamation',
    icon: 'fa-solid fa-landmark-dome',
    quote: 'Law is a learned and noble profession..',
    author: 'Chief Justice Warren K. Winkler',
    source: 'Remarks at the Call to the Bar Ceremony, Law Society of Upper Canada',
    commentary: 'It is noble because its primary currency is truth, and its supreme objective is the impartial administration of justice for the weak and strong alike.'
  },

  // SLIDE 10: ROSCOE POUND'S ATTRIBUTES
  {
    id: 'slide-10',
    type: 'general',
    title: 'Three Primary Attributes of a Learned Profession',
    chapter: 'Chapter 2: Learned Profession vs Business',
    badge: 'Legal Philosophy',
    subtitle: 'Dean Roscoe Pound\'s Classic Treatise on the Legal Profession',
    bullets: [
      { title: 'Intellectual Technique & Specialized Training', desc: 'Admission is conditioned upon rigorous intellectual training in jurisprudence and mastery of law.' },
      { title: 'Self-Regulating Organization', desc: 'A unified professional brotherhood bound by shared canons, ethical oversight, and disciplinary bodies.' },
      { title: 'Dedicated to a Spirit of Public Service', desc: 'The practice is pursued as a public calling, wherein the gaining of a livelihood is strictly incidental and secondary.' }
    ],
    citation: 'Roscoe Pound, The Lawyer from Antiquity to Modern Times (1953)'
  },

  // SLIDE 11: IBP OBJECTIVES
  {
    id: 'slide-11',
    type: 'general',
    title: 'Integrated Bar of the Philippines (IBP)',
    chapter: 'Chapter 2: Learned Profession vs Business',
    badge: 'Statutory Mandate',
    subtitle: 'Section 2 & Per Curiam Resolution of the Supreme Court (January 9, 1973)',
    bullets: [
      { title: 'Elevate Standards', desc: 'Elevate the standards of the legal profession and improve the administration of justice.' },
      { title: 'Discharge Public Responsibility', desc: 'Enable the Bar to discharge its public responsibility more effectively.' },
      { title: 'High Ideals of Integrity', desc: 'Foster and maintain among members high ideals of integrity, learning, professional competence, and conduct.' },
      { title: 'Brotherhood & Continuing Research', desc: 'Cultivate cordiality among members and promote continuing legal education and legal research.' }
    ],
    citation: 'Rule 139-A, Rules of Court; SC Res. Jan 9, 1973'
  },

  // SLIDE 12: CASE DIGEST - SANTOS V. LLAMAS
  {
    id: 'slide-12',
    type: 'case',
    title: 'Santos, Jr. v. Atty. Llamas (Bar Dues)',
    chapter: 'Chapter 2: Learned Profession vs Business',
    badge: 'Bar Dues & Candor',
    sanction: '1-Year Suspension',
    docket: 'A.C. No. 4749',
    caseTitle: 'Soliman M. Santos, Jr. v. Atty. Francisco R. Llamas',
    promulgated: 'January 20, 2000',
    canonVioldated: 'Rule 1.01, Rule 10.01 & Rule 139-A',
    facts: 'Atty. Llamas failed to pay his IBP dues for years. In his pleadings, he repeatedly indicated an old receipt number ("IBP Rizal 259060") for at least 3 years to mislead courts into believing he was in good standing. When questioned, he claimed that as a Senior Citizen engaged only in "limited practice," he was tax-exempt and therefore exempt from IBP dues.',
    issue: 'Whether Atty. Llamas is exempt from IBP membership dues as a senior citizen, and whether using an outdated receipt constitutes professional misconduct.',
    verdict: 'SUSPENDED FOR 1 YEAR',
    ruling: 'GUILTY. Rule 139-A requires every member of the Integrated Bar to pay annual dues. Limited practice or senior citizen status grants NO exemption from bar dues. Indicating an expired IBP receipt number in pleadings is a deceitful misrepresentation violating Rule 1.01 and Rule 10.01.',
    ratio: 'No lawyer may enjoy the privilege of practicing law while ignoring the financial and ethical duties imposed by the Integrated Bar.'
  },

  // SLIDE 13: IN RE SYCIP - PROFESSION VS BUSINESS
  {
    id: 'slide-13',
    type: 'matrix',
    title: 'The Legal Profession vs. Commercial Business',
    chapter: 'Chapter 2: Learned Profession vs Business',
    badge: 'Landmark Doctrine',
    subtitle: 'In re Sycip, 92 SCRA 1 (July 30, 1979) - 4 Distinguishing Characteristics',
    columns: [
      { icon: 'fa-solid fa-hand-holding-dollar', title: 'Public Service Over Profit', description: 'A duty of public service, of which emolument is a mere byproduct; one may attain the highest eminence without making much money.', citation: 'In re Sycip' },
      { icon: 'fa-solid fa-building-columns', title: 'Officer of the Court', description: 'Direct relationship to the administration of justice requiring thorough sincerity, integrity, and utmost reliability.', citation: 'In re Sycip' },
      { icon: 'fa-solid fa-handshake', title: 'High Fiduciary Trust', description: 'A fiduciary relationship to clients in the highest degree, barring self-dealing, divided loyalty, or trade exploitation.', citation: 'In re Sycip' },
      { icon: 'fa-solid fa-users', title: 'Candor with Colleagues', description: 'A relation to bar brethren characterized by fairness and disdain for commercial advertising or client solicitation.', citation: 'In re Sycip' }
    ],
    summaryNotice: 'A law partnership is not a business partnership for trade; it is a sacred association for a particular public purpose.'
  },

  // SLIDE 14: BURBE V. MAGULTA
  {
    id: 'slide-14',
    type: 'quote',
    title: 'Lawyering Is Not a Money-Making Venture',
    chapter: 'Chapter 2: Learned Profession vs Business',
    badge: 'Fiduciary Duty',
    icon: 'fa-solid fa-coins',
    quote: 'Lawyering is not primarily meant to be a money-making venture, and law advocacy is not a capital that necessarily yields profits. The gaining of a livelihood is not a professional but a secondary consideration.',
    author: 'Dominador P. Burbe v. Atty. Alberto C. Magulta',
    source: 'A.C. No. 99-634, June 10, 2002',
    commentary: 'Atty. Magulta received filing fees from a client but misappropriated the funds and falsely claimed the case was filed. The Court suspended him, reiterating that a lawyer\'s primary duty is unselfish service to justice.'
  },

  // SLIDE 15: AGUIRRE V. RANA - PRIVILEGE NOT A RIGHT
  {
    id: 'slide-15',
    type: 'general',
    title: 'Practice of Law is a Privilege, Not a Right',
    chapter: 'Chapter 2: Learned Profession vs Business',
    badge: 'Constitutional Doctrine',
    subtitle: 'Bar Matter No. 1036 (June 10, 2003) - Aguirre v. Rana',
    bullets: [
      { title: 'Not a Natural or Constitutional Right', desc: 'The practice of law is a privilege burdened with conditions. It is not an absolute right guaranteed by the Constitution.' },
      { title: 'Strict Moral Qualifications', desc: 'Limited strictly to persons of good moral character who continuously satisfy intellectual and ethical requisites.' },
      { title: 'Passing the Bar is Insufficient', desc: 'Edwin Rana passed the bar exam but engaged in unauthorized practice of law before taking the lawyer\'s oath. The Supreme Court denied him admission to the Philippine Bar.' }
    ],
    citation: 'Aguirre vs. Rana, B.M. No. 1036, June 10, 2003'
  },

  // SLIDE 16: CASE DIGEST - KELD STEMMERIK V. ATTY. MAS
  {
    id: 'slide-16',
    type: 'case',
    title: 'Stemmerik v. Mas (Disbarment & Embezzlement)',
    chapter: 'Chapter 2: Learned Profession vs Business',
    badge: 'Gross Deceit & Disbarment',
    sanction: 'Disbarment & P4.2M Restitution',
    docket: 'A.C. No. 8010',
    caseTitle: 'Keld Stemmerik v. Atty. Leonuel N. Mas',
    promulgated: 'June 16, 2009',
    canonVioldated: 'Rule 1.01, Canon 1 & Constitutional Treason',
    facts: 'Stemmerik, a Danish citizen, wanted to purchase land in Subic, Zambales. Atty. Mas falsely advised him that foreigners can legally own Philippine land and suggested a property within the US Military Reservation. Stemmerik entrusted P400k legal fee and P3.8M purchase price. Atty. Mas drafted spurious deeds and absconded with the money while titling the property to a third party.',
    issue: 'Whether Atty. Mas is guilty of gross misconduct warranting disbarment for misrepresenting constitutional property bans and embezzling client funds.',
    verdict: 'DISBARRED',
    ruling: 'DISBARRED and ordered to return P4.2 Million with legal interest. The Court branded him "nothing more than an embezzler." In giving advice that directly contradicted fundamental constitutional policy, he showed contempt for the Constitution and gross ignorance of basic law.',
    ratio: 'A lawyer who uses legal knowledge to deceive foreign clients and circumvent the Constitution forfeits all claims to the Roll of Attorneys.'
  },

  // SLIDE 17: PUBLIC SKEPTICISM & SATIRE
  {
    id: 'slide-17',
    type: 'matrix',
    title: 'The Public Mirror: Jokes, Satire & Cynicism',
    chapter: 'Chapter 3: Cynicism & Historical Hostility',
    badge: 'Cultural Cynicism',
    subtitle: 'How society and literature have mocked lawyers across generations',
    columns: [
      { icon: 'fa-solid fa-scroll', title: 'Shakespeare', description: '"The first thing we do, let\'s kill all the lawyers." (Henry VI, Act IV) — Expressing the eternal tension between rulers and legal advocates.', citation: 'William Shakespeare' },
      { icon: 'fa-solid fa-briefcase', title: 'Mario Puzo', description: '"A lawyer with his briefcase can steal more than a hundred men with guns." — Highlighting the terrifying leverage of sophisticated fraud.', citation: 'The Godfather' },
      { icon: 'fa-solid fa-calculator', title: 'The Cynic\'s Math', description: '2 + 2 = 4 (says the book, teacher, everyone). Politician makes it 5. The Lawyer asks: "What do you want this to be?"', citation: 'Popular Satire' },
      { icon: 'fa-solid fa-book-skull', title: 'The Devil\'s Dictionary', description: 'Ambrose Bierce (1911) defined: "LAWYER, n. One skilled in the circumvention of the law."', citation: 'Ambrose Bierce' }
    ],
    summaryNotice: 'Is this just comedy, or does it reflect the collective disappointment of a public injured by dishonest counsel?'
  },

  // SLIDE 18: HISTORICAL HOSTILITY
  {
    id: 'slide-18',
    type: 'general',
    title: 'Historical Hostility Towards the Legal Profession',
    chapter: 'Chapter 3: Cynicism & Historical Hostility',
    badge: 'Historical Perspective',
    subtitle: 'From revolutionary France to modern democratic states',
    bullets: [
      { title: 'Abolition in Russia (1780) and France (1789)', desc: 'Both nations abolished the legal profession during revolutionary fervor, only to quickly realize judicial systems collapse without trained advocates.' },
      { title: 'Cyclical Anti-Lawyer Agitations', desc: 'Complaints of "too many lawyers" peaked in England and the US in the 1840s, Germany in the 1910s, and Australia, Canada, and Scotland in the 1980s.' },
      { title: 'Post-Watergate Distrust in America', desc: 'Public distrust reached record highs when numerous top presidential aides convicted of corruption were licensed attorneys.' },
      { title: 'The 1989 Nolo Press Compilation', desc: 'Published a 171-page compilation documenting negative anecdotes, proverbs, and denunciations of lawyers throughout human history.' }
    ],
    citation: 'Clarion Legal Research Journal (clarion.ind.in)'
  },

  // SLIDE 19: COMMON PUBLIC COMPLAINTS
  {
    id: 'slide-19',
    type: 'general',
    title: 'The Top 5 Grievances Against Lawyers',
    chapter: 'Chapter 3: Cynicism & Historical Hostility',
    badge: 'Public Grievance Catalog',
    subtitle: 'Why clients file complaints with the Integrated Bar and the Supreme Court',
    bullets: [
      { title: 'Abuse of Litigation & Court Processes', desc: 'Filing frivolous suits, harassing opposing parties, and clogging court dockets for financial leverage.' },
      { title: 'Deceiving Clients and Opposing Parties', desc: 'Concealing case developments, giving false assurances, or misleading clients about procedural prospects.' },
      { title: 'Misappropriation of Entrusted Property', desc: 'Pocketing filing fees, settlement checks, or real estate titles entrusted for safekeeping.' },
      { title: 'Procrastination & Unexplained Inaction', desc: 'Allowing appeals to lapse, missing statutory deadlines, and failing to communicate with anxious clients.' },
      { title: 'Excessive and Unconscionable Legal Fees', desc: 'Charging unearned or exorbitant acceptance and appearance fees while offering substandard service.' }
    ],
    citation: 'IBP Commission on Bar Discipline Empirical Reports'
  },

  // SLIDE 20: WHO WANTS TO BE LIABLE?
  {
    id: 'slide-20',
    type: 'quote',
    title: 'Putting Your Career on Stake',
    chapter: 'Chapter 4: Putting Career on Stake: Disbarment Cases',
    badge: 'The Warning',
    icon: 'fa-solid fa-handcuffs',
    quote: 'Do you want to put your career on stake? Who wants to be liable?',
    author: 'Supreme Court Disciplinary Injunction',
    source: 'The High Cost of Ethical Compromise',
    commentary: 'Years of rigorous study, thousands of hours of bar preparation, and a lifetime of professional aspirations can be permanently destroyed by a single act of moral compromise or deceit.'
  },

  // SLIDE 21: SANCTITY OF MARRIAGE DISBARMENTS
  {
    id: 'slide-21',
    type: 'matrix',
    title: 'Moral Integrity & The Sanctity of Marriage',
    chapter: 'Chapter 4: Putting Career on Stake: Disbarment Cases',
    badge: 'Moral Turpitude Cases',
    subtitle: 'The Supreme Court imposes DISBARMENT for gross immorality in personal life',
    columns: [
      { icon: 'fa-solid fa-ring', title: 'Toledo v. Toledo', description: 'Disbarred for abandoning his lawful wife and cohabiting with another woman who bore him a child. High moral fiber is required at all times.', citation: 'Supreme Court En Banc' },
      { icon: 'fa-solid fa-heart-crack', title: 'Obusan v. Obusan, Jr.', description: 'Disbarred after maintaining an adulterous relationship with a married woman. Failed to maintain the highest degree of morality expected of the Bar.', citation: 'Supreme Court En Banc' },
      { icon: 'fa-solid fa-passport', title: 'Cojuangco v. Palma', description: 'Disbarred for abandoning wife and 3 children, luring an innocent woman to marry him, and falsely declaring himself a "bachelor" abroad.', citation: 'Supreme Court En Banc' },
      { icon: 'fa-solid fa-scale-unbalanced', title: 'Valdez v. Dabon', description: 'Disbarred for unrepentant demeanor and defiance of marital vows, proving moral indifference that imperiled the integrity of justice.', citation: 'Supreme Court En Banc' }
    ],
    summaryNotice: 'Private life is not shielded from administrative liability: A lawyer must maintain impeccable morality in all spheres.'
  },

  // SLIDE 22: POEM - AYOKONG MADEMANDA
  {
    id: 'slide-22',
    type: 'poem',
    title: 'Ayokong Mademanda',
    chapter: 'Chapter 4: Putting Career on Stake: Disbarment Cases',
    badge: 'Tula ng Pagsisisi',
    author: 'Tinig ng Nagkamaling Abogado',
    subtitle: 'Ang matinding pighati ng administrative suspension at disbarment',
    stanzas: [
      'Parang di ko yata kaya na ako ay mademanda; gugulo ang buhay ko, trabaho ko\'y apektado.',
      'Bakit di ko napigil nang tukso\'y lumapit sa \'kin? Bakit di ko nakita batas at polisiya?',
      'Nais ko\'y magserbisyo, maging tunay na abogado; bakit ngayo\'y gulong-gulo, ang utak ko\'y litong-lito?',
      'Hinaharap kong kaso, sakit ng aking ulo — ito ba ang kapalit ng pagkakamali ko?'
    ],
    reflection: 'Walang kabayaran ang kapayapaan ng budhi. Ang pagsunod sa mga panuntunan ng etika ang tanging panangga laban sa kahihiyan at pagkasira ng pangalan.',
    keyTakeaway: 'Ingatan ang pangalan; isang sandali ng kapabayaan ay katumbas ng habambuhay na pagkaalis sa Bar.'
  },

  // SLIDE 23: 2014 LANDMARK ETHICS CASE DIGESTS
  {
    id: 'slide-23',
    type: 'matrix',
    title: 'Supreme Court Disciplinary Rulings (2014 Compendium)',
    chapter: 'Chapter 4: Putting Career on Stake: Disbarment Cases',
    badge: 'Selected Case Digests',
    subtitle: 'Real-world sanctions handed down by the High Court for ethical lapses',
    columns: [
      { icon: 'fa-solid fa-stamp', title: 'A.C. No. 4545', description: 'Notarizing an Affidavit of Loss of a person who was ALREADY DECEASED at the time of notarization. Suspended from practice and notarial commission revoked.', citation: 'Feb 5, 2014' },
      { icon: 'fa-solid fa-masks-theater', title: 'A.C. No. 10135', description: 'Advising a client to use theatrical antics such as "crying and begging" before the judge. Found guilty of improper legal advice; meted with REPRIMAND.', citation: 'Jan 15, 2014' },
      { icon: 'fa-solid fa-hourglass-end', title: 'A.C. No. 10164', description: 'Filing a complaint 5 YEARS after receiving partial acceptance fee, and subsequently appearing against the same clients. 6 MONTHS SUSPENSION.', citation: 'Mar 10, 2014' },
      { icon: 'fa-solid fa-pen-nib', title: 'A.C. No. 10185', description: 'Notarizing a compromise agreement without all parties personally present to attest to truthfulness. 3 MONTHS SUSPENSION & 2-year notarial ban.', citation: 'Mar 12, 2014' }
    ],
    summaryNotice: 'Notarization is not an empty bureaucratic routine; it invests documents with public faith and evidentiary weight.'
  },

  // SLIDE 24: CASE DIGEST - ARNADO V. ADAZA
  {
    id: 'slide-24',
    type: 'case',
    title: 'Arnado v. Atty. Adaza (MCLE Delinquency)',
    chapter: 'Chapter 4: Putting Career on Stake: Disbarment Cases',
    badge: 'MCLE Non-Compliance',
    sanction: '6-Month Suspension & Delinquency',
    docket: 'A.C. No. 9834',
    caseTitle: 'Samuel B. Arnado v. Atty. Homobono A. Adaza',
    promulgated: 'August 26, 2015',
    canonVioldated: 'Bar Matter No. 850 & Canon 5',
    facts: 'Atty. Adaza, a prominent practitioner for nearly 50 years and author of five books, repeatedly noted in his pleadings from 2009 to 2012 that his "MCLE application for exemption under process." Verification with the MCLE Office revealed he had failed to comply with four consecutive compliance periods and filed exemption applications long after the periods expired without following up.',
    issue: 'Whether 50 years of legal experience and authorship exempt a lawyer from MCLE requirements, and whether failure to comply warrants disciplinary suspension.',
    verdict: 'SUSPENDED FOR 6 MONTHS',
    ruling: 'SUSPENDED and declared a DELINQUENT member of the IBP. The Supreme Court ruled that seniority and past prestige grant no immunity from mandatory continuing legal education. Failing to comply jeopardized his clients\' causes because pleadings filed without valid MCLE compliance can be expunged from the record.',
    ratio: 'Lifelong learning and obedience to court directives apply equally to seasoned veterans and newly minted attorneys.'
  },

  // SLIDE 25: POEM - ABOGADONG DI NAKA-SURVIVE
  {
    id: 'slide-25',
    type: 'poem',
    title: 'Abogadong Di Naka-Survive',
    chapter: 'Chapter 4: Putting Career on Stake: Disbarment Cases',
    badge: 'Tula ng Babala',
    author: 'Pagninilay sa Trahedya',
    subtitle: 'Ang trahedya ng karamdamang dulot ng kahihiyan at pagkasira',
    stanzas: [
      'Mayroong abogadong dati\'y kay sigla; mababakas sa mukha n\'ya ligaya at tuwa. Kay tagal na panahon sa korte ay namayagpag s\'ya, kanyang galing hinangaan dahil kakaiba ang kanyang dating.',
      'Ngunit ngayon abogadong \'to di mangiti di matawa, wala na siyang sigla. Pagkat ngayon naroon s\'ya pinaglalamayan na — cardiac arrest, hypertension, sama ng loob at depresyon. Abogado\'y di nakasurvive.',
      'Sagad laman hanggang buto sakit na nadama; kanyang dangal niyurakan, dignidad tinapakan. Ang kawawang abogado ngayo\'y nag-iisa na lang.',
      'Nang tanggalin, kasuhan s\'ya ng kaliwa\'t kanan, di na nakita pa bagay na nagawa n\'ya. Pagkakamaling minsa\'y naging mitya ng buhay n\'ya... abogado\'y ito\'y di nakasurvive.'
    ],
    reflection: 'Ang etika ay proteksyon sa sarili. Kapag nilabag ng abogado ang kanyang sinumpaang tungkulin, hindi lamang lisensya ang nanganganib kundi pati ang kalusugan, pamilya, at buhay mismo.',
    keyTakeaway: 'Huwag hayaang ang isang maling pasya ay maging mitsa ng iyong pagkawala.'
  },

  // SLIDE 26: DID WE FORGET OUR PROMISE?
  {
    id: 'slide-26',
    type: 'quote',
    title: 'Did We Forget Our Promise?',
    chapter: 'Chapter 5: The Sacred Lawyer\'s Oath & The CPRA',
    badge: 'The Central Question',
    icon: 'fa-solid fa-question',
    quote: 'Did we forget our promise?',
    author: 'The Call to Conscience',
    source: 'The Lawyer\'s Oath & Rules of Court',
    commentary: 'When ambition overshadows conscience, and fee generation eclipses the search for justice, every member of the Bar must return to the moment they raised their right hand before the Supreme Court.'
  },

  // SLIDE 27: WHAT IS AN OATH?
  {
    id: 'slide-27',
    type: 'general',
    title: 'What Is an Oath? A Sacred Trust',
    chapter: 'Chapter 5: The Sacred Lawyer\'s Oath & The CPRA',
    badge: 'Juridical Nature',
    subtitle: 'Definitions and Legal Weight under Philippine Jurisprudence',
    bullets: [
      { title: 'Webster\'s Lexical Definition', desc: 'A solemn appeal to God, or any sacred sanction, for the truth of an affirmation or in witness of the inviolability of a promise.' },
      { title: 'Alvarez v. CFI Doctrine', desc: 'An oath includes any form of attestation by which a party signifies he is bound in conscience to perform an act faithfully and truthfully under an immediate sense of responsibility to God.' },
      { title: 'Sebastian v. Calis (314 SCRA 1)', desc: 'The lawyer\'s oath is not mere facile words, drift and hollow, but a sacred trust that must be upheld and kept inviolable.' },
      { title: 'Endaya v. Oca (410 SCRA 244)', desc: 'The lawyer\'s oath embodies the fundamental principles that guide every member of the legal fraternity.' }
    ],
    citation: 'Sebastian v. Calis; Endaya v. Oca; In re Argosino'
  },

  // SLIDE 28: RULE 138 SECTION 17
  {
    id: 'slide-28',
    type: 'general',
    title: 'Section 17, Rule 138 of the Rules of Court',
    chapter: 'Chapter 5: The Sacred Lawyer\'s Oath & The CPRA',
    badge: 'Condition Precedent',
    subtitle: 'Taking the Oath is an Indispensable Prerequisite to Admission',
    bullets: [
      { title: 'Admission Requires Oath of Office', desc: 'An applicant who has passed the bar examination shall take and subscribe before the Supreme Court an oath of office.' },
      { title: 'Public Attestation of Duty', desc: 'The new lawyer swears before a duly constituted authority as an attestation that he/she takes on the duties and responsibilities proper of a lawyer.' },
      { title: 'Not a Mere Formality (In Re Argosino)', desc: 'Taking the oath is not an empty ceremony. It impresses upon the attorney his status as an officer of the court with co-equal duties.' }
    ],
    citation: 'Rule 138, Sec. 17; In Re: Arthur M. Cuevas, 1998'
  },

  // SLIDE 29: OFFICER OF THE COURT DOCTRINE
  {
    id: 'slide-29',
    type: 'quote',
    title: 'Officer of the Court for Life',
    chapter: 'Chapter 5: The Sacred Lawyer\'s Oath & The CPRA',
    badge: 'Judicial Equality',
    icon: 'fa-solid fa-building-columns',
    quote: 'The significance of the oath is that it not only impresses upon the attorney his responsibilities but it also stamps him as an officer of the court with rights, powers and duties as important as those of the judges themselves. It is a source of his obligations and its violation is a ground for suspension, disbarment or other disciplinary action.',
    author: 'Justice Ruben E. Agpalo',
    source: 'Legal Ethics (1992 ed., p. 59)',
    commentary: 'Justice Miller observed: An attorney is an administrator of justice for life whose office cannot be taken from him except for cause established by due process of law.'
  },

  // SLIDE 30: THE TRADITIONAL LAWYER\'S OATH
  {
    id: 'slide-30',
    type: 'quote',
    title: 'The Traditional Lawyer\'s Oath',
    chapter: 'Chapter 5: The Sacred Lawyer\'s Oath & The CPRA',
    badge: 'Form 28, Rules of Court',
    icon: 'fa-solid fa-scroll',
    quote: 'I do solemnly swear that I will maintain allegiance to the Republic of the Philippines; I will support its Constitution and obey laws as well as the legal orders of the duly constituted authorities therein; I will do no falsehood, nor consent to the doing of any in court; I will not wittingly nor willingly promote or sue any groundless, false or unlawful suit, or give aid nor consent to the same; I will delay no man for money or malice, and will conduct myself as a lawyer according to the best of my knowledge and discretion with all good fidelity as well to the courts as to my clients; and I impose upon myself this voluntary obligations without any mental reservation or purpose of evasion. So help me God.',
    author: 'The Historic Philippine Lawyer\'s Oath',
    source: 'Rules of Court (1917–2023)',
    commentary: 'For over a century, this historic text formed the moral threshold crossed by every legal practitioner in the Philippines.'
  },

  // SLIDE 31: THE NEW CPRA LAWYER\'S OATH
  {
    id: 'slide-31',
    type: 'quote',
    title: 'The New CPRA Lawyer\'s Oath',
    chapter: 'Chapter 5: The Sacred Lawyer\'s Oath & The CPRA',
    badge: 'A.M. No. 22-09-01-SC (April 11, 2023)',
    icon: 'fa-solid fa-sparkles',
    quote: 'I accept the honor, privilege, duty, and responsibility of practicing law in the Philippines as an officer of the court in the interest of justice; That I will support the Constitution and obey the laws as well as the legal orders of the duly constituted authorities therein; That I will do no falsehood, nor consent to its commission; That I will not wittingly or willingly promote or sue any groundless, false, or unlawful suit, nor give aid nor consent to the same; That I will not delay any person\'s cause for money or malice; That I will conduct myself as a lawyer according to the Code of Professional Responsibility and Accountability and the Rules of Court, with all good fidelity to the courts, to the legal profession, to my clients, and to society; That I impose this obligation upon myself voluntarily, without mental reservation or purpose of evasion. So help me God.',
    author: 'The New Lawyer\'s Oath (CPRA)',
    source: 'Supreme Court of the Philippines En Banc',
    commentary: 'Adopted to reflect contemporary challenges, the new oath expands the lawyer\'s fidelity beyond clients and courts to encompass the Legal Profession and Society as a whole.'
  },

  // SLIDE 32: CLAUSE 1 & 2 - ALLEGIANCE & CONSTITUTION
  {
    id: 'slide-32',
    type: 'oath-clause',
    title: 'Allegiance to Constitution & Legal Orders',
    chapter: 'Chapter 5: The Sacred Lawyer\'s Oath & The CPRA',
    clauseBadge: 'Clause 1 & 2 of the Oath',
    clauseText: 'That I will support the Constitution and obey the laws as well as the legal orders of the duly constituted authorities therein;',
    meaning: 'The lawyer is first and foremost a defender of constitutional supremacy. A lawyer\'s primary duty is not client victory at all costs, but promoting respect for the law and obedience to lawful judicial processes.',
    prohibitions: [
      'Advising clients to disobey lawful court orders or warrants',
      'Assisting clients in circumventing constitutional prohibitions',
      'Counseling extrajudicial evasion or contemptuous defiance'
    ],
    caseAnchor: {
      title: 'Brion Jr. v. Brillantes, Jr. (314 SCRA 267)',
      rule: 'The lawyer\'s irreducible minimum duty entails obedience to the legal orders of the court.'
    }
  },

  // SLIDE 33: CLAUSE 3 - I WILL DO NO FALSEHOOD
  {
    id: 'slide-33',
    type: 'oath-clause',
    title: 'The Injunction Against Falsehood',
    chapter: 'Chapter 5: The Sacred Lawyer\'s Oath & The CPRA',
    clauseBadge: 'Clause 3 of the Oath',
    clauseText: 'That I will do no falsehood, nor consent to its commission;',
    meaning: 'A lawyer is a minister of justice and a disciple of truth. Candor toward the court is paramount. A lawyer must never mislead a tribunal by artifice, fabricated evidence, or distorted citations.',
    prohibitions: [
      'Presenting forged affidavits or falsified witness signatures',
      'Misrepresenting dates of receipt to beat filing deadlines',
      'Altering judicial precedents or misquoting statutory provisions'
    ],
    caseAnchor: {
      title: 'Spouses Umaguing v. Atty. De Vera (A.C. No. 10451)',
      rule: 'Suspended for submitting affidavits with forged signatures of unavailable witnesses in an election protest.'
    }
  },

  // SLIDE 34: YOUNG V. BATUEGAS - DISCIPLE OF TRUTH
  {
    id: 'slide-34',
    type: 'quote',
    title: 'A Lawyer Must Be a Disciple of Truth',
    chapter: 'Chapter 5: The Sacred Lawyer\'s Oath & The CPRA',
    badge: 'Canon of Candor',
    icon: 'fa-solid fa-sun',
    quote: 'A lawyer must be a disciple of truth. While a lawyer has the solemn duty to defend his client\'s rights and is expected to display the utmost zeal in defense of his client\'s cause, his conduct must never be at the expense of truth.',
    author: 'Young v. Batuegas',
    source: '403 SCRA 123 (May 9, 2003)',
    commentary: 'Zealous advocacy stops where falsehood begins. Complete honesty is expected of lawyers appearing and pleading before judicial benches.'
  },

  // SLIDE 35: CLAUSE 4 & 5 - NO GROUNDLESS SUITS & NO DELAY
  {
    id: 'slide-35',
    type: 'oath-clause',
    title: 'No Groundless Suits & No Delay for Money',
    chapter: 'Chapter 5: The Sacred Lawyer\'s Oath & The CPRA',
    clauseBadge: 'Clause 4 & 5 of the Oath',
    clauseText: 'That I will not wittingly or willingly promote or sue any groundless, false, or unlawful suit... That I will not delay any person\'s cause for money or malice;',
    meaning: 'Courts are temples of justice, not instruments of extortion, harassment, or tactical attrition. Lawyers must advise against frivolous lawsuits and refuse to exploit delay to exhaust opposing litigants.',
    prohibitions: [
      'Filing duplicative suits in multiple fora (Forum Shopping)',
      'Requesting repetitive motions for postponement to extort fees',
      'Using the court\'s machinery to harass political or business rivals'
    ],
    caseAnchor: {
      title: 'Kahlil Gibran Admonition',
      rule: '"Safeguarding the rights of others is the most noble and beautiful end of a human being."'
    }
  },

  // SLIDE 36: CLAUSE 6 - FIDELITY & PRIVATE CONDUCT
  {
    id: 'slide-36',
    type: 'case',
    title: 'Sosa v. Atty. Mendoza (Bouncing Check & Debt)',
    chapter: 'Chapter 6: Landmark Case Digests & Breaches',
    badge: 'Private Misconduct',
    sanction: 'Suspension / Disbarment',
    docket: 'A.C. No. 8776',
    caseTitle: 'Antonina S. Sosa v. Atty. Manuel V. Mendoza',
    promulgated: 'March 22, 2017',
    canonVioldated: 'Rule 1.01 & Private Capacity Conduct',
    facts: 'Atty. Mendoza obtained a loan of P500,000 from complainant Sosa and issued a postdated check. When deposited, the check was dishonored for insufficient funds. Despite multiple demands, Mendoza failed to settle the debt. He argued that the transaction was private and had no relation to an attorney-client relationship.',
    issue: 'May a lawyer be administratively disciplined or disbarred for misconduct committed in his personal or private capacity?',
    verdict: 'SUSPENDED FOR 1 YEAR',
    ruling: 'YES. The Court affirmed that any gross misconduct of a lawyer in his professional OR private capacity is ground for disciplinary action. Good character is an essential condition for continued bar membership. Issuing bouncing checks and willfully evading debts demonstrates dishonesty that impairs public confidence in the legal profession.',
    ratio: 'A lawyer cannot compartmentalize morality between court appearances and private dealings.'
  },

  // SLIDE 37: HERNANDEZ V. ATTY. GO - SELF-DEALING
  {
    id: 'slide-37',
    type: 'case',
    title: 'Hernandez v. Atty. Go (Property Self-Dealing)',
    chapter: 'Chapter 6: Landmark Case Digests & Breaches',
    badge: 'Fiduciary Betrayal',
    sanction: 'DISBARRED',
    docket: 'A.C. No. 1526',
    caseTitle: 'Nazaria S. Hernandez v. Atty. Jose C. Go',
    promulgated: 'January 31, 2005',
    canonVioldated: 'Rule 16.01, Rule 17.01 & Art. 1491 Civil Code',
    facts: 'Complainant Hernandez retained Atty. Go to sell her property lots to satisfy creditors. Instead of finding outside buyers, Atty. Go surreptitiously bought the lots for himself at below-market rates, spent his own money to pay creditors, and failed to account for proceeds or remit any surplus to his client.',
    issue: 'Whether Atty. Go breached fiduciary duty by self-dealing and appropriating his client\'s real property.',
    verdict: 'DISBARRED',
    ruling: 'DISBARRED. A lawyer shall hold in trust all moneys and properties of his client that come into his possession. Self-dealing and purchasing property involved in client representation degrades the honor of the legal profession. When an attorney is no longer worthy of trust, it is the duty of the Court to withdraw the privilege.',
    ratio: 'A lawyer owes absolute fidelity to the cause of his client and must never turn the client\'s vulnerability into personal profit.'
  },

  // SLIDE 38: TORMIS V. PAREDES - CLASSROOM CIVILITY
  {
    id: 'slide-38',
    type: 'case',
    title: 'Tormis v. Judge Paredes (Classroom Civility)',
    chapter: 'Chapter 6: Landmark Case Digests & Breaches',
    badge: 'Classroom Demeanor',
    sanction: 'Administrative Sanction',
    docket: 'A.M. No. RTJ-13-2366',
    caseTitle: 'Jill M. Tormis v. Judge Paredes',
    promulgated: 'February 4, 2015',
    canonVioldated: 'Canons of Judicial Ethics & Bar Civility',
    facts: 'In his Political Law Review class at Southwestern University, a judge publicly attacked Judge Rosabella Tormis, naming her as corrupt and abusive, and publicly disparaged her son Francis as a "court-noted addict." Her daughter Jill, enrolled in the course, suffered acute humiliation and was forced to transfer to another law school.',
    issue: 'Whether legal educators and judges may use law school classrooms to attack fellow bench members and defame family members.',
    verdict: 'ADMINISTRATIVELY SANCTIONED',
    ruling: 'The Court admonished that academic freedom does not grant license to defame judicial colleagues or use law lectures to settle personal grievances. Lawyers in academia must exemplify dignity, restraint, and decorum at all times.',
    ratio: 'The classroom is where future lawyers learn reverence for the law; professors must teach civility by living example.'
  },

  // SLIDE 39: THE FOUR-FOLD RESPONSIBILITIES
  {
    id: 'slide-39',
    type: 'matrix',
    title: 'The Four-Fold Responsibilities of the Modern Lawyer',
    chapter: 'Chapter 7: Four-Fold Duties & True Happiness',
    badge: 'Synthesis Matrix',
    subtitle: 'The foundational pillars codified in the CPRA',
    columns: [
      { icon: 'fa-solid fa-earth-asia', title: 'Duties to Society', description: 'Uphold the Constitution, promote social justice, facilitate access to legal services for the underprivileged, and obey laws.', citation: 'CPRA Canon I' },
      { icon: 'fa-solid fa-users-viewfinder', title: 'Duties to Profession', description: 'Maintain integrity, foster collegiality without commercial encroachment, and continuously elevate competence.', citation: 'CPRA Canon II' },
      { icon: 'fa-solid fa-building-columns', title: 'Duties to Courts', description: 'Show respect and deference to judges, assist in swift case administration, and never mislead the tribunal.', citation: 'CPRA Canon III' },
      { icon: 'fa-solid fa-hand-holding-hand', title: 'Duties to Clients', description: 'Observe utmost fidelity, protect confidences, zealously advocate within legal bounds, and strictly account for funds.', citation: 'CPRA Canon IV' }
    ],
    summaryNotice: 'Justice Jose L. Sabio, Jr.: "The legal profession is laden with a great amount of trust... it presupposes a moral burden demanding personal integrity."'
  },

  // SLIDE 40: RETURN TO BASIC IDEALS & HAPPINESS
  {
    id: 'slide-40',
    type: 'hero',
    chapter: 'Chapter 7: Four-Fold Duties & True Happiness',
    chapterIcon: 'fa-solid fa-heart',
    badge: 'Final Benediction',
    tagline: 'A Return to Basic Ideals',
    title: 'Happiness Is Being a Lawyer and Loving It',
    subtitle: 'Living the Oath each day with honor, wisdom, and clean hands.',
    features: [
      { icon: 'fa-solid fa-seedling', title: 'Keep the Faith', desc: 'When you protect the defenseless, you fulfill the highest purpose of humanity.' },
      { icon: 'fa-solid fa-scale-balanced', title: 'Honor the Oath', desc: 'Let your words in court and life remain faithful to the promise you made to God and Country.' },
      { icon: 'fa-solid fa-award', title: 'The True Victory', desc: 'A clean conscience and an unblemished reputation are the greatest legacy in the law.' }
    ]
  }
]);

// Computed helper for filtered slides in grid mode
const filteredSlides = computed(() => {
  return slides.value.map((s, index) => ({ ...s, index })).filter(s => {
    const q = searchQuery.value.toLowerCase().trim();
    const title = (s.title || s.caseTitle || s.quote || '').toLowerCase();
    const subtitle = (s.subtitle || '').toLowerCase();
    const caseTitle = (s.caseTitle || '').toLowerCase();
    const quote = (s.quote || '').toLowerCase();
    const facts = (s.facts || '').toLowerCase();
    
    const matchesSearch = !q || 
      title.includes(q) ||
      subtitle.includes(q) ||
      caseTitle.includes(q) ||
      quote.includes(q) ||
      facts.includes(q);
    
    const matchesChapter = !selectedChapter.value || s.chapter === selectedChapter.value;
    return matchesSearch && matchesChapter;
  });
});

const currentSlide = computed(() => slides.value[currentSlideIndex.value] || slides.value[0]);

// Navigation handlers
const nextSlide = () => {
  if (currentSlideIndex.value < slides.value.length - 1) {
    currentSlideIndex.value++;
    stopSpeech();
  }
};

const prevSlide = () => {
  if (currentSlideIndex.value > 0) {
    currentSlideIndex.value--;
    stopSpeech();
  }
};

const jumpToSlide = (idx) => {
  if (idx >= 0 && idx < slides.value.length) {
    currentSlideIndex.value = idx;
    isGridView.value = false;
    stopSpeech();
  }
};

// Fullscreen Handler
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.warn("Fullscreen request error:", err);
    });
    isFullscreen.value = true;
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    isFullscreen.value = false;
  }
};

// Autoplay Slideshow
const toggleAutoplay = () => {
  isAutoplay.value = !isAutoplay.value;
  if (isAutoplay.value) {
    autoplayTimer.value = setInterval(() => {
      if (currentSlideIndex.value < slides.value.length - 1) {
        currentSlideIndex.value++;
      } else {
        currentSlideIndex.value = 0;
      }
    }, 7000);
  } else {
    clearInterval(autoplayTimer.value);
    autoplayTimer.value = null;
  }
};

// Speech Synthesis Web API (Narration)
const toggleSpeech = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    alert("Speech Synthesis is not supported in this browser.");
    return;
  }

  if (isSpeaking.value) {
    window.speechSynthesis.cancel();
    isSpeaking.value = false;
    return;
  }

  // Construct text to read
  const s = currentSlide.value;
  let textToRead = `${s.title || ''}. `;
      if (s.subtitle) textToRead += `${s.subtitle}. `;
  if (s.quote) textToRead += `Quote: ${s.quote}. Attributed to ${s.author || ''}. `;
  if (s.stanzas) textToRead += s.stanzas.join(' ');
  if (s.facts) textToRead += `Facts: ${s.facts} Ruling: ${s.ruling}`;
  if (s.clauseText) textToRead += `Clause: ${s.clauseText}. Meaning: ${s.meaning}`;

  const utterance = new SpeechSynthesisUtterance(textToRead);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;
  
  utterance.onend = () => {
    isSpeaking.value = false;
  };

  utterance.onerror = () => {
    isSpeaking.value = false;
  };

  window.speechSynthesis.speak(utterance);
  isSpeaking.value = true;
};

const stopSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    isSpeaking.value = false;
  }
};

// Keyboard Shortcuts
const handleKeydown = (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
    return;
  }

  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
    e.preventDefault();
    nextSlide();
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    e.preventDefault();
    prevSlide();
  } else if (e.key === 'Home') {
    e.preventDefault();
    jumpToSlide(0);
  } else if (e.key === 'End') {
    e.preventDefault();
    jumpToSlide(slides.value.length - 1);
  } else if (e.key.toLowerCase() === 'f') {
    e.preventDefault();
    toggleFullscreen();
  } else if (e.key.toLowerCase() === 'g') {
    e.preventDefault();
    isGridView.value = !isGridView.value;
  } else if (e.key.toLowerCase() === 'escape') {
    if (showOathModal.value) showOathModal.value = false;
    if (isGridView.value) isGridView.value = false;
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement;
  });
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown);
  }
  if (autoplayTimer.value) clearInterval(autoplayTimer.value);
  stopSpeech();
});
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Custom scrollbars inside modal and thumbnail navigation */
.scrollbar::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}
.scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 55, 0.3);
  border-radius: 9999px;
}
.scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(212, 175, 55, 0.6);
}
</style>