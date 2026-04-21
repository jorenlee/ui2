<template>
    <div v-if="showChatModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        @click="$emit('closeChatModal')">
        <div class="rounded-xl shadow-2xl w-full max-w-3xl mx-4 transform transition-transform duration-300 max-h-[90vh] overflow-hidden flex flex-col"
            :class="[
                {
                    'scale-100 opacity-100': showChatModal,
                    'scale-95 opacity-0': !showChatModal,
                },
                darkMode ? 'bg-gray-800' : 'bg-white',
            ]" @click.stop>
            <!-- Modal Header -->
            <div class="flex justify-between items-center p-5 border-b bg-gradient-to-r from-green-600 to-green-700">
                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                    <i class="fa fa-comments"></i>
                    Communication Chat -
                    {{ currentItem?.tracking_id || "N/A" }}
                </h3>
                <button @click="$emit('closeChatModal')" class="text-white hover:text-gray-200 transition-colors">
                    <i class="fa fa-times text-xl"></i>
                </button>
            </div>

            <!-- Pinned Documents Section -->
            <div v-if="
                (currentItem?.additional_documents &&
                    currentItem.additional_documents.length > 0 &&
                    currentItem.additional_documents[0].name !==
                    'N/A') ||
                (currentItem?.valid_id_front &&
                    currentItem.valid_id_front.length > 0) ||
                (currentItem?.valid_id_back &&
                    currentItem.valid_id_back.length > 0)
            " class="p-4 border-b-2" :class="darkMode
                ? 'bg-gray-900 border-gray-700'
                : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
                ">
                <div class="text-xs font-bold uppercase mb-3 flex items-center gap-2" :class="darkMode ? 'text-gray-200' : 'text-gray-700'
                    ">
                    <i class="fa fa-thumb-tack text-green-500"></i>
                    <i class="fa fa-paperclip text-green-500"></i>
                    <span>Attached Documents</span>
                </div>

                <div class="flex gap-3 overflow-x-auto pb-2">
                    <div v-if="
                        currentItem?.additional_documents &&
                        currentItem.additional_documents.length >
                        0 &&
                        currentItem.additional_documents[0].name !==
                        'N/A'
                    " v-for="(file, index) in currentItem.additional_documents" :key="'doc-' + index"
                        class="flex-shrink-0">
                        <div :class="[
                            'rounded-xl w-20 hover:shadow-lg transition-all hover:scale-105',
                            file.url !== 'N/A'
                                ? darkMode
                                    ? 'bg-gray-800 border-2 border-gray-600'
                                    : 'bg-white border-2 border-blue-300'
                                : '',
                        ]">
                            <img v-if="
                                file.url &&
                                (file.url.includes('jpg') ||
                                    file.url.includes('jpeg') ||
                                    file.url.includes('png'))
                            " :src="getCleanUrl(file.url)" alt="Document"
                                class="w-full h-20 object-cover rounded-lg border cursor-pointer" :class="darkMode
                                        ? 'border-gray-600'
                                        : 'border-gray-300'
                                    " @click="$emit('openImageModal', file.url)" />

                            <div v-else class="w-full h-20 rounded-lg flex items-center justify-center mb-2" :class="darkMode ? 'bg-gray-800' : 'bg-blue-100'
                                ">
                                <i class="fa fa-file-pdf-o text-3xl" :class="darkMode
                                        ? 'text-red-500'
                                        : 'text-red-600'
                                    " v-if="
                                        file.name &&
                                        file.name.includes('.pdf')
                                    "></i>
                                <i class="fa fa-file-word-o text-3xl" :class="darkMode
                                        ? 'text-blue-400'
                                        : 'text-blue-600'
                                    " v-else-if="
                                        file.name &&
                                        (file.name.includes('.doc') ||
                                            file.name.includes('.docx'))
                                    "></i>
                                <i class="fa fa-file-o text-3xl" :class="darkMode
                                        ? 'text-gray-400'
                                        : 'text-gray-600'
                                    "></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Chat Messages -->
            <div class="flex-1 p-5 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-green-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-green-700"
                :class="darkMode ? 'bg-gray-900/50' : 'bg-gray-50'" style="max-height: 400px">
                <template v-if="
                    currentItem && Array.isArray(
                        currentItem.additional_response_details,
                    ) &&
                    currentItem.additional_response_details
                        .length > 0 &&
                    currentItem.additional_response_details[0]
                        .message !== 'N/A'
                ">
                    <div v-for="(msg, index) in currentItem.additional_response_details" :key="'msg-' + index" :class="msg.sender === 'Registrar'
                            ? 'flex gap-3 flex-row-reverse animate-fade-in'
                            : 'flex gap-3 animate-fade-in'
                        ">
                        <div class="flex-shrink-0">
                            <div v-if="msg.sender === 'Registrar'"
                                class="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white shadow-md">
                                <i class="fa fa-user-tie"></i>
                            </div>
                            <div v-else
                                class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-md">
                                {{ currentItem.firstname?.charAt(0) }}{{ currentItem.lastname?.charAt(0) }}
                            </div>
                        </div>

                        <div :class="msg.sender === 'Registrar'
                                ? 'flex-1 text-right'
                                : 'flex-1'
                            ">
                            <div :class="msg.sender === 'Registrar'
                                    ? 'flex items-center gap-2 mb-1 justify-end'
                                    : 'flex items-center gap-2 mb-1'
                                ">
                                <span v-if="msg.sender === 'Registrar'" class="text-xs" :class="darkMode
                                        ? 'text-gray-400'
                                        : 'text-gray-500'
                                    ">Registrar</span>
                                <span class="text-sm font-bold" :class="darkMode
                                        ? 'text-gray-200'
                                        : 'text-gray-900'
                                    ">{{
                                        msg.sender === "Registrar"
                                            ? "You"
                                            : currentItem.firstname +
                                            " " +
                                            currentItem.lastname
                                    }}</span>
                                <span v-if="msg.sender !== 'Registrar'" class="text-xs" :class="darkMode
                                        ? 'text-gray-400'
                                        : 'text-gray-500'
                                    ">Applicant</span>
                            </div>

                            <div :class="msg.sender === 'Registrar'
                                    ? 'bg-gradient-to-r from-green-500 to-green-600 rounded-2xl rounded-tr-none px-4 py-3 shadow-md inline-block text-left'
                                    : darkMode
                                        ? 'bg-gray-700 border border-gray-600 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm'
                                        : 'bg-white border border-blue-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm'
                                ">
                                <p :class="msg.sender === 'Registrar'
                                        ? 'text-sm text-white'
                                        : darkMode
                                            ? 'text-sm text-gray-200'
                                            : 'text-sm text-gray-800'
                                    ">
                                    {{ msg.message }}
                                </p>
                                <p :class="msg.sender === 'Registrar'
                                        ? 'text-xs text-white/70 mt-1'
                                        : darkMode
                                            ? 'text-xs text-gray-400 mt-1'
                                            : 'text-xs text-gray-500 mt-1'
                                    ">
                                    {{ msg.timestamp }}
                                </p>
                            </div>
                        </div>
                    </div>
                </template>

                <div v-if="
                    !currentItem || !Array.isArray(
                        currentItem.additional_response_details,
                    ) ||
                    currentItem.additional_response_details
                        .length === 0 ||
                    currentItem.additional_response_details[0]
                        .message === 'N/A'
                " class="text-center py-8">
                    <i class="fa fa-comment-slash text-gray-300 text-4xl mb-3"></i>
                    <p class="text-sm text-gray-500">
                        No messages yet
                    </p>
                </div>
            </div>

            <!-- Chat Input -->
            <div class="p-4 border-t" :class="darkMode
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                ">
                <label class="text-xs font-semibold mb-2 flex items-center gap-2" :class="darkMode ? 'text-gray-300' : 'text-gray-700'
                    ">
                    <i class="fa fa-pencil text-green-600"></i>
                    Send Follow-up Message
                </label>
                <div class="relative">
                    <textarea
                        class="w-full border-2 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                        :class="darkMode
                                ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                            " placeholder="Type your follow-up remarks here..." 
                        :value="modelValue"
                        @input="$emit('update:modelValue', $event.target.value)"
                        rows="3"></textarea>
                </div>
                <button @click="$emit('sendFollowUpMessage', currentItem)" :disabled="!modelValue?.trim()"
                    class="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-md hover:shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    <i class="fa fa-paper-plane"></i>
                    <span>Send Message</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    currentItem: Object,
    showChatModal: Boolean,
    modelValue: String, // mapped to newFollowUpMessage
    getCleanUrl: Function,
    darkMode: Boolean,
});

const emit = defineEmits(['closeChatModal', 'sendFollowUpMessage', 'openImageModal', 'update:modelValue']);
</script>

<style scoped>
@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fade-in 0.3s ease-out;
}
</style>