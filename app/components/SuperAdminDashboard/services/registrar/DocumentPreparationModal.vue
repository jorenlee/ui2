<template>
    <div v-if="showPrepDocModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        @click="$emit('closePrepDocModal')">
        <div class="rounded-xl shadow-3xl p-6 w-full max-w-sm mx-4 transform transition-all duration-300 ease-out" :class="[
            {
                'scale-100 opacity-100': showPrepDocModal,
                'scale-95 opacity-0': !showPrepDocModal,
            },
            darkMode ? 'bg-gray-800' : 'bg-white',
        ]" @click.stop>
            <div class="flex items-center justify-between pb-4 mb-4 border-b" :class="darkMode ? 'border-gray-700' : 'border-gray-200'
                ">
                <h2 class="text-xl font-bold" :class="darkMode ? 'text-gray-100' : 'text-gray-800'
                    ">
                    Verify & Prepare Documents
                </h2>
                <button @click="$emit('closePrepDocModal')" class="transition-colors duration-200 p-1 rounded-full"
                    :class="darkMode
                            ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        ">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                        <path fill-rule="evenodd"
                            d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                            clip-rule="evenodd" />
                    </svg>
                </button>
            </div>

            <div class="pt-4">
                <button @click="$emit('confirmPrepDoc', currentItem)"
                    class="w-full flex items-center justify-center gap-2 px-4 py-0.5 text-base font-semibold rounded-lg transition-all duration-250 ease-in-out"
                    :class="{
                        'bg-green-600 hover:bg-white hover:text-green-600 text-white hover:border hover:border-green-600 shadow-md hover:shadow-lg':
                            !isConfirming,
                        'bg-gray-400 text-white cursor-not-allowed':
                            isConfirming,
                    }" :disabled="isConfirming">
                    <span v-if="isConfirming" class="flex items-center gap-2">
                        <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        Notifying...
                    </span>
                    <span v-else>Notify</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    showPrepDocModal: Boolean,
    currentItem: Object,
    darkMode: Boolean,
    isConfirming: Boolean,
});

const emit = defineEmits(['closePrepDocModal', 'confirmPrepDoc']);
</script>