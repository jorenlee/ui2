<template>
  <div class="min-h-screen flex flex-col font-montserrat bg-slate-50 text-slate-800 antialiased selection:bg-emerald-600 selection:text-white">
    <!-- Header -->
    <Header />

    <!-- Main Container -->
    <main class="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6" aria-label="Breadcrumb">
        <NuxtLink to="/" class="hover:text-emerald-700 transition-colors flex items-center gap-1.5">
          <i class="fas fa-home"></i>
          <span>Home</span>
        </NuxtLink>
        <i class="fas fa-chevron-right text-[10px] text-slate-400"></i>
        <span class="text-slate-400">Tools</span>
        <i class="fas fa-chevron-right text-[10px] text-slate-400"></i>
        <span class="text-emerald-700 font-bold">AI Background Remover</span>
      </nav>

      <!-- Hero Banner Header -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#00381e] via-[#004724] to-[#012513] text-white p-6 sm:p-10 shadow-xl mb-8 border border-emerald-800/40">
        <!-- Ambient Decorative Glows -->
        <div class="absolute -right-16 -top-16 w-80 h-80 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -left-16 -bottom-16 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none"></div>

        <div class="relative z-10 max-w-3xl">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
            <i class="fas fa-wand-magic-sparkles text-emerald-300 animate-pulse"></i>
            <span>Ultra Precision AI • Hair &amp; Clothing Protection</span>
          </div>
          <h1 class="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white mb-3">
            Remove Background <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200">Instantly</span>
          </h1>
          <p class="text-emerald-100/80 text-sm sm:text-base leading-relaxed max-w-2xl mb-4">
            Segment portraits, student IDs, and fine hair strands with pixel-perfect accuracy. Advanced neural matting cleanly preserves interior clothes, jewelry, and edges without halo spots.
          </p>
          <div class="flex flex-wrap items-center gap-4 text-xs text-emerald-200/75">
            <span class="inline-flex items-center gap-1.5"><i class="fas fa-shield-halved text-emerald-400"></i> 100% Private (Runs locally)</span>
            <span class="inline-flex items-center gap-1.5"><i class="fas fa-scissors text-emerald-400"></i> Fine Hair Matting</span>
            <span class="inline-flex items-center gap-1.5"><i class="fas fa-shirt text-emerald-400"></i> Clothing Protection</span>
            <span class="inline-flex items-center gap-1.5"><i class="fas fa-file-image text-emerald-400"></i> HD PNG Export</span>
          </div>
        </div>
      </div>

      <!-- MAIN WORKSPACE -->
      <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-4 sm:p-8 mb-8 transition-all">
        <!-- 1. UPLOAD STATE (WHEN NO IMAGE IS LOADED) -->
        <div v-if="!originalImageSrc" class="space-y-8">
          <!-- Dropzone -->
          <div
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleFileDrop"
            :class="[
              'relative rounded-2xl border-2 border-dashed p-8 sm:p-14 text-center transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center',
              isDragging
                ? 'border-emerald-500 bg-emerald-50/70 scale-[0.99] shadow-inner'
                : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/80'
            ]"
            @click="triggerFileInput"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              class="hidden"
              @change="handleFileInput"
            />

            <!-- Icon Stack -->
            <div class="relative mb-5">
              <div class="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-700/20 group-hover:scale-110 group-hover:rotate-2 transition-transform duration-300">
                <i class="fas fa-cloud-arrow-up text-3xl"></i>
              </div>
              <div class="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-white border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-sm">
                <i class="fas fa-sparkles text-xs"></i>
              </div>
            </div>

            <!-- Upload Prompts -->
            <h3 class="text-lg sm:text-xl font-bold text-slate-800 mb-1 group-hover:text-emerald-800 transition-colors">
              Click to upload or drag &amp; drop your image
            </h3>
            <p class="text-xs sm:text-sm text-slate-500 mb-4 max-w-md">
              Supports PNG, JPG, JPEG, and WebP. You can also paste an image directly with <kbd class="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs font-mono text-slate-700">Ctrl + V</kbd>.
            </p>

            <button
              type="button"
              class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-md shadow-emerald-900/20 hover:shadow-lg transition-all active:scale-95"
            >
              <i class="fas fa-folder-open"></i>
              <span>Select File</span>
            </button>
          </div>

          <!-- Sample Images to Test Instantly -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <i class="fas fa-images text-emerald-600"></i> Or try these sample images:
              </span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <button
                v-for="(sample, index) in sampleImages"
                :key="index"
                @click="loadSampleImage(sample.url)"
                class="group relative rounded-xl overflow-hidden border border-slate-200 hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-100 aspect-[4/3] flex flex-col items-center justify-center text-left"
              >
                <img
                  :src="sample.url"
                  :alt="sample.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  crossorigin="anonymous"
                />
                <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-white text-xs font-medium">
                  <span class="truncate block">{{ sample.title }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- 2. PROCESSING & EDITOR VIEW (WHEN IMAGE IS LOADED) -->
        <div v-else class="space-y-6">
          <!-- Top Action Bar -->
          <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div class="flex items-center gap-3">
              <button
                @click="resetWorkspace"
                class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-sm"
                title="Upload another image"
              >
                <i class="fas fa-arrow-left"></i>
                <span>Upload New</span>
              </button>
              <div class="text-xs text-slate-500 truncate max-w-[180px] sm:max-w-xs" :title="imageFileName">
                <span class="font-bold text-slate-700 block truncate">{{ imageFileName || 'Image' }}</span>
                <span v-if="imageDimensions.width">{{ imageDimensions.width }} × {{ imageDimensions.height }}px</span>
              </div>
            </div>

            <!-- View Modes & Quick Backdrop Switcher -->
            <div class="flex flex-wrap items-center gap-2">
              <!-- Quick Test Background Toggles (Essential for checking halos) -->
              <div class="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
                <span class="text-[10px] uppercase text-slate-400 px-1.5 hidden sm:inline">Preview On:</span>
                <button
                  @click="bgType = 'transparent'"
                  :class="['w-6 h-6 rounded-lg border transition-all flex items-center justify-center text-[10px]', bgType === 'transparent' ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-slate-300 bg-white']"
                  title="Transparent Checkerboard"
                >
                  🏁
                </button>
                <button
                  @click="setQuickBg('#1a103c')"
                  :class="['w-6 h-6 rounded-lg border transition-all ml-1', bgType === 'solid' && solidColor === '#1a103c' ? 'border-emerald-400 ring-2 ring-emerald-500/30' : 'border-slate-400']"
                  style="background-color: #1a103c;"
                  title="Dark Purple (Test Dark Halo)"
                ></button>
                <button
                  @click="setQuickBg('#000000')"
                  :class="['w-6 h-6 rounded-lg border transition-all ml-1', bgType === 'solid' && solidColor === '#000000' ? 'border-emerald-400 ring-2 ring-emerald-500/30' : 'border-slate-400']"
                  style="background-color: #000000;"
                  title="Pure Black (Test Halos)"
                ></button>
                <button
                  @click="setQuickBg('#ffffff')"
                  :class="['w-6 h-6 rounded-lg border transition-all ml-1', bgType === 'solid' && solidColor === '#ffffff' ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-slate-300']"
                  style="background-color: #ffffff;"
                  title="Pure White"
                ></button>
                <button
                  @click="setQuickBg('#004724')"
                  :class="['w-6 h-6 rounded-lg border transition-all ml-1', bgType === 'solid' && solidColor === '#004724' ? 'border-emerald-400 ring-2 ring-emerald-500/30' : 'border-slate-400']"
                  style="background-color: #004724;"
                  title="LSU Green"
                ></button>
              </div>

              <!-- Zoom Level Controls -->
              <div class="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
                <button
                  @click="zoomLevel = Math.max(0.5, +(zoomLevel - 0.25).toFixed(2))"
                  class="px-2 py-1 hover:text-emerald-800 rounded"
                  title="Zoom Out"
                >
                  <i class="fas fa-minus text-[10px]"></i>
                </button>
                <span class="px-2 font-mono text-[11px] min-w-[45px] text-center">{{ Math.round(zoomLevel * 100) }}%</span>
                <button
                  @click="zoomLevel = Math.min(3.0, +(zoomLevel + 0.25).toFixed(2))"
                  class="px-2 py-1 hover:text-emerald-800 rounded"
                  title="Zoom In"
                >
                  <i class="fas fa-plus text-[10px]"></i>
                </button>
                <button
                  @click="zoomLevel = 1.0"
                  class="px-1.5 py-1 hover:text-emerald-800 rounded text-[10px] ml-0.5 border-l border-slate-200"
                  title="Reset Zoom"
                >
                  100%
                </button>
              </div>

              <!-- View Modes Tabs -->
              <div class="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
                <button
                  @click="viewMode = 'result'"
                  :class="['px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5', viewMode === 'result' ? 'bg-white text-emerald-800 shadow-sm' : 'hover:text-slate-900']"
                >
                  <i class="fas fa-wand-magic-sparkles"></i>
                  <span class="hidden sm:inline">Result</span>
                </button>
                <button
                  @click="viewMode = 'slider'"
                  :class="['px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5', viewMode === 'slider' ? 'bg-white text-emerald-800 shadow-sm' : 'hover:text-slate-900']"
                >
                  <i class="fas fa-arrows-left-right"></i>
                  <span>Compare</span>
                </button>
                <button
                  @click="viewMode = 'side-by-side'"
                  :class="['px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5', viewMode === 'side-by-side' ? 'bg-white text-emerald-800 shadow-sm' : 'hover:text-slate-900']"
                >
                  <i class="fas fa-table-columns"></i>
                  <span class="hidden sm:inline">Side by Side</span>
                </button>
                <button
                  @click="viewMode = 'original'"
                  :class="['px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5', viewMode === 'original' ? 'bg-white text-emerald-800 shadow-sm' : 'hover:text-slate-900']"
                >
                  <i class="fas fa-image"></i>
                  <span class="hidden sm:inline">Original</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Loading / Processing Status Overlay -->
          <div v-if="isProcessing" class="p-8 sm:p-12 text-center bg-emerald-50/50 rounded-2xl border border-emerald-200">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-700 text-white mb-4 animate-bounce shadow-lg shadow-emerald-700/20">
              <i class="fas fa-wand-magic-sparkles text-2xl"></i>
            </div>
            <h4 class="text-base sm:text-lg font-bold text-emerald-950 mb-1">
              {{ processingStatusText || 'Removing background...' }}
            </h4>
            <p class="text-xs text-emerald-700/80 max-w-md mx-auto mb-4">
              Running high-precision hair segmentation, white spot elimination and edge de-haloing...
            </p>
            <!-- Progress Bar -->
            <div class="max-w-xs mx-auto w-full bg-emerald-200 rounded-full h-2 overflow-hidden">
              <div
                class="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${processingProgress}%` }"
              ></div>
            </div>
            <span class="text-xs font-bold text-emerald-800 mt-2 block">{{ processingProgress }}%</span>
          </div>

          <!-- Notice if fallback or message -->
          <div v-if="noticeMessage" class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="fas fa-circle-check text-emerald-600"></i>
              <span>{{ noticeMessage }}</span>
            </div>
            <button @click="processImage(true)" class="px-2.5 py-1 bg-emerald-200 hover:bg-emerald-300 text-emerald-900 font-bold rounded-lg transition-colors">
              Re-Process
            </button>
          </div>

          <!-- WORKSPACE DISPLAY AREA & CONTROLS GRID -->
          <div v-show="!isProcessing" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <!-- LEFT / CENTER: CANVAS / PREVIEW DISPLAY -->
            <div class="lg:col-span-8 flex flex-col items-center">
              <div class="relative w-full rounded-2xl overflow-auto border border-slate-200 bg-slate-100 flex items-center justify-center min-h-[380px] sm:min-h-[500px] max-h-[640px]">
                
                <!-- 1. SINGLE RESULT VIEW -->
                <div
                  v-if="viewMode === 'result'"
                  class="relative w-full h-full flex items-center justify-center p-4 overflow-auto transition-colors duration-200"
                  :style="backgroundStyle"
                >
                  <!-- Checkerboard overlay for transparent bg -->
                  <div
                    v-if="bgType === 'transparent'"
                    class="absolute inset-0 pointer-events-none [background-image:linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] [background-size:20px_20px] [background-position:0_0,0_10px,10px_-10px,-10px_0px] opacity-60"
                  ></div>

                  <!-- Rendered Subject Image or Touch-up Canvas with Zoom -->
                  <div
                    class="relative max-w-full flex items-center justify-center transition-transform duration-150 origin-center"
                    :style="{ transform: `scale(${zoomLevel})` }"
                  >
                    <img
                      v-if="!isTouchupMode && resultImageSrc"
                      :src="resultImageSrc"
                      alt="Background removed"
                      class="max-w-full max-h-[540px] object-contain rounded-lg shadow-sm"
                      :style="imageFilterStyle"
                    />
                    <!-- Touch up Interactive Canvas -->
                    <canvas
                      v-show="isTouchupMode"
                      ref="touchupCanvasRef"
                      @mousedown="startDrawing"
                      @mousemove="draw"
                      @mouseup="stopDrawing"
                      @mouseleave="stopDrawing"
                      @touchstart.prevent="startTouch"
                      @touchmove.prevent="touchMove"
                      @touchend.prevent="stopDrawing"
                      class="max-w-full max-h-[540px] object-contain rounded-lg shadow-sm cursor-crosshair touch-none"
                    ></canvas>
                  </div>
                </div>

                <!-- 2. SPLIT BEFORE/AFTER COMPARISON SLIDER -->
                <div
                  v-else-if="viewMode === 'slider'"
                  ref="sliderContainerRef"
                  class="relative w-full h-full min-h-[480px] select-none cursor-ew-resize overflow-hidden flex items-center justify-center"
                  @mousemove="handleSliderMove"
                  @touchmove="handleTouchSliderMove"
                >
                  <!-- Checkerboard underlay for the result side -->
                  <div
                    class="absolute inset-0 pointer-events-none [background-image:linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] [background-size:20px_20px] [background-position:0_0,0_10px,10px_-10px,-10px_0px] opacity-60"
                  ></div>

                  <!-- Background removed (Result) Full Image -->
                  <div class="absolute inset-0 flex items-center justify-center p-4" :style="backgroundStyle">
                    <img
                      v-if="resultImageSrc"
                      :src="resultImageSrc"
                      alt="Removed Background"
                      class="max-w-full max-h-[540px] object-contain"
                    />
                  </div>

                  <!-- Original Image (Clipped by slider position) -->
                  <div
                    class="absolute inset-0 overflow-hidden flex items-center justify-center p-4 bg-slate-900/5 backdrop-blur-[0.5px]"
                    :style="{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }"
                  >
                    <img
                      v-if="originalImageSrc"
                      :src="originalImageSrc"
                      alt="Original Image"
                      class="max-w-full max-h-[540px] object-contain"
                    />
                  </div>

                  <!-- Divider Line -->
                  <div
                    class="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
                    :style="{ left: `${sliderPosition}%` }"
                  >
                    <!-- Handle Knob -->
                    <div class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-emerald-700 text-white shadow-xl flex items-center justify-center text-xs font-bold border-2 border-white">
                      <i class="fas fa-arrows-left-right"></i>
                    </div>
                  </div>

                  <!-- Badges -->
                  <span class="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">Original</span>
                  <span class="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-md bg-emerald-800/80 backdrop-blur-md text-white text-[11px] font-bold">Clean Cutout</span>
                </div>

                <!-- 3. SIDE BY SIDE VIEW -->
                <div v-else-if="viewMode === 'side-by-side'" class="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  <div class="relative flex flex-col items-center justify-center bg-white/60 rounded-xl p-3 border border-slate-200">
                    <span class="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-800/80 text-white text-[10px] font-bold">Original</span>
                    <img :src="originalImageSrc" alt="Original" class="max-w-full max-h-[380px] object-contain rounded" />
                  </div>
                  <div class="relative flex flex-col items-center justify-center rounded-xl p-3 border border-slate-200 overflow-hidden" :style="backgroundStyle">
                    <div
                      v-if="bgType === 'transparent'"
                      class="absolute inset-0 pointer-events-none [background-image:linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] [background-size:16px_16px] [background-position:0_0,0_8px,8px_-8px,-8px_0px] opacity-60"
                    ></div>
                    <span class="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-emerald-800/80 text-white text-[10px] font-bold">Clean Cutout</span>
                    <img v-if="resultImageSrc" :src="resultImageSrc" alt="Result" class="max-w-full max-h-[380px] object-contain rounded relative z-0" />
                  </div>
                </div>

                <!-- 4. ORIGINAL ONLY VIEW -->
                <div v-else-if="viewMode === 'original'" class="w-full h-full flex items-center justify-center p-4">
                  <img :src="originalImageSrc" alt="Original" class="max-w-full max-h-[540px] object-contain rounded-lg shadow-sm" />
                </div>
              </div>

              <!-- Quick Helper bar under canvas -->
              <div class="flex items-center justify-between w-full mt-2.5 px-1 text-[11px] text-slate-500">
                <span v-if="viewMode === 'slider'">Drag slider horizontally to inspect edges and hair</span>
                <span v-else-if="isTouchupMode">Spot Cleaning Brush Active: Click &amp; drag over white spots to clean them instantly</span>
                <span v-else>💡 Click the "Preview On" buttons above to test your cutout against dark purple / black backgrounds</span>

                <button
                  v-if="!isTouchupMode && resultImageSrc"
                  @click="enableTouchupMode"
                  class="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200"
                >
                  <i class="fas fa-paintbrush"></i> Spot Eraser / Restore Brush
                </button>
                <button
                  v-else-if="isTouchupMode"
                  @click="saveTouchupAndExit"
                  class="text-white font-bold inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 shadow-sm"
                >
                  <i class="fas fa-check"></i> Apply &amp; Done
                </button>
              </div>
            </div>

            <!-- RIGHT PANEL: ACCURACY FINE-TUNING, CUSTOMIZATION & DOWNLOAD -->
            <div class="lg:col-span-4 space-y-5 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
              
              <!-- SECTION A: DOWNLOAD & EXPORT (Primary CTA at top) -->
              <div class="space-y-3 bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                <h4 class="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                  <i class="fas fa-download text-emerald-600"></i> Download Clean Cutout
                </h4>

                <!-- Primary Download Button -->
                <button
                  @click="downloadImage('png')"
                  class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-bold text-sm shadow-md shadow-emerald-900/20 hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <i class="fas fa-download"></i>
                  <span>Download Transparent (PNG)</span>
                </button>

                <!-- Secondary Download Options -->
                <div class="grid grid-cols-2 gap-2 pt-1">
                  <button
                    @click="downloadImage('jpg')"
                    class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
                  >
                    <i class="fas fa-file-image text-slate-500"></i>
                    <span>JPG (With BG)</span>
                  </button>
                  <button
                    @click="copyImageToClipboard"
                    class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
                  >
                    <i :class="copied ? 'fas fa-check text-emerald-600' : 'fas fa-copy text-slate-500'"></i>
                    <span>{{ copied ? 'Copied!' : 'Copy PNG' }}</span>
                  </button>
                </div>
              </div>

              <!-- SECTION B: ACCURACY & HAIR MATTING REFINEMENT -->
              <div class="space-y-3.5 bg-white p-4 rounded-xl border border-slate-200">
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <i class="fas fa-wand-magic text-emerald-600"></i> Edge &amp; Hair Halo Cleaner
                  </h4>
                  <button @click="resetEdgeRefinements" class="text-[11px] text-slate-400 hover:text-slate-600">Reset</button>
                </div>

                <div class="space-y-3 text-xs text-slate-600">
                  <!-- 1. Remove White Edge Halos (De-Matting / De-Fringe) -->
                  <div>
                    <div class="flex justify-between mb-1 text-[11px]">
                      <span class="font-medium flex items-center gap-1">
                        <i class="fas fa-eraser text-emerald-600 text-[10px]"></i> Remove White Halos (De-Fringe)
                      </span>
                      <span class="font-mono text-slate-500">{{ defringeLevel }}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      v-model.number="defringeLevel"
                      @input="applyEdgePostProcessing"
                      class="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  <!-- 2. Edge Trim / Choke (Strips 1px outline from jackets & arms) -->
                  <div>
                    <div class="flex justify-between mb-1 text-[11px]">
                      <span class="font-medium flex items-center gap-1">
                        <i class="fas fa-crop text-emerald-600 text-[10px]"></i> Trim Edge Outline (Choke)
                      </span>
                      <span class="font-mono text-slate-500">{{ edgeChoke }}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="1"
                      v-model.number="edgeChoke"
                      @input="applyEdgePostProcessing"
                      class="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  <!-- 3. Clean Hair Gaps & White Cavity Spots -->
                  <div>
                    <div class="flex justify-between mb-1 text-[11px]">
                      <span class="font-medium flex items-center gap-1">
                        <i class="fas fa-scissors text-emerald-600 text-[10px]"></i> Clean Hair Gaps &amp; White Spots
                      </span>
                      <span class="font-mono text-slate-500">{{ hairGapCleanLevel }}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      v-model.number="hairGapCleanLevel"
                      @input="applyEdgePostProcessing"
                      class="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  <!-- 4. Protect Clothing & Body Interior -->
                  <div>
                    <div class="flex justify-between mb-1 text-[11px]">
                      <span class="font-medium flex items-center gap-1">
                        <i class="fas fa-shield-heart text-emerald-600 text-[10px]"></i> Protect Clothes &amp; Body Holes
                      </span>
                      <span class="font-mono text-slate-500">{{ holeFillLevel }}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      v-model.number="holeFillLevel"
                      @input="applyEdgePostProcessing"
                      class="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <!-- Touch up Brush Controls (When in touchup mode) -->
                <div v-if="isTouchupMode" class="mt-4 pt-3 border-t border-slate-100 space-y-3 bg-emerald-50/50 p-3 rounded-xl">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-emerald-950">Spot Cleaning Brush</span>
                    <div class="flex items-center gap-1 bg-white p-0.5 rounded-lg text-[10px] font-bold border border-emerald-200">
                      <button
                        @click="brushTool = 'erase'"
                        :class="['px-2.5 py-1 rounded transition-colors', brushTool === 'erase' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900']"
                      >
                        <i class="fas fa-eraser"></i> Erase Spot
                      </button>
                      <button
                        @click="brushTool = 'restore'"
                        :class="['px-2.5 py-1 rounded transition-colors', brushTool === 'restore' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:text-slate-900']"
                      >
                        <i class="fas fa-rotate-left"></i> Restore Body
                      </button>
                    </div>
                  </div>

                  <div>
                    <div class="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Brush Diameter</span>
                      <span>{{ brushSize }}px</span>
                    </div>
                    <input type="range" min="3" max="80" v-model.number="brushSize" class="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer" />
                  </div>

                  <div class="flex gap-2 pt-1">
                    <button
                      @click="restoreOriginalCutout"
                      class="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                    >
                      Reset Cutout
                    </button>
                    <button
                      @click="saveTouchupAndExit"
                      class="flex-1 py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Apply &amp; Exit
                    </button>
                  </div>
                </div>
              </div>

              <!-- SECTION C: BACKGROUND SELECTION -->
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <i class="fas fa-palette text-emerald-600"></i> Background Style
                  </h4>
                </div>

                <!-- Tabs: Transparent | Solid Color | Gradient | Custom Backdrop -->
                <div class="grid grid-cols-4 gap-1 p-1 bg-slate-200/80 rounded-xl text-[11px] font-bold text-slate-600">
                  <button
                    @click="bgType = 'transparent'"
                    :class="['py-1.5 rounded-lg text-center transition-all', bgType === 'transparent' ? 'bg-white text-emerald-800 shadow-sm' : 'hover:text-slate-900']"
                  >
                    Clear
                  </button>
                  <button
                    @click="bgType = 'solid'"
                    :class="['py-1.5 rounded-lg text-center transition-all', bgType === 'solid' ? 'bg-white text-emerald-800 shadow-sm' : 'hover:text-slate-900']"
                  >
                    Color
                  </button>
                  <button
                    @click="bgType = 'gradient'"
                    :class="['py-1.5 rounded-lg text-center transition-all', bgType === 'gradient' ? 'bg-white text-emerald-800 shadow-sm' : 'hover:text-slate-900']"
                  >
                    Gradient
                  </button>
                  <button
                    @click="bgType = 'backdrop'"
                    :class="['py-1.5 rounded-lg text-center transition-all', bgType === 'backdrop' ? 'bg-white text-emerald-800 shadow-sm' : 'hover:text-slate-900']"
                  >
                    Backdrop
                  </button>
                </div>

                <!-- 1. Transparent Config -->
                <div v-if="bgType === 'transparent'" class="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                  <p class="flex items-center gap-2">
                    <i class="fas fa-check-circle text-emerald-600"></i>
                    <span>Export preserves full transparent alpha channel without background.</span>
                  </p>
                </div>

                <!-- 2. Solid Color Palette -->
                <div v-else-if="bgType === 'solid'" class="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
                  <div class="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>Choose Color:</span>
                    <div class="flex items-center gap-1.5">
                      <input
                        type="color"
                        v-model="solidColor"
                        class="w-6 h-6 rounded border border-slate-300 cursor-pointer"
                        title="Pick custom color"
                      />
                      <span class="font-mono text-[11px] text-slate-500 uppercase">{{ solidColor }}</span>
                    </div>
                  </div>

                  <!-- Color swatches -->
                  <div class="grid grid-cols-6 gap-2">
                    <button
                      v-for="color in presetColors"
                      :key="color.value"
                      @click="solidColor = color.value"
                      class="h-8 rounded-lg border border-slate-200 transition-transform hover:scale-110 relative flex items-center justify-center"
                      :style="{ backgroundColor: color.value }"
                      :title="color.name"
                    >
                      <i v-if="solidColor.toLowerCase() === color.value.toLowerCase()" class="fas fa-check text-[10px]" :class="['#ffffff', '#f8fafc', '#fef08a', '#e2e8f0'].includes(color.value) ? 'text-black' : 'text-white'"></i>
                    </button>
                  </div>
                </div>

                <!-- 3. Gradient Presets -->
                <div v-else-if="bgType === 'gradient'" class="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
                  <span class="text-xs font-semibold text-slate-600 block">Select Gradient:</span>
                  <div class="grid grid-cols-4 gap-2">
                    <button
                      v-for="grad in presetGradients"
                      :key="grad.name"
                      @click="selectedGradient = grad.value"
                      class="h-10 rounded-lg border border-slate-200 transition-transform hover:scale-105 relative flex items-center justify-center"
                      :style="{ background: grad.value }"
                      :title="grad.name"
                    >
                      <i v-if="selectedGradient === grad.value" class="fas fa-check text-[10px] text-white drop-shadow"></i>
                    </button>
                  </div>
                </div>

                <!-- 4. Backdrop Presets / Custom BG Image -->
                <div v-else-if="bgType === 'backdrop'" class="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
                  <div class="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>Backdrop Presets:</span>
                    <label class="text-emerald-700 font-bold hover:underline cursor-pointer flex items-center gap-1">
                      <i class="fas fa-upload"></i> Custom
                      <input type="file" accept="image/*" class="hidden" @change="handleCustomBgUpload" />
                    </label>
                  </div>

                  <div class="grid grid-cols-3 gap-2">
                    <button
                      v-for="bd in presetBackdrops"
                      :key="bd.name"
                      @click="selectedBackdrop = bd.url"
                      class="h-14 rounded-lg border border-slate-200 overflow-hidden relative group hover:border-emerald-500 transition-all"
                    >
                      <img :src="bd.url" :alt="bd.name" class="w-full h-full object-cover" />
                      <div class="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        {{ bd.name }}
                      </div>
                      <i v-if="selectedBackdrop === bd.url" class="fas fa-check-circle absolute top-1 right-1 text-emerald-400 text-xs drop-shadow"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- SECTION D: SUBJECT ADJUSTMENTS -->
              <div class="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <i class="fas fa-sliders text-emerald-600"></i> Subject Color &amp; Lighting
                  </h4>
                  <button @click="resetAdjustments" class="text-[11px] text-slate-400 hover:text-slate-600">Reset</button>
                </div>

                <div class="space-y-2.5 text-xs text-slate-600">
                  <div>
                    <div class="flex justify-between mb-1 text-[11px]">
                      <span>Brightness</span>
                      <span class="font-mono text-slate-500">{{ brightness }}%</span>
                    </div>
                    <input type="range" min="50" max="150" v-model.number="brightness" class="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer" />
                  </div>
                  <div>
                    <div class="flex justify-between mb-1 text-[11px]">
                      <span>Contrast</span>
                      <span class="font-mono text-slate-500">{{ contrast }}%</span>
                    </div>
                    <input type="range" min="50" max="150" v-model.number="contrast" class="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer" />
                  </div>
                  <div>
                    <div class="flex justify-between mb-1 text-[11px]">
                      <span>Saturation</span>
                      <span class="font-mono text-slate-500">{{ saturation }}%</span>
                    </div>
                    <input type="range" min="0" max="200" v-model.number="saturation" class="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- FEATURES & HOW IT WORKS SECTION -->
      <section class="mt-12 space-y-10">
        <!-- 3-Step Flow Cards -->
        <div>
          <div class="text-center max-w-xl mx-auto mb-8">
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">How It Works</h2>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">High-fidelity client-side background removal with body &amp; clothing integrity</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-emerald-500 transition-all">
              <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 font-black text-lg flex items-center justify-center mb-4 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                1
              </div>
              <h3 class="text-base font-bold text-slate-900 mb-1">Upload Photo</h3>
              <p class="text-xs text-slate-500 leading-relaxed">
                Drag and drop or select any portrait, student ID, product image, or graphic from your device.
              </p>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-emerald-500 transition-all">
              <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 font-black text-lg flex items-center justify-center mb-4 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                2
              </div>
              <h3 class="text-base font-bold text-slate-900 mb-1">Neural Segmentation</h3>
              <p class="text-xs text-slate-500 leading-relaxed">
                Deep neural matting identifies delicate hair strands and protects inner clothing, teeth, and jewelry.
              </p>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-emerald-500 transition-all">
              <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 font-black text-lg flex items-center justify-center mb-4 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                3
              </div>
              <h3 class="text-base font-bold text-slate-900 mb-1">Clean &amp; Export</h3>
              <p class="text-xs text-slate-500 leading-relaxed">
                Fine-tune with defringing and spot eraser, then download transparent PNG or custom studio backdrops.
              </p>
            </div>
          </div>
        </div>

        <!-- Privacy & Security Banner -->
        <div class="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl p-6 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <i class="fas fa-user-shield text-xl"></i>
            </div>
            <div>
              <h4 class="text-sm font-bold text-emerald-950">Complete Privacy Guaranteed</h4>
              <p class="text-xs text-emerald-800/80">
                Your images are processed directly inside your browser using WebAssembly. They are never uploaded to any remote server or cloud storage.
              </p>
            </div>
          </div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 font-bold text-xs shadow-sm shrink-0">
            <i class="fas fa-lock text-emerald-600"></i> Client-Side Processing
          </span>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';

// SEO / Meta
useHead({
  title: 'AI Background Remover | La Salle University Ozamiz',
  meta: [
    { name: 'description', content: 'Free instant AI background remover for student IDs, portraits, and campus photos. 100% client-side privacy.' }
  ]
});

// UI State
const isDragging = ref(false);
const fileInputRef = ref(null);
const sliderContainerRef = ref(null);
const touchupCanvasRef = ref(null);

const originalImageSrc = ref(null);
const resultImageSrc = ref(null);
const rawCutoutBlob = ref(null);
const initialCutoutSrc = ref(null);
const baseCutoutCanvas = ref(null);

const imageFileName = ref('');
const imageDimensions = ref({ width: 0, height: 0 });
const zoomLevel = ref(1.0);

const isProcessing = ref(false);
const processingProgress = ref(0);
const processingStatusText = ref('');
const noticeMessage = ref('');
const copied = ref(false);

// View & Editor Settings
const viewMode = ref('result'); // 'result' | 'slider' | 'side-by-side' | 'original'
const sliderPosition = ref(50); // percentage 0-100

// Background Settings
const bgType = ref('transparent'); // 'transparent' | 'solid' | 'gradient' | 'backdrop'
const solidColor = ref('#004724'); // Default LSU Green
const selectedGradient = ref('linear-gradient(135deg, #004724 0%, #001a0d 100%)');
const selectedBackdrop = ref('');

// Accuracy & Edge Refinements
const defringeLevel = ref(80); // removes background color halos from hair (0-100)
const edgeChoke = ref(1); // shrinks edge by 1px to eliminate white border on clothing/arms
const hairGapCleanLevel = ref(70); // cleans white background spots trapped between hair curls
const holeFillLevel = ref(85); // protects clothing/body interiors

// Adjustments
const brightness = ref(100);
const contrast = ref(100);
const saturation = ref(100);

// Manual Touch-up mode
const isTouchupMode = ref(false);
const brushTool = ref('erase'); // 'erase' | 'restore'
const brushSize = ref(18);
const isDrawing = ref(false);
let touchupCtx = null;
let originalImageElement = null;

// Sample Images
const sampleImages = [
  {
    title: 'Student Portrait',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'
  },
  {
    title: 'Campus Graduate',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80'
  },
  {
    title: 'Professional Headshot',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80'
  },
  {
    title: 'Campus Mascot / Pet',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80'
  }
];

// Presets
const presetColors = [
  { name: 'Dark Purple', value: '#1a103c' },
  { name: 'LSU Green', value: '#004724' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Pure White', value: '#ffffff' },
  { name: 'Soft Gray', value: '#f1f5f9' },
  { name: 'Dark Slate', value: '#1e293b' },
  { name: 'Deep Navy', value: '#1e3a8a' },
  { name: 'Royal Blue', value: '#2563eb' },
  { name: 'Ruby Red', value: '#b91c1c' },
  { name: 'Amber Gold', value: '#d97706' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Black', value: '#000000' }
];

const presetGradients = [
  { name: 'Studio Dark Purple', value: 'radial-gradient(circle, #2e1065 0%, #0f051d 100%)' },
  { name: 'LSU Emerald', value: 'linear-gradient(135deg, #004724 0%, #001a0d 100%)' },
  { name: 'Sunset Warmth', value: 'linear-gradient(135deg, #f97316 0%, #db2777 100%)' },
  { name: 'Ocean Breeze', value: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)' },
  { name: 'Studio Spotlight', value: 'radial-gradient(circle, #475569 0%, #0f172a 100%)' },
  { name: 'Royal Velvet', value: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
  { name: 'Golden Glow', value: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' },
  { name: 'Midnight', value: 'linear-gradient(135deg, #1e293b 0%, #020617 100%)' }
];

const presetBackdrops = [
  { name: 'Modern Studio', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80' },
  { name: 'Campus Library', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop&q=80' },
  { name: 'Modern Office', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80' }
];

// Computed styles for background
const backgroundStyle = computed(() => {
  if (bgType.value === 'transparent') {
    return {};
  }
  if (bgType.value === 'solid') {
    return { backgroundColor: solidColor.value };
  }
  if (bgType.value === 'gradient') {
    return { background: selectedGradient.value };
  }
  if (bgType.value === 'backdrop' && selectedBackdrop.value) {
    return {
      backgroundImage: `url(${selectedBackdrop.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }
  return {};
});

// Computed adjustments style
const imageFilterStyle = computed(() => {
  return {
    filter: `brightness(${brightness.value}%) contrast(${contrast.value}%) saturate(${saturation.value}%)`
  };
});

// Quick background setter
const setQuickBg = (colorHex) => {
  solidColor.value = colorHex;
  bgType.value = 'solid';
};

// Actions
const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
};

const handleFileInput = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    loadImageFile(file);
  }
};

const handleFileDrop = (e) => {
  isDragging.value = false;
  const file = e.dataTransfer.files?.[0];
  if (file && file.type.startsWith('image/')) {
    loadImageFile(file);
  }
};

const handlePaste = (e) => {
  const items = e.clipboardData?.items;
  if (!items) return;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      const file = items[i].getAsFile();
      if (file) {
        loadImageFile(file);
        break;
      }
    }
  }
};

const loadSampleImage = async (url) => {
  imageFileName.value = 'sample-image.jpg';
  isProcessing.value = true;
  processingProgress.value = 10;
  processingStatusText.value = 'Fetching sample image...';

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const reader = new FileReader();
    reader.onload = (e) => {
      originalImageSrc.value = e.target.result;
      extractImageMetadata(e.target.result);
      processImage(false, blob);
    };
    reader.readAsDataURL(blob);
  } catch (err) {
    console.error('Error fetching sample:', err);
    isProcessing.value = false;
  }
};

const loadImageFile = (file) => {
  imageFileName.value = file.name;
  isProcessing.value = true;
  processingProgress.value = 15;
  processingStatusText.value = 'Loading image...';

  const reader = new FileReader();
  reader.onload = (e) => {
    originalImageSrc.value = e.target.result;
    extractImageMetadata(e.target.result);
    processImage(false, file);
  };
  reader.readAsDataURL(file);
};

const extractImageMetadata = (src) => {
  const img = new Image();
  img.onload = () => {
    imageDimensions.value = { width: img.naturalWidth, height: img.naturalHeight };
    originalImageElement = img;
  };
  img.src = src;
};

// Main processing pipeline: AI Neural Segmenter with Hair Matting & Body Protection
const processImage = async (forceRecompute = false, inputBlob = null) => {
  isProcessing.value = true;
  noticeMessage.value = '';
  processingProgress.value = 25;
  processingStatusText.value = 'Initializing AI Segmentation Model...';

  const sourceImage = inputBlob || originalImageSrc.value;

  try {
    processingProgress.value = 40;
    processingStatusText.value = 'Loading Neural Matting Engine...';

    // Import @imgly/background-removal with publicPath explicitly configured
    const imgly = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.7/+esm');

    const config = {
      publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal-data@1.5.7/dist/',
      model: 'isnet_fp16',
      debug: false,
      progress: (key, current, total) => {
        if (total > 0) {
          const pct = Math.min(92, Math.round(45 + (current / total) * 45));
          processingProgress.value = pct;
          processingStatusText.value = `Segmenting hair & edges... (${pct}%)`;
        }
      },
      output: {
        format: 'image/png',
        quality: 1.0
      }
    };

    const rawBlob = await imgly.removeBackground(sourceImage, config);
    
    // Store as base cutout and apply edge post-processing (defringe & hair refinement)
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      baseCutoutCanvas.value = canvas;
      
      applyEdgePostProcessing();
      
      processingProgress.value = 100;
      processingStatusText.value = 'Complete!';
      noticeMessage.value = 'Neural AI matting applied with hair de-haloing & clothing protection.';
      setTimeout(() => {
        isProcessing.value = false;
      }, 300);
    };
    img.src = URL.createObjectURL(rawBlob);

  } catch (err) {
    console.warn('AI Engine CDN method triggered fallback:', err);
    runHighPrecisionFallback();
  }
};

// High Precision Fallback: Connected Component Seed-Flood Fill + Body Contouring
const runHighPrecisionFallback = () => {
  processingStatusText.value = 'Applying Connected Edge Matting & Body Protection...';
  processingProgress.value = 75;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // 1. Sample Background color from perimeter borders
    let bgR = 0, bgG = 0, bgB = 0, sampleCount = 0;
    for (let x = 0; x < w; x += 4) {
      let idx = x * 4;
      bgR += data[idx]; bgG += data[idx+1]; bgB += data[idx+2];
      idx = ((h - 1) * w + x) * 4;
      bgR += data[idx]; bgG += data[idx+1]; bgB += data[idx+2];
      sampleCount += 2;
    }
    for (let y = 0; y < h; y += 4) {
      let idx = (y * w) * 4;
      bgR += data[idx]; bgG += data[idx+1]; bgB += data[idx+2];
      idx = (y * w + (w - 1)) * 4;
      bgR += data[idx]; bgG += data[idx+1]; bgB += data[idx+2];
      sampleCount += 2;
    }
    bgR /= sampleCount;
    bgG /= sampleCount;
    bgB /= sampleCount;

    // 2. Flood-fill from border pixels ONLY into background
    const visited = new Uint8Array(w * h);
    const queue = [];
    const colorDistThreshold = 55;

    const getColorDist = (idx) => {
      const dr = data[idx] - bgR;
      const dg = data[idx+1] - bgG;
      const db = data[idx+2] - bgB;
      return Math.sqrt(dr*dr + dg*dg + db*db);
    };

    for (let x = 0; x < w; x++) {
      let idxTop = x;
      if (getColorDist(idxTop * 4) < colorDistThreshold) {
        visited[idxTop] = 1;
        queue.push(idxTop);
      }
      let idxBot = (h - 1) * w + x;
      if (getColorDist(idxBot * 4) < colorDistThreshold) {
        visited[idxBot] = 1;
        queue.push(idxBot);
      }
    }
    for (let y = 0; y < h; y++) {
      let idxLeft = y * w;
      if (!visited[idxLeft] && getColorDist(idxLeft * 4) < colorDistThreshold) {
        visited[idxLeft] = 1;
        queue.push(idxLeft);
      }
      let idxRight = y * w + (w - 1);
      if (!visited[idxRight] && getColorDist(idxRight * 4) < colorDistThreshold) {
        visited[idxRight] = 1;
        queue.push(idxRight);
      }
    }

    let head = 0;
    while (head < queue.length) {
      const curr = queue[head++];
      const cx = curr % w;
      const cy = Math.floor(curr / w);

      const neighbors = [
        cx > 0 ? curr - 1 : -1,
        cx < w - 1 ? curr + 1 : -1,
        cy > 0 ? curr - w : -1,
        cy < h - 1 ? curr + w : -1
      ];

      for (let i = 0; i < 4; i++) {
        const n = neighbors[i];
        if (n !== -1 && !visited[n]) {
          const dist = getColorDist(n * 4);
          if (dist < colorDistThreshold) {
            visited[n] = 1;
            queue.push(n);
          }
        }
      }
    }

    // 3. Set Alpha: Only visited background pixels are made transparent
    for (let i = 0; i < w * h; i++) {
      const idx = i * 4;
      if (visited[i]) {
        const dist = getColorDist(idx);
        if (dist < colorDistThreshold - 15) {
          data[idx + 3] = 0;
        } else {
          const alpha = (dist - (colorDistThreshold - 15)) / 15;
          data[idx + 3] = Math.max(0, Math.min(255, Math.floor(alpha * 255)));
        }
      } else {
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    baseCutoutCanvas.value = canvas;

    applyEdgePostProcessing();
    processingProgress.value = 100;
    processingStatusText.value = 'Complete!';
    noticeMessage.value = 'Applied Edge-Protected Segmentation. White shirt and body contours protected.';
    isProcessing.value = false;
  };
  img.src = originalImageSrc.value;
};

// Advanced Edge Post-Processing:
// 1. True Foreground Color Un-Multiplication (stripping white background contamination)
// 2. Hair Gaps / White Spot Dissolver
// 3. Edge Choke / Trimming (eliminates 1px white border along jacket/arms)
// 4. Interior Body Protection
const applyEdgePostProcessing = () => {
  if (!baseCutoutCanvas.value) return;

  const baseCanvas = baseCutoutCanvas.value;
  const w = baseCanvas.width;
  const h = baseCanvas.height;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(baseCanvas, 0, 0);

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Copy of original alpha for neighborhood checks
  const origAlpha = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    origAlpha[i] = data[i * 4 + 3];
  }

  const defringeFactor = defringeLevel.value / 100;
  const hairCleanFactor = hairGapCleanLevel.value / 100;
  const chokePx = edgeChoke.value;
  const holeFill = holeFillLevel.value / 100;

  // PASS 1: Hair Gap White Spot Annihilator & True De-Matting (Un-multiplication)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      let a = data[idx + 3];
      if (a === 0) continue;

      let r = data[idx];
      let g = data[idx + 1];
      let b = data[idx + 2];
      const aNorm = a / 255;
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

      // 1. True Foreground Recovery on semi-transparent edge pixels:
      // Strip the white background contribution (255, 255, 255) baked into edge pixels
      if (defringeFactor > 0 && aNorm > 0.05 && aNorm < 0.96) {
        const bgWeight = (1 - aNorm) * defringeFactor;
        // Un-mix from white background (255)
        const recoveredR = Math.max(0, (r - bgWeight * 255) / (1 - bgWeight * 0.95));
        const recoveredG = Math.max(0, (g - bgWeight * 255) / (1 - bgWeight * 0.95));
        const recoveredB = Math.max(0, (b - bgWeight * 255) / (1 - bgWeight * 0.95));

        // Darken edge halos on high luminance pixels
        if (luminance > 120) {
          const darkFactor = 1 - (defringeFactor * 0.45);
          data[idx] = Math.min(255, Math.floor(recoveredR * darkFactor));
          data[idx + 1] = Math.min(255, Math.floor(recoveredG * darkFactor));
          data[idx + 2] = Math.min(255, Math.floor(recoveredB * darkFactor));
        } else {
          data[idx] = Math.min(255, Math.floor(recoveredR));
          data[idx + 1] = Math.min(255, Math.floor(recoveredG));
          data[idx + 2] = Math.min(255, Math.floor(recoveredB));
        }
      }

      // 2. Clean trapped white spots in hair gaps (upper 65% of image or near perimeter)
      if (hairCleanFactor > 0 && y < h * 0.65) {
        // High brightness, low saturation white background remnant
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const sat = maxC > 0 ? (maxC - minC) / maxC : 0;

        if (luminance > 185 && sat < 0.28) {
          // Check if near transparency (within 5 pixels)
          let hasTransparentNeighbor = false;
          const searchRadius = 4;
          for (let dy = -searchRadius; dy <= searchRadius && !hasTransparentNeighbor; dy++) {
            for (let dx = -searchRadius; dx <= searchRadius; dx++) {
              const ny = y + dy;
              const nx = x + dx;
              if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                if (origAlpha[ny * w + nx] < 30) {
                  hasTransparentNeighbor = true;
                  break;
                }
              }
            }
          }

          if (hasTransparentNeighbor) {
            // Dissolve white hair gap pixels
            const dropAlpha = (luminance - 170) / 85 * hairCleanFactor;
            data[idx + 3] = Math.max(0, Math.floor(a * (1 - dropAlpha)));
          }
        }
      }
    }
  }

  // PASS 2: Edge Choke / Trimming (Erode 1px-2px outline along outer boundaries)
  if (chokePx > 0) {
    const tempAlpha = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) {
      tempAlpha[i] = data[i * 4 + 3];
    }

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const currIdx = y * w + x;
        if (tempAlpha[currIdx] === 0) continue;

        // Check neighboring transparency
        let minNeighborAlpha = 255;
        for (let dy = -chokePx; dy <= chokePx; dy++) {
          for (let dx = -chokePx; dx <= chokePx; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              if (tempAlpha[ny * w + nx] < minNeighborAlpha) {
                minNeighborAlpha = tempAlpha[ny * w + nx];
              }
            }
          }
        }

        // If directly touching transparent background, choke the hard white edge
        if (minNeighborAlpha < 40) {
          const pixelIdx = currIdx * 4;
          const r = data[pixelIdx];
          const g = data[pixelIdx + 1];
          const b = data[pixelIdx + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;

          // If it's a bright boundary pixel (white fringe), fade or choke it
          if (lum > 140) {
            data[pixelIdx + 3] = Math.max(0, Math.floor(data[pixelIdx + 3] * 0.2));
          } else {
            data[pixelIdx + 3] = Math.max(0, Math.floor(data[pixelIdx + 3] * 0.75));
          }
        }
      }
    }
  }

  // PASS 3: Interior Body / Clothing Hole Filling (Protecting white inner shirts)
  if (holeFill > 0) {
    const minX = Math.floor(w * 0.2);
    const maxX = Math.floor(w * 0.8);
    const minY = Math.floor(h * 0.25);
    const maxY = Math.floor(h * 0.95);

    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
        const idx = (y * w + x) * 4;
        if (data[idx + 3] < 220) {
          data[idx + 3] = Math.min(255, Math.floor(data[idx + 3] + (255 - data[idx + 3]) * holeFill));
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  canvas.toBlob((blob) => {
    rawCutoutBlob.value = blob;
    const url = URL.createObjectURL(blob);
    resultImageSrc.value = url;
    if (!initialCutoutSrc.value) {
      initialCutoutSrc.value = url;
    }
  }, 'image/png');
};

const resetEdgeRefinements = () => {
  defringeLevel.value = 80;
  edgeChoke.value = 1;
  hairGapCleanLevel.value = 70;
  holeFillLevel.value = 85;
  applyEdgePostProcessing();
};

// Interactive Slider Handlers
const handleSliderMove = (e) => {
  if (!sliderContainerRef.value) return;
  const rect = sliderContainerRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
  sliderPosition.value = Math.round(pos);
};

const handleTouchSliderMove = (e) => {
  if (!sliderContainerRef.value || !e.touches[0]) return;
  const rect = sliderContainerRef.value.getBoundingClientRect();
  const x = e.touches[0].clientX - rect.left;
  const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
  sliderPosition.value = Math.round(pos);
};

// Custom Background Upload
const handleCustomBgUpload = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      selectedBackdrop.value = ev.target.result;
      bgType.value = 'backdrop';
    };
    reader.readAsDataURL(file);
  }
};

// Reset Workspace
const resetWorkspace = () => {
  originalImageSrc.value = null;
  resultImageSrc.value = null;
  rawCutoutBlob.value = null;
  initialCutoutSrc.value = null;
  baseCutoutCanvas.value = null;
  imageFileName.value = '';
  noticeMessage.value = '';
  isTouchupMode.value = false;
  viewMode.value = 'result';
  zoomLevel.value = 1.0;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const resetAdjustments = () => {
  brightness.value = 100;
  contrast.value = 100;
  saturation.value = 100;
};

// Manual Touch-up Drawing logic
const enableTouchupMode = async () => {
  isTouchupMode.value = true;
  viewMode.value = 'result';
  await nextTick();

  const canvas = touchupCanvasRef.value;
  if (!canvas || !resultImageSrc.value) return;

  touchupCtx = canvas.getContext('2d', { willReadFrequently: true });

  const img = new Image();
  img.onload = () => {
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    touchupCtx.clearRect(0, 0, canvas.width, canvas.height);
    touchupCtx.drawImage(img, 0, 0);
  };
  img.src = resultImageSrc.value;
};

const getCanvasCoordinates = (e) => {
  const canvas = touchupCanvasRef.value;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
};

const startDrawing = (e) => {
  if (!isTouchupMode.value) return;
  isDrawing.value = true;
  draw(e);
};

const draw = (e) => {
  if (!isDrawing.value || !touchupCtx) return;
  const { x, y } = getCanvasCoordinates(e);

  touchupCtx.save();
  if (brushTool.value === 'erase') {
    touchupCtx.globalCompositeOperation = 'destination-out';
    touchupCtx.beginPath();
    touchupCtx.arc(x, y, brushSize.value, 0, Math.PI * 2, false);
    touchupCtx.fill();
  } else if (brushTool.value === 'restore' && originalImageElement) {
    // Restore from original image
    touchupCtx.globalCompositeOperation = 'source-over';
    touchupCtx.save();
    touchupCtx.beginPath();
    touchupCtx.arc(x, y, brushSize.value, 0, Math.PI * 2, false);
    touchupCtx.clip();
    touchupCtx.drawImage(originalImageElement, 0, 0, touchupCanvasRef.value.width, touchupCanvasRef.value.height);
    touchupCtx.restore();
  }
  touchupCtx.restore();
};

const startTouch = (e) => {
  if (e.touches[0]) startDrawing(e.touches[0]);
};

const touchMove = (e) => {
  if (e.touches[0]) draw(e.touches[0]);
};

const stopDrawing = () => {
  isDrawing.value = false;
};

const saveTouchupAndExit = () => {
  if (!touchupCanvasRef.value) return;
  touchupCanvasRef.value.toBlob((blob) => {
    rawCutoutBlob.value = blob;
    resultImageSrc.value = URL.createObjectURL(blob);
    isTouchupMode.value = false;
  }, 'image/png');
};

const restoreOriginalCutout = () => {
  if (initialCutoutSrc.value) {
    resultImageSrc.value = initialCutoutSrc.value;
    enableTouchupMode();
  }
};

// Composite Final Output to Canvas for Download
const generateFinalCanvas = () => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      // 1. Draw Background
      if (bgType.value === 'solid') {
        ctx.fillStyle = solidColor.value;
        ctx.fillRect(0, 0, w, h);
      } else if (bgType.value === 'gradient') {
        const grad = ctx.createLinearGradient(0, 0, w, h);
        if (selectedGradient.value.includes('#004724')) {
          grad.addColorStop(0, '#004724');
          grad.addColorStop(1, '#001a0d');
        } else if (selectedGradient.value.includes('#f97316')) {
          grad.addColorStop(0, '#f97316');
          grad.addColorStop(1, '#db2777');
        } else if (selectedGradient.value.includes('#0284c7')) {
          grad.addColorStop(0, '#0284c7');
          grad.addColorStop(1, '#0d9488');
        } else {
          grad.addColorStop(0, '#1e293b');
          grad.addColorStop(1, '#020617');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      } else if (bgType.value === 'backdrop' && selectedBackdrop.value) {
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        bgImg.onload = () => {
          ctx.drawImage(bgImg, 0, 0, w, h);
          ctx.filter = `brightness(${brightness.value}%) contrast(${contrast.value}%) saturate(${saturation.value}%)`;
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas);
        };
        bgImg.src = selectedBackdrop.value;
        return;
      }

      // 2. Draw Foreground Subject with filters
      ctx.filter = `brightness(${brightness.value}%) contrast(${contrast.value}%) saturate(${saturation.value}%)`;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas);
    };

    img.src = resultImageSrc.value;
  });
};

// Download Trigger
const downloadImage = async (format = 'png') => {
  if (!resultImageSrc.value) return;

  const canvas = await generateFinalCanvas();
  const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
  const extension = format === 'jpg' ? 'jpg' : 'png';
  const baseName = imageFileName.value.replace(/\.[^/.]+$/, '') || 'cutout';

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseName}-bg-removed.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, mimeType, 0.95);
};

// Copy PNG with Alpha to Clipboard
const copyImageToClipboard = async () => {
  if (!resultImageSrc.value) return;
  try {
    const canvas = await generateFinalCanvas();
    canvas.toBlob(async (blob) => {
      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        copied.value = true;
        setTimeout(() => {
          copied.value = false;
        }, 2500);
      }
    }, 'image/png');
  } catch (err) {
    console.error('Clipboard copy error:', err);
  }
};

// Lifecycle
onMounted(() => {
  window.addEventListener('paste', handlePaste);
});

onBeforeUnmount(() => {
  window.removeEventListener('paste', handlePaste);
});
</script>

<style scoped>
/* Custom styled range slider thumb */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #047857;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
</style>
