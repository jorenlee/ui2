<template>
    <div class="w-full lg:flex flex-wrap items-center gap-3 mb-1 px-3 py-1 border rounded-md shadow-sm" :class="props.darkMode
        ? 'bg-gray-800 text-white'
        : 'bg-white text-red-900'
        ">
        <div class="w-full lg:flex items-center gap-3">
            <!-- Left Actions -->
            <div v-if="collegeFilterList" class="lg:mb-0 mb-3 flex items-center gap-2 lg:w-3/12 w-full">
                <!-- Select/Deselect All -->
                <button @click="selectAllItems"
                    class="flex items-center text-xs px-2 py-1 rounded-md transition whitespace-nowrap" :class="darkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        ">
                    {{ allSelected ? "Deselect All" : "Select All" }}
                </button>

                <!-- Delete Selected -->
                <button @click="toggleDeleteMultiple" :disabled="selectedItems.length === 0" :class="selectedItems.length === 0
                    ? darkMode
                        ? 'bg-red-900/30 text-red-400 cursor-not-allowed'
                        : 'bg-pink-100 text-red-300 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                    " class="flex items-center text-xs px-2 py-1 rounded-md transition whitespace-nowrap">
                    <i class="fa fa-trash mr-1"></i>
                    ({{ selectedItems.length }})
                </button>
            </div>

            <!-- College Filter Dropdown -->
            <div v-if="collegeFilterList" class="lg:mb-0 mb-3 w-full">
                <select :value="selectedCollege"
                    @change="$emit('update:selectedCollege', $event.target.value)"
                    class="w-full text-xs px-2 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    :class="darkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                        : 'bg-white border-gray-300 text-gray-900'
                        ">
                    <option value="">All Colleges</option>
                    <option v-for="college in colleges" :key="college.value" :value="college.value">
                        {{ college.label }}
                    </option>
                </select>
            </div>

            <!-- Search Input -->
            <div class="lg:mb-0 mb-3 relative w-full">
                <input :value="searchQuery" 
                    @input="$emit('update:searchQuery', $event.target.value)"
                    type="search" placeholder="Search"
                    class="text-xs w-full border rounded-md px-2 py-1 pr-8 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    :class="darkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        " @keyup.enter="performSearch" />
                <button @click="performSearch" class="absolute right-2 top-1/2 -translate-y-1/2 hover:text-green-600"
                    :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
                    <i class="fa fa-search"></i>
                </button>
            </div>

            <!-- Status Filters -->
            <div class="w-fit mx-auto flex items-center gap-1">
                <button @click="$emit('update:statusFilter', 'all')" :class="[
                    statusFilter === 'all'
                        ? 'bg-gray-900 text-white'
                        : darkMode
                            ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-900 hover:text-white'
                            : 'bg-white text-gray-900 border hover:bg-gray-900 hover:text-white',
                    darkMode ? 'border-gray-600' : 'border-gray-900',
                ]" class="text-xs border px-2 py-1 rounded-full transition">
                    All
                </button>

                <button @click="$emit('update:statusFilter', 'pending')" :class="[
                    statusFilter === 'pending'
                        ? 'bg-red-500 text-white'
                        : darkMode
                            ? 'bg-gray-700 text-red-400 border-red-500 hover:bg-red-500 hover:text-white'
                            : 'bg-white text-red-600 border hover:bg-red-500 hover:text-white',
                ]" class="text-xs border border-red-600 px-2 py-1 rounded-full transition">
                    Pending
                </button>

                <button @click="$emit('update:statusFilter', 'done')" :class="[
                    statusFilter === 'done'
                        ? 'bg-green-600 text-white'
                        : darkMode
                            ? 'bg-gray-700 text-green-400 border-green-500 hover:bg-green-600 hover:text-white'
                            : 'bg-white text-green-600 border hover:bg-green-600 hover:text-white',
                ]" class="text-xs border border-green-600 px-2 py-1 rounded-full transition">
                    Done
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
    const props = defineProps({
        darkMode: Boolean,
        collegeFilterList: Boolean,
        selectedItems: Array,
        allSelected: Boolean,
        selectedCollege: String,
        searchQuery: String,
        statusFilter: String,
        colleges: Array,
        isLoading: Boolean,
    })

    const emit = defineEmits(['selectAllItems', 'toggleDeleteMultiple', 'performSearch', 'update:selectedCollege', 'update:searchQuery', 'update:statusFilter'])

    const selectAllItems = () => {
        emit('selectAllItems')
    }

    const toggleDeleteMultiple = () => {
        emit('toggleDeleteMultiple')
    }

    const performSearch = () => {
        emit('performSearch')
    }
</script>