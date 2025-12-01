<script setup>
import { onMounted } from "vue";
import { useUserStore } from "~/stores/user";
const router = useRouter();
const userStore = useUserStore();
const route = useRoute();
import _ from "lodash";
import axios from "axios";
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

onMounted(() => {
  if (userStore.user.isAuthenticated &&
    (userStore.user.email === "jorenleeluna24@gmail.com" ||
      userStore.user.email === "procurement@lsu.edu.ph" ||
      userStore.user.email === "jason.yap@lsu.edu.ph"
    )
  ) {
    router.push("/procurement/dashboard/edit/" + route.params.id);
  } else {
    router.push("/unauthorized");
  }
})

const endpoint = ref(userStore.mainDevServer);
const procurements = await $fetch(endpoint.value + "/api/procurements/" + route.params.id + "/").catch((error) => error.data)
// let id = ref();
// console.log('procurements', procurements)


// const info = ref({
//   id: procurements.id,
//   open_for_bids: procurements.open_for_bids,
//   title: procurements.title,
//   start_date: procurements.start_date,
//   lead_time: procurements.lead_time,
//   deadline: procurements.deadline,
//   quantity: procurements.quantity,
//   project_ceiling_budget: procurements.project_ceiling_budget,
//   lsu_address: procurements.lsu_address,
//   specifications: procurements.specifications,
//   banner_image: procurements.banner_image,
//   updated_at: new Date().toDateString(),
//   created_by_name: "Procurement Admin",
//   created_by_email: userStore.user.email,
//   created_at: procurements.updated_at,
// })

let imagePreview = ref(procurements.banner_image);
let toggleSideBarMenu = ref(true);
const banner_imageData = ref();

const imagePath = ref('https://lsu-media-styles.sgp1.digitaloceanspaces.com/storage-bucket-name/folder-location/files/admissions/files/');

const uploadedFile = (e) => {
  banner_imageData.value = e.target.files[0];
  imagePreview.value = URL.createObjectURL(banner_imageData.value);
  // console.log(banner_imageData.value);
  // console.log(e.target.files[0].name);
  info.value.banner_image = imagePath.value + '' + e.target.files[0].name
}


const logOut = () => {
  router.push("/procurement/login");
  userStore.removeToken();
}

const goToList = () => {
  router.push("/procurement/dashboard");
}

const goToCreate = () => {
  router.push("/procurement/dashboard/create");
}

const submitFunc = async () => {
  // console.log("submitForm");
  await $fetch(endpoint.value + "/api/procurements/" + route.params.id + "/edit/", {
    method: "PUT",
    body: info.value,
  }).then((response) => {
    // console.log("response", response);
    router.push("/procurement/dashboard");
  })
}

const submitForm = async (e) => {
  submitFunc()
  saveFile()
  e.preventDefault();
}
</script>

