<template>
    <section
        class="emerald-run-banner relative min-h-[420px] overflow-hidden bg-[#02150e] px-4 py-8 shadow-lg sm:py-10 lg:px-0"
    >
        <!-- ========================================================= -->
        <!-- BACKGROUND -->
        <!-- ========================================================= -->
        <div class="pointer-events-none absolute inset-0 overflow-hidden">

            <!-- Deep Emerald Base -->
            <div
                class="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#0b8f67_0%,#08704f_22%,#064e3b_43%,#032d20_70%,#02150e_100%)]"
            ></div>

            <!-- Emerald Ambient Glow -->
            <div
                class="emerald-core absolute left-1/2 top-1/2 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            ></div>

            <!-- Left Emerald Glow -->
            <div
                class="emerald-cloud emerald-cloud-left absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full"
            ></div>

            <!-- Right Emerald Glow -->
            <div
                class="emerald-cloud emerald-cloud-right absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full"
            ></div>

            <!-- ===================================================== -->
            <!-- CINEMATIC DIAGONAL LENS FLARE -->
            <!-- ===================================================== -->

            <div class="cinematic-flare cinematic-flare-1">

                <!-- Long diagonal light beam -->
                <div class="flare-diagonal-beam"></div>

                <!-- Secondary soft beam -->
                <div class="flare-soft-beam"></div>

                <!-- Horizontal rays -->
                <div class="flare-ray flare-ray-horizontal"></div>

                <!-- Vertical rays -->
                <div class="flare-ray flare-ray-vertical"></div>

                <!-- Diagonal rays -->
                <div class="flare-ray flare-ray-diagonal-1"></div>
                <div class="flare-ray flare-ray-diagonal-2"></div>

                <!-- Main glow -->
                <div class="flare-bloom"></div>

                <!-- Hot white center -->
                <div class="flare-core"></div>

                <!-- Lens ghost reflections -->
                <div class="flare-ghost flare-ghost-1"></div>
                <div class="flare-ghost flare-ghost-2"></div>
                <div class="flare-ghost flare-ghost-3"></div>
                <div class="flare-ghost flare-ghost-4"></div>
            </div>

            <!-- Secondary subtle flare -->
            <div class="cinematic-flare cinematic-flare-2">
                <div class="flare-diagonal-beam"></div>
                <div class="flare-bloom"></div>
                <div class="flare-core"></div>
            </div>

            <!-- ===================================================== -->
            <!-- LARGE GLASS SHINE -->
            <!-- ===================================================== -->

            <div class="glass-shine glass-shine-1">
                <div class="glass-reflection"></div>
                <div class="glass-light"></div>
                <div class="glass-beam-horizontal"></div>
                <div class="glass-beam-vertical"></div>
                <div class="glass-core"></div>
            </div>

            <!-- Second Glass Reflection -->
            <div class="glass-shine glass-shine-2">
                <div class="glass-reflection"></div>
                <div class="glass-light"></div>
                <div class="glass-beam-horizontal"></div>
                <div class="glass-core"></div>
            </div>

            <!-- ===================================================== -->
            <!-- MOVING CINEMATIC GLARE -->
            <!-- ===================================================== -->

            <div class="moving-glare moving-glare-1"></div>
            <div class="moving-glare moving-glare-2"></div>

            <!-- ===================================================== -->
            <!-- SMALL GLASS LIGHTS -->
            <!-- ===================================================== -->

            <span class="glass-dot glass-dot-1"></span>
            <span class="glass-dot glass-dot-2"></span>
            <span class="glass-dot glass-dot-3"></span>
            <span class="glass-dot glass-dot-4"></span>
            <span class="glass-dot glass-dot-5"></span>
            <span class="glass-dot glass-dot-6"></span>
            <span class="glass-dot glass-dot-7"></span>
            <span class="glass-dot glass-dot-8"></span>
            <span class="glass-dot glass-dot-9"></span>
            <span class="glass-dot glass-dot-10"></span>

            <!-- ===================================================== -->
            <!-- SOFT GLASS RINGS -->
            <!-- ===================================================== -->

            <div
                class="glass-ring glass-ring-1 absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            ></div>

            <div
                class="glass-ring glass-ring-2 absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            ></div>

            <!-- Fine Light Particles -->
            <div
                class="absolute inset-0 opacity-20"
                style="
                    background-image: radial-gradient(
                        circle,
                        rgba(236, 253, 245, 0.7) 0.7px,
                        transparent 0.8px
                    );
                    background-size: 30px 30px;
                "
            ></div>

            <!-- Vignette -->
            <div
                class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,rgba(0,10,6,0.76)_100%)]"
            ></div>
        </div>

        <!-- ========================================================= -->
        <!-- CONTENT -->
        <!-- ========================================================= -->

        <div
            class="relative z-10 mx-auto flex max-w-6xl flex-col items-center text-center"
        >

            <!-- LSU 20th Anniversary Emerald Logo -->
            <div class="logo-power mb-6 flex justify-center">
                <div class="relative">

                    <!-- Logo Glass Aura -->
                    <div
                        class="absolute inset-0 scale-75 rounded-full bg-emerald-200/20 blur-[65px]"
                    ></div>

                    <img
                        src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/20th%20Anniversary%20Emerald%20Logos-20260618T012425Z-3-001/20th%20Anniversary%20Emerald%20Logos/Emerald%20%26%20Theme%20with%20Corp%20Logo.png"
                        alt="La Salle University Ozamiz 20th Anniversary Emerald Logo"
                        class="relative h-auto w-[190px] object-contain drop-shadow-[0_5px_30px_rgba(167,243,208,0.38)] sm:w-[220px] lg:w-[250px]"
                    />
                </div>
            </div>

            <!-- Main Title -->
            <div class="relative">

                <div
                    class="absolute left-1/2 top-1/2 -z-10 h-36 w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/15 blur-[85px]"
                ></div>

                <h2
                    class="text-5xl font-black leading-[0.9] tracking-[-0.04em] text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.08)] sm:text-6xl lg:text-8xl"
                >
                    The Emerald Run
                </h2>

                <h3
                    class="mt-4 text-3xl font-bold tracking-[-0.02em] text-emerald-100 sm:text-4xl lg:text-5xl"
                >
                    ANIMO Run 2026
                </h3>
            </div>

            <!-- Date -->
            <div
                class="date-power mt-6 inline-flex items-center rounded-md border border-white/20 bg-white px-5 py-2 text-sm font-black text-[#064e3b] shadow-[0_0_35px_rgba(167,243,208,0.18)] sm:text-base"
            >
                <i class="fa-solid fa-calendar-days mr-2"></i>
                November 14, 2026
            </div>

            <!-- Registration Notice -->
            <div class="mt-7 max-w-2xl">
                <p
                    class="text-sm font-medium leading-relaxed text-emerald-100/90 sm:text-base"
                >
                    The official online registration platform will be ready
                    soon. Registration announcements will follow. Please ensure
                    you can access your Gmail account before registration opens.
                </p>
            </div>

            <!-- Status -->
            <div
                class="status-power mt-5 inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-4 py-2 backdrop-blur-sm"
            >
                <span class="relative flex h-2.5 w-2.5">
                    <span
                        class="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-300 opacity-75"
                    ></span>

                    <span
                        class="relative inline-flex h-2.5 w-2.5 rounded-full bg-yellow-300 shadow-[0_0_14px_rgba(253,224,71,0.9)]"
                    ></span>
                </span>

                <span
                    class="text-xs font-bold uppercase tracking-wider text-yellow-200"
                >
                    Registration Coming Soon
                </span>
            </div>

            <!-- Contact -->
            <div
                class="mt-8 flex flex-col items-center justify-center gap-4 text-sm font-semibold text-white/90 sm:flex-row sm:gap-10"
            >
                <a
                    href="https://www.facebook.com/lsuanimorun"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="contact-link flex items-center gap-2 transition duration-300 hover:-translate-y-1 hover:text-yellow-300"
                >
                    <span
                        class="contact-icon flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#064e3b]"
                    >
                        <i class="fa-brands fa-facebook-f"></i>
                    </span>

                    <span>fb.com/lsuanimorun</span>
                </a>

                <a
                    href="mailto:animorun@lsu.edu.ph"
                    class="contact-link flex items-center gap-2 transition duration-300 hover:-translate-y-1 hover:text-yellow-300"
                >
                    <span
                        class="contact-icon flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#064e3b]"
                    >
                        <i class="fa-solid fa-envelope"></i>
                    </span>

                    <span>animorun@lsu.edu.ph</span>
                </a>
            </div>
        </div>

        <!-- Bottom Emerald Light -->
        <div
            class="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-300 to-transparent opacity-90"
        ></div>

        <div
            class="bottom-glow absolute bottom-0 left-1/2 h-24 w-[75%] -translate-x-1/2"
        ></div>
    </section>
