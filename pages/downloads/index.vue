<script setup>
  import volumesJSON from "../research/volumes.json";
  import { useUserStore } from "~/stores/user";
  const userStore = useUserStore();
  const endpoint = ref(userStore.mainDevServer);
  const volumes = ref(volumesJSON.volumes);

  const downloadFile = ref(0);

  onMounted(async() => {
    downloadFile.value = await $fetch(endpoint.value + "/api/cits/lsu-download-file/list/").catch((error) => error.data) || 0;
  })

</script>

<template>
  <div class="">
    <Header />
    <div class="lg:pt-24 pt-20 pb-5 lg:w-11/12 mx-auto text-center">
      <h1
        class="text-lg text-green-900 uppercase border-y-2 border-green-900 py-2 w-11/12 mx-auto">
        Downloads
      </h1>
      <div class="shadow-xl rounded-3xl lg:w-11/12 mx-auto">
        <h1 class="text-base text-green-900 mt-3 mb-4 w-8/12 mx-auto font-bold pt-10 pb-5 uppercase">
          Forms
        </h1>
        <ul class="flex flex-wrap gap-5 mb-10 pb-10 mx-auto w-full justify-left lg:grid lg:grid-cols-2 text-sm" v-if="downloadFile">
          <li
            class="flex shadow py-2 px-3 rounded-lg mb-4 text-green-900 font-semibold mx-6 lg:w-auto w-full text-left"
            v-for="(d, i) in downloadFile"
            :key="i">
            <i class="mr-5 fa fa-download mt-1" aria-hidden="true"></i>
            <a :href="d.file_name" download target="_blank" class="">{{ d.title }}</a>
          </li>
        </ul>
      </div>
   
    </div>
    <Footer />
  </div>
</template>

<style scoped></style>
