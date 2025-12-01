<script setup>
import { useUserStore } from "@/stores/user";
const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);

const donationLogs = ref(null);
const totalAmount = ref(0);
const totaAmountRounded = ref(0);
const formatter = new Intl.NumberFormat("en-US");
const totaAmountRoundedFormatted = ref();

donationLogs.value = await $fetch(
  endpoint.value + "/api/investiture/list/"
).catch((error) => error.data);
totalAmount.value = donationLogs.value
  .map((item) => item.amount)
  .reduce((prev, curr) => prev + curr, 0);
totaAmountRounded.value = totalAmount.value.toFixed(2);
totaAmountRoundedFormatted.value = formatter.format(totaAmountRounded.value);
</script>

<template>
  <div class="lg:text-lg text-xs">
    PHP {{ totaAmountRoundedFormatted }} <span class="ml-1">raised</span>
  </div>
</template>
