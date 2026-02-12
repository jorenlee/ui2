<template>
  <div class="lg:p-1 text-sm">
    <div class="lg:flex items-center justify-between">
      <h2 class="text-sm font-bold lg:mb-4">
        NPCC Tech Support & IT Services
      </h2>
      <!-- Results Count & Real-time Indicator -->
      <div class="mb-3 flex justify-between items-center">
        <div class="text-xs text-green-800 font-semibold">
          Showing {{ paginatedRequests.length }} of
          {{ filteredRequests.length }} ticket(s)
          <span class="font-bold uppercase">| {{ requests.length }} total</span>
        </div>
      </div>
    </div>

    <!-- ACTION BAR -->
    <div class="bg-white border rounded-lg py-1 px-2 mb-4 shadow-sm">
      <div class="lg:flex grid grid-cols-2 gap-3 mb-3 w-full">
        <!-- Search Filter -->
        <div class="w-full">
          <label class="text-xs font-semibold text-gray-700 mb-1 block"
            ><i class="fa fa-search mr-1"></i>Universal Search</label
          >
          <input
            v-model="searchFilter"
            type="text"
            placeholder="Search anything: Name, Email, Category, Concern, Location, Status, Technician, Details... (Use multiple words to narrow results)"
            class="input w-full rounded p-2 text-xs border shadow-sm focus:ring-2 focus:ring-green-500"
          />
          <p v-if="searchFilter" class="text-[10px] text-gray-500 mt-1 italic">
            <i class="fa fa-info-circle mr-1"></i>Searching across all fields{{
              searchFilter.trim().split(/\s+/).length > 1
                ? " (matching ALL words)"
                : ""
            }}...
          </p>
        </div>

        <!-- Status Filter -->
        <div class="w-full">
          <label class="text-xs font-semibold text-gray-700 mb-1 block"
            >Status
          </label>

          <select
            v-model="statusFilter"
            class="input w-full rounded p-2 text-xs border shadow-sm focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <!-- Technician Filter -->
        <div class="w-full">
          <label class="text-xs font-semibold text-gray-700 mb-1 block"
            >Technician</label
          >
          <select
            v-model="technicianFilter"
            class="input w-full rounded p-2 text-xs border shadow-sm focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Technicians</option>
            <option
              v-for="tech in TECHNICIANS_PERSONNEL"
              :key="tech.email"
              :value="tech.name"
            >
              {{ tech.name }}
            </option>
          </select>
        </div>

        <!-- Date Range Filter -->
        <div class="w-full">
          <label class="text-xs font-semibold text-gray-700 mb-1 block"
            >Date Range</label
          >
          <select
            v-model="dateFilter"
            class="input w-full rounded p-2 text-xs border shadow-sm focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        <div class="lg:w-fit w-full flex justify-between items-center">
          <button
            @click="clearFilters"
            class="lg:mt-5 w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 whitespace-nowrap lg:text-sm text-xs font-semibold shadow-sm"
          >
            Clear Filters
          </button>
        </div>

        <div class="w-full flex justify-between items-center">
          <button
            class="lg:mt-5 w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 whitespace-nowrap lg:text-sm text-xs font-semibold shadow-sm"
            @click="openCreateModal"
          >
            <i class="fa fa-plus mr-1"></i> Walk-in Ticket
          </button>
        </div>
      </div>
    </div>

    <!-- ================= DATE LIST TABLE HEADER ================= -->
    <div
      class="w-full lg:flex hidden bg-gradient-to-r from-green-700 to-green-600 rounded-t-lg shadow-md overflow-hidden"
    >
      <div
        @click="sortBy('issue_concern_request_category_type')"
        class="lg:w-6/12 w-full flex items-center p-3 text-white font-bold text-sm border-r border-green-500 cursor-pointer hover:bg-green-800 transition-colors"
      >
        <i class="fa fa-tools mr-1"></i>  Category
        <span class="ml-1 inline-flex flex-col text-xs leading-none">
          <i
            class="fa fa-caret-up"
            :class="
              sortColumn === 'issue_concern_request_category_type' &&
              sortDirection === 'asc'
                ? 'text-white'
                : 'text-green-300 opacity-50'
            "
          ></i>
          <i
            class="fa fa-caret-down -mt-1"
            :class="
              sortColumn === 'issue_concern_request_category_type' &&
              sortDirection === 'desc'
                ? 'text-white'
                : 'text-green-300 opacity-50'
            "
          ></i>
        </span>
      </div>
      <div
        @click="sortBy('requestor_fullname')"
        class="lg:w-11/12 w-full flex items-center p-3 text-white font-bold text-sm border-r border-green-500 cursor-pointer hover:bg-green-800 transition-colors"
      >
        <i class="fa fa-user mr-1"></i> Requestor 
        <span class="ml-1 inline-flex flex-col text-xs leading-none">
          <i
            class="fa fa-caret-up"
            :class="
              sortColumn === 'requestor_fullname' && sortDirection === 'asc'
                ? 'text-white'
                : 'text-green-300 opacity-50'
            "
          ></i>
          <i
            class="fa fa-caret-down -mt-1"
            :class="
              sortColumn === 'requestor_fullname' && sortDirection === 'desc'
                ? 'text-white'
                : 'text-green-300 opacity-50'
            "
          ></i>
        </span>
      </div>


      <div
        @click="sortBy('technicians_assigned')"
        class="lg:w-6/12 w-full flex items-center p-3 text-white font-bold text-sm border-r border-green-500 cursor-pointer hover:bg-green-800 transition-colors"
      >
        <i class="fa fa-users mr-1"></i> Assigned Personnel
        <span class="ml-1 inline-flex flex-col text-xs leading-none">
          <i
            class="fa fa-caret-up"
            :class="
              sortColumn === 'technicians_assigned' && sortDirection === 'asc'
                ? 'text-white'
                : 'text-green-300 opacity-50'
            "
          ></i>
          <i
            class="fa fa-caret-down -mt-1"
            :class="
              sortColumn === 'technicians_assigned' && sortDirection === 'desc'
                ? 'text-white'
                : 'text-green-300 opacity-50'
            "
          ></i>
        </span>
      </div>
      <div
        @click="sortBy('status')"
        class="lg:w-6/12 w-full flex items-center p-3 text-white font-bold text-sm border-r border-green-500 cursor-pointer hover:bg-green-800 transition-colors"
      >
        <i class="fa fa-info-circle mr-1"></i> Status
        <span class="ml-1 inline-flex flex-col text-xs leading-none">
          <i
            class="fa fa-caret-up"
            :class="
              sortColumn === 'status' && sortDirection === 'asc'
                ? 'text-white'
                : 'text-green-300 opacity-50'
            "
          ></i>
          <i
            class="fa fa-caret-down -mt-1"
            :class="
              sortColumn === 'status' && sortDirection === 'desc'
                ? 'text-white'
                : 'text-green-300 opacity-50'
            "
          ></i>
        </span>
      </div>

      <div
        class="lg:w-3/12 w-full flex items-center p-3 text-white font-bold text-sm border-r border-green-500"
      >
        <i class="fa fa-star mr-1"></i> Feedback
      </div>

    </div>

    <!-- Toaster -->
    <transition name="fade">
      <div
        v-if="toaster.show"
        class="fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl text-white font-medium flex items-center gap-3 max-w-md"
        :class="{
          'bg-green-600': toaster.type === 'success',
          'bg-red-600': toaster.type === 'error',
          'bg-blue-600': toaster.type === 'info',
          'bg-yellow-600': toaster.type === 'warning',
        }"
      >
        <i
          class="fa text-xl"
          :class="{
            'fa-check-circle': toaster.type === 'success',
            'fa-exclamation-circle': toaster.type === 'error',
            'fa-info-circle': toaster.type === 'info',
            'fa-exclamation-triangle': toaster.type === 'warning',
          }"
        ></i>
        <span>{{ toaster.message }}</span>
      </div>
    </transition>

    <!-- ================= LOADING STATE ================= -->
    <div v-if="loading" class="space-y-2 mt-2">
      <!-- Desktop Skeleton -->
      <div
        v-for="i in 6"
        :key="'desk-' + i"
        class="hidden lg:grid grid-cols-7 gap-2 bg-white p-3 rounded animate-pulse"
      >
        <div v-for="j in 7" :key="j" class="h-4 bg-gray-200 rounded"></div>
      </div>

      <!-- Mobile Skeleton -->
      <div
        v-for="i in 4"
        :key="'mob-' + i"
        class="lg:hidden border-b p-4 space-y-2 animate-pulse"
      >
        <div class="flex justify-between">
          <div class="h-4 w-20 bg-gray-200 rounded"></div>
          <div class="h-4 w-16 bg-gray-200 rounded"></div>
        </div>
        <div class="h-4 w-32 bg-gray-200 rounded"></div>
        <div class="h-3 w-40 bg-gray-200 rounded"></div>
        <div class="h-3 w-24 bg-gray-200 rounded"></div>
      </div>
    </div>

    <!-- ================= DATA LIST ================= -->
    <div v-else>
      <div v-for="(item, index) in paginatedRequests" :key="item.id">
        <!-- ================= DESKTOP ROW ================= -->
        <div
          class="hidden lg:flex items-center text-sm cursor-pointer border py-1 transition-colors"
          :class="
            index % 2 === 0
              ? 'bg-white hover:bg-gray-100'
              : 'bg-gray-50 hover:bg-gray-100'
          "
          @click="openModal(item)"
        >
          <div class="lg:w-6/12 w-full px-3 text-left text-xs">
            <span class="flex">
              {{ item.issue_concern_request_category_type || "-" }}</span
            >

            <span class="flex">
              {{ item.issue_concern_request_item_type || "-" }}</span
            >
          </div>

          <div
            class="lg:w-11/12 w-full px-3 text-left capitalize whitespace-nowrap text-xs"
          >
           <span class="flex font-semibold">
             {{ item.requestor_fullname }}
           </span>
              <span class="flex">
                 {{ item.issue_concern_request_center_office_room || "-" }}
              </span>
          </div>


          <div class="lg:w-6/12 w-full px-3 text-left text-xs">
            {{
              item.technicians_assigned?.map((t) => t.name).join(", ") || "-"
            }}
          </div>

          <div class="lg:w-6/12 w-full px-3 text-left">
            <div class="flex items-center gap-2">
                <span
              class="bg-yellow-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-yellow-800 whitespace-nowrap"
            >
                <i class="fa fa-edit"></i>
            </span>
              <!-- Mood Icon -->
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center shadow-md flex-shrink-0"
                :class="getMoodIcon(item).bgClass"
                :title="getMoodIcon(item).title"
              >
                <span class="text-sm">{{ getMoodIcon(item).emoji }}</span>
              </div>
              <!-- Status Badge -->
              <span
                class="px-2 py-1 rounded text-xs font-semibold whitespace-nowrap"
                :class="ticketStatusClass(latestStatus(item)?.status)"
              >
                {{ latestStatus(item)?.status || "-" }}
              </span>
            </div>
          </div>

          <div class="lg:w-3/12 w-full px-3 text-left">
            <div v-if="item.evaluation_feedback_client_star_rating" class="flex items-center">
              <span v-for="star in 5" :key="star" class="text-sm">
                <i
                  class="fa fa-star"
                  :class="star <= parseInt(item.evaluation_feedback_client_star_rating || 0) ? 'text-yellow-500' : 'text-gray-300'"
                ></i>
              </span>
              <span class="text-xs text-gray-600 ml-1">({{ item.evaluation_feedback_client_star_rating }})</span>
            </div>
            <span v-else class="text-xs text-gray-400 italic">No rating yet</span>
          </div>

        </div>

        <!-- ================= MOBILE CARD ================= -->
        <div
          class="lg:hidden border p-4 space-y-2 cursor-pointer transition-colors hover:bg-gray-50"
          @click="openModal(item)"
        >
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <i class="fa fa-tools text-green-600"></i>
              <span class="font-bold text-sm">
                {{ item.issue_concern_request_category_type || "-" }}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <!-- Mood Icon -->
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center shadow-md flex-shrink-0"
                :class="getMoodIcon(item).bgClass"
                :title="getMoodIcon(item).title"
              >
                <span class="text-sm">{{ getMoodIcon(item).emoji }}</span>
              </div>
              <!-- Status Badge -->
              <span
                class="px-2 py-1 rounded text-xs font-semibold"
                :class="ticketStatusClass(latestStatus(item)?.status)"
              >
                {{ latestStatus(item)?.status || "-" }}
              </span>
            </div>
          </div>

          <div>
            <p class="text-sm font-semibold">
              {{ item.requestor_fullname }}
            </p>
          </div>

          <div class="text-xs text-gray-700">
            <span class="font-semibold"
              ><i class="fa fa-wrench text-green-600 mr-1"></i>Specific
              Concern:</span
            >
            {{ item.issue_concern_request_item_type || "—" }}
          </div>

          <div class="text-xs text-gray-700">
            <span class="font-semibold"
              ><i class="fa fa-building text-green-600 mr-1"></i
              >Center/Office/Room:</span
            >
            {{ item.issue_concern_request_center_office_room || "—" }}
          </div>

          <div class="text-xs text-gray-700">
            <span class="font-semibold"
              ><i class="fa fa-users text-green-600 mr-1"></i>Technician:</span
            >
            {{
              item.technicians_assigned?.map((t) => t.name).join(", ") || "—"
            }}
          </div>

          <div class="flex justify-between items-center pt-2">
            <span class="text-xs text-gray-500">
              {{ moment(item.created_at).format("MMM DD, YYYY hh:mm A") }}
            </span>

            <span
              class="bg-yellow-600 text-white px-3 py-1 rounded text-xs font-semibold"
            >
                <i class="fa fa-edit"></i>
            </span>
          </div>
        </div>
      </div>

      <!-- EMPTY -->
      <div
        v-if="!filteredRequests.length"
        class="text-center py-6 text-gray-500"
      >
        No records found
      </div>
    </div>

    <!-- ================= PAGINATION ================= -->
    <div v-if="totalPages > 1" class="mt-6 gap-2">
      <div class="flex justify-center items-center gap-2">
        <!-- First Page -->
        <button
          @click="goToPage(1)"
          :disabled="currentPage === 1"
          class="px-3 py-2 rounded bg-white border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="First Page"
        >
          <i class="fa fa-angle-double-left"></i>
        </button>

        <!-- Previous Page -->
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-2 rounded bg-white border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Previous Page"
        >
          <i class="fa fa-angle-left"></i>
        </button>

        <!-- Page Numbers -->
        <div class="flex gap-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-4 py-2 rounded border transition-colors font-semibold text-sm',
              currentPage === page
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white hover:bg-gray-100',
            ]"
          >
            {{ page }}
          </button>
        </div>

        <!-- Next Page -->
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-2 rounded bg-white border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Next Page"
        >
          <i class="fa fa-angle-right"></i>
        </button>

        <!-- Last Page -->
        <button
          @click="goToPage(totalPages)"
          :disabled="currentPage === totalPages"
          class="px-3 py-2 rounded bg-white border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Last Page"
        >
          <i class="fa fa-angle-double-right"></i>
        </button>
      </div>

      <!-- Page Info -->
      <div
        class="ml-4 text-sm text-gray-600 font-medium w-full text-center py-2"
      >
        Page {{ currentPage }} of {{ totalPages }}
      </div>
    </div>

    <!-- MODAL -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/40 flex justify-center items-center z-50 lg:px-0 px-2"
    >
      <div
        class="bg-white lg:w-11/12 rounded-lg lg:p-6 py-2 h-5/6 overflow-y-auto relative px-2"
      >
        <div>
          <div class="flex lg:text-sm text-xs items-center lg:pb-5 pb-2">
            <h3 class="font-bold lg:text-center text-left w-full">
              {{ isCreate ? "Create Ticket (Job Request)" : "Ticket Details" }}
            </h3>

            <button
              class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 font-semibold"
              @click="closeModal"
              :disabled="modalLoading"
            >
              <i class="fa fa-times"></i>
            </button>
          </div>
          <!-- BASIC INFO -->
          <div
            class="border-2 border-green-100 rounded-xl lg:p-4 p-3 mb-4 bg-gradient-to-br from-gray-50 to-white shadow-sm"
          >
            <div class="mb-4">
              <h3
                class="lg:text-base text-sm font-bold text-green-800 mb-1 flex items-center"
              >
                <i class="fas fa-user-circle mr-2"></i>
                Requestor Information
              </h3>
            </div>

            <div class="gap-3">
              <div class="grid lg:grid-cols-2 gap-3 mb-3">
                <div class="w-full">
                  <label class="text-sm font-semibold mb-2 block text-gray-700"
                    ><i class="fas fa-user text-green-600 mr-1"></i>Full Name /
                    Requestor
                    <span v-if="isCreate" class="text-red-600">*</span></label
                  >
                  <input
                    v-model="info.requestor_fullname"
                    placeholder="Enter full name"
                    class="input w-full lg:p-3 p-2 rounded-lg border-2 border-gray-200 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                    :disabled="
                      !isCreate &&
                      (!isAssignedTechnician || !info.ticket_locked_by_email)
                    "
                    :class="{
                      'bg-gray-100 cursor-not-allowed':
                        !isCreate &&
                        (!isAssignedTechnician || !info.ticket_locked_by_email),
                    }"
                  />
                </div>
                <div class="w-full">
                  <label class="text-sm font-semibold mb-2 block text-gray-700"
                    ><i class="fas fa-envelope text-green-600 mr-1"></i
                    >Requestor LSU Email
                    <span v-if="isCreate" class="text-red-600">*</span></label
                  >
                  <input
                    v-model="info.requestor_lsu_email"
                    placeholder="e.g johndoe@lsu.edu.ph"
                    class="input w-full lg:p-3 p-2 rounded-lg border-2 border-gray-200 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                    :disabled="
                      !isCreate &&
                      (!isAssignedTechnician || !info.ticket_locked_by_email)
                    "
                    :class="{
                      'bg-gray-100 cursor-not-allowed':
                        !isCreate &&
                        (!isAssignedTechnician || !info.ticket_locked_by_email),
                    }"
                  />
                </div>
              </div>
              <div class="md:col-span-2">
                <label class="text-sm font-semibold mb-2 block text-gray-700">
                  <i class="fas fa-users text-green-600 mr-1"></i>
                  {{ isCreate ? 'Assign Personnel' : 'Assigned Personnel' }}
                  <span
                    v-if="!isCreate && info.ticket_locked_by_email"
                    class="ml-2 text-orange-600 font-semibold text-xs"
                  >
                    <i class="fas fa-lock"></i> Ticket Locked
                  </span>
                </label>

                <!-- CREATE MODE: Show checkboxes for all personnel -->
                <div
                  v-if="isCreate"
                  class="border-2 border-gray-200 rounded-lg p-2 flex flex-wrap gap-2 bg-white"
                >
                  <label
                    v-for="tech in TECHNICIANS_PERSONNEL"
                    :key="tech.email"
                    class="flex items-center gap-x-2 lg:text-sm text-xs lg:w-[calc(33.333%-0.5rem)] w-full whitespace-nowrap py-2 px-3 rounded-lg border-2 transition-all cursor-pointer hover:bg-gray-50"
                    :class="{
                      'bg-green-50 border-green-500 font-semibold':
                        tech.email === userStore.user?.email,
                      'border-gray-200': tech.email !== userStore.user?.email,
                    }"
                  >
                    <input
                      type="checkbox"
                      :value="tech"
                      v-model="info.technicians_assigned"
                      class="accent-green-600 w-4 h-4"
                    />
                    <span
                      :class="{
                        'text-green-700': tech.email === userStore.user?.email,
                      }"
                    >
                      {{ tech.name }}
                      <span
                        v-if="tech.email === userStore.user?.email"
                        class="text-green-600 ml-1 font-bold"
                      >
                        (You)
                      </span>
                    </span>
                  </label>
                </div>

                <!-- EDIT MODE: Show only assigned personnel (no checkboxes) -->
                <div
                  v-else
                  class="border-2 border-gray-200 rounded-lg p-3 bg-white"
                >
                  <div
                    v-if="info.technicians_assigned && info.technicians_assigned.length > 0"
                    class="flex flex-wrap gap-2"
                  >
                    <div
                      v-for="tech in info.technicians_assigned"
                      :key="tech.email"
                      class="flex items-center gap-x-2 lg:text-sm text-xs py-2 px-3 rounded-lg border-2 bg-green-50 border-green-500 font-semibold"
                    >
                      <i class="fas fa-user-check text-green-600"></i>
                      <span class="text-green-700">
                        {{ tech.name }}
                        <span
                          v-if="tech.email === userStore.user?.email"
                          class="text-green-600 ml-1 font-bold"
                        >
                          (You)
                        </span>
                      </span>
                      <i
                        v-if="info.ticket_locked_by_email === tech.email"
                        class="fas fa-lock text-orange-500 text-xs ml-1"
                        title="Ticket locked to this technician"
                      ></i>
                    </div>
                  </div>
                  <div
                    v-else
                    class="text-xs text-gray-500 italic"
                  >
                    <i class="fas fa-info-circle mr-1"></i>
                    No personnel assigned to this ticket
                  </div>
                </div>

                <!-- Assign Personnel Button (yellow - only when NO personnel assigned) -->
                <div
                  v-if="
                    !isCreate &&
                    (!info.technicians_assigned || info.technicians_assigned.length === 0)
                  "
                  class="mt-3"
                >
                  <button
                    @click="() => { isAssignMode = true; showTransferModal = true; }"
                    class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors shadow-sm font-semibold"
                  >
                    <i class="fas fa-user-plus mr-2"></i>
                    Assign Personnel
                  </button>
                </div>

                <!-- Transfer Ticket Button (purple - only for assigned technicians in Edit mode) -->
                <div
                  v-if="
                    !isCreate &&
                    info.technicians_assigned &&
                    info.technicians_assigned.length > 0 &&
                    isAssignedTechnician &&
                    info.ticket_locked_by_email
                  "
                  class="mt-3"
                >
                  <button
                    @click="() => { isAssignMode = false; showTransferModal = true; }"
                    class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors shadow-sm font-semibold"
                  >
                    <i class="fas fa-exchange-alt mr-2"></i>
                    Transfer Ticket to Other Personnel
                  </button>
                </div>

              </div>
            </div>
          </div>
          <!-- REQUEST DETAILS -->
          <div
            class="border-2 border-green-100 rounded-xl lg:p-4 p-3 mb-4 bg-gradient-to-br from-gray-50 to-white shadow-sm"
          >
            <div class="mb-4">
              <h3
                class="lg:text-base text-sm font-bold text-green-800 mb-1 flex items-center"
              >
                <i class="fas fa-tools mr-2"></i>
                {{ isCreate ? "Request Details" : "Request Details" }}
              </h3>
              <p class="text-xs text-gray-500">
                {{
                  isCreate
                    ? "Describe the technical support needs"
                    : "View request information"
                }}
              </p>
            </div>
            <div
              class="bg-white rounded-lg lg:p-4 p-3 border-2 border-gray-100"
            >
              <div class="grid lg:grid-cols-2 gap-4 text-sm">
                <!-- 1. CATEGORY -->
                <div class="w-full">
                  <label class="block font-semibold mb-2 text-gray-700">
                    <i class="fas fa-tag text-green-600 mr-1"></i>Category
                    <span v-if="isCreate" class="text-red-600">*</span>
                  </label>
                  <select
                    v-model="info.issue_concern_request_category_type"
                    class="input rounded-lg border-2 border-gray-200 lg:p-3 p-2 w-full text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                    @change="info.issue_concern_request_item_type = ''"
                    :disabled="
                      !isCreate &&
                      (!isAssignedTechnician || !info.ticket_locked_by_email)
                    "
                    :class="{
                      'bg-gray-100 cursor-not-allowed':
                        !isCreate &&
                        (!isAssignedTechnician || !info.ticket_locked_by_email),
                    }"
                  >
                    <option disabled value="">Select Category</option>
                    <option
                      v-for="cat in CATEGORY_OPTIONS"
                      :key="cat"
                      :value="cat"
                    >
                      {{ cat }}
                    </option>
                  </select>
                </div>

                <!-- 2. SPECIFIC CONCERN (Hidden for Student Portal) -->
                <div
                  v-if="
                    info.issue_concern_request_category_type !==
                    'Student Portal'
                  "
                  class="w-full"
                >
                  <label class="block font-semibold mb-2 text-gray-700">
                    <i class="fas fa-laptop text-green-600 mr-1"></i>Specific
                    Concern
                    <span v-if="isCreate" class="text-red-600">*</span>
                  </label>
                  <select
                    v-model="info.issue_concern_request_item_type"
                    class="input rounded-lg border-2 border-gray-200 lg:p-3 p-2 w-full text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    :disabled="
                      !info.issue_concern_request_category_type ||
                      (!isCreate &&
                        (!isAssignedTechnician || !info.ticket_locked_by_email))
                    "
                  >
                    <option disabled value="">
                      {{
                        info.issue_concern_request_category_type
                          ? "Select Specific Type"
                          : "Select Category First"
                      }}
                    </option>
                    <option
                      v-for="type in getSpecificTypeOptions(
                        info.issue_concern_request_category_type,
                      )"
                      :key="type"
                      :value="type"
                    >
                      {{ type }}
                    </option>
                  </select>
                </div>

                <!-- 3. DESCRIPTION (Hidden for Student Portal) -->
                <div
                  v-if="
                    info.issue_concern_request_category_type !==
                    'Student Portal'
                  "
                  class="w-full lg:col-span-2"
                >
                  <label class="block font-semibold mb-2 text-gray-700">
                    <i class="fas fa-comment-dots text-green-600 mr-1"></i
                    >Details / Description
                    <span v-if="isCreate" class="text-red-600">*</span>
                  </label>
                  <textarea
                    v-model="info.issue_concern_request_details"
                    class="input rounded-lg border-2 border-gray-200 lg:px-3 lg:py-3 px-2 py-2 w-full text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none resize-none"
                    placeholder="Describe the issue, concern, or request in detail..."
                    rows="3"
                    :disabled="
                      !isCreate &&
                      (!isAssignedTechnician || !info.ticket_locked_by_email)
                    "
                    :class="{
                      'bg-gray-100 cursor-not-allowed':
                        !isCreate &&
                        (!isAssignedTechnician || !info.ticket_locked_by_email),
                    }"
                  />
                </div>

                <!-- 4. REQUESTOR ROLE (formerly Client Role) (Hidden for LSU Webpages and Student Portal) -->
                <div
                  v-if="
                    info.issue_concern_request_category_type !==
                      'LSU Webpages' &&
                    info.issue_concern_request_category_type !==
                      'Student Portal'
                  "
                  class="w-full"
                >
                  <label class="block font-semibold mb-2 text-gray-700">
                    <i class="fas fa-id-badge text-green-600 mr-1"></i>Requestor
                    Role
                    <span v-if="isCreate" class="text-red-600">*</span>
                  </label>
                  <select
                    v-model="info.client_role"
                    class="input rounded-lg border-2 border-gray-200 lg:p-3 p-2 w-full text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                    :disabled="
                      !isCreate &&
                      (!isAssignedTechnician || !info.ticket_locked_by_email)
                    "
                    :class="{
                      'bg-gray-100 cursor-not-allowed':
                        !isCreate &&
                        (!isAssignedTechnician || !info.ticket_locked_by_email),
                    }"
                  >
                    <option value="">Select Role</option>
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Staff">Staff</option>
                    <!-- Hide Public and Alumni for Others category -->
                    <option
                      v-if="
                        info.issue_concern_request_category_type !== 'Others'
                      "
                      value="Alumni"
                    >
                      Alumni
                    </option>
                    <option
                      v-if="
                        info.issue_concern_request_category_type !== 'Others'
                      "
                      value="Public"
                    >
                      Public
                    </option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <!-- 5. CENTER/OFFICE/ROOM (Show ONLY for Admin, Faculty, and Staff) -->
                <!-- Hide for Student, Alumni, and Public -->
                <div
                  v-if="
                    (isCreate ||
                      info.issue_concern_request_center_office_room) &&
                    (info.client_role === 'Admin' ||
                      info.client_role === 'Faculty' ||
                      info.client_role === 'Staff')
                  "
                  class="w-full"
                >
                  <label class="block font-semibold mb-2 text-gray-700">
                    <i class="fas fa-building text-green-600 mr-1"></i>
                    {{
                      info.issue_concern_request_category_type ===
                      "Computer Lab"
                        ? "Computer Lab Location"
                        : "Requesting Office"
                    }}
                    <span v-if="isCreate" class="text-red-600">*</span>
                  </label>
                  <div class="flex gap-2">
                    <select
                      v-model="info.issue_concern_request_center_office_room"
                      class="input border-2 border-gray-200 w-full lg:p-3 p-2 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                      :disabled="
                        !isCreate &&
                        (!isAssignedTechnician || !info.ticket_locked_by_email)
                      "
                      :class="{
                        'bg-gray-100 cursor-not-allowed':
                          !isCreate &&
                          (!isAssignedTechnician ||
                            !info.ticket_locked_by_email),
                      }"
                    >
                      <option disabled value="">
                        {{
                          info.issue_concern_request_category_type ===
                          "Computer Lab"
                            ? "Select Computer Lab"
                            : "Select Location"
                        }}
                      </option>
                      <option
                        v-for="office in getLocationOptions"
                        :key="office"
                        :value="office"
                      >
                        {{ office }}
                      </option>
                    </select>
                    <input
                      v-if="
                        info.issue_concern_request_center_office_room ===
                        'OTHER'
                      "
                      v-model="customOffice"
                      class="input rounded-lg border-2 border-gray-200 flex-1 lg:p-3 p-2 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                      placeholder="Specify location"
                      :disabled="
                        !isCreate &&
                        (!isAssignedTechnician || !info.ticket_locked_by_email)
                      "
                      :class="{
                        'bg-gray-100 cursor-not-allowed':
                          !isCreate &&
                          (!isAssignedTechnician ||
                            !info.ticket_locked_by_email),
                      }"
                    />
                  </div>
                </div>

                <!-- 6. OWNER TYPE (Hidden for Hardware, Network, Computer Lab, Accounts, LSU Webpages, Student Portal) -->
                <div
                  v-if="
                    info.issue_concern_request_category_type !== 'Hardware' &&
                    info.issue_concern_request_category_type !== 'Network' &&
                    info.issue_concern_request_category_type !==
                      'Computer Lab' &&
                    info.issue_concern_request_category_type !== 'Accounts' &&
                    info.issue_concern_request_category_type !==
                      'LSU Webpages' &&
                    info.issue_concern_request_category_type !==
                      'Student Portal'
                  "
                  class="w-full"
                >
                  <label class="block font-semibold mb-2 text-gray-700">
                    <i class="fas fa-user-tag text-green-600 mr-1"></i>Owner
                    Type
                    <span v-if="isCreate" class="text-red-600">*</span>
                  </label>
                  <select
                    v-model="info.owner_type"
                    class="input rounded-lg border-2 border-gray-200 lg:p-3 p-2 w-full text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                    :disabled="
                      !isCreate &&
                      (!isAssignedTechnician || !info.ticket_locked_by_email)
                    "
                    :class="{
                      'bg-gray-100 cursor-not-allowed':
                        !isCreate &&
                        (!isAssignedTechnician || !info.ticket_locked_by_email),
                    }"
                  >
                    <option value="LSU">LSU</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>

                <!-- BUY ME COFFEE -->
                <!-- <div class="w-full mb-1">
                  <label class="block text-xs mb-0.5">Buy Me Coffee</label>
                  <select
                    v-model="info.buy_me_coffee"
                    class="input rounded border px-2 py-1 w-full text-xs"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div> -->

                <!-- GCASH RECEIPT UPLOAD -->
                <div v-if="info.buy_me_coffee === 'Yes'" class="w-full mb-1">
                  <label class="block text-xs mb-0.5">GCash Receipt</label>
                  <input
                    type="file"
                    @change="handleReceiptUpload"
                    accept="image/*"
                    class="input rounded border px-2 py-1 w-full text-xs"
                  />
                  <div v-if="receiptPreview" class="mt-2">
                    <div class="relative inline-block">
                      <img
                        :src="receiptPreview"
                        alt="Receipt Preview"
                        class="max-w-xs rounded border"
                      />
                      <button
                        @click="removeReceipt"
                        class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 text-xs"
                      >
                        <i class="fa fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- EVALUATION RATING (for completed tickets) -->
              </div>
            </div>
          </div>
          <!-- LOGS -->
          <div
            class="border-2 border-green-100 rounded-xl lg:p-4 p-3 mb-4 bg-gradient-to-br from-gray-50 to-white shadow-sm"
          >
            <div class="mb-3">
              <h3
                class="lg:text-base text-sm font-bold text-green-800 mb-1 flex items-center"
              >
                <i class="fa fa-history text-green-600 mr-2"></i>
                Status History
              </h3>
              <p class="text-xs text-gray-500">
                {{
                  isCreate
                    ? "Initial status will be set to Pending"
                    : "Track all status changes and updates"
                }}
              </p>
            </div>

            <!-- Existing logs display (read-only) -->
            <div
              class="max-h-48 overflow-y-auto mb-3 space-y-2 bg-white rounded-lg lg:p-3 p-2 border-2 border-gray-100"
            >
              <div
                v-for="(log, i) in info.logs"
                :key="i"
                class="text-xs p-2 rounded"
                :class="itemStatusClass(log.status)"
              >
                <div class="flex justify-between font-semibold">
                  <span>{{ log.status }}</span>
                  <span>{{
                    moment(log.timestamp).format("MMM DD, YYYY hh:mm A")
                  }}</span>
                </div>
                <div class="italic text-xs mt-1">{{ log.remarks }}</div>

                <!-- Technician Information (Admin/Technician View Only) -->
                <div
                  v-if="
                    log.assigned_technician_name ||
                    log.assigned_technician_lsu_email
                  "
                  class="text-xs mt-2 pt-2 border-t border-gray-300 text-gray-600"
                >
                  <div class="flex items-center gap-1">
                    <i class="fas fa-user-edit text-gray-500"></i>
                    <span class="font-semibold">{{
                      isCreate ? "Created by:" : "Updated by:"
                    }}</span>
                    <span>{{ log.assigned_technician_name || "Unknown" }}</span>
                  </div>
                  <div
                    v-if="log.assigned_technician_lsu_email"
                    class="flex items-center gap-1 ml-4 mt-0.5"
                  >
                    <i class="fas fa-envelope text-gray-500 text-[10px]"></i>
                    <span class="text-[10px]">{{
                      log.assigned_technician_lsu_email
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- UPDATE STATUS SECTION - Show for create mode or if user is assigned technician when ticket is locked -->
            <div
              v-if="
                isCreate || !info.ticket_locked_by_email || isAssignedTechnician
              "
              class="mt-3 pt-3 border-t-2 border-green-200 bg-green-50 lg:p-3 p-2 rounded-lg"
            >
              <div class="flex items-center gap-2 mb-2">
                <i class="fa fa-edit text-green-600"></i>
                <label class="text-sm font-semibold text-green-800">
                  {{
                    isCreate
                      ? "Set Initial Status (Optional)"
                      : "Update Status (Optional)"
                  }}
                </label>
              </div>
              <p class="text-xs text-gray-600 mb-3 italic">
                {{
                  isCreate
                    ? '💡 Default status is "Pending" - you can change it if needed'
                    : "💡 You can save changes without updating the status"
                }}
              </p>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="text-xs font-semibold mb-1 block text-gray-700"
                    >Status</label
                  >
                  <select
                    v-model="newLog.status"
                    class="input rounded-lg border-2 border-gray-200 lg:p-2 p-2 text-sm w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  >
                    <option value="">
                      {{ isCreate ? "Keep as Pending" : "No status update" }}
                    </option>
                    <option value="Pending">Pending</option>
                    <option value="Unsuccessful">Unsuccessful</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Lacking Content">Lacking Content</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="For Review">For Review</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label class="text-xs font-semibold mb-1 block text-gray-700"
                    >Remarks</label
                  >
                  <input
                    v-model="newLog.remarks"
                    type="text"
                    :placeholder="
                      isCreate ? 'Optional initial remarks' : 'Optional remarks'
                    "
                    class="input rounded-lg border-2 border-gray-200 lg:p-2 p-2 text-sm w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  />
                </div>
              </div>

              <!-- Info message for In Progress status -->
              <div
                v-if="newLog.status === 'In Progress'"
                class="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700"
              >
                <i class="fas fa-info-circle mr-1"></i>
                <span
                  >When you set status to "In Progress", a log entry will be
                  created for each assigned technician above.</span
                >
              </div>
            </div>

            <!-- READ-ONLY STATUS VIEW - Show when ticket is locked and user is NOT assigned -->
            <div
              v-else-if="info.ticket_locked_by_email && !isAssignedTechnician"
              class="mt-3 pt-3 border-t bg-gray-50 p-3 rounded"
            >
              <div class="flex items-center gap-2 mb-2">
                <i class="fas fa-lock text-orange-600"></i>
                <label class="text-sm font-semibold text-gray-700"
                  >Status Updates (View Only)</label
                >
              </div>
              <p class="text-xs text-orange-600 mb-3 italic">
                <i class="fas fa-info-circle mr-1"></i>
                This ticket is locked. Only assigned personnel can update the
                status.
              </p>

              <!-- Current Status Display -->
              <div class="bg-white border rounded p-3">
                <div class="text-xs font-semibold text-gray-600 mb-2">
                  Current Status:
                </div>
                <div class="flex items-center gap-2">
                  <span
                    class="px-3 py-1.5 rounded text-xs font-semibold"
                    :class="ticketStatusClass(latestStatus(info)?.status)"
                  >
                    {{ latestStatus(info)?.status || "Pending" }}
                  </span>
                  <span class="text-xs text-gray-500">
                    {{ latestStatus(info)?.remarks || "N/A" }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- CLIENT FEEDBACK & RATING SECTION -->
          <div
            v-if="!isCreate && (info.evaluation_feedback_client_star_rating || info.evaluation_feedback_client_comment)"
            class="border-2 border-blue-100 rounded-xl lg:p-4 p-3 mb-4 bg-gradient-to-br from-blue-50 to-white shadow-sm"
          >
            <div class="mb-3">
              <h3 class="lg:text-base text-sm font-bold text-blue-800 mb-1 flex items-center">
                <i class="fa fa-star text-yellow-500 mr-2"></i>
                Client Feedback & Rating
              </h3>
              <p class="text-lg text-gray-500">
               How's my service?
              </p>
            </div>

            <!-- Star Rating Display -->
            <div v-if="info.evaluation_feedback_client_star_rating" class="mb-3">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <i class="fa fa-star text-yellow-500 mr-1"></i>
                Rating:
              </label>
              <div class="flex items-center gap-2 bg-white p-3 rounded-lg border">
                <div class="flex items-center gap-1">
                  <span v-for="star in 5" :key="star" class="text-lg">
                    <i
                      class="fa fa-star"
                      :class="star <= parseInt(info.evaluation_feedback_client_star_rating || 0) ? 'text-yellow-500' : 'text-gray-300'"
                    ></i>
                  </span>
                </div>
                <span class="text-sm font-semibold text-gray-700">
                  {{ info.evaluation_feedback_client_star_rating }} / 5
                </span>
              </div>
            </div>

          <!-- Rating Description (shows only for selected rating) -->
                  <div v-if="info.evaluation_feedback_client_star_rating" class="mt-2 mb-5">
                    <p class="text-sm font-semibold text-gray-700">
                      <span v-if="info.evaluation_feedback_client_star_rating == 5" class="text-green-600">⭐ Excellent</span>
                      <span v-else-if="info.evaluation_feedback_client_star_rating == 4" class="text-blue-600">⭐ Very Satisfactory</span>
                      <span v-else-if="info.evaluation_feedback_client_star_rating == 3" class="text-yellow-600">⭐ Satisfactory</span>
                      <span v-else-if="info.evaluation_feedback_client_star_rating == 2" class="text-orange-600">⭐ Fair</span>
                      <span v-else-if="info.evaluation_feedback_client_star_rating == 1" class="text-red-600">⭐ Poor</span>
                    </p>
                  </div>


            <!-- Feedback Comment Display -->
            <div v-if="info.evaluation_feedback_client_comment" class="mb-4">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <i class="fa fa-comment text-blue-600 mr-1"></i>
                Comment:
              </label>
              <div class="bg-white p-3 rounded-lg border">
                <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ info.evaluation_feedback_client_comment }}</p>
              </div>
            </div>
          </div>

          <!-- ACTIONS -->
          <div class="flex justify-between gap-3 mt-10">
            <button
              class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 font-semibold"
              @click="closeModal"
              :disabled="modalLoading"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              @click="isCreate ? createTicket() : saveChanges()"
              :disabled="
                modalLoading ||
                (!isCreate &&
                  info.ticket_locked_by_email &&
                  !isAssignedTechnician)
              "
              :title="
                !isCreate &&
                info.ticket_locked_by_email &&
                !isAssignedTechnician
                  ? 'Only assigned personnel can save changes to locked tickets'
                  : ''
              "
            >
              <i class="fa mr-1" :class="isCreate ? 'fa-plus' : 'fa-save'"></i>
              {{ isCreate ? "Create" : "Save" }}
            </button>
          </div>

          <!-- Warning message for non-assigned personnel -->
          <div
            v-if="
              !isCreate && info.ticket_locked_by_email && !isAssignedTechnician
            "
            class="mt-3 p-3 bg-orange-50 border-2 border-orange-200 rounded-lg"
          >
            <div class="flex items-start gap-2">
              <i class="fas fa-lock text-orange-600 mt-0.5"></i>
              <div class="text-xs text-orange-700">
                <p class="font-semibold mb-1">Ticket Locked</p>
                <p>
                  This ticket is locked and can only be modified by assigned
                  personnel. You can view the details but cannot make changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transfer/Assign Personnel Modal -->
    <div
      v-if="showTransferModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm"
      @click.self="!modalLoading && (showTransferModal = false)"
    >
      <div
        class="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden animate-fade-in relative"
        @click.stop
      >
        <!-- Loading Overlay -->
        <div
          v-if="modalLoading"
          class="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center"
        >
          <div class="text-center">
            <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-3"></i>
            <p class="text-sm font-semibold text-gray-700">
              {{ isAssignMode ? 'Assigning personnel...' : 'Transferring ticket...' }}
            </p>
            <p class="text-xs text-gray-500 mt-1">Please wait</p>
          </div>
        </div>

        <!-- Yellow Header for Assign Mode -->
        <div
          v-if="isAssignMode"
          class="flex items-center bg-gradient-to-r from-yellow-600 to-yellow-700 px-6 py-4 gap-x-3"
        >
          <i class="fas fa-user-plus mr-2 text-white"></i>
          <h3 class="text-white text-xl font-bold">
            Assign Personnel to This Ticket
          </h3>
        </div>

        <!-- Purple Header for Transfer Mode -->
        <div
          v-else
          class="flex items-center bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 gap-x-3"
        >
          <i class="fas fa-exchange-alt text-white text-2xl"></i>
          <h3 class="text-white text-xl font-bold">
            Transfer Ticket to Other Personnel
          </h3>
        </div>

        <div class="p-6">
          <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p class="text-xs text-blue-800">
              <i class="fas fa-info-circle mr-1"></i>
              <strong>Current Assignment:</strong>
              {{
                info.technicians_assigned?.map((t) => t.name).join(", ") ||
                "None"
              }}
            </p>
            <p class="text-xs text-blue-700 mt-1">
              Select new technician(s) to transfer this ticket. The client and
              new technicians will be notified via email.
            </p>
          </div>

          <label class="text-sm font-semibold mb-2 block"
            >Select New Technician(s):</label
          >
          <div class="border rounded-lg p-3 max-h-64 overflow-y-auto">
            <label
              v-for="tech in availableTransferTechnicians"
              :key="tech.email"
              class="flex items-center gap-x-2 text-sm cursor-pointer py-2 px-3 rounded hover:bg-gray-50"
            >
              <input
                type="checkbox"
                :value="tech"
                v-model="transferTechnicians"
                class="accent-purple-600"
              />
              <span>{{ tech.name }}</span>
              <span class="text-xs text-gray-500">({{ tech.email }})</span>
            </label>
            <div
              v-if="availableTransferTechnicians.length === 0"
              class="text-xs text-gray-500 italic text-center py-4"
            >
              <i class="fas fa-info-circle mr-1"></i>
              All personnel are already assigned to this ticket
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              @click="showTransferModal = false"
              :disabled="modalLoading"
              class="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-times mr-2"></i>Cancel
            </button>





            <!-- Yellow Confirm Button for Assign Mode -->
            <button
              v-if="isAssignMode"
              @click="confirmTransferTicket"
              :disabled="transferTechnicians.length === 0 || modalLoading"
              class="flex-1 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i
                :class="modalLoading ? 'fas fa-spinner fa-spin mr-2' : 'fas fa-check mr-2'"
              ></i>
              {{ modalLoading ? 'Assigning...' : 'Confirm Assignment' }}
            </button>

            <!-- Purple Confirm Button for Transfer Mode -->
            <button
              v-else
              @click="confirmTransferTicket"
              :disabled="transferTechnicians.length === 0 || modalLoading"
              class="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i
                :class="modalLoading ? 'fas fa-spinner fa-spin mr-2' : 'fas fa-check mr-2'"
              ></i>
              {{ modalLoading ? 'Transferring...' : 'Confirm Transfer' }}
            </button>
          </div>







        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted, reactive, watch } from "vue";
