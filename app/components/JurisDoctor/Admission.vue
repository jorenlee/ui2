<template>
  <!-- Toast Notification -->
  <div
    v-if="toaster.show"
    :class="[
      'fixed top-4 right-4 z-[9999] px-4 py-2 rounded shadow-md text-sm cursor-pointer',
      toaster.type === 'success' ? 'bg-green-100 text-green-800' :
      toaster.type === 'error'   ? 'bg-red-100 text-red-800'     :
                                   'bg-yellow-100 text-yellow-800'
    ]"
    @click="toaster.show = false"
  >
    {{ toaster.message }}
  </div>

  <div class="min-h-screen bg-gray-50 flex flex-col font-sans select-none">

    <!-- Loading Modal -->
    <div v-if="isSubmitting" class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg flex items-center gap-4">
        <i class="fas fa-spinner animate-spin text-[#006B3F] text-2xl"></i>
        <span class="text-gray-800 font-medium">Submitting, please wait…</span>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════
         1. START / FORM VIEW
    ════════════════════════════════════════════════════════════════════════ -->
    <div v-if="!isExamStarted && !isExamSubmitted" class="flex-grow flex items-center justify-center p-4 py-12">
      <div class="w-11/12 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

        <!-- Header Banner -->
        <div class="bg-[#006B3F] text-white p-8 text-center relative">
          <div class="absolute inset-0 bg-black/10"></div>
          <img
            src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/lsu-corporate-logo-white.png"
            alt="La Salle University"
            class="h-20 mb-4 object-contain justify-center mx-auto relative"
          />
          <h1 class="text-3xl font-black mt-1 tracking-wide relative">JURIS DOCTOR ADMISSION TEST</h1>
        </div>

        <div class="p-8 space-y-6">
          <!-- Guidelines & Rules -->
          <div class="space-y-4">
            <div class="font-bold text-[#006B3F] text-lg border-b pb-2 flex items-center gap-2 uppercase tracking-wider">
              <i class="fas fa-gavel text-xl"></i> Directions &amp; Guidelines
            </div>
            <div class="space-y-3 text-gray-600 text-sm leading-relaxed">
              <div class="flex gap-3 items-start">
                <span class="text-[#006B3F] font-bold">1.</span>
                <span>Read each question carefully. Choose the best answer from the options provided. Only one answer is recorded per item.</span>
              </div>
              <div class="flex gap-3 items-start">
                <span class="text-[#006B3F] font-bold">2.</span>
                <span>Review your answers before submitting. Once submitted, your answers can no longer be changed.</span>
              </div>
              <div class="flex gap-3 items-start">
                <span class="text-[#006B3F] font-bold">3.</span>
                <span>The allotted time is <strong>4 hours (240 minutes)</strong>. A warning will appear when 10 minutes remain.</span>
              </div>
              <div class="flex gap-3 items-start bg-red-50 p-4 rounded-xl border border-red-100 text-red-800 font-medium">
                <i class="fas fa-shield-halved text-red-600 text-lg shrink-0 mt-0.5 animate-pulse"></i>
                <div>
                  <span class="font-bold">Proctoring Rules:</span> During the examination, the use of unauthorized materials,
                  opening other tabs or browser windows, taking screenshots/photos, and right-clicking are strictly prohibited.
                  The system tracks window switches and full-screen status. Exceeding 3 tab switches or exiting full screen
                  for more than 10 seconds will trigger automatic submission.
                </div>
              </div>
            </div>
          </div>

          <!-- Examinee Info Form -->
          <div class="border-t pt-6 space-y-4">
            <div class="font-bold text-gray-800 text-base uppercase tracking-wider">Examinee Information</div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Full Name</label>
                <input
                  type="text"
                  v-model="fullname"
                  placeholder="e.g. John Doe"
                  required
                  class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006B3F] focus:border-transparent text-sm transition"
                />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Email Address</label>
                <input
                  type="email"
                  v-model="email"
                  placeholder="e.g. john.doe@example.com"
                  required
                  class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006B3F] focus:border-transparent text-sm transition"
                />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Examinee ID</label>
                <input
                  type="text"
                  :value="examineeId"
                  readonly
                  class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Contact Number</label>
                <div class="flex items-center">
                  <span class="bg-gray-100 border border-gray-200 rounded-l px-3 py-3 text-gray-600 text-sm">+63</span>
                  <input
                    type="tel"
                    v-model="contactNumber"
                    placeholder="9xx xxx xxxx"
                    minlength="10"
                    maxlength="10"
                    required
                    class="flex-1 px-4 py-3 rounded-r-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006B3F] focus:border-transparent text-sm transition"
                  />
                </div>
              </div>
            </div>

            <!-- Data Privacy -->
            <details class="mt-4 text-xs text-gray-600">
              <summary class="font-bold cursor-pointer text-green-700 uppercase">Data Privacy Notice, Consent, and Confidentiality Disclaimer</summary>
              <div class="mt-3 space-y-3 text-xs leading-relaxed">
                <p><strong>La Salle University Ozamiz, Inc.</strong> At the Juris Doctor's Office, we are committed to protecting the privacy and security of your personal information. This Privacy Notice explains how we collect, use, disclose, and protect your information when you interact with our office.</p>
                
                <div>
                  <p class="font-bold text-gray-800 mb-2">INFORMATION WE COLLECT</p>
                  <p>We collect various types of personal information necessary for providing our services, including but not limited to:</p>
                  <ul class="list-disc list-inside space-y-1 ml-2">
                    <li>Contact information: Name, address, email address, phone number, and other contact details</li>
                    <li>Identification information: Student ID number, government-issued identification details</li>
                    <li>Academic information: Course enrollment, grades, academic progress, and transcripts</li>
                    <li>Co-curricular information: Service learnings, outreach activities, Field Trips, Internship or apprenticeship compliance</li>
                    <li>Financial information: Payment details, financial aid information, promissory notes</li>
                    <li>Pictures and videos of activities you participate in, via official documentation of such activities</li>
                    <li>Other information: Any additional information you provide to us in the course of our interactions</li>
                  </ul>
                </div>

                <div>
                  <p class="font-bold text-gray-800 mb-2">HOW WE COLLECT YOUR INFORMATION</p>
                  <p>We use the information we collect for the following purposes:</p>
                  <ul class="list-disc list-inside space-y-1 ml-2">
                    <li>Providing Juris Doctor services, including enrollment, course registration, and academic records management</li>
                    <li>Communicating with you regarding administrative matters, such as changes to policies or procedures</li>
                    <li>Processing financial transactions related to your academic activities</li>
                    <li>Analyzing and improving our services, systems, and operations</li>
                    <li>Complying with legal obligations and regulatory requirements</li>
                    <li>Soliciting your participation in research and non-commercial surveys sanctioned by the University</li>
                    <li>Sharing of grades between academic administrators and offices for evaluation of student performance</li>
                  </ul>
                </div>

                <div>
                  <p class="font-bold text-gray-800 mb-2">DISCLOSURE OF YOUR INFORMATION</p>
                  <p>We may disclose your personal information in the following circumstances:</p>
                  <ul class="list-disc list-inside space-y-1 ml-2">
                    <li>To authorized personnel within La Salle University who require access to fulfil their duties</li>
                    <li>To educational institutions or organizations as required to facilitate academic processes (e.g., transcript requests, enrollment verification)</li>
                    <li>To third-party service providers who assist us in carrying out our functions and services</li>
                    <li>When required by law or legal process, such as in response to a subpoena or court order</li>
                    <li>In emergencies or situations involving the health or safety of individuals</li>
                    <li>To government agencies for legitimate planning purposes directly related to education and student welfare</li>
                  </ul>
                </div>

                <div>
                  <p class="font-bold text-gray-800 mb-2">DATA SECURITY</p>
                  <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, disclosure, alteration, or destruction.</p>
                </div>

                <div>
                  <p class="font-bold text-gray-800 mb-2">CONTACT US</p>
                  <p>If you have any questions, concerns, or complaints about our Privacy Notice or our handling of your personal information, please contact us at <a href="mailto:dpco@lsu.edu.ph" class="text-[#006B3F] underline font-bold">doco@lsu.edu.ph</a>.</p>
                </div>

                <p class="font-bold text-gray-800 pt-2 border-t">By proceeding, you agree to the mentioned statements above.</p>
             
             
              </div>
            </details>

          
            <label class="flex items-center gap-3 cursor-pointer pt-2 select-none">
              <input
                type="checkbox"
                v-model="acceptGuidelines"
                class="w-5 h-5 text-[#006B3F] border-gray-300 rounded focus:ring-[#006B3F]"
              />
              <span class="text-xs text-gray-600 font-medium leading-snug">
                I confirm that I have read the directions, data privacy disclaimer, agree to the proctoring rules, and am ready to start the exam.
              </span>
            </label>
          </div>

          <!-- Start Button -->
          <button
            @click="startExam"
            :disabled="!canStart"
            class="w-full py-4 bg-[#006B3F] hover:bg-green-700 disabled:bg-gray-200 text-white font-bold text-base rounded-xl transition duration-150 uppercase tracking-wider shadow-lg shadow-green-700/20 disabled:shadow-none disabled:cursor-not-allowed"
          >
            <span v-if="questions.length === 0"><i class="fas fa-spinner animate-spin mr-2"></i>Loading questions…</span>
            <span v-else><i class="fas fa-expand mr-2"></i>Start Examination &amp; Enter Fullscreen</span>
          </button>

          <!-- New Questionnaire Button -->
          <button
            @click="resetForm"
            class="w-full mt-3 py-4 bg-gray-600 hover:bg-gray-700 text-white font-bold text-base rounded-xl transition duration-150 uppercase tracking-wider shadow-lg shadow-gray-700/20"
          >
            <i class="fas fa-plus mr-2"></i>New Questionnaire
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════
         2. ACTIVE EXAM VIEW
    ════════════════════════════════════════════════════════════════════════ -->
    <div v-if="isExamStarted && !isExamSubmitted" class="flex-grow flex flex-col">

      <!-- Sticky Proctoring Bar & Timer -->
      <div class="bg-[#006B3F] text-white px-6 py-4 shadow-md flex flex-wrap gap-4 justify-between items-center sticky top-0 z-40">
        <div class="flex items-center gap-4">
          <div>
            <h1 class="text-lg font-black uppercase tracking-wider">LSU Juris Doctor Admission Test</h1>
            <p class="text-xs text-green-200">Examinee: <span class="font-bold text-white uppercase">{{ fullname }}</span></p>
          </div>
          <span class="hidden md:inline px-3 py-1 bg-black/20 text-green-300 font-bold rounded-full text-xs border border-green-800">
            <span class="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block mr-1"></span> Proctoring Active
          </span>
        </div>

        <div class="flex items-center gap-3">
          <!-- Auto-save indicator -->
          <span v-if="lastSavedAt" class="hidden md:inline-flex items-center gap-1.5 text-[10px] font-bold text-green-200 bg-black/20 px-2.5 py-1 rounded-full border border-green-800">
            <i class="fas fa-cloud-arrow-up text-green-300"></i>
            Saved {{ lastSavedAt }}
          </span>

          <!-- Timer -->
          <div class="relative">
            <div
              @dblclick="showTimerAdjust = !showTimerAdjust"
              class="px-4 py-1.5 rounded-lg font-mono text-lg font-black flex items-center gap-2 cursor-pointer select-none"
              :class="timeLeft < 600 ? 'bg-red-700 text-white animate-pulse border border-red-500' : 'bg-black/20 text-white border border-green-700'"
              title="Double-click to adjust timer (testing only)"
            >
              <i class="fas fa-clock"></i> {{ formatTime(timeLeft) }}
            </div>

            <!-- Timer Adjust Popover -->
            <div
              v-if="showTimerAdjust"
              class="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 w-64"
              @click.stop
            >
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-black text-gray-700 uppercase tracking-wider">⏱ Adjust Timer</span>
                <button @click="showTimerAdjust = false" class="text-gray-400 hover:text-gray-600 text-xs">✕</button>
              </div>
              <div class="grid grid-cols-3 gap-1.5 mb-3">
                <button
                  v-for="preset in timerPresets"
                  :key="preset.seconds"
                  @click="timeLeft = preset.seconds; showTimerAdjust = false"
                  class="py-1.5 rounded-lg text-[11px] font-bold transition border"
                  :class="timeLeft === preset.seconds ? 'bg-[#006B3F] text-white border-[#006B3F]' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'"
                >{{ preset.label }}</button>
              </div>
              <div class="flex gap-2 items-center">
                <input
                  type="number"
                  v-model.number="customTimerSeconds"
                  placeholder="Seconds"
                  min="1"
                  class="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#006B3F]"
                />
                <button
                  @click="if (customTimerSeconds > 0) { timeLeft = customTimerSeconds; showTimerAdjust = false }"
                  class="px-3 py-2 rounded-lg bg-[#006B3F] text-white text-xs font-bold hover:bg-green-700 transition shrink-0"
                >Set</button>
              </div>
              <p class="text-[10px] text-gray-400 mt-2 leading-snug">Double-click timer to toggle this panel.</p>
            </div>
          </div>

          <!-- Pause Button -->
          <button
            @click="pauseExam"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-xs font-bold transition"
            title="Pause &amp; Save"
          >
            <i class="fas fa-pause"></i>
            <span class="hidden md:inline">Pause</span>
          </button>
        </div>
      </div>

      <!-- Under-10-minute warning banner -->
      <div v-if="timeLeft < 600 && timeLeft > 0" class="bg-red-100 border-b border-red-200 text-red-800 text-center font-bold py-2 text-xs uppercase tracking-wide flex items-center justify-center gap-2">
        <i class="fas fa-triangle-exclamation text-red-600 animate-bounce"></i>
        Attention: Under 10 minutes remaining. Please finalize your answers immediately!
      </div>

      <!-- Main Layout -->
      <div class="flex-grow flex flex-col md:flex-row relative">

        <!-- Sidebar Navigation -->
        <aside class="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col shrink-0">
          <div class="p-4 border-b border-gray-100 bg-gray-50/50">
            <span class="text-xs font-extrabold uppercase tracking-widest text-gray-400">Exam Sections</span>
            <div class="mt-2">
              <div class="flex items-center justify-between text-xs text-gray-500 font-bold mb-1">
                <span>Progress</span>
                <span>{{ answersCount }} of {{ questions.length }} items</span>
              </div>
              <div class="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  class="bg-[#006B3F] h-full transition-all duration-300"
                  :style="{ width: questions.length ? `${(answersCount / questions.length) * 100}%` : '0%' }"
                ></div>
              </div>
            </div>
          </div>

          <nav class="flex-grow overflow-y-auto p-2 space-y-1">
            <button
              v-for="cat in categories"
              :key="cat"
              @click="selectCategory(cat)"
              class="w-full text-left px-4 py-3 rounded-lg text-xs font-bold tracking-wide transition flex items-center justify-between group"
              :class="activeCategory === cat
                ? 'bg-[#006B3F] text-white shadow-md shadow-green-700/10'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
            >
              <span class="truncate pr-2 select-none">{{ cat }}</span>
              <span
                class="px-2 py-0.5 rounded-full text-[10px] shrink-0 font-extrabold"
                :class="activeCategory === cat ? 'bg-green-800/60 text-green-100' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'"
              >
                {{ getCategoryProgress(cat).answered }}/{{ getCategoryProgress(cat).total }}
              </span>
            </button>
          </nav>
        </aside>

        <!-- Main Content Area -->
        <main class="flex-grow p-4 md:p-6 overflow-y-auto w-full">

          <!-- Overall Progress Bar -->
          <div class="mb-4 bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-extrabold text-gray-500 uppercase tracking-widest">Overall Progress</span>
              <span class="text-xs font-black text-[#006B3F]">{{ answersCount }} / {{ questions.length }} answered</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                class="bg-[#006B3F] h-2.5 rounded-full transition-all duration-500"
                :style="{ width: questions.length > 0 ? (answersCount / questions.length * 100) + '%' : '0%' }"
              ></div>
            </div>
            <div class="mt-1.5 text-[10px] text-gray-400 font-medium">
              {{ questions.length > 0 ? Math.round(answersCount / questions.length * 100) : 0 }}% complete
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

            <!-- Category Title Header -->
            <div class="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-[#006B3F]/8 via-white to-emerald-50/30">
              <div class="absolute -top-6 -right-6 w-32 h-32 bg-[#006B3F]/5 rounded-full blur-2xl pointer-events-none"></div>
              <div class="absolute bottom-0 left-1/3 w-20 h-20 bg-emerald-100/40 rounded-full blur-xl pointer-events-none"></div>
              <div class="relative px-6 md:px-8 py-6">
                <div class="flex items-center gap-2 mb-3">
                  <span class="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.15em] text-[#006B3F] uppercase bg-green-50 px-3 py-1 rounded-full border border-green-200 shadow-sm">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#006B3F] animate-pulse inline-block"></span>
                    Active Section
                  </span>
                </div>
                <h2 class="text-sm font-black text-gray-900 leading-tight tracking-wide mb-3">{{ activeCategory }}</h2>
                <div
                  v-if="currentDescription"
                  class="flex gap-3 items-start bg-white/80 border border-[#006B3F]/15 rounded-xl px-4 py-3 shadow-sm backdrop-blur-sm"
                >
                  <div class="w-6 h-6 rounded-lg bg-[#006B3F]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <i class="fas fa-circle-info text-[#006B3F] text-xs"></i>
                  </div>
                  <p class="text-sm text-gray-600 leading-relaxed">{{ currentDescription }}</p>
                </div>
              </div>
            </div>

            <div class="p-6 md:p-8">

              <!-- ── ESSAY SECTION ── -->
              <div v-if="isEssayCategory" class="space-y-6">
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-5 text-gray-700 text-sm leading-relaxed space-y-2">
                  <h3 class="font-bold text-amber-800 flex items-center gap-2">
                    <i class="fas fa-file-signature text-amber-600 text-base"></i> Essay Guidelines
                  </h3>
                  <p>Please select <strong>one (1)</strong> of the legal analysis essay prompts below and write a well-structured, coherent response. You can only answer <strong>one</strong> prompt. Target length: 300–500 words.</p>
                </div>

                <!-- Essay Prompt Selection -->
                <div class="space-y-4 mt-6">
                  <div class="font-bold text-gray-700 text-xs uppercase tracking-widest">Select your essay prompt:</div>
                  <label
                    v-for="question in activeQuestions"
                    :key="question.id"
                    class="flex items-start gap-3 p-4 rounded-xl border-2 transition cursor-pointer select-none bg-white hover:border-[#006B3F] hover:bg-green-50/30"
                    :class="selectedEssayQuestionId === question.id ? 'border-[#006B3F] bg-green-50/40 shadow-sm' : 'border-gray-200'"
                  >
                    <input
                      type="radio"
                      name="essay_prompt"
                      :value="question.id"
                      v-model="selectedEssayQuestionId"
                      class="w-4 h-4 text-[#006B3F] border-gray-300 focus:ring-[#006B3F] shrink-0 mt-0.5"
                    />
                    <span class="text-sm font-semibold text-gray-700 leading-relaxed">{{ question.question }}</span>
                  </label>
                </div>

                <!-- Essay Response -->
                <div class="space-y-2 mt-6">
                  <div class="flex items-center justify-between">
                    <label class="font-bold text-gray-700 text-xs uppercase tracking-widest">Your Response:</label>
                    <span class="text-xs text-gray-500 font-bold bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                      <i class="fas fa-font mr-1"></i> {{ wordCount }} words
                    </span>
                  </div>
                  <textarea
                    v-model="essayResponse"
                    rows="15"
                    placeholder="Type your essay response here. Be critical, structured, and logical…"
                    class="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006B3F] focus:border-transparent text-sm leading-relaxed transition font-serif resize-y bg-gray-50"
                  ></textarea>
                </div>
              </div>

              <!-- ── MULTIPLE CHOICE SECTION ── -->
              <div v-else class="space-y-10">
                <template v-for="group in passageGroups" :key="group.passage || 'no-passage'">
                  <!-- Reading Passage -->
                  <div v-if="group.passage" class="bg-gray-50 border-l-4 border-[#006B3F] rounded-r-xl p-5 mb-6 font-serif text-gray-700 leading-relaxed italic text-sm">
                    <div class="font-bold text-xs uppercase tracking-wider text-[#006B3F] not-italic mb-2 flex items-center gap-1.5 font-sans">
                      <i class="fas fa-book-open"></i> Reading Passage
                    </div>
                    {{ group.passage }}
                  </div>

                  <!-- Questions -->
                  <div
                    v-for="question in group.questions"
                    :key="question.id"
                    class="pb-10 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div class="mb-5">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="inline-flex items-center gap-1.5 bg-[#006B3F] text-white text-[10px] font-black px-2.5 py-1 rounded-full select-none uppercase tracking-widest">
                          Item #{{ questions.findIndex(q => q.id === question.id) + 1 }}
                        </span>
                      </div>
                      <p class="font-bold text-gray-800 text-sm md:text-base leading-relaxed select-none">
                        {{ question.question }}
                      </p>
                    </div>

                    <!-- Options Grid (up to 4) -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <label
                        v-for="option in question.options"
                        :key="option"
                        class="flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-150 select-none"
                        :class="answers[question.id] === option
                          ? 'border-[#006B3F] bg-green-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'"
                      >
                        <input
                          type="radio"
                          :name="'q_' + question.id"
                          :value="option"
                          v-model="answers[question.id]"
                          class="w-4 h-4 text-[#006B3F] border-gray-300 focus:ring-[#006B3F] shrink-0 mt-0.5"
                        />
                        <span
                          class="text-sm leading-snug break-words flex-1"
                          :class="answers[question.id] === option ? 'text-[#006B3F] font-semibold' : 'text-gray-700 font-medium'"
                        >{{ option }}</span>
                      </label>
                    </div>
                  </div>
                </template>
              </div>

              <!-- ── NAV CONTROLS ── -->
              <div class="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
                <button
                  @click="prevCategory"
                  :disabled="categories.indexOf(activeCategory) === 0"
                  class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-extrabold transition disabled:opacity-40 disabled:cursor-not-allowed select-none"
                >
                  <i class="fas fa-chevron-left"></i> Previous
                </button>

                <button
                  v-if="!isLastCategory"
                  @click="nextCategory"
                  class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#006B3F] hover:bg-green-700 text-white text-xs font-extrabold transition shadow-md shadow-green-800/10 select-none"
                >
                  Next Section <i class="fas fa-chevron-right"></i>
                </button>

                <button
                  v-else
                  @click="showConfirmSubmit = true"
                  class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#006B3F] hover:bg-green-700 text-white text-xs font-black transition shadow-md shadow-green-800/10 uppercase tracking-widest select-none"
                >
                  <i class="fas fa-paper-plane"></i> Submit Examination
                </button>
              </div>

            </div><!-- /p-6 -->
          </div><!-- /card -->
        </main>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════
         3. POST-SUBMISSION / SUCCESS VIEW
    ════════════════════════════════════════════════════════════════════════ -->
    <div v-if="isExamSubmitted" class="flex-grow flex items-center justify-center p-4 py-12">
      <div class="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden text-center p-8 md:p-12 border border-gray-100 space-y-6">
        <div class="relative w-20 h-20 mx-auto mb-2">
          <div class="absolute inset-0 rounded-full bg-green-100 blur-md opacity-60"></div>
          <div class="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-600 to-[#006B3F] flex items-center justify-center border-4 border-white shadow-lg">
            <i class="fas fa-check text-white text-3xl"></i>
          </div>
        </div>
        <div class="space-y-3">
          <p class="text-[10px] font-extrabold uppercase tracking-widest text-[#006B3F] bg-green-50 px-3 py-1 rounded-full w-fit mx-auto border border-green-200">Submission Confirmed</p>
          <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Thank you for submitting,<br />
            <span class="text-[#006B3F] block mt-1 font-black capitalize">{{ fullname }}</span>
          </h1>
          <div class="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Your exam session for the
          <p>  <strong class="text-gray-800 font-semibold">La Salle University Juris Doctor Admission Test</strong></p>
            has been successfully recorded.
          </div>
        </div>
        <div>
          <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/lsu-corporate-logo-green.png" class="w-32 mx-auto" />
        </div>
        <div class="bg-gray-50 rounded-xl p-6 text-left max-w-md mx-auto space-y-3 border border-gray-100">
          <div class="text-xs text-gray-500 font-bold uppercase tracking-wider border-b pb-2 mb-2 flex items-center justify-between">
            <span>Session Summary</span>
            <span class="px-2 py-0.5 bg-green-100 text-green-800 rounded font-black">Recorded</span>
          </div>
          <div class="flex justify-between text-xs text-gray-700 font-medium">
            <span>Multiple Choice Answers:</span>
            <span class="font-bold text-gray-900">Submitted</span>
          </div>
          <div class="flex justify-between text-xs text-gray-700 font-medium">
            <span>Legal Essay Response:</span>
            <span class="font-bold text-gray-900">{{ essayResponse.trim() ? 'Submitted' : 'Not submitted' }}</span>
          </div>
          <div class="flex justify-between text-xs text-gray-700 font-medium">
            <span>Status:</span>
            <span class="font-bold text-blue-700 uppercase">Pending Essay Review</span>
          </div>
        </div>
        <div class="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
          Your final results and passing status are pending grading of the Legal Essay section. You will receive an official notification once fully graded.
        </div>
        <div class="pt-4 border-t">
          <button @click="resetTestState" class="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition">
            Back to Home
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════
         4. MODALS — Confirm Submit
    ════════════════════════════════════════════════════════════════════════ -->
    <div v-if="showConfirmSubmit" class="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        <div class="bg-gradient-to-br from-[#006B3F] to-emerald-700 px-6 pt-7 pb-8 text-white text-center relative overflow-hidden">
          <div class="absolute inset-0 bg-black/10 pointer-events-none"></div>
          <div class="relative">
            <div class="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20">
              <i class="fas fa-paper-plane text-xl text-white"></i>
            </div>
            <h2 class="text-lg font-black tracking-wide">Submit Examination?</h2>
            <p class="text-green-100 text-xs mt-1 font-medium">This action cannot be undone once confirmed.</p>
          </div>
        </div>
        <div class="px-6 py-5 space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-gray-50 rounded-xl px-4 py-3 text-center border border-gray-100">
              <div class="text-2xl font-black text-[#006B3F]">{{ mcAnsweredCount }}</div>
              <div class="text-[11px] font-bold text-gray-500 uppercase tracking-wide mt-0.5">MC Answered</div>
            </div>
            <div class="bg-gray-50 rounded-xl px-4 py-3 text-center border border-gray-100">
              <div class="text-2xl font-black text-gray-400">{{ mcUnansweredCount }}</div>
              <div class="text-[11px] font-bold text-gray-500 uppercase tracking-wide mt-0.5">Unanswered</div>
            </div>
          </div>
          <div class="flex gap-2.5 items-start bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <i class="fas fa-triangle-exclamation text-amber-500 text-sm mt-0.5 shrink-0"></i>
            <p class="text-xs text-amber-800 leading-relaxed font-medium">
              Once submitted, your answers are final and <strong>cannot be changed</strong>. Please review all sections before proceeding.
            </p>
          </div>
          <div class="flex gap-3 pt-1">
            <button
              @click="showConfirmSubmit = false"
              class="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition"
            >
              <i class="fas fa-arrow-left mr-1.5 text-xs"></i> Go Back
            </button>
            <button
              @click="submitExam(false)"
              class="flex-1 py-3 rounded-xl bg-[#006B3F] hover:bg-emerald-700 text-white text-sm font-black transition shadow-lg shadow-green-800/20 uppercase tracking-wide"
            >
              <i class="fas fa-check mr-1.5 text-xs"></i> Submit
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════
         5. MODALS — Tab Switch Warning
    ════════════════════════════════════════════════════════════════════════ -->
    <div v-if="showTabWarning && isExamStarted" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-md w-full border-t-8 border-yellow-500 text-center space-y-5">
        <div class="w-14 h-14 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mx-auto border border-yellow-100">
          <i class="fas fa-triangle-exclamation text-2xl"></i>
        </div>
        <div class="space-y-2">
          <h2 class="text-xl font-extrabold text-gray-900">Security Warning: Tab Switch Detected</h2>
          <p class="text-sm text-gray-600 leading-relaxed">Leaving the exam window or switching tabs is strictly prohibited. Your actions are being logged.</p>
        </div>
        <div class="bg-yellow-50 text-yellow-800 text-xs font-extrabold py-3 px-4 rounded-lg">
          Active Warnings: {{ tabSwitchWarnings }} of 3 Allowed
        </div>
        <p class="text-[11px] text-red-600 leading-snug">
          Exceeding 3 tab switches will terminate your session and auto-submit your exam.
        </p>
        <button
          @click="closeTabWarning"
          class="w-full py-3 bg-[#006B3F] hover:bg-green-700 text-white font-bold text-xs rounded-lg transition uppercase tracking-wider"
        >
          I Understand &amp; Resume Exam
        </button>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════
         6. MODALS — Fullscreen Warning
    ════════════════════════════════════════════════════════════════════════ -->
    <div v-if="showFullscreenWarning && isExamStarted" class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div class="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-md w-full border-t-8 border-red-600 text-center space-y-5">
        <div class="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
          <i class="fas fa-maximize text-2xl"></i>
        </div>
        <div class="space-y-2">
          <h2 class="text-xl font-extrabold text-gray-900">Security Alert: Full Screen Exited</h2>
          <p class="text-sm text-gray-600 leading-relaxed">You must remain in fullscreen mode for the duration of the examination.</p>
        </div>
        <div class="bg-red-50 text-red-800 text-xs font-extrabold py-3.5 px-4 rounded-lg">
          Auto-submitting in: <span class="font-mono text-base font-black text-red-700">{{ fullscreenWarningCountdown }}s</span>
        </div>
        <button
          @click="forceReEnterFullscreen"
          class="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-lg transition uppercase tracking-widest shadow-lg shadow-red-600/20"
        >
          Re-enter Full Screen Mode
        </button>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════
         7. MODALS — Pause
    ════════════════════════════════════════════════════════════════════════ -->
    <div v-if="isPaused && isExamStarted" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 text-center">
        <div class="bg-gradient-to-br from-[#006B3F] to-emerald-700 px-6 pt-8 pb-10 text-white relative overflow-hidden">
          <div class="absolute inset-0 bg-black/10 pointer-events-none"></div>
          <div class="relative">
            <div class="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20">
              <i class="fas fa-pause text-2xl text-white"></i>
            </div>
            <h2 class="text-xl font-black tracking-wide">Exam Paused</h2>
            <p class="text-green-100 text-xs mt-1">Timer is stopped. Your progress is saved.</p>
          </div>
        </div>
        <div class="px-6 py-6 space-y-4">
          <div class="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <i class="fas fa-cloud-check text-[#006B3F] text-lg shrink-0"></i>
            <div class="text-left">
              <p class="text-xs font-black text-gray-800">Progress Auto-Saved</p>
              <p class="text-[11px] text-gray-500 mt-0.5">{{ answersCount }} answer(s) saved locally.</p>
            </div>
          </div>
          <div class="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
            <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Time Remaining</p>
            <p class="font-mono text-2xl font-black text-gray-800 mt-0.5">{{ formatTime(timeLeft) }}</p>
          </div>
          <div class="flex gap-2 items-start bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-left">
            <i class="fas fa-triangle-exclamation text-amber-500 text-xs mt-0.5 shrink-0"></i>
            <p class="text-xs text-amber-800 font-medium leading-relaxed">The exam timer is paused. You must re-enter fullscreen to resume.</p>
          </div>
          <button @click="resumeExam" class="w-full py-3.5 rounded-xl bg-[#006B3F] hover:bg-emerald-700 text-white font-black text-sm transition shadow-lg shadow-green-800/20 uppercase tracking-wide">
            <i class="fas fa-play mr-2"></i> Resume Exam
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'

// Accept but don't use these props (suppresses Vue warnings)
defineProps({
  darkMode: { type: Boolean, default: false },
  rolePermissions: { type: Array, default: () => [] }
})

// ─── Constants ─────────────────────────────────────────────────────────────
const SAVE_KEY = 'jde_exam_session'
const EXAM_DURATION = 14400 // 4 hours in seconds
const ESSAY_CATEGORY = 'Part 6. Essay Questions & Legal Analysis'

// ─── Runtime config (Nuxt) ─────────────────────────────────────────────────
const config = useRuntimeConfig()

// ─── Toast ─────────────────────────────────────────────────────────────────
const toaster = ref({ message: '', type: 'warning', show: false })
const showToaster = (message, type = 'warning', duration = 3000) => {
  toaster.value = { message, type, show: true }
  setTimeout(() => { toaster.value.show = false }, duration)
}

// ─── Core state ────────────────────────────────────────────────────────────
const isExamStarted   = ref(false)
const isExamSubmitted = ref(false)
const isSubmitting    = ref(false)
const submitReason    = ref('manual') // 'manual' | 'timer' | 'violation'

const showConfirmSubmit = ref(false)

const fullname       = ref('')
const email          = ref('')
const contactNumber  = ref('')
const acceptGuidelines = ref(false)
const examineeId     = ref('JDE' + Date.now())

const questions   = ref([])
const answers     = reactive({})
const essayResponse            = ref('')
const selectedEssayQuestionId  = ref(null)

const activeCategory = ref('')

// ─── Timer state ───────────────────────────────────────────────────────────
const timer                    = ref(null)
const timeLeft                 = ref(EXAM_DURATION)
const isPaused                 = ref(false)
const lastSavedAt              = ref('')
const showTimerAdjust          = ref(false)
const customTimerSeconds       = ref(60)
const timerPresets = [
  { label: '30s',  seconds: 30 },
  { label: '5 min',  seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '30 min', seconds: 1800 },
  { label: '1 hr',   seconds: 3600 },
  { label: '4 hr',   seconds: 14400 },
]

// ─── Proctoring state ──────────────────────────────────────────────────────
const tabSwitchWarnings         = ref(0)
const showTabWarning            = ref(false)
const showFullscreenWarning     = ref(false)
const fullscreenWarningCountdown = ref(10)
const fullscreenWarningTimer    = ref(null)

// ─── Category descriptions ─────────────────────────────────────────────────
const categoryDescriptions = [
  { category: 'Verbal Ability & Structural Literacy',        description: 'Directions: Identify grammatical errors, choose the correct syntactic options, or recognize structural flaws in sentence mechanics. Select only one answer for each item.' },
  { category: 'Advanced Vocabulary & Analytical Analogies',  description: 'Directions: Choose the option that best completes the sentence context, matches synonyms/antonyms, or fulfills the logical structural relationships in the verbal analogies.' },
  { category: 'Analytical & Logical Reasoning',              description: 'Directions: Analyze the structural logic of arguments, formal syllogisms, linear sequencing puzzles, and arguments tracking critical assumptions, strengthening elements, or logical fallacies.' },
  { category: 'Quantitative Reasoning',                      description: 'Directions: Solve numerical and quantitative problems involving arithmetic, algebra, ratios, percentages, data interpretation, and applied mathematics. Select only one answer for each item.' },
  { category: 'Reading Comprehension',                       description: 'Directions: Read the legal passages carefully and answer the questions that follow.' },
  { category: ESSAY_CATEGORY,                                description: 'Directions: Select one (1) prompt and write a well-structured essay (300–500 words). Responses will be evaluated on argument quality, synthesis, structural clarity, and analytical depth.' },
]

// ─── Computed ──────────────────────────────────────────────────────────────
const currentDescription = computed(() => {
  return categoryDescriptions.find(d => d.category === activeCategory.value)?.description || ''
})

const categories = computed(() => {
  const list = []
  questions.value.forEach(q => {
    const cat = q.category || 'Uncategorized'
    if (!list.includes(cat)) list.push(cat)
  })
  return list
})

const activeQuestions = computed(() =>
  questions.value.filter(q => q.category === activeCategory.value)
)

const isEssayCategory = computed(() =>
  activeCategory.value === ESSAY_CATEGORY ||
  activeQuestions.value.some(q => q.is_essay)
)

// Group MC questions by their passage
const passageGroups = computed(() => {
  const groups = []
  const seenPassages = new Map()
  activeQuestions.value.forEach(q => {
    const key = q.passage || '__no_passage__'
    if (seenPassages.has(key)) {
      groups[seenPassages.get(key)].questions.push(q)
    } else {
      seenPassages.set(key, groups.length)
      groups.push({ passage: q.passage || null, questions: [q] })
    }
  })
  return groups
})

// Count all MC answers filled in
const mcAnsweredCount = computed(() => {
  const mcIds = questions.value.filter(q => !q.is_essay).map(q => q.id)
  return mcIds.filter(id => answers[id] !== undefined && answers[id] !== '').length
})

const mcUnansweredCount = computed(() => {
  return questions.value.filter(q => !q.is_essay).length - mcAnsweredCount.value
})

// Total answered (MC + essay if written)
const answersCount = computed(() => {
  return mcAnsweredCount.value + (essayResponse.value.trim() ? 1 : 0)
})

const wordCount = computed(() => {
  const text = essayResponse.value.trim()
  return text ? text.split(/\s+/).filter(Boolean).length : 0
})

const isLastCategory = computed(() => {
  if (!categories.value.length) return true
  return categories.value.indexOf(activeCategory.value) === categories.value.length - 1
})

// Start button enabled guard
const canStart = computed(() =>
  !!fullname.value.trim() &&
  !!email.value.trim() &&
  !!contactNumber.value.trim() &&
  acceptGuidelines.value &&
  questions.value.length > 0
)

const getCategoryProgress = (cat) => {
  const catQs = questions.value.filter(q => q.category === cat)
  if (cat === ESSAY_CATEGORY || catQs.some(q => q.is_essay)) {
    return { answered: essayResponse.value.trim() ? 1 : 0, total: 1 }
  }
  const answered = catQs.filter(q => answers[q.id] !== undefined && answers[q.id] !== '').length
  return { answered, total: catQs.length }
}

// ─── Auto-save helpers ─────────────────────────────────────────────────────
const saveSession = () => {
  if (!isExamStarted.value || isExamSubmitted.value) return
  const session = {
    fullname: fullname.value,
    email: email.value,
    contactNumber: contactNumber.value,
    examineeId: examineeId.value,
    answers: { ...answers },
    essayResponse: essayResponse.value,
    selectedEssayQuestionId: selectedEssayQuestionId.value,
    timeLeft: timeLeft.value,
    activeCategory: activeCategory.value,
    savedAt: Date.now(),
  }
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(session))
    lastSavedAt.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch (e) {
    console.warn('Auto-save failed', e)
  }
}

const clearSession = () => {
  try { localStorage.removeItem(SAVE_KEY) } catch (e) {}
}

const restoreSession = () => {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return false
    const s = JSON.parse(raw)
    if (Date.now() - s.savedAt > 6 * 3600 * 1000) { clearSession(); return false }
    fullname.value = s.fullname || ''
    email.value = s.email || ''
    contactNumber.value = s.contactNumber || ''
    examineeId.value = s.examineeId || ('JDE' + Date.now())
    Object.assign(answers, s.answers || {})
    essayResponse.value = s.essayResponse || ''
    selectedEssayQuestionId.value = s.selectedEssayQuestionId || null
    timeLeft.value = s.timeLeft ?? EXAM_DURATION
    activeCategory.value = s.activeCategory || ''
    return true
  } catch (e) { return false }
}

// ─── Watchers ──────────────────────────────────────────────────────────────
watch(answers, saveSession, { deep: true })
watch(essayResponse, saveSession)
watch(timeLeft, (v) => {
  if (v <= 0 && isExamStarted.value && !isExamSubmitted.value) {
    submitReason.value = 'timer'
    submitExam(true)
  } else if (v % 30 === 0) {
    saveSession()
  }
})

// ─── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const res = await $fetch(`${config.public.apiUrl}/api/jurisdoctor/questions/1/`)
    questions.value = res || []

    const restored = restoreSession()
    if (restored && fullname.value) {
      if (!activeCategory.value || !categories.value.includes(activeCategory.value)) {
        activeCategory.value = categories.value[0] || ''
      }
      showToaster('📂 Previous session restored! Your answers have been reloaded.', 'success', 5000)
    } else if (categories.value.length > 0) {
      activeCategory.value = categories.value[0]
    }
  } catch (error) {
    console.error('Failed to load questions', error)
    showToaster('Failed to load exam questions. Please refresh.', 'error', 6000)
  }
})

