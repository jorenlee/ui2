<script setup>
import { onMounted, ref } from "vue";
import { useUserStore } from "@/stores/user";
const router = useRouter();
const userStore = useUserStore();
import _ from "lodash";

const endpoint = ref(userStore.mainDevServer);
const developerEmail = ref(userStore.user.developerEmail);

onMounted(() => {
  if (userStore.user.isAuthenticated && 
      (
      userStore.user.email === developerEmail.value ||
      userStore.user.email === 'monaliza.mugot@lsu.edu.ph' ||
      userStore.user.email === 'marilyn.bejec@lsu.edu.ph' ||
      userStore.user.email === 'applejane.ebarle@lsu.edu.ph' ||
      userStore.user.email === 'janekaren.gudmalin@lsu.edu.ph' ||
      userStore.user.email === 'macy.beniola@lsu.edu.ph' ||
      userStore.user.email === 'lynn.lumacad@lsu.edu.ph' ||
      userStore.user.email === 'zosette.salas@lsu.edu.ph' 
    )) {
    router.push("/library/dashboard");
  } else {
    router.push("/unauthorized");
  }
});

let libraryInfo = ref(true);

let toggleSideBarMenu = ref(true);
let toggleConfirmDelete = ref(false);

let idToBeDeleted = ref();

const bookingLibrary = await $fetch(endpoint.value + "/api/library/booking/list/").catch(
  (error) => error.data
);

let toggleMenu = (a) => {
  libraryInfo.value = a;
  appointmentDetails.value = false;
};

// const goToList = () => {
//   router.push("/library/dashboard");
// };

// const goToEdit = (id) => {
//   router.push("/library/dashboard/edit/" + id);
// };

// const toggleDeleteBtn = (id) => {
//   toggleConfirmDelete.value = !toggleConfirmDelete.value;
//   idToBeDeleted.value = id;
//   // console.log(id);
// }

const deleteLibrary = async () => {
  await $fetch(
    endpoint.value + "/api/library/booking/" + idToBeDeleted.value + "/delete/",
    {
      method: "DELETE",
      headers: {
        Authorization: userStore.user.token,
        "Content-Type": "application/json",
      },
    }
  ).then(async (response) => {
    // console.log("response", response);
    router.go();
    toggleConfirmDelete.value = !toggleConfirmDelete.value;
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
            <div @click="toggleSideBarMenu = !toggleSideBarMenu" class="w-10 px-1.5">
              <i class="fa text-3xl text-white" :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars'" aria-hidden="true"></i>
            </div>
            <button @click="logOut" class="flex hover:font-bold pt-1">
              <i class="fa fa-sign-out text-white text-xl"></i>
              <h1 class="text-xs text-white p-1.5">Log Out</h1>
            </button>
          </div>
        </div>
        <div class="px-3">
          <div>
            <div class="text-left p-10 shadow-lg">
              <h1 class="font-bold text-green-800 text-3xl">Welcome!</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
    <DashboardFooter/>
  </div>
</template>
<style scoped></style>