import { useUserStore } from "@/stores/user";
import moment from "moment";

const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);

const requests = ref([]);
const showModal = ref(false);
const isCreate = ref(false);
const statusFilter = ref("");
const technicianFilter = ref("");
const searchFilter = ref("");
const debouncedSearchFilter = ref(""); // Debounced version for better performance
const dateFilter = ref("");
const customOffice = ref("");
const showTransferModal = ref(false);
const transferTechnicians = ref([]);
const isAssignMode = ref(false); // Track if modal is in "Assign" mode vs "Transfer" mode

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(20);

// Sorting
const sortColumn = ref("created_at");
const sortDirection = ref("asc"); // oldest first by default

// Real-time update
let realtimeInterval = null;

// Debounce timer for search
let searchDebounceTimer = null;

const successfullySavedData = ref(false);

// Dropdown options
const CATEGORY_OPTIONS = [
  "Hardware",
  "Software",
  "Network",
  "Computer Lab",
  "Accounts",
  "LSU Webpages",
  "Student Portal",
  "Others",
];

// Computer Lab location options
const COMPUTER_LAB_LOCATIONS = {
  "BVM and SJ Buildings": [
    "BVM 4F Computer Lab",
    "BVM 2F Computer Lab",
    "SJ Computer Lab",
  ],
  "LS Building": [
    "LS209 - Maclab",
    "LS211 - Networking",
    "LS212 - Programming",
    "LS213 - Multimedia",
    "LS215 - Openlab",
  ],
};

