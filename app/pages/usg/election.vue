<template>
    <div> 
           <!-- Decorative top bar -->
      <div class="h-1 w-full bg-gradient-to-r from-green-800 via-green-600 to-green-800"></div>

      <!-- Header -->
<header
  class="w-full bg-white border-b border-gray-100 shadow-sm px-4 sm:px-6 lg:px-8 py-4"
>
  <div
    class="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3"
  >
    <!-- Logo -->
    <img
      src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/Corporate%20Logo%20New/Corporate%20Logo-Tagline.png"
      alt="La Salle University"
      class="h-10 sm:h-12 w-auto object-contain"
    />

    <!-- Status -->
    <div
      class="flex items-center justify-center lg:justify-end gap-2 text-[11px] sm:text-xs text-gray-500 font-medium tracking-wider uppercase text-center lg:text-right"
    >
      <span
        class="lg:inline-block hidden w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0"
      ></span>

      <span>
        Official Voting System of La Salle University
      </span>
    </div>
  </div>
</header>
        <template>
  <section class="animate-[fadeIn_0.4s_ease-out] relative">
    <!-- Toast Notification -->
    <div
      v-if="toast.show"
      :class="[
        'fixed top-6 right-6 p-4  shadow-2xl z-50 transform transition-all duration-300 max-w-sm w-full flex items-start gap-3 border',
        toast.type === 'error'
          ? 'bg-red-50 text-red-800 border-red-200 border-l-4 border-l-red-500'
          : 'bg-green-50 text-green-800 border-green-200 border-l-4 border-l-green-500',
      ]"
    >
      <div class="text-2xl mt-0.5">
        {{ toast.type === "error" ? "⚠️" : "✅" }}
      </div>
      <div>
        <h4 class="font-bold text-base">
          {{ toast.type === "error" ? "Error" : "Success" }}
        </h4>
        <p class="text-sm opacity-90">{{ toast.message }}</p>
      </div>
      <button
        @click="toast.show = false"
        class="ml-auto text-xl opacity-50 hover:opacity-100 leading-none"
      >
        &times;
      </button>
    </div>

    <!-- Official Ballot Receipt Modal -->
    <div
      v-if="showReceiptModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeIn_0.3s_ease-out] max-h-[90vh] flex flex-col"
      >
        <div class="bg-[#087830] px-6 py-5 text-center text-white shrink-0">
          <div class="text-4xl mb-1">🧾</div>
          <h3 class="text-lg font-extrabold uppercase tracking-wide">
            Official Ballot Receipt
          </h3>
          <p class="text-xs opacity-80 mt-1">Your vote has been recorded</p>
        </div>

        <div class="p-6 overflow-y-auto">
          <div
            class="text-sm border-b border-dashed border-slate-300 pb-4 mb-4 space-y-1"
          >
            <div class="flex justify-between">
              <span class="text-slate-500">Voter</span>
              <span class="font-bold text-slate-800">{{
                currentVoter?.student_name
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">LSU ID</span>
              <span class="font-bold text-slate-800">{{
                currentVoter?.lsu_id_number
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Date/Time</span>
              <span class="font-bold text-slate-800">{{
                formatReceiptDate(receiptTimestamp)
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Receipt No.</span>
              <span class="font-bold text-slate-800">{{ receiptCode }}</span>
            </div>
          </div>

          <template
            v-for="section in [
              { key: 'usg', label: 'USG', rows: receiptSnapshot.usg },
              { key: 'local', label: 'Local Council', rows: receiptSnapshot.local },
              { key: 'abo', label: 'ABO', rows: receiptSnapshot.abo },
            ]"
            :key="section.key"
          >
            <div v-if="section.rows.length" class="mb-4">
              <h4
                class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2"
              >
                {{ section.label }}
              </h4>
              <div
                v-for="(r, i) in section.rows"
                :key="section.key + '-' + i"
                class="flex justify-between items-center gap-3 py-1.5 border-b border-slate-100 last:border-0"
              >
                <span class="text-sm text-slate-600">{{ r.position }}</span>
                <span
                  :class="[
                    'text-sm font-bold text-right',
                    r.abstained ? 'text-slate-400 italic' : 'text-slate-900',
                  ]"
                >
                  {{ r.abstained ? "Abstained" : r.name }}
                </span>
              </div>
            </div>
          </template>

          <p
            v-if="
              !receiptSnapshot.usg.length &&
              !receiptSnapshot.local.length &&
              !receiptSnapshot.abo.length
            "
            class="text-center text-sm text-slate-400 py-6"
          >
            No ballot record found.
          </p>
        </div>

        <div class="p-4 pt-3 border-t border-slate-100 flex gap-3 shrink-0">
          <button
            @click="showReceiptModal = false"
            class="flex-1 bg-[#087830] hover:bg-[#066327] text-white py-2.5 rounded-xl font-bold text-sm transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>

    <!-- Header -->
    <div class="w-full max-w-6xl mx-auto pt-5">
      <!-- Logos -->
      <div class="flex justify-center mb-8">
        <div
          class="flex flex-wrap items-center justify-center lg:gap-5 gap-x-3"
        >
          <img
            src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUCOA.jpg"
            alt="COA"
            class="lg:w-14 lg:h-14 w-10 h-10 rounded-full border border-slate-200 object-cover bg-white shadow-sm"
          />

          <img
            src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUCOE.jpg"
            alt="COE"
            class="lg:w-14 lg:h-14 w-10 h-10 rounded-full border border-slate-200 object-cover bg-white shadow-sm"
          />

          <img
            src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUCSO.png"
            alt="CSO"
            class="lg:w-14 lg:h-14 w-10 h-10 rounded-full border border-slate-200 bg-white object-contain p-1 shadow-sm"
          />

          <!-- Center Logo -->
          <img
            src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/circleLSULogo.jpg"
            alt="LSU Logo"
            class="lg:w-24 lg:h-24 w-12 h-12 object-contain"
          />

          <img
            src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUSAC.jpg"
            alt="SAC"
            class="lg:w-14 lg:h-14 w-10 h-10 rounded-full border border-slate-200 object-cover bg-white shadow-sm"
          />

          <img
            src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUUSG.jpg"
            alt="USG"
            class="lg:w-14 lg:h-14 w-10 h-10 rounded-full border border-slate-200 object-cover bg-white shadow-sm"
          />

          <img
            src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUUSGJA.jpg"
            alt="USGJA"
            class="lg:w-14 lg:h-14 w-10 h-10 rounded-full border border-slate-200 object-cover bg-white shadow-sm"
          />
        </div>
      </div>

      <!-- Title -->
      <div class="text-center">
        <div
          class="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-green-50 text-[#087830] text-sm font-semibold border border-green-100 mb-4"
        >
          <span
            class="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0"
          ></span>
          Commission on Election
        </div>

        <h1
          class="lg:text-4xl text-2xl font-bold text-slate-900 tracking-tight uppercase pb-3"
        >
          Student Election Portal
        </h1>
      </div>
    </div>

    <!-- Authentication -->
    <div v-if="!currentVoter" class="flex justify-center px-4">
      <div
        class="w-full lg:w-3/12 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden"
      >
        <!-- Green Top -->
        <div class="h-2 bg-[#087830]"></div>

        <div class="p-5">
          <!-- Icon -->
          <div
            class="w-16 h-16 rounded-2xl bg-green-50 text-[#087830] flex items-center justify-center mx-auto mb-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3zm7 9v-1a5 5 0 00-5-5H10a5 5 0 00-5 5v1m13-9h1a2 2 0 002-2V6a2 2 0 00-2-2h-1"
              />
            </svg>
          </div>

          <h2 class="text-2xl font-bold text-center text-slate-900">
            Voter Authentication
          </h2>

          <p class="text-center text-slate-500 mb-8 lg:text-lg text-xs">
            Verify your identity before accessing your ballot.
          </p>

          <form @submit.prevent="validateVoter">
            <!-- Email -->
            <div class="mb-6">
              <input
                v-model="emailInput"
                type="email"
                placeholder="Enter your University Email"
                class="w-full border-b-2 lg:text-sm text-xs shadow border-green-800 px-4 py-3 focus:border-[#087830] focus:ring-4 focus:ring-green-100 outline-none transition"
              />
            </div>

            <!-- LSU ID -->
            <div class="mb-8">
              <input
                v-model="voterIdInput"
                type="text"
                placeholder="Enter your LSU ID Number"
                class="w-full border-b-2 lg:text-sm text-xs shadow border-green-800 px-4 py-3 focus:border-[#087830] focus:ring-4 focus:ring-green-100 outline-none transition"
              />
            </div>

            <!-- Button -->
            <button
              type="submit"
              disabled
              class="w-full rounded-xl bg-[#087830] hover:bg-[#066327] text-white py-3.5 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              <i class="fa-solid fa-vote-yea"></i>

              {{ loading ? "Verifying Identity..." : "Access Ballot" }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- LOCK SCREEN (ALREADY VOTED) -->
    <div
      v-else-if="currentVoter.has_voted"
      class="animate-[fadeIn_0.4s_ease-out]"
    >
      <div
        class="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 sm:p-12 text-center max-w-3xl mx-auto"
      >
        <div
          class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <i class="fa fa-check text-4xl"></i>
        </div>
        <h2 class="text-3xl font-extrabold text-slate-900 mb-2">
          Thank You For Voting!
        </h2>
        <p class="text-lg text-slate-600 mb-8">
          Your official ballot has been recorded,
          <strong class="text-slate-900">{{ currentVoter.student_name }}</strong
          >.
        </p>

        <div
          v-if="
            currentVoter.voted_candidates_details &&
            currentVoter.voted_candidates_details.length
          "
          class="text-left mt-8"
        >
          <h3
            class="text-xl font-bold text-slate-800 border-b-2 border-slate-100 pb-2 mb-6"
          >
            Your Selected Candidates
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="c in currentVoter.voted_candidates_details"
              :key="c.id"
              class="flex items-center gap-4 p-4 border border-slate-200 bg-slate-50"
            >
              <div
                v-if="c.student_candidate_profile_image"
                class="w-12 h-12 rounded-full shrink-0 overflow-hidden shadow-sm border border-slate-200 bg-white"
              >
                <img
                  :src="getProfileImageUrl(c.student_candidate_profile_image)"
                  alt="Profile"
                  class="w-full h-full object-cover"
                  @error="handleImageError($event, c.student_name)"
                />
              </div>
              <div
                v-else
                class="w-12 h-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xl shrink-0"
              >
                {{ c.student_name.charAt(0) }}
              </div>
              <div>
                <div class="font-bold text-slate-900">{{ c.student_name }}</div>
                <div class="text-sm text-slate-500 font-semibold">
                  {{ c.title_position }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-10 pt-8 border-t border-slate-100">
          <button
            @click="openReceiptFromRecord"
            type="button"
            class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold text-sm transition inline-flex items-center gap-2"
          >
            🧾 View Official Ballot Receipt
          </button>
        </div>
      </div>
    </div>

    <!-- VOTING BALLOT -->
    <div v-else class="animate-[fadeIn_0.4s_ease-out]">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-extrabold text-slate-900 mb-2">
          Official Election Ballot
        </h2>
        <p class="text-lg text-slate-600">
          Welcome,
          <strong class="text-slate-900">{{ currentVoter.student_name }}</strong
          >. Please select your preferred candidates.
        </p>
      </div>

      <div
        v-if="
          Object.keys(usgCandidatesGrouped).length > 0 ||
          Object.keys(localCandidatesGrouped).length > 0 ||
          Object.keys(aboCandidatesGrouped).length > 0
        "
      >
        <!-- TABS HEADER -->
        <div class="flex flex-wrap justify-center border-b border-slate-200 mb-8 pb-px gap-2 sm:gap-6">
          <button
            @click="activeSection = 'usg'"
            type="button"
            :class="[
              'px-6 py-3 font-extrabold text-base sm:text-lg border-b-4 transition-all duration-300 relative flex items-center gap-2',
              activeSection === 'usg'
                ? 'border-green-600 text-green-800'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            ]"
          >
            🏛️ USG
            <span
              v-if="selectedUsgCount > 0"
              class="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-bold transition-all"
            >
              {{ selectedUsgCount }}
            </span>
          </button>
          
          <button
            @click="activeSection = 'local'"
            type="button"
            :class="[
              'px-6 py-3 font-extrabold text-base sm:text-lg border-b-4 transition-all duration-300 relative flex items-center gap-2',
              activeSection === 'local'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            ]"
          >
            🎓 Local Council
            <span
              v-if="selectedLocalCount > 0"
              class="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full font-bold transition-all"
            >
              {{ selectedLocalCount }}
            </span>
          </button>

          <button
            @click="activeSection = 'abo'"
            type="button"
            :class="[
              'px-6 py-3 font-extrabold text-base sm:text-lg border-b-4 transition-all duration-300 relative flex items-center gap-2',
              activeSection === 'abo'
                ? 'border-indigo-600 text-indigo-800'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            ]"
          >
            🤝 ABO
            <span
              v-if="selectedAboCount > 0"
              class="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-bold transition-all"
            >
              {{ selectedAboCount }}
            </span>
          </button>
        </div>

        <!-- USG CONTENT -->
        <div v-if="activeSection === 'usg'" class="animate-[fadeIn_0.3s_ease-out]">
          <div class="border-b-2 border-slate-100 pb-2 mb-6">
            <h3 class="text-xl font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              🏛️ University Student Government
            </h3>
            <p class="text-xs text-slate-400 mt-1 font-semibold">
              All enrolled students are eligible to vote for USG candidates.
            </p>
          </div>

          <div v-if="Object.keys(usgCandidatesGrouped).length > 0">
            <div
              v-for="(group, position) in usgCandidatesGrouped"
              :key="position"
              class="mb-10"
            >
              <h4 class="text-lg font-bold text-green-800 bg-green-50/50 px-4 py-2 rounded-lg border-l-4 border-green-600 mb-6">
                {{ position }}
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                <label
                  v-for="c in group"
                  :key="c.id"
                  :class="[
                    'relative flex flex-col items-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 text-center bg-white shadow-sm overflow-hidden group',
                    selectedCandidates.includes(c.id)
                      ? 'border-green-600 bg-green-50/40 shadow-md ring-4 ring-green-500/10'
                      : 'border-slate-200 hover:border-green-400 hover:shadow-md',
                  ]"
                >
                  <input
                    type="checkbox"
                    :value="c.id"
                    v-model="selectedCandidates"
                    @change="clearAbstain('usg', position)"
                    class="hidden"
                  />

                  <div class="relative w-full aspect-square mb-4 overflow-hidden shadow-inner bg-slate-100 shrink-0">
                    <img
                      v-if="c.student_candidate_profile_image"
                      :src="getProfileImageUrl(c.student_candidate_profile_image)"
                      alt="Profile"
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      @error="handleImageError($event, c.student_name)"
                    />
                    <div
                      v-else
                      class="w-full h-full bg-gradient-to-tr from-green-100 to-emerald-50 text-green-700 flex items-center justify-center font-black text-5xl"
                    >
                      {{ c.student_name.charAt(0) }}
                    </div>

                    <div
                      :class="[
                        'absolute top-3 right-3 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-md z-10',
                        selectedCandidates.includes(c.id)
                          ? 'border-green-600 bg-green-600 text-white scale-110'
                          : 'border-slate-300 bg-white text-transparent',
                      ]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>

                  <div class="w-full flex flex-col items-center">
                    <span class="text-[10px] font-bold text-green-700 uppercase tracking-widest bg-green-100/70 px-3 py-1 rounded-full mb-2">
                      {{ c.title_position }}
                    </span>
                    <h5 class="font-extrabold text-slate-800 text-base leading-tight group-hover:text-green-800 transition-colors mb-1">
                      {{ c.student_name }}
                    </h5>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {{ c.college }}<template v-if="c.program"> - {{ c.program }}</template>
                    </p>
                  </div>
                </label>

                <!-- Abstain option -->
                <button
                  type="button"
                  @click="toggleAbstain('usg', position, group)"
                  :class="[
                    'relative flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-2xl transition-all duration-300 hover:-translate-y-1 text-center bg-white shadow-sm',
                    isAbstained('usg', position)
                      ? 'border-slate-500 bg-slate-100 shadow-md ring-4 ring-slate-400/10'
                      : 'border-slate-300 hover:border-slate-400 hover:shadow-md',
                  ]"
                >
                  <div class="relative w-full aspect-square mb-4 rounded-full overflow-hidden shadow-inner bg-slate-100 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636a9 9 0 11-12.728 0M12 3v9" />
                    </svg>

                    <div
                      :class="[
                        'absolute top-3 right-3 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-md z-10',
                        isAbstained('usg', position)
                          ? 'border-slate-500 bg-slate-500 text-white scale-110'
                          : 'border-slate-300 bg-white text-transparent',
                      ]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>

                  <div class="w-full flex flex-col items-center">
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-200/70 px-3 py-1 rounded-full mb-2">
                      {{ position }}
                    </span>
                    <h5 class="font-extrabold text-slate-700 text-base leading-tight mb-1">
                      Abstain
                    </h5>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Skip this position
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <h4 class="text-lg font-bold text-slate-600">No USG candidates available.</h4>
          </div>
        </div>

        <!-- LOCAL COUNCIL CONTENT -->
        <div v-if="activeSection === 'local'" class="animate-[fadeIn_0.3s_ease-out]">
          <div class="border-b-2 border-slate-100 pb-2 mb-6">
            <h3 class="text-xl font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              🎓 Local Student Council
              <span class="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full normal-case tracking-normal">
                {{ getVoterLocalCategory(currentVoter) }}
              </span>
            </h3>
            <p class="text-xs text-slate-400 mt-1 font-semibold">
              Exclusively visible and restricted to students belonging to: {{ getVoterLocalCategory(currentVoter) }}.
            </p>
          </div>

          <div v-if="Object.keys(localCandidatesGrouped).length > 0">
            <div
              v-for="(group, position) in localCandidatesGrouped"
              :key="position"
              class="mb-10"
            >
              <h4 class="text-lg font-bold text-emerald-800 bg-emerald-50/50 px-4 py-2 rounded-lg border-l-4 border-emerald-600 mb-6">
                {{ position }}
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                <label
                  v-for="c in group"
                  :key="c.id"
                  :class="[
                    'relative flex flex-col items-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 text-center bg-white shadow-sm overflow-hidden group',
                    selectedCandidates.includes(c.id)
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-md ring-4 ring-emerald-500/10'
                      : 'border-slate-200 hover:border-emerald-400 hover:shadow-md',
                  ]"
                >
                  <input
                    type="checkbox"
                    :value="c.id"
                    v-model="selectedCandidates"
                    @change="clearAbstain('local', position)"
                    class="hidden"
                  />

                  <div class="relative w-full aspect-square mb-4 overflow-hidden shadow-inner bg-slate-100 shrink-0">
                    <img
                      v-if="c.student_candidate_profile_image"
                      :src="getProfileImageUrl(c.student_candidate_profile_image)"
                      alt="Profile"
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      @error="handleImageError($event, c.student_name)"
                    />
                    <div
                      v-else
                      class="w-full h-full bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-700 flex items-center justify-center font-black text-5xl"
                    >
                      {{ c.student_name.charAt(0) }}
                    </div>

                    <div
                      :class="[
                        'absolute top-3 right-3 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-md z-10',
                        selectedCandidates.includes(c.id)
                          ? 'border-emerald-600 bg-emerald-600 text-white scale-110'
                          : 'border-slate-300 bg-white text-transparent',
                      ]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>

                  <div class="w-full flex flex-col items-center">
                    <span class="text-[10px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-100/70 px-3 py-1 rounded-full mb-2">
                      {{ c.title_position }}
                    </span>
                    <h5 class="font-extrabold text-slate-800 text-base leading-tight group-hover:text-emerald-800 transition-colors mb-1">
                      {{ c.student_name }}
                    </h5>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {{ c.college }}<template v-if="c.program"> - {{ c.program }}</template>
                    </p>
                  </div>
                </label>

                <!-- Abstain option -->
                <button
                  type="button"
                  @click="toggleAbstain('local', position, group)"
                  :class="[
                    'relative flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-2xl transition-all duration-300 hover:-translate-y-1 text-center bg-white shadow-sm',
                    isAbstained('local', position)
                      ? 'border-slate-500 bg-slate-100 shadow-md ring-4 ring-slate-400/10'
                      : 'border-slate-300 hover:border-slate-400 hover:shadow-md',
                  ]"
                >
                  <div class="relative w-full aspect-square mb-4 rounded-full overflow-hidden shadow-inner bg-slate-100 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636a9 9 0 11-12.728 0M12 3v9" />
                    </svg>

                    <div
                      :class="[
                        'absolute top-3 right-3 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-md z-10',
                        isAbstained('local', position)
                          ? 'border-slate-500 bg-slate-500 text-white scale-110'
                          : 'border-slate-300 bg-white text-transparent',
                      ]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>

                  <div class="w-full flex flex-col items-center">
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-200/70 px-3 py-1 rounded-full mb-2">
                      {{ position }}
                    </span>
                    <h5 class="font-extrabold text-slate-700 text-base leading-tight mb-1">
                      Abstain
                    </h5>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Skip this position
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <h4 class="text-lg font-bold text-slate-600">No Local Council candidates available for your college.</h4>
          </div>
        </div>

        <!-- ABO CONTENT -->
        <div v-if="activeSection === 'abo'" class="animate-[fadeIn_0.3s_ease-out]">
          <div class="border-b-2 border-slate-100 pb-2 mb-6">
            <h3 class="text-xl font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              🤝 Academic Based Organization (ABO)
              <span v-if="getVoterABO(currentVoter)" class="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full normal-case tracking-normal">
                {{ getVoterABO(currentVoter) }}
              </span>
            </h3>
            <p class="text-xs text-slate-400 mt-1 font-semibold">
              Exclusively visible and restricted to students belonging to the organization: {{ getVoterABO(currentVoter) || 'Not Mapped' }}.
            </p>
          </div>

          <div v-if="Object.keys(aboCandidatesGrouped).length > 0">
            <div
              v-for="(group, position) in aboCandidatesGrouped"
              :key="position"
              class="mb-10"
            >
              <h4 class="text-lg font-bold text-indigo-800 bg-indigo-50/50 px-4 py-2 rounded-lg border-l-4 border-indigo-600 mb-6">
                {{ position }}
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                <label
                  v-for="c in group"
                  :key="c.id"
                  :class="[
                    'relative flex flex-col items-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 text-center bg-white shadow-sm overflow-hidden group',
                    selectedCandidates.includes(c.id)
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-md ring-4 ring-indigo-500/10'
                      : 'border-slate-200 hover:border-indigo-400 hover:shadow-md',
                  ]"
                >
                  <input
                    type="checkbox"
                    :value="c.id"
                    v-model="selectedCandidates"
                    @change="clearAbstain('abo', position)"
                    class="hidden"
                  />

                  <div class="relative w-full aspect-square mb-4 overflow-hidden shadow-inner bg-slate-100 shrink-0">
                    <img
                      v-if="c.student_candidate_profile_image"
                      :src="getProfileImageUrl(c.student_candidate_profile_image)"
                      alt="Profile"
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      @error="handleImageError($event, c.student_name)"
                    />
                    <div
                      v-else
                      class="w-full h-full bg-gradient-to-tr from-indigo-100 to-violet-50 text-indigo-700 flex items-center justify-center font-black text-5xl"
                    >
                      {{ c.student_name.charAt(0) }}
                    </div>

                    <div
                      :class="[
                        'absolute top-3 right-3 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-md z-10',
                        selectedCandidates.includes(c.id)
                          ? 'border-indigo-600 bg-indigo-600 text-white scale-110'
                          : 'border-slate-300 bg-white text-transparent',
                      ]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>

                  <div class="w-full flex flex-col items-center">
                    <span class="text-[10px] font-bold text-indigo-700 uppercase tracking-widest bg-indigo-100/70 px-3 py-1 rounded-full mb-2">
                      {{ c.title_position }}
                    </span>
                    <h5 class="font-extrabold text-slate-800 text-base leading-tight group-hover:text-indigo-800 transition-colors mb-1">
                      {{ c.student_name }}
                    </h5>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {{ c.college }}<template v-if="c.program"> - {{ c.program }}</template>
                    </p>
                  </div>
                </label>

                <!-- Abstain option -->
                <button
                  type="button"
                  @click="toggleAbstain('abo', position, group)"
                  :class="[
                    'relative flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-2xl transition-all duration-300 hover:-translate-y-1 text-center bg-white shadow-sm',
                    isAbstained('abo', position)
                      ? 'border-slate-500 bg-slate-100 shadow-md ring-4 ring-slate-400/10'
                      : 'border-slate-300 hover:border-slate-400 hover:shadow-md',
                  ]"
                >
                  <div class="relative w-full aspect-square mb-4 rounded-full overflow-hidden shadow-inner bg-slate-100 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636a9 9 0 11-12.728 0M12 3v9" />
                    </svg>

                    <div
                      :class="[
                        'absolute top-3 right-3 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-md z-10',
                        isAbstained('abo', position)
                          ? 'border-slate-500 bg-slate-500 text-white scale-110'
                          : 'border-slate-300 bg-white text-transparent',
                      ]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>

                  <div class="w-full flex flex-col items-center">
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-200/70 px-3 py-1 rounded-full mb-2">
                      {{ position }}
                    </span>
                    <h5 class="font-extrabold text-slate-700 text-base leading-tight mb-1">
                      Abstain
                    </h5>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Skip this position
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <h4 class="text-lg font-bold text-slate-600">No ABO candidates available matching your organization profile.</h4>
          </div>
        </div>

        <!-- GLOBAL SUBMIT BUTTON -->
        <div class="text-center mt-16 pt-8 border-t border-slate-200">
          <button
            @click="castVote"
            :disabled="loading || isBallotEmpty"
            class="bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-12 py-4 font-bold text-xl shadow-xl shadow-green-700/20 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {{ loading ? "Submitting Votes..." : "Submit Votes" }}
          </button>
        </div>
      </div>

      <div
        v-else
        class="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200"
      >
        <div class="text-5xl mb-4">🗳️</div>
        <h3 class="text-xl font-bold text-slate-700 mb-2">
          No Candidates Available
        </h3>
        <p class="text-slate-500 mb-6">
          There are no USG, local council, or ABO candidates matching your
          profile available at the moment.
        </p>
        <button
          @click="logout"
          class="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 rounded-lg font-bold transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>

    <!-- Footer -->
    <footer class="mt-10 border-t border-slate-200 bg-white">
      <div class="max-w-6xl mx-auto px-6 lg:py-3 py-3">
        <div class="flex flex-col items-center justify-center text-center">
          <img
            src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/20th%20Anniversary%20Emerald%20Logos-20260618T012425Z-3-001/20th%20Anniversary%20Emerald%20Logos/Emerald%20with%20Theme%20-%20Green.png"
            alt="La Salle University"
            class="w-12 h-12 object-contain opacity-90 lg:mb-3"
          />

          <p
            class="lg:text-sm text-xs tracking-tighter font-semibold text-green-700"
          >
            © 2026 La Salle University Ozamiz, Inc.
          </p>

          <p class="lg:text-sm text-xs tracking-tighter text-slate-500">
            Powered by
            <span class="font-semibold text-[#087830]">
              Network, Programs and Computerization Center (NPCC)
            </span>
          </p>
        </div>
      </div>
    </footer>
  </section>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";

