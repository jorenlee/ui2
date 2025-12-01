<script setup>
import { onMounted, ref } from "vue";
import { useUserStore } from "@/stores/user";
const router = useRouter();
const userStore = useUserStore();
import _ from "lodash";

const endpoint = ref(userStore.mainDevServer);

onMounted(() => {
  setTimeout(() => {
    if (userStore.user.isAuthenticated && userStore.user.email === userStore.user.email) {
      router.push("/library/dashboard/appointment");
    } else {
      router.push("/unauthorized");
    }
  }, 3000);
});

const bookingLibrary = await $fetch(endpoint.value + "/api/library/booking/list/").catch(
  (error) => error.data
);

const totalItems = ref(bookingLibrary.length);
const initialDisplay = ref(3);
const numberOfItems = ref(3);
const startNum = ref(0);
let numberOfPages = ref(Math.ceil(totalItems.value / numberOfItems.value));
let itemsLoaded = computed(() => {
  return bookingLibrary.slice(startNum.value, numberOfItems.value);
});

const prev = () => {
  if (startNum.value > 0) {
    startNum.value -= initialDisplay.value;
    numberOfItems.value -= initialDisplay.value;
    // console.log("prev");
    itemsLoaded;
  }
};

const next = () => {
  if (numberOfItems.value < totalItems.value) {
    startNum.value += initialDisplay.value;
    numberOfItems.value += initialDisplay.value;
    // console.log("next");
    itemsLoaded;
  }
};

const pagination = (selectedPage) => {
  startNum.value = 0;
  numberOfItems.value = initialDisplay.value;
  itemsLoaded;

  if (selectedPage > 1) {
    numberOfItems.value *= selectedPage;
    startNum.value = numberOfItems.value - initialDisplay.value;
  }
};

let libraryInfo = ref(true);
let toggleSideBarMenu = ref(true);
let toggleConfirmDelete = ref(false);
let idToBeDeleted = ref();

let toggleMenu = (a) => {
  libraryInfo.value = a;
  appointmentDetails.value = false;
};



const toggleDeleteBtn = (id) => {
  toggleConfirmDelete.value = !toggleConfirmDelete.value;
  idToBeDeleted.value = id;

  // console.log(id);
};

const goToCreate = () => {
  router.push("/library/dashboard/create");
};

const deleteAppointment = async () => {
  await $fetch(
    endpoint.value + "/api/library/booking/" + idToBeDeleted.value + "/delete/",
    {
      // await $fetch("/api/appointments/" + idToBeDeleted.value + "/delete/", {
      method: "DELETE",
      headers: {
        Authorization: userStore.user.token,
        "Content-Type": "application/json",
      },
    }
  )
    .then(async (response) => {
      // console.log("response", response);
      router.go();
      toggleConfirmDelete.value = !toggleConfirmDelete.value;
    })
    .catch((error) => {
      console.log(error);
    });
};

const logOut = () => {
  router.push("/library/login");
  userStore.removeToken();
}

