<template>
    <div v-if="toggleConfirmDelete"
        class="fixed inset-0 z-50 flex items-center justify-center bg-emerald-900/60 backdrop-blur-sm transition-opacity duration-300"
        @click="$emit('cancelDelete')">
        <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-transform duration-300"
            :class="{
                'scale-100 opacity-100': toggleConfirmDelete,
                'scale-95 opacity-0': !toggleConfirmDelete,
            }" @click.stop>
            <div class="text-center">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <i class="fa fa-exclamation-triangle text-red-600 text-xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">
                    Confirm Deletion
                </h3>
                <p class="text-sm text-gray-500 mb-6">
                    Are you sure you want to delete
                    {{
                        selectedItems.length === 1
                            ? "this record"
                            : "these " + selectedItems.length + " records"
                    }}? This action cannot be undone.
                </p>
            </div>
            <div class="flex justify-center gap-4">
                <button @click="$emit('deleteItems')"
                    class="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-colors duration-200"
                    :disabled="isDeleting">
                    <i class="fa fa-spinner fa-spin mr-2" v-if="isDeleting"></i>
                    {{ isDeleting ? "Deleting..." : "Delete" }}
                </button>
                <button @click="$emit('cancelDelete')"
                    class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 transition-colors duration-200"
                    :disabled="isDeleting">
                    Cancel
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    toggleConfirmDelete: Boolean,
    selectedItems: Array,
    isDeleting: Boolean,
});

const emit = defineEmits(['deleteItems', 'cancelDelete']);
</script>