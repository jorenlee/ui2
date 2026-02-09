<template>
    <div>
              <!-- Mood Icon Legend -->
      <div
        class="lg:flex hidden mb-4 p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 shadow-sm"
      >
        <div
          class="text-[10px] flex gap-x-6 gap-y-2 items-center justify-center text-xs"
        >
          <div class="flex items-center gap-1">
            <div
              class="w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-md"
            >
              <span class="text-lg">😊</span>
            </div>
            <span class="font-medium text-gray-700">
              New ticket (&lt; 24 hours)
            </span>
          </div>
          <div class="flex items-center gap-1">
            <div
              class="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-md"
            >
              <span class="text-lg">😐</span>
            </div>
            <span class="font-medium text-gray-700">
              Aging ticket (24-48 hours)
            </span>
          </div>
          <div class="flex items-center gap-1">
            <div
              class="w-6 h-6 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center shadow-md"
            >
              <span class="text-lg">☹️</span>
            </div>
            <span class="font-medium text-gray-700">
              Overdue ticket (48+ hours, not done)
            </span>
          </div>
          <div class="flex items-center gap-1">
            <div
              class="w-6 h-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-md"
            >
              <span class="text-lg">🏆</span>
            </div>
            <span class="font-medium text-gray-700"> Completed tickets </span>
          </div>
        </div>
      </div>
    </div>
</template>