const config = useRuntimeConfig();
const API_BASE = `${config.public.apiUrl || "http://localhost:8000"}/api/usg`;
const { user } = useAuth();

const getProfileImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http") || imagePath.startsWith("data:"))
    return imagePath;
  const base = (config.public.apiUrl || "http://localhost:8000").replace(
    /\/$/,
    "",
  );
  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${base}${path}`;
};

const handleImageError = (e, candidateName) => {
  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidateName)}&background=dcfce7&color=166534`;
};

const loading = ref(false);
const candidates = ref([]);
const voterIdInput = ref("");
const emailInput = ref("");
const currentVoter = ref(null);
const selectedCandidates = ref([]);

// Tracks which position groups the voter has explicitly chosen to abstain
// from. Keyed by "section::position" (e.g. "usg::President") so that the
// same position title in different tabs (USG / Local / ABO) doesn't collide.
const abstainedGroups = ref(new Set());

const getGroupKey = (section, position) => `${section}::${position}`;

const isAbstained = (section, position) =>
  abstainedGroups.value.has(getGroupKey(section, position));

// Toggles abstain for a position group. Choosing to abstain clears any
// candidates already selected within that same group, since abstaining
// and voting for a candidate in the same position are mutually exclusive.
const toggleAbstain = (section, position, group) => {
  const key = getGroupKey(section, position);
  const next = new Set(abstainedGroups.value);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
    const idsInGroup = new Set(group.map((c) => c.id));
    selectedCandidates.value = selectedCandidates.value.filter(
      (id) => !idsInGroup.has(id),
    );
  }
  abstainedGroups.value = next;
};