</template>

<style scoped>
/* =========================================================
   EMERALD RUN
   PREMIUM CINEMATIC GLASS + LENS FLARE
   ========================================================= */


/* =========================================================
   EMERALD CORE
   ========================================================= */

.emerald-core {
    background: radial-gradient(
        circle,
        rgba(52, 211, 153, 0.28) 0%,
        rgba(16, 185, 129, 0.16) 28%,
        rgba(6, 78, 59, 0.06) 60%,
        transparent 76%
    );

    filter: blur(50px);

    animation: emeraldPulse 7s ease-in-out infinite;
}

@keyframes emeraldPulse {
    0%,
    100% {
        opacity: 0.45;
        transform: translate(-50%, -50%) scale(0.9);
    }

    50% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.12);
    }
}


/* =========================================================
   EMERALD BACKGROUND CLOUDS
   ========================================================= */

.emerald-cloud {
    filter: blur(20px);
    pointer-events: none;
}

.emerald-cloud-left {
    background: rgba(16, 185, 129, 0.24);

    animation:
        cloudLeft 9s ease-in-out infinite alternate;
}

.emerald-cloud-right {
    background: rgba(52, 211, 153, 0.20);

    animation:
        cloudRight 11s ease-in-out infinite alternate;
}

@keyframes cloudLeft {
    from {
        transform: scale(0.8);
        opacity: 0.25;
    }

    to {
        transform: scale(1.15);
        opacity: 0.65;
    }
}

