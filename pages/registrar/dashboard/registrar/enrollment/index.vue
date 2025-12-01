<script setup>
import { onMounted, ref } from "vue";
import { useUserStore } from "@/stores/user";
const router = useRouter();
const userStore = useUserStore();
import _ from "lodash";
const endpoint = ref(userStore.mainDevServer);

let toggleSideBarMenu = ref(true);
let toggleConfirmDelete = ref(false);
let idToBeDeleted = ref();

const emailCBA = ref("cba@lsu.edu.ph");
const emailCCSEA = ref("ccsea@lsu.edu.ph");
const emailCON = ref("con@lsu.edu.ph");
const emailCEA = ref("cea@lsu.edu.ph");
const emailCTHM = ref("cthm@lsu.edu.ph");
const emailCTE = ref("cte@lsu.edu.ph");
const emailCAS = ref("cte@lsu.edu.ph");
const emailGraduateStudies = ref("graduatestudies@lsu.edu.ph");

const emailCBARegistrar = ref("cba.registrar@lsu.edu.ph");
const emailCCSEARegistrar = ref("ccsea.registrar@lsu.edu.ph");
const emailCONRegistrar = ref("onlinerequest@lsu.edu.ph");
const emailCTHMRegistrar = ref("cthm.registrar@lsu.edu.ph");
const emailSGSRegistrar = ref("cthm.registrar@lsu.edu.ph");
const emailCASRegistrar = ref("onlinerequest@lsu.edu.ph");
const emailCTERegistrar = ref("cte.registrar@lsu.edu.ph");
const emailIS = ref("is.registrar@lsu.edu.ph");
const emailBSIT = ref("bsit@lsu.edu.ph");
const emailBSCPE = ref("bscpe@lsu.edu.ph");
const emailBSBA = ref("bsba@lsu.edu.ph");
const emailBSAIS = ref("bsais@lsu.edu.ph");
const emailBSAC = ref("bsac@lsu.edu.ph");
const emailBSCE = ref("bsce@lsu.edu.ph");
const emailBSARCH = ref("bsarch@lsu.edu.ph");
const emailBSEE = ref("bsee@lsu.edu.ph");
const emailBSECE = ref("bsece@lsu.edu.ph");
const emailBSGE = ref("bsge@lsu.edu.ph");
const emailBSCS = ref("bscs@lsu.edu.ph");
const emailBLES = ref("blis@lsu.edu.ph");
const emailBAEL = ref("baels@lsu.edu.ph");
const emailBAPOLSC = ref("bapolsc@lsu.edu.ph");
const emailBSPSYCH = ref("bspsych@lsu.edu.ph'");
const emailBSCRIM = ref("bscrim@lsu.edu.ph");
const emailBSSW = ref("bssw@lsu.edu.ph");
const emailBEED = ref("beed@lsu.edu.ph");
const emailBSED = ref("bsed@lsu.edu.ph");
const emailBSNED = ref("bsned@lsu.edu.ph");
const emailBPED = ref("bped@lsu.edu.ph");
const emailBTLED = ref("btled@lsu.edu.ph");

const emailNPC = ref("npc@lsu.edu.ph");
const emailAdmission = ref("admissions@lsu.edu.ph");
const emailAccounting = ref("accounting@lsu.edu.ph");

const emailRegistrar = ref(userStore.user.registrarEmail);
const developerEmail = ref(userStore.user.developerEmail);
const testEmail = ref(userStore.user.testEmail);


let enrollmentsListFilter = ref(0);
const authorizedRegistrarAdmin = ref(false);


onMounted(async () => {
  const enrollments = await $fetch(endpoint.value + "/api/enrollment/list/").catch((error) => error.data)
  // console.log(enrollments)
  if (
    userStore.user.isAuthenticated &&
    ( userStore.user.email === emailCBARegistrar.value ||
      userStore.user.email === emailCCSEARegistrar.value ||
      userStore.user.email === emailCONRegistrar.value ||
      userStore.user.email === emailCTHMRegistrar.value ||
      userStore.user.email === emailSGSRegistrar.value ||
      userStore.user.email === emailCASRegistrar.value ||
      userStore.user.email === emailCTERegistrar.value ||
      userStore.user.email === emailBSIT.value ||
      userStore.user.email === emailRegistrar.value ||
      userStore.user.email === developerEmail.value ||
      userStore.user.email === testEmail.value
    )
  ) {
    router.push("/registrar");
    switch (userStore.user.email) {
      case emailCBARegistrar.value:
        enrollmentsListFilter.value = enrollments.value.filter((params) => {
          return params.college === "CBA (College of Business and Accountancy)";
        });
        break;
      case emailCCSEARegistrar.value:
        enrollmentsListFilter.value = enrollments.value.filter((params) => {
          return (
            params.college ===
            "CCSEA (College of Computer Science, Engineering, and Architecture)"
          );
        });
        break;
      case emailCONRegistrar.value:
        enrollmentsListFilter.value = enrollments.value.filter((params) => {
          return params.college === "CON (College of Nursing)";
        });
        break;
      case emailCTHMRegistrar.value:
        enrollmentsListFilter.value = enrollments.value.filter((params) => {
          return (
            params.college === "CTHM (College of Tourism and Hospitality Management)"
          );
        });
        break;
      case emailSGSRegistrar.value:
        enrollmentsListFilter.value = enrollments.value.filter((params) => {
          return params.college === "SGS (School of Graduate Studies)";
        });
        break;
      case emailCASRegistrar.value:
        enrollmentsListFilter.value = enrollments.value.filter((params) => {
          return params.college === "CAS (College of Arts and Sciences)";
        });
        break;
      case emailCTERegistrar.value:
        enrollmentsListFilter.value = enrollments.value.filter((params) => {
          return params.college === "CTE (College of Teacher Education)";
        });
        break;
      case emailBSIT.value:
        enrollmentsListFilter.value = enrollments.value.filter((params) => {
          if (
            params.courseProgram ===
            "Bachelor of Science in Information Technology (BSIT)"
          ) {
            return params.isAdmissionConfirmed;
          }
        });
        break;
      default:
        enrollmentsListFilter.value = enrollments || 0;
        toggleSideBarMenu.value = true;
        authorizedRegistrarAdmin.value = true;
    }
  } else {
    router.push("/unauthorized");
    // console.log(enrollments.value);
  }
});