// Selecting an actual candidate in a group should clear any abstain flag
// previously set for that same position.
const clearAbstain = (section, position) => {
  const key = getGroupKey(section, position);
  if (abstainedGroups.value.has(key)) {
    const next = new Set(abstainedGroups.value);
    next.delete(key);
    abstainedGroups.value = next;
  }
};

// Converts the abstainedGroups Set ("section::position" keys) into the
// [{ section, position, category }, ...] shape the backend stores on VoterModel, so
// abstains survive a page reload / re-login just like actual candidate
// picks do.
const buildAbstainedPayload = () =>
  Array.from(abstainedGroups.value).map((key) => {
    const [section, position] = key.split("::");
    let category = "";
    if (section === "usg") {
      category = "LSU-USG";
    } else if (section === "local") {
      category = getVoterLocalCategory(currentVoter.value) || "";
    } else if (section === "abo") {
      category = getVoterABO(currentVoter.value) || "";
    }
    return { section, position, category };
  });

const activeSection = ref("usg");

// Ranks a USG/ABO position title: President first, Vice President (or VP)
// second, board/general members last, everything else in between — using
// a substring match so wording variations (e.g. "ABO President",
// "ABO VP", "ABO Member") still sort correctly.
const getUsgAboRank = (position) => {
  const p = position.trim().toLowerCase();
  if (p.includes("member")) return 99;
  if (p.includes("vice president") || /\bvp\b/.test(p)) return 1;
  if (p.includes("president")) return 0;
  return 50;
};

