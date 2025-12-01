<script setup>
import { onMounted, ref } from "vue";
import { useUserStore } from "@/stores/user";
const router = useRouter();
const userStore = useUserStore();
import _ from "lodash";

const endpoint = ref(userStore.mainDevServer);
const developerEmail = ref(userStore.user.developerEmail);



let toggleSideBarMenu = ref(true);
let toggleConfirmDelete = ref(false);
let confirmDeleteInfo = ref(false);
let idToBeDeleted = ref();

const toggleDeleteBtn = (id) => {
  toggleConfirmDelete.value = !toggleConfirmDelete.value;
  idToBeDeleted.value = id;
  console.log(id);
}

const APIUrl = ref(endpoint.value + "/api/library/reports/book/list/")
const APIDeleteURL = ref(endpoint.value + "/api/library/reports/book/delete/")


let books = ref(0);
// const {data, status, error, refresh } = await useLazyFetch(APIUrl.value)
setTimeout(async() => {
  books.value = await $fetch(APIUrl.value).catch((error) => error.data) || 0;
}, 2000)

onMounted(async() => {
  if (userStore.user.isAuthenticated && 
      (userStore.user.email === developerEmail.value ||
        userStore.user.email === 'monaliza.mugot@lsu.edu.ph' ||
        userStore.user.email === 'marilyn.bejec@lsu.edu.ph' ||
        userStore.user.email === 'applejane.ebarle@lsu.edu.ph' ||
        userStore.user.email === 'janekaren.gudmalin@lsu.edu.ph' ||
        userStore.user.email === 'macy.beniola@lsu.edu.ph' ||
        userStore.user.email === 'lynn.lumacad@lsu.edu.ph' ||
        userStore.user.email === 'zosette.salas@lsu.edu.ph'
      )
    ) {
    router.push("/library/dashboard/appointment/reports/books");
  } else {
    // router.push("/unauthorized");
  }
});

const goToEdit = (id) => {
  router.push("/library/dashboard/appointment/reports/books/edit/" + id);
};



const infoStatus = async () => {
  toggleConfirmDelete.value = !toggleConfirmDelete.value;
  confirmDeleteInfo.value = true
  setTimeout(() => {
    confirmDeleteInfo.value = false
  }, 1000)
  console.log('status', status)
  router.go()
  // refresh()
}

const deleteItem = async() => {
  await $fetch(
    APIDeleteURL.value + idToBeDeleted.value + "/",
    {
      method: "DELETE",
      headers: {
        Authorization: userStore.user.token,
        "Content-Type": "application/json",
      },
    }
  ).then(() => {
    infoStatus()
  });
}

const logOut = () => {
  router.push("/library/login");
  userStore.removeToken();
}

