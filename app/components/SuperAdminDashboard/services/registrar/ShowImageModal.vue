<template>
    <div v-if="showImageModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-emerald-900/70 backdrop-blur-md"
        @click="$emit('closeImageModal')">
        <div class="relative max-w-4xl max-h-[90vh] overflow-auto bg-white p-2 rounded-lg" @click.stop>
            <button @click="$emit('closeImageModal')"
                class="absolute top-2 right-2 text-gray-700 hover:text-red-500 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                <i class="fa fa-close"></i>
            </button>
            <img :src="getCleanUrl(currentModalImage)" class="max-w-full max-h-[85vh] object-contain" />
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    showImageModal: Boolean,
    getCleanUrl: Function,
    currentModalImage: String,
});

const emit = defineEmits(['closeImageModal']);
</script>