// Ranks an SC (Local College Council) position title: plain Governor
// first, Governor/Vice Governor for Internal Affairs next, then External
// Affairs, then Board Member(s) last. Matches by keyword rather than exact
// string so titles like "Governor for Internal Affairs" or "Vice Governor -
// External Affairs" are recognized regardless of exact phrasing.
const getLocalRank = (position) => {
  const p = position.trim().toLowerCase();
  if (p.includes("board member")) return 99;
  if (p.includes("internal")) return 1;
  if (p.includes("external")) return 2;
  if (p.includes("governor")) return 0;
  return 50;
};

const sortGroupsByPosition = (groups, rankFn = getUsgAboRank) => {
  const entries = Object.entries(groups);
  entries.sort(([posA], [posB]) => {
    const rankA = rankFn(posA);
    const rankB = rankFn(posB);
    if (rankA !== rankB) return rankA - rankB;
    // Tiebreaker: alphabetize anything sharing the same rank (e.g.
    // multiple board-member titles) for a stable, predictable order.
    return posA.localeCompare(posB);
  });
  return Object.fromEntries(entries);
};

const ABO_CODES = ["POLISAYS", "JSWAP", "LSUPS", "PICE", "SOURCE", "SOTE", "FHARO"];

const getVoterABO = (voter) => {
  if (!voter) return null;
  const program = (voter.program || "").toLowerCase();
  const college = (voter.college || "").toLowerCase();

  // CCSEA / BSCS / BSIT -> SOURCE
  if (
    program.includes("computer science") ||
    program.includes("information technology") ||
    program.includes("bscs") ||
    program.includes("bsit") ||
    program.includes("source")
  ) {
    return "SOURCE";
  }
  // BS Civil Engineering / BSCE / PICE -> PICE
  if (
    program.includes("civil engineering") ||
    program.includes("bsce") ||
    program.includes("pice")
  ) {
    return "PICE";
  }
  // Political Science / PolSci / POLISAYS -> POLISAYS
  if (
    program.includes("political science") ||
    program.includes("polsci") ||
    program.includes("polisays") ||
    program.includes("polisay")
  ) {
    return "POLISAYS";
  }
  // Social Work / BSSW / JSWAP -> JSWAP
  if (
    program.includes("social work") ||
    program.includes("bssw") ||
    program.includes("jswap")
  ) {
    return "JSWAP";
  }
  // Psychology / Psych / LSUPS -> LSUPS
  if (
    program.includes("psychology") ||
    program.includes("psych") ||
    program.includes("lsups")
  ) {
    return "LSUPS";
  }
  // Teacher Education / SOTE -> SOTE
  if (
    college.includes("cte") ||
    program.includes("education") ||
    program.includes("bsed") ||
    program.includes("beed") ||
    program.includes("sote")
  ) {
    return "SOTE";
  }
  // Hospitality Management / Tourism Management / FHARO -> FHARO
  if (
    college.includes("cthm") ||
    program.includes("hospitality") ||
    program.includes("tourism") ||
    program.includes("bshm") ||
    program.includes("bstm") ||
    program.includes("fharo")
  ) {
    return "FHARO";
  }

  // Fallback: search for direct match of ABO codes in student info
  for (const abo of ABO_CODES) {
    if (program.toUpperCase().includes(abo) || college.toUpperCase().includes(abo)) {
      return abo;
    }
  }
  return null;
};

