<template>
    <div v-if="showLogsModal"
        class="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300" :class="darkMode
                ? 'bg-black/70 backdrop-blur-sm'
                : 'bg-black/50 backdrop-blur-xs'
            " @click="$emit('closeLogsModal')">
        <div class="rounded-lg p-6 max-w-2xl w-full mx-4 transform transition-transform duration-300 max-h-[90vh] overflow-auto"
            :class="[
                darkMode
                    ? 'bg-gray-900 text-gray-200'
                    : 'bg-white text-gray-900',
                showLogsModal
                    ? 'scale-100 opacity-100'
                    : 'scale-95 opacity-0',
            ]" @click.stop>
            <!-- Header -->
            <div class="flex justify-between items-center mb-4 border-b pb-3" :class="darkMode ? 'border-gray-700' : 'border-gray-300'
                ">
                <h3 class="text-lg font-medium">
                    Status Logs -
                    {{ currentItem?.tracking_id || "N/A" }}
                </h3>
                <button @click="$emit('closeLogsModal')" :class="darkMode
                        ? 'text-gray-400 hover:text-gray-200'
                        : 'text-gray-400 hover:text-gray-500'
                    ">
                    <i class="fa fa-times"></i>
                </button>
            </div>

            <!-- Logs List -->
            <div class="mb-6 max-h-[40vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-green-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-green-700">
                <div v-if="
                    !currentItem?.logs ||
                    currentItem.logs.length === 0
                " :class="darkMode ? 'text-gray-400' : 'text-gray-500'
                                    " class="text-center py-4">
                    No logs available
                </div>

                <div v-else class="space-y-3">
                    <div v-for="(log, index) in sortedLogs" :key="index" class="border-l-4 rounded-r text-[10px]"
                        :class="[
                            index === sortedLogs.length - 1
                                ? darkMode
                                    ? 'border-green-500 bg-green-800/20 py-3'
                                    : 'border-green-500 bg-green-50 py-3'
                                : darkMode
                                    ? 'border-gray-600 bg-gray-800/30'
                                    : 'border-gray-300 bg-gray-50',
                        ]">
                        <div class="flex items-center justify-between capitalize gap-x-3">
                            <div class="font-medium w-9/12" :class="index === sortedLogs.length - 1
                                    ? darkMode
                                        ? 'text-green-400 text-sm'
                                        : 'text-green-800 text-sm'
                                    : darkMode
                                        ? 'text-gray-300'
                                        : 'text-gray-500'
                                ">
                                <div class="w-full bg-transparent focus:outline-none px-1" :class="index === sortedLogs.length - 1
                                        ? darkMode
                                            ? 'border-green-600 focus:border-green-400'
                                            : 'border-green-300 focus:border-green-500'
                                        : darkMode
                                            ? 'border-gray-600 focus:border-gray-400'
                                            : 'border-gray-300 focus:border-gray-500'
                                    ">
                                    {{ log.status_remarks }}
                                </div>
                            </div>
                            <div class="w-3/12 text-center">
                                <div class="whitespace-nowrap bg-transparent -mb-0.5 focus:outline-none px-1 pb-0.5"
                                    :class="index === sortedLogs.length - 1
                                            ? darkMode
                                                ? 'border-green-600 focus:border-green-400'
                                                : 'border-green-300 focus:border-green-500'
                                            : darkMode
                                                ? 'border-gray-600 focus:border-gray-400'
                                                : 'border-gray-300 focus:border-gray-500'
                                        ">
                                    {{ log.timestamp }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    showLogsModal: Boolean,
    currentItem: Object,
    darkMode: Boolean,
    sortedLogs: Array,
});

const emit = defineEmits(['closeLogsModal']);
</script>