<template>
  <div class="bg-gray-50">
    <div>
      <div class="lg:flex">
        <div
          class="pt-7 pb-24 w-3/12 px-5 bg-gray-100 lg:block hidden"
          v-show="toggleSideBarMenu"
        >
          <ProcurementMenuBar :goToList="goToList" :goToCreate="goToCreate" />
        </div>

        <div class="w-full">
          <div class="bg-green-800">
            <div class="lg:flex mx-auto justify-between py-2 px-3.5">
              <div class="lg:flex lg:items-center text-white gap-5">
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

          <div class="w-full text-xs mb-5">
            <div class="p-5">
              <div class="shadow-lg w-full mx-auto p-3">
                <div class="lg:mb-4 text-lg font-medium">Edit Procurement</div>
                <form v-on:submit.prevent="submitForm" class="">
                  <div class="mt-3">
                    <ul>
                      <li class="flex text-xs mb-3">
                        <ul class="">
                          <li class="lg:flex items-center">
                            <input
                              type="checkbox"
                              id="checking"
                              name="checking"
                              value=""
                              class="mt-0.5 mr-1"
                              v-model="info.open_for_bids"
                            />
                            <label class="">Open for Bids</label>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                  <div class="lg:flex gap-3">
                    <div class="w-full mt-1">
                      <label
                        class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2"
                        for="startdate"
                      >
                        START DATE
                      </label>
                      <input
                        class="shadow-md py-1 px-2 rounded-sm w-full border-gray-200"
                        id="startdate"
                        type="date"
                        v-model="info.start_date"
                        placeholder="Start Date"
                      />
                    </div>
                    <div class="w-full mt-1">
                      <label
                        class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2"
                        for="project"
                      >
                        DEADLINE
                      </label>
                      <input
                        class="shadow-md px-2 py-1 rounded-sm w-full border-gray-200"
                        id="deadline"
                        type="date"
                        v-model="info.deadline"
                        placeholder="Deadline"
                      />
                    </div>

                    <div class="w-full lg:mb-3 mt-1">
                      <label
                        class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2"
                        for="leadtime"
                      >
                        LEAD TIME
                      </label>
                      <input
                        class="shadow-md px-2 py-1 rounded-sm w-full border-gray-200 capitalize"
                        id="leadtime"
                        type="text"
                        v-model="info.lead_time"
                        placeholder="Lead Time"
                      />
                    </div>
                    <div class="w-full lg:mb-3 mt-1">
                      <label
                        class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2"
                        for="project"
                      >
                        PROJECT CEILING BUDGET
                      </label>
                      <input
                        class="shadow-md p-2 rounded-sm w-full border"
                        id="project"
                        v-model="info.project_ceiling_budget"
                        placeholder="Project Ceiling Budget"
                      />
                    </div>
                    <div class="lg:w-1/2 lg:mb-3 mt-1">
                      <label
                        class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2"
                        for="quantity"
                      >
                        QUANTITY
                      </label>
                      <input
                        class="shadow-md p-2 rounded-sm w-full border"
                        id="quantity"
                        v-model="info.quantity"
                        placeholder="Quantity"
                      />
                    </div>
                  </div>

                  <div class="lg:flex gap-3">
                    <div class="w-full lg:mb-3 mt-1">
                      <label
                        class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2"
                        for="title"
                      >
                        TITLE
                      </label>
                      <input
                        class="shadow-md p-2 rounded-sm w-full border"
                        id="title"
                        v-model="info.title"
                        placeholder="Title"
                      />
                    </div>
                    <div class="w-full mt-1">
                      <label
                        class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2"
                        for="lsuadd"
                      >
                        LSU ADDRESS
                      </label>
                      <input
                        class="shadow-md p-2 rounded-sm w-full border"
                        id="lsuadd"
                        v-model="info.lsu_address"
                        placeholder="LSU Address"
                      />
                    </div>
                  </div>
                  <div class="mt-2 pb-3">
                    <MdEditor
                      v-model="info.specifications"
                      language="en-US"
                      toolbarsExclude="github"
                      @onSave="onSave"
                    />
                  </div>
                  <div class="lg:flex mt-3">
                    <div class="flex w-full">
                      <div>
                        <input 
                          type="file" 
                          @change="uploadedFile" 
                          accept="image/png, image/jpeg" />
                      </div>
                    </div>
                    <div class="w-fit lg:mx-0 mx-auto">
                      <div class="w-56 shadow">
                        <img class="lg:w-full h-56 object-contain" :src="imagePreview" />
                      </div>
                    </div>
                  </div>
                  <div class="w-full justify-between flex mt-5">
                    <div
                      type="submit"
                      @click="submitForm"
                      class="text-white bg-green-800 rounded-md text-sm w-auto mr-0 ml-auto px-5 py-2.5 text-center"
                    >
                      Update
                    </div>
                  </div>
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
  accent-color: #0a4300;
}

input[type="radio"]:disabled {
  background-color: #ebebeb;
  accent-color: #ebebeb;
}
input[type="checkbox"] {
  color: #116f00;
}
</style>