// Computed property to get location options based on category
const getLocationOptions = computed(() => {
  // If Computer Lab is selected, show computer lab locations
  if (info.value.issue_concern_request_category_type === "Computer Lab") {
    // Combine all computer lab locations
    const allLabLocations = [
      ...COMPUTER_LAB_LOCATIONS["BVM and SJ Buildings"],
      ...COMPUTER_LAB_LOCATIONS["LS Building"],
    ];
    return allLabLocations;
  }

  // Otherwise, show default office options
  return CENTER_OFFICE_ROOM_OPTIONS;
});

const ITEM_TYPE_OPTIONS_MAP = {
  Hardware: [
    "Laptop",
    "Desktop",
    "Printer",
    "Scanner",
    "Monitor",
    "Keyboard",
    "Mouse",
    "Projector",
    "Webcam",
    "Headset",
    "Speaker",
    "Microphone",
    "External Hard Drive",
    "USB Flash Drive",
    "Power Supply",
    "Motherboard",
    "RAM",
    "Graphics Card",
    "CPU",
    "Cooling Fan",
    "Others",
  ],
  Software: ["Installation", "Repair", "Uninstall"],
  Network: ["WiFi Access", "Network Configuration"],
  "Computer Lab": [
    "Computer Setup",
    "Software Installation",
    "Hardware Issue",
    "Network Connectivity",
    "Maintenance",
    "Others",
  ],
  Accounts: ["LSU Gmail", "Canvas", "Microsoft", "Student Portal", "Others"],
  "LSU Webpages": [
    "Update Content",
    "Fix Errors",
    "Add New Page",
    "Remove Page",
    "Delete Article or Content",
    "Add Article or Content",
    "Update Article or Content",
    "Quality Assurance Testing",
    "Others",
  ],
  "Student Portal": ["Forgot Password", "Others"],
  Others: [
    "Screwdriver Set",
    "Cable Ties",
    "Thermal Paste",
    "Cleaning Kit",
    "Cable Tester",
    "Crimping Tool",
    "Anti-static Wrist Strap",
    "Compressed Air",
    "HDMI Cable",
    "VGA Cable",
    "Ethernet Cable",
    "USB Cable",
    "Power Cable",
    "Extension Cord",
    "Others",
  ],
};

