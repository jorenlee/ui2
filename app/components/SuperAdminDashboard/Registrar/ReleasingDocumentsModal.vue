<template>
    <div v-if="showReleasingDocModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        @click="$emit('closeReleasingDocModal')">
        <div class="rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-transform duration-300" :class="[
            {
                'scale-100 opacity-100': showReleasingDocModal,
                'scale-95 opacity-0': !showReleasingDocModal,
            },
            darkMode ? 'bg-gray-800' : 'bg-white',
        ]" @click.stop>
            <div class="flex justify-between items-center mb-4 border-b pb-3" :class="darkMode ? 'border-gray-700' : 'border-gray-200'
                ">
                <h3 class="text-lg font-medium" :class="darkMode ? 'text-gray-200' : 'text-gray-900'
                    ">
                    Releasing Documents
                </h3>
                <button @click="$emit('closeReleasingDocModal')" class="hover:text-gray-500" :class="darkMode ? 'text-gray-400' : 'text-gray-400'
                    ">
                    <i class="fa fa-times"></i>
                </button>
            </div>

            <!-- Verified Button -->
            <div @click="$emit('confirmReleasingDoc', currentItem)"
                class="w-full text-center px-2 py-1 font-bold bg-green-600 text-white rounded-md mt-2 cursor-pointer hover:bg-white border hover:border-green-600 transition-colors"
                :class="[
                    {
                        'opacity-75 cursor-not-allowed': isConfirming,
                    },
                    darkMode
                        ? 'hover:text-green-400'
                        : 'hover:text-green-600',
                ]">
                <span v-if="isConfirming">
                    <i class="fa fa-spinner fa-spin mr-1"></i>
                    Confirming...
                </span>
                <span v-else>Confirm</span>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    showReleasingDocModal: Boolean,
    currentItem: Object,
    darkMode: Boolean,
    isConfirming: Boolean,
})

const emit = defineEmits(['closeReleasingDocModal', 'confirmReleasingDoc'])
</script>