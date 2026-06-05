<template>
  <!-- Toast Notification -->
  <div v-if="toaster.show" :class="['fixed top-4 right-4 px-4 py-2 rounded shadow-md text-sm',
    toaster.type === 'success' ? 'bg-green-100 text-green-800' :
    toaster.type === 'error' ? 'bg-red-100 text-red-800' :
    'bg-yellow-100 text-yellow-800']"
    @click="toaster.show = false">
    {{ toaster.message }}
  </div>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans select-none">
  <!-- Loading Modal -->
  <div v-if="isSubmitting" class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg flex items-center gap-4">
      <i class="fas fa-spinner animate-spin text-[#006B3F] text-2xl"></i>
      <span class="text-gray-800 font-medium">Submitting, please wait...</span>
    </div>
  </div>
    
    <!-- 1. START/FORM VIEW -->
    <div v-if="!isExamStarted && !isExamSubmitted" class="flex-grow flex items-center justify-center p-4 py-12">
      <div class="w-11/12 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        <!-- Header Banner -->
        <div class="bg-[#006B3F] text-white p-8 text-center relative">
          <div class="absolute inset-0 bg-black/10"></div>
           <img
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/lsu-corporate-logo-white.png"
          alt="La Salle University"
          class="h-20 mb-4 object-contain justify-center mx-auto"
        />

          <h1 class="text-3xl font-black mt-1 tracking-wide">JURIS DOCTOR ADMISSION TEST</h1>
      
        </div>

        <div class="p-8 space-y-6">
          <!-- Guidelines & Rules -->
          <div class="space-y-4">
            <div class="font-bold text-[#006B3F] text-lg border-b pb-2 flex items-center gap-2 uppercase tracking-wider">
              <i class="fas fa-gavel text-xl"></i> Directions & Guidelines
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
                  <span class="font-bold">Proctoring Rules:</span> During the examination, the use of unauthorized materials, opening other tabs or browser windows, taking screenshots/photos, and right-clicking are strictly prohibited. The system tracks window switches and full screen status. Exceeding 3 tab switches or exiting full screen for more than 10 seconds will trigger automatic submission.
                </div>
              </div>
            </div>
          </div>

          <!-- Examinee Info Form -->
          <div class="border-t pt-6 space-y-4">
            <div class="font-bold text-gray-800 text-base uppercase tracking-wider">
              Examinee Information
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Full Name</label>
                <input 
                  type="text" 
                  v-model="fullname" 
                  placeholder="e.g. John Doe" 
                  required 
                  class="w-full px-4 uppercase py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006B3F] focus:border-transparent text-sm transition" 
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
                <input type="text" :value="examineeId" readonly class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed text-sm transition" />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Contact Number</label>
                <div class="flex items-center">
                  <span class="bg-gray-100 border border-gray-200 rounded-l px-3 py-2.5 text-gray-600">+63</span>
                  <input type="tel" v-model="contactNumber" placeholder="9xx xxx xxxx" minlength="10" maxlength="10" required class="flex-1 px-4 py-3 rounded-r-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006B3F] focus:border-transparent text-sm transition" />
                </div>
              </div>
            </div>
            
<details class="mt-4 text-xs text-gray-500">
  <summary class="font-bold cursor-pointer font-bold text-green-700 uppercase">Data Privacy Notice, Consent, and Confidentiality Disclaimer</summary>
  <div class="mt-2 space-y-2">
    <p class="mb-2"><strong>La Salle University Ozamiz, Inc.</strong> At the Juris Doctor's Office, we are committed to protecting the privacy and security of your personal information. This Privacy Notice explains how we collect, use, disclose, and protect your information when you interact with our office.</p>