const listCenterOfficeRoom = [
  "Accounting Office",
  "Campus Development",
  "General Services Office",
  "Human Resource and Development",
  "Office of the Chancellor",
  "Office of the President",
  "Registrar's Office",
  "Research Office",
  "Corporate and Executive Management Center",
  "Vice Chancellor for Academics Affairs",
  "Vice President for Planning and Strategic Services",
  "Vice President for Finance and Accounting Services",
  "Vice President for Administrative Services",
  "Vice President for Lasallian Mission Services",
  "Vice President for Advancement and Linkages Services",
  "Lasallian Mission Center",
  "Learning Resource Center",
  "College of Arts and Sciences",
  "College of Business and Accountancy",
  "College of Criminal Justice Education",
  "College of Computer Studies, Engineering, and Architecture",
  "College of Teacher Education",
  "College of Tourism and Hospitality Management",
  "College of Nursing",
  "School of Graduate Studies",
];

const CENTER_OFFICE_ROOM_OPTIONS = [
  ...listCenterOfficeRoom,
  "Network Programs and Computerization Center",
  "N/A",
  "OTHER",
];

const SEMESTER_OPTIONS = ["First Semester", "Second Semester", "Summer"];
const STATUS_OPTIONS = [
  "New",
  "Used",
  "For Repair",
  "For Disposal",
  "Returned",
  "Issued",
  "Replaced",
  "Condemned",
  "Serviceable",
  "Unserviceable",
  "Running",
];
const TECHNICIANS_PERSONNEL = [
  {
    name: "Michael John Puertogalera",
    email: "michaeljohn.puertogalera@lsu.edu.ph",
    specializations: ["Accounts", "Software"],
    role: "Accounts / Software",
  },
  {
    name: "Jason Yap",
    email: "jason.yap@lsu.edu.ph",
    specializations: ["Network", "Accounts", "Software"],
    role: "Network / Accounts / Software",
  },
  {
    name: "Flourence John Gonzaga",
    email: "johny14_gonzaga@lsu.edu.ph",
    specializations: ["Network", "Accounts", "Software"],
    role: "Network / Accounts / Software",
  },
  {
    name: "Denzel Roy Suarez",
    email: "denzelroy.suarez@lsu.edu.ph",
    specializations: ["Computer Lab"],
    location: "BVM and SJ Buildings",
    role: "Computer Laboratory: BVM and SJ Buildings Rooms",
  },
  {
    name: "Rommel Rosal",
    email: "rommel.rosal@lsu.edu.ph",
    specializations: ["Computer Lab"],
    location: "LS Building",
    role: "Computer Laboratory: LS Building Rooms",
  },
  {
    name: "Giovanni Jose Morales",
    email: "giovanni.morales@lsu.edu.ph",
    specializations: ["Hardware"],
    role: "PC and Printers and Other Hardwares - Whole LSU Campus Admins and Staffs",
  },
  {
    name: "Jo Renlee Luna",
    email: "jorenlee.luna@lsu.edu.ph",
    specializations: ["Software"],
    role: "LSU Website",
  },
];

