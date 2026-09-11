<template>
  <div class="w-full border-l lg:flex items-center" :class="[
    i % 2
      ? darkMode
        ? 'bg-gray-800/50'
        : 'bg-gray-100'
      : darkMode
        ? 'bg-gray-900/30'
        : 'bg-white',
    darkMode ? 'border-gray-700' : 'border-gray-200',
  ]">
    <div class="lg:w-8/12 w-full">
      <div class="w-full">
        <div class="w-full text-xs uppercase px-1 flex items-center font-montserrat mt-1" :class="darkMode ? 'text-gray-200' : 'text-black'
          ">
          <i class="fa fa-user mr-2.5 ml-1"></i>
          {{ b.lastname }}, {{ b.firstname }}
          {{ b.middlename }}
        </div>
        <div class="text-[10px] pl-[29px] -mt-1" :class="darkMode ? 'text-gray-400' : 'text-gray-600'
          ">
          {{ b.tracking_id }}
        </div>
      </div>
    </div>

    <div class="w-full text-[10px]">
      <div class="w-fit mx-auto">
        <div class="lg:w-fit mx-auto w-full py-1 lg:flex lg:whitespace-nowrap text-left">
          <button
            class="lg:w-fit w-full px-2 py-1 font-bold cursor-pointer lg:px-5 border-b shadow-lg border-green-500 transition-colors duration-200"
            :class="darkMode
                ? 'text-white bg-green-700 hover:bg-gray-700 hover:text-green-400'
                : 'text-white bg-green-800 hover:bg-white hover:text-green-800'
              " @click="$emit('openChatCommunication', b)">
            <i class="fa fa-comments mr-3"></i>
            <i class="fa fa-file"></i>
          </button>
          <button @click="$emit('openPersonalInfoModal', b)"
            class="w-full lg:text-center text-left px-1.5 py-1 cursor-pointer lg:px-5 border-b shadow-lg border-green-500 transition-colors duration-200"
            :class="[
              verificationStatuses[b.id]
                ? 'bg-green-800 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-green-800 hover:text-white'
                  : 'bg-white text-green-800 hover:bg-green-800 hover:text-white',
            ]">
            Verify
          </button>
          <button
            class="w-full lg:text-center text-left px-1.5 py-1 cursor-pointer lg:px-5 border-b shadow-lg border-green-500 transition-colors duration-200"
            @click="$emit('openPaymentModal', b)" :class="[
              paymentStatuses[b.id]
                ? 'bg-green-800 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-green-800 hover:text-white'
                  : 'bg-white text-green-800 hover:bg-green-800 hover:text-white',
            ]">
            Assessment
          </button>
          <button @click="$emit('openPrepDocModal', b)"
            class="w-full lg:text-center text-left px-1.5 py-1 cursor-pointer lg:px-5 border-b shadow-lg border-green-500 transition-colors duration-200"
            :class="[
              prepDocStatuses[b.id]
                ? 'bg-green-800 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-green-800 hover:text-white'
                  : 'bg-white text-green-800 hover:bg-green-800 hover:text-white',
            ]">
            Preparing
          </button>
          <button @click="$emit('openReleasingDocModal', b)"
            class="w-full lg:text-center text-left px-1.5 py-1 cursor-pointer lg:px-5 border-b shadow-lg border-green-500 transition-colors duration-200"
            :class="[
              releasingDocStatuses[b.id]
                ? 'bg-green-800 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-green-800 hover:text-white'
                  : 'bg-white text-green-800 hover:bg-green-800 hover:text-white',
            ]">
            Releasing
          </button>
          <button @click="$emit('openTransactionClosedModal', b)"
            class="w-full lg:text-center text-left px-1.5 py-1 cursor-pointer lg:px-5 border-b shadow-lg border-green-500 transition-colors duration-200"
            :class="[
              transactionClosedStatuses[b.id]
                ? 'bg-green-800 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-green-800 hover:text-white'
                  : 'bg-white text-green-800 hover:bg-green-800 hover:text-white',
            ]">
            Closed
          </button>

          <button
            class="lg:w-fit w-full px-2 py-1 cursor-pointer border-b shadow-lg border-green-500 transition-colors duration-200"
            :class="darkMode
                ? 'text-green-400 bg-gray-700 hover:bg-green-800 hover:text-white'
                : 'text-green-700 bg-white hover:bg-green-800 hover:text-white'
              " @click="$emit('openLogsModal', b)">
            <i class="fa fa-ellipsis-h"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="w-full flex items-center">
      <div class="text-[10px] font-light whitespace-nowrap">
        <span class="font-semibold uppercase">
          {{ b.course }}
        </span>
      </div>
    </div>


  </div>

</template>

<script setup>
const props = defineProps({
  b: Object,
  i: Number,
  darkMode: Boolean,
  verificationStatuses: Object,
  paymentStatuses: Object,
  prepDocStatuses: Object,
  releasingDocStatuses: Object,
  transactionClosedStatuses: Object,
});

const emit = defineEmits([
  'openChatCommunication',
  'openPersonalInfoModal',
  'openPaymentModal',
  'openPrepDocModal',
  'openReleasingDocModal',
  'openTransactionClosedModal',
  'openLogsModal'
]);
</script>