onBeforeUnmount(() => {
  stopProctoring()
  if (timer.value) clearInterval(timer.value)
  if (fullscreenWarningTimer.value) clearInterval(fullscreenWarningTimer.value)
})

// ─── Exam flow ─────────────────────────────────────────────────────────────
const startExam = async () => {
  if (!canStart.value) {
    showToaster('Please complete all required fields and accept the guidelines.', 'warning')
    return
  }
  isExamStarted.value = true
  isExamSubmitted.value = false
  isPaused.value = false
  submitReason.value = 'manual'
  showConfirmSubmit.value = false
  tabSwitchWarnings.value = 0
  showTabWarning.value = false
  showFullscreenWarning.value = false

  // Only reset timer if it's still at the default (fresh start)
  if (timeLeft.value === EXAM_DURATION) timeLeft.value = EXAM_DURATION

  // Pre-select first essay question if not already chosen
  if (!selectedEssayQuestionId.value) {
    const essayQ = questions.value.find(q => q.is_essay)
    if (essayQ) selectedEssayQuestionId.value = essayQ.id
  }

  try { await enterFullscreen() } catch (e) { console.warn('Fullscreen rejected', e) }

  saveSession()
  startProctoring()

  if (timer.value) clearInterval(timer.value)
  timer.value = setInterval(() => {
    if (isPaused.value) return
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      submitReason.value = 'timer'
      submitExam(true)
    }
  }, 1000)
}

