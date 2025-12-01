<template>
  <div>
    <Header />
    <div>
      <div class="bg-gray-50">
        <div class="">
          <div class="relative">
            <img
              src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/about.jpg"
              class="align-top w-full h-auto lg:object-fill lg:block hidden"
            />
            <img
              src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
              class="align-top w-full h-36 object-none lg:hidden block"
            />
            <div
              class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full"
            >
              <h1
                class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
              >
                Free Electronic Resources
              </h1>
            </div>
            <div class="pt-2.5 pb-3 shadow-lg">
              <ul
                class="lg:flex lasalle-green-text capitalize w-11/12 mx-auto text-xs"
              >
                <li>
                  <a href="/" class="mr-1"> Home </a>
                </li>
                <li>
                  <i class="fas fa-caret-right mr-1"></i>
                  <a href="/library" class="mr-1">
                    Libraries and Media Centers
                  </a>
                </li>
                <li>
                  <i class="fas fa-caret-right mr-1"></i>
                  <a href="/library/new-normal" class="mr-1">
                    Online Library Services
                  </a>
                </li>
                <li>
                  <i class="fas fa-caret-right mr-1"></i>
                  <a href="/library/freeElectronicResources" class="mr-1">
                    Free Electronic Resources
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div>
          <h1 class="text-center lasalle-green-text text-lg mt-5 font-bold">
            Free Electronic Resources
          </h1>
        </div>
        <div>
          <h2 class="font-bold text-center mb-5 mt-5">Basic Education Unit</h2>
        </div>

        <div>
          <ul
            class="lg:flex w-10/12 mx-auto mb-5 text-center text-green-600 font-bold gap-5"
          >
            <li class="border border-black text-lg w-full py-20 px-10">
              <a href="#">Grade School</a>
            </li>
            <li class="border border-black text-lg w-full py-20 px-10">
              <a href="#"> Junior High School</a>
            </li>
            <li class="border border-black text-lg w-full py-20 px-10">
              <a href="#">Senior High School</a>
            </li>
          </ul>
        </div>

        <div>
          <h2 class="font-bold text-center mb-5 mt-5">Higher Education Unit</h2>
        </div>

        <div class="mb-5">
          <ul
            class="lg:flex w-10/12 mx-auto text-center text-green-600 font-bold gap-5"
          >
            <li class="border border-black text-lg w-full py-20 px-10">
              <a href="#">College of Arts and Sciences</a>
            </li>
            <li class="border border-black text-lg w-full py-20 px-10">
              <a href="#"> College of Business and Accountancy</a>
            </li>
            <li class="border border-black text-lg w-full py-20 px-10">
              <a href="#"
                >College of Computer Studies, Engineering and Architecture</a
              >
            </li>
          </ul>
        </div>
        <div class="mt-5">
          <ul
            class="lg:flex w-10/12 mx-auto mb-5 text-center text-green-600 font-bold gap-5"
          >
            <li class="border border-black text-lg w-full py-20 px-10">
              <a href="#">College of Teacher Education</a>
            </li>
            <li class="border border-black text-lg w-full py-20 px-10">
              <a href="#"> College of Tourism and Hospitality Management</a>
            </li>
            <li class="border border-black text-lg w-full py-20 px-10">
              <a href="#">School of Graduate Studies</a>
            </li>
          </ul>
        </div>
        <div>
          <h2 class="font-bold text-center mb-5 mt-5">Filipiniana</h2>
        </div>
        <div>
          <ul
            class="lg:flex w-10/12 mx-auto mb-5 text-center text-green-600 font-bold gap-5"
          >
            <li class="border border-black text-lg w-full py-20 px-10">
              <a href="#">Philippine E-Book Hub</a>
            </li>
            <li class="border border-black text-lg w-full py-20 px-10">
              <a href="#"> CHED Open Electronic Resources</a>
            </li>
            <li class="border border-black text-lg w-full py-20 px-10">
              <a href="#">Fostering Competition in ASEAN</a>
            </li>
          </ul>
        </div>

        <div
          class="mt-10 text-center text-sm italic font-semibold text-gray-900 mb-5"
        >
          <h1 class="lasalle-green-text">
            "When in doubt, go to the library."
          </h1>
          <span>- J.K. Rowling</span>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>