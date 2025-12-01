<script setup>
    defineProps({
        totalPages: Number,
        currentPage: Number,
    });

    defineEmits(["change"]);
</script>
<template>
    <div class="max-m w-lg mx-auto flex items center divide-x divide-gray-100">
        <button class="bg-gray-500 text-gray-50 p-3" @click="$emit('change', pageNumber)"
            v-for="pageNumber in totalPages" :key="pageNumber">
            {{ pageNumber }}
        </button>
    </div>
</template>