<template>
            <div
          :class="
            darkMode
              ? 'lg:mx-2 mx-2 shadow-lg rounded-lg p-1 bg-gray-800 border border-gray-700'
              : 'lg:mx-2 mx-2 shadow-lg rounded-lg p-1 bg-white border border-gray-200'
          "
        >
          <div class="lg:flex gap-2">
            <div
              v-for="college in colleges"
              :key="college.value"
              :class="
                darkMode
                  ? 'border border-gray-700 bg-gray-800 rounded-lg px-2 py-1 shadow-sm w-full lg:mb-0 mb-2'
                  : 'border border-gray-300 bg-white rounded-lg px-2 py-1 shadow-sm w-full lg:mb-0 mb-2'
              "
            >
              <!-- College Name -->
              <div
                class="whitespace-nowrap tracking-tight"
                :class="
                  darkMode
                    ? 'font-semibold text-[10px] text-gray-100 text-center'
                    : 'font-semibold text-[10px] text-gray-800 text-center'
                "
              >
                {{ college.label }}
              </div>

              <!-- Emails -->
              <div
                :class="
                  darkMode
                    ? 'text-[10px] text-gray-400 text-center'
                    : 'text-[10px] text-gray-500 text-center'
                "
              >
                {{ getEmailsForCollege(college.value).join(", ") }}
              </div>

              <!-- Stats Pills -->
              <div class="flex flex-wrap mx-auto w-fit gap-1 mt-1 text-[11px]">
                <!-- Pending -->
                <span
                  :class="
                    darkMode
                      ? 'border border-red-400 text-red-300 bg-red-900/20 px-2 py-0.5 rounded-full font-semibold'
                      : 'border border-red-300 text-red-800 bg-red-50 px-2 py-0.5 rounded-full font-semibold'
                  "
                >
                  Pending: {{ pendingCount(college.value) }}
                </span>

                <!-- Done -->
                <span
                  :class="
                    darkMode
                      ? 'border border-green-400 text-green-300 bg-green-900/20 px-2 py-0.5 rounded-full font-semibold'
                      : 'border border-green-300 text-green-800 bg-green-50 px-2 py-0.5 rounded-full font-semibold'
                  "
                >
                  Done: {{ doneCount(college.value) }}
                </span>

                <!-- Total -->
                <span
                  :class="
                    darkMode
                      ? 'border border-emerald-400 text-emerald-300 bg-emerald-900/20 px-2 py-0.5 rounded-full font-semibold'
                      : 'border border-emerald-300 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold'
                  "
                >
                  Total: {{ totalCount(college.value) }}
                </span>
              </div>
            </div>
          </div>
        </div>

</template>

<script setup>
  const props = defineProps({
    darkMode: Boolean,
    colleges: Array,
    pendingCount: Function,
    doneCount: Function,
    totalCount: Function,
    getEmailsForCollege: Function,
  });
</script>