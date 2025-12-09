<template>
  <div>
    <ul class="w-full">
      <li class="w-full">
        <span
          class="bg-green-800 uppercase text-white px-5 py-2 font-bold flex border-b-2 text-base"
        >
          {{ title }}
        </span>

        <ul>
          <li v-for="(item, i) in items" :key="i">
            <a
              :href="item.link"
              class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1
                     font-bold flex border-b pl-5 hover:bg-green-800 text-green-800
                     hover:text-white text-xs cursor-pointer"
            >
              <i class="fa fa-chevron-circle-right mr-2"></i>
              {{ item.label }}
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
});
</script>
