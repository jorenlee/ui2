<template>
    <div v-if="showPaymentModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        @click="$emit('closePaymentModal')">
        <div class="rounded-xl shadow-2xl p-6 w-full max-w-3xl mx-4 transform transition-transform duration-300 max-h-[90vh] overflow-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-green-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-green-700"
            :class="[
                {
                    'scale-100 opacity-100': showPaymentModal,
                    'scale-95 opacity-0': !showPaymentModal,
                },
                darkMode ? 'bg-gray-800' : 'bg-white',
            ]" @click.stop>
            <div class="flex justify-between items-center mb-4 border-b pb-3" :class="darkMode
                    ? 'border-gray-700'
                    : 'border-gray-200'
                ">
                <h3 class="text-lg font-medium" :class="darkMode ? 'text-gray-200' : 'text-gray-900'
                    ">
                    Payment Information
                </h3>
                <button @click="$emit('closePaymentModal')" class="hover:text-gray-500" :class="darkMode ? 'text-gray-400' : 'text-gray-400'
                    ">
                    <i class="fa fa-times"></i>
                </button>
            </div>

            <div class="border px-5 py-4 my-4 rounded-xl shadow-sm" :class="darkMode
                    ? 'border-gray-700 bg-gray-900/50'
                    : 'border-gray-200 bg-gray-50/50'
                ">
                <!-- Header Fields -->
                <div class="grid lg:grid-cols-2 md:grid-cols-2 gap-4 mb-3">
                    <div>
                        <label class="block text-xs font-medium mb-1" :class="darkMode
                                ? 'text-gray-300'
                                : 'text-gray-700'
                            ">Total :
                            {{ currentItemInfo.total }}</label>
                    </div>
                </div>

                <!-- Detail Fees -->
                <div class="mt-4">
                    <!-- Display message if no fees exist -->
                    <div v-if="
                        !currentItemInfo?.detail_fees_type_document_requests ||
                        currentItemInfo
                            .detail_fees_type_document_requests
                            .length === 0
                    " class="text-center py-6 rounded-lg border-2 border-dashed mb-4" :class="darkMode
                        ? 'bg-gray-800/50 border-gray-700'
                        : 'bg-gray-50 border-gray-300'
                        ">
                        <i class="fa fa-file-invoice-dollar text-3xl mb-2" :class="darkMode
                                ? 'text-gray-500'
                                : 'text-gray-400'
                            "></i>
                        <p class="text-sm" :class="darkMode
                                ? 'text-gray-400'
                                : 'text-gray-500'
                            ">
                            No document request fees added yet
                        </p>
                        <p class="text-xs mt-1" :class="darkMode
                                ? 'text-gray-500'
                                : 'text-gray-400'
                            ">
                            Click "Add Fee" below to add document
                            request fees
                        </p>
                    </div>

                    <!-- Display existing fees -->
                    <div v-for="(
                                      fee, index
                                    ) in currentItemInfo?.detail_fees_type_document_requests" :key="index"
                        class="flex items-end gap-3 mb-3 p-3 rounded-lg shadow-sm border" :class="darkMode
                                ? 'bg-gray-800 border-gray-700'
                                : 'bg-white border-gray-200'
                            ">
                        <div class="w-full">
                            <label :for="'fee_name_' + index" class="block text-xs font-medium mb-1" :class="darkMode
                                    ? 'text-gray-300'
                                    : 'text-gray-700'
                                ">
                                Fee Name
                            </label>
                            <input type="text" :id="'fee_name_' + index" v-model="fee.fee_name"
                                class="w-full text-sm py-2 px-3 rounded-md border focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none shadow-sm"
                                :class="darkMode
                                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    " />
                        </div>

                        <div class="lg:w-3/12 w-full">
                            <label :for="'fee_amount_' + index" class="block text-xs font-medium mb-1" :class="darkMode
                                    ? 'text-gray-300'
                                    : 'text-gray-700'
                                ">
                                Amount
                            </label>
                            <input type="number" :id="'fee_amount_' + index" v-model="fee.amount"
                                class="w-full text-sm py-2 px-3 rounded-md border focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none shadow-sm"
                                :class="darkMode
                                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    " />
                        </div>

                        <button @click="removeDetailFee(index)"
                            class="px-3 py-2 text-xs text-red-500 bg-red-50 border border-red-500 rounded-md hover:bg-red-600 hover:text-white transition-all duration-200"
                            title="Remove Fee">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>

                    <button @click="addDetailFee"
                        class="block mx-auto mt-3 px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-all">
                        + Add Fee
                    </button>
                </div>

                <!-- Submit Button -->
                <div class="mt-6">
                    <button @click="sendEmailDetailFee(currentItem)" :disabled="hasEmptyFeeName || isSendingPayment"
                        class="w-full py-2 font-semibold rounded-md border border-green-600 bg-green-600 text-white hover:bg-white hover:text-green-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                        <template v-if="isSendingPayment">
                            <svg class="animate-spin h-4 w-4 inline-block mr-2 text-white"
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                            </svg>
                            Sending...
                        </template>
                        <template v-else>Send Payment</template>
                    </button>
                </div>

                <!-- Success Message -->
                <div v-if="showSuccessMessage" class="mt-4 text-center text-sm border px-4 py-2 rounded-md animate-pulse"
                    :class="darkMode
                            ? 'bg-green-900/50 text-green-300 border-green-700'
                            : 'bg-green-100 text-green-800 border-green-400'
                        ">
                    ✅ Payment details sent successfully!
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    showPaymentModal: Boolean,
    currentItem: Object,
    currentItemInfo: Object,
    darkMode: Boolean,
    addDetailFee: Function,
    removeDetailFee: Function,
    sendEmailDetailFee: Function,
    hasEmptyFeeName: Boolean,
    isSendingPayment: Boolean,
    showSuccessMessage: Boolean,
});

const emit = defineEmits(['closePaymentModal']);
</script>