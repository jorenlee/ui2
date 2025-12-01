<script setup>
import { onMounted, ref } from "vue";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
import _ from "lodash";
const endpoint = ref(userStore.mainDevServer);
const allData = ref([]);

const listItems = ref(0);
const pinCode = ref("13579");
const inputPassCode = ref("");
let tableDisplay = ref(true);
const selectedItem = ref(null);
const toggleListsName = ref(false);

onMounted(async () => {
  await fetchListItems();
});

const fetchListItems = async () => {
  try {
    allData.value =
      (await $fetch(endpoint.value + "/api/campus-pass/list").catch(
        (error) => error.data
      )) || []; // Ensure it's an array or empty array
    // console.log(allData.value)
  } catch (error) {
    console.error("Error fetching list items:", error);
    // Handle error appropriately
  } finally {
    isLoading.value = false; // Set loading to false when fetch is complete
  }
};

const printBtn = () => {
  window.print();
};

const displayList = ref(false);

const accessPinBtn = () => {
  if (pinCode.value === inputPassCode.value) {
    displayList.value = true;
  }
};

let currentIdSelected = ref(null);

const btnToggleListsName = async (id) => {
  selectedItem.value = await $fetch(
    endpoint.value + "/api/campus-pass/" + id + "/"
  ).catch((error) => error.data);
  // console.log(id);
  // console.log(selectedItem.value);
  toggleListsName.value = !toggleListsName.value;
  currentIdSelected.value = id;
  searchResults.value = selectedItem.value.name_list;
};

const requestChangeStatus = async (id) => {
  console.log(id);
  editStatus(id);
};

const editStatus = async (id) => {
  await $fetch(endpoint.value + "/api/campus-pass/" + id + "/edit/", {
    method: "PUT",
    body: selectedItem.value,
  }).then(async (response) => {
    console.log("response", response);
  });
};

let searchQuery = ref("");
let searchQueryInternal = ref("");

let filteredItems;
const filteredListItems = computed(() => {
  // filteredItems = Array.isArray(listItems.value) ? [...listItems.value] : [];

  listItems.value = allData.value.filter(
    (item) => item.approval_status === "approved"
  );
  // console.log('all approved', listItems.value)

  filteredItems = listItems.value;

  if (searchQuery.value !== "") {
    const lowerSearchQuery = searchQuery.value.toLowerCase();
    currentPage.value = 1;
    filteredItems = filteredItems.filter((item) => {
      for (const key in item) {
        if (
          typeof item[key] === "string" &&
          item[key].toLowerCase().includes(lowerSearchQuery)
        ) {
          return true;
        }
      }
      return false;
    });
    // filteredItems = filteredItems.filter(
    //   (item) =>
    //     item.incharge_lastname === searchQuery.value
    // );
  } else {
    filteredItems = Array.isArray(listItems.value) ? [...listItems.value] : [];
  }

  return _.orderBy(filteredItems, "incharge_lastname", "asc");
});

let searchResults = ref(null);

const searchInternalBtn = async () => {
  if (searchQueryInternal.value !== "") {
    const lowerSearchQueryInternal = searchQueryInternal.value.toLowerCase();

    searchResults.value = selectedItem.value.name_list.filter((item) => {
      for (const key in item) {
        return (
          typeof item[key] === "string" &&
          item[key].toLowerCase().includes(lowerSearchQueryInternal)
        );
        // return true;
      }
      // return false;
    });
  } else {
    searchResults.value = selectedItem.value.name_list;
  }
};

const displayListsName = () => {
  toggleListsName.value = !toggleListsName.value;
  searchQueryInternal.value = "";
};

const isLoading = ref(true); // Add loading state
const currentPage = ref(1);
const itemsPerPage = 5;

const maxVisiblePages = 4;

const totalPages = computed(() => {
  return Math.ceil(filteredListItems.value.length / itemsPerPage);
});

const paginatedListItems = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredListItems.value.slice(startIndex, endIndex);
});