<p class="mb-2"><strong>INFORMATION WE COLLECT</strong> We collect various types of personal information necessary for providing our services, including but not limited to:</p>
<ul class="mb-2 list-disc list-inside">
  <li>Contact Information: Name, address, email address, phone number, and other contact details</li>
  <li>Identification Information: Student ID number, government‑issued identification details</li>
  <li>Academic Information: Course enrollment, grades, academic progress, and transcripts</li>
  <li>Co‑curricular Information: Service learnings, outreach activities, Field Trips, Internship or apprenticeship compliance</li>
  <li>Financial Information: Payment details, financial aid information, promissory notes</li>
  <li>Pictures and Videos of activities you participate in, via official documentation of such activities</li>
  <li>Other Information: Any additional information you provide to us in the course of our interactions</li>
</ul>
<p class="mb-2"><strong>HOW WE COLLECT YOUR INFORMATION</strong> We use the information we collect for the following purposes:</p>
<ul class="mb-2 list-disc list-inside">
  <li>Providing Juris Doctor services, including enrollment, course registration, and academic records management</li>
  <li>Communicating with you regarding administrative matters, such as changes to policies or procedures</li>
  <li>Processing financial transactions related to your academic activities</li>
  <li>Analyzing and improving our services, systems, and operations</li>
  <li>Complying with legal obligations and regulatory requirements</li>
  <li>Soliciting your participation in research and non‑commercial surveys sanctioned by the University</li>
  <li>Sharing of grades between academic administrators and offices for evaluation of student performance</li>
</ul>
<p class="mb-2"><strong>DISCLOSURE OF YOUR INFORMATION</strong> We may disclose your personal information in the following circumstances:</p>
<ul class="mb-2 list-disc list-inside">
  <li>To authorized personnel within La Salle University Ozamiz, Inc. who require access to fulfil their duties</li>
  <li>To educational institutions or organizations as required to facilitate academic processes (e.g., transcript requests, enrollment verification)</li>
  <li>To third‑party service providers who assist us in carrying out our functions and services</li>
  <li>When required by law or legal process, such as in response to a subpoena or court order</li>
  <li>In emergencies or situations involving the health or safety of individuals</li>
  <li>To government agencies for legitimate planning purposes directly related to education and student welfare</li>
</ul>
<p class="mb-2"><strong>DATA SECURITY</strong> We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, disclosure, alteration, or destruction.</p>
<p class="mb-2"><strong>CONTACT US</strong> If you have any questions, concerns, or complaints about our Privacy Notice or our handling of your personal information, please contact us at <a href="mailto:dpco@lsu.edu.ph" class="text-[#006B3F] underline">dpco@lsu.edu.ph</a>.</p>
  </div>
</details>
            <p class="text-xs text-gray-600 mt-2"><strong>By proceeding, you agree to the mentioned statements above.</strong></p>
