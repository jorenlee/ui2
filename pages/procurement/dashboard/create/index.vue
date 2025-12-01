<script setup>
import { computed, onMounted } from "vue";
import { useUserStore } from "~/stores/user";
const router = useRouter();
const userStore = useUserStore();
import _ from "lodash";
import axios from "axios";
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
const endpoint = ref(userStore.mainDevServer);

onMounted(() => {
  if (
    userStore.user.isAuthenticated &&
    (userStore.user.email === "jorenleeluna24@gmail.com" ||
      userStore.user.email === "procurement@lsu.edu.ph" ||
      userStore.user.email === "jason.yap@lsu.edu.ph"
    )
  ) {
    router.push("/procurement/dashboard/create");
  } else {
    router.push("/unauthorized");
  }
});

// lsu_address: "La Salle University, La Salle St. Barangay Aguada Ozamiz City, Misamis Occidental, Philippines",

const info = ref({
  id: "",
  date_posted: "",
  deadline: "",
  project_budget: 0.0,
  nature_of_project: "",
  bid_status: "",
  title: "",
  document_file: "https://pdfobject.com/pdf/sample.pdf",
  specifications: "# Hello Editor",
  banner_image: "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/LSU_Seal.PNG",
  updated_at: new Date().toDateString(),
  created_by_name: "Procurement Admin",
  created_by_email: userStore.user.email,
  created_at: new Date().toDateString(),
})

const imagePath = ref('https://lsu-media-styles.sgp1.digitaloceanspaces.com/storage-bucket-name/folder-location/files/procurement/files/');

const toggleSideBarMenu = ref(true);
const banner_imageData = ref(null);
const imagePreview = ref("https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/circleLSULogo.jpg")

const uploadedFile = (e) => {
  banner_imageData.value = e.target.files[0];
  imagePreview.value = URL.createObjectURL(banner_imageData.value);
  info.value.banner_image = imagePath.value + '' + e.target.files[0].name
}

// console.log(banner_imageData.value);
// console.log(e.target.files[0].name);
// const uploadTask = ref(null);
// const progress = ref(0);
// const progressPercent = computed(() => Math.round(progress.value));

const saveFile = async () => {
  let formData = new FormData();
  formData.append("image", banner_imageData.value);
  // console.log(banner_imageData.value);
  let axiosConfig = {
    headers: { "Content-Type": "multipart/form-data" },
  };
  axios
  .post("https://tech.lsu.edu.ph/api/image_url/file/list/files/", formData, axiosConfig)
  .then((response) => {
    console.log(response);
  });
};

const logOut = () => {
  router.push("/procurement/login");
  userStore.removeToken();
};

const goToList = (e) => {
  router.push("/procurement/dashboard");
  e.preventDefault();
};

const goToCreate = (e) => {
  router.push("/procurement/dashboard/create");
  e.preventDefault();
};


const submitFunc = async (e) => {
  await $fetch(endpoint.value + "/api/procurements/create/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: info.value,
  }).then((response) => {
    console.log("response", response);
  });
};

const submitForm = async () => {
  submitFunc()
  console.log("submitForm");
  if(banner_imageData.value !== null){
    saveFile();
  }
  router.push("/procurement/dashboard");
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

          <div class="text-xs mb-5">
            <div class="p-5">
              <div class="shadow-lg w-full mx-auto p-3">
                <div class="lg:mb-4 text-lg font-medium">Create Bid Post</div>
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
                              v-model="info.open_for_bids"
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
                        v-model="info.date_posted"
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
                        v-model="info.deadline"
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
                        v-model="info.project_ceiling_budget"
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
                        v-model="info.nature_of_project"
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
                        v-model="info.bid_status"
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
                        v-model="info.title"
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
                        v-model="info.lsu_address"
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
                            v-model="info.document_file"
                            placeholder="Paste PDF File Link"
                            required
                          />
                        </div>
                  </div>

                  <!-- <div class="mt-2 pb-3">
                    <MdEditor
                      v-model="info.specifications"
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
                        <embed :src="info.document_file" style="width:100%; height:500px;">
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
                    <i class="fa fa-paper-plane mr-3"></i> Submit 
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

input[type="file"]::file-selector-button {
  border: 2px solid #006715;
  background-color: #006715;
  padding: 6px;
  color: #fff;
  /* padding: 0.2em 0.4em;
  border-radius: 0.2em;
  transition: 1s; */
}

input[type="file"]::file-selector-button:hover {
  background-color: #006715;
  border: 2px solid #006715;
}
input[type="checkbox"] {
  color: #116f00;
}
</style>