@keyframes cloudRight {
    from {
        transform: scale(0.85);
        opacity: 0.2;
    }

    to {
        transform: scale(1.2);
        opacity: 0.6;
    }
}


/* =========================================================
   NEW CINEMATIC LENS FLARE
   Inspired by the uploaded diagonal light reference
   ========================================================= */

.cinematic-flare {
    position: absolute;

    width: 200px;
    height: 200px;

    pointer-events: none;

    z-index: 2;

    transform-origin: center;
}


/*
   Main flare position.
   The light travels diagonally:
   bottom-left → top-right
*/

.cinematic-flare-1 {
    left: 52%;
    top: 10%;

    animation:
        cinematicFlareMove 12s cubic-bezier(0.42, 0, 0.58, 1) infinite;
}


@keyframes cinematicFlareMove {
    0% {
        transform:
            translate(-42vw, 28vh)
            rotate(-3deg)
            scale(0.72);
        opacity: 0;
    }

    28% {
        opacity: 1;
    }

    55% {
        opacity: 1;
    }

    82% {
        opacity: 0.12;
    }

    100% {
        transform:
            translate(42vw, -28vh)
            rotate(3deg)
            scale(1.15);
        opacity: 0;
    }
}

/* Secondary flare */

.cinematic-flare-2 {
    left: -15%;
    top: 45%;

    width: 280px;
    height: 280px;

    opacity: 0.28;

    animation:
        secondaryFlareMove 15s ease-in-out infinite;
}


/* =========================================================
   LONG DIAGONAL LIGHT BEAM
   ========================================================= */

.flare-diagonal-beam {
    position: absolute;

    left: 50%;
    top: 50%;

    width: 2000px;
    height: 1000px;

    transform:
        translate(-50%, -50%)
        rotate(-38deg);

    transform-origin: center;

    background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.02) 8%,
        rgba(255, 255, 255, 0.08) 22%,
        rgba(255, 255, 255, 0.20) 35%,
        rgba(255, 255, 255, 0.62) 46%,
        #ffffff 50%,
        rgba(255, 255, 255, 0.62) 54%,
        rgba(255, 255, 255, 0.20) 65%,
        rgba(255, 255, 255, 0.08) 78%,
        rgba(255, 255, 255, 0.02) 92%,
        transparent 100%
    );

    filter: blur(2px);

    box-shadow:
        0 0 8px rgba(255, 255, 255, 0.9),
        0 0 20px rgba(255, 255, 255, 0.6),
        0 0 45px rgba(255, 255, 255, 0.35),
        0 0 80px rgba(167, 243, 208, 0.18);

    animation:
        beamPulse 3.8s ease-in-out infinite;
}


