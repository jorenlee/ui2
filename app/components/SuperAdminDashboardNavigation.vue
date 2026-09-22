<template>
  <div>
    <!-- =========================================================
         DESKTOP HEADER
         ========================================================= -->
    <nav
      class="
        hidden lg:block
        fixed top-0 left-0 right-0
        z-50
        border-b
        shadow-sm
        backdrop-blur-xl
      "
      :class="
        darkMode
          ? 'bg-gray-900/95 text-white border-gray-700'
          : 'bg-white/95 text-gray-900 border-gray-200'
      "
    >
      <div class="w-full pl-8">
        <div class="h-[76px] flex items-center justify-between">

          <!-- =================================================
               LEFT: LSU LOGO + BRAND
               ================================================= -->
          <div class="flex items-center gap-3 shrink-0">

            <!-- LSU SEAL -->
            <div
              class="
                w-12 h-12
                flex items-center justify-center
                shrink-0
              "
            >
              <img
                src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/University%20Seal/LSU%20Seal.PNG"
                alt="La Salle University Seal"
                class="
                  w-full
                  h-full
                  object-contain
                "
              />
            </div>

            <!-- BRAND -->
            <div class="leading-tight">

              <h1
                class="font-bold text-base"
                :class="
                  darkMode
                    ? 'text-white'
                    : 'text-gray-800'
                "
              >
                LSU Central
              </h1>

              <p
                class="text-[11px] mt-0.5"
                :class="
                  darkMode
                    ? 'text-gray-400'
                    : 'text-gray-500'
                "
              >
                La Salle University Ozamiz
              </p>

              <!-- POWERED BY -->
              <p
                class="
                  text-[9px]
                  font-medium
                  tracking-wide
                  mt-1
                "
                :class="
                  darkMode
                    ? 'text-green-400'
                    : 'text-green-600'
                "
              >
                Powered By NPCC
              </p>

            </div>
          </div>


          <!-- =================================================
               RIGHT SIDE
               ================================================= -->
          <div class="flex items-center gap-3">

            <!-- =================================================
                 PROFILE
                 ================================================= -->
            <div
              class="
                flex
                items-center
                gap-3
                mr-2
              "
            >

              <!-- AVATAR -->
              <div
                class="
                  w-10
                  h-10
                  rounded-xl
                  overflow-hidden
                  border-2
                  shrink-0
                "
                :class="
                  darkMode
                    ? 'border-gray-700'
                    : 'border-green-100'
                "
              >
                <img
                  :src="userProfileImage"
                  :alt="userInitials"
                  class="
                    w-full
                    h-full
                    object-cover
                  "
                />
              </div>

              <!-- USER INFO -->
              <div
                class="
                  hidden
                  xl:block
                  max-w-[180px]
                "
              >

                <p
                  class="
                    text-sm
                    font-semibold
                    leading-tight
                    truncate
                  "
                  :class="
                    darkMode
                      ? 'text-white'
                      : 'text-gray-800'
                  "
                >
                  {{ userName }}
                </p>

                <p
                  class="
                    text-[11px]
                    mt-0.5
                    truncate
                  "
                  :class="
                    darkMode
                      ? 'text-gray-400'
                      : 'text-gray-500'
                  "
                >
                  {{ userEmail }}
                </p>

              </div>

            </div>


            <!-- =================================================
                 DESKTOP MENU
                 ================================================= -->
            <div class="flex items-center gap-1">

              <button
                v-for="(menu, index) in menuList"
                :key="index"
                type="button"
                @click="handleMenuClick(menu)"
                class="
                  relative
                  flex
                  items-center
                  gap-2
                  px-4
                  py-3
                  rounded-xl
                  transition-all
                  duration-200
                  group
                  whitespace-nowrap
                "
                :class="
                  currentView === menu.view
                    ? darkMode
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-green-50 text-green-700'
                    : darkMode
                      ? 'text-gray-300 hover:text-green-400 hover:bg-gray-800'
                      : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
                "
              >

                <!-- ICON -->
                <i
                  :class="[
                    'fa',
                    menu.icon,
                    'text-base',
                  ]"
                ></i>

                <!-- LABEL -->
                <span class="text-sm font-medium">
                  {{ menu.label }}
                </span>

                <!-- ACTIVE INDICATOR -->
                <span
                  v-if="currentView === menu.view"
                  class="
                    absolute
                    bottom-0
                    left-1/2
                    -translate-x-1/2
                    w-8
                    h-[3px]
                    rounded-t-full
                    bg-gradient-to-r
                    from-green-500
                    to-emerald-500
                  "
                ></span>

              </button>

            </div>

          </div>
        </div>
      </div>
    </nav>


    <!-- =========================================================
         DESKTOP CONTENT SPACING
         ========================================================= -->
    <div class="hidden lg:block h-[76px]"></div>


    <!-- =========================================================
         MOBILE NAVIGATION
         ========================================================= -->
    <nav
      class="
        lg:hidden
        fixed
        bottom-0
        left-0
        right-0
        backdrop-blur-lg
        border-t
        shadow-2xl
        z-40
      "
      :class="
        darkMode
          ? 'bg-gray-800/95 text-white border-gray-700'
          : 'bg-white/95 text-gray-900 border-gray-200'
      "
    >

      <div
        class="
          flex
          justify-evenly
          items-center
          px-4
          mx-auto
        "
      >

        <button
          v-for="(menu, index) in menuList"
          :key="index"
          type="button"
          @click="handleMenuClick(menu)"
          class="
            flex
            flex-col
            items-center
            gap-1
            px-4
            py-2
            rounded-xl
            transition-all
            duration-300
            relative
            group
          "
          :class="
            currentView === menu.view
              ? darkMode
                ? 'text-green-400'
                : 'text-green-600'
              : darkMode
                ? 'text-gray-400 hover:text-green-400'
                : 'text-gray-600 hover:text-green-600'
          "
        >

          <!-- ACTIVE INDICATOR -->
          <div
            v-if="currentView === menu.view"
            class="
              absolute
              -top-1
              left-1/2
              -translate-x-1/2
              w-12
              h-1
              bg-gradient-to-r
              from-green-500
              to-emerald-500
              rounded-full
            "
          ></div>

          <!-- ICON -->
          <div
            class="
              relative
              w-7
              h-7
              flex
              items-center
              justify-center
              rounded-2xl
              transition-all
              duration-300
            "
            :class="
              currentView === menu.view
                ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30 scale-110'
                : darkMode
                  ? 'bg-gray-700 group-hover:bg-green-900/30 group-hover:scale-105'
                  : 'bg-gray-100 group-hover:bg-green-50 group-hover:scale-105'
            "
          >
            <i
              :class="[
                'fa',
                menu.icon,
                'text-base transition-colors',
                currentView === menu.view
                  ? 'text-white'
                  : darkMode
                    ? 'text-gray-300 group-hover:text-green-400'
                    : 'text-gray-600 group-hover:text-green-600',
              ]"
            ></i>
          </div>

          <!-- LABEL -->
          <span
            class="text-[10px] transition-colors"
            :class="
              currentView === menu.view
                ? darkMode
                  ? 'text-green-400'
                  : 'text-green-600'
                : darkMode
                  ? 'text-gray-400 group-hover:text-green-400'
                  : 'text-gray-600 group-hover:text-green-600'
            "
          >
            {{ menu.label }}
          </span>

        </button>

      </div>

      <!-- MOBILE FOOTER -->
      <DashboardFooter :darkMode="darkMode" />

    </nav>

  </div>
