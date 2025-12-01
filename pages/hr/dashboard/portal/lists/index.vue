<script setup>
import { onMounted, ref } from "vue";
import { useUserStore } from "@/stores/user";
const router = useRouter();
const userStore = useUserStore();
import _ from "lodash";
const route = useRoute();
import moment from "moment";


const presentYear = ref(moment(new Date()).format("YYYY"));

const endpoint = ref(userStore.mainDevServer);
const careers = await $fetch(endpoint.value + "/api/humanResource/list").catch((error) => error.data) || 0;
console.log(careers)
let toggleSideBarMenu = ref(true);
let toggleConfirmDelete = ref(false);
let idToBeDeleted = ref();

onMounted(() => {
  if (
    userStore.user.isAuthenticated &&
    (userStore.user.email === "hr@lsu.edu.ph" ||
      userStore.user.email === "jorenleeluna24@gmail.com"
    )
  ) {
    router.push("/hr/dashboard/portal/lists");
  } else {
    router.push("/unauthorized");
  }
});

const toggleDeleteBtn = (id) => {
  toggleConfirmDelete.value = !toggleConfirmDelete.value;
  idToBeDeleted.value = id;
};

const deleteAppointment = async () => {
  await $fetch(
    endpoint.value + "/api/humanResource/" + idToBeDeleted.value + "/delete/",
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
};

const logOut = () => {
  router.push("/hr");
  userStore.removeToken();
};
</script>
<template>
<div>
  <div class="flex">
    <div class="pt-7 pb-24 w-3/12 px-5 bg-gray-100 lg:block hidden" v-show="toggleSideBarMenu">
      <div>
        <div class="w-fit mx-auto mt-5 mb-3">
          <img
            src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/circleLSULogo.jpg"
            class="lg:w-28 w-24 mx-auto rounded-full" />
        </div>

        <div class="text-center">
          <!-- <h1 class="font-bold text-green-800 text-3xl">Welcome!</h1> -->
          <h2 class="font-bold text-green-800 text-lg uppercase">hr dashboard</h2>
        </div>
        <div class="mx-auto mt-10 mb-5 grid grid-cols-1">
          <a href="/hr/dashboard/portal/lists"
            class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white">
            <i class="fa fa-list mr-3" aria-hidden="true"></i>
            View Lists
          </a>
          <a href="/hr/dashboard/portal/create"
            class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white">
            <i class="fa fa-plus-circle mr-3" aria-hidden="true"></i>
            CREATE
          </a>
          <a href="/hr"
            class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white">
            <i class="fa fa-address-card mr-3" aria-hidden="true"></i>
            LSU Recruitment
          </a>
          <a href="/"
            class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white">
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
              <i class="fa text-3xl text-white" :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars'"
                aria-hidden="true"></i>
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
      <div class="relative">
        <div>
          <div class="w-11/12 mx-auto shadow lg:px-5 px-4 lg:pt-5 pt-3 my-10 rounded-lg">
            <h1 class="text-center text-green-700 font-bold lg:text-3xl text-lg">
              Career Opportunities
            </h1>
            <div class="w-full rows" v-if="careers.length > 0">
              <ul class="lg:grid grid-cols-5 gap-x-3 lg:py-10">
                <li v-for="(c, i) in careers" :key="i"
                  class="border p-x-3 rounded-lg hover:rounded-none shadow-md hover:shadow-none lg:my-0 my-5 bg-white hover:bg-green-800">
                  


                  <div v-for="(j,k) in _.orderBy(c.image_link, 'created_at', 'asc')" :key="k"> 

                    <img class="lg:mx-0 mx-auto w-full h-[200px]"
                    :src="`${j.url}`" />
                  </div>











                  <!-- <div class="flex justify-between pt-3">
                    <div class="">
                      <button @click="toggleDeleteBtn(c.id)">
                        <i class="fa fa-trash text-red-500 rounded-lg uppercase text-xl hover:text-3xl"
                          aria-hidden="true"></i>
                      </button>
                    </div>
                  </div> -->
                </li>
              </ul>

              <div
                class="px-5 rounded-lg bg-white shadow-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                v-show="toggleConfirmDelete">
                <div class="my-6">Are you sure you want to Delete?</div>
                <div class="flex gap-5 mx-auto w-fit my-5">
                  <span class="bg-green-900 text-white px-3 py-1 rounded-lg" @click="deleteAppointment">Yes</span>
                  <span class="bg-red-900 text-white px-3 py-1 rounded-lg" @click="toggleDeleteBtn">Cancel</span>
                </div>
              </div>
            </div>
            <div v-else class="italic text-gray-400 text-center p-10">
              Please Add Entry, No Results Found!
            </div>
          </div>
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