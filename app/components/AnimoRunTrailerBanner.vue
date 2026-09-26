<template>
  <div class="poster w-full h-screen">
    <!-- Background wash + grain -->
    <div class="bg-wash"></div>
    <div class="grain"></div>

    <!-- Lens flare -->
    <div class="lens-flare">
      <div class="beam"></div>
      <div class="beam-glow"></div>

      <!-- Primary and secondary aperture rings -->
      <div class="ring ring-main"></div>
      <!-- <div class="ring ring-upper"></div> -->
      <div class="ring-inner -ml-44"></div>

      <!-- Core radiance -->
      <div class="bloom -ml-20"></div>
      <div class="core"></div>

      <!-- Lower-left ghost glare trail -->
      <!-- <div class="ghost ghost1"></div>
      <div class="ghost ghost2"></div>
      <div class="ghost ghost3"></div> -->
      <!-- <div class="ghost ghost4"></div> -->
      <!-- <div class="ghost ghost5"></div> -->
      <!-- <div class="ghost ghost6"></div>  -->

      <!-- Upper-right opposite glare circles (other side) -->
      <!-- <div class="ghost ghost-opp1"></div> -->
      <!-- <div class="ghost ghost-opp2"></div>
      <div class="ghost ghost-opp3"></div> -->
    </div>

    <!-- Content -->
    <div class="content">
      <img class="lg:w-2/12 w-8/12"
        src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/20th%20Anniversary%20Emerald%20Logos-20260618T012425Z-3-001/20th%20Anniversary%20Emerald%20Logos/Emerald%20%26%20Theme%20with%20Corp%20Logo.png"
        alt="La Salle Ozamiz 20 Years" />

     
<h1 class="headline text-9xl typing-title">
  <span class="typing-text">The Emerald Run</span><span class="typing-cursor">|</span>
</h1>


      <p class="subtitle text-7xl">ANIMO Run 2026</p>

      <div class="date-badge">November 14, 2026</div>

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
    
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&display=swap');

.poster {
  position: relative;
  overflow: hidden;
  color: #fff;
  font-family: 'Poppins', sans-serif;
  container-type: size;
  container-name: poster;
  background-color: #06160c;
}