const pauseExam = () => {
  isPaused.value = true
  saveSession()
  showToaster('Exam paused. Your progress has been saved.', 'success', 3000)
}

const resumeExam = async () => {
  isPaused.value = false
  try { await enterFullscreen() } catch (e) {}
}

const resetForm = () => {
  isExamStarted.value = false
  isExamSubmitted.value = false
  fullname.value = ''
  email.value = ''
  contactNumber.value = ''
  acceptGuidelines.value = false
  Object.keys(answers).forEach(key => delete answers[key])
  essayResponse.value = ''
  selectedEssayQuestionId.value = null
  activeCategory.value = questions.value.length > 0 ? questions.value[0].category : ''
  timeLeft.value = EXAM_DURATION
  tabSwitchWarnings.value = 0
  clearSession()
  showToaster('Form reset. Ready for new exam attempt.', 'success', 3000)
}

// ─── Fullscreen helpers ────────────────────────────────────────────────────
const enterFullscreen = async () => {
  const el = document.documentElement
  if (el.requestFullscreen)       await el.requestFullscreen()
  else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen()
  else if (el.msRequestFullscreen)     await el.msRequestFullscreen()
}

const forceReEnterFullscreen = async () => {
  try { await enterFullscreen() } catch (e) { console.warn('Could not re-enter fullscreen', e) }
}

