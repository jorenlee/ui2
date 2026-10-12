<script setup lang="ts">
import { ref, computed } from 'vue'

type PaymentMethod = 'gcash' | 'maya' | 'bank' | 'international'

const selectedMethod = ref<PaymentMethod>('gcash')
const receipt = ref<File | null>(null)
const isSubmitting = ref(false)
const paymentSubmitted = ref(false)

const payment = ref({
  reference: 'PAY-2026-000128',
  description: 'Event Registration',
  customer: 'Juan Dela Cruz',
  email: 'customer@example.com',
  amount: 1400,
  currency: 'PHP',
})

const methods = [
  {
    id: 'gcash',
    name: 'GCash',
    description: 'Pay using GCash',
    icon: 'fa-solid fa-wallet',
    color: 'text-blue-600',
    background: 'bg-blue-50',
  },
  {
    id: 'maya',
    name: 'Maya',
    description: 'Pay using Maya',
    icon: 'fa-solid fa-mobile-screen-button',
    color: 'text-emerald-600',
    background: 'bg-emerald-50',
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    description: 'Transfer through your bank',
    icon: 'fa-solid fa-building-columns',
    color: 'text-indigo-600',
    background: 'bg-indigo-50',
  },
  {
    id: 'international',
    name: 'International',
    description: 'Payment options from overseas',
    icon: 'fa-solid fa-globe',
    color: 'text-violet-600',
    background: 'bg-violet-50',
  },
] as const

// Replace these values with data returned by Django.
// Only enable payment methods for which Accounting has
// supplied valid receiving instructions.

const paymentAccounts = {
  gcash: {
    accountName: 'Accounting Office',
    accountNumber: '09XX XXX XXXX',
    qr: '/payment-qr/gcash.png',
    instructions: 'Scan the QR code using your GCash app.',
    available: true,
  },
  maya: {
    accountName: 'Accounting Office',
    accountNumber: '',
    qr: '',
    instructions: 'Maya payment instructions are not yet available.',
    available: false,
  },
  bank: {
    accountName: 'Accounting Office',
    accountNumber: '',
    qr: '',
    instructions: 'Bank transfer instructions are not yet available.',
    available: false,
  },
  international: {
    accountName: '',
    accountNumber: '',
    qr: '',
    instructions:
      'Please contact the Accounting Office for supported international payment methods.',
    available: false,
  },
}

const currentAccount = computed(() => paymentAccounts[selectedMethod.value])

const formattedAmount = computed(() =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: payment.value.currency,
  }).format(payment.value.amount)
)

function selectMethod(method: PaymentMethod) {
  selectedMethod.value = method
  receipt.value = null
}

function handleFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']

  if (!allowedTypes.includes(file.type)) {
    alert('Please upload a JPG, PNG, or PDF file.')
    input.value = ''
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('The maximum file size is 5MB.')
    input.value = ''
    return
  }

  receipt.value = file
}

