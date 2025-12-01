<script setup>
import { onMounted, ref } from "vue";
import { useUserStore } from "@/stores/user";
import moment from "moment";
const router = useRouter();
const userStore = useUserStore();
const route = useRoute();
import _ from "lodash";
const endpoint = ref(userStore.mainDevServer);




const presentYear = ref(moment(new Date()).format("YYYY"));


const procurements = await $fetch(endpoint.value + "/api/procurements/list").catch(
  (error) => error.data
);
let toggleSideBarMenu = ref(true);
let toggleConfirmDelete = ref(false);

onMounted(() => {
  if (
    userStore.user.isAuthenticated &&
    (userStore.user.email === "hr@lsu.edu.ph" ||
    userStore.user.email === "jorenleeluna24@gmail.com"
    )
  ) 
  {
    router.push("/hr/dashboard");
  } else {
    router.push("/unauthorized");
  }
});

const logOut = () => {
  router.push("/hr");
  userStore.removeToken();
};
</script>
<template>
  <div>
    <div class="flex">
      <div
        class="pt-7 pb-24 w-3/12 px-5 bg-gray-100 lg:block hidden"
        v-show="toggleSideBarMenu"
      >
        <div>
          <div class="w-fit mx-auto mt-5 mb-3">
             <img
              src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/circleLSULogo.jpg"
              class="lg:w-28 w-24 mx-auto rounded-full"
            />
          </div>

          <div class="text-center">
            <!-- <h1 class="font-bold text-green-800 text-3xl">Welcome!</h1> -->
            <h2 class="font-bold text-green-800 text-lg uppercase">hr dashboard</h2>
          </div>
          <div class="mx-auto mt-10 mb-5 grid grid-cols-1">
            <a
              href="/hr/dashboard/portal/lists"
              class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
            >
              <i class="fa fa-list mr-3" aria-hidden="true"></i>
              View Lists
            </a>
            <a
              href="/hr/dashboard/portal/create"
              class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
            >
              <i class="fa fa-plus-circle mr-3" aria-hidden="true"></i>
              CREATE
            </a>
            <a
              href="/hr"
              class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
            >
              <i class="fa fa-address-card mr-3" aria-hidden="true"></i>
              LSU Recruitment
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
                <h1 class="text-sm">{{ userStore.user.email }}</h1>
              </div>
            </div>
            <button @click="logOut" class="flex hover:font-bold pt-1">
              <i class="fa fa-sign-out text-white text-xl"></i>
              <h1 class="text-xs text-white p-1.5">Log Out</h1>
            </button>
          </div>
        </div>
        <div>
          <div class="w-full p-5">
            <h1 class="text-green-800 shadow-lg rounded-lg p-10 font-bold">Welcome! to Dashboard</h1>
          </div>
        </div>
      </div>
    </div>

    <div class="fixed bg-green-900 py-4 bottom-0 w-full">
      <h1 class="text-center text-white lg:text-sm text-xs">
        Copyright © {{presentYear}} <span>La Salle University Ozamiz</span>
      </h1>
    </div>
  </div>
</template>

<style scoped></style>
