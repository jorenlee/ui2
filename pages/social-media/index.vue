<script setup>
  import { useUserStore } from "@/stores/user";
  const userStore = useUserStore();
  const endpoint = ref(userStore.mainDevServer);
  const socialMedias = ref(null);

  onMounted(async () => {
    socialMedias.value = await $fetch(
      endpoint.value + "/api/cits/lsu-social-media-links/list/"
    ).catch((error) => error.data);
  })
</script>

<template>
  <div>
    <Header />
    <div class="lg:pt-16 pt-12 mb-10">
      <div class="">
        <div class="bg-green-900">
          <div class="pt-[40px] pb-[30px] w-11/12 mx-auto text-white">
          <h1 class="text-lg uppercase font-bold tracking-wider">Social Media</h1>
        </div>
        </div>
        <div class="shadow-lg border-b">
          <ul class="flex text-green-800 capitalize mx-auto text-xs w-11/12 py-2">
            <li>
              <a href="/" class="mr-1"> Home </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/social-media" class="mr-1"> Social Media </a>
            </li>
          </ul>
        </div>
      </div>
      <div class="w-11/12 mx-auto pt-10 font-bold text-green-800 text-center mb-3">
        Facebook Pages
      </div>
      <div class="w-11/12 mx-auto gap-5 justify-center">
        <div class="w-fit mx-auto" v-for="(j, i) in socialMedias" :key="i">
          <div class="pt-3 w-[200px] rounded-lg px-3 hover:shadow-lg" :class="j.category === 'Institution' ? '' : 'hidden'">
            <a :href="j.social_media_link" target="_blank" class="text-center w-3/12">
              <img :src="j.social_media_logo_link" class="w-[100px] h-[100px] rounded-full mb-2 mx-auto shadow-lg hover:border-4 hover:border-green-900" />
              <div class="flex items-center h-[40px]">
                <p class="text-green-900 font-700 text-xs font-semibold mx-auto">{{ j.social_media_name }}</p>
              </div>
            </a>
          </div>
        </div>
      </div>
      <div class="w-10/12 flex flex-wrap mx-auto mt-3.5 lg:border-t-2 border-gray-100 justify-center lg:pt-5">
        <div class="my-3" v-for="(j, i) in socialMedias" :key="i">
          <div class="mx-auto py-3 w-[300px] rounded-lg hover:shadow-lg px-10" :class="j.category === 'College' ? '' : 'hidden'">
            <a :href="j.social_media_link" target="_blank" class="text-center">
              <img :src="j.social_media_logo_link" class="border w-[100px] h-[100px] rounded-full mb-2 mx-auto shadow-lg hover:border-4 hover:border-green-900" />
              <div class="flex items-center h-[40px] justify-center mt-4">
                <p class="text-green-900 font-700 text-xs font-semibold">{{ j.social_media_name }}</p>
              </div>
            </a>
          </div>
        </div>
      </div>
      <div class="w-8/12 mx-auto gap-5 justify-center lg:border-t pt-5">
        <div class="w-fit mx-auto" v-for="(j, i) in socialMedias" :key="i">
          <div class="py-3 w-[200px] rounded-lg px-3 hover:shadow-lg" :class="j.category === 'Graduate Studies' ? '' : 'hidden'">
            <a :href="j.social_media_link" target="_blank" class="text-center w-3/12">
              <img :src="j.social_media_logo_link" class="w-[100px] h-[100px] rounded-full mb-2 mx-auto shadow-lg hover:border-4 hover:border-green-900" />
              <div class="flex items-center h-[40px]">
                <p class="text-green-900 font-700 text-xs font-semibold mx-auto">{{ j.social_media_name }}</p>
              </div>
            </a>
          </div>
        </div>
      </div>
      <div class="w-10/12 flex flex-wrap mx-auto mt-3 lg:border-t-2 border-gray-100 justify-center lg:pt-5">
        <div class="my-3" v-for="(j, i) in socialMedias" :key="i">
          <div class="mx-auto py-3 w-[300px] rounded-lg hover:shadow-lg px-10" :class="j.category === 'Other' ? '' : 'hidden'">
            <a :href="j.social_media_link" target="_blank" class="text-center">
              <img :src="j.social_media_logo_link" class="border w-[100px] h-[100px] rounded-full mb-2 mx-auto shadow-lg hover:border-4 hover:border-green-900" />
              <div class="flex items-center h-[40px] justify-center mt-4">
                <p class="text-green-900 font-700 text-xs font-semibold">{{ j.social_media_name }}</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<style>
</style>