<script setup>
import { onMounted, ref } from "vue";
import { useUserStore } from "@/stores/user";
import _ from "lodash";
const router = useRouter();
const userStore = useUserStore();
const route = useRoute();
const endpoint = ref(userStore.mainDevServer);
const developerEmail = ref(userStore.user.developerEmail);
const library = await $fetch(endpoint.value + "/api/library/booking/" + route.params.id + "/").catch((error) => error.data)

const info = ref({
  borrower_category: library.borrower_category,
  id_number: library.id_number,
  firstname: library.firstname,
  lastname: library.lastname,
  email: library.email,
  books: library.books,
  booking_date: library.booking_date,
  booking_time: library.booking_time,
  status: library.status,
  created_by_email: library.created_by_email,
  updated_at: library.updated_at,
  created_at: library.created_at,
})

onMounted(() => {
  if (
    userStore.user.isAuthenticated &&
    (userStore.user.email === developerEmail.value ||
      userStore.user.email === "monaliza.mugot@lsu.edu.ph" ||
      userStore.user.email === "marilyn.bejec@lsu.edu.ph" ||
      userStore.user.email === "applejane.ebarle@lsu.edu.ph" ||
      userStore.user.email === "janekaren.gudmalin@lsu.edu.ph" ||
      userStore.user.email === "macy.beniola@lsu.edu.ph" ||
      userStore.user.email === "lynn.lumacad@lsu.edu.ph" ||
      userStore.user.email === 'zosette.salas@lsu.edu.ph')
  ) {
    router.push("/library/dashboard/appointment/edit/" + route.params.id);
    // console.log(library)
    // console.log('info.value', info.value)
  } else {
    router.push("/unauthorized");
  }
})

let toggleSideBarMenu = ref(true);

const editStatus = async () => {
  await $fetch(endpoint.value + "/api/library/booking/" + route.params.id + "/edit/", {
    method: "PUT",
    body: info.value,
  }).then((response) => {
    // console.log("response", response);
  })
}

const submitToGmail = async () => {
  await $fetch(endpoint.value + "/api/library/submit-status-to-gmail/" + route.params.id + "/", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: info.value,
  }).then((response) => {
    // console.log(response)
  })
}

const confirmModal = ref(false);
const btnShowModal = () => confirmModal.value = true;
const loadingState = ref(false);

const btnConfirm = () => {
  editStatus();
  confirmModal.value = false;
  loadingState.value = true;
  setTimeout(() => {
    submitToGmail();
    loadingState.value = false;
  }, 5000);
}