<label class="flex items-center gap-3 cursor-pointer pt-2 select-none">
              <input 
                type="checkbox" 
                v-model="acceptGuidelines"
                class="w-5 h-5 text-[#006B3F] border-gray-300 rounded focus:ring-[#006B3F]"
              />
              <span class="text-xs text-gray-600 font-medium leading-snug">
                I confirm that I have read the directions, agree to the proctoring rules, and am ready to start the exam.
              </span>
            </label>
          </div>

          <!-- Start Button -->
          <button 
            @click="startExam"
            :disabled="!fullname.trim() || !email.trim() || !contactNumber.trim() || !acceptGuidelines || questions.length === 0"
            class="w-full py-4 bg-[#006B3F] hover:bg-green-700 disabled:bg-gray-200 text-white font-bold text-base rounded-xl transition duration-150 uppercase tracking-wider shadow-lg shadow-green-700/20 disabled:shadow-none disabled:cursor-not-allowed"
          >
            <span v-if="questions.length === 0"><i class="fas fa-spinner animate-spin mr-2"></i>Loading questions...</span>
            <span v-else><i class="fas fa-expand mr-2"></i>Start Examination & Enter Fullscreen</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 2. ACTIVE EXAM VIEW -->
    <div v-if="isExamStarted && !isExamSubmitted" class="flex-grow flex flex-col">
      <!-- Sticky Proctoring Bar & Timer -->
      <div class="bg-[#006B3F] text-white px-6 py-4 shadow-md flex flex-wrap gap-4 justify-between items-center sticky top-0 z-40">
        <div class="flex items-center gap-4">
          <div>
            <h1 class="text-lg font-black uppercase tracking-wider">LSU Juris Doctor Admission Test</h1>
            <p class="text-xs text-green-200">Examinee: <span class="font-bold text-white uppercase">{{ fullname }}</span></p>
          </div>
          <span class="hidden md:inline px-3 py-1 bg-black/20 text-green-300 font-bold rounded-full text-xs flex items-center gap-1.5 border border-green-800">
            <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> Proctoring Active
          </span>
        </div>

        <div class="flex items-center gap-4">
   
          <!-- Timer -->
          <div 
            class="px-4 py-1.5 rounded-lg font-mono text-lg font-black flex items-center gap-2"
            :class="timeLeft < 600 ? 'bg-red-700 text-white animate-pulse border border-red-500' : 'bg-black/20 text-white border border-green-700'"
          >
            <i class="fas fa-clock"></i> {{ formatTime(timeLeft) }}
          </div>
        </div>
      </div>

      <!-- Time remaining warning banner -->
      <div v-if="timeLeft < 600" class="bg-red-100 border-b border-red-200 text-red-800 text-center font-bold py-2 text-xs uppercase tracking-wide flex items-center justify-center gap-2">
        <i class="fas fa-triangle-exclamation text-red-600 animate-bounce"></i> Attention: Under 10 minutes left remaining. Please finalize your choices and write-ups immediately!
      </div>

      <!-- Main Layout -->
      <div class="flex-grow flex flex-col md:flex-row relative">
        <!-- Sidebar Navigation (Categories list) -->
        <aside class="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col shrink-0">
          <div class="p-4 border-b border-gray-100 bg-gray-50/50">
            <span class="text-xs font-extrabold uppercase tracking-widest text-gray-400">Exam Sections</span>
            <!-- Progress Bar -->
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
                :class="activeCategory === cat 
                  ? 'bg-green-800/60 text-green-100' 
                  : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'"
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
            <div class="bg-gradient-to-r from-[#006B3F]/5 to-transparent border-b border-gray-100 px-6 md:px-8 py-5">
              <span class="text-[10px] font-extrabold tracking-widest text-[#006B3F] uppercase bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                ● Active Section
              </span>
              <h2 class="text-lg md:text-xl font-black text-gray-800 mt-2 tracking-wide leading-tight">
                {{ activeCategory }}
              </h2>
            </div>

            <div class="p-6 md:p-8">

            <!-- 2.1 ESSAY SECTION (Part 6) -->
            <div v-if="activeCategory === 'Part 6. Essay Questions & Legal Analysis' || activeQuestions.some(q => q.is_essay)" class="space-y-6">
              <div class="bg-amber-50 border border-amber-200 rounded-xl p-5 text-gray-700 text-sm leading-relaxed space-y-2">
                <h3 class="font-bold text-amber-800 flex items-center gap-2">
                  <i class="fas fa-file-signature text-amber-600 text-base"></i> Essay Guidelines
                </h3>
                <p>Please select one of the legal analysis essay prompts below to answer. Construct a well-reasoned essay addressing all issues presented. You can only choose and respond to <strong>one</strong> prompt.</p>
              </div>

              <!-- Essay Prompts Selection -->
              <div class="space-y-4 mt-6">
                <div class="font-bold text-gray-700 text-xs uppercase tracking-widest">Select your essay prompt:</div>
                <div v-if="showGuidelines" class="space-y-4">
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
              </div>

              <!-- Essay Response Input -->
              <div class="space-y-2 mt-6">
                <div class="flex items-center justify-between">
                  <label class="font-bold text-gray-700 text-xs uppercase tracking-widest">Your Response:</label>
                  <span class="text-xs text-gray-500 font-bold bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                    <i class="fas fa-font mr-1"></i> {{ essayResponse.trim() ? essayResponse.trim().split(/\s+/).filter(w => w).length : 0 }} words
                  </span>
                </div>
                <textarea 
                  v-model="essayResponse"
                  rows="15" 
                  placeholder="Type your essay response here. Be critical, structured, and logical..."
                  class="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006B3F] focus:border-transparent text-sm leading-relaxed transition font-serif resize-y bg-gray-50"
                ></textarea>
              </div>
            </div>

            <!-- 2.2 MULTIPLE CHOICE QUESTIONS (Parts 1-5) -->
            <div v-else class="space-y-10">
              <div 
                v-for="(question, index) in activeQuestions" 
                :key="question.id"
                class="pb-10 border-b border-gray-100 last:border-0 last:pb-0"
              >
                <!-- Passage (if applicable) -->
                <div v-if="question.passage" class="bg-gray-50 border-l-4 border-[#006B3F] rounded-r-xl p-5 mb-6 font-serif text-gray-700 leading-relaxed italic text-sm">
                  <div class="font-bold text-xs uppercase tracking-wider text-[#006B3F] not-italic mb-2 flex items-center gap-1.5 font-sans">
                    <i class="fas fa-book-open"></i> Reading Passage
                  </div>
                  {{ question.passage }}
                </div>

                <!-- Question Number + Text -->
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

                <!-- Options Grid -->
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
            </div>

            <!-- Form Nav Controls -->
            <div class="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
              <!-- Confirmation Modal -->
              <div v-if="showConfirmSubmit" class="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
                <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
                  <h2 class="text-lg font-bold text-gray-800 mb-4">Confirm Submission</h2>
                  <p class="text-gray-700 mb-6">Are you sure you want to submit your answers? You can review them before finalizing.</p>
                  <div class="flex justify-end gap-3">
                    <button @click="showConfirmSubmit = false" class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Back</button>
                    <button @click="submitExam(false)" class="px-4 py-2 rounded-lg bg-[#006B3F] hover:bg-green-700 text-white">Submit</button>
                  </div>
                </div>
              </div>
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

            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- 3. POST-SUBMISSION / SUCCESS VIEW -->
    <div v-if="isExamSubmitted" class="flex-grow flex items-center justify-center p-4 py-12">
      <div class="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden text-center p-8 md:p-12 border border-gray-100 space-y-6">
        <div class="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-[#006B3F] border-2 border-green-200">
          <i class="fas fa-check text-4xl animate-bounce"></i>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-extrabold uppercase tracking-widest text-gray-400">Submission Confirmed</p>
          <h1 class="text-3xl font-black text-gray-800">Congratulations, <span class="capitalize">{{ fullname }}</span>!</h1>
          <p class="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
            You have successfully completed and submitted!
          </p>
          <p class="font-bold">La Salle University Juris Doctor Admission Test</p>

        </div>

        <div>
          <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/lsu-corporate-logo-green.png" class="w-32 mx-auto"/>
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
          Your final results and passing status are currently pending the grading of the Legal Essay section by the admissions committee. You will receive an official notification email once your exam is fully graded.
        </div>

        <div class="pt-4 border-t">
          <button 
            @click="resetTestState"
            class="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>

    <!-- 4. WARNING MODALS (PROCTORING OVERLAYS) -->
    
    <!-- Tab Switches Warning Modal -->
    <div 
      v-if="showTabWarning && isExamStarted" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div class="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-md w-full border-t-8 border-yellow-500 text-center space-y-5">
        <div class="w-14 h-14 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mx-auto border border-yellow-100">
          <i class="fas fa-triangle-exclamation text-2xl"></i>
        </div>
        <div class="space-y-2">
          <h2 class="text-xl font-extrabold text-gray-900">Security Warning: Tab Switch Detected</h2>
          <p class="text-sm text-gray-600 leading-relaxed">
            Leaving the exam window or switching tabs is strictly prohibited. Your actions are being logged.
          </p>
        </div>
        <div class="bg-yellow-50 text-yellow-800 text-xs font-extrabold py-3 px-4 rounded-lg">
          Active Warnings: {{ tabSwitchWarnings }} of 3 Allowed
        </div>
        <p class="text-[11px] text-red-600 leading-snug">
          If you exceed 3 tab switches/focus losses, your exam session will be terminated and automatically submitted as is.
        </p>
        <button 
          @click="closeTabWarning"
          class="w-full py-3 bg-[#006B3F] hover:bg-green-700 text-white font-bold text-xs rounded-lg transition uppercase tracking-wider"
        >
          I Understand & Resume Exam
        </button>
      </div>
    </div>

    <!-- Fullscreen Warning Modal -->
    <div 
      v-if="showFullscreenWarning && isExamStarted" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
    >
      <div class="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-md w-full border-t-8 border-red-600 text-center space-y-5 animate-pulse">
        <div class="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
          <i class="fas fa-maximize text-2xl"></i>
        </div>
        <div class="space-y-2">
          <h2 class="text-xl font-extrabold text-gray-900">Security Alert: Full Screen Exited</h2>
          <p class="text-sm text-gray-600 leading-relaxed">
            You must remain in fullscreen mode for the duration of the Juris Doctor Admission Test.
          </p>
        </div>
        <div class="bg-red-50 text-red-800 text-xs font-extrabold py-3.5 px-4 rounded-lg">
          Auto-submitting exam in: <span class="font-mono text-base font-black text-red-700">{{ fullscreenWarningCountdown }}s</span>
        </div>
        <button 
          @click="forceReEnterFullscreen"
          class="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-lg transition uppercase tracking-widest shadow-lg shadow-red-600/20"
        >
          Re-enter Full Screen Mode
        </button>
      </div>
    </div>
    <!-- (Omitted content for brevity as per instructions) -->

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'

  // Toast state and helper
  const toaster = ref({ message: '', type: 'warning', show: false })
  const showToaster = (message, type = 'warning', duration = 3000) => {
    toaster.value = { message, type, show: true }
    setTimeout(() => {
      toaster.value.show = false
    }, duration)
  }

