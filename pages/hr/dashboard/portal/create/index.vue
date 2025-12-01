<script setup>
import { onMounted, ref } from "vue";
import { useUserStore } from "@/stores/user";
import moment from "moment";
const router = useRouter();
const userStore = useUserStore();
const route = useRoute();
import _ from "lodash";
import axios from 'axios';  // For making HTTP requests
const endpoint = ref(userStore.mainDevServer);




const presentYear = ref(moment(new Date()).format("YYYY"));

onMounted(() => {
  setTimeout(() => {
    if (
      userStore.user.isAuthenticated &&
      (userStore.user.email === "hr@lsu.edu.ph" ||
        userStore.user.email === "jorenleeluna24@gmail.com")
    ) {
      router.push("/hr/dashboard/portal/create");
    } else {
      router.push("/unauthorized");
    }
  }, 3000);
});

let toggleSideBarMenu = ref(true);
let toggleConfirmDelete = ref(false);


const info = ref({
  image_link: [],
});

const imagePreview = ref(
  "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/circleLSULogo.jpg"
);

const selectedFiles = ref([]);
const uploadedFiles = ref([]);
const uploadStatus = ref(null);
// const fileUrl = ref(null);

const handleFileUpload = (event) => {
  selectedFiles.value = Array.from(event.target.files);
  console.log(event);
  // Convert FileList to an array
  selectedFiles.value.forEach((file) => {
    console.log(`File: ${file.name}, Size: ${file.size} bytes`);
  });
};

const uploadFiles = async () => {
  if (!selectedFiles.value.length) {
    return;
  }
  const formData = new FormData();
  selectedFiles.value.forEach((file) => {
    formData.append("file", file);
    // Append each file to the FormData
  });
  try {
    uploadStatus.value = "Uploading...";
    const response = await axios.post(
      endpoint.value + "/api/humanResource/upload/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    let imageUrl = 'https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/files/humanResource/files/'
    uploadStatus.value = "Upload successful!";
    console.log("Files uploaded:", response.data);
    uploadedFiles.value = response.data.map((item) => ({
      name: item.name, // Access the name property
      // url: item.url, // Access the URL property
      // size: item.size,
      url: imageUrl + item.name, // Access the URL property
    }));
    selectedFiles.value = []; // Clear selected files after successful upload
    info.value.image_link = uploadedFiles.value;

    console.log(info.value.image_link)
    postAPI();

    console.log(info.value);
  } catch (error) {
    console.error("File upload error:", error); // Log the full error for debugging
    uploadStatus.value = "Upload failed: " + error.message; // Display error message
  }
};

const submitForm = () => {
  uploadFiles();
};

const postAPI = async () => {
  await $fetch(endpoint.value + "/api/humanResource/create/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: info.value,
  }).then((response) => {
    console.log("response", response);
    router.push({ path: "/hr/dashboard/portal/lists" });
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
            <h2 class="font-bold text-green-800 text-lg uppercase">
              hr dashboard
            </h2>
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
              <div
                @click="toggleSideBarMenu = !toggleSideBarMenu"
                class="w-10 px-1.5"
              >
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
            <form v-on:submit.prevent="submitForm" class="px-3 flex flex-wrap">
              <div class="w-full lg:mb-0 mb-2">
                <label class="text-[10px] text-gray-300"> Banner </label>
                <div class="mt-3">
                  <div class="flex w-full mb-3">
                    <div class="flex h-fit">
                      <input
                        type="file"
                        @change="handleFileUpload"
                        accept="image/*"
                      />
                    </div>
                  </div>
                  <div v-if="uploadStatus">{{ uploadStatus }}</div>
                            <div v-for="file in uploadedFiles" :key="file.url">
                              <img
                                v-if="
                                  file.url.includes('jpg') ||
                                  file.url.includes('png')
                                "
                                :src="file.url"
                                alt="Uploaded File"
                                class="w-80"
                              />  <a
                                :href="file.url"
                                target="_blank"
                                rel="noopener noreferrer"
                                >{{ file.name }}</a
                              >
                            </div>

                            <div
                              v-for="file in selectedFiles"
                              :key="file.url"
                              class="my-4 shadow-lg px-2 py-3 border-2"
                            >
                              <a
                                :href="file.url"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="tracking-tighter"
                                >{{ file.name }}</a
                              >
                              <!-- <span class="ml-3 font-bold"> 
                                
                                {{ (file.size/1024).toFixed(2) }} KB size
                              
                              
                              </span> -->

                              <span class="ml-3 font-bold">
                                {{ (file.size / 1024 / 1024).toFixed(2) }} MB
                                size
                              </span>
                            </div>
                </div>
              </div>
              <div class="w-fit mt-5">
                <button
                  class="w-fit mx-auto block bg-green-800 px-8 py-1.5 rounded-lg text-white"
                >
                  Submit
                </button>
              </div>
            </form>
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