//refreshed data
const btnCloseModal = async () => {
  confirmModal.value = false;
  info.value.status = library.status
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
      <div class="w-full">
        <div class="bg-green-800">
          <div class="lg:flex mx-auto justify-between py-2 px-3.5">
            <div class="lg:flex lg:items-center text-white gap-5">
              <div @click="toggleSideBarMenu = !toggleSideBarMenu" class="w-10 px-1.5">
                <i class="fa text-3xl text-white" :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars'"
                  aria-hidden="true"></i>
              </div>
            </div>
            <button @click="logOut" class="flex hover:font-bold pt-1">
              <i class="fa fa-sign-out text-white text-xl"></i>
              <h1 class="text-xs text-white p-1.5">Log Out</h1>
            </button>
          </div>
        </div>
        <div class="text-xs mb-5">
          <div class="p-5">
            <div class="flex p-2 mb-7 text-center bg-green-900 text-white uppercase text-xs tracking-widest">
              <div>
                <a href="https://lsu.edu.ph/library/dashboard/appointment"
                  class="tracking-tight absolute flex bg-white hover:bg-green-900 text-green-800 hover:text-white px-3 py-1 -mt-1 rounded-lg font-bold">
                  <i class="fa fa-caret-left mt-0.5 mr-1"></i>
                  Back
              </a>
              </div>
              <div class="w-full">Appointment Details</div>
            </div>
            <div class="lg:w-8/12 w-11/12 mx-auto">
              <div class="p-3">
                <div class="lg:flex gap-2 mb-3">
                  <div class="w-full">
                    <label class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2">
                      Borrower Category
                    </label>
                    <input class="shadow-md p-2 rounded-sm w-full border" v-model="info.borrower_category"
                      placeholder="Borrower Category" disabled />
                  </div>
                  <div class="w-full">
                    <label class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2">
                      ID Number
                    </label>
                    <input class="shadow-md p-2 rounded-sm w-full border" v-model="info.id_number" placeholder="ID Number"
                      disabled />
                  </div>
                </div>
                <div class="lg:flex gap-2 mb-3">
                  <div class="w-full">
                    <label class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2">
                      Firstname
                    </label>
                    <input class="shadow-md p-2 rounded-sm w-full border capitalize" v-model="info.firstname"
                      placeholder="Firstname" disabled />
                  </div>
                  <div class="w-full">
                    <label class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2">
                      Lastname
                    </label>
                    <input class="shadow-md p-2 rounded-sm w-full border capitalize" v-model="info.lastname"
                      placeholder="Lastname" disabled />
                  </div>
                </div>
                <div class="lg:flex gap-2 mb-3">
                  <div class="w-full">
                    <label class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2">
                      Booking Date
                    </label>
                    <input class="shadow-md p-2 rounded-sm w-full border" v-model="info.booking_date"
                      placeholder="Booking Date" disabled />
                  </div>
                  <div class="w-full">
                    <label class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2">
                      Booking Time
                    </label>
                    <input class="shadow-md p-2 rounded-sm w-full border" v-model="info.booking_time"
                      placeholder="Booking Time" disabled />
                  </div>
                </div>
                <div class="w-7/12 mb-3">
                  <label class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2">
                    Email
                  </label>
                  <input class="shadow-md p-2 rounded-sm w-full border" v-model="info.email" placeholder="Email"
                    disabled />
                </div>
              </div>
              <div class="w-full shadow-lg p-2 mb-5">
                <label :class="{
                  'bg-red-700': info.status === 'pending',
                  'bg-yellow-500': info.status === 'reserved',
                  'bg-green-900': info.status === 'received',
                  'bg-blue-300': info.status === 'returned',
                }" class="block uppercase tracking-wide text-white text-sm text-center mt-5 mb-5 py-1 rounded-sm">
                  Books
                </label>
                <ul>
                  <li v-for="(j, i) in info.books" :key="i" class="lg:flex gap-3">
                    <div class="w-full mb-3">
                      <label class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2">
                        Book Title
                      </label>
                      <input class="shadow-md p-2 rounded-sm w-full border capitalize" v-model="j.book_title"
                        placeholder="Book Title" disabled />
                    </div>
                    <div class="w-full mb-3">
                      <label class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2">
                        Book Author
                      </label>
                      <input class="shadow-md p-2 rounded-sm w-full border capitalize" v-model="j.book_author"
                        placeholder="Book Author" disabled />
                    </div>
                    <div class="w-full mb-3">
                      <label class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2">
                        Book Call Number
                      </label>
                      <input class="shadow-md p-2 rounded-sm w-full border uppercase" v-model="j.book_call_number"
                        placeholder="Book Call Number" disabled />
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div class="flex w-fit mx-auto my-10 gap-10">
              <div class="w-fit mx-auto flex items-center gap-3">
                <label class="font-bold pt-1" :class="{
                  'text-red-700': info.status === 'pending',
                  'text-yellow-500': info.status === 'reserved',
                  'text-green-900': info.status === 'received',
                  'text-blue-400': info.status === 'returned',
                }">STATUS:</label>
                <select v-model="info.status" name="borrower_category"
                  class="shadow-md p-2  font-bold rounded-md w-full border border-[#e5e7eb] capitalize" required
                  @change="btnShowModal()">
                  <option value="pending">pending</option>
                  <option value="reserved">reserved</option>
                  <option value="received">received</option>
                  <option value="returned">returned</option>
                </select>
              </div>
              <div v-show="confirmModal" class="flex items-center shadow-2xl border-2 rounded-lg py-2">
                <div class="flex items-center">
                  <div class="font-bold pl-5 pr-10">Confirm Status: </div>
                  <div class="flex gap-10 mr-10">
                    <span
                      class="px-3 uppercase py-1 rounded-lg bg-green-900 border hover:border-green-900 hover:bg-white hover:text-green-900 text-white font-bold"
                      @click="btnConfirm">yes</span>
                    <span
                      class="px-3 uppercase py-1 rounded-lg bg-red-700 border hover:border-red-700 hover:bg-white hover:text-green-900 text-white font-bold"
                      @click="btnCloseModal">no</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-show="loadingState" class="text-green-800 font-bold lg:text-lg text-sm text-center w-fit mx-auto">
              sending email, please wait ...
            </div>
          </div>
        </div>
      </div>
    </div>
    <DashboardFooter/>
  </div>
</template>
<style scoped>
</style>