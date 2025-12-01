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
    userStore.user.email === userStore.user.email) {
    router.push("/library/dashboard");
  } else {
    router.push("/unauthorized");
  }
});

let libraryInfo = ref(true);

let toggleSideBarMenu = ref(true);
let toggleConfirmDelete = ref(false);

let idToBeDeleted = ref();

const bookingLibrary = await $fetch(endpoint.value + "/api/library/booking/list/").catch((error) => error.data)


const goToEdit = (id) => {

};

const toggleDeleteBtn = (id) => {
  toggleConfirmDelete.value = !toggleConfirmDelete.value;
  idToBeDeleted.value = id;

  // console.log(id);
};


async function deleteLibrary() {
  await $fetch(
    endpoint.value + "/api/library/booking/" + idToBeDeleted.value + "/delete/",
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
    })
    .catch((error) => {
      // console.log(error);
    });
}

const logOut = () => {
  router.push("/library/login");
  userStore.removeToken();
};

</script>
<template>
  <div class="">
    <div class="flex">
      <div
        class="pt-7 pb-24 w-3/12 px-5 bg-gray-100 lg:block hidden"
        v-show="toggleSideBarMenu"
      >
        <!-- <LibraryMenuBarBorrower /> -->
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
          <div class="lg:w-full p-5">
            <div v-show="libraryInfo">
              <div class="appointment-lists shadow mx-auto text-xs">
                <div class="">
                  <div
                    class="header w-full p-2 bg-green-800 text-white flex items-center"
                  >
                    <ul
                      class="lg:flex w-full justify-evenly text-center whitespace-nowrap"
                    >
                      <li class="lg:w-20">No.</li>
                      <li class="lg:w-2/12">email</li>
                      <li class="lg:w-2/12">student_id</li>
                      <li class="lg:w-2/12">borrower_category</li>
                      <li class="lg:w-2/12">book_title</li>
                      <li class="lg:w-2/12">Action</li>
                    </ul>
                  </div>

                  <div class="w-full rows" v-if="bookingLibrary.length > 0">
                    <ul
                      class="lg:flex w-full justify-evenly text-center items-center h-auto border-b border-gray-100"
                      v-for="(library, index) in bookingLibrary"
                      :key="index"
                    >
                      <li class="px-2 lg:w-14">{{ library.id }}</li>
                      <li class="px-2 lg:w-2/12">{{ library.email }}</li>
                      <li class="px-2 lg:w-2/12">{{ library.student_id }}</li>
                      <li class="px-2 lg:w-2/12">{{ library.borrower_category }}</li>
                      <li class="px-2 lg:w-2/12">{{ library.book_title }}</li>
                      <li class="flex px-2 font-bold justify-center lg:w-1/12">
                        <div class="mx-auto flex justify-center">
                          <button @click="goToEdit(library.id)">
                            <i
                              class="fa fa-edit text-yellow-500 rounded-lg uppercase text-xl hover:text-3xl"
                              aria-hidden="true"
                            ></i>
                          </button>
                        </div>
                        <div class="mx-auto flex justify-center">
                          <button @click="toggleDeleteBtn(library.id)">
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
                          @click="deleteLibrary"
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
                    Please Add LIBRARY, No Results Found!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="bg-green-900 p-3">
      <h1 class="text-center text-white text-xs">
        <span class="font-bold">Copyright © 2023 </span
        ><span>La Salle University - Ozamiz</span>
      </h1>
    </div>
  </div>
</template>
<style scoped></style>