/* Larger soft beam behind the main beam */

.flare-soft-beam {
    position: absolute;

    left: 50%;
    top: 50%;

    width: 850px;
    height: 28px;

    transform:
        translate(-50%, -50%)
        rotate(-38deg);

    background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.05) 25%,
        rgba(255, 255, 255, 0.22) 50%,
        rgba(255, 255, 255, 0.05) 75%,
        transparent
    );

    filter: blur(15px);

    opacity: 0.55;

    animation:
        softBeamPulse 4.5s ease-in-out infinite;
}


/* =========================================================
   FLARE BLOOM
   ========================================================= */

.flare-bloom {
    position: absolute;

    left: 50%;
    top: 50%;

    width: 230px;
    height: 230px;

    transform: translate(-50%, -50%);

    border-radius: 9999px;

    background: radial-gradient(
        circle,
        rgba(255, 255, 255, 0.92) 0%,
        rgba(255, 255, 255, 0.68) 5%,
        rgba(255, 255, 255, 0.42) 13%,
        rgba(255, 255, 255, 0.22) 26%,
        rgba(255, 255, 255, 0.10) 42%,
        rgba(236, 253, 245, 0.04) 58%,
        transparent 76%
    );

    filter: blur(13px);

    animation:
        flareBloom 3.2s ease-in-out infinite;
}


/* =========================================================
   HOT WHITE CORE
   ========================================================= */

.flare-core {
    position: absolute;

    left: 50%;
    top: 50%;

    width: 20px;
    height: 20px;

    transform: translate(-50%, -50%);

    border-radius: 9999px;

    background: #ffffff;

    z-index: 10;

    box-shadow:
        0 0 3px #ffffff,
        0 0 8px #ffffff,
        0 0 16px #ffffff,
        0 0 30px #ffffff,
        0 0 50px rgba(255, 255, 255, 0.95),
        0 0 85px rgba(255, 255, 255, 0.75),
        0 0 130px rgba(255, 255, 255, 0.45),
        0 0 190px rgba(255, 255, 255, 0.22);

    animation:
        flareCorePulse 2.5s ease-in-out infinite;
}


/* =========================================================
   RADIAL RAYS
   ========================================================= */

.flare-ray {
    position: absolute;

    left: 50%;
    top: 50%;

    transform-origin: center;

    background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.35),
        #ffffff,
        rgba(255, 255, 255, 0.35),
        transparent
    );

    filter: blur(1px);

    opacity: 0.75;

    pointer-events: none;
}


/* Horizontal */

.flare-ray-horizontal {
    width: 420px;
    height: 2px;

    transform:
        translate(-50%, -50%)
        rotate(0deg);
}


/* Vertical */

.flare-ray-vertical {
    width: 2px;
    height: 420px;

    transform:
        translate(-50%, -50%)
        rotate(0deg);

    background: linear-gradient(
        180deg,
        transparent,
        rgba(255, 255, 255, 0.35),
        #ffffff,
        rgba(255, 255, 255, 0.35),
        transparent
    );
}


/* Diagonal rays */

.flare-ray-diagonal-1 {
    width: 360px;
    height: 2px;

    transform:
        translate(-50%, -50%)
        rotate(42deg);

    opacity: 0.45;
}

.flare-ray-diagonal-2 {
    width: 330px;
    height: 2px;

    transform:
        translate(-50%, -50%)
        rotate(-42deg);

    opacity: 0.38;
}


/* =========================================================
   LENS GHOSTS
   Hexagonal reflections similar to the reference image
   ========================================================= */