// Maps a candidate's stored `category` back to the ballot tab ('usg' /
// 'local' / 'abo') it belongs to. Used to reconstruct the receipt from the
// voter's saved record (voted_candidates_details + abstained_positions)
// after they log back in, since the live candidates list may not be
// (re)loaded at that point.
const getSectionFromCategory = (category) => {
  const cat = (category || "").toUpperCase().trim();
  if (cat === "ALL COLLEGES" || cat === "LSU-USG") return "usg";
  if (cat.startsWith("SC-")) return "local";
  if (ABO_CODES.includes(cat)) return "abo";
  return null;
};

const selectedUsgCount = computed(() => {
  const usgIds = new Set();
  Object.values(usgCandidatesGrouped.value).forEach((group) => {
    group.forEach((c) => usgIds.add(c.id));
  });
  return selectedCandidates.value.filter((id) => usgIds.has(id)).length;
});

const selectedLocalCount = computed(() => {
  const localIds = new Set();
  Object.values(localCandidatesGrouped.value).forEach((group) => {
    group.forEach((c) => localIds.add(c.id));
  });
  return selectedCandidates.value.filter((id) => localIds.has(id)).length;
});

const selectedAboCount = computed(() => {
  const aboIds = new Set();
  Object.values(aboCandidatesGrouped.value).forEach((group) => {
    group.forEach((c) => aboIds.add(c.id));
  });
  return selectedCandidates.value.filter((id) => aboIds.has(id)).length;
});

