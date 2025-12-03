<script setup>
import { onMounted, ref, computed, watch, onBeforeUnmount } from "vue";
import { useUserStore } from "@/stores/user";
import _ from "lodash";
import moment from "moment";
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);
const listItems = ref([]);
let deleteIDItem = ref();
let tableDisplay = ref(true);
let toggleSideBarMenu = ref(false);
let toggleConfirmDelete = ref(false);

const selectedItem = ref(null);
const toggleListsName = ref(false);
const displayListName = ref([]);

const isQuietFetching = ref(false);
let refreshTimer = null;
const refreshIntervalMs = 1000;



onMounted(async () => {
  setTimeout(async () => {
    if (
      userStore.user.isAuthenticated &&
      (userStore.user.email === "jorenleeluna24@gmail.com" ||
        userStore.user.email === "npc@lsu.edu.ph")
    ) {
    //   await fetchListItems();
      router.push("/cms/dashboard");
    //   startAutoRefresh();
    } else {
      router.push("/unauthorized");
    }
  }, 5000);
//   await fetchListItems();
//   startAutoRefresh();
});

const logOut = () => {
  userStore.removeToken();
  router.push("/cms/login");
};

</script>
<template>
  <div>
    <div class="h-screen flex">
      <div
        class="pb-3 lg:w-3/12 bg-gray-100 w-full flex overflow-hidden"
        v-show="toggleSideBarMenu"
      >
        <div class="w-full">
          <div
            class="flex items-center justify-center text-white bg-green-900 lg:py-[16px] py-[8px] sta"
          >
            <div class="flex items-center w-full px-2">
              <i class="fa fa-user mx-2" aria-hidden="true"></i>
              <h1 class="text-sm">
                {{ userStore.user.email }}
              </h1>
            </div>

            <div
              @click="toggleSideBarMenu = !toggleSideBarMenu"
              class="w-10 px-1.5 lg:hidden flex"
            >
              <i
                class="fa text-3xl text-white"
                :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars'"
                aria-hidden="true"
              ></i>
            </div>
          </div>

          <div class="">
            <div class="w-fit mx-auto mt-5 mb-3">
              <img
                src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/LSU_Seal.PNG"
                class="lg:w-24 w-20 mx-auto"
              />
            </div>

            <div class="text-center">
              <h1 class="font-bold text-green-800 text-2xl">Dashboard</h1>
            </div>

            <div class="mx-auto mt-10 mb-5 grid grid-cols-1">
              <a
                href="/cms/dashboard"
                class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-black hover:bg-black hover:text-white"
              >
                <i class="fa fa-list mr-3" aria-hidden="true"></i>
                 Content Form
              </a>

              <a
                href="/cms/dashboard/list"
                class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-black hover:bg-black hover:text-white"
              >
               <i class="fa fa-list-alt mr-3" aria-hidden="true"></i>
              
                 All Contents Lists
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
      </div>

      <div class="w-full overflow-y-scroll">
        <div class="bg-green-800 fixed w-full">
          <div class="flex mx-auto justify-between py-2 px-3.5">
            <div
              @click="toggleSideBarMenu = !toggleSideBarMenu"
              class="w-auto flex items-center lg:px-1.5"
            >
              <i
                class="fa text-3xl text-white"
                :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars'"
                aria-hidden="true"
              ></i>
              <p
                class="text-white whitespace-nowrap lg:ml-5 ml-3 font-bold uppercase lg:text-sm text-xs"
              >
                LSU Content Management System
              </p>
            </div>

            <button @click="logOut" class="flex hover:font-bold pt-1">
              <i class="fa fa-sign-out text-white text-xl"></i>
              <h1 class="text-xs text-white p-1.5 lg:flex hidden">Log Out</h1>
            </button>
          </div>
        </div>

        <div
          class="bg-white border rounded-md p-2 text-xs flex items-end gap-2 mt-20 mx-5"
        >
          <!-- filters -->
        </div>

        <div class="">
          <div class="w-full lg:p-5 px-2 py-2">
            <div v-show="tableDisplay">
              <div
                class="w-full shadow bg-gray-100 text-green-900 font-bold px-2 text-center mb-3 py-2 text-xs uppercase"
              >
                All Contents Lists
              </div>
              <div class="">
                <div
                  class="appointment-lists mx-auto text-xs"
                  :class="toggleListsName ? 'hidden' : ''"
                >
                  <div v-if="isLoading" class="text-center">
                    <!-- Filters toolbar -->

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