const visiblePages = computed(() => {
  const pages = [];
  let startPage = Math.max(
    1,
    currentPage.value - Math.floor(maxVisiblePages / 2)
  );
  let endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
});
</script>
<template>
  <div>
    <div class="lg:flex min-h-screen">
      <div class="w-full">
        <div class="bg-green-800 fixed w-full z-10">
          <div class="flex mx-auto justify-between py-2 px-3.5">
            <a href="/" class="w-fit mx-auto">
              <img
                src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/lsu-w-h.png"
                class="lg:h-9 h-8"
              />
            </a>
          </div>
        </div>

        <div class="">
          <div
            class="w-fit mx-auto flex items-center py-20"
            v-if="!displayList"
          >
            <input
              v-model="inputPassCode"
              placeholder="Pin Code"
              class="text-center my-3 rounded-bl-md rounded-tl-md px-2 text-lg border shadow-lg border-green-700 w-[100px]"
              type="password"
              maxlength="5"
            />

            <div
              @click="accessPinBtn"
              class="bg-green-800 font-bold text-white text-sm h-fit cursor-pointer px-3 py-[4px] rounded-br-md rounded-tr-md hover:bg-white hover:text-green-800 border border-green-800"
            >
              Go
            </div>
          </div>
          <!-- v-if="displayList" -->
          <div v-if="displayList" class="pt-14 pb-10">
            <div
              class="w-fit mx-auto my-4 shadow-lg rounded-lg"
              v-if="!toggleListsName"
            >
              <input
                v-model="searchQuery"
                placeholder="Search ..."
                class="pt-[3px] pb-[2px] px-2 border rounded-tl-md rounded-bl-md"
              />
              <label
                class="bg-green-700 text-white py-[5px] px-2 border-transparent rounded-tr-md rounded-br-md"
              >
                <i class="fa fa-search" aria-hidden="true"></i>
              </label>
            </div>

            <div class="w-full lg:p-5 px-2 py-2">
              <div v-show="tableDisplay">
                <div
                  v-if="!toggleListsName"
                  class="cursor-pointer w-full flex shadow bg-gray-100 text-green-900 font-bold px-2 text-center mb-3 py-2 text-xs uppercase"
                  @click="printBtn"
                >
                  <div class="w-fit mx-auto flex items-center">
                    <span
                      class="w-fit mx-auto block rounded-md text-green-800 px-4 font-bold"
                      ><i class="fa fa-print"></i>
                    </span>

                    All Request Lists
                  </div>
                </div>

                <div class="relative">
                  <div
                    class="appointment-lists mx-auto text-xs"
                    :class="toggleListsName ? 'hidden' : ''"
                  >
                    <div v-if="isLoading" class="text-center">
                      <div class="">
                        <div class="flex animate-pulse space-x-4">
                          <div class="flex-1">
                            <div class="h-10 bg-gray-300"></div>
                            <div class="h-0.5 bg-gray-100"></div>
                            <div class="h-10 bg-gray-200"></div>
                            <div class="h-0.5 bg-gray-100"></div>
                            <div class="h-10 bg-gray-300"></div>
                            <div class="h-0.5 bg-gray-100"></div>
                            <div class="h-10 bg-gray-200"></div>
                            <div class="h-0.5 bg-gray-100"></div>
                            <div class="h-10 bg-gray-300"></div>
                            <div class="h-0.5 bg-gray-100"></div>
                            <div class="h-10 bg-gray-100"></div>
                            <div class="h-0.5 bg-gray-100"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-else>
                      <div class="gap-4" v-if="paginatedListItems.length > 0">
                        <div
                          class="justify-evenly text-center items-center h-auto border border-gray-200 shadow mb-3"
                          v-for="(b, i) in paginatedListItems"
                          :key="i"
                        >
                          <div class="w-full">
                            <div class="lg:flex items-center w-full">
                              <div
                                class="lg:w-4/12 w-full block text-left lg:px-2 px-0.5 lg:py-0 py-2"
                              >
                                <div class="w-full px-2 truncate">
                                  <span class="">
                                    <i class="fa fa-user mr-2"></i>
                                    <!-- {{ b.id }}  -->
                                    {{ b.incharge_lastname }},
                                  </span>
                                  <span class="">
                                    {{ b.incharge_firstname }}
                                  </span>
                                  <span
                                    :class="
                                      b.incharge_middlename === '-'
                                        ? 'hidden'
                                        : ''
                                    "
                                    class="mx-1"
                                  >
                                    {{ b.incharge_middlename }}
                                  </span>
                                </div>
                                <div class="w-full px-2">
                                  <i class="fa fa-envelope mr-2"></i>
                                  {{ b.incharge_contact_email }}
                                </div>

                                <div class="px-2">
                                  <i class="fa fa-phone lg:mr-2 mr-1.5"></i>
                                  {{ b.incharge_contact_number }}
                                </div>
                              </div>

                              <div>
                                <div
                                  class="lg:w-[100px] w-full flex items-center justify-center uppercase"
                                >
                                  <ul class="gap-x-0.5 w-full flex">
                                    <li
                                      v-for="(j, i) in b.type_of_access"
                                      :key="i"
                                      class="px-2 lg:py-0.5 py-2 lg:border-transparent border text-[10px] tracking-tighter w-full whitespace-nowrap lg:text-left text-center"
                                    >
                                      {{ j }}
                                    </li>
                                  </ul>
                                </div>
                                <div
                                  class="lg:w-[270px] w-full font-bold py-1 px-2 flex items-center"
                                >
                                  <i class="fa fa-calendar mr-2"></i>
                                  {{ b.schedule }}
                                </div>
                              </div>

                              <div class="lg:w-4/12 w-full flex items-center">
                                <div class="w-full">
                                  <div
                                    class="flex items-center lg:w-11/12 lg:px-0 px-2 mx-auto mb-1"
                                  >
                                    <label
                                      for="remarks"
                                      class="font-bold text-gray-800 lg:mr-2.5 mr-1 text-left w-fit ml-0 block"
                                      >Remarks:</label
                                    >
                                    <div class="flex w-full">
                                      <p
                                        class="border-b py-0.5 lg:px-1 text-left truncate lg:w-[200px] w-[240px]"
                                      >
                                        {{ b.remarks }}
                                      </p>
                                    </div>
                                  </div>

                                  <div
                                    class="flex items-center lg:w-11/12 lg:px-0 px-2 mx-auto"
                                    v-if="b.purpose"
                                  >
                                    <label
                                      for="purpose"
                                      class="font-bold text-gray-800 lg:mr-3 mr-1.5 text-left w-fit ml-0 block"
                                      >Purpose:</label
                                    >
                                    <div class="flex w-full">
                                      <p
                                        class="border-b py-0.5 lg:px-1 text-left truncate lg:w-[200px] w-[240px]"
                                      >
                                        {{ b.purpose }}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div
                                class="lg:w-3/12 lg:min-h-[60px] flex items-center lg:mt-0 mt-2"
                                :class="
                                  b.attendees === 'Group'
                                    ? 'cursor-pointer hover:bg-gray-300 hover:text-black bg-gray-200'
                                    : 'bg-gray-50 lg:h-16 flex items-center'
                                "
                              >
                                <div class="gap-x-5 w-fit ml-5 pt-1 flex">
                                  <a
                                    :href="b.approved_activities_link"
                                    target="_blank"
                                    class="font-bold w-full block text-green-800"
                                    :class="
                                      b.approved_activities_link === '-'
                                        ? 'hidden'
                                        : ''
                                    "
                                  >
                                    <i class="fa fa-file-pdf text-lg"></i>
                                  </a>
                                  <a
                                    :href="b.approved_gso_docs_link"
                                    target="_blank"
                                    class="font-bold w-full block text-green-800"
                                    :class="
                                      b.approved_gso_docs_link === '-'
                                        ? 'hidden'
                                        : ''
                                    "
                                  >
                                    <i class="fa fa-soccer-ball text-lg"></i>
                                  </a>
                                </div>

                                <div class="w-full px-10 lg:py-0 py-2">
                                  <div
                                    class="font-bold uppercase lg:w-full w-fit mx-auto text-center"
                                    @click="btnToggleListsName(b.id)"
                                  >
                                    {{ b.attendees }}

                                    <i
                                      class="fa fa-caret-down text-lg ml-2 -mt-[1px] h-[0px]"
                                      :class="
                                        b.attendees === 'Group'
                                          ? 'text-green-800'
                                          : 'hidden'
                                      "
                                    ></i>
                                  </div>

                                  <div
                                    class="text-[10px] font-light whitespace-nowrap text-center"
                                  >
                                    TID:
                                    <span class=""> {{ b.tracking_id }}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      class="flex justify-center my-4"
                      v-if="filteredListItems.length > 0"
                    >
                      <button
                        :disabled="currentPage === 1"
                        @click="currentPage--"
                        class="px-4 py-2 mx-1 bg-gray-200 rounded hover:bg-gray-500 hover:text-white"
                      >
                        <i
                          class="fa fa-angle-double-left"
                          aria-hidden="true"
                        ></i>
                      </button>

                      <button
                        v-for="page in visiblePages"
                        :key="page"
                        @click="currentPage = page"
                        class="hover:bg-green-500 hover:text-white"
                        :class="{
                          'px-4 py-2 mx-1 rounded': true,
                          'bg-green-800 text-white': currentPage === page,
                          'bg-gray-200': currentPage !== page,
                        }"
                      >
                        {{ page }}
                      </button>

                      <button
                        :disabled="currentPage === totalPages"
                        @click="currentPage++"
                        class="px-4 py-2 mx-1 bg-gray-200 rounded hover:bg-gray-500 hover:text-white"
                      >
                        <i
                          class="fa fa-angle-double-right"
                          aria-hidden="true"
                        ></i>
                      </button>
                    </div>

                    <div v-else-if="!isLoading" class="text-center my-5">
                      No items found!
                    </div>
                  </div>

                  <div
                    v-if="toggleListsName"
                    class="w-full z-10 bg-white h-full"
                  >
                    <div class="w-fit mx-auto shadow-lg rounded-lg mb-6">
                      <input
                        v-model="searchQueryInternal"
                        placeholder="Search ..."
                        @input="searchInternalBtn"
                        class="pt-[3px] pb-[2px] px-2 border rounded-tl-md rounded-bl-md"
                      />
                      <label
                        class="bg-green-700 text-white py-[5px] px-2 border-transparent rounded-tr-md rounded-br-md"
                      >
                        <i class="fa fa-search" aria-hidden="true"></i>
                      </label>
                    </div>

                    <div class="border-4 border-gray-100 shadow-lg">
                      <div class="flex items-center">
                        <div class="text-center border-b py-2 font-bold w-full">
                          List of Names
                        </div>

                        <div
                          @click="displayListsName"
                          class="bg-gray-600 hover:bg-white hover:text-gray-600 border-b border-l text-white px-2 py-[8px]"
                        >
                          <i class="fa fa-caret-left" aria-hidden="true"></i>
                        </div>
                      </div>
                      <div class="lg:gap-x-3 lg:text-sm text-xs">
                        <div
                          class="lg:flex items-center hidden text-left lg:px-4 px-2 py-1 font-bold bg-gray-700 mb-0.5 border-b-2 border-gray-600 text-white"
                        >
                          <div class="w-full">Full Name</div>

                          <div class="w-full">Email</div>

                          <div class="w-full">Tracking Id</div>

                          <div class="w-full">Type of Access</div>
                          <div class="w-full">Schedule</div>

                          <!-- <div class="w-full">Details</div> -->

                          <div class="w-full">Check-In</div>
                        </div>

                        <div
                          :class="
                            searchQueryInternal.value !== '' ? 'hidden' : ''
                          "
                        >
                          <div
                            class="lg:flex items-center text-left lg:px-4 px-2 pt-2 mb-0.5 border-b-2 border-gray-600 lg:border-t-0 border-t-2"
                            :class="
                              selectedItem.checkin === 'login'
                                ? 'bg-green-800 text-white'
                                : 'text-black bg-gray-100'
                            "
                          >
                            <div class="w-full">
                              {{ selectedItem.incharge_firstname }}
                              {{ selectedItem.incharge_lastname }}
                            </div>

                            <div class="w-full">
                              {{ selectedItem.incharge_contact_email }}
                            </div>

                            <div class="w-full">
                              {{ selectedItem.tracking_id }}
                            </div>

                            <div class="w-full">
                              <div
                                v-for="(j, i) in selectedItem.type_of_access"
                                :key="i"
                              >
                                {{ j }}
                              </div>
                            </div>

                            <div class="w-full">
                              {{ selectedItem.schedule }}
                            </div>

                            <!-- <div class="w-full">
                          {{ selectedItem.remarks }}
                        </div> -->

                            <div
                              class="w-full lg:text-center my-2 border-2 border-green-800 shadow-2xl flex"
                            >
                              <label
                                class="flex items-center text-center h-7 cursor-pointer text-xs bg-green-900 text-white"
                                :class="
                                  selectedItem.checkin === 'login'
                                    ? 'hidden'
                                    : 'w-full'
                                "
                              >
                                <input
                                  type="radio"
                                  value="login"
                                  v-model="selectedItem.checkin"
                                  @change="requestChangeStatus(selectedItem.id)"
                                  class="absolute opacity-0 cursor-pointer h-0 w-0"
                                />

                                <span
                                  class="w-fit mx-auto whitespace-nowrap px-3"
                                >
                                  Log-In</span
                                >
                              </label>

                              <label
                                class="flex items-center text-center h-7 cursor-pointer text-xs bg-gray-300 text-black"
                                :class="
                                  selectedItem.checkin === 'logout'
                                    ? 'hidden'
                                    : 'w-full'
                                "
                              >
                                <input
                                  type="radio"
                                  value="logout"
                                  v-model="selectedItem.checkin"
                                  @change="requestChangeStatus(selectedItem.id)"
                                  class="absolute opacity-0 cursor-pointer h-0 w-0"
                                />

                                <span
                                  class="w-fit mx-auto whitespace-nowrap px-3"
                                >
                                  Log-Out</span
                                >
                              </label>
                            </div>
                          </div>
                        </div>

                        <div
                          v-for="(j, i) in searchResults"
                          :key="i"
                          class="lg:flex items-center text-left lg:px-4 px-2 pt-2 border-b-2 border-gray-300"
                          :class="
                            j.checkin === 'login'
                              ? 'bg-green-800 text-white'
                              : 'text-black bg-gray-100'
                          "
                        >
                          <div class="w-full">
                            {{ j.firstname }} {{ j.lastname }}
                          </div>
                          <div class="w-full">
                            {{ j.email }}
                          </div>
                          <div class="w-full">
                            {{ selectedItem.tracking_id }}
                          </div>
                          <div class="w-full">
                            <div
                              v-for="(j, i) in selectedItem.type_of_access"
                              :key="i"
                            >
                              {{ j }}
                            </div>
                          </div>

                          <div class="w-full">
                            {{ selectedItem.schedule }}
                          </div>

                          <!-- <div class="w-full">
                          {{ selectedItem.remarks }}
                        </div> -->

                          <div
                            class="flex items-center w-full lg:text-center my-2 border-2 border-green-800 shadow-2xl"
                          >
                            <label
                              class="flex items-center text-center w-full h-7 cursor-pointer text-xs bg-green-900 text-white hover:bg-white hover:text-green-900"
                              :class="
                                j.checkin === 'login' ? 'hidden' : 'w-full'
                              "
                            >
                              <input
                                type="radio"
                                value="login"
                                v-model="j.checkin"
                                class="hidden cursor-pointer h-0 w-0"
                                @change="requestChangeStatus(selectedItem.id)"
                              />

                              <span class="w-fit mx-auto"> Log-In</span>
                            </label>

                            <label
                              class="flex items-center text-center w-full h-7 cursor-pointer text-xs bg-gray-300 text-black"
                              :class="
                                j.checkin === 'logout' ? 'hidden' : 'w-full'
                              "
                            >
                              <input
                                type="radio"
                                value="logout"
                                v-model="j.checkin"
                                class="hidden cursor-pointer h-0 w-0"
                                @change="requestChangeStatus(selectedItem.id)"
                              />
                              <span class="w-fit mx-auto"> Log-Out</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="fixed bottom-0 w-full">
      <DashboardFooter />
    </div>
  </div>
</template>
<style scoped></style>
