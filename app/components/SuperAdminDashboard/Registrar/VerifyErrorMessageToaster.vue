<template>
    <div v-if="verifyErrorMessage" class="fixed inset-0 z-[1000] bg-opacity-90 flex flex-col items-center justify-center p-4" :class="props.darkMode
        ? 'bg-gray-800 text-white'
        : 'bg-white text-red-900'
        ">
        <p class="text-white text-lg font-semibold text-center mb-6">
            {{ verifyErrorMessage }}
        </p>
        <button @click="closeErrorMessage" 
            class="px-8 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            Dismiss
        </button>
    </div>
</template>

<script setup>
const props = defineProps({
    darkMode: Boolean,
    verifyErrorMessage: String,
    closeErrorMessage: Function
})
</script>