const config = useRuntimeConfig()

// State variables
const isExamStarted = ref(false)
const isExamSubmitted = ref(false)
const submitReason = ref('manual') // 'manual', 'timer', 'violation'
const isSubmitting = ref(false)

// Confirmation dialog visibility
const showConfirmSubmit = ref(false)
const showGuidelines = ref(true)

const fullname = ref('')
const email = ref('')
const acceptGuidelines = ref(false)

const questions = ref([])
const answers = reactive({})
const essayResponse = ref('')
const selectedEssayQuestionId = ref(null)
const examineeId = ref('JDE'+Date.now())
const contactNumber = ref('')

const activeCategory = ref('')
const timer = ref(null)
const timeLeft = ref(14400) // 4 hours in seconds (14,400s)

const tabSwitchWarnings = ref(0)
const showTabWarning = ref(false)

const showFullscreenWarning = ref(false)
const fullscreenWarningCountdown = ref(10)
const fullscreenWarningTimer = ref(null)

// Format helper for timer
const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// Group categories dynamically in order returned by API
const categories = computed(() => {
  const list = []
  questions.value.forEach(q => {
    const cat = q.category || "Uncategorized"
    if (!list.includes(cat)) {
      list.push(cat)
    }
  })
  return list
})

// Questions belonging to the active category
const activeQuestions = computed(() => {
  return questions.value.filter(q => q.category === activeCategory.value)
})