const loading = ref(false);
const modalLoading = ref(false);

const fetchRequests = async (silent = false) => {
  if (!silent) loading.value = true;
  try {
    const res = await $fetch(endpoint.value + "/api/cits/request-ticket/list/");
    const newData = res.data || res;

    // Only update if data has actually changed (performance optimization)
    if (JSON.stringify(requests.value) !== JSON.stringify(newData)) {
      requests.value = newData;
    }
  } catch (err) {
    console.error("Failed to fetch tech support list", err);
  } finally {
    if (!silent) loading.value = false;
  }
};

// Real-time updates every second
const startRealtimeUpdates = () => {
  realtimeInterval = setInterval(() => {
    fetchRequests(true); // silent update
  }, 1000);
};

const stopRealtimeUpdates = () => {
  if (realtimeInterval) {
    clearInterval(realtimeInterval);
    realtimeInterval = null;
  }
};

onMounted(() => {
  fetchRequests();
  startRealtimeUpdates();
});

onUnmounted(() => {
  stopRealtimeUpdates();
  // Clear debounce timer on unmount
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
});

// Debounce search filter for better performance (300ms delay)
watch(searchFilter, (newValue) => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }

  searchDebounceTimer = setTimeout(() => {
    debouncedSearchFilter.value = newValue;
    currentPage.value = 1; // Reset to first page on search
  }, 300);
});

const newLog = reactive({
  status: "",
  remarks: "",
});

