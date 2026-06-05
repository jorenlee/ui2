<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
    
    <div class="max-w-6xl mx-auto space-y-8">
      
      <!-- Top Title Bar -->
      <div class="bg-[#006B3F] text-white p-8 rounded-2xl shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="absolute inset-0 bg-black/10"></div>
        <div class="relative z-10">
          <h1 class="text-3xl font-black tracking-wide uppercase">Juris Doctor Admin Dashboard</h1>
          <p class="mt-1.5 opacity-90 text-sm text-green-100">Configure questionnaires, review legal essays, and send score notifications.</p>
        </div>
      </div>

      <!-- Quick Stats / Tabs Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-green-50 text-[#006B3F] flex items-center justify-center text-xl shrink-0"><i class="fas fa-file-csv"></i></div>
          <div>
            <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Questions</div>
            <div class="text-2xl font-black text-gray-800">{{ questions.length }}</div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0"><i class="fas fa-users"></i></div>
          <div>
            <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Exam Attempts</div>
            <div class="text-2xl font-black text-gray-800">{{ attempts.length }}</div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center text-xl shrink-0"><i class="fas fa-hourglass-half"></i></div>
          <div>
            <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Essay Review</div>
            <div class="text-2xl font-black text-gray-800">{{ pendingAttemptsCount }}</div>
          </div>
        </div>
      </div>

      <!-- Left-Right Main Columns -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left Side: Upload Panel -->
        <div class="lg:col-span-1 space-y-8">
          <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <!-- Header -->
            <h2 class="text-lg font-extrabold text-gray-800 uppercase tracking-wider pb-3 border-b border-gray-100 flex items-center gap-2">
              <i class="fas fa-cloud-arrow-up" :class="themeClasses.text"></i> Upload Questionnaire
            </h2>
            
            <!-- Type Selector Tabs -->
            <div class="space-y-2">
              <span class="block text-xs font-bold text-gray-500 uppercase tracking-wider">Select Upload Type</span>
              <div class="grid grid-cols-3 gap-2">
                <button 
                  @click="setUploadType('csv')"
                  type="button"
                  :class="uploadType === 'csv' ? 'border-[#006B3F] bg-green-50 text-[#006B3F]' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'"
                  class="py-2.5 px-2 border-2 rounded-xl text-xs font-extrabold transition text-center flex flex-col items-center gap-1.5 justify-center shadow-sm"
                >
                  <i class="fas fa-file-csv text-lg"></i>
                  <span>.CSV</span>
                  <span class="text-[9px] font-bold opacity-70 uppercase tracking-tight">Technical</span>
                </button>
                <button 
                  @click="setUploadType('docx')"
                  type="button"
                  :class="uploadType === 'docx' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'"
                  class="py-2.5 px-2 border-2 rounded-xl text-xs font-extrabold transition text-center flex flex-col items-center gap-1.5 justify-center shadow-sm"
                >
                  <i class="fas fa-file-word text-lg"></i>
                  <span>.DOCX</span>
                  <span class="text-[9px] font-bold opacity-70 uppercase tracking-tight">Non-Tech</span>
                </button>
                <button 
                  @click="setUploadType('pdf')"
                  type="button"
                  :class="uploadType === 'pdf' ? 'border-red-600 bg-red-50 text-red-600' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'"
                  class="py-2.5 px-2 border-2 rounded-xl text-xs font-extrabold transition text-center flex flex-col items-center gap-1.5 justify-center shadow-sm"
                >
                  <i class="fas fa-file-pdf text-lg"></i>
                  <span>.PDF</span>
                  <span class="text-[9px] font-bold opacity-70 uppercase tracking-tight">Non-Tech</span>
                </button>
              </div>
            </div>

            <!-- Upload input and button -->
            <div class="space-y-4 pt-2 border-t border-gray-50">
              <label class="block">
                <span class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Select {{ uploadType.toUpperCase() }} file
                </span>
                <input
                  type="file"
                  :accept="fileAccept"
                  @change="onFileChange"
                  :class="themeClasses.fileBtn"
                  class="block w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold cursor-pointer border border-gray-100 rounded-xl bg-gray-50/50 p-2"
                />
              </label>

              <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-lg leading-snug">
                {{ errorMessage }}
              </div>
              <div v-if="successMessage" class="p-3 bg-green-50 border border-green-100 text-green-700 text-xs font-bold rounded-lg leading-snug">
                {{ successMessage }}
              </div>

              <button
                @click="uploadCSV"
                :disabled="uploading || !selectedFile"
                :class="[themeClasses.bg, themeClasses.hoverBg, themeClasses.shadow]"
                class="w-full py-3 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition duration-150 shadow-md disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
              >
                <i v-if="uploading" class="fas fa-spinner animate-spin mr-2"></i>
                <span>{{ uploading ? 'Uploading...' : `Upload ${uploadType.toUpperCase()}` }}</span>
              </button>
            </div>
          </div>



        </div><!-- end left col -->

        <!-- Right Side: Examinees Attempts Table -->
        <div class="lg:col-span-2 space-y-8">
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 class="text-lg font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                <i class="fas fa-user-graduate text-blue-600"></i> Examinees Results & Grading
              </h2>
              <button 
                @click="fetchAttempts" 
                :disabled="loadingAttempts"
                class="text-xs font-extrabold text-blue-600 hover:text-blue-800 hover:underline disabled:opacity-50"
              >
                <i class="fas fa-sync-alt mr-1"></i> Refresh
              </button>
            </div>

            <!-- Loader / Empty States -->
            <div v-if="loadingAttempts" class="p-12 text-center text-gray-400 font-bold text-sm">
              <i class="fas fa-circle-notch animate-spin mr-2 text-xl text-blue-500"></i> Loading attempts...
            </div>
            <div v-else-if="attempts.length === 0" class="p-12 text-center text-gray-400 font-semibold text-sm">
              No exam submissions recorded yet.
            </div>

            <!-- Table content -->
            <div v-else class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th class="p-4 pl-6">Examinee</th>
                    <th class="p-4">MCQ Score</th>
                    <th class="p-4">Essay Score</th>
                    <th class="p-4">Status</th>
                    <th class="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 text-sm text-gray-600">
                  <tr v-for="attempt in attempts" :key="attempt.id" class="hover:bg-gray-50/50 transition">
                    <td class="p-4 pl-6">
                      <div class="font-extrabold text-gray-800">{{ attempt.fullname }}</div>
                      <div class="text-[11px] text-gray-400 font-medium">{{ attempt.email }}</div>
                      <div class="text-[10px] text-gray-400 font-medium mt-0.5">Taken: {{ formatDate(attempt.created_at) }}</div>
                    </td>
                    <td class="p-4">
                      <div class="font-bold text-gray-800">{{ attempt.score }} / {{ attempt.total_questions }}</div>
                      <div class="text-[11px] font-medium mt-0.5" :class="attempt.percentage >= 75 ? 'text-green-600' : 'text-red-500'">
                        {{ attempt.percentage }}% ({{ attempt.percentage >= 75 ? 'Pass' : 'Fail' }})
                      </div>
                    </td>
                    <td class="p-4">
                      <div class="font-bold text-gray-800">
                        {{ attempt.essay_score }} / 100
                      </div>
                    </td>
                    <td class="p-4">
                      <span 
                        class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        :class="attempt.score_notified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'"
                      >
                        {{ attempt.score_notified ? 'Notified' : 'Pending' }}
                      </span>
                    </td>
                    <td class="p-4 pr-6 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button 
                          @click="openGradeModal(attempt)"
                          class="px-3 py-1.5 rounded-lg border text-xs font-bold transition shadow-sm"
                          :class="attempt.score_notified 
                            ? 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600' 
                            : 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white'"
                        >
                          {{ attempt.score_notified ? 'View Detail' : 'Grade Essay' }}
                        </button>
                        <button 
                          @click="deleteAttempt(attempt.id, attempt.fullname)"
                          type="button"
                          class="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-800 transition shadow-sm flex items-center justify-center shrink-0"
                          title="Delete Attempt"
                        >
                          <i class="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>


                <!-- Manual Add Question Panel -->
          <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            <!-- Header with toggle -->
            <div class="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 class="text-lg font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <i class="fas fa-plus-circle text-[#006B3F]"></i> Add Question
            </h2>
            <button
              @click="showAddForm = !showAddForm"
              type="button"
              class="text-xs font-bold px-3 py-1.5 rounded-lg border transition"
              :class="showAddForm ? 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200' : 'bg-[#006B3F] border-[#006B3F] text-white hover:bg-green-700'"
            >
              {{ showAddForm ? 'Hide Form' : 'Show Form' }}
            </button>
          </div>

          <div v-if="showAddForm" class="space-y-4">

            <!-- Category -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
              <select
                v-model="newQuestion.category"
                class="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#006B3F] bg-gray-50"
              >
                <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>

            <!-- Is Essay Toggle -->
            <div class="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
              <input
                type="checkbox"
                id="isEssayCheck"
                v-model="newQuestion.is_essay"
                class="w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <label for="isEssayCheck" class="text-sm font-bold text-blue-800 cursor-pointer select-none">
                <i class="fas fa-pen-nib mr-1"></i> Is Essay Question
              </label>
            </div>

            <!-- Passage -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Passage <span class="normal-case font-medium text-gray-400">(optional)</span></label>
              <textarea
                v-model="newQuestion.passage"
                rows="3"
                placeholder="Enter reading passage if applicable..."
                class="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#006B3F] bg-gray-50 resize-y"
              ></textarea>
            </div>

            <!-- Question Text -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Question <span class="text-red-500">*</span></label>
              <textarea
                v-model="newQuestion.question"
                rows="3"
                placeholder="Enter the question text..."
                class="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#006B3F] bg-gray-50 resize-y"
              ></textarea>
            </div>

            <!-- MCQ Fields (hidden when essay) -->
            <div v-if="!newQuestion.is_essay" class="space-y-3 pt-1">
              <p class="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest border-b pb-1">Multiple Choice Options</p>

              <!-- Correct Answer -->
              <div>
                <label class="block text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Correct Answer <span class="text-red-500">*</span></label>
                <input
                  type="text"
                  v-model="newQuestion.correct_answer"
                  placeholder="Type the correct answer..."
                  class="w-full px-3 py-2.5 rounded-xl border-2 border-green-400 bg-green-50 text-sm text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <!-- Option 1 -->
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Option 1</label>
                <input
                  type="text"
                  v-model="newQuestion.option_1"
                  placeholder="Enter option 1..."
                  class="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#006B3F]"
                />
              </div>

              <!-- Option 2 -->
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Option 2</label>
                <input
                  type="text"
                  v-model="newQuestion.option_2"
                  placeholder="Enter option 2..."
                  class="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#006B3F]"
                />
              </div>

              <!-- Option 3 -->
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Option 3</label>
                <input
                  type="text"
                  v-model="newQuestion.option_3"
                  placeholder="Enter option 3..."
                  class="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#006B3F]"
                />
              </div>
            </div>

            <!-- Add Form Alerts -->
            <div v-if="addQuestionError" class="p-3 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-lg">
              {{ addQuestionError }}
            </div>
            <div v-if="addQuestionSuccess" class="p-3 bg-green-50 border border-green-100 text-green-700 text-xs font-bold rounded-lg">
              {{ addQuestionSuccess }}
            </div>

            <!-- Submit Button -->
            <button
              @click="submitNewQuestion"
              :disabled="addingQuestion"
              class="w-full py-3 bg-[#006B3F] hover:bg-green-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md"
            >
              <i v-if="addingQuestion" class="fas fa-spinner animate-spin mr-2"></i>
              {{ addingQuestion ? 'Saving...' : 'Save Question' }}
            </button>

          </div>
        </div>

      <!-- Questionnaires List Section -->
      <div class="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm mt-8">
        <h2 class="text-lg font-extrabold text-gray-800 uppercase tracking-wider mb-6 flex items-center justify-between border-b pb-4">
          <span>Uploaded Questionnaire ({{ questions.length }} items)</span>
          <div class="flex items-center gap-4">
            <button 
              v-if="questions.length > 0"
              @click="clearAllQuestions"
              type="button"
              class="text-xs font-extrabold text-red-600 hover:text-red-800 hover:underline flex items-center gap-1"
            >
              <i class="fas fa-trash-alt"></i> Clear All
            </button>
            <button 
              @click="fetchQuestions" 
              :disabled="loadingQuestions"
              class="text-xs font-extrabold text-[#006B3F] hover:text-green-800 hover:underline flex items-center gap-1 disabled:opacity-50"
            >
              <i class="fas fa-sync-alt mr-1"></i> Refresh
            </button>
          </div>
        </h2>

        <div v-if="loadingQuestions" class="text-center py-12 text-gray-400 font-bold text-sm">
          <i class="fas fa-spinner animate-spin mr-2 text-lg"></i> Loading questionnaires...
        </div>

        <div v-else-if="questions.length === 0" class="text-center py-12 text-gray-400 font-semibold text-sm">
          No questions uploaded yet. Upload a CSV file using the left panel.
        </div>

        <!-- Questions Scrollable Container -->
        <div v-else class="space-y-6 max-h-[700px] overflow-y-auto pr-2">
          <div 
            v-for="(q, idx) in questions" 
            :key="q.id" 
            class="p-5 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-sm transition duration-200 space-y-4"
          >
            <!-- Question Heading -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="bg-[#006B3F]/10 text-[#006B3F] text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  Item {{ idx + 1 }}
                </span>
                <span class="text-xs font-extrabold text-gray-400 uppercase tracking-widest truncate max-w-xs md:max-w-sm">
                  {{ q.category || 'Part 1. Verbal Ability' }}
                </span>
                <span v-if="q.is_essay" class="bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                  Essay
                </span>
                <button 
                  @click="deleteQuestion(q.id, idx + 1)"
                  type="button"
                  class="ml-auto text-gray-400 hover:text-red-600 transition text-xs"
                  title="Delete Question"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
              <h3 class=" text-gray-800 text-sm md:text-base leading-relaxed pl-1">
                {{ q.question }}
              </h3>
            </div>

            <!-- Passage (if present) -->
            <div v-if="q.passage" class="bg-gray-50 border border-gray-100 rounded-lg p-4 font-serif text-xs text-gray-600 leading-relaxed italic border-l-4 border-emerald-600">
              {{ q.passage }}
            </div>

            <!-- Options Grid (Only for multiple choice, i.e., NOT essay questions) -->
            <div v-if="!q.is_essay" class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pl-1">
              
              <!-- Correct Answer option block -->
              <div 
                @click="setCorrectAnswer(q.id, q.correct_answer)"
                class="flex items-center gap-3 p-3.5 rounded-xl border-2 border-green-500 bg-green-50/50 cursor-pointer hover:bg-green-100/30 transition select-none"
              >
                <div class="w-4 h-4 rounded-full border-2 border-[#006B3F] flex items-center justify-center bg-[#006B3F] shrink-0">
                  <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
                <div class="flex flex-col">
                  <span class="text-[9px] font-black text-green-700 uppercase tracking-wider">Correct Answer (Click to Set):</span>
                  <span class="text-green-900 mt-0.5 text-sm">{{ q.correct_answer }}</span>
                </div>
              </div>

              <!-- Option 1 block -->
              <div 
                @click="setCorrectAnswer(q.id, q.option_1)"
                class="flex items-center gap-3 p-3.5 rounded-xl border-2 border-gray-200 bg-gray-50/50 cursor-pointer hover:bg-green-50/20 hover:border-green-300 transition select-none"
              >
                <div class="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center bg-white shrink-0"></div>
                <div class="flex flex-col">
                  <span class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Option 1:</span>
                  <span class="text-gray-700 font-semibold mt-0.5">{{ q.option_1 }}</span>
                </div>
              </div>

              <!-- Option 2 block -->
              <div 
                @click="setCorrectAnswer(q.id, q.option_2)"
                class="flex items-center gap-3 p-3.5 rounded-xl border-2 border-gray-200 bg-gray-50/50 cursor-pointer hover:bg-green-50/20 hover:border-green-300 transition select-none"
              >
                <div class="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center bg-white shrink-0"></div>
                <div class="flex flex-col">
                  <span class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Option 2:</span>
                  <span class="text-gray-700 font-semibold mt-0.5">{{ q.option_2 }}</span>
                </div>
              </div>

              <!-- Option 3 block -->
              <div 
                @click="setCorrectAnswer(q.id, q.option_3)"
                class="flex items-center gap-3 p-3.5 rounded-xl border-2 border-gray-200 bg-gray-50/50 cursor-pointer hover:bg-green-50/20 hover:border-green-300 transition select-none"
              >
                <div class="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center bg-white shrink-0"></div>
                <div class="flex flex-col">
                  <span class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Option 3:</span>
                  <span class="text-gray-700 font-semibold mt-0.5">{{ q.option_3 }}</span>
                </div>
              </div>

            </div>

            <!-- Essay Message for essay prompt -->
            <div v-else class="text-xs text-gray-500 font-bold bg-blue-50/60 p-3 rounded-lg border border-blue-100 flex items-center gap-2 pl-4">
              <i class="fas fa-info-circle text-blue-500"></i> Essay Prompt: No fixed options. Graded manually by examiner.
            </div>

          </div>
        </div>
      </div>

    </div>

    <!-- ESSAY GRADING MODAL -->
    <div 
      v-if="showGradeModal" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-2xl w-full border-t-8 border-blue-600 space-y-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b pb-3">
          <h2 class="text-xl font-extrabold text-gray-900 uppercase tracking-wider">
            Review & Grade Essay
          </h2>
          <button @click="closeGradeModal" class="text-gray-400 hover:text-gray-600 text-lg">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div v-if="selectedAttempt" class="space-y-5">
          <!-- Candidate Metadata -->
          <div class="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-xs border border-gray-100">
            <div>
              <span class="text-gray-400 font-bold uppercase tracking-wider block">Candidate Name</span>
              <span class="font-extrabold text-gray-800 text-sm mt-0.5 block">{{ selectedAttempt.fullname }}</span>
            </div>
            <div>
              <span class="text-gray-400 font-bold uppercase tracking-wider block">Email Address</span>
              <span class="font-extrabold text-gray-800 text-sm mt-0.5 block">{{ selectedAttempt.email }}</span>
            </div>
            <div class="col-span-2 border-t pt-2 mt-2">
              <span class="text-gray-400 font-bold uppercase tracking-wider block">Multiple Choice Score</span>
              <span class="font-extrabold text-green-700 text-sm mt-0.5 block">
                {{ selectedAttempt.score }} / {{ selectedAttempt.total_questions }} ({{ selectedAttempt.percentage }}%)
              </span>
            </div>
          </div>

          <!-- Essay Question Prompt -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Selected Essay Prompt:</label>
            <div class="text-sm font-bold text-gray-800 bg-blue-50/50 p-3 rounded-lg border border-blue-100 leading-relaxed">
              {{ selectedAttempt.essay_prompt || 'No essay prompt selected.' }}
            </div>
          </div>

          <!-- Essay Response Text -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Response:</label>
            <div class="p-4 bg-gray-50 border rounded-xl font-serif text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto shadow-inner select-text">
              {{ selectedAttempt.essay_response || 'No essay response submitted.' }}
            </div>
          </div>

          <!-- Input Essay Score -->
          <div class="space-y-2 pt-2 border-t">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-extrabold text-gray-800 uppercase tracking-wider">Assign Essay Score (0 - 100):</label>
              <span v-if="selectedAttempt.score_notified" class="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded">
                Already Graded & Notified
              </span>
            </div>
            <input 
              type="number" 
              v-model="inputEssayScore" 
              min="0" 
              max="100"
              :disabled="selectedAttempt.score_notified"
              class="w-full md:w-32 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-bold disabled:bg-gray-100"
            />
          </div>

          <!-- Modal Actions -->
          <div class="flex items-center justify-between pt-4 border-t">
            <button 
              @click="closeGradeModal"
              class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition"
            >
              Cancel
            </button>

            <button 
              @click="submitGradeAndNotify"
              :disabled="grading || selectedAttempt.score_notified"
              class="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition flex items-center gap-1.5 shadow-md disabled:shadow-none"
            >
              <i v-if="grading" class="fas fa-spinner animate-spin"></i>
              <span>{{ selectedAttempt.score_notified ? 'Score Notified' : 'Save & Send Score Notification' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const selectedFile = ref(null)
const uploading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const uploadType = ref('csv') // 'csv', 'docx', 'pdf'

// --- Add Question Form ---
const showAddForm = ref(false)
const addingQuestion = ref(false)
const addQuestionError = ref('')
const addQuestionSuccess = ref('')

const categoryOptions = [
  'Part 1. Verbal Ability & Structural Literacy',
  'Part 2. Advanced Vocabulary & Analytical Analogies',
  'Part 3. Section A: Formal Logic & Syllogisms',
  'Part 3. Section B: Critical Reasoning (Assumptions, Strengthening, and Weakening)',
  'Part 3. Section C: Analytical Puzzles & Sequencing',
  'Part 3. Section D: Logical Fallacies',
  'Part 4. Quantitative Reasoning',
  'Part 5. Passage 1: Jurisprudence and the Philosophy of Law',
  'Part 5. Passage 2: Constitutional Law and Judicial Interpretation',
  'Part 5. Passage 3: Technology, Artificial Intelligence, and Intellectual Property Law',
  'Part 6. Essay Questions & Legal Analysis',
]

const defaultNewQuestion = () => ({
  category: categoryOptions[0],
  passage: '',
  is_essay: false,
  question: '',
  correct_answer: '',
  option_1: '',
  option_2: '',
  option_3: '',
})

const newQuestion = ref(defaultNewQuestion())

const submitNewQuestion = async () => {
  addQuestionError.value = ''
  addQuestionSuccess.value = ''

  if (!newQuestion.value.question.trim()) {
    addQuestionError.value = 'Question text is required.'
    return
  }
  if (!newQuestion.value.is_essay && !newQuestion.value.correct_answer.trim()) {
    addQuestionError.value = 'Correct answer is required for multiple choice questions.'
    return
  }

  addingQuestion.value = true
  try {
    const res = await $fetch(`${config.public.apiUrl}/api/jurisdoctor/questions/create/`, {
      method: 'POST',
      body: {
        exam_id: 1,
        category: newQuestion.value.category,
        passage: newQuestion.value.passage || '',
        is_essay: newQuestion.value.is_essay,
        question: newQuestion.value.question,
        correct_answer: newQuestion.value.is_essay ? '' : newQuestion.value.correct_answer,
        option_1: newQuestion.value.is_essay ? '' : newQuestion.value.option_1,
        option_2: newQuestion.value.is_essay ? '' : newQuestion.value.option_2,
        option_3: newQuestion.value.is_essay ? '' : newQuestion.value.option_3,
      }
    })
    if (res.success) {
      addQuestionSuccess.value = 'Question saved successfully!'
      newQuestion.value = defaultNewQuestion()
      await fetchQuestions()
      setTimeout(() => { addQuestionSuccess.value = '' }, 3000)
    } else {
      addQuestionError.value = res.error || 'Failed to save question.'
    }
  } catch (err) {
    console.error('Add question error:', err)
    addQuestionError.value = err.data?.error || 'An error occurred while saving the question.'
  } finally {
    addingQuestion.value = false
  }
}

const fileAccept = computed(() => {
  if (uploadType.value === 'csv') return '.csv'
  if (uploadType.value === 'docx') return '.docx'
  return '.pdf'
})

const themeClasses = computed(() => {
  if (uploadType.value === 'csv') {
    return {
      text: 'text-[#006B3F]',
      bg: 'bg-[#006B3F]',
      hoverBg: 'hover:bg-green-700',
      fileBtn: 'file:bg-green-50 file:text-[#006B3F] hover:file:bg-green-100',
      border: 'border-green-500',
      shadow: 'shadow-green-700/10'
    }
  } else if (uploadType.value === 'docx') {
    return {
      text: 'text-blue-600',
      bg: 'bg-blue-600',
      hoverBg: 'hover:bg-blue-700',
      fileBtn: 'file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100',
      border: 'border-blue-500',
      shadow: 'shadow-blue-700/10'
    }
  } else {
    return {
      text: 'text-red-600',
      bg: 'bg-red-600',
      hoverBg: 'hover:bg-red-700',
      fileBtn: 'file:bg-red-50 file:text-red-600 hover:file:bg-red-100',
      border: 'border-red-500',
      shadow: 'shadow-red-700/10'
    }
  }
})

const setUploadType = (type) => {
  uploadType.value = type
  selectedFile.value = null
  errorMessage.value = ''
  successMessage.value = ''
  const fileInput = document.querySelector('input[type="file"]')
  if (fileInput) fileInput.value = ''
}

const questions = ref([])
const loadingQuestions = ref(false)

const attempts = ref([])
const loadingAttempts = ref(false)

const showGradeModal = ref(false)
const selectedAttempt = ref(null)
const inputEssayScore = ref(0)
const grading = ref(false)

const config = useRuntimeConfig()

// Date Formatter Helper
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  try {
    const d = new Date(dateStr)
    return d.toLocaleString()
  } catch (e) {
    return dateStr
  }
}

// Compute pending reviews count
const pendingAttemptsCount = computed(() => {
  return attempts.value.filter(a => !a.score_notified).length
})

// Fetch questions list
const fetchQuestions = async () => {
  loadingQuestions.value = true
  try {
    const data = await $fetch(`${config.public.apiUrl}/api/jurisdoctor/admin/questions/1/`)
    questions.value = data || []
  } catch (err) {
    console.error('Error fetching questions:', err)
  } finally {
    loadingQuestions.value = false
  }
}

// Fetch exam attempts results
const fetchAttempts = async () => {
  loadingAttempts.value = true
  try {
    const data = await $fetch(`${config.public.apiUrl}/api/jurisdoctor/results/`)
    attempts.value = data || []
  } catch (err) {
    console.error('Error fetching attempts:', err)
  } finally {
    loadingAttempts.value = false
  }
}

// Set correct answer helper for multiple choice
const setCorrectAnswer = async (questionId, value) => {
  try {
    const res = await $fetch(`${config.public.apiUrl}/api/jurisdoctor/update-correct-answer/`, {
      method: 'POST',
      body: {
        question_id: questionId,
        new_correct_answer: value
      }
    })
    if (res.success) {
      await fetchQuestions()
    }
  } catch (err) {
    console.error('Failed to update correct answer:', err)
  }
}

// Open grading drawer modal
const openGradeModal = (attempt) => {
  selectedAttempt.value = attempt
  inputEssayScore.value = attempt.essay_score || 0
  showGradeModal.value = true
}

const closeGradeModal = () => {
  showGradeModal.value = false
  selectedAttempt.value = null
}

// Submit score grading to candidate
const submitGradeAndNotify = async () => {
  if (!selectedAttempt.value) return
  
  if (inputEssayScore.value < 0 || inputEssayScore.value > 100) {
    alert("Essay score must be between 0 and 100.")
    return
  }

  grading.value = true
  try {
    const res = await $fetch(`${config.public.apiUrl}/api/jurisdoctor/notify-score//`, {
      method: 'POST',
      body: {
        attempt_id: selectedAttempt.value.id,
        essay_score: inputEssayScore.value
      }
    })
    
    // Fallback in case of extra slash URL issues
    let success = res.success
    if (!success && res.error) {
      success = false
    }

    if (success || res.success) {
      alert(`Email results notification sent successfully to ${selectedAttempt.value.email}!`)
      closeGradeModal()
      await fetchAttempts()
    } else {
      alert(res.error || 'Failed to update candidate results score.')
    }
  } catch (err) {
    // Retry path without trailing double-slash if routing failed
    try {
      const res = await $fetch(`${config.public.apiUrl}/api/jurisdoctor/notify-score/`, {
        method: 'POST',
        body: {
          attempt_id: selectedAttempt.value.id,
          essay_score: inputEssayScore.value
        }
      })
      if (res.success) {
        alert(`Email results notification sent successfully to ${selectedAttempt.value.email}!`)
        closeGradeModal()
        await fetchAttempts()
        return
      }
    } catch (e2) {
      console.error('Retry notification error:', e2)
    }

    console.error('Score notification failed:', err)
    alert('An error occurred while dispatching the results notification email.')
  } finally {
    grading.value = false
  }
}

const deleteAttempt = async (attemptId, fullName) => {
  if (!confirm(`Are you sure you want to delete the exam attempt for "${fullName}"? This action cannot be undone.`)) {
    return
  }
  
  try {
    const res = await $fetch(`${config.public.apiUrl}/api/jurisdoctor/attempts/${attemptId}/`, {
      method: 'DELETE'
    })
    if (res.success) {
      alert("Exam attempt deleted successfully.")
      await fetchAttempts()
    } else {
      alert(res.error || "Failed to delete exam attempt.")
    }
  } catch (err) {
    console.error("Delete attempt error:", err)
    alert("An error occurred while deleting the exam attempt.")
  }
}

const clearAllQuestions = async () => {
  if (!confirm("Are you sure you want to clear ALL uploaded questions? This will wipe the current questionnaire list.")) {
    return
  }
  
  try {
    const res = await $fetch(`${config.public.apiUrl}/api/jurisdoctor/questions/clear/1/`, {
      method: 'DELETE'
    })
    if (res.success) {
      alert("All questions cleared successfully.")
      await fetchQuestions()
    } else {
      alert(res.error || "Failed to clear questions.")
    }
  } catch (err) {
    console.error("Clear questions error:", err)
    alert("An error occurred while clearing questions.")
  }
}

const deleteQuestion = async (questionId, itemNum) => {
  if (!confirm(`Are you sure you want to delete Question Item ${itemNum}?`)) {
    return
  }
  
  try {
    const res = await $fetch(`${config.public.apiUrl}/api/jurisdoctor/questions/delete/${questionId}/`, {
      method: 'DELETE'
    })
    if (res.success) {
      await fetchQuestions()
    } else {
      alert(res.error || "Failed to delete question.")
    }
  } catch (err) {
    console.error("Delete question error:", err)
    alert("An error occurred while deleting the question.")
  }
}

onMounted(() => {
  fetchQuestions()
  fetchAttempts()
})

const onFileChange = (e) => {
  selectedFile.value = e.target.files[0]
  errorMessage.value = ''
  successMessage.value = ''
}

const uploadCSV = async () => {
  if (!selectedFile.value) {
    errorMessage.value = `Please choose a ${uploadType.value.toUpperCase()} file first.`
    return
  }

  uploading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const formData = new FormData()
  formData.append('file', selectedFile.value)

  try {
    const res = await $fetch(
      `${config.public.apiUrl}/api/jurisdoctor/upload-csv/`,
      {
        method: 'POST',
        body: formData
      }
    )

    if (res.success) {
      successMessage.value = `Import completed! Successfully loaded ${res.count} items.`
      selectedFile.value = null
      
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ''
      
      await fetchQuestions()
    } else {
      errorMessage.value = res.error || `Failure importing question ${uploadType.value.toUpperCase()}.`
    }
  } catch (err) {
    console.error('Upload failed:', err)
    errorMessage.value = err.data?.error || err.data?.message || `Error occurred during ${uploadType.value.toUpperCase()} upload.`
  } finally {
    uploading.value = false
  }
}
</script>