</script>
<template>
  <div class="">
    <div class="flex">
      <div
        class="pb-3 lg:w-3/12 bg-gray-100 z-10 w-full lg:block lg:static absolute"
        v-show="toggleSideBarMenu"
      >
      <div class="flex items-center justify-center  text-white bg-green-900 lg:py-[16px] py-[8px]">
          <div class="flex items-center w-full px-2">
            <i class="fa fa-user mx-2" aria-hidden="true"></i>
            <h1 class="text-sm">
              {{ userStore.user.email }}
            </h1>
          </div>
          <div @click="toggleSideBarMenu = !toggleSideBarMenu" class="w-10 px-1.5 lg:hidden flex">
            <i class="fa text-3xl text-white" :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars'" aria-hidden="true"></i>
          </div>
        </div>
        <div class="min-h-[570px]">
          <div class="w-fit mx-auto mt-5 mb-3">
            <img
              src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/LSULRC.jpg"
              class="lg:w-24 w-20 mx-auto rounded-full"
            />
          </div>
          <div class="text-center">
            <h2 class="font-bold text-green-800 text-lg">Learning Resource Center</h2>
          </div>
          <div class="mx-auto mt-10 mb-5 grid grid-cols-1">
            <a
              href="/library/dashboard/appointment"
              class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
            >
              <i class="fa fa-list mr-3" aria-hidden="true"></i>
              Appointment Lists
            </a>

            <a
              href="/library/dashboard/appointment/reports/books"
              class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
            >
              <i class="fa fa-book mr-3" aria-hidden="true"></i>
              Available Books
            </a>

            <!-- <a
              href="/library/dashboard/appointment/create"
              class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
            >
              <i class="fa fa-plus-circle mr-3"></i>
              Walk-Ins appointment
            </a> -->

            <a
              href="/library/dashboard/appointment/set-schedules"
              class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
            >
              <i class="fa fa-calendar mr-3.5" aria-hidden="true"></i> SET SCHEDULES
            </a>
            <a
              href="/"
              class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
            >
              <i class="fa fa-globe mr-3" aria-hidden="true"></i>
              LSU HOME PAGE
            </a>
          </div>
        </div>
      </div>
      <div class="w-full min-h-screen">
        <div class="bg-green-800">
          <div class="lg:flex mx-auto justify-between py-2 px-3.5">
            <div class="lg:flex items-center text-white lg:gap-5">
              <div @click="toggleSideBarMenu = !toggleSideBarMenu" class="w-10 px-1.5">
                <i
                  class="fa text-3xl text-white"
                  :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars'"
                  aria-hidden="true"
                ></i>
              </div>
            </div>
            <button @click="logOut" class="flex hover:font-boldn pt-1">
              <i class="fa fa-sign-out text-white text-xl"></i>
              <h1 class="text-xs text-white p-1.5">Log Out</h1>
            </button>
          </div>
        </div>
        <div>
        <div class="w-full p-5">
          <div>
            <a href="/library/dashboard/appointment/reports/books/create" class="block w-fit bg-green-600 text-white font-bold px-3 py-2 mb-5 rounded-lg shadow hover:bg-green-700 text-xs">
             +  Add Record
            </a>
            <!-- <button @click="displayData">
              displayData
            </button> -->
                <div
                  v-show="confirmDeleteInfo"
                  class="text-xs text-center w-full px-2 py-1 bg-red-600 text-white capitalized my-3"
                >
                  Deleting row...
                </div>
            <div class="">
              <div class="appointment-lists shadow mx-auto text-xs">
                <div class="">
                  <div class="header w-full bg-green-800 text-white flex items-center">
                    <ul class="lg:flex w-full justify-center text-center whitespace-nowrap uppercase">
                        <li class="border-r border-green-700 py-2 px-1 lg:w-10">No.</li>
                        <li class="border-r border-green-700 py-2 px-1 lg:w-24">Call Number</li>
                        <li class="border-r border-green-700 py-2 px-1 lg:w-40">Author</li>
                        <li class="border-r border-green-700 py-2 px-1 lg:w-44">Title</li>
                        <li class="border-r border-green-700 py-2 px-1 lg:w-28">Barcode</li>
                        <li class="border-r border-green-700 py-2 px-1 lg:w-24">Year</li>
                        <li class="border-r border-green-700 py-2 px-1 lg:w-24">Date Acquired</li>
                        <li class="border-r border-green-700 py-2 px-1 lg:w-24">Status</li>
                        <li class="border-r border-green-700 py-2 px-1 lg:w-24">Sublocation</li>
                        <li class="border-r border-green-700 py-2 px-1 lg:w-24">Circulation</li>
                        <li class="border-r border-green-700 py-2 px-1 lg:w-16">Copies</li>
                        <li class="py-2 px-1 lg:w-20">Action</li>
                    </ul>
                  </div>
                  <div class="w-full rows" v-if="books.length > 0">
                    <ul class="lg:flex w-full justify-center text-center h-auto border-b border-gray-100"
                        v-for="(b, i) in _.orderBy(books, 'id', 'asc').slice(17925, 17930)" 
                        :key="i" :class="i % 2 ? 'bg-gray-100':''">
                        <li class="p-2 lg:w-10 flex items-center justify-evenly border-r border-gray-200 h-20">
                          <!-- {{ i + 1 }}     -->
                          {{ b.id }}
                        </li>
                        <li class="p-2 lg:w-24 flex items-center justify-evenly border-r border-gray-200 h-20">
                            {{ b.call_number }}</li>
                        <li class="p-2 lg:w-40 flex items-center justify-evenly border-r border-gray-200 h-20">
                            {{ b.author }}</li>
                        <li class="p-2 lg:w-44 flex items-center justify-evenly border-r border-gray-200 h-20">
                            {{ b.title }}</li>
                        <li class="p-2 lg:w-28 flex items-center justify-evenly border-r border-gray-200 h-20">
                            {{ b.barcode }}</li>
                        <li class="p-2 lg:w-24 flex items-center justify-evenly border-r border-gray-200 h-20">
                            {{ b.year }}</li>
                        <li class="p-2 lg:w-24 flex items-center justify-evenly border-r border-gray-200 h-20">
                            {{ b.date_acquired }}</li>
                        <li class="p-2 lg:w-24 flex items-center justify-evenly border-r border-gray-200 h-20">
                            {{ b.status }}</li>
                        <li class="p-2 lg:w-24 flex items-center justify-evenly border-r border-gray-200 h-20">
                            {{ b.sublocation }}</li>
                        <li class="p-2 lg:w-24 flex items-center justify-evenly border-r border-gray-200 h-20">
                            {{ b.circulation }}</li>
                        <li class="p-2 lg:w-16 flex items-center justify-evenly border-r border-gray-200 h-20">
                            {{ b.number_of_copies }}</li>
                        <li class="flex items-center font-bold justify-evenly h-20 p-1 lg:w-20">
                            <div class="mx-auto lg:flex justify-center" @click="goToEdit(b.id)">
                                <button >
                                    <i class="fa fa-edit text-yellow-500 rounded-lg uppercase text-xl hover:text-3xl"
                                    aria-hidden="true"></i>
                                </button>
                            </div>
                            <div class="mx-auto lg:flex justify-center" @click="toggleDeleteBtn(b.id)">
                                <button >
                                    <i class="fa fa-trash text-red-500 rounded-lg uppercase text-xl hover:text-3xl"
                                    aria-hidden="true"></i>
                                </button>
                            </div>
                        </li>
                    </ul>
                    <div
                      class="px-5 rounded-lg bg-white shadow-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      v-show="toggleConfirmDelete">
                      <div class="my-6">Are you sure you want to Delete?</div>
                      <div class="flex gap-5 mx-auto w-fit my-5">
                        <button class="bg-green-900 text-white px-3 py-1 rounded-lg cursor-pointer" 
                        @click="deleteItem">Yes</button>
                        <button class="bg-red-900 text-white px-3 py-1 rounded-lg cursor-pointer" @click="toggleDeleteBtn">Cancel</button>
                      </div>
                    </div>
                  </div>
                  <div v-if="books.length === 0" class="itallic text-gray-400 text-center p-1">
                    No Results Found!
                  </div>
                  <div v-else class="itallic text-gray-400 text-center p-1" :class="books.length > 0 ? 'hidden' : ''">
                    Please Wait ...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
    <DashboardFooter/>
  </div>
</template>
<style scoped></style>