function addStatusLog() {
  // Make status update optional - only add if status is provided
  if (!newLog.status) {
    return; // Skip adding log if no status selected
  }

  if (!info.value.logs) info.value.logs = [];

  // Get logged-in user information
  const loggedInUser = userStore.user?.email || userStore.userEmail;
  const loggedInTech = TECHNICIANS_PERSONNEL.find(
    (tech) => tech.email === loggedInUser,
  );
  const updaterName = loggedInTech?.name || userStore.user?.name || "Unknown";
  const updaterEmail = loggedInUser || "";

  // Special handling for ALL status changes - create log entry for each assigned technician
  // This applies to: Pending, Unsuccessful, In Progress, Completed, Cancelled, Reviewed, Closed
  if (
    info.value.technicians_assigned &&
    info.value.technicians_assigned.length > 0
  ) {
    // Create a log entry for each assigned technician
    info.value.technicians_assigned.forEach((tech) => {
      info.value.logs.push({
        status: newLog.status,
        remarks: newLog.remarks || "N/A",
        timestamp: new Date().toISOString(),
        assigned_technician_name: tech.name || "",
        assigned_technician_lsu_email: tech.email || "",
      });
    });

    // Lock the ticket to the first assigned technician (for all status changes)
    if (info.value.technicians_assigned[0]?.email) {
      info.value.ticket_locked_by_email =
        info.value.technicians_assigned[0].email;
    }
  } else {
    // Fallback: If no technicians assigned, add a single log entry with logged-in user's information
    info.value.logs.push({
      status: newLog.status,
      remarks: newLog.remarks || "N/A",
      timestamp: new Date().toISOString(),
      assigned_technician_name: updaterName,
      assigned_technician_lsu_email: updaterEmail,
    });
  }

  // Update ticket's current_status
  info.value.current_status = newLog.status;

  // Reset input
  newLog.status = "";
  newLog.remarks = "";
}

// ================= STATUS HELPERS =================
const latestStatus = (item) =>
  item.logs?.length ? item.logs[item.logs.length - 1] : null;

// Backend-aligned filter mapping
const TICKET_STATUS_FILTER_MAP = {
  pending: ["Pending"],
  "in progress": ["In Progress", "Reviewed"],
  completed: ["Completed", "Done", "Closed"],
};

// Clear filters function
const clearFilters = () => {
  statusFilter.value = "";
  technicianFilter.value = "";
  searchFilter.value = "";
  dateFilter.value = "";
  currentPage.value = 1;
};

// Sort function
const sortBy = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortColumn.value = column;
    sortDirection.value = "asc";
  }
  currentPage.value = 1; // Reset to first page when sorting
};

// Enhanced filter with sorting
// Check if logged-in user is an assigned technician
const isAssignedTechnician = computed(() => {
  if (!info.value.technicians_assigned || !userStore.user?.email) return false;

  return info.value.technicians_assigned.some(
    (tech) =>
      tech.email === userStore.user.email || tech.email === userStore.userEmail,
  );
});

// Get available technicians for transfer (exclude currently assigned)
const availableTransferTechnicians = computed(() => {
  if (!info.value.technicians_assigned) return TECHNICIANS_PERSONNEL;

  // Get emails of currently assigned technicians
  const assignedEmails = info.value.technicians_assigned.map(tech => tech.email);

  // Filter out currently assigned technicians to prevent duplicates
  return TECHNICIANS_PERSONNEL.filter(tech => !assignedEmails.includes(tech.email));
});

// Check if ticket is completed (for enabling rating)
const isTicketCompleted = computed(() => {
  if (!info.value.current_status) return false;

  return (
    info.value.current_status === "Completed" ||
    (info.value.logs &&
      info.value.logs.some((log) => log.status === "Completed"))
  );
});

const filteredRequests = computed(() => {
  let filtered = [...requests.value];

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter((r) => {
      const status = latestStatus(r)?.status;
      return TICKET_STATUS_FILTER_MAP[statusFilter.value]?.includes(status);
    });
  }

  // Technician filter
  if (technicianFilter.value) {
    filtered = filtered.filter((r) =>
      r.technicians_assigned?.some(
        (tech) => tech.name === technicianFilter.value,
      ),
    );
  }

  // Universal Search filter - searches across ALL fields (using debounced value)
  if (debouncedSearchFilter.value) {
    const searchInput = debouncedSearchFilter.value.toLowerCase().trim();

    // Split search into individual words for multi-word matching
    const searchWords = searchInput
      .split(/\s+/)
      .filter((word) => word.length > 0);

    filtered = filtered.filter((r) => {
      // Basic fields
      const ticketId = (r.ticket_id || "").toString().toLowerCase();
      const requestorName = (r.requestor_fullname || "")
        .toString()
        .toLowerCase();
      const requestorEmail = (r.requestor_lsu_email || "")
        .toString()
        .toLowerCase();

      // Category and concern fields
      const category = (r.issue_concern_request_category_type || "")
        .toString()
        .toLowerCase();
      const specificConcern = (r.issue_concern_request_item_type || "")
        .toString()
        .toLowerCase();
      const centerOfficeRoom = (
        r.issue_concern_request_center_office_room || ""
      )
        .toString()
        .toLowerCase();

      // Details and other fields
      const details = (r.issue_concern_request_details || "")
        .toString()
        .toLowerCase();
      const ownerType = (r.owner_type || "").toString().toLowerCase();
      const clientRole = (r.client_role || "").toString().toLowerCase();

      // Assigned personnel - search through all technician names and emails
      let assignedPersonnel = "";
      if (r.technicians_assigned && Array.isArray(r.technicians_assigned)) {
        assignedPersonnel = r.technicians_assigned
          .map((t) => {
            const name = (t.name || "").toString();
            const email = (t.email || "").toString();
            return `${name} ${email}`;
          })
          .join(" ")
          .toLowerCase();
      }

      // Current status
      const currentStatus = (latestStatus(r)?.status || "")
        .toString()
        .toLowerCase();

      // Search through all logs (status, remarks, and technician names)
      let logsText = "";
      if (r.logs && Array.isArray(r.logs)) {
        logsText = r.logs
          .map((log) => {
            const status = (log.status || "").toString();
            const remarks = (log.remarks || "").toString();
            const techName = (log.assigned_technician_name || "").toString();
            const techEmail = (
              log.assigned_technician_lsu_email || ""
            ).toString();
            return `${status} ${remarks} ${techName} ${techEmail}`;
          })
          .join(" ")
          .toLowerCase();
      }

      // Date fields (formatted for search)
      const createdDate = r.created_at
        ? moment(r.created_at).format("YYYY-MM-DD HH:mm:ss").toLowerCase()
        : "";
      const updatedDate = r.updated_at
        ? moment(r.updated_at).format("YYYY-MM-DD HH:mm:ss").toLowerCase()
        : "";

      // Combine all searchable fields into one string
      const allFields = `${ticketId} ${requestorName} ${requestorEmail} ${category} ${specificConcern} ${centerOfficeRoom} ${details} ${ownerType} ${clientRole} ${assignedPersonnel} ${currentStatus} ${logsText} ${createdDate} ${updatedDate}`;

      // For multi-word search: ALL words must be found (AND logic)
      // Each word can be found in any field
      return searchWords.every((word) => allFields.includes(word));
    });
  }

  // Date filter
  if (dateFilter.value) {
    const now = moment();
    filtered = filtered.filter((r) => {
      const created = moment(r.created_at);
      switch (dateFilter.value) {
        case "today":
          return created.isSame(now, "day");
        case "week":
          return created.isSame(now, "week");
        case "month":
          return created.isSame(now, "month");
        case "year":
          return created.isSame(now, "year");
        default:
          return true;
      }
    });
  }

  // Sorting
  filtered.sort((a, b) => {
    let aVal, bVal;

    switch (sortColumn.value) {
      case "ticket_id":
        aVal = a.ticket_id || "";
        bVal = b.ticket_id || "";
        break;
      case "requestor_fullname":
        aVal = a.requestor_fullname || "";
        bVal = b.requestor_fullname || "";
        break;
      case "requestor_lsu_email":
        aVal = a.requestor_lsu_email || "";
        bVal = b.requestor_lsu_email || "";
        break;
      case "technicians_assigned":
        aVal = a.technicians_assigned?.join(", ") || "";
        bVal = b.technicians_assigned?.join(", ") || "";
        break;
      case "status":
        aVal = latestStatus(a)?.status || "";
        bVal = latestStatus(b)?.status || "";
        break;
      case "created_at":
      default:
        aVal = moment(a.created_at).valueOf();
        bVal = moment(b.created_at).valueOf();
        break;
    }

    if (sortDirection.value === "asc") {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });

  return filtered;
});

// Paginated results
const paginatedRequests = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredRequests.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredRequests.value.length / itemsPerPage.value);
});

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// Visible page numbers for pagination
const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

// Get specific type options based on category
const getSpecificTypeOptions = (categoryType) => {
  if (!categoryType || !ITEM_TYPE_OPTIONS_MAP[categoryType]) {
    return [];
  }
  return ITEM_TYPE_OPTIONS_MAP[categoryType];
};

// Get mood icon based on ticket age and status
const getMoodIcon = (item) => {
  const status = latestStatus(item)?.status?.toLowerCase();
  const isDone =
    status === "completed" || status === "closed" || status === "for review";

  // If ticket is completed/closed/for review - trophy
  if (isDone) {
    return {
      emoji: "🏆",
      bgClass: "bg-gradient-to-br from-gray-200 to-gray-300",
      title: "Completed",
    };
  }

  // If ticket is lacking content - warning/document emoji
  if (status === "lacking content") {
    return {
      emoji: "📋",
      bgClass: "bg-gradient-to-br from-orange-400 to-orange-500",
      title: "Lacking Content",
    };
  }

  const createdAt = moment(item.created_at);
  const now = moment();
  const hoursPassed = now.diff(createdAt, "hours");

  // Special handling for "In Progress" status based on age
  if (status === "in progress") {
    if (hoursPassed < 24) {
      return {
        emoji: "😊",
        bgClass: "bg-gradient-to-br from-green-400 to-green-500",
        title: "In Progress (< 24 hours)",
      };
    } else {
      return {
        emoji: "☹️",
        bgClass: "bg-gradient-to-br from-red-400 to-red-500",
        title: "In Progress (> 24 hours)",
      };
    }
  }

  // For other statuses (Pending, Unsuccessful, Cancelled, etc.)
  // New ticket (less than 24 hours) - green happy face
  if (hoursPassed < 24) {
    return {
      emoji: "😊",
      bgClass: "bg-gradient-to-br from-green-400 to-green-500",
      title: "New ticket (< 24 hours)",
    };
  }
  // 24-48 hours - yellow neutral face
  else if (hoursPassed < 48) {
    return {
      emoji: "😐",
      bgClass: "bg-gradient-to-br from-yellow-400 to-yellow-500",
      title: "Aging ticket (24-48 hours)",
    };
  }
  // 48+ hours and not done - red sad face
  else {
    return {
      emoji: "☹️",
      bgClass: "bg-gradient-to-br from-red-400 to-red-500",
      title: "Overdue ticket (48+ hours)",
    };
  }
};

// Date helpers
const getCurrentSemester = () => {
  const month = moment().month() + 1;
  if (month >= 1 && month <= 5) return "Second Semester";
  if (month >= 6 && month <= 7) return "Summer";
  return "First Semester";
};