// Progress metrics count
const answersCount = computed(() => {
  const mcCount = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== '').length
  const essayCount = essayResponse.value.trim().length > 0 ? 1 : 0
  return mcCount + essayCount
})

const getCategoryProgress = (cat) => {
  const catQs = questions.value.filter(q => q.category === cat)
  if (cat === 'Part 6. Essay Questions & Legal Analysis' || catQs.some(q => q.is_essay)) {
    return {
      answered: essayResponse.value.trim().length > 0 ? 1 : 0,
      total: 1
    }
  }
  const answered = catQs.filter(q => answers[q.id] !== undefined && answers[q.id] !== '').length
  return {
    answered,
    total: catQs.length
  }
}

// Fetch questions on mount
onMounted(async () => {
  try {
    const res = await $fetch(`${config.public.apiUrl}/api/jurisdoctor/questions/1/`)
    questions.value = res || []
    if (categories.value.length > 0) {
      activeCategory.value = categories.value[0]
    }
  } catch (error) {
    console.error("Failed to load questions", error)
  }
})

// Initialize examination & fullscreen
const startExam = async () => {
   if (!fullname.value.trim() || !email.value.trim() || !contactNumber.value.trim()) {
     showToaster("Please fill in your Full Name, Email Address, and Contact Number.", "warning")
     return
   }
   if (!acceptGuidelines.value) {
     showToaster("Please review and accept the examination proctoring guidelines.", "warning")
     return
   }
   // Reset confirmation dialog just in case
   showConfirmSubmit.value = false
   // Ensure guidelines are shown when exam starts
   showGuidelines.value = true

  isExamStarted.value = true
  examineeId.value = 'JDE' + Date.now()
  isExamSubmitted.value = false
  submitReason.value = 'manual'
  timeLeft.value = 14400
  tabSwitchWarnings.value = 0
  showTabWarning.value = false
  showFullscreenWarning.value = false

  // Trigger fullscreen mode
  try {
    await enterFullscreen()
  } catch (e) {
    console.warn("Fullscreen mode request rejected", e)
  }

  // Pre-select first essay question if available
  const essayQs = questions.value.filter(q => q.is_essay)
  if (essayQs.length > 0 && !selectedEssayQuestionId.value) {
    selectedEssayQuestionId.value = essayQs[0].id
  }

  // Start countdown timer
  if (timer.value) clearInterval(timer.value)
  timer.value = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      submitReason.value = 'timer'
      submitExam(true)
    }
  }, 1000)

  // Start Proctoring listeners
  startProctoring()
}

