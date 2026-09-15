<template>
    <div v-if="showPersonalInfoModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-300"
        @click="$emit('closePersonalInfoModal')">
        <div class="rounded-2xl shadow-2xl px-5 py-2 lg:w-7/12 w-11/12 mx-auto transform transition-transform duration-300 max-h-[95vh] overflow-y-auto"
            :class="[
                {
                    'scale-100 opacity-100': showPersonalInfoModal,
                    'scale-95 opacity-0': !showPersonalInfoModal,
                },
                darkMode
                    ? 'bg-gradient-to-br from-gray-800 to-gray-900'
                    : 'bg-gradient-to-br from-white to-gray-50',
            ]" @click.stop>
            <!-- Header -->
            <div class="flex justify-between items-center mb-2 pb-2 border-b-2" :class="darkMode
                    ? 'border-green-700'
                    : 'border-green-200'
                ">
                <div class="flex items-center gap-3">
                    <div
                        class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center shadow-lg">
                        <i class="fa fa-user text-white text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold" :class="darkMode
                                ? 'text-gray-200'
                                : 'text-gray-900'
                            ">
                            Personal Information
                        </h3>
                        <p :class="darkMode
                                ? 'text-gray-400'
                                : 'text-gray-600'
                            ">
                            {{ currentItem?.tracking_id }}
                        </p>
                    </div>
                </div>
                <button @click="$emit('closePersonalInfoModal')"
                    class="w-10 h-10 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 shadow-md">
                    <i class="fa fa-times text-lg"></i>
                </button>
            </div>

            <!-- Content Grid -->
            <div class="lg:flex lg:gap-6 w-full space-y-4 lg:space-y-0">
                <!-- LEFT COLUMN -->
                <div class="lg:w-9/12 w-full rounded-xl p-4 shadow-md border" :class="darkMode
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                    ">
                    <h4 class="text-lg font-bold mb-4 flex items-center gap-2" :class="darkMode ? 'text-gray-200' : 'text-gray-800'
                        ">
                        <i class="fa fa-id-card text-green-600"></i>
                        Personal Details
                    </h4>

                    <!-- Fullname -->
                    <div class="mb-4">
                        <label class="flex items-center text-sm font-semibold mb-1" :class="darkMode
                                ? 'text-gray-300'
                                : 'text-gray-700'
                            ">
                            <i class="fa fa-user text-green-600 mr-2"></i>
                            Fullname
                        </label>
                        <div class="border rounded-lg px-3 py-2 text-sm" :class="darkMode
                                ? 'bg-gray-700 border-gray-600 text-gray-200'
                                : 'bg-gray-50 border-gray-300 text-gray-900'
                            ">
                            {{ currentItem?.firstname }} {{ currentItem?.middlename }}
                            {{ currentItem?.lastname }}
                        </div>
                    </div>

                    <!-- Date of Birth -->
                    <div class="mb-4">
                        <label class="flex items-center text-sm font-semibold mb-1" :class="darkMode
                                ? 'text-gray-300'
                                : 'text-gray-700'
                            ">
                            <i class="fa fa-birthday-cake text-green-500 mr-2"></i>
                            Date of Birth
                        </label>
                        <input type="text"
                            class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 transition"
                            :class="darkMode
                                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                                    : 'bg-white border-gray-300 text-gray-900'
                                " v-model="currentItem.birthdate" />
                    </div>

                    <!-- Mother's Maiden Name -->
                    <div class="mb-4">
                        <label class="flex items-center text-sm font-semibold mb-1" :class="darkMode
                                ? 'text-gray-300'
                                : 'text-gray-700'
                            ">
                            <i class="fa fa-female text-green-500 mr-2"></i>
                            Mother's Maiden Name
                        </label>
                        <input type="text"
                            class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 transition"
                            v-model="currentItem.mother_maiden_name" :class="darkMode
                                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                                    : 'bg-white border-gray-300 text-gray-900'
                                " />
                    </div>

                    <!-- Email -->
                    <div class="mb-4">
                        <label class="flex items-center text-sm font-semibold mb-1" :class="darkMode
                                ? 'text-gray-300'
                                : 'text-gray-700'
                            ">
                            <i class="fa fa-envelope text-green-600 mr-2"></i>
                            Email
                        </label>
                        <input type="text"
                            class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 transition"
                            :class="darkMode
                                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                                    : 'bg-white border-gray-300 text-gray-900'
                                " v-model="currentItem.email" />
                    </div>

                    <!-- Contact Number -->
                    <div class="mb-2">
                        <label class="flex items-center text-sm font-semibold mb-1" :class="darkMode
                                ? 'text-gray-300'
                                : 'text-gray-700'
                            ">
                            <i class="fa fa-phone text-green-600 mr-2"></i>
                            Contact Number
                        </label>
                        <input type="text"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 transition"
                            :class="darkMode
                                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                                    : 'bg-white border-gray-300 text-gray-900'
                                " v-model="currentItem.contact_number" />
                    </div>
                </div>

                <!-- RIGHT COLUMN -->
                <div class="w-full space-y-4">
                    <div class="rounded-xl p-4 shadow-md border" :class="darkMode
                            ? 'bg-gray-800 border-gray-700'
                            : 'bg-white border-gray-200'
                        ">
                        <h4 class="text-lg font-bold mb-4 flex items-center gap-2" :class="darkMode
                                ? 'text-gray-200'
                                : 'text-gray-800'
                            ">
                            <i class="fa fa-graduation-cap text-green-600"></i>
                            Academic Information
                        </h4>

                        <!-- 2-Column layout only on large screens -->
                        <div class="lg:flex lg:gap-4">
                            <!-- Alumni -->
                            <div class="mb-4 w-full">
                                <label class="flex items-center text-sm font-semibold mb-1" :class="darkMode
                                        ? 'text-gray-300'
                                        : 'text-gray-700'
                                    ">
                                    <i class="fa fa-graduation-cap text-green-500 mr-2"></i>
                                    ICC / LSU Graduate?
                                </label>
                                <select v-model="currentItem.alumni"
                                    class="w-full rounded-lg px-3 py-2 text-sm transition focus:ring-2" :class="darkMode
                                            ? 'bg-gray-700 border border-gray-600 text-gray-100 focus:ring-green-400'
                                            : 'bg-white border border-gray-300 text-gray-900 focus:ring-green-500'
                                        ">
                                    <option value="yes">Alumnus</option>
                                    <option value="no">Non-Alumnus</option>
                                </select>
                            </div>

                            <!-- AY -->
                            <div class="mb-4 w-full">
                                <label class="flex items-center text-sm font-semibold mb-1 whitespace-nowrap" :class="darkMode
                                        ? 'text-gray-300'
                                        : 'text-gray-700'
                                    ">
                                    <i class="fa fa-calendar text-green-500 mr-2"></i>
                                    A.Y Graduated or Attended
                                </label>
                                <input type="text" v-model="currentItem.year_graduated_last_attended"
                                    class="w-full rounded-lg px-3 py-2 text-sm transition focus:ring-2" :class="darkMode
                                            ? 'bg-gray-700 border border-gray-600 text-gray-100 focus:ring-green-400'
                                            : 'bg-white border border-gray-300 text-gray-900 focus:ring-green-500'
                                        " />
                            </div>
                        </div>

                        <!-- College -->
                        <div class="mb-4">
                            <label class="flex items-center text-sm font-semibold mb-1" :class="darkMode
                                    ? 'text-gray-300'
                                    : 'text-gray-700'
                                ">
                                <i class="fa fa-university text-green-500 mr-2"></i>
                                College
                            </label>
                            <select v-model="currentItem.college"
                                class="w-full rounded-lg px-3 py-2 text-sm transition focus:ring-2" :class="darkMode
                                        ? 'bg-gray-700 border border-gray-600 text-gray-100 focus:ring-green-400'
                                        : 'bg-white border border-gray-300 text-gray-900 focus:ring-green-500'
                                    ">
                                <option value="">Choose</option>
                                <option value="Arts and Sciences, Engineering, Architecture, Computer Studies">
                                    Arts and Sciences, Engineering,
                                    Architecture, Computer Studies
                                </option>
                                <option value="Business, Commerce, Accountancy">
                                    Business, Commerce, Accountancy
                                </option>
                                <option value="Education / Graduate Studies">
                                    Education / Graduate Studies
                                </option>
                                <option value="Nursing / Tourism and Hospitality Management">
                                    Nursing / Tourism and Hospitality
                                    Management
                                </option>
                                <option value="Criminology / BS Psychology">
                                    Criminology / BS Psychology
                                </option>
                            </select>
                        </div>

                        <!-- Course -->
                        <div class="mb-4">
                            <label class="flex items-center text-sm font-semibold mb-1" :class="darkMode
                                    ? 'text-gray-300'
                                    : 'text-gray-700'
                                ">
                                <i class="fa fa-book text-green-500 mr-2"></i>
                                Course
                            </label>
                            <input type="text" v-model="currentItem.course"
                                class="w-full rounded-lg px-3 py-2 text-sm transition focus:ring-2" :class="darkMode
                                        ? 'bg-gray-700 border border-gray-600 text-gray-100 focus:ring-green-400'
                                        : 'bg-white border border-gray-300 text-gray-900 focus:ring-green-500'
                                    " />
                        </div>

                        <!-- Purpose -->
                        <div v-if="currentItem?.details" class="mt-4 p-4 border-l-4 rounded-r-lg" :class="darkMode
                                ? 'bg-blue-900 border-blue-600 text-gray-200'
                                : 'bg-blue-50 border-blue-500 text-gray-700'
                            ">
                            <p class="flex items-center text-sm font-semibold mb-1">
                                <i class="fa fa-info-circle text-green-600 mr-2"></i>
                                Purpose and Details:
                            </p>
                            <p class="text-sm" :class="darkMode
                                    ? 'text-gray-200'
                                    : 'text-gray-700'
                                ">
                                {{ currentItem.details }}
                            </p>
                        </div>

                        <!-- Requested Documents -->
                        <div class="p-3 border-2 mt-4 rounded-lg" :class="darkMode
                                ? 'bg-blue-900 border-blue-600 text-gray-200'
                                : 'bg-blue-50 border-blue-200 text-blue-800'
                            ">
                            <h4 class="text-xs font-bold mb-2 flex items-center uppercase">
                                <i class="fa fa-file-text mr-2"></i>
                                Requested Document/s
                            </h4>
                            <div class="space-y-1">
                                <div v-for="(doc, idx
                                         ) in currentItem?.detail_fees_type_document_requests" :key="idx"
                                    class="flex items-center gap-2 text-xs" :class="darkMode
                                            ? 'text-gray-200'
                                            : 'text-gray-900'
                                        ">
                                    <i class="fa fa-check-circle text-blue-500 text-[10px]"></i>
                                    <span>{{ doc.fee_name }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="mt-4 pt-4 border-t-2" :class="darkMode ? 'border-gray-700' : 'border-gray-200'
                ">
                <button @click="$emit('verifiedConfirm', currentItem)" :disabled="isVerifying"
                    class="w-full flex items-center justify-center gap-2 px-6 py-3 font-bold text-white bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    <i v-if="isVerifying" class="fa fa-spinner fa-spin"></i>
                    <i v-else class="fa fa-paper-plane"></i>
                    <span v-if="isVerifying">Verifying...</span>
                    <span v-else>Verify Information</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    showPersonalInfoModal: Boolean,
    currentItem: Object,
    darkMode: Boolean,
    isVerifying: Boolean,
})

const emit = defineEmits(['closePersonalInfoModal', 'verifiedConfirm'])
</script>