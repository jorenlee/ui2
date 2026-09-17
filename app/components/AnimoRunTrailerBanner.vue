<template>
    <section
        class="relative overflow-hidden bg-[#064e3b] shadow-lg"
    >
        <!-- Decorative Background -->
        <div class="pointer-events-none absolute inset-0 overflow-hidden">
            <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl"></div>
            <div class="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-yellow-400/10 blur-3xl"></div>

            <!-- Decorative Running Lines -->
            <div class="absolute right-0 top-0 opacity-10">
                <div class="h-px w-64 rotate-[-25deg] bg-white"></div>
                <div class="mt-8 h-px w-80 rotate-[-25deg] bg-white"></div>
                <div class="mt-8 h-px w-56 rotate-[-25deg] bg-white"></div>
            </div>

            <div class="absolute -bottom-24 -right-10 h-72 w-72 rounded-full border border-white/10"></div>
            <div class="absolute -bottom-10 right-10 h-48 w-48 rounded-full border border-white/10"></div>
        </div>

        <!-- Content -->
        <div
            class="relative z-10 flex flex-col items-center justify-between gap-6 px-6 py-8 sm:px-10 lg:flex-row lg:px-14"
        >

            <!-- Left Content -->
            <div class="text-center lg:text-left">

                <!-- Badge -->
                <div
                    class="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-300/30 bg-yellow-400/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-yellow-200"
                >
                    <i class="fa-solid fa-bullhorn"></i>
                    Get Ready
                </div>

                <!-- Heading -->
                <h2
                    class="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl"
                >
                    Get Ready to Run!
                </h2>

                <h3
                    class="mt-2 text-lg font-extrabold uppercase tracking-[0.2em] text-yellow-300"
                >
                    ANIMO RUN 2026
                </h3>

                <p
                    class="mt-4 max-w-3xl text-sm leading-relaxed text-emerald-100 sm:text-base"
                >
                    Get ready for the new and improved registration system for
                    <strong class="text-white">
                        Animo Run 2026 – The Emerald Run.
                    </strong>
                </p>

                <p
                    class="max-w-6xl text-sm leading-relaxed text-emerald-100 sm:text-base"
                >
                    Registration details and the official event form will be
                    available soon. Prepare your account and get ready for
                    registration!
                </p>

                <!-- Information Pills -->
                <div
                    class="mt-5 flex flex-wrap justify-center gap-3 lg:justify-start"
                >
                    <div
                        class="flex items-center gap-2 rounded-lg border border-white/10 bg-black/10 px-4 py-2 text-xs font-semibold text-emerald-100"
                    >
                        <i class="fa-solid fa-calendar-days text-yellow-300"></i>
                        Registration Opening Soon
                    </div>

                    <div
                        class="flex items-center gap-2 rounded-lg border border-white/10 bg-black/10 px-4 py-2 text-xs font-semibold text-emerald-100"
                    >
                        <i class="fa-solid fa-running text-yellow-300"></i>
                        The Emerald Run
                    </div>
                </div>

                <!-- Login Button -->
                <div class="mt-6 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">

                    <a
                        href="https://lsu.edu.ph/dashboard"
                        class="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-300 px-6 py-3 text-sm font-black uppercase tracking-wide text-[#064e3b] shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-yellow-200 hover:shadow-xl"
                    >
                        <i class="fa-solid fa-right-to-bracket"></i>
                        Login to Dashboard
                    </a>

                    <span class="text-xs font-medium text-emerald-200">
                        Use your LSU Email or Gmail
                    </span>

                </div>

            </div>

            <!-- Right System Card -->
            <div class="w-full max-w-sm lg:w-[500px]">

                <div
                    class="rounded-2xl border border-white/20 bg-white/10 p-6 text-center shadow-2xl backdrop-blur-md"
                >

                    <!-- Icon -->
                    <div
                        class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-yellow-300/40 bg-yellow-400/10"
                    >
                        <i
                            class="fa-solid fa-person-running text-2xl text-yellow-300"
                        ></i>
                    </div>

                 

                    <h4
                        class="mt-2 text-2xl font-black uppercase text-white"
                    >
                        Registration Form
                    </h4>

                    <p
                        class="mt-3 text-xs text-emerald-100"
                    >
                The official online registration platform will be ready soon. Registration announcements will follow. Please ensure you can access your Gmail account before registration opens.
                    </p>

                  
                    <!-- Status -->
                    <div
                        class="mt-4 flex items-center justify-center gap-2 rounded-lg border border-yellow-300/20 bg-yellow-400/10 px-4 py-3"
                    >
                        <span class="relative flex h-2.5 w-2.5">
                            <span
                                class="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-300 opacity-75"
                            ></span>

                            <span
                                class="relative inline-flex h-2.5 w-2.5 rounded-full bg-yellow-300"
                            ></span>
                        </span>

                        <span
                            class="text-xs font-bold uppercase tracking-wider text-yellow-200"
                        >
                            Registration Coming Soon
                        </span>
                    </div>

                </div>

            </div>

        </div>

        <!-- Bottom Accent -->
        <div
            class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
        ></div>

    </section>
</template>