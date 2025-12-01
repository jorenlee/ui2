<script setup>
import { onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import scheduleJSON from "../../schedule.json";
import providerListDepartmentJSON from "../../providerListDepartment.json";
import moment from "moment";
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);

import _ from "lodash";
import addDays from "date-fns/addDays";

const { data: schedule } = await useFetch(
  endpoint.value + "/api/schedules/" + route.params.id + "/"
);

const schedulesListsData = await $fetch(endpoint.value + "/api/schedules/list/").catch((error) => error.data)

const timeSelection = ref(scheduleJSON.timeSelection);

let id = ref();
let provider = ref([]);
let date = ref();
let time = ref([]);
let errors = ref([]);

let toggleSideBarMenu = ref(true);

const providerListsDepartment = ref(providerListDepartmentJSON.providerListsDepartment);

const emailRegistrar = ref(userStore.user.registrarEmail);
const developerEmail = ref(userStore.user.developerEmail);
const testEmail = ref(userStore.user.testEmail);

onMounted(() => {
  if (
    userStore.user.isAuthenticated &&
    (
      userStore.user.email === emailRegistrar.value ||
      userStore.user.email === developerEmail.value ||
      userStore.user.email === testEmail.value
    )
  ) {
    // router.push("/registrar/appointment/set-schedules/edit/" + route.params.id);
    schedulesListsData.filter(function (params) {
      if (params.date === schedule.value.date) {
        provider.value = params.provider;
        id.value = params.id;
        time.value = params.time;
        date.value = params.date;
      }
    });
    // console.log(schedule)
  } else {
    router.push("/unauthorized");
  }
})

const logOut = () => {
  router.push("/registrar/login");
  userStore.removeToken();
}

const editSchedule = async () => {
  // console.log("updated");
  if(time.value < 2) {
    time.value = ['-']
    // console.log('1 left')
  }
  await $fetch(endpoint.value + "/api/schedules/" + route.params.id + "/edit/", {
    method: "PUT",
    // headers: {
    //   "Content-Type": "application/json",
    // },
    body: {
      provider: provider.value,
      date: date.value,
      time: time.value,
    },
  })
  .then((response) => {
    // console.log("response", response);
    // router.push({ path: "/registrar/appointment/set-schedules" });
  });
};
</script>

<template>
  <div class="">
    <div class="flex">
      <div
        class="pt-7 pb-24 w-3/12 px-1 bg-gray-100 lg:block hidden"
        v-show="toggleSideBarMenu"
      >
<RegistrarMenuBar/>
      </div>
      <div class="w-full">
        <div class="bg-green-800">
          <div class="flex mx-auto justify-between py-2 px-3.5">
            <div class="flex items-center text-white gap-5">
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
            <button @click="logOut" class="flex hover:font-bold pt-1">
              <i class="fa fa-sign-out text-white text-xl"></i>
              <h1 class="text-xs text-white p-1.5">Log Out</h1>
            </button>
          </div>
        </div>
        <div class="">
          <div class="lg:w-full p-5">
            <div class="h-full shadow-lg pb-10">
              <div class="">
                <form class="w-full" v-on:submit.prevent="editSchedule">
                  <div class="flex">
                    
                    <div class="lg:w-1/3 mx-auto">
                      <div class="w-fit mx-auto">
                        <label
                          for="registrar"
                          class="uppercase block mb-2 text-xs font-bold text-gray-900 lasalle-green-text text-center"
                          >Provider</label
                        >
                        <div class="border p-5">
                          <div class="text-xs mt-3 mb-3 font-bold">
                            <label class="" for="PleaseSelectTheProvider"
                              >Please Select a Provider</label
                            >
                          </div>
                          <div class="lg:space-y-3">
                            
                          {{provider}}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="w-1/3 mb-10 justify-center h-full mr-10">
                      <h1
                        class="mb-3 font-bold lasalle-green-text text-xs text-center uppercase"
                      >
                        Calendar
                      </h1>
                      <div class="w-fit mx-auto">
                        <input class="text-center" v-model="date" disabled />
                      </div>
                    </div>


                    <div class="lg:w-1/3 mx-auto">
                      <h1
                        class="mb-3 font-bold lasalle-green-text whitespace-nowrap text-xs text-center uppercase"
                      >
                        Set Time ( AM )
                      </h1>
                      <div class="w-fit mx-auto">
                        <div class="">
                          <div class="">
                            <div class="flex h-full w-full px-5 py-2 shadow-sm border">
                              <ul class="text-xs">
                                <li
                                  class="mb-3 lg:flex justify-center font-bold text-black"
                                  v-for="(t, i) in timeSelection[0].time"
                                  :key="i"
                                >
                                  <input
                                    id="time"
                                    type="checkbox"
                                    name="time"
                                    :value="t"
                                    class="mr-2 mt-0.5 available"
                                    v-model="time"
                                  />
                                  <label class="" for="time">{{ t }}</label>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    class="mx-4 uppercase text-sm rounded-sm my-2 shadow px-5 py-1 text-green-900 whitespace-nowrap"
                  >
                    Update
                  </button>
                  <!-- <NuxtLink to="/registrar/appointment/set-schedules"
                    class="mx-4 uppercase text-sm rounded-sm my-2 shadow px-5 py-1 text-red-900 whitespace-nowrap"
                  >
                    Cancel
                  </NuxtLink> -->
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <DashboardFooter/>
  </div>
</template>
<style scoped>
.scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 20px;
}

.scrollbar::-webkit-scrollbar-track {
  border-radius: 100vh;
  background: #0e4a03;
}

.scrollbar::-webkit-scrollbar-thumb {
  background: #ffffff;
  border-radius: 100vh;
  border: 3px solid #12b700;
}

.scrollbar::-webkit-scrollbar-thumb:hover {
  background: #014716;
}

input[type="radio"] {
  accent-color: #20990b;
}
</style>