async function submitPayment() {
  if (!receipt.value || !currentAccount.value.available) return

  isSubmitting.value = true

  try {
    const formData = new FormData()

    formData.append('reference', payment.value.reference)
    formData.append('payment_method', selectedMethod.value)
    formData.append('receipt', receipt.value)

    // Connect to your Django REST Framework endpoint.
    // The backend must derive the amount and payment
    // account from the authenticated payment record.
    await $fetch('/api/payments/submit/', {
      method: 'POST',
      body: formData,
    })

    paymentSubmitted.value = true
  } catch (error) {
    console.error(error)
    alert('Unable to submit your receipt. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

useHead({
  title: 'Secure Payment Checkout',
  link: [
    {
      rel: 'stylesheet',
      href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
    },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">

    <!-- Header -->
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">

        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 text-white">
            <i class="fa-solid fa-shield-halved text-lg"></i>
          </div>

          <div>
            <h1 class="text-lg font-extrabold tracking-tight">
              Payment Checkout
            </h1>
            <p class="text-xs text-slate-500">
              Secure receipt submission
            </p>
          </div>
        </div>

        <div class="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
          <i class="fa-solid fa-lock text-emerald-600"></i>
          Encrypted Connection
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-5 py-10">

      <!-- Success -->
      <div
        v-if="paymentSubmitted"
        class="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm"
      >
        <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <i class="fa-solid fa-check text-3xl"></i>
        </div>

        <h2 class="text-2xl font-extrabold">
          Receipt Submitted
        </h2>

        <p class="mt-3 text-sm leading-7 text-slate-500">
          Your payment receipt has been received and is awaiting verification
          by the Accounting Office.
        </p>

        <div class="mt-7 rounded-2xl bg-amber-50 p-5">
          <div class="flex items-center justify-center gap-2 text-sm font-bold text-amber-700">
            <i class="fa-solid fa-clock"></i>
            Pending Verification
          </div>
        </div>

        <p class="mt-6 text-xs text-slate-500">
          Reference: {{ payment.reference }}
        </p>
      </div>

      <template v-else>

        <div class="mb-9">
          <div class="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <i class="fa-solid fa-credit-card"></i>
            Payment
          </div>

          <h2 class="text-3xl font-extrabold tracking-tight">
            Complete your payment
          </h2>

          <p class="mt-2 text-sm text-slate-500">
            Select your preferred payment method and follow the instructions below.
          </p>
        </div>

        <div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">

          <!-- Payment Selection -->
          <section class="space-y-6 lg:col-span-2">

            <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

              <div class="mb-7 flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-extrabold">
                    Payment Method
                  </h3>
                  <p class="mt-1 text-sm text-slate-500">
                    Choose how you want to pay.
                  </p>
                </div>

                <i class="fa-solid fa-wallet text-xl text-slate-300"></i>
              </div>

              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">

                <button
                  v-for="method in methods"
                  :key="method.id"
                  type="button"
                  @click="selectMethod(method.id)"
                  class="flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all"
                  :class="
                    selectedMethod === method.id
                      ? 'border-emerald-600 bg-emerald-50/50'
                      : 'border-slate-100 hover:border-slate-300'
                  "
                >
                  <div
                    class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                    :class="[method.background, method.color]"
                  >
                    <i :class="method.icon" class="text-xl"></i>
                  </div>

                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-bold">
                      {{ method.name }}
                    </p>
                    <p class="mt-1 text-xs text-slate-500">
                      {{ method.description }}
                    </p>
                  </div>

                  <i
                    v-if="selectedMethod === method.id"
                    class="fa-solid fa-circle-check text-emerald-600"
                  ></i>
                </button>

              </div>

              <!-- QR Payment -->
              <div class="mt-8 border-t border-slate-100 pt-8">

                <template v-if="currentAccount.available">

                  <div class="text-center">
                    <h4 class="text-lg font-extrabold">
                      Scan to Pay
                    </h4>

                    <p class="mt-2 text-sm text-slate-500">
                      {{ currentAccount.instructions }}
                    </p>

                    <div class="mx-auto mt-7 inline-block rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                      <img
                        :src="currentAccount.qr"
                        alt="Accounting Office payment QR code"
                        class="h-56 w-56 object-contain sm:h-64 sm:w-64"
                      />
                    </div>

                    <p class="mt-5 text-xs font-medium text-slate-500">
                      Amount to Pay
                    </p>

                    <p class="mt-1 text-3xl font-black text-emerald-700">
                      {{ formattedAmount }}
                    </p>
                  </div>

                  <div class="mt-8 rounded-2xl bg-slate-50 p-5">
                    <p class="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Receiving Account
                    </p>

                    <div class="space-y-4">
                      <div>
                        <p class="text-xs text-slate-500">Account Name</p>
                        <p class="mt-1 text-sm font-bold">
                          {{ currentAccount.accountName }}
                        </p>
                      </div>

                      <div v-if="currentAccount.accountNumber">
                        <p class="text-xs text-slate-500">Account Number</p>
                        <p class="mt-1 text-sm font-bold">
                          {{ currentAccount.accountNumber }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Instructions -->
                  <div class="mt-7">
                    <h4 class="mb-4 text-sm font-extrabold">
                      Payment Instructions
                    </h4>

                    <div class="space-y-4">

                      <div
                        v-for="(instruction, index) in [
                          'Open your payment application.',
                          'Scan the QR code or use the receiving account details.',
                          'Confirm the recipient and enter the exact payment amount.',
                          'Save your successful transaction receipt.',
                          'Upload your receipt below for verification.'
                        ]"
                        :key="index"
                        class="flex items-start gap-3"
                      >
                        <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                          {{ index + 1 }}
                        </span>

                        <p class="pt-1 text-sm leading-6 text-slate-600">
                          {{ instruction }}
                        </p>
                      </div>

                    </div>
                  </div>

                  <!-- Receipt -->
                  <div class="mt-8 border-t border-slate-100 pt-8">

                    <h4 class="text-base font-extrabold">
                      Upload Payment Receipt
                    </h4>

                    <p class="mt-2 text-sm text-slate-500">
                      Upload proof of your completed payment.
                    </p>

                    <label
                      class="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center transition hover:border-emerald-500"
                    >
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        class="hidden"
                        @change="handleFile"
                      />

                      <i class="fa-solid fa-cloud-arrow-up text-3xl text-emerald-600"></i>

                      <p class="mt-4 text-sm font-bold">
                        {{ receipt ? receipt.name : 'Choose payment receipt' }}
                      </p>

                      <p class="mt-2 text-xs text-slate-500">
                        JPG, PNG, or PDF · Maximum 5MB
                      </p>
                    </label>

                    <button
                      type="button"
                      :disabled="!receipt || isSubmitting"
                      @click="submitPayment"
                      class="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-700 px-6 py-4 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <i
                        :class="
                          isSubmitting
                            ? 'fa-solid fa-spinner fa-spin'
                            : 'fa-solid fa-paper-plane'
                        "
                      ></i>

                      {{ isSubmitting ? 'Submitting...' : 'Submit Payment Receipt' }}
                    </button>

                    <p class="mt-4 text-center text-xs leading-5 text-slate-500">
                      Submitting a receipt does not automatically confirm payment.
                      All transactions are subject to Accounting Office verification.
                    </p>
                  </div>

                </template>

                <!-- Unavailable Method -->
                <div
                  v-else
                  class="rounded-2xl border border-amber-200 bg-amber-50 p-7 text-center"
                >
                  <i class="fa-solid fa-circle-info text-3xl text-amber-600"></i>

                  <h4 class="mt-4 text-lg font-extrabold">
                    Payment Instructions
                  </h4>

                  <p class="mt-3 text-sm leading-7 text-slate-600">
                    {{ currentAccount.instructions }}
                  </p>

                  <p class="mt-4 text-xs text-amber-700">
                    This payment method is not currently available for online submission.
                  </p>
                </div>

              </div>
            </div>
          </section>

          <!-- Summary -->
          <aside class="lg:sticky lg:top-8">

            <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 class="text-lg font-extrabold">
                Order Summary
              </h3>

              <div class="mt-6 space-y-5">

                <div>
                  <p class="text-xs text-slate-500">Payment Reference</p>
                  <p class="mt-1 text-sm font-bold">
                    {{ payment.reference }}
                  </p>
                </div>

                <div>
                  <p class="text-xs text-slate-500">Description</p>
                  <p class="mt-1 text-sm font-bold">
                    {{ payment.description }}
                  </p>
                </div>

                <div>
                  <p class="text-xs text-slate-500">Customer</p>
                  <p class="mt-1 text-sm font-bold">
                    {{ payment.customer }}
                  </p>
                </div>

                <div>
                  <p class="text-xs text-slate-500">Email Address</p>
                  <p class="mt-1 break-all text-sm font-bold">
                    {{ payment.email }}
                  </p>
                </div>

              </div>

              <div class="mt-7 border-t border-slate-100 pt-6">

                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-500">
                    Subtotal
                  </span>
                  <span class="text-sm font-semibold">
                    {{ formattedAmount }}
                  </span>
                </div>

                <div class="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
                  <span class="font-bold">
                    Total Due
                  </span>

                  <span class="text-2xl font-black text-emerald-700">
                    {{ formattedAmount }}
                  </span>
                </div>

              </div>

              <div class="mt-7 rounded-xl bg-emerald-50 p-4">
                <div class="flex items-start gap-3">
                  <i class="fa-solid fa-shield-halved mt-1 text-emerald-700"></i>

                  <p class="text-xs leading-6 text-emerald-900">
                    Your payment will be reviewed and confirmed by the Accounting Office.
                  </p>
                </div>
              </div>

            </div>

            <p class="mt-5 text-center text-xs leading-6 text-slate-400">
              Payments are sent directly to the designated receiving account.
              This website does not process or hold your funds.
            </p>

          </aside>

        </div>
      </template>
    </main>
  </div>
</template>