const isBallotEmpty = computed(() => {
  return selectedCandidates.value.length === 0 && abstainedGroups.value.size === 0;
});

const toast = ref({ show: false, type: "", message: "" });
const showToast = (message, type = "error") => {
  toast.value = { show: true, type, message };
  setTimeout(() => {
    toast.value.show = false;
  }, 5000);
};

// --- Official Ballot Receipt ---
const showReceiptModal = ref(false);
const receiptTimestamp = ref(null);
const receiptCode = ref("");
const receiptSnapshot = ref({ usg: [], local: [], abo: [] });

const escapeHtml = (str) =>
  String(str ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[m]);

const formatReceiptDate = (date) => {
  if (!(date instanceof Date) || isNaN(date)) return "—";
  return date.toLocaleString();
};

const buildReceiptCode = (idNumber, dateObj) => {
  const stamp =
    dateObj instanceof Date && !isNaN(dateObj) ? dateObj.getTime() : Date.now();
  return `LSU-${idNumber || "VOTER"}-${stamp.toString(36).toUpperCase()}`;
};
// Walks a grouped-by-position object (from the live candidates list) and
// records either the candidate(s) picked in that position, or marks it
// ABSTAINED if nothing was picked. Used immediately after casting a vote,
// while selectedCandidates/abstainedGroups still hold the live selection.
const buildSectionReceipt = (groupedCandidates) => {
  const rows = [];
  Object.entries(groupedCandidates).forEach(([position, group]) => {
    const picked = group.filter((c) => selectedCandidates.value.includes(c.id));
    if (picked.length > 0) {
      picked.forEach((c) =>
        rows.push({ position, name: c.student_name, abstained: false }),
      );
    } else {
      rows.push({ position, name: null, abstained: true });
    }
  });
  return rows;
};