</script>
<template>
  <div class="">
    <div class="flex">
      <div
        class="pt-7 pb-24 w-3/12 px-5 bg-gray-100 lg:block hidden"
        v-show="toggleSideBarMenu"
      >
        <LibraryMenuBar />
      </div>
      <div class="w-full">
        <div class="bg-green-700">
          <div class="lg:flex mx-auto justify-between py-2 px-3.5">
            <div class="lg:flex items-center text-white gap-5">
              <div @click="toggleSideBarMenu = !toggleSideBarMenu" class="w-10 px-1.5">
                <i
                  class="fa text-3xl text-white"
                  :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars'"
                  aria-hidden="true"
                ></i>
              </div>
              <div class="flex -mt-1">
                <i class="fa fa-user mr-2 mt-1" aria-hidden="true"></i>
                <h1 class="text-sm">
                  {{ userStore.user.email }}
                </h1>
              </div>
            </div>
            <button @click="logOut()" class="flex hover:font-bold pt-1">
              <i class="fa fa-sign-out text-white text-xl"></i>
              <h1 class="text-xs text-white p-1.5">Log Out</h1>
            </button>
          </div>
        </div>

        <div class="relative">
          <div class="lg:w-full p-5">
            <div v-show="libraryInfo">
              <div v-if="itemsLoaded.length > 0" class="mb-10 flex flex-wrap gap-5">
                <div
                  class="shadow border border-gray-200 rounded-md h-auto"
                  v-for="(library, index) in itemsLoaded"
                  :key="index"
                >
                  <div class="flex w-full">
                    <div class="border-r-4 border-green-900 text-white">
                      <span
                        class="text-white bg-green-950 rounded-full h-6 w-6 mt-2 ml-2 text-xs flex items-center justify-center font-bold"
                        >{{ library.id }}</span
                      >

                      <div class="py-2 px-10 mb-7">
                        <span class="text-xs text-gray-900">Book:</span>
                        <h1 class="text-green-900 font-bold mb-3">
                          {{ library.book_title }}
                        </h1>
                        <span class="text-xs text-gray-900">Description:</span>
                        <p class="text-green-900 text-xs w-44 italic line-clamp-3">
                          {{ library.book_description }}
                        </p>
                      </div>
                    </div>

                    <div class="w-[300px] relative px-2 py-3">
                      <!-- <p class="absolute top-2 right-10 text-xs text-white w-fit px-10 py-1 rounded-lg bg-red-500">Pending</p> -->

                      <span class="absolute top-2 right-5">
                        <!-- <i class="fa fa-ellipsis" aria-hidden="true"></i> -->

                        <!-- <div class="mx-auto lg:flex justify-center">
                          <button @click="goToEdit(library.id)">
                            <i
                              class="fa fa-edit text-yellow-500 rounded-lg uppercase text-xl hover:text-3xl"
                              aria-hidden="true"
                            ></i>
                          </button>
                        </div> -->
                        <div class="mx-auto lg:flex justify-center">
                          <button @click="toggleDeleteBtn(library.id)" class="flex items-center text-xs text-red-900 gap-2">
                            <i
                              class="fa fa-close text-red-500 rounded-lg uppercase text-xl hover:text-3xl"
                              aria-hidden="true"
                            ></i> Cancel
                          </button>
                        </div>
                      </span>

                      <p class="text-xs text-green-900 mb-2">
                        <i class="mr-2 fa fa-user" aria-hidden="true"></i>

                        {{ library.firstname }}
                        {{ library.lastname }}
                      </p>

                      <p class="text-xs text-green-900 mb-2">
                        <i class="mr-2 fa fa-id-card" aria-hidden="true"></i>
                        {{ library.student_id }} <span class="font-bold mx-2">|</span>
                        {{ library.college }} 
                        {{ library.courseProgram }}
                         {{ library.courseYear }}
                          {{ library.courseMajor }}
                      </p>

                      <p class="text-xs text-green-900 mb-2">
                        <i class="mr-2 fa fa-envelope" aria-hidden="true"></i>

                        {{ library.email }}
                      </p>

                      <p
                        class="absolute bottom-2.5 left-2 text-xs text-yellow-500 w-fit px-3 py-0.5 font-bold rounded-lg border uppercase border-yellow-500"
                      >
                        {{ library.borrower_category }}
                      </p>

                      <div class="absolute bottom-3 right-5 h-fit">
                        <p class="text-xs text-green-900">
                          <i class="fa fa-calendar mr-1" aria-hidden="true"></i>
                            {{ library.booking_date }}
                        </p>
                        <p class="text-xs text-green-900">
                          <i class="fa fa-clock mr-1" aria-hidden="true"></i>
                          {{ library.booking_time }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="itallic text-gray-400 text-center p-1">
                No Results Found!
              </div>
            </div>
          </div>

          <div
            class="z-10 px-5 rounded-lg bg-white shadow-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            v-show="toggleConfirmDelete"
          >
            <div class="my-6">Are you sure you want to Delete?</div>
            <div class="flex gap-5 mx-auto w-fit my-5">
              <span
                class="bg-green-900 text-white px-3 py-1 rounded-lg"
                @click="deleteAppointment"
                >Yes</span
              >
              <span
                class="bg-red-900 text-white px-3 py-1 rounded-lg"
                @click="toggleDeleteBtn"
                >Cancel</span
              >
            </div>
          </div>
        </div>

        <div
          v-if="totalItems > initialDisplay"
          class="flex items-center w-fit mx-auto font-bold text-sm rounded-lg"
        >
          <div
            @click="prev"
            class="shadow px-2 py-1.5 rounded-tl-lg rounded-bl-lg bg-white hover:bg-green-900 hover:text-white text-green-950"
          >
            <i class="fa fa-angle-left" aria-hidden="true"></i>
            Prev
          </div>

          <!-- <div
            v-if="numberOfPages > 3"
            class="cursor-pointer px-2 py-1 border mx-1 rounded-lg"
          >
            <i class="fa fa-angle-double-left" aria-hidden="true"></i>
          </div> -->
          <ul
            class="border-t border-gray-50 flex w-[150px] justify-evenly overflow-x-scroll px-2"
          >
            <li
              v-for="(selectedPage, i) in numberOfPages"
              class="bg-white hover:bg-green-900 hover:text-white text-green-950 cursor-pointer px-2 py-0.5 border mx-1 my-1 rounded-lg"
              :key="i"
              @click="pagination(selectedPage)"
            >
              {{ selectedPage }}
            </li>
          </ul>
          <!-- <div
            v-if="numberOfPages > 3"
            class="cursor-pointer px-2 py-1 border mx-1 rounded-lg"
          >
            <i class="fa fa-angle-double-right" aria-hidden="true"></i>
          </div> -->

          <div
            @click="next"
            class="bg-white hover:bg-green-900 hover:text-white text-green-950 shadow px-2 py-1.5 rounded-tr-lg rounded-br-lg"
          >
            Next

            <i class="fa fa-angle-right" aria-hidden="true"></i>
          </div>
        </div>
      </div>
    </div>
    <DashboardFooter/>
  </div>
</template>
<style scoped>
/* width */
::-webkit-scrollbar {
  width: 2px;
  height: 2px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #ececec;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #135000;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #00c566;
}
</style>
