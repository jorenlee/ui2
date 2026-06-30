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
                :value="user?.email"
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
              :disabled="loading || !voterIdInput"
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
          Object.keys(localCandidatesGrouped).length > 0
        "
      >
        <!-- SECTION 1: USG BALLOT -->
        <div v-if="Object.keys(usgCandidatesGrouped).length > 0" class="mb-16">
          <div class="border-b-4 border-green-700 pb-2 mb-8">
            <h3
              class="text-2xl font-black text-slate-900 uppercase tracking-wide flex items-center gap-3"
            >
              🏛️ University Student Government
              <span
                class="text-sm font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full normal-case tracking-normal"
                >USG</span
              >
            </h3>
            <p class="text-sm text-slate-500 mt-1 font-semibold">
              All enrolled students are eligible to vote for USG candidates.
            </p>
          </div>

          <div
            v-for="(group, position) in usgCandidatesGrouped"
            :key="position"
            class="mb-10"
          >
            <h4
              class="text-lg font-bold text-green-800 bg-green-50/50 px-4 py-2 rounded-lg border-l-4 border-green-600 mb-6"
            >
              {{ position }}
            </h4>
            <div
              class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
            >
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
                  class="hidden"
                />

                <!-- Large Profile Section -->
                <div
                  class="relative w-full aspect-square mb-4 overflow-hidden shadow-inner bg-slate-100 shrink-0"
                >
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

                  <!-- Checkbox indicator overlay at top right of image -->
                  <div
                    :class="[
                      'absolute top-3 right-3 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-md z-10',
                      selectedCandidates.includes(c.id)
                        ? 'border-green-600 bg-green-600 text-white scale-110'
                        : 'border-slate-300 bg-white text-transparent',
                    ]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="3"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                <!-- Text / Info Section -->
                <div class="w-full flex flex-col items-center">
                  <span
                    class="text-[10px] font-bold text-green-700 uppercase tracking-widest bg-green-100/70 px-3 py-1 rounded-full mb-2"
                  >
                    {{ c.title_position }}
                  </span>
                  <h5
                    class="font-extrabold text-slate-800 text-base leading-tight group-hover:text-green-800 transition-colors mb-1"
                  >
                    {{ c.student_name }}
                  </h5>
                  <p
                    class="text-[10px] text-slate-400 font-bold uppercase tracking-wider"
                  >
                    {{ c.college
                    }}<template v-if="c.program"> - {{ c.program }}</template>
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- SECTION 2: LOCAL COUNCIL BALLOT -->
        <div
          v-if="Object.keys(localCandidatesGrouped).length > 0"
          class="mb-16 animate-[fadeIn_0.5s_ease-out]"
        >
          <div class="border-b-4 border-emerald-700 pb-2 mb-8">
            <h3
              class="text-2xl font-black text-slate-900 uppercase tracking-wide flex items-center gap-3"
            >
              🎓 Local Student Council
              <span
                class="text-sm font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full normal-case tracking-normal"
                >SC - {{ currentVoter.college }}</span
              >
            </h3>
            <p class="text-sm text-slate-500 mt-1 font-semibold">
              Exclusively visible and restricted to students belonging to the
              College of {{ currentVoter.college }}.
            </p>
          </div>

          <div
            v-for="(group, position) in localCandidatesGrouped"
            :key="position"
            class="mb-10"
          >
            <h4
              class="text-lg font-bold text-emerald-800 bg-emerald-50/50 px-4 py-2 rounded-lg border-l-4 border-emerald-600 mb-6"
            >
              {{ position }}
            </h4>
            <div
              class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
            >
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
                  class="hidden"
                />

                <!-- Large Profile Section -->
                <div
                  class="relative w-full aspect-square mb-4 overflow-hidden shadow-inner bg-slate-100 shrink-0"
                >
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

                  <!-- Checkbox indicator overlay at top right of image -->
                  <div
                    :class="[
                      'absolute top-3 right-3 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-md z-10',
                      selectedCandidates.includes(c.id)
                        ? 'border-emerald-600 bg-emerald-600 text-white scale-110'
                        : 'border-slate-300 bg-white text-transparent',
                    ]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="3"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                <!-- Text / Info Section -->
                <div class="w-full flex flex-col items-center">
                  <span
                    class="text-[10px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-100/70 px-3 py-1 rounded-full mb-2"
                  >
                    {{ c.title_position }}
                  </span>
                  <h5
                    class="font-extrabold text-slate-800 text-base leading-tight group-hover:text-emerald-800 transition-colors mb-1"
                  >
                    {{ c.student_name }}
                  </h5>
                  <p
                    class="text-[10px] text-slate-400 font-bold uppercase tracking-wider"
                  >
                    {{ c.college
                    }}<template v-if="c.program"> - {{ c.program }}</template>
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="text-center mt-16 pt-8 border-t border-slate-200">
          <button
            @click="castVote"
            :disabled="loading || selectedCandidates.length === 0"
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
          There are no USG candidates or local council candidates matching your
          college ({{ currentVoter.college }}) available at the moment.
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
import { ref, onMounted, computed } from "vue";

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
const currentVoter = ref(null);
const selectedCandidates = ref([]);

const toast = ref({ show: false, type: "", message: "" });
const showToast = (message, type = "error") => {
  toast.value = { show: true, type, message };
  setTimeout(() => {
    toast.value.show = false;
  }, 5000);
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
  if (!voterIdInput.value || !user.value?.email) {
    showToast(
      "Missing ID or Email. Please make sure you are logged in.",
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
        lsu_id_number: voterIdInput.value,
        lsu_email: user.value.email,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      currentVoter.value = data;
      selectedCandidates.value = [];
      showToast("Authentication successful.", "success");

      if (!data.has_voted && candidates.value.length === 0) {
        await fetchCandidates();
      }
    } else {
      showToast(
        data.error || "Voter not found. Please check your ID.",
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
  if (selectedCandidates.value.length === 0) return;
  loading.value = true;
  try {
    const res = await fetch(`${API_BASE}/cast-vote/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lsu_id_number: currentVoter.value.lsu_id_number,
        candidate_ids: selectedCandidates.value,
      }),
    });
    if (res.ok) {
      showToast("Vote cast successfully!", "success");
      // Update local state to show lock screen
      currentVoter.value.has_voted = true;
      // Fetch full details of the candidates they just selected
      currentVoter.value.voted_candidates_details = candidates.value.filter(
        (c) => selectedCandidates.value.includes(c.id),
      );

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
    if (c.category && c.category.toLowerCase() === "all colleges") {
      if (!groups[c.title_position]) {
        groups[c.title_position] = [];
      }
      groups[c.title_position].push(c);
    }
  });
  return groups;
});

const localCandidatesGrouped = computed(() => {
  const groups = {};
  if (!currentVoter.value || !currentVoter.value.college) return groups;

  const targetCategory = `SC-${currentVoter.value.college.toUpperCase()}`;
  candidates.value.forEach((c) => {
    if (c.category && c.category.toUpperCase() === targetCategory) {
      if (!groups[c.title_position]) {
        groups[c.title_position] = [];
      }
      groups[c.title_position].push(c);
    }
  });
  return groups;
});

const logout = () => {
  currentVoter.value = null;
  voterIdInput.value = "";
};

onMounted(() => {
  fetchCandidates();
});
</script>