/* =========================================================
   Background: Lush emerald gradients + dark corner fade circles + film grain
========================================================= */
.bg-wash {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    /* 4 Smooth dark circular fades in the corner areas */
    radial-gradient(circle 500px at 10% 20%, rgba(2, 8, 4, 0.82) 0%, rgba(3, 12, 6, 0.45) 45%, transparent 72%),
    radial-gradient(circle 520px at 88% 20%, rgba(2, 8, 4, 0.82) 0%, rgba(3, 12, 6, 0.45) 45%, transparent 72%),
    radial-gradient(circle 500px at 10% 82%, rgba(2, 8, 4, 0.80) 0%, rgba(3, 12, 6, 0.42) 45%, transparent 72%),

    /* Luminous emerald center and flare highlights */
    radial-gradient(circle 520px at 33.5% 37%, rgba(45, 160, 90, 0.55) 0%, rgba(26, 115, 60, 0.25) 48%, transparent 75%),
    radial-gradient(ellipse 70% 60% at 82% 48%, rgba(32, 125, 68, 0.42) 0%, transparent 68%),
    radial-gradient(ellipse 70% 55% at 50% 50%, transparent 35%, rgba(4, 16, 9, 0.55) 80%, #030f06 100%),
    radial-gradient(ellipse 95% 80% at 50% 45%, #18522e 0%, #10381e 52%, #05140a 100%);
}

.grain {
  position: absolute;
  inset: 0;
  opacity: .11;
  mix-blend-mode: overlay;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* =========================================================
   Content: centered flex column, full screen
========================================================= */
.content {
  position: relative;
  z-index: 3;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  user-select: none;
}


.headline {
  margin: 4.2cqmin 0 0;
  font-family: 'Poppins', sans-serif;
  font-weight: 800;

  line-height: 1.05;
  letter-spacing: -.015em;
  text-align: center;
  text-shadow: 0 .35cqmin 1.4cqmin rgba(0, 0, 0, .45), 0 .15cqmin .4cqmin rgba(0, 0, 0, .3);
  white-space: nowrap;
}

.subtitle {
  margin-bottom: 70px;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  letter-spacing: .015em;
  text-align: center;
  text-shadow: 0 .2cqmin .9cqmin rgba(0, 0, 0, .4);
  white-space: nowrap;
}

.date-badge {
  margin-top: 2.1cqmin;
  background: #fff;
  color: #113824;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 2.35cqmin;
  padding: .6cqmin 1.8cqmin;
  border-radius: .45cqmin;
  white-space: nowrap;
  box-shadow: 0 .25cqmin .8cqmin rgba(0, 0, 0, .22);
}

.social-row {
  margin-top: 5.6cqmin;
  display: flex;
  align-items: center;
  gap: 3.4cqmin;
}

.social-item {
  display: flex;
  align-items: center;
  gap: .9cqmin;
  color: #fff;
  text-decoration: none;
  white-space: nowrap;
  transition: opacity .2s ease;
}

.social-item:hover {
  opacity: .85;
}

.social-icon {
  width: 2.6cqmin;
  height: 2.6cqmin;
  min-width: 22px;
  min-height: 22px;
  border-radius: 50%;
  background: #fff;
  color: #113824;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 .2cqmin .6cqmin rgba(0, 0, 0, .2);
}

.social-label {
  font-family: 'Poppins', sans-serif;
  font-size: 1.65cqmin;
  font-weight: 500;
  letter-spacing: .01em;
}

/* =========================================================
   Lens flare & Smooth Organic Light Animation
   Anchored at top-left of center (above "The")
========================================================= */
.lens-flare {
  position: absolute;
  left: 35%;
  top: 40%;
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: 2;
  animation: flare-sway 8s ease-in-out infinite alternate;
  will-change: transform;
  rotate: 330deg;
}

@keyframes flare-sway {
  0% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(4px, -3px);
  }

  100% {
    transform: translate(-3px, 2px);
  }
}

/* Controlled horizontal flare glint with smooth gleam */
.beam {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 320px;
  max-width: 32vw;
  height: 1.5px;
  background: linear-gradient(90deg,
      transparent 0%,
      rgba(255, 255, 255, .05) 15%,
      rgba(255, 255, 255, .4) 38%,
      rgba(255, 255, 255, .95) 48%,
      #ffffff 50%,
      rgba(255, 255, 255, .95) 52%,
      rgba(255, 255, 255, .4) 62%,
      rgba(255, 255, 255, .05) 85%,
      transparent 100%);
  filter: blur(.3px);
  box-shadow:
    0 0 6px rgba(255, 255, 255, .85),
    0 0 14px rgba(255, 255, 255, .45),
    0 0 25px rgba(180, 255, 215, .25);
  animation: beam-pulse 6s ease-in-out infinite alternate;
}

.beam-glow {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 260px;
  max-width: 28vw;
  height: 14px;
  background: linear-gradient(90deg,
      transparent 0%,
      rgba(255, 255, 255, .08) 22%,
      rgba(255, 255, 255, .28) 45%,
      rgba(255, 255, 255, .50) 50%,
      rgba(255, 255, 255, .28) 55%,
      rgba(255, 255, 255, .08) 78%,
      transparent 100%);
  filter: blur(6px);
  opacity: .75;
  animation: beam-pulse 6s ease-in-out infinite alternate;
}

@keyframes beam-pulse {
  0% {
    opacity: .70;
    transform: translate(-50%, -50%) scaleX(.94);
  }

  50% {
    opacity: .95;
    transform: translate(-50%, -50%) scaleX(1.05);
  }

  100% {
    opacity: .75;
    transform: translate(-50%, -50%) scaleX(.98);
  }
}

/* Main outer aperture ring */
.ring {
  position: absolute;
  left: 50%;
  top: 50%;
  border-radius: 50%;
  pointer-events: none;
}

.ring-main {
  transform: translate(-50%, -50%);
  width: 460px;
  height: 460px;
  border: 0 solid rgba(255, 255, 255, .55);
  box-shadow:
    0 0 12px rgba(255, 255, 255, .16),
    inset 0 0 20px rgba(255, 255, 255, .04);
  opacity: .8;
  animation: ring-breathe 7s ease-in-out infinite alternate;
}

/* Secondary upper ring reaching into the top-right / logo region */
.ring-upper {
  transform: translate(calc(-50% + 45px), calc(-50% - 35px));
  width: 530px;
  height: 530px;
  border: 1px solid rgba(255, 255, 255, .32);
  box-shadow:
    0 0 14px rgba(255, 255, 255, .12),
    inset 0 0 25px rgba(255, 255, 255, .03);
  opacity: .65;
  animation: ring-breathe 8s ease-in-out infinite alternate reverse;
}

/* Inner concentric halo */
.ring-inner {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 700px;
  height: 700px;
  border-radius: 50%;
  border: 0px solid rgba(255, 255, 255, .2);
  /* box-shadow:0 0 16px rgba(255,255,255,.1); */
  opacity: .5;
  animation: ring-breathe 6s ease-in-out infinite alternate;
}

@keyframes ring-breathe {
  0% {
    opacity: .6;
    transform: translate(var(--tx, -50%), var(--ty, -50%)) scale(.99);
  }

  100% {
    opacity: .85;
    transform: translate(var(--tx, -50%), var(--ty, -50%)) scale(1.02);
  }
}

.ring-upper {
  --tx: calc(-50% + 45px);
  --ty: calc(-50% - 35px);
}

/* Radiant bloom and bright hot core */
.bloom {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 700px;
  height: 700px;
  border-radius: 50%;
  background: radial-gradient(circle,
      rgba(255, 255, 255, .95) 0%,
      rgba(200, 255, 225, .65) 25%,
      rgba(90, 215, 150, .22) 55%,
      transparent 75%);
  filter: blur(15px);
  animation: bloom-pulse 1s ease-in-out infinite alternate;
}

.core {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #fff;
  box-shadow:
    0 0 8px #fff,
    0 0 20px #fff,
    0 0 45px rgba(255, 255, 255, .95),
    0 0 80px rgba(140, 250, 180, .5);
  animation: core-gleam 4s ease-in-out infinite alternate;
}

@keyframes bloom-pulse {
  0% {
    opacity: .85;
    transform: translate(-50%, -50%) scale(.96);
  }

  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.06);
  }
}