// Builds the receipt right after a successful vote submission, from the
// live ballot state. Must be called before selectedCandidates/
// abstainedGroups could be reset elsewhere.
const generateReceipt = () => {
  receiptSnapshot.value = {
    usg: buildSectionReceipt(usgCandidatesGrouped.value),
    local: buildSectionReceipt(localCandidatesGrouped.value),
    abo: buildSectionReceipt(aboCandidatesGrouped.value),
  };
  receiptTimestamp.value = new Date();
  receiptCode.value = buildReceiptCode(
    currentVoter.value?.lsu_id_number,
    receiptTimestamp.value,
  );
  showReceiptModal.value = true;
};

// Rebuilds the receipt from the voter's saved record (voted_candidates_details
// + abstained_positions, both persisted server-side at vote time). Used when
// re-opening the receipt from the lock screen — e.g. after a page refresh or
// a fresh login — when the live selection state no longer exists.
const buildReceiptFromRecord = () => {
  const bySection = { usg: [], local: [], abo: [] };

  const votedList = currentVoter.value?.voted_candidates_details || [];
  votedList.forEach((c) => {
    const section = getSectionFromCategory(c.category);
    if (!section) return;
    bySection[section].push({
      position: c.title_position,
      name: c.student_name,
      abstained: false,
    });
  });

  const abstainedList = currentVoter.value?.abstained_positions || [];
  abstainedList.forEach((a) => {
    if (!bySection[a.section]) return;
    bySection[a.section].push({
      position: a.position,
      name: null,
      abstained: true,
    });
  });

  Object.keys(bySection).forEach((key) => {
    bySection[key].sort((a, b) => a.position.localeCompare(b.position));
  });

  receiptSnapshot.value = bySection;
};

const openReceiptFromRecord = () => {
  buildReceiptFromRecord();
  receiptTimestamp.value = currentVoter.value?.voted_at
    ? new Date(currentVoter.value.voted_at)
    : new Date();
  receiptCode.value = buildReceiptCode(
    currentVoter.value?.lsu_id_number,
    receiptTimestamp.value,
  );
  showReceiptModal.value = true;
};

