<script setup>
import { onMounted } from "vue";
import { useUserStore } from "~/stores/user";
const router = useRouter();
const userStore = useUserStore();
const route = useRoute();
import _ from "lodash";
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
let toggleSideBarMenu = ref(true);


const imagePath = ref('https://lsu-media-styles.sgp1.digitaloceanspaces.com/storage-bucket-name/folder-location/files/admissions/files/');

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
  console.log("submitForm");
  await $fetch(endpoint.value + "/api/procurements/" + route.params.id + "/edit/", {
    method: "PUT",
    body: procurements,
  }).then((response) => {
    console.log("response", response);
    router.push({ path: "/procurement/dashboard" });
  })
}

const submitForm = async (e) => {
  submitFunc()
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
                  <!-- <div class="mt-3">
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
                              v-model="procurements.open_for_bids"
                              required
                            />
                            <label class="">Open for Bids</label>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </div> -->
                  <div class="lg:flex gap-3">
                    <div class="w-full lg:mb-3 mt-1">
                      <label
                        class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2"
                        for="startdate"
                      >
                        DATE POSTED
                      </label>
                      <input
                        class="shadow-md p-2 rounded-sm w-full border"
                        id="startdate"
                        type="date"
                        v-model="procurements.date_posted"
                        placeholder="Start Date"
                        required
                      />
                    </div>
                    <div class="w-full lg:mb-3 mt-1">
                      <label
                        class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2"
                        for="project"
                      >
                        DEADLINE OF SUBMISSION
                      </label>
                      <input
                        class="shadow-md p-2 rounded-sm w-full border"
                        id="deadline"
                        type="date"
                        v-model="procurements.deadline"
                        placeholder="Deadline"
                        required
                      />
                    </div>

                    <div class="w-full mt-1">
                      <label
                        class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2"
                        for="project"
                      >
                        PROJECT CEILING BUDGET
                      </label>
                      <input
                        class="shadow-md pt-2 pb-2.5 px-2 rounded-sm w-full border"
                        id="project"
                        v-model="procurements.project_budget"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div class="w-full lg:mb-3 mt-1">
                      <label
                        class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2"
                        for="nature_of_project"
                      >
                        Nature of Project
                      </label>
                      <input
                        class="shadow-md pt-2 pb-2.5 px-2 rounded-sm w-full border"
                        id="nature_of_project"
                        v-model="procurements.nature_of_project"
                        placeholder="Nature of Project"
                        required
                      />
                    </div>
                    <div class="w-6/12 lg:mb-3 mt-1">
                      <label
                        class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2"
                        for="nature_of_project"
                      >
                        Bid Status
                      </label>
                    
                      <select
                       class="shadow-md p-2 rounded-sm w-full border"
                       id="nature_of_project"
                        v-model="procurements.bid_status"
                        required
                       >
                          <option value="announcement" selected>Announcement</option>
                          <option value="on hold">On Hold</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                        </select>
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
                        v-model="procurements.title"
                        placeholder="Title"
                        required
                      />
                    </div>
                    <!-- <div class="w-full mt-1">
                      <label
                        class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2"
                        for="lsuadd"
                      >
                        LSU ADDRESS
                      </label>
                      <input
                        class="shadow-md p-2 rounded-sm w-full border"
                        id="lsuadd"
                        v-model="procurements.lsu_address"
                        placeholder="LSU Address"
                        required
                      />
                    </div> -->

                    <div class="w-full lg:mb-3 mt-1">
                          <label
                            class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2"
                            for="title"
                          >
                            PDF Link  <i class="fa fa-link"></i>
                          </label>
                          <input
                            class="shadow-md p-2 rounded-sm w-full border"
                            id="title"
                            v-model="procurements.document_file"
                            placeholder="Paste PDF File Link"
                            required
                          />
                        </div>
                  </div>

                  <!-- <div class="mt-2 pb-3">
                    <MdEditor
                      v-model="procurements.specifications"
                      language="en-US"
                      toolbarsExclude="github"
                    />
                  </div> -->
                <div class="">
                  <!-- <div class="mt-3 w-full">
                    <div class="">
                      <div>
                        <input 
                          type="file" 
                          @change="uploadedFile" 
                          accept="image/png, image/jpeg" 
                          class="shadow"
                        />
                      </div>
                    </div>
                    <div class="w-fit mt-3">
                      <div class="w-56 shadow">
                        <img class="lg:w-full h-56 object-contain" :src="imagePreview" />
                      </div>
                    </div>
                  </div> -->
                  <div class="mt-3 w-full">
                    <div class="">
                      <div>
                        <!-- <input 
                          type="file" 
                          @change="uploadedFile" 
                          accept="image/png, image/jpeg" 
                          class="shadow"
                        /> -->
                      
                        
                        <!-- <button @click="pause" class="ml-10">
                          <div v-if="paused">
                            <i class="fa fa-pause" aria-hidden="true"></i>
                          </div>
                          <div v-else>
                            <i class="fa fa-play" aria-hidden="true"></i>
                          </div>
                        </button> -->
                      </div>
                      <!-- <div class="w-5/12 ml-10 text-center pt-3">
                        <div
                          class="text-white bg-green-900 transition-all ease-in-out duration-200 h-5 flex items-center"
                          :style="`width:${progressPercent}%`"
                        >
                          <p class="mx-auto">{{ progressPercent }} %</p>
                        </div>
                      </div> -->
                    </div>
                    <div class="mt-3">
                      <div class="shadow">
                        <embed :src="procurements.document_file" style="width:100%; height:500px;">
                      </div>
                    </div>
                  </div>
                  </div>
                  <div class="w-full justify-between flex mt-5">
                    <div
                      type="submit"
                      @click="submitForm"
                      class="text-white cursor-pointer uppercase bg-green-800 
                      hover:bg-white border border-green-700 hover:text-green-800 rounded-md text-sm w-fit mx-auto px-5 py-2.5 text-center hover:font-bold"
                    >
                    <i class="fa fa-save mr-2"></i>  Save 
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