@keyframes core-gleam {
  0% {
    box-shadow:
      0 0 8px #fff,
      0 0 18px #fff,
      0 0 40px rgba(255, 255, 255, .9),
      0 0 70px rgba(140, 250, 180, 0.13);
  }

  100% {
    box-shadow:
      0 0 10px #fff,
      0 0 24px #fff,
      0 0 55px rgba(255, 255, 255, 1),
      0 0 95px rgba(140, 250, 180, 0.247);
  }
}

/* =========================================================
   Ghost glare circles (Lower-Left & Upper-Right Opposite)
========================================================= */
.ghost {
  position: absolute;
  left: 50%;
  top: 50%;
  border-radius: 50%;
  pointer-events: none;
  animation: ghost-drift 7s ease-in-out infinite alternate;
}

/* Ghost 1: large soft halo disc near core/under "The" */
.ghost1 {
  width: 125px;
  height: 125px;
  transform: translate(calc(-50% - 30px), calc(-50% + 100px));
  background: radial-gradient(circle,
      rgba(160, 245, 195, .22) 0%,
      rgba(255, 255, 255, .14) 60%,
      rgba(255, 255, 255, .04) 85%,
      transparent 100%);
  border: 1px solid rgba(255, 255, 255, .26);
  box-shadow: 0 0 16px rgba(120, 230, 165, .18);
  filter: blur(1px);
  animation-delay: 0.2s;
}

/* Ghost 2: clearly visible disc */
.ghost2 {
  width: 88px;
  height: 88px;
  transform: translate(calc(-50% - 100px), calc(-70% + 200px));
  background: radial-gradient(circle,
      rgba(200, 255, 225, .28) 0%,
      rgba(255, 255, 255, .20) 65%,
      rgba(255, 255, 255, .05) 88%,
      transparent 100%);
  border: 1.2px solid rgba(255, 255, 255, 0.13);
  box-shadow: 0 0 16px rgba(130, 240, 180, .24);
  filter: blur(1px);
  animation-delay: 0.5s;
}

/* Ghost 3: clearly visible medium disc */
.ghost3 {
  width: 68px;
  height: 68px;
  transform: translate(calc(-50% - 96px), calc(-50% + 215px));
  background: radial-gradient(circle,
      rgba(255, 255, 255, .30) 0%,
      rgba(170, 245, 200, .20) 65%,
      transparent 100%);
  border: 1.2px solid rgba(255, 255, 255, 0.137);
  box-shadow: 0 0 14px rgba(130, 240, 180, .2);
  filter: blur(1px);
  animation-delay: 0.8s;
}

/* Ghost 4: smaller glowing disc */
.ghost4 {
  width: 48px;
  height: 48px;
  transform: translate(calc(-50% - 130px), calc(-50% + 285px));
  background: radial-gradient(circle,
      rgba(255, 255, 255, 0) 0%,
      rgba(180, 255, 215, .22) 70%,
      transparent 100%);
  border: 1px solid rgba(255, 255, 255, 0.151);
  box-shadow: 0 0 12px rgba(255, 255, 255, .22);
  animation-delay: 1.1s;
}

