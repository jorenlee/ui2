<template>
    <div v-if="verifySuccessMessage" class="fixed inset-0 z-[1000] bg-opacity-90 flex flex-col items-center justify-center p-4"
        :class="props.darkMode ? 'bg-gray-800' : 'bg-gray-100'">
        <p class="text-white text-lg font-semibold text-center mb-6">
            {{ verifySuccessMessage }}
        </p>
        <button @click="closeSuccessToast" 
            class="px-8 py-3 bg-white text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            Continue
        </button>
    </div>
</template>

<script setup>
const props = defineProps({
    darkMode: Boolean,
    verifySuccessMessage: String,
    closeSuccessToast: Function
})
</script>