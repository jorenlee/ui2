<template>
    <div class="flex justify-center my-4">
        <!-- Prev Button -->
        <button :disabled="currentPage === 1" @click="$emit('update:currentPage', currentPage - 1)" :class="[
            'px-2 py-2 mx-1 rounded transition-colors duration-200',
            darkMode
                ? currentPage === 1
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-800 text-gray-200 hover:bg-gray-600 hover:text-white'
                : currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-500 hover:text-white',
        ]">
            Prev
        </button>

        <!-- Page Numbers -->
        <button v-for="page in visiblePages" :key="page" @click="$emit('update:currentPage', page)" :class="[
            'px-4 py-2 mx-1 rounded transition-colors duration-200',
            currentPage === page
                ? darkMode
                    ? 'bg-green-700 text-white'
                    : 'bg-green-800 text-white'
                : darkMode
                    ? 'bg-gray-800 text-gray-200 hover:bg-gray-600 hover:text-white'
                    : 'bg-gray-200 text-gray-900 hover:bg-green-500 hover:text-white',
        ]">
            {{ page }}
        </button>

        <!-- Next Button -->
        <button :disabled="currentPage === totalPages" @click="$emit('update:currentPage', currentPage + 1)" :class="[
            'px-2 py-2 mx-1 rounded transition-colors duration-200',
            darkMode
                ? currentPage === totalPages
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-800 text-gray-200 hover:bg-gray-600 hover:text-white'
                : currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-500 hover:text-white',
        ]">
            Next
        </button>
    </div>
</template>

<script setup>
const props = defineProps({
    currentPage: Number,
    totalPages: Number,
    visiblePages: Array,
    darkMode: Boolean,
});

const emit = defineEmits(['update:currentPage']);
</script>