// ─── Proctoring ────────────────────────────────────────────────────────────
const handleFullscreenChange = () => {
  if (!isExamStarted.value || isExamSubmitted.value) return
  const inFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement)
  if (!inFs) {
    showFullscreenWarning.value = true
    fullscreenWarningCountdown.value = 10
    if (fullscreenWarningTimer.value) clearInterval(fullscreenWarningTimer.value)
    fullscreenWarningTimer.value = setInterval(() => {
      if (fullscreenWarningCountdown.value > 1) {
        fullscreenWarningCountdown.value--
      } else {
        clearInterval(fullscreenWarningTimer.value)
        fullscreenWarningTimer.value = null
        submitReason.value = 'violation'
        submitExam(true)
      }
    }, 1000)
  } else {
    showFullscreenWarning.value = false
    if (fullscreenWarningTimer.value) { clearInterval(fullscreenWarningTimer.value); fullscreenWarningTimer.value = null }
  }
}

const handleVisibilityChange = () => {
  if (!isExamStarted.value || isExamSubmitted.value) return
  if (document.hidden) {
    tabSwitchWarnings.value++
    showTabWarning.value = true
    if (tabSwitchWarnings.value > 3) { showTabWarning.value = false; submitReason.value = 'violation'; submitExam(true) }
  }
}