const toggleDeleteBtn = (id) => {
  toggleConfirmDelete.value = !toggleConfirmDelete.value;
  idToBeDeleted.value = id;
  // console.log(id);
};

const deleteEnrollment = async () => {
  await $fetch(endpoint.value + "/api/enrollment/" + idToBeDeleted.value + "/delete/", {
    method: "DELETE",
    headers: {
      Authorization: userStore.user.token,
      "Content-Type": "application/json",
      // 'Access-Control-Allow-Origin': 'lsu.edu.ph',
    },
  })
    .then(async (response) => {
      // console.log("response", response);
      router.go();
      toggleConfirmDelete.value = !toggleConfirmDelete.value;
    })
}

const goToEdit = (id) => {
  // router.push("/registrar/enrollment/edit/" + id);
};

const logOut = () => {
  router.push("/registrar/login");
  userStore.removeToken();
};



</script>
<template>
  <div class="">
    <div class="flex">
      <div
        class="pt-7 pb-24 w-3/12 px-1 bg-gray-100 lg:block hidden"
        v-show="toggleSideBarMenu"
      >
        <RegistrarMenuBar />
      </div>
      <div class="w-full min-h-screen">
        <div class="bg-green-800">
          <div class="lg:flex mx-auto justify-between py-2 px-3.5">
            <div class="lg:flex items-center text-white lg:gap-5">
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
            <button @click="logOut" class="flex hover:font-boldn pt-1">
              <i class="fa fa-sign-out text-white text-xl"></i>
              <h1 class="text-xs text-white p-1.5">Log Out</h1>
            </button>
          </div>
        </div>
        <div class="px-3">
          <div class="">
            <a
              href="/"
              class="shadow text-center uppercase my-3 px-4 py-1 bg-green-900 font-semibold text-sm text-white rounded-md whitespace-nowrap block w-fit"
            >
              Create
            </a>
          </div>
          <div class="w-full">
            <div>
              <div class="appointment-lists shadow mx-auto text-xs">
                <div class="">
                  <div
                    class="header w-full p-2 bg-green-800 text-white flex items-center"
                  >
                    <ul class="flex w-full justify-evenly text-center whitespace-nowrap">
                      <li class="w-5">No.</li>
                      <li class="w-1/2">Student Id</li>
                      <li class="lg:w-20 w-1/3">Action</li>
                    </ul>
                  </div>
                  <div v-if="pending">Loading ...</div>
                  <div v-else>
                    <div class="w-full rows" v-if="enrollmentsListFilter.length > 0">
                      <ul
                        class="flex w-full justify-evenly text-center items-center h-auto border-b border-gray-100"
                        v-for="(enrollment, i) in _.orderBy(
                          enrollmentsListFilter,
                          'id',
                          'asc'
                        )"
                        :key="i"
                      >
                        <li class="px-2 w-5">{{ enrollment.id }}</li>
                        <li class="px-2 w-1/2">{{ enrollment.studentId }}</li>
                        <li
                          class="flex px-2 font-bold justify-center gap-5 lg:w-20 w-1/3"
                        >
                          <div class="mx-auto lg:flex justify-center">
                            <button @click="goToEdit(enrollment.id)">
                              <i
                                class="fa fa-edit text-yellow-500 rounded-lg uppercase text-xl hover:text-3xl"
                                aria-hidden="true"
                              ></i>
                            </button>
                          </div>
                          <div class="mx-auto lg:flex justify-center">
                            <button @click="toggleDeleteBtn(enrollment.id)">
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
                            @click="deleteEnrollment"
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
                      Clear or Empty!
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
</template>

<style lang="scss" scoped></style>