const printReceipt = () => {
  const sectionHtml = (title, rows) => {
    if (!rows.length) return "";
    return `
      <h3>${escapeHtml(title)}</h3>
      <table><tbody>
        ${rows
          .map(
            (r) => `
          <tr>
            <td>${escapeHtml(r.position)}</td>
            <td>${r.abstained ? "<em>ABSTAINED</em>" : escapeHtml(r.name)}</td>
          </tr>`,
          )
          .join("")}
      </tbody></table>`;
  };

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Official Ballot Receipt</title>
        <style>
          body { font-family: 'Courier New', monospace; max-width: 480px; margin: 40px auto; color: #111; }
          h1 { text-align: center; font-size: 18px; text-transform: uppercase; margin-bottom: 4px; }
          h2 { text-align: center; font-size: 12px; font-weight: normal; margin-top: 0; color: #555; }
          h3 { font-size: 13px; text-transform: uppercase; border-bottom: 1px solid #111; padding-bottom: 4px; margin-top: 24px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          td { padding: 4px 0; }
          td:first-child { color: #555; }
          td:last-child { text-align: right; font-weight: bold; }
          .meta { font-size: 12px; margin-top: 16px; border-top: 1px dashed #999; border-bottom: 1px dashed #999; padding: 8px 0; }
          .footer { text-align: center; font-size: 11px; color: #777; margin-top: 24px; }
        </style>
      </head>
      <body>
        <h1>Official Ballot Receipt</h1>
        <h2>La Salle University Ozamiz &mdash; Commission on Election</h2>
        <div class="meta">
          <div>Voter: ${escapeHtml(currentVoter.value?.student_name)}</div>
          <div>LSU ID: ${escapeHtml(currentVoter.value?.lsu_id_number)}</div>
          <div>Date/Time: ${escapeHtml(formatReceiptDate(receiptTimestamp.value))}</div>
          <div>Receipt No.: ${escapeHtml(receiptCode.value)}</div>
        </div>
        ${sectionHtml("USG", receiptSnapshot.value.usg)}
        ${sectionHtml("Local Council", receiptSnapshot.value.local)}
        ${sectionHtml("ABO", receiptSnapshot.value.abo)}
        <p class="footer">This receipt confirms your ballot was recorded.<br/>Keep for your records.</p>
      </body>
    </html>`;

  const win = window.open("", "_blank", "width=520,height=700");
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  }
};

const fetchCandidates = async () => {
  try {
    const res = await fetch(`${API_BASE}/candidates/`);
    if (res.ok) {
      candidates.value = await res.json();
    }
  } catch (err) {
    console.error("Error fetching candidates:", err);
  }
};

const validateVoter = async () => {
  // Trim once here so a stray space typed by the voter never breaks the
  // match against the ID NUMBER column on the registered-voters list.
  const idNumber = voterIdInput.value.trim();
  const email = emailInput.value.trim();

  if (!idNumber || !email) {
    showToast(
      "Please enter both your LSU ID Number and University Email.",
      "error",
    );
    return;
  }

  loading.value = true;
  try {
    const res = await fetch(`${API_BASE}/validate-voter/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lsu_id_number: idNumber,
        lsu_email: email,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      currentVoter.value = data;
      selectedCandidates.value = [];
      abstainedGroups.value = new Set();
      showToast("Authentication successful.", "success");

      if (!data.has_voted && candidates.value.length === 0) {
        await fetchCandidates();
      }
    } else {
      showToast(
        data.error ||
          "We couldn't find a matching registered voter. Please check your ID number and email.",
        "error",
      );
    }
  } catch (err) {
    showToast("Authentication failed. Server error.", "error");
  } finally {
    loading.value = false;
  }
};

const castVote = async () => {
  if (isBallotEmpty.value) return;
  loading.value = true;
  try {
    const res = await fetch(`${API_BASE}/cast-vote/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lsu_id_number: currentVoter.value.lsu_id_number,
        candidate_ids: selectedCandidates.value,
        abstained_positions: buildAbstainedPayload(),
      }),
    });
    if (res.ok) {
      showToast("Vote cast successfully! A ballot receipt has been sent to your email.", "success");
      // Update local state to show lock screen
      currentVoter.value.has_voted = true;
      currentVoter.value.voted_at = new Date().toISOString();
      currentVoter.value.abstained_positions = buildAbstainedPayload();
      // Fetch full details of the candidates they just selected
      currentVoter.value.voted_candidates_details = candidates.value.filter(
        (c) => selectedCandidates.value.includes(c.id),
      );

      // Show the official ballot receipt right away, built from the live
      // selection (selectedCandidates/abstainedGroups are still intact).
      generateReceipt();

      // Optionally emit an event to the parent to switch to the Results tab
      // window.dispatchEvent(new CustomEvent('vote-cast-success'));
    } else {
      const data = await res.json();
      showToast(data.error || "Failed to cast vote.", "error");
    }
  } catch (err) {
    showToast("An error occurred while submitting your vote.", "error");
  } finally {
    loading.value = false;
  }
};

const usgCandidatesGrouped = computed(() => {
  const groups = {};
  if (!currentVoter.value) return groups;

  candidates.value.forEach((c) => {
    if (c.category && (c.category.toLowerCase() === "all colleges" || c.category.toUpperCase() === "LSU-USG")) {
      if (!groups[c.title_position]) {
        groups[c.title_position] = [];
      }
      groups[c.title_position].push(c);
    }
  });
  return sortGroupsByPosition(groups);
});

// Maps the voter's college to the correct SC-xxx category key.
// Special case: College of Engineering and Architecture (CEA) and
// College of Computer Studies (CCS) are merged under SC-CCSEA.
// Special case: College of Business and College of Accountancy
// are merged under SC-CBA.
const getVoterLocalCategory = (voter) => {
  if (!voter || !voter.college) return null;
  const college = voter.college.toUpperCase().trim();

  // Merged college: CCSEA — Engineering + Computer Studies
  const ccsea = [
    "CCSEA",
    "COLLEGE OF COMPUTER STUDIES",
    "COLLEGE OF ENGINEERING",
    "COMPUTER STUDIES",
    "ENGINEERING AND ARCHITECTURE",
    "ENGINEERING & ARCHITECTURE",
    "CEA",
    "CCS",
  ];
  if (ccsea.some((kw) => college.includes(kw))) {
    return "SC-CCSEA";
  }

  // Merged college: CBA — Business + Accountancy
  const cba = [
    "CBA",
    "COLLEGE OF BUSINESS",
    "COLLEGE OF ACCOUNTANCY",
    "BUSINESS ADMINISTRATION",
    "ACCOUNTANCY",
  ];
  if (cba.some((kw) => college.includes(kw))) {
    return "SC-CBA";
  }

  // Merged college: CTHM — College / School of Tourism and Hospitality Management
  const cthm = [
    "CTHM",
    "COLLEGE OF TOURISM",
    "SCHOOL OF TOURISM",
    "TOURISM AND HOSPITALITY",
    "TOURISM & HOSPITALITY",
    "HOSPITALITY MANAGEMENT",
  ];
  if (cthm.some((kw) => college.includes(kw))) {
    return "SC-CTHM";
  }

  // College: CAS — College of Arts and Sciences
  const cas = [
    "CAS",
    "COLLEGE OF ARTS AND SCIENCES",
    "COLLEGE OF ARTS & SCIENCES",
    "ARTS AND SCIENCES",
    "ARTS & SCIENCES",
  ];
  if (cas.some((kw) => college.includes(kw))) {
    return "SC-CAS";
  }

  // College: CTE — College of Teacher Education
  const cte = [
    "CTE",
    "COLLEGE OF TEACHER EDUCATION",
    "TEACHER EDUCATION",
  ];
  if (cte.some((kw) => college.includes(kw))) {
    return "SC-CTE";
  }

  // College: CON — College of Nursing
  const con = [
    "CON",
    "COLLEGE OF NURSING",
    "NURSING",
  ];
  if (con.some((kw) => college.includes(kw))) {
    return "SC-CON";
  }

  // College: CCJE — College of Criminal Justice Education
  // Falls under the CAS (College of Arts and Sciences) local council.
  const ccje = [
    "CCJE",
    "COLLEGE OF CRIMINAL JUSTICE",
    "CRIMINAL JUSTICE EDUCATION",
    "CRIMINAL JUSTICE",
    "CRIMINOLOGY",
  ];
  if (ccje.some((kw) => college.includes(kw))) {
    return "SC-CAS";
  }

  // Default: just prefix the stored college abbreviation/name
  return `SC-${college}`;
};

const localCandidatesGrouped = computed(() => {
  const groups = {};
  if (!currentVoter.value || !currentVoter.value.college) return groups;

  const targetCategory = getVoterLocalCategory(currentVoter.value);
  if (!targetCategory) return groups;

  candidates.value.forEach((c) => {
    if (c.category && c.category.toUpperCase() === targetCategory.toUpperCase()) {
      if (!groups[c.title_position]) {
        groups[c.title_position] = [];
      }
      groups[c.title_position].push(c);
    }
  });
  return sortGroupsByPosition(groups, getLocalRank);
});

const aboCandidatesGrouped = computed(() => {
  const groups = {};
  if (!currentVoter.value) return groups;

  const targetABO = getVoterABO(currentVoter.value);
  if (!targetABO) return groups;

  candidates.value.forEach((c) => {
    if (c.category && c.category.toUpperCase() === targetABO.toUpperCase()) {
      if (!groups[c.title_position]) {
        groups[c.title_position] = [];
      }
      groups[c.title_position].push(c);
    }
  });
  return sortGroupsByPosition(groups);
});

const logout = () => {
  currentVoter.value = null;
  voterIdInput.value = "";
  emailInput.value = "";
  abstainedGroups.value = new Set();
  showReceiptModal.value = false;
};

onMounted(() => {
  fetchCandidates();
});
</script>
    </div>
</template>