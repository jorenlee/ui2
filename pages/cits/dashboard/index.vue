<script setup>
  import {
    onMounted,
    ref
  } from "vue";
  import {
    useUserStore
  } from "@/stores/user";
  import moment from "moment";
  const router = useRouter();
  const userStore = useUserStore();
  import _ from "lodash";
  const endpoint = ref(userStore.mainDevServer);
  const listItems = ref(0);
  let deleteIDItem = ref();
  let updateIDItem = ref();
  let tableDisplay = ref(true);
  let toggleSideBarMenu = ref(false);
  let toggleConfirmDelete = ref(false);
  const confirmModal = ref(false);
  const selectedItem = ref(null);
  const toggleListsName = ref(false);
  const displayListName = ref([])
  onMounted(() => {
    setTimeout(async () => {
      if (userStore.user.isAuthenticated && (userStore.user.email === "jorenleeluna24@gmail.com" || userStore.user.email === "jorenlee.luna@lsu.edu.ph")) {
        listItems.value = await $fetch(endpoint.value + "/api/cits/directory/list").catch((error) => error.data) || 0;
        router.push("/");
        console.log(listItems.value)
      } else {
        router.push("/unauthorized");
      }
    }, 5000)
  });
  const toggleDeleteBtn = (id) => {
    toggleConfirmDelete.value = !toggleConfirmDelete.value;
    deleteIDItem.value = id;
  };
  const deleteItem = async () => {
    await $fetch(endpoint.value + "/api/campus-pass/" + deleteIDItem.value + "/delete/", {
      method: "DELETE",
      headers: {
        Authorization: userStore.user.token,
        "Content-Type": "application/json",
      },
    }).then(async (response) => {
      console.log("response", response);
      listItems.value = await $fetch(endpoint.value + "/api/campus-pass/list").catch((error) => error.data) || 0;
      toggleConfirmDelete.value = !toggleConfirmDelete.value;
    })
  }
  const logOut = () => {
    userStore.removeToken();
    // router.push("/_/campus-pass-admin");
  };