.flare-ghost {
    position: absolute;

    left: 50%;
    top: 50%;

    border: 1px solid rgba(255, 255, 255, 0.12);

    background: radial-gradient(
        circle,
        rgba(255, 255, 255, 0.14),
        rgba(255, 255, 255, 0.035) 55%,
        transparent 75%
    );

    backdrop-filter: blur(2px);

    clip-path: polygon(
        25% 6%,
        75% 6%,
        100% 50%,
        75% 94%,
        25% 94%,
        0% 50%
    );

    filter: blur(0.5px);

    opacity: 0.35;
}


/* Large ghost */

.flare-ghost-1 {
    width: 95px;
    height: 95px;

    transform:
        translate(-50%, -50%)
        translate(-260px, 155px)
        rotate(-10deg);

    animation:
        ghostFloat1 5s ease-in-out infinite;
}


/* Medium ghost */

.flare-ghost-2 {
    width: 58px;
    height: 58px;

    transform:
        translate(-50%, -50%)
        translate(-180px, 108px);

    opacity: 0.24;

    animation:
        ghostFloat2 4.5s ease-in-out infinite;
}


/* Small ghost */

.flare-ghost-3 {
    width: 38px;
    height: 38px;

    transform:
        translate(-50%, -50%)
        translate(-110px, 65px);

    opacity: 0.22;
}


/* Tiny ghost */

.flare-ghost-4 {
    width: 24px;
    height: 24px;

    transform:
        translate(-50%, -50%)
        translate(80px, -50px);

    opacity: 0.18;
}


/* =========================================================
   LENS FLARE ANIMATIONS
   ========================================================= */

@keyframes cinematicFlareMove {

    0% {
        transform:
            translate(-42vw, 28vh)
            rotate(-3deg)
            scale(0.72);

        opacity: 0;
    }

    8% {
        opacity: 0.35;
    }

    18% {
        opacity: 0.9;
    }

    28% {
        opacity: 1;
    }

    42% {
        opacity: 0.82;
    }

    55% {
        opacity: 1;
    }

    70% {
        opacity: 0.45;
    }

    82% {
        opacity: 0.12;
    }

    100% {
        transform:
            translate(42vw, -28vh)
            rotate(3deg)
            scale(1.15);

        opacity: 0;
    }
}


@keyframes secondaryFlareMove {

    0%,
    100% {
        transform:
            translate(-5vw, 10vh)
            scale(0.65);

        opacity: 0;
    }

    30% {
        opacity: 0.18;
    }

    50% {
        transform:
            translate(18vw, -10vh)
            scale(0.9);

        opacity: 0.3;
    }

    70% {
        opacity: 0.1;
    }
}


@keyframes flareBloom {

    0%,
    100% {
        transform:
            translate(-50%, -50%)
            scale(0.72);

        opacity: 0.55;
    }

    50% {
        transform:
            translate(-50%, -50%)
            scale(1.25);

        opacity: 1;
    }
}


@keyframes flareCorePulse {

    0%,
    100% {
        transform:
            translate(-50%, -50%)
            scale(0.72);

        opacity: 0.78;
    }

    50% {
        transform:
            translate(-50%, -50%)
            scale(1.3);

        opacity: 1;
    }
}


@keyframes beamPulse {

    0%,
    100% {
        opacity: 0.45;
    }

    50% {
        opacity: 1;
    }
}


@keyframes softBeamPulse {

    0%,
    100% {
        opacity: 0.25;
    }

    50% {
        opacity: 0.7;
    }
}


@keyframes ghostFloat1 {

    0%,
    100% {
        opacity: 0.12;
        transform:
            translate(-50%, -50%)
            translate(-260px, 155px)
            rotate(-10deg)
            scale(0.85);
    }

    50% {
        opacity: 0.45;
        transform:
            translate(-50%, -50%)
            translate(-260px, 155px)
            rotate(-10deg)
            scale(1.08);
    }
}


@keyframes ghostFloat2 {

    0%,
    100% {
        opacity: 0.08;
        transform:
            translate(-50%, -50%)
            translate(-180px, 108px)
            scale(0.8);
    }

    50% {
        opacity: 0.32;
        transform:
            translate(-50%, -50%)
            translate(-180px, 108px)
            scale(1.12);
    }
}


/* =========================================================
   LARGE GLASS SHINE
   ========================================================= */