/* Ghost 5: compact glare orb */
.ghost5 {
  width: 32px;
  height: 32px;
  transform: translate(calc(-50% - 165px), calc(-50% + 355px));
  background: radial-gradient(circle,
      rgba(255, 255, 255, .40) 0%,
      rgba(255, 255, 255, .15) 75%,
      transparent 100%);
  border: .8px solid rgba(255, 255, 255, 0.089);
  box-shadow: 0 0 8px rgba(255, 255, 255, .18);
  animation-delay: 1.4s;
}

/* Ghost 6: subtle tail orb */
.ghost6 {
  width: 22px;
  height: 22px;
  transform: translate(calc(-50% - 195px), calc(-50% + 420px));
  background: radial-gradient(circle,
      rgba(255, 255, 255, 0.041),
      rgba(255, 255, 255, .1) 70%,
      transparent 100%);
  filter: blur(.8px);
  animation-delay: 1.7s;
}

/* =========================================================
   Opposite side glare (Upper-Right inside red-box region)
========================================================= */
/* Opposite Ghost 1: luminous soft aperture disc */
.ghost-opp1 {
  width: 95px;
  height: 95px;
  transform: translate(calc(-50% + 55px), calc(-50% - 105px));
  background: radial-gradient(circle,
      rgba(180, 255, 220, .24) 0%,
      rgba(255, 255, 255, .15) 60%,
      rgba(255, 255, 255, .04) 85%,
      transparent 100%);
  border: 1px solid rgba(255, 255, 255, .26);
  box-shadow: 0 0 16px rgba(120, 230, 165, .18);
  filter: blur(1.6px);
  animation-delay: 0.3s;
}

/* Opposite Ghost 2: medium glare circle in the upper zone */
.ghost-opp2 {
  width: 65px;
  height: 65px;
  transform: translate(calc(-50% + 110px), calc(-50% - 170px));
  background: radial-gradient(circle,
      rgba(255, 255, 255, .28) 0%,
      rgba(165, 245, 195, .18) 65%,
      transparent 100%);
  border: 1.1px solid rgba(255, 255, 255, .32);
  box-shadow: 0 0 12px rgba(130, 240, 180, .2);
  filter: blur(1.2px);
  animation-delay: 0.7s;
}

/* Opposite Ghost 3: upper subtle glare orb */
.ghost-opp3 {
  width: 42px;
  height: 42px;
  transform: translate(calc(-50% + 160px), calc(-50% - 225px));
  background: radial-gradient(circle,
      rgba(255, 255, 255, .35) 0%,
      rgba(190, 255, 225, .18) 70%,
      transparent 100%);
  border: .9px solid rgba(255, 255, 255, .3);
  box-shadow: 0 0 10px rgba(255, 255, 255, .2);
  animation-delay: 1.1s;
}

@keyframes ghost-drift {
  0% {
    opacity: .75;
    filter: blur(var(--b, 1px)) brightness(.95);
  }

  50% {
    opacity: 1;
    filter: blur(var(--b, 1px)) brightness(1.1);
  }

  100% {
    opacity: .85;
    filter: blur(var(--b, 1px)) brightness(1);
  }
}

/* =========================================================
   Small-screen floor
========================================================= */
@media (max-width:480px) {
  .headline {
    font-size: 11cqmin;
    white-space: normal;
  }

  .subtitle {
    font-size: 5.5cqmin;
  }

  .social-row {
    flex-direction: column;
    gap: 1.4cqmin;
  }
}


/* =========================================================
   Headline Typewriter Effect
   ========================================================= */

.typing-title {
  display: flex;
  align-items: center;
  justify-content: center;
}

.typing-text {
  display: inline-block;
  overflow: hidden;
  width: 0;
  white-space: nowrap;
  animation: typing 2.8s steps(15, end) forwards;
}

.typing-cursor {
  display: inline-block;
  margin-left: 6px;
  font-weight: 400;
  color: #ffffff;
  animation:
    cursor-blink 0.75s step-end infinite,
    cursor-hide 0s 3.1s forwards;
}

/* Types "The Emerald Run" from left to right */
@keyframes typing {
  from {
    width: 0;
  }

  to {
    width: 15ch;
  }
}

/* Blinking cursor */
@keyframes cursor-blink {
  0%,
  50% {
    opacity: 1;
  }

  51%,
  100% {
    opacity: 0;
  }
}

/* Hide cursor after typing finishes */
@keyframes cursor-hide {
  to {
    opacity: 0;
  }
}

.typing-text {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  width: 0;
  animation: typing 4.5s steps(15, end) forwards;
}
</style>