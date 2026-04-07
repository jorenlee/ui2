<script setup>
defineProps({
  darkMode: Boolean
});

defineEmits(["cancel", "confirm"]);
</script>

<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">

    <div
      class="w-full max-w-md rounded-3xl p-8 shadow-2xl text-center"
      :class="darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'"
    >

      <div class="mb-6">
        <div class="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
          <i class="fa fa-sign-out text-white text-3xl"></i>
        </div>
      </div>

      <h3 class="text-2xl font-bold mb-2">
        Logout Confirmation
      </h3>

      <p class="mb-8 opacity-70">
        Are you sure you want to log out of your account?
      </p>

      <div class="flex gap-3">
        <button
          @click="$emit('cancel')"
          class="flex-1 px-6 py-3 rounded-xl border"
        >
          Cancel
        </button>

        <button
          @click="$emit('confirm')"
          class="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white"
        >
          Logout
        </button>
      </div>

    </div>

  </div>
</template>