.glass-shine {
    position: absolute;

    width: 360px;
    height: 360px;

    pointer-events: none;

    opacity: 0;

    transform: scale(0.2);

    animation:
        glassShine 8s ease-in-out infinite;
}

.glass-shine-1 {
    left: 4%;
    top: 5%;
}

.glass-shine-2 {
    right: 5%;
    top: 8%;

    width: 300px;
    height: 300px;

    animation-delay: 4s;
}


/* =========================================================
   LARGE SOFT GLASS REFLECTION
   ========================================================= */

.glass-reflection {
    position: absolute;

    left: 50%;
    top: 50%;

    width: 340px;
    height: 340px;

    transform: translate(-50%, -50%);

    border-radius: 9999px;

    background: radial-gradient(
        circle,
        rgba(255, 255, 255, 0.30) 0%,
        rgba(255, 255, 255, 0.22) 10%,
        rgba(236, 253, 245, 0.16) 24%,
        rgba(209, 250, 229, 0.11) 40%,
        rgba(167, 243, 208, 0.05) 58%,
        transparent 76%
    );

    filter: blur(20px);

    animation:
        reflectionPulse 8s ease-in-out infinite;
}

@keyframes reflectionPulse {

    0%,
    100% {
        transform:
            translate(-50%, -50%)
            scale(0.65);

        opacity: 0.28;
    }

    50% {
        transform:
            translate(-50%, -50%)
            scale(1.2);

        opacity: 1;
    }
}


/* =========================================================
   INNER WHITE LIGHT BLOOM
   ========================================================= */

.glass-light {
    position: absolute;

    left: 50%;
    top: 50%;

    width: 220px;
    height: 220px;

    transform: translate(-50%, -50%);

    border-radius: 9999px;

    background: radial-gradient(
        circle,
        rgba(255, 255, 255, 0.50) 0%,
        rgba(255, 255, 255, 0.34) 12%,
        rgba(236, 253, 245, 0.22) 28%,
        rgba(209, 250, 229, 0.11) 48%,
        transparent 74%
    );

    filter: blur(16px);

    animation:
        lightBloom 5s ease-in-out infinite;
}

@keyframes lightBloom {

    0%,
    100% {
        opacity: 0.55;

        transform:
            translate(-50%, -50%)
            scale(0.8);
    }

    50% {
        opacity: 1;

        transform:
            translate(-50%, -50%)
            scale(1.12);
    }
}


/* =========================================================
   WHITE GLASS HORIZONTAL REFLECTION
   ========================================================= */

.glass-beam-horizontal {
    position: absolute;

    left: 50%;
    top: 50%;

    width: 340px;
    height: 7px;

    transform: translate(-50%, -50%);

    background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.08) 18%,
        rgba(255, 255, 255, 0.28) 35%,
        rgba(255, 255, 255, 0.65) 45%,
        #ffffff 50%,
        rgba(255, 255, 255, 0.65) 55%,
        rgba(255, 255, 255, 0.28) 65%,
        rgba(255, 255, 255, 0.08) 82%,
        transparent 100%
    );

    filter: blur(3px);

    box-shadow:
        0 0 12px rgba(255, 255, 255, 0.65),
        0 0 30px rgba(255, 255, 255, 0.40),
        0 0 55px rgba(255, 255, 255, 0.20);
}


/* =========================================================
   WHITE GLASS VERTICAL REFLECTION
   ========================================================= */

.glass-beam-vertical {
    position: absolute;

    left: 50%;
    top: 50%;

    width: 7px;
    height: 340px;

    transform: translate(-50%, -50%);

    background: linear-gradient(
        180deg,
        transparent 0%,
        rgba(255, 255, 255, 0.08) 18%,
        rgba(255, 255, 255, 0.28) 35%,
        rgba(255, 255, 255, 0.65) 45%,
        #ffffff 50%,
        rgba(255, 255, 255, 0.65) 55%,
        rgba(255, 255, 255, 0.28) 65%,
        rgba(255, 255, 255, 0.08) 82%,
        transparent 100%
    );

    filter: blur(3px);

    box-shadow:
        0 0 12px rgba(255, 255, 255, 0.65),
        0 0 30px rgba(255, 255, 255, 0.40),
        0 0 55px rgba(255, 255, 255, 0.20);
}