const getAcademicYear = () => {
  const year = moment().year();
  const month = moment().month() + 1;
  return month >= 6 ? `A.Y ${year} - ${year + 1}` : `A.Y ${year - 1} - ${year}`;
};

const getTodayDateChecked = () => moment().format("DD/MM/YYYY hh:mm A");

const ACADEMIC_YEAR_OPTIONS = (() => {
  const currentYear = moment().year();
  const years = [];
  for (let i = -5; i <= 1; i++) {
    const start = currentYear + i;
    years.push(`A.Y ${start} - ${start + 1}`);
  }
  return years;
})();

// Receipt handling
const receiptFile = ref(null);
const receiptPreview = ref("");

const handleReceiptUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    receiptFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      receiptPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const removeReceipt = () => {
  receiptFile.value = null;
  receiptPreview.value = "";
};

// Form info
const info = ref({
  ticket_id: "TID" + Date.now(),
  requestor_fullname: "",
  requestor_lsu_email: "",
  technicians_assigned: [],
  issue_concern_request_details: "",
  issue_concern_request_category_type: "",
  issue_concern_request_item_type: "",
  issue_concern_request_center_office_room: "",
  owner_type: "LSU",
  client_role: "",
  buy_me_coffee: "No",
  evaluation_feedback_client_star_rating: "",
  ticket_locked_by_email: "",
  logs: [
    {
      timestamp: new Date().toISOString(),
      remarks: "Initial status",
      status: "Pending",
      assigned_technician_name: "",
      assigned_technician_lsu_email: "",
    },
  ],
});

// Watch for ticket transfers on completed tickets
// Automatically add "Completed" status log for new technicians
watch(
  () => info.value.logs,
  (newLogs, oldLogs) => {
    if (!newLogs || !oldLogs) return;

    // Check if a "Transferred" log was just added
    const lastLog = newLogs[newLogs.length - 1];
    if (lastLog?.status === "Transferred") {
      // Check if there's a "Completed" status before the transfer
      const logsBeforeTransfer = newLogs.slice(0, -1);
      const hasCompletedStatus = logsBeforeTransfer.some(
        log => log.status === "Completed"
      );

      if (hasCompletedStatus) {
        // Find the original completion log
        const completedLog = [...logsBeforeTransfer]
          .reverse()
          .find(log => log.status === "Completed");

        if (completedLog && info.value.technicians_assigned) {
          // Check if "Completed" logs were already added for new technicians
          const newTechnicianEmails = info.value.technicians_assigned.map(t => t.email);
          const completedLogsAfterTransfer = newLogs.filter(
            (log, index) =>
              index > newLogs.indexOf(lastLog) &&
              log.status === "Completed"
          );

          // Only add if not already added (prevent duplicates)
          if (completedLogsAfterTransfer.length === 0) {
            console.log("✅ Auto-adding Completed status for transferred ticket");
          }
        }
      }
    }
  },
  { deep: true }
);

// Computed property to get logged-in technician
const loggedInTechnician = computed(() => {
  const userEmail = userStore.user?.email;
  if (!userEmail) return null;

  return TECHNICIANS_PERSONNEL.find((tech) => tech.email === userEmail);
});

// Modal controls
const openCreateModal = () => {
  isCreate.value = true;
  receiptFile.value = null;
  receiptPreview.value = "";

  // Reset newLog for status update
  newLog.status = "";
  newLog.remarks = "";

  info.value = {
    ticket_id: "TID" + Date.now(),
    requestor_fullname: "",
    requestor_lsu_email: "",
    technicians_assigned: [], // Manual assignment only - no auto-assign
    issue_concern_request_details: "",
    issue_concern_request_category_type: "",
    issue_concern_request_item_type: "",
    issue_concern_request_center_office_room: "",
    owner_type: "LSU",
    client_role: "",
    buy_me_coffee: "No",
    evaluation_feedback_client_star_rating: "",
    ticket_locked_by_email: "",
    logs: [
      {
        timestamp: new Date().toISOString(),
        remarks: "Initial status",
        status: "Pending",
        assigned_technician_name: "",
        assigned_technician_lsu_email: "",
      },
    ],
  };
  showModal.value = true;
};

const openModal = (item) => {
  isCreate.value = false;

  // Parse technicians_assigned (handle both string and array formats)
  let assignedTechnicians = [];

  if (item.technicians_assigned) {
    if (typeof item.technicians_assigned === "string") {
      // If it's a JSON string, parse it
      try {
        assignedTechnicians = JSON.parse(item.technicians_assigned);
      } catch (e) {
        console.error("Failed to parse technicians_assigned:", e);
        assignedTechnicians = [];
      }
    } else if (Array.isArray(item.technicians_assigned)) {
      // If it's already an array, use it directly
      assignedTechnicians = item.technicians_assigned;
    }
  }

  // Validate and ensure assigned technicians have proper structure
  assignedTechnicians = assignedTechnicians.filter(
    (tech) => tech && tech.email && tech.name,
  );

  // Check if ticket should be locked to assigned personnel
  let lockedByEmail = item.ticket_locked_by_email || "";

  if (assignedTechnicians.length > 0 && !lockedByEmail) {
    // Auto-lock to first assigned technician if not already locked
    lockedByEmail = assignedTechnicians[0].email;
  }

  // Validate that locked email belongs to one of the assigned technicians
  if (lockedByEmail && assignedTechnicians.length > 0) {
    const isValidLock = assignedTechnicians.some(
      (tech) => tech.email === lockedByEmail,
    );
    if (!isValidLock) {
      // If locked email is not in assigned list, lock to first assigned technician
      lockedByEmail = assignedTechnicians[0].email;
    }
  }

  // Directly assign reactive ref with validated data
  info.value = reactive({
    ...item,
    technicians_assigned: assignedTechnicians,
    ticket_locked_by_email: lockedByEmail,
    logs: item.logs ? [...item.logs] : [],
  });

  showModal.value = true;
};

const closeModal = () => (showModal.value = false);

// Normalize office before submit
const normalizeOffice = () => {
  if (info.value.issue_concern_request_center_office_room === "OTHER")
    info.value.issue_concern_request_center_office_room =
      customOffice.value || "Other";
};

// Check if user has unrated tickets (ANY status - pending, in progress, completed, etc.)
const checkForUnratedTickets = async (email) => {
  // Exception for npc@lsu.edu.ph - skip rating requirement
  if (email && email.toLowerCase() === "npc@lsu.edu.ph") {
    return false;
  }

  try {
    const res = await $fetch(endpoint.value + "/api/cits/request-ticket/list/");

    if (res && Array.isArray(res)) {
      // Filter tickets for this user
      const userTickets = res.filter(
        (ticket) => ticket.requestor_lsu_email === email,
      );

      // Check if ANY ticket (regardless of status) is missing rating or feedback
      const unratedTickets = userTickets.filter((ticket) => {
        const hasNoRating =
          !ticket.evaluation_feedback_client_star_rating ||
          ticket.evaluation_feedback_client_star_rating === "" ||
          ticket.evaluation_feedback_client_star_rating === null;
        const hasNoFeedback =
          !ticket.evaluation_feedback_client_comment ||
          ticket.evaluation_feedback_client_comment === "" ||
          ticket.evaluation_feedback_client_comment === null;

        // Consider a ticket unrated if it's missing BOTH rating AND feedback
        return hasNoRating && hasNoFeedback;
      });

      return unratedTickets.length > 0 ? unratedTickets.length : false;
    }

    return false;
  } catch (error) {
    console.error("Error checking for unrated tickets:", error);
    // If there's an error, allow submission to proceed
    return false;
  }
};

const createTicket = async () => {
  // Validate required fields
  if (!info.value.requestor_fullname || !info.value.requestor_lsu_email) {
    showToaster(
      "❌ Please fill in all required fields (Name and Email).",
      "error",
    );
    return;
  }

  // Check for unrated tickets
  const unratedCount = await checkForUnratedTickets(
    info.value.requestor_lsu_email,
  );
  if (unratedCount) {
    showToaster(
      `❌ This user has ${unratedCount} unrated ticket${unratedCount > 1 ? "s" : ""}. Please ask them to rate all previous tickets before creating a new one.`,
      "error",
      5000,
    );
    return;
  }

  // Close modal immediately for instant feedback
  showModal.value = false;

  modalLoading.value = true;
  normalizeOffice();

  // Update the initial log with technician information (who created the walk-in ticket)
  if (info.value.logs && info.value.logs.length > 0) {
    info.value.logs[0].assigned_technician_name = userStore.user?.name || "";
    info.value.logs[0].assigned_technician_lsu_email =
      userStore.user?.email || "";

    // If user changed the initial status or added remarks, update the log
    if (newLog.status && newLog.status !== "Pending") {
      info.value.logs[0].status = newLog.status;
    }
    if (newLog.remarks) {
      info.value.logs[0].remarks = newLog.remarks;
    } else {
      info.value.logs[0].remarks = "Ticket created by technician (Walk-in)";
    }
  }

  // Lock ticket to assigned personnel when creating
  if (
    info.value.technicians_assigned &&
    info.value.technicians_assigned.length > 0
  ) {
    // Lock to first assigned technician
    info.value.ticket_locked_by_email =
      info.value.technicians_assigned[0].email;
  } else {
    // No technicians assigned, no lock
    info.value.ticket_locked_by_email = "";
  }

  const formData = new FormData();
  formData.append("ticket_id", info.value.ticket_id || `TID${Date.now()}`);
  formData.append(
    "requestor_fullname",
    info.value.requestor_fullname?.trim() || "",
  );
  formData.append(
    "requestor_lsu_email",
    info.value.requestor_lsu_email?.trim() || "",
  );
  formData.append(
    "technicians_assigned",
    JSON.stringify(info.value.technicians_assigned || []),
  );
  formData.append(
    "issue_concern_request_details",
    info.value.issue_concern_request_details?.trim() || "",
  );
  formData.append(
    "issue_concern_request_category_type",
    info.value.issue_concern_request_category_type?.trim() || "",
  );
  formData.append(
    "issue_concern_request_item_type",
    info.value.issue_concern_request_item_type?.trim() || "",
  );
  formData.append(
    "issue_concern_request_center_office_room",
    info.value.issue_concern_request_center_office_room?.trim() || "",
  );
  formData.append("owner_type", info.value.owner_type || "LSU");
  formData.append("client_role", info.value.client_role || "");
  formData.append("buy_me_coffee", info.value.buy_me_coffee || "No");
  formData.append(
    "ticket_locked_by_email",
    info.value.ticket_locked_by_email || "",
  );
  formData.append("logs", JSON.stringify(info.value.logs || []));

  if (receiptFile.value) {
    formData.append("buy_me_coffee_gcash_receipt", receiptFile.value);
  }

  try {
    const res = await $fetch(
      endpoint.value + "/api/cits/request-ticket/create/",
      {
        method: "POST",
        body: formData,
      },
    );

    if (res.status === "created") {
      showToaster(
        "✅ Ticket created successfully! Confirmation email sent.",
        "success",
      );

      // Optimized: Add new ticket to local array instead of full refresh
      if (res.data) {
        requests.value.unshift(res.data); // Add to beginning of array
      } else {
        // Fallback to full refresh if no data returned
        await fetchRequests(true); // Silent refresh
      }
    } else if (res.status === "errors") {
      console.error("Form errors:", res.errors);
      showToaster(
        "❌ Failed to create ticket. Check console for errors.",
        "error",
      );
    }
  } catch (err) {
    console.error("Failed to create ticket:", err);
    showToaster("❌ Failed to create ticket. Please try again.", "error");
  } finally {
    modalLoading.value = false;
  }
};