</template>


<script setup>
import { computed, onMounted } from "vue";


/* =========================================================
   PROPS
   ========================================================= */

const props = defineProps({
  darkMode: {
    type: Boolean,
    default: false,
  },

  menuList: {
    type: Array,
    required: true,
  },

  currentView: {
    type: String,
    default: "",
  },
});


/* =========================================================
   EVENTS
   ========================================================= */

const emit = defineEmits([
  "menu-click",
  "logout",
]);


/* =========================================================
   AUTH
   ========================================================= */

const { user, init } = useAuth();

onMounted(() => {
  init();
});


/* =========================================================
   USER DATA
   ========================================================= */

const userEmail = computed(() => {
  return user.value?.email || "user@email.com";
});


const userName = computed(() => {
  return user.value?.name || userEmail.value;
});


const userPicture = computed(() => {
  return user.value?.image;
});


/* =========================================================
   INITIALS
   ========================================================= */

const userInitials = computed(() => {

  if (!user.value?.name) {
    return "?";
  }

  return user.value.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

});


/* =========================================================
   PROFILE IMAGE
   ========================================================= */

const userProfileImage = computed(() => {

  if (userPicture.value) {
    return userPicture.value;
  }

  const email = userEmail.value
    .toLowerCase()
    .trim();

  if (
    email.includes("@gmail.com") ||
    email.includes("@lsu.edu.ph")
  ) {
    return `https://unavatar.io/${email}`;
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    userInitials.value
  )}&background=10b981&color=fff&size=128&bold=true`;

});


/* =========================================================
   MENU
   ========================================================= */

const handleMenuClick = (menu) => {
  emit("menu-click", menu);
};

</script>