/* =========================================================
   HOT WHITE GLASS CORE
   ========================================================= */

.glass-core {
    position: absolute;

    left: 50%;
    top: 50%;

    width: 18px;
    height: 18px;

    transform: translate(-50%, -50%);

    border-radius: 9999px;

    background: #ffffff;

    box-shadow:
        0 0 5px #ffffff,
        0 0 12px #ffffff,
        0 0 24px #ffffff,
        0 0 42px rgba(255, 255, 255, 0.95),
        0 0 70px rgba(255, 255, 255, 0.75),
        0 0 110px rgba(255, 255, 255, 0.48),
        0 0 160px rgba(255, 255, 255, 0.25),
        0 0 210px rgba(255, 255, 255, 0.12);

    z-index: 5;

    animation:
        corePulse 3s ease-in-out infinite;
}

@keyframes corePulse {

    0%,
    100% {
        transform:
            translate(-50%, -50%)
            scale(0.75);

        opacity: 0.75;
    }

    50% {
        transform:
            translate(-50%, -50%)
            scale(1.2);

        opacity: 1;
    }
}


/* =========================================================
   GLASS SHINE MAIN ANIMATION
   ========================================================= */

@keyframes glassShine {

    0% {
        transform: scale(0.2);
        opacity: 0;
    }

    12% {
        transform: scale(0.35);
        opacity: 0.12;
    }

    25% {
        transform: scale(0.8);
        opacity: 0.65;
    }

    35% {
        transform: scale(1.08);
        opacity: 1;
    }

    45% {
        transform: scale(0.94);
        opacity: 0.82;
    }

    55% {
        transform: scale(1.12);
        opacity: 1;
    }

    68% {
        transform: scale(0.78);
        opacity: 0.48;
    }

    82% {
        transform: scale(0.38);
        opacity: 0.08;
    }

    100% {
        transform: scale(0.2);
        opacity: 0;
    }
}


/* =========================================================
   SMALL WHITE GLASS PARTICLES
   ========================================================= */

.glass-dot {
    position: absolute;

    width: 3px;
    height: 3px;

    border-radius: 9999px;

    background: #ffffff;

    box-shadow:
        0 0 5px #ffffff,
        0 0 12px rgba(255, 255, 255, 0.95),
        0 0 24px rgba(255, 255, 255, 0.55);

    animation:
        dotShine 4s ease-in-out infinite;
}

.glass-dot-1 {
    left: 11%;
    top: 50%;
}

.glass-dot-2 {
    left: 22%;
    top: 17%;
    animation-delay: 1s;
}

.glass-dot-3 {
    left: 31%;
    top: 72%;
    animation-delay: 2s;
}

.glass-dot-4 {
    left: 40%;
    top: 25%;
    animation-delay: 0.5s;
}

.glass-dot-5 {
    left: 52%;
    top: 78%;
    animation-delay: 2.5s;
}

.glass-dot-6 {
    left: 63%;
    top: 22%;
    animation-delay: 1.4s;
}

.glass-dot-7 {
    left: 73%;
    top: 70%;
    animation-delay: 3s;
}

.glass-dot-8 {
    left: 82%;
    top: 38%;
    animation-delay: 1.8s;
}

.glass-dot-9 {
    left: 91%;
    top: 62%;
    animation-delay: 2.8s;
}

.glass-dot-10 {
    left: 47%;
    top: 38%;
    animation-delay: 3.4s;
}

@keyframes dotShine {

    0%,
    100% {
        transform: scale(0.3);
        opacity: 0.08;
    }

    50% {
        transform: scale(2);
        opacity: 1;
    }
}


/* =========================================================
   GLASS RINGS
   ========================================================= */

.glass-ring {
    border: 1px solid rgba(255, 255, 255, 0.06);

    box-shadow:
        0 0 20px rgba(255, 255, 255, 0.02),
        inset 0 0 20px rgba(255, 255, 255, 0.015);

    animation:
        ringFloat 10s ease-in-out infinite;
}

.glass-ring-2 {
    animation-delay: 3s;
}

