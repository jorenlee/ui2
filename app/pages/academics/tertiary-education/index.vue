<script setup>
import tertiaryJSON from "./tertiary.json";
const tertiary = ref(tertiaryJSON.tertiary);

const underGrad = ref(true);
const gradStud = ref(false);

const schoolToggle = (a, b) => {
  underGrad.value = a
  gradStud.value = b
}

</script>
<template>
  <div class="bg-gray-50">
    <Header />
    <div class="">
      <div class="relative">
         <Banner />
        <img
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
          class="align-top w-full h-36 object-none lg:hidden block"
        />
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1
            class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
          >
            Tertiary Education
          </h1>
        </div>
        <div class="shadow-lg whitespace-nowrap">
          <ul
            class="flex items-center h-10 lg:overflow-hidden overflow-x-scroll lasalle-green-text capitalize w-11/12 mx-auto text-xs">
            <li>
              <a href="/" class="mr-1"> Home </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a  href="/academics/tertiary-education" class="mr-1"> Academics </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a  href="/academics/tertiary-education" class="hover:underline mr-1"> Tertiary Education </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a  href="/academics/tertiary-education" class="flex-wrap capitalize mr-1"> degree programs </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="">
      <div class="text-center">
        <div class="lg:flex gap-10 w-11/12 mx-auto lg:mt-10 mt-3">
          <div class="lg:w-3/12 w-full h-fit lg:mt-0 mt-5 mb-3">
            <div v-for="(t, i) in tertiary" class="" :key="i">
              <div v-for="(tu, i) in t.under_grad" class="mb-2 bg-white border-l-4 border-green-900" :key="i" @click="schoolToggle(true, false)">
                <div class="lg:text-sm text-xs py-2 text-center hover:bg-green-900 hover:text-white cursor-pointer">
                  <span class="tracking-widest">
                    {{ tu.title }}
                  </span>
                </div>
              </div>
              <div v-for="(tu, i) in t.grad_stud" :key="i" class="bg-white border-l-4 border-green-900" @click="schoolToggle(false, true)">
                <div class="lg:text-sm text-xs py-2 text-center hover:bg-green-900 hover:text-white cursor-pointer">
                  <span class="tracking-widest">
                    {{ tu.title }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="lg:w-9/12 w-full">
            <div v-for="(t, i) in tertiary" class="" :key="i">
              <div v-for="(tu, i) in t.under_grad" class="lg:mb-10" :key="i" v-show="underGrad">
                <div class="accordion mb-5">
                  <div v-for="(a, i) in tu.list" :key="i" class="mb-1">
                    <div
                      class="bg-white border-b-2 flex"
                      @click="a.active = !a.active"
                    >
                  
                      <i
                        class="fa text-gray-700 text-sm lg:px-5 px-3 flex items-center"
                        :class="a.active ? 'fa-caret-up' : 'fa-caret-down'"
                        @click="a.active = !a.active"
                      ></i>
                      <h2 class="accordion-header mb-0">
                        <button
                          class="items-center w-full px-2 bg-white rounded-none transition focus:outline-none justify-between mx-auto"
                          type="button"
                        >
  
                          <h1 class="font-bold text-green-900 text-xs py-2 flex items-center text-left">
                          
                          <img :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/colleges/${a.logo}`"
                            class="w-5 mr-5 rounded-full" />


                          {{ a.title }} {{a.abbr}}
                          </h1>
                        </button>
                      </h2>
                    </div>
                    <div
                      v-if="a.active"
                      class="bg-white border border-gray-200"
                    >
                      <a class="accordion-body py-4 px-5 text-left"  
                      
                        :href="`/academics/tertiary-education/${a.link}`"
                      >
                        <ul class="lg:pl-20 pl-2">
                          <li
                            class="lg:text-sm text-xs hover:font-bold"
                            v-for="(p, i) in a.programs"
                            :key="i"
                          >
                           
                            <a
                             
                              class="hover:font-bold hover:text-green-900 block"
                              >{{ p.title }}</a
                            >
                          </li>
                        </ul>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div v-for="(tu, i) in t.grad_stud" :key="i" class="lg:mb-6 mb-5" v-show="gradStud">
                <div class="accordion">
                  <div
                    v-for="(a, i) in tu.list"
                    :key="i"
                    class="lg:flex"
                  >
                    <div
                      class=" bg-white lg:w-[500px] h-screen border"
                      :class="a.active ? '' : 'mx-auto'"
                      @click="a.active = !a.active"
                    >
                      <div class="lg:w-full  px-2">
                       
                        <img
                          :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/colleges/gradschool2025.jpg`"
                          class="mx-auto w-44 h-auto mt-5 flex items-center"
                          :alt="a.logo"
                        />
                      </div>
                      <h2 class="accordion-header mb-0">
                        <button
                          class="items-center w-full px-5 bg-white  rounded-none transition focus:outline-none justify-between mx-auto"
                          type="button"
                        >
                          <h1
                            class="font-bold text-green-900 text-xs flex items-center justify-center whitespace-nowrap"
                          >
                            {{ a.title }}
                          </h1>
                        </button>
                      </h2>
                    </div>
                    <div
                      
                      class="lg:flex bg-white border border-gray-200 w-full text-left"
                    >
                     
                      <div
                        class="w-full accordion-body lg:pt-4 px-5"
                      >
                        <a
                          href="/academics/tertiary-education/programs"
                          class="font-bold hover:text-green-900 hover:text-lg lg:mb-3 uppercase"
                          >{{ a.title }}</a
                        >
                        <ul>
                          <li
                            class="lg:text-base text-xs"
                            v-for="(c, i) in a.category"
                            :key="i"
                          >
                            <h1 class="my-3 font-bold">{{ c.title }}</h1>
                          
                            <ul class="mb-3">
                              <li
                                class="lg:text-sm text-xs"
                                v-for="(p, i) in c.programs"
                                :key="i"
                              >
                                <a>
                                  <div class="hover:font-bold hover:text-green-900 lg:ml-5"> 
                                    {{ p.title }}
                                  </div>
                                  <div class="hover:font-bold hover:text-green-900 lg:ml-10" v-for="(j,i) in p.major" :key="i"> 
                                    <span v-if="j !== ''">-</span>{{ j }}
                                  </div>
                                </a>
                              </li>
                            </ul>
                          </li>
                        </ul>
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
    <!-- Coming Soon Section -->
    <div class="coming-soon-section">
      <div class="coming-soon-inner">
        <div class="coming-soon-icon">
          <i class="fas fa-graduation-cap"></i>
        </div>
        <h2 class="coming-soon-title">More Courses Coming Soon</h2>
        <p class="coming-soon-subtitle">
          We are continuously expanding our academic offerings. Stay tuned for exciting new programs and courses designed to prepare you for the future.
        </p>
        <div class="coming-soon-divider">
          <span></span>
          <i class="fas fa-star"></i>
          <span></span>
        </div>
        <div class="coming-soon-badges">
          <span class="badge">Graduate Programs</span>
          <span class="badge">Professional Courses</span>
          <span class="badge">Certifications</span>
        </div>
        <p class="coming-soon-note">
          <i class="fas fa-bell"></i> Check back regularly for updates on new course offerings.
        </p>
      </div>
    </div>
    <!-- <ComingSoon /> -->
    <Footer />
  </div>
</template>

<style scoped>
.coming-soon-section {
  background: linear-gradient(135deg, #1a3c1f 0%, #2d6a35 50%, #1a3c1f 100%);
  padding: 80px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.coming-soon-section::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, transparent 60%);
  animation: shimmer 6s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(10px, -10px) rotate(3deg); }
}

.coming-soon-inner {
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 0 auto;
}

.coming-soon-icon {
  font-size: 3.5rem;
  color: rgba(255, 255, 255, 0.25);
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.coming-soon-title {
  font-size: 2rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 1px;
  margin-bottom: 16px;
  text-transform: uppercase;
}

.coming-soon-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.8;
  margin-bottom: 30px;
}

.coming-soon-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-bottom: 28px;
}

.coming-soon-divider span {
  height: 1px;
  width: 80px;
  background: rgba(255, 255, 255, 0.3);
}

.coming-soon-divider i {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
}

.coming-soon-badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-bottom: 28px;
}

.badge {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  padding: 6px 18px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: background 0.3s ease, transform 0.2s ease;
  cursor: default;
}

.badge:hover {
  background: rgba(255, 255, 255, 0.22);
  transform: translateY(-2px);
}

.coming-soon-note {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.55);
  margin-top: 10px;
}

.coming-soon-note i {
  margin-right: 6px;
  color: #ffd700;
}
</style>