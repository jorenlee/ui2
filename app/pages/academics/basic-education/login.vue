<script setup></script>

<template>
  <div class="bg-gray-50">
    <div class="lg:h-screen flex items-center">
      <div class="py-6 w-6/12 mx-auto flex">
        
            <div class="">
          <img
            class="h-full w-96"
            src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/welcometoLs.png"
          />  
    </div>
       
        <div class="bg-white shadow p-5 w-6/12">
          <img
            class="w-8 h-auto block mb-5"
            src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/lsu-logo.png"
          />
          <div class="mb-3">
            <h1 class="uppercase font-bold text-green-800 mb-3">login</h1>
            <h2 class="text-xs mb-5 text-green-800 font-semibold">
              See your growth and get consulting support!
            </h2>
          </div>
          <form>
            <input
              class="rounded-lg border mb-3 py-2 text-xs w-full"
              id="username"
              name="username"
              v-model="username"
              placeholder=" USERNAME"
            />

            <input
              class="rounded-lg border py-2 text-xs mt-1 w-full"
              id="password"
              name="password"
              v-model="password"
              placeholder=" PASSWORD"
            />
          </form>
          <div class="flex items-center justify-between">
            <div class="">
              <input
                class="relative float-left mt-1.5"
                type="checkbox"
                value=""
                id=""
              />
              <label
                class="inline-block pl-[0.15rem] hover:cursor-pointer text-xs font-semibold text-green-800"
              >
                Remember Me
              </label>
            </div>
            <a href="#!" class="text-xs text-green-800"> Forgot password? </a>
          </div>
          <button type="submit" class="inline-block w-full rounded-lg bg-green-10 text-white text-sm font-bold py-2 mt-5">
            Login
          </button>
          
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-green-10 {
  background: #003613;
}</style>
