<script setup>
</script>

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
                Library Web Services
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
                  <a href="/library/libraryWebServices" class="mr-1">
                    Library Web Services
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div class="py-5">
          <h1 class="text-center lasalle-green-text text-lg mt-5 font-bold">
            Library Web Services
          </h1>
        </div>

        <div class="py-5 ml-10">
          <ul class="mx-auto w-7/12 space-y-4">
            <li>
              Web services are self-contained, modular, distributed, dynamic
              applications that can be described, published, located, or invoked
              over the network to create products, processes, and supply chains.
              These applications can be local, distributed, or web-based. Web
              services are built on top of open standards such as TCP/IP, HTTP,
              Java, HTML, and XML.
            </li>
            <li>
              Web services provide mechanisms that allow libraries to expand
              their services in many important ways.”—Marshall Breeding, “Web
              Services and the Service-Oriented Architecture.”
            </li>
            <li>
              A library website provides a library with a website to offer its
              services and to tell its story to its community.
            </li>
          </ul>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>