const handleWindowBlur = () => {
  if (!isExamStarted.value || isExamSubmitted.value) return
  tabSwitchWarnings.value++
  showTabWarning.value = true
  if (tabSwitchWarnings.value > 3) { showTabWarning.value = false; submitReason.value = 'violation'; submitExam(true) }
}

const handleKeydown = (e) => {
  if (!isExamStarted.value || isExamSubmitted.value) return
  if (e.key === 'F11' || e.keyCode === 122) e.preventDefault()
  if (e.key === 'Escape' || e.keyCode === 27) e.preventDefault()
}

const handleContextMenu = (e) => { if (isExamStarted.value && !isExamSubmitted.value) e.preventDefault() }

const beforeUnloadHandler = (e) => {
  if (isExamStarted.value && !isExamSubmitted.value) {
    const msg = 'You are currently taking the examination. Leaving will submit your test.'
    e.returnValue = msg; return msg
  }
}

const startProctoring = () => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('mozfullscreenchange', handleFullscreenChange)
  document.addEventListener('MSFullscreenChange', handleFullscreenChange)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('blur', handleWindowBlur)
  window.addEventListener('keydown', handleKeydown)
  document.addEventListener('contextmenu', handleContextMenu)
  window.addEventListener('beforeunload', beforeUnloadHandler)
}