const toaster = ref({
  show: false,
  message: "",
  type: "success", // we can extend later to warning, error, etc.
});

const showToaster = (message, type = "success", duration = 3000) => {
  toaster.value.message = message;
  toaster.value.type = type;
  toaster.value.show = true;

  setTimeout(() => {
    toaster.value.show = false;
  }, duration);
};

const saveChanges = async () => {
  // Validate that only assigned personnel can save locked tickets
  if (info.value.ticket_locked_by_email && !isAssignedTechnician.value) {
    showToaster(
      "⚠️ Only assigned personnel can modify locked tickets.",
      "warning",
    );
    return;
  }

  // Close modal immediately for instant feedback
  showModal.value = false;

  modalLoading.value = true;
  normalizeOffice();
  addStatusLog();

  // Validate and ensure ticket lock is correct before saving
  if (
    info.value.technicians_assigned &&
    info.value.technicians_assigned.length > 0
  ) {
    // Ensure ticket is locked to one of the assigned technicians
    const currentLock = info.value.ticket_locked_by_email;
    const isValidLock = info.value.technicians_assigned.some(
      (tech) => tech.email === currentLock,
    );

    if (!isValidLock) {
      // If current lock is invalid or empty, lock to first assigned technician
      info.value.ticket_locked_by_email =
        info.value.technicians_assigned[0].email;
    }
  } else {
    // If no technicians assigned, clear the lock
    info.value.ticket_locked_by_email = "";
  }

  const formData = new FormData();
  formData.append("ticket_id", info.value.ticket_id);
  formData.append(
    "requestor_fullname",
    info.value.requestor_fullname?.trim() || "",
  );
  formData.append(
    "requestor_lsu_email",
    info.value.requestor_lsu_email?.trim() || "",
  );
  formData.append(
    "technicians_assigned",
    JSON.stringify(info.value.technicians_assigned || []),
  );
  formData.append(
    "issue_concern_request_details",
    info.value.issue_concern_request_details?.trim() || "",
  );
  formData.append(
    "issue_concern_request_category_type",
    info.value.issue_concern_request_category_type?.trim() || "",
  );
  formData.append(
    "issue_concern_request_item_type",
    info.value.issue_concern_request_item_type?.trim() || "",
  );
  formData.append(
    "issue_concern_request_center_office_room",
    info.value.issue_concern_request_center_office_room?.trim() || "",
  );
  formData.append("owner_type", info.value.owner_type || "LSU");
  formData.append("client_role", info.value.client_role || "");
  formData.append("buy_me_coffee", info.value.buy_me_coffee || "No");
  formData.append(
    "evaluation_feedback_client_star_rating",
    info.value.evaluation_feedback_client_star_rating || "",
  );
  formData.append(
    "ticket_locked_by_email",
    info.value.ticket_locked_by_email || "",
  );
  formData.append("logs", JSON.stringify(info.value.logs || []));

  if (receiptFile.value) {
    formData.append("buy_me_coffee_gcash_receipt", receiptFile.value);
  }

  try {
    const res = await $fetch(
      endpoint.value + `/api/cits/request-ticket/${info.value.id}/edit/`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (res.status === "updated") {
      showToaster("✅ Changes saved successfully!", "success");

      // Optimized: Update local array instead of full refresh
      const index = requests.value.findIndex((r) => r.id === info.value.id);
      if (index !== -1 && res.data) {
        requests.value[index] = res.data; // Update the specific ticket
      } else {
        // Fallback to silent refresh if update fails
        await fetchRequests(true); // Silent refresh
      }
    } else {
      console.error("Update failed:", res);
      showToaster("❌ Failed to update ticket.", "error");
    }
  } catch (err) {
    console.error("Failed to update ticket:", err);
    showToaster("❌ Failed to update ticket. Please try again.", "error");
  } finally {
    modalLoading.value = false;
  }
};

// Transfer ticket to other personnel
const confirmTransferTicket = async () => {
  if (transferTechnicians.value.length === 0) {
    showToaster(
      "⚠️ Please select at least one technician to assign.",
      "warning",
    );
    return;
  }

  modalLoading.value = true;

  // Store old technicians for notification
  const oldTechnicians = [...(info.value.technicians_assigned || [])];

  // Check if ticket has "Completed" status
  const currentStatus = latestStatus(info.value);
  const isCompleted = currentStatus?.status === "Completed";

  // Find who completed the ticket (get the last "Completed" log entry)
  let completedByTechnician = null;
  if (isCompleted && info.value.logs) {
    const completedLog = [...info.value.logs]
      .reverse()
      .find(log => log.status === "Completed");

    if (completedLog) {
      completedByTechnician = {
        name: completedLog.assigned_technician_name || "",
        email: completedLog.assigned_technician_lsu_email || "",
        remarks: completedLog.remarks || "",
        timestamp: completedLog.timestamp || new Date().toISOString(),
      };
    }
  }

  // Update technicians_assigned with new selection
  info.value.technicians_assigned = [...transferTechnicians.value];

  // Update ticket_locked_by_email to first new technician
  if (transferTechnicians.value[0]?.email) {
    info.value.ticket_locked_by_email = transferTechnicians.value[0].email;
  }

  // Add transfer log entry
  if (!info.value.logs) info.value.logs = [];
  info.value.logs.push({
    status: "Transferred",
    remarks: `Ticket transferred from ${oldTechnicians.map((t) => t.name).join(", ")} to ${transferTechnicians.value.map((t) => t.name).join(", ")}`,
    timestamp: new Date().toISOString(),
    assigned_technician_name: transferTechnicians.value[0]?.name || "",
    assigned_technician_lsu_email: transferTechnicians.value[0]?.email || "",
  });

  // If ticket was completed, add "Completed" log for each new technician
  if (isCompleted && completedByTechnician) {
    transferTechnicians.value.forEach((tech) => {
      info.value.logs.push({
        status: "Completed",
        remarks: completedByTechnician.remarks || `Completed by ${completedByTechnician.name} (Auto-added after transfer)`,
        timestamp: new Date().toISOString(),
        assigned_technician_name: completedByTechnician.name,
        assigned_technician_lsu_email: completedByTechnician.email,
      });
    });
  }

  // Save changes
  const formData = new FormData();
  formData.append("ticket_id", info.value.ticket_id);
  formData.append(
    "requestor_fullname",
    info.value.requestor_fullname?.trim() || "",
  );
  formData.append(
    "requestor_lsu_email",
    info.value.requestor_lsu_email?.trim() || "",
  );
  formData.append(
    "technicians_assigned",
    JSON.stringify(info.value.technicians_assigned || []),
  );
  formData.append(
    "issue_concern_request_details",
    info.value.issue_concern_request_details?.trim() || "",
  );
  formData.append(
    "issue_concern_request_category_type",
    info.value.issue_concern_request_category_type?.trim() || "",
  );
  formData.append(
    "issue_concern_request_item_type",
    info.value.issue_concern_request_item_type?.trim() || "",
  );
  formData.append(
    "issue_concern_request_center_office_room",
    info.value.issue_concern_request_center_office_room?.trim() || "",
  );
  formData.append("owner_type", info.value.owner_type || "LSU");
  formData.append("client_role", info.value.client_role || "");
  formData.append("buy_me_coffee", info.value.buy_me_coffee || "No");
  formData.append(
    "evaluation_feedback_client_star_rating",
    info.value.evaluation_feedback_client_star_rating || "",
  );
  formData.append(
    "ticket_locked_by_email",
    info.value.ticket_locked_by_email || "",
  );
  formData.append("logs", JSON.stringify(info.value.logs || []));

  if (receiptFile.value) {
    formData.append("buy_me_coffee_gcash_receipt", receiptFile.value);
  }

  try {
    const res = await $fetch(
      endpoint.value + `/api/cits/request-ticket/${info.value.id}/edit/`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (res.status === "updated") {
      // Determine if this was an assignment or transfer
      const isAssignment = !oldTechnicians || oldTechnicians.length === 0;
      const successMessage = isAssignment
        ? "✅ Personnel assigned successfully! Notifications sent to client and technicians."
        : "✅ Ticket transferred successfully! Notifications sent to client and new technicians.";

      showToaster(successMessage, "success", 5000);

      // Close modal and clear selection
      showTransferModal.value = false;
      transferTechnicians.value = [];

      // Optimized: Update local array instead of full refresh
      const index = requests.value.findIndex((r) => r.id === info.value.id);
      if (index !== -1 && res.data) {
        requests.value[index] = res.data; // Update the specific ticket
      } else {
        // Fallback to silent refresh
        await fetchRequests(true); // Silent refresh
      }
    } else {
      console.error("Transfer failed:", res);
      showToaster("❌ Failed to assign/transfer ticket.", "error");
    }
  } catch (err) {
    console.error("Failed to transfer ticket:", err);
    showToaster("❌ Failed to assign/transfer ticket. Please try again.", "error");
  } finally {
    modalLoading.value = false;
  }
};

const ticketStatusClass = (status) => {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "In Progress":
      return "bg-blue-100 text-blue-800";
    case "For Review":
      return "bg-purple-100 text-purple-800";
    case "Lacking Content":
      return "bg-orange-100 text-orange-800";
    case "Completed":
      return "bg-green-100 text-green-800";
    case "Closed":
      return "bg-gray-200 text-gray-800";
    case "Cancelled":
    case "Unsuccessful":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-50 text-gray-700";
  }
};

const itemStatusClass = (status) => {
  switch (status) {
    case "New":
      return "bg-blue-100 text-blue-800";
    case "Used":
      return "bg-yellow-100 text-yellow-800";
    case "For Repair":
      return "bg-orange-100 text-orange-800";
    case "For Disposal":
      return "bg-red-100 text-red-800";
    case "Returned":
      return "bg-green-100 text-green-800";
    case "Issued":
      return "bg-purple-100 text-purple-800";
    case "Replaced":
      return "bg-teal-100 text-teal-800";
    case "Condemned":
      return "bg-gray-100 text-gray-700";
    case "Serviceable":
      return "bg-indigo-100 text-indigo-800";
    case "Unserviceable":
      return "bg-pink-100 text-pink-800";
    default:
      return "bg-gray-50 text-gray-700";
  }
};

// Auto-assignment functions removed - Manual checkbox selection only

// Auto-assignment removed - Manual checkbox selection only for assigned personnel
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