const enterFullscreen = async () => {
  const elem = document.documentElement
  if (elem.requestFullscreen) {
    await elem.requestFullscreen()
  } else if (elem.webkitRequestFullscreen) {
    await elem.webkitRequestFullscreen()
  } else if (elem.msRequestFullscreen) {
    await elem.msRequestFullscreen()
  }
}

// Proctoring event handlers
const handleFullscreenChange = () => {
  if (!isExamStarted.value || isExamSubmitted.value) return

  const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement
  
  if (!isFullscreen) {
    // Escaped fullscreen mode - trigger alert and countdown
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
    // Re-entered successfully - cancel warnings
    showFullscreenWarning.value = false
    if (fullscreenWarningTimer.value) {
      clearInterval(fullscreenWarningTimer.value)
      fullscreenWarningTimer.value = null
    }
  }
}

const handleTabSwitch = () => {
  if (!isExamStarted.value || isExamSubmitted.value) return

  if (document.hidden || document.visibilityState === 'hidden') {
    tabSwitchWarnings.value++
    showTabWarning.value = true
    if (tabSwitchWarnings.value > 3) {
      showTabWarning.value = false
      submitReason.value = 'violation'
      submitExam(true)
    }
  }
}

const handleWindowBlur = () => {
  if (!isExamStarted.value || isExamSubmitted.value) return
  
  // Triggers warning on focus loss
  tabSwitchWarnings.value++
  showTabWarning.value = true
  if (tabSwitchWarnings.value > 3) {
    showTabWarning.value = false
    submitReason.value = 'violation'
    submitExam(true)
  }
}

// Proctoring prevention controls
const handleKeydown = (e) => {
  if (!isExamStarted.value || isExamSubmitted.value) return

  // Block F11 and Esc from native default triggers where possible
  if (e.key === 'F11' || e.keyCode === 122) {
    e.preventDefault()
  }
  if (e.key === 'Escape' || e.keyCode === 27) {
    e.preventDefault()
  }
}

