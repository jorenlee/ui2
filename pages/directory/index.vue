<script setup>
  import jsonData from "./data.json";
  const config = useRuntimeConfig();
  const endpoint = ref(config.public.apiUrl);
  const directory_campus1 = ref(jsonData.directory_campus1);
  const directory_campus2 = ref(jsonData.directory_campus2);
  const hotlineNumbers = ref(null);
  onMounted(async () => {
    hotlineNumbers.value = await $fetch(
      endpoint.value + "/api/cits/lsu-hotline-numbers/list/"
    ).catch((error) => error.data);
  })
</script>

<template>
  <div>
    <Header />
    <div class="">
      <div class="relative">
        <Banner />
        <img
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
          class="align-top w-full h-36 object-none lg:hidden block" />
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1 class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto">
            university directory
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul class="flex flex-wrap lasalle-green-text capitalize w-11/12 mx-auto text-xs">
            <li>
              <a href="/" class="mr-1"> Home </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="#" class="mr-1"> University Directory </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div>
      <div class="mx-auto w-11/12 text-green-900 font-bold mb-3 lg:mt-3">
        <h1 class="g:text-2xl text-base uppercase lg:text-left text-center">
          CAMPUS 1 (MAIN CAMPUS)
        </h1>
      </div>
      <div class="w-11/12 mx-auto mb-3">
        <div class="shadow-lg w-full table-auto lg:text-sm text-xs">
          <div class="lg:block hidden border-y-4 border-grey-900">
            <div class="uppercase lg:flex text-left">
              <div class="lg:py-1 lg:w-6/12 px-5 py-1">OFFICE</div>
              <div class="lg:py-1 lg:w-2/12 px-3 py-1 text-left pl-10">LOCATION</div>
              <div class="lg:py-1 lg:w-3/12 px-3 py-1 text-center">MOBILE NO.</div>
              <div class="lg:py-1 lg:w-3/12 px-3 py-1 text-left">EMAIL ADDRESS</div>
            </div>
          </div>
          <div class="text-sm lg:border-none border-t-4 border-grey-900">
            <div class="border-b border-grey-900 lg:flex text-left lg:py-0 py-1" v-for="(d, i) in directory_campus1"
              :key="i">
              <div class="font-bold lg:py-1 lg:w-6/12 lg:px-5 px-3">
                {{ d.office }}
              </div>
              <div class="lg:py-1 lg:w-2/12 px-3 lg:text-left lg:pl-10">
                {{ d.location }}
              </div>
              <div class="lg:py-1 lg:w-3/12 px-3 lg:text-center">
                <div class="">
                  <div class="whitespace-nowrap" v-for="(dd, i) in d.mobile_no" :key="i">
                    {{ dd }}
                  </div>
                </div>
              </div>
              <div class="lg:py-1 lg:w-3/12 px-3 lg:text-left">
                <div class="">
                  <div class="whitespace-nowrap" v-for="(dd, i) in d.email_address" :key="i">
                    {{ dd }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div class="mx-auto w-11/12 text-green-900 font-bold mb-2 lg:mt-10 mt-3">
        <h1 class="lg:text-2xl text-base uppercase lg:text-left text-center">
          Campus 2 (IS Campus)
        </h1>
      </div>
      <div class="w-11/12 mx-auto lg:mb-14 mb-5">
        <div class="shadow-lg w-full table-auto lg:text-sm text-xs">
          <div class="lg:block hidden border-y-4 border-grey-900">
            <div class="uppercase lg:flex text-left">
              <div class="lg:py-1 lg:w-6/12 px-5 py-1">OFFICE</div>
              <div class="lg:py-1 lg:w-2/12 px-3 py-1 text-left pl-10">LOCATION</div>
              <div class="lg:py-1 lg:w-3/12 px-3 py-1 text-center">MOBILE NO.</div>
              <div class="lg:py-1 lg:w-3/12 px-3 py-1 text-left">EMAIL ADDRESS</div>
            </div>
          </div>
          <div class="text-sm lg:border-none border-t-4 border-grey-900">
            <div class="border-b border-grey-900 lg:flex text-left lg:py-0 py-1" v-for="(d, i) in directory_campus2"
              :key="i">
              <div class="font-bold lg:py-1 lg:w-6/12 lg:px-5 px-3">
                {{ d.office }}
              </div>
              <div class="lg:py-1 lg:w-2/12 px-3 lg:text-left lg:pl-10">
                {{ d.location }}
              </div>
              <div class="lg:py-1 lg:w-3/12 px-3 lg:text-center">
                <div class="">
                  <div class="whitespace-nowrap" v-for="(dd, i) in d.mobile_no" :key="i">
                    {{ dd }}
                  </div>
                </div>
              </div>
              <div class="lg:py-1 lg:w-3/12 px-3 lg:text-left pl-3">
                <div class="">
                  <div class="whitespace-nowrap" v-for="(dd, i) in d.email_address" :key="i">
                    {{ dd }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="EmergencyHotlines">
      <div class="bg-red-100 mx-auto lg:w-8/12 w-11/12 text-green-900 font-bold lg:mt-10 mt-3 py-2 ">
        <p class="lg:text-sm text-base uppercase lg:text-center w-11/12 mx-auto">In case of emergency:</p>
        <p class="lg:text-sm text-base capitalize lg:text-center w-11/12 mx-auto leading-tight">Please call or text the following emergency
          hotline numbers | Ozamiz</p>
      </div>
      <div class="bg-red-100 lg:w-8/12 w-11/12 mx-auto lg:mb-14 mb-5 shadow">
        <div class="shadow-lg w-full table-auto lg:text-sm text-xs">
          <div class="lg:block hidden border-y-2 border-gray-100">
            <div class="uppercase lg:flex text-left">
              <div class="lg:py-1 lg:w-4/12 px-5 py-1">OFFICE</div>
              <div class="lg:py-1 lg:w-5/12 px-3 py-1 whitespace-nowrap uppercase">Contact Number</div>
              <div class="lg:py-1 lg:w-2/12 px-3 py-1 text-center whitespace-nowrap">MOBILE NO.</div>
            </div>
          </div>
          <div class="text-sm lg:border-none border-t-4 border-gray-100">
            <div class="border-b border-gray-100 lg:flex text-left lg:py-0 py-1 items-center" v-for="(d, i) in hotlineNumbers"
              :key="i">
              <div class="font-bold lg:py-1 lg:w-4/12 lg:px-5 px-3">
                {{ d.office }}
              </div>
              <div class="lg:py-1 lg:w-5/12 px-3">
                <div class="">
                  <div class="" v-for="(dd, i) in d.local_tel_no" :key="i">
                    {{ dd }}
                  </div>
                </div>
              </div>
              <div class="lg:py-1 lg:w-2/12 px-3">
                <div class="">
                  <div class="whitespace-nowrap lg:text-center " v-for="(dd, i) in d.mobile_no" :key="i">
                    {{ dd }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>