@keyframes ringFloat {

    0%,
    100% {
        opacity: 0.12;

        transform:
            translate(-50%, -50%)
            scale(0.95);
    }

    50% {
        opacity: 0.42;

        transform:
            translate(-50%, -50%)
            scale(1.04);
    }
}


/* =========================================================
   LOGO FLOAT
   ========================================================= */

.logo-power {
    animation:
        logoFloat 5s ease-in-out infinite;
}

@keyframes logoFloat {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-6px);
    }
}


/* =========================================================
   DATE CARD WHITE GLOW
   ========================================================= */

.date-power {
    animation:
        dateGlow 4s ease-in-out infinite;
}

@keyframes dateGlow {

    0%,
    100% {
        box-shadow:
            0 0 20px rgba(255, 255, 255, 0.10);
    }

    50% {
        box-shadow:
            0 0 30px rgba(255, 255, 255, 0.25),
            0 0 55px rgba(255, 255, 255, 0.12);
    }
}


/* =========================================================
   STATUS GLOW
   ========================================================= */

.status-power {
    animation:
        statusGlow 3s ease-in-out infinite;
}

@keyframes statusGlow {

    0%,
    100% {
        box-shadow:
            0 0 0 rgba(255, 255, 255, 0);
    }

    50% {
        box-shadow:
            0 0 22px rgba(255, 255, 255, 0.06);
    }
}


/* =========================================================
   CONTACT ICON HOVER
   ========================================================= */

.contact-link:hover .contact-icon {
    box-shadow:
        0 0 15px rgba(255, 255, 255, 0.45),
        0 0 30px rgba(255, 255, 255, 0.20);
}


/* =========================================================
   BOTTOM EMERALD-WHITE GLOW
   ========================================================= */

.bottom-glow {
    background: radial-gradient(
        ellipse,
        rgba(255, 255, 255, 0.18) 0%,
        rgba(52, 211, 153, 0.22) 25%,
        rgba(16, 185, 129, 0.10) 45%,
        transparent 70%
    );

    filter: blur(25px);

    animation:
        bottomGlow 5s ease-in-out infinite;
}

@keyframes bottomGlow {

    0%,
    100% {
        opacity: 0.3;

        transform:
            translateX(-50%)
            scaleX(0.8);
    }

    50% {
        opacity: 0.8;

        transform:
            translateX(-50%)
            scaleX(1.15);
    }
}


/* =========================================================
   MOBILE
   ========================================================= */

@media (max-width: 640px) {

    .glass-shine-1 {
        left: -18%;
        top: 5%;
    }

    .glass-shine-2 {
        right: -18%;
        top: 10%;
    }

    .glass-shine {
        width: 320px;
        height: 320px;
    }

    .glass-reflection {
        width: 300px;
        height: 300px;
    }

    .glass-beam-horizontal {
        width: 300px;
    }

    .glass-beam-vertical {
        height: 300px;
    }


    /* Lens flare mobile adjustment */

    .cinematic-flare-1 {
        left: 42%;
        top: 15%;
    }

    .cinematic-flare-2 {
        left: -30%;
        top: 40%;
    }

    .flare-diagonal-beam {
        width: 600px;
    }

    .flare-soft-beam {
        width: 650px;
    }

    .flare-ray-horizontal {
        width: 300px;
    }

    .flare-ray-vertical {
        height: 300px;
    }

    .flare-ghost-1 {
        transform:
            translate(-50%, -50%)
            translate(-190px, 110px)
            scale(0.7);
    }

    .flare-ghost-2 {
        transform:
            translate(-50%, -50%)
            translate(-130px, 75px)
            scale(0.7);
    }
}


/* =========================================================
   ACCESSIBILITY
   ========================================================= */

@media (prefers-reduced-motion: reduce) {

    .emerald-core,
    .emerald-cloud,
    .cinematic-flare,
    .flare-diagonal-beam,
    .flare-soft-beam,
    .flare-bloom,
    .flare-core,
    .flare-ghost,
    .glass-shine,
    .glass-reflection,
    .glass-light,
    .glass-core,
    .glass-dot,
    .glass-ring,
    .logo-power,
    .date-power,
    .status-power,
    .bottom-glow {
        animation: none !important;
    }
}
</style>