<script setup>
import { onMounted, ref } from "vue";
import { useUserStore } from "@/stores/user";
const router = useRouter();
const userStore = useUserStore();
import _ from "lodash";

const endpoint = ref(userStore.mainDevServer);

onMounted(() => {
  if (
    userStore.user.isAuthenticated &&
    (userStore.user.email === "jorenleeluna24@gmail.com")
  ) {
    router.push("/cits/dashboard");
  } else {
    router.push("/unauthorized");
  }
})

let citsInfo = ref(true);
let toggleSideBarMenu = ref(true);
let toggleConfirmDelete = ref(false);
let idToBeDeleted = ref();

const cits = await $fetch(endpoint.value +"/api/cits/list").catch((error) => error.data)

const goToList = () => {
  router.push("/cits/dashboard");
};

const goToCreate = () => {
  router.push("/cits/dashboard/create");
};

const goToEdit = (id) => {
  router.push("/cits/dashboard/edit/" + id);
};

const toggleDeleteBtn = (id) => {
  toggleConfirmDelete.value = !toggleConfirmDelete.value;
  idToBeDeleted.value = id;
  // console.log(id);
};

const deleteCits = async () => {
  await $fetch(
    endpoint.value +"/api/cits/" + idToBeDeleted.value + "/delete/",
    {
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
  });
}

const logOut = () => {
  router.push("/cits/login");
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
      <CitsMenuBar
        :goToList="goToList"
        :goToCreate="goToCreate"
      />
      </div>
      <div class="w-full h-screen">
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
        <div>
          <div class="w-full p-5">
            <div v-show="citsInfo">
              <div class="appointment-lists shadow mx-auto text-xs">
                <div class="">
                  <div class="header w-full p-2 bg-green-800 text-white flex items-center">
                    <ul
                      class="lg:flex w-full justify-evenly text-center whitespace-nowrap">
                      <li class="lg:w-2/12">No.</li>
                      <li class="lg:w-2/12">Email</li>
                      <li class="lg:w-3/12">Role</li>
                      <li class="lg:w-2/12">Action</li>
                    </ul>
                  </div>
                  <div class="w-full rows" v-if="cits.length > 0">
                    <ul
                      class="lg:flex w-full justify-evenly text-center items-center h-auto border-b border-gray-100"
                      v-for="cits in cits"
                      v-bind:key="cits.id"
                      v-bind:cits="Cits"
                    >
                      <li class="lg:w-12">{{ cits.id }}</li>
                      <li class="lg:w-2/12">{{ cits.email }}</li>
                      <li class="lg:w-2/12">{{ cits.role }}</li>
                      <li class="lg:flex px-2 font-bold justify-center lg:w-1/12">
                        <div class="mx-auto lg:flex justify-center">
                          <button @click="goToEdit(cits.id)">
                            <i
                              class="fa fa-edit text-yellow-500 rounded-lg uppercase text-xl hover:text-3xl"
                              aria-hidden="true"
                            ></i>
                          </button>
                        </div>
                        <div class="mx-auto lg:flex justify-center">
                          <button @click="toggleDeleteBtn(cits.id)">
                            <i
                              class="fa fa-trash text-red-500 rounded-lg uppercase text-xl hover:text-3xl"
                              aria-hidden="true"
                            ></i>
                          </button>
                        </div>
                      </li>
                    </ul>
                    <div
                      class="px-5 rounded-lg bg-white shadow-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      v-show="toggleConfirmDelete"
                    >
                      <div class="my-6">Are you sure you want to Delete?</div>
                      <div class="flex gap-5 mx-auto w-fit my-5">
                        <span
                          class="bg-green-900 text-white px-3 py-1 rounded-lg"
                          @click="deleteCits"
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
                  <div v-else class="itallic text-gray-400 text-center p-1">
                    Please Add CITS, No Results Found!
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