const stopProctoring = () => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
  document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('blur', handleWindowBlur)
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('contextmenu', handleContextMenu)
  window.removeEventListener('beforeunload', beforeUnloadHandler)
}

const closeTabWarning = () => { showTabWarning.value = false }

// ─── Navigation ────────────────────────────────────────────────────────────
const selectCategory = (cat) => { activeCategory.value = cat }
const prevCategory = () => {
  const idx = categories.value.indexOf(activeCategory.value)
  if (idx > 0) activeCategory.value = categories.value[idx - 1]
}
const nextCategory = () => {
  const idx = categories.value.indexOf(activeCategory.value)
  if (idx < categories.value.length - 1) activeCategory.value = categories.value[idx + 1]
}

// ─── Reset ─────────────────────────────────────────────────────────────────
const resetTestState = () => {
  isExamSubmitted.value = false
  isExamStarted.value = false
  fullname.value = ''
  email.value = ''
  contactNumber.value = ''
  acceptGuidelines.value = false
  Object.keys(answers).forEach(k => delete answers[k])
  essayResponse.value = ''
  selectedEssayQuestionId.value = null
  examineeId.value = 'JDE' + Date.now()
  timeLeft.value = EXAM_DURATION
  activeCategory.value = categories.value[0] || ''
}