const handleContextMenu = (e) => {
  if (!isExamStarted.value || isExamSubmitted.value) return
  e.preventDefault()
}

const beforeUnloadHandler = (e) => {
  if (isExamStarted.value && !isExamSubmitted.value) {
    const msg = "You are currently taking the examination. Reloading or leaving will submit your test immediately."
    e.returnValue = msg
    return msg
  }
}

const startProctoring = () => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('mozfullscreenchange', handleFullscreenChange)
  document.addEventListener('MSFullscreenChange', handleFullscreenChange)
  document.addEventListener('visibilitychange', handleTabSwitch)
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
  document.removeEventListener('visibilitychange', handleTabSwitch)
  window.removeEventListener('blur', handleWindowBlur)
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('contextmenu', handleContextMenu)
  window.removeEventListener('beforeunload', beforeUnloadHandler)
}

const forceReEnterFullscreen = async () => {
  try {
    await enterFullscreen()
  } catch (e) {
    console.warn("Could not force fullscreen re-entry", e)
  }
}

const closeTabWarning = () => {
  showTabWarning.value = false
}

// Nav actions
const selectCategory = (cat) => {
  activeCategory.value = cat
}

const prevCategory = () => {
  const idx = categories.value.indexOf(activeCategory.value)
  if (idx > 0) {
    activeCategory.value = categories.value[idx - 1]
  }
}

const nextCategory = () => {
  const idx = categories.value.indexOf(activeCategory.value)
  if (idx < categories.value.length - 1) {
    activeCategory.value = categories.value[idx + 1]
  }
}

const isLastCategory = computed(() => {
  if (categories.value.length === 0) return true
  return categories.value.indexOf(activeCategory.value) === categories.value.length - 1
})

const resetTestState = () => {
  isExamSubmitted.value = false
  isExamStarted.value = false
  fullname.value = ''
  email.value = ''
  acceptGuidelines.value = false
  Object.keys(answers).forEach(key => delete answers[key])
  essayResponse.value = ''
  selectedEssayQuestionId.value = null
  // Hide guidelines when returning home
  showGuidelines.value = false
  if (categories.value.length > 0) {
    activeCategory.value = categories.value[0]
  }
}

// Submit examination results
const submitExam = async (autoSubmit = false) => {
  if (showConfirmSubmit.value) {
    showConfirmSubmit.value = false;
  }
  // Existing loading state activation
  isSubmitting.value = true

  // Clear timers & proctoring
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  if (fullscreenWarningTimer.value) {
    clearInterval(fullscreenWarningTimer.value)
    fullscreenWarningTimer.value = null
  }

  stopProctoring()

  // Exit fullscreen securely
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    try {
      await document.exitFullscreen()
    } catch (e) {
      console.warn("Error exiting fullscreen: ", e)
    }
  }

  let essayPromptText = ''
  if (selectedEssayQuestionId.value) {
    const q = questions.value.find(q => q.id === selectedEssayQuestionId.value)
    if (q) {
      essayPromptText = q.question
    }
  }

  try {
    const payload = {
      exam_id: 1,
      fullname: fullname.value,
      email: email.value,
      answers: { ...answers },
      essay_prompt: essayPromptText,
      essay_response: essayResponse.value
    }

    await $fetch(`${config.public.apiUrl}/api/jurisdoctor/submit/`, {
      method: 'POST',
      body: payload
    })

    isExamSubmitted.value = true
    isExamStarted.value = false
  } catch (error) {
    console.error("Submission failed", error)
    showToaster("Error occurred during submission. Your session status is saved on the server. Please contact an admin.", "error")
  } finally {
    // Reset loading state after submission completes (success or error)
    isSubmitting.value = false
  }
}

onBeforeUnmount(() => {
  stopProctoring()
  if (timer.value) clearInterval(timer.value)
  if (fullscreenWarningTimer.value) clearInterval(fullscreenWarningTimer.value)
})
</script>