</script>
<template>
  <div>
    <div class="lg:flex min-h-screen">
      <div class="pb-3 lg:w-3/12 bg-gray-100 z-10 w-full lg:block lg:static absolute lg:min-h-auto min-h-[700px] lg:h-auto h-screen" v-show="toggleSideBarMenu">
        <div class="flex items-center justify-center  text-white bg-green-900 lg:py-[16px] py-[8px]">
          <div class="flex items-center w-full px-2">
            <i class="fa fa-user mx-2" aria-hidden="true"></i>
            <h1 class="text-sm">
              {{ userStore.user.email }}
            </h1>
          </div>
          <div @click="toggleSideBarMenu = !toggleSideBarMenu" class="w-10 px-1.5 lg:hidden flex">
            <i class="fa text-3xl text-white" :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars'" aria-hidden="true"></i>
          </div>
        </div>
        <div class="">
          <div class="w-fit mx-auto mt-5 mb-3">
            <img src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/LSU_Seal.PNG" class="lg:w-24 w-20 mx-auto" />
          </div>
          <div class="text-center">
            <h1 class="font-bold text-green-800 text-2xl">Dashboard</h1>
          </div>
          <div class="mx-auto mt-10 mb-5 grid grid-cols-1 lg:tracking-tight font-bold">
            <a href="/" class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 text-left text-black hover:bg-black hover:text-white">
              <i class="fa fa-list mr-3" aria-hidden="true"></i> All Request Lists </a>
            <a href="/" 
                class="pl-12 text-xs mx-auto mb-2 w-full capitalize whitespace-nowrap px-5 py-1 text-left
                hover:bg-black hover:text-white">
              <i class="fa fa-square mr-0.5" aria-hidden="true"></i> Campus 1 (Main Campus)
            </a>
            <a href="/" 
                class="pl-12 text-xs mx-auto mb-2 w-full capitalize whitespace-nowrap px-5 py-1 text-left
                hover:bg-black hover:text-white">
              <i class="fa fa-square mr-0.5" aria-hidden="true"></i> Campus 2 (IS Campus) </a>
            <a href="/" 
                class="pl-12 text-xs mx-auto mb-2 w-full capitalize whitespace-nowrap px-5 py-1 text-left
                hover:bg-black hover:text-white">
              <i class="fa fa-square mr-0.5" aria-hidden="true"></i> Emergency Hotline </a>
            <a href="/" class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 text-left
            hover:bg-black hover:text-white ">
              <i class="fa fa-globe mr-3" aria-hidden="true"></i> LSU HOME PAGE </a>
          </div>
        </div>
      </div>
      <div class="w-full">
        <div class="bg-green-800">
          <div class="flex mx-auto justify-between py-2 px-3.5">
            <div @click="toggleSideBarMenu = !toggleSideBarMenu" class="w-10 px-1.5">
              <i class="fa text-3xl text-white" :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars'" aria-hidden="true"></i>
            </div>
            <button @click="logOut" class="flex hover:font-bold pt-1">
              <i class="fa fa-sign-out text-white text-xl"></i>
              <h1 class="text-xs text-white p-1.5">Log Out</h1>
            </button>
          </div>
        </div>
        <div>
          <div class="w-full lg:p-5 px-2 py-2">
            <div v-show="tableDisplay">
              <div class="w-full shadow bg-gray-100 text-green-900 font-bold px-2 text-center mb-3 py-2 text-xs uppercase"> All Request Lists </div>
              <div class="relative">
                <div class="appointment-lists mx-auto text-xs">
                  <div class="">
                    <div class="lg:flex hidden bg-green-800 text-white pb-2 pt-2.5 gap-x-7 px-3">
                      <div class="w-full mx-auto text-center font-bold text-sm"> Office </div>
                      <div class="w-full mx-auto text-center font-bold text-sm"> Location </div>
                      <div class="w-full mx-auto text-center font-bold text-sm"> Local Tel No. </div>
                      <div class="w-full mx-auto text-center font-bold text-sm"> Mobile No. </div>
                      <div class="w-full mx-auto text-center font-bold text-sm"> Email </div>
                      <div class="w-full mx-auto text-center font-bold text-sm"> Campus </div>
                    </div>
                    <div class="lg:border text-xs lg:rounded-none rounded-lg lg:shadow" 
                        v-if="listItems.length > 0">
                      <div class=" lg:flex justify-evenly text-left items-center h-auto px-3 gap-x-7 border-gray-200 lg:py-1 py-3 lg:mb-0 mb-5 lg:border-y border lg:shadow-none shadow-md lg:bg-gray-50 bg-gray-100" v-for="(b, i) in _.orderBy(listItems, 'id', 'asc')" :key="i">
                        <div class="w-full mx-auto lg:my-2 mb-2">
                            <div class="mb-1 lg:hidden block font-bold"> 
                                Office
                            </div>
                      
                      
                          <textarea  v-model="b.office" disabled 
                          class="shadow-md rounded-sm h-[25px] w-full mx-auto py-1.5 px-2"></textarea>
                          
                        </div>
                        <div class="w-full mx-auto lg:my-2 mb-2">
                       
                          <div class="mb-1 lg:hidden block font-bold"> 
                                Location
                            </div>
                          <textarea  v-model="b.location"  class="shadow-md rounded-sm h-[25px] w-full mx-auto lg:py-1 py-0.5 px-2"></textarea>
                        </div>
                        <div class="w-full mx-auto lg:my-2 mb-2">
                          <!-- <div class="" v-for="(j,i) in b.local_tel_no" :key="i">
                            <div class="rounded-sm py-1">
                              {{j }}
                            </div>
                          </div> -->
                          <div class="mb-1 lg:hidden block font-bold"> 
                                Local Tel No.
                            </div>

                            <div class=" lg:block flex gap-x-2"> 
                            <input v-model="b.local_tel_no[0]" 
                            class="rounded-sm shadow-md  lg:py-1 py-0.5 h-6 px-2 w-full mb-1"/>
                          <input v-model="b.local_tel_no[1]" 
                            class="rounded-sm shadow-md  lg:py-1 py-0.5 h-6 px-2 w-full"/>
                         </div>
                        </div>
                        <div class=" w-full mx-auto lg:my-2 mb-2">
                          <!-- <div class="" v-for="(j,i) in b.mobile_no" :key="i">
                            <div class="rounded-sm py-1">
                              {{j }}
                            </div>
                          </div> -->
                          <div class="mb-1 lg:hidden block font-bold"> 
                               Mobile Number
                            </div>
                            <div class=" lg:block flex gap-x-2"> 
                            <input v-model="b.mobile_no[0]" 
                            class="rounded-sm shadow-md  lg:py-1 py-0.5 h-6 px-2 w-full mb-1"/>
                          <input v-model="b.mobile_no[1]" 
                            class="rounded-sm shadow-md  lg:py-1 py-0.5 h-6 px-2 w-full"/>
                        </div>
                        </div>

                        <div class=" w-full mx-auto lg:my-2 mb-2">
                          <!-- <div class="" v-for="(j,i) in b.email_address" :key="i">
                            <div class="rounded-sm py-1">
                              {{j }}
                            </div>
                          </div> -->
                          <div class="mb-1 lg:hidden block font-bold"> 
                              Email Address
                            </div>
                            <div class=""> 

                            <input v-model="b.email_address[0]" 
                            class="rounded-sm shadow-md  py-1 px-2 w-full mb-1"/>
                            <!-- v-if="b.email_address[1]" -->
                          <input v-model="b.email_address[1]" 
                            
                            class="rounded-sm shadow-md  py-1 px-2 w-full"/>


                         </div>

                        </div>
                        <div class="w-full mx-auto ">
                            <div class="mb-1 lg:hidden block font-bold"> 
                              Area
                            </div>

                         <div class=""> 
                         
                          

                            <textarea  v-model="b.campus" disabled 
                            class="shadow-md rounded-sm h-[25px] w-full mx-auto py-1.5 px-2"></textarea>



                         </div>
                        </div>
                      </div>
                      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#ffffff59] w-full h-screen flex items-center" v-show="confirmModal">
                        <div class="w-fit mx-auto flex items-center shadow-2xl border-2 rounded-lg py-2 bg-white">
                          <div class="flex items-center">
                            <div class="font-bold pl-5 pr-10">Confirm Remarks: </div>
                            <div class="flex gap-10 mr-10">
                              <span class="px-3 uppercase py-1 rounded-lg bg-green-900 border hover:border-green-900 hover:bg-white hover:text-green-900 text-white font-bold cursor-pointer" @click="btnConfirm">yes</span>
                              <span class="px-3 uppercase py-1 rounded-lg bg-red-700 border hover:border-red-700 hover:bg-white hover:text-green-900 text-white font-bold cursor-pointer" @click="btnCloseModal">no</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="px-5 rounded-lg bg-white shadow-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" v-show="toggleConfirmDelete">
                        <div class="my-6">Are you sure you want to Delete?</div>
                        <div class="flex gap-5 mx-auto w-fit my-5">
                          <span class="bg-green-900 text-white px-3 py-1 rounded-lg cursor-pointer" @click="deleteItem">Yes</span>
                          <span class="bg-red-900 text-white px-3 py-1 rounded-lg cursor-pointer" @click="toggleDeleteBtn">Cancel</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="listItems.length === 0" class="italic text-gray-400 text-center p-1 h-screen"> Please Wait ... </div>
                  <div v-else class="italic text-gray-400 text-center p-1 h-screen" :class="listItems.length > 0 ? 'hidden' : ''"> No Results Found! </div>
                </div>
                <!-- <div class="mx-auto w-4/12 text-center mt-5 text-gray-400 mb-3"><div class="inline-flex gap-5"><button
                      class="bg-green-800 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-l"
                      @click="prevBtn"
                    >
                      Prev
                    </button><button class="bg-green-800 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-l"
                    @click="currentBtn">
                      1
                    </button><button class="bg-green-800 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-l">
                      2
                    </button><button class="bg-green-800 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-l">
                      3
                    </button><button
                      class="bg-green-800 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-r"
                    @click="nextBtn">
                      Next
                    </button></div></div> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="static bottom-0 w-full">
      <DashboardFooter />
    </div>
  </div>
</template>
<style scoped>
  input[type="checkbox"] {
    color: #116f00;
  }
</style>