// ─── Format time ───────────────────────────────────────────────────────────
const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ─── Submit (with one auto-retry on 5xx) ───────────────────────────────────
const submitExam = async (autoSubmit = false) => {
  if (showConfirmSubmit.value) showConfirmSubmit.value = false
  isPaused.value = false
  isSubmitting.value = true

  if (timer.value) { clearInterval(timer.value); timer.value = null }
  if (fullscreenWarningTimer.value) { clearInterval(fullscreenWarningTimer.value); fullscreenWarningTimer.value = null }
  stopProctoring()

  if (document.fullscreenElement || document.webkitFullscreenElement) {
    try { await document.exitFullscreen() } catch (e) {}
  }

  // Resolve essay prompt text
  let essayPromptText = ''
  if (selectedEssayQuestionId.value) {
    const q = questions.value.find(q => q.id === selectedEssayQuestionId.value)
    if (q) essayPromptText = q.question
  }

  const payload = {
    examinee_id: examineeId.value,
    fullname: fullname.value,
    email: email.value,
    contact_number: contactNumber.value,

    // Ensure all keys are strings to match Django's str(question.id) lookup
    submitted_answers: Object.fromEntries(
      Object.entries(answers).map(([k, v]) => [String(k), v])
    ),
    essay_prompt: essayPromptText,
    essay_response: essayResponse.value,
  }

  console.log('Submission payload:', payload)

  const doSubmit = () => $fetch(`${config.public.apiUrl}/api/jurisdoctor/submit/`, {
    method: 'POST',
    body: payload,
  })

  try {
    await doSubmit()
    isExamSubmitted.value = true
    isExamStarted.value = false
    clearSession()
  } catch (firstError) {
    console.warn('First submission attempt failed, retrying in 3s…', firstError)
    console.log('Payload that failed:', payload)
    showToaster('Submission error — retrying in 3 seconds…', 'warning', 3500)
    await new Promise(r => setTimeout(r, 3000))
    try {
      await doSubmit()
      isExamSubmitted.value = true
      isExamStarted.value = false
      clearSession()
    } catch (retryError) {
      console.error('Retry also failed', retryError)
      console.error('Final failed payload:', payload)
      saveSession()
      showToaster(
        '⚠️ Submission failed after retry. Your answers are saved locally. Screenshot this page and contact an admin immediately.',
        'error',
        12000,
      )
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>