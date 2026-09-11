<template>
    <div v-if="verifySuccessMessage" class="fixed inset-0 z-[1000] flex flex-col items-center justify-center p-4 backdrop-blur-sm transition-all"
        :class="props.darkMode ? 'bg-gray-900/80' : 'bg-gray-500/50'">
        <div class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full border border-gray-200 dark:border-gray-700 transform transition-all scale-100 opacity-100">
            <div class="w-16 h-16 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                <i class="fas fa-check text-2xl"></i>
            </div>
            <p class="text-gray-900 dark:text-white text-xl font-bold text-center mb-6 leading-relaxed">
                {{ verifySuccessMessage.replace(/✅ /g, '') }}
            </p>
            <button @click="closeSuccessToast" 
                class="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                Continue
            </button>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    darkMode: Boolean,
    verifySuccessMessage: String,
    closeSuccessToast: Function
})
</script>