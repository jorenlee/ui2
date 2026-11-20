<script setup>
useHead({
  title: 'Metau | Open Educational Resources | La Salle University',
  meta: [{
    name: 'description',
    content: 'Meet Metau, La Salle University’s Open Educational Resources initiative. Share knowledge, support inclusive education, and contribute free learning materials.',
  }],
});

// SDG palette: https://www.un.org/sustainabledevelopment/news/communications-material/
const goals = [
  {
    number: 4,
    name: 'Quality Education',
    color: '#c5192d',
    tint: '#fdf0f2',
    icon: 'fa-book-open',
    description: 'Make quality learning materials accessible and support a lifetime of discovery.',
    url: 'https://sdgs.un.org/goals/goal4',
  },
  {
    number: 10,
    name: 'Reduced Inequalities',
    color: '#dd1367',
    tint: '#fff0f6',
    icon: 'fa-equals',
    description: 'Help close learning gaps with free resources that welcome more learners.',
    url: 'https://sdgs.un.org/goals/goal10',
  },
  {
    number: 17,
    name: 'Partnerships for the Goals',
    color: '#19486a',
    tint: '#edf4f9',
    icon: 'fa-handshake',
    description: 'Connect educators, students, and partners through the exchange of knowledge.',
    url: 'https://sdgs.un.org/goals/goal17',
  },
];
</script>

<template>
  <div class="oer-page">
    <Header />

    <main id="oer-main">
      <div class="oer-breadcrumb-wrap">
        <nav class="oer-shell oer-breadcrumb" aria-label="Breadcrumb">
          <NuxtLink to="/">Home</NuxtLink>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Metau: LSU OER</span>
        </nav>
      </div>

      <section class="oer-hero" aria-labelledby="oer-title">
        <div class="oer-shell oer-hero-grid">
          <div class="oer-hero-copy">
            <p class="oer-eyebrow"><span class="oer-brand-mark" aria-hidden="true"></span> Metau · LSU OER</p>
            <h1 id="oer-title">Open knowledge.<br><span>Endless possibilities.</span></h1>
            <p class="oer-hero-description">
              Great ideas grow when we share them. Discover La Salle University’s
              <strong>Open Educational Resources</strong> initiative, where our community
              comes together to make quality learning accessible to all.
            </p>
            <div class="oer-actions">
              <NuxtLink to="/dashboard" class="oer-button oer-button-primary">
                <i class="fa-solid fa-upload" aria-hidden="true"></i>
                Contribute a resource
              </NuxtLink>
              <a href="#about-metau" class="oer-button oer-button-secondary">Get to know Metau</a>
            </div>
            <div class="oer-formats" aria-label="Resource formats">
              <span><i class="fa-regular fa-file-lines" aria-hidden="true"></i> Documents</span>
              <span><i class="fa-brands fa-google-drive" aria-hidden="true"></i> Google Docs</span>
              <span><i class="fa-solid fa-circle-play" aria-hidden="true"></i> Videos</span>
            </div>
          </div>

          <div class="oer-art-panel" aria-hidden="true">
            <div class="oer-art-heading"><span class="oer-art-symbol">m.</span><span>A little knowledge.<br>A world of possibility.</span></div>
            <svg class="oer-book-art" viewBox="0 0 520 345" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="260" cy="182" r="142" fill="#d7e9dd" />
              <circle cx="260" cy="182" r="112" stroke="#b4cebe" stroke-dasharray="4 9" />
              <path d="M79 126C118 66 175 45 224 60M305 57C365 59 412 103 434 144M424 247C393 289 350 308 310 310M195 309C137 298 106 270 87 234" stroke="#a0bda9" stroke-width="1.5" />
              <path d="M109 149L250 185L410 142V270L268 310L109 271V149Z" fill="#163f32" fill-opacity=".12" />
              <path d="M107 135L257 169L411 135V258L264 297L107 259V135Z" fill="#12583d" stroke="#12583d" stroke-width="7" stroke-linejoin="round" />
              <path d="M119 115C163 106 211 120 259 147V279C208 251 163 240 119 246V115Z" fill="#fff" stroke="#19486a" stroke-width="3" stroke-linejoin="round" />
              <path d="M259 147C306 120 355 106 400 115V246C353 240 309 251 259 279V147Z" fill="#f7faf8" stroke="#19486a" stroke-width="3" stroke-linejoin="round" />
              <path d="M259 149V276" stroke="#19486a" stroke-width="3" />
              <path d="M142 142C174 140 202 148 232 162M142 163C174 161 202 170 232 183M142 184C174 182 202 191 232 204M142 205C165 204 183 208 204 216" stroke="#c4d5ce" stroke-width="5" stroke-linecap="round" />
              <path d="M286 163C316 149 345 141 377 142M286 184C316 170 345 162 377 163M286 205C316 191 345 183 377 184M286 226C306 216 328 209 350 207" stroke="#c4d5ce" stroke-width="5" stroke-linecap="round" />
              <path d="M345 114L361 112V181L353 174L345 182V114Z" fill="#c5192d" />
              <rect x="67" y="70" width="75" height="65" rx="15" fill="#c5192d" />
              <text x="83" y="91" fill="white" font-size="11" font-family="Arial, sans-serif" font-weight="700">SDG</text>
              <text x="83" y="121" fill="white" font-size="31" font-family="Arial, sans-serif" font-weight="700">4</text>
              <rect x="379" y="64" width="75" height="65" rx="15" fill="#dd1367" />
              <text x="394" y="85" fill="white" font-size="11" font-family="Arial, sans-serif" font-weight="700">SDG</text>
              <text x="394" y="115" fill="white" font-size="31" font-family="Arial, sans-serif" font-weight="700">10</text>
              <rect x="361" y="255" width="75" height="65" rx="15" fill="#19486a" />
              <text x="376" y="276" fill="white" font-size="11" font-family="Arial, sans-serif" font-weight="700">SDG</text>
              <text x="376" y="306" fill="white" font-size="31" font-family="Arial, sans-serif" font-weight="700">17</text>
              <path d="M272 62V42M262 52H282M88 211V195M80 203H96" stroke="#197048" stroke-width="3" stroke-linecap="round" />
              <circle cx="343" cy="47" r="5" fill="#dd1367" />
              <circle cx="157" cy="292" r="5" fill="#c5192d" />
            </svg>
            <div class="oer-art-caption"><span>Learn.</span><span>Create.</span><span>Share.</span></div>
          </div>
        </div>
      </section>

      <section class="oer-goals-section" aria-labelledby="oer-goals-title">
        <div class="oer-shell">
          <div class="oer-section-heading">
            <div>
              <p class="oer-eyebrow">Local knowledge. Global purpose.</p>
              <h2 id="oer-goals-title">Learning that makes a difference.</h2>
            </div>
            <p>Our commitment to open education supports the United Nations Sustainable Development Goals.</p>
          </div>
          <div class="oer-goals-grid">
            <article v-for="goal in goals" :key="goal.number" class="oer-goal" :style="{ '--goal-color': goal.color, '--goal-tint': goal.tint }">
              <div class="oer-goal-top">
                <span class="oer-goal-number"><span>SDG</span>{{ goal.number }}</span>
                <i :class="['fa-solid', goal.icon]" aria-hidden="true"></i>
              </div>
              <h3>{{ goal.name }}</h3>
              <p>{{ goal.description }}</p>
              <a :href="goal.url" class="oer-goal-link">About SDG {{ goal.number }}<span class="oer-sr-only"> on the United Nations website</span></a>
            </article>
          </div>
        </div>
      </section>

      <section id="about-metau" class="oer-about-section" aria-labelledby="oer-about-title">
        <div class="oer-shell oer-about-grid">
          <div class="oer-about-intro">
            <p class="oer-eyebrow">Rooted in our community</p>
            <h2 id="oer-about-title">Meet Metau.</h2>
            <div class="oer-definition">
              <span class="oer-definition-word">Metau</span>
              <span>A Subanen word meaning <strong>“knowledgeable.”</strong></span>
            </div>
          </div>
          <div class="oer-about-copy">
            <p>Knowledge is something we build together. La Salle University’s Open Educational Resources initiative gives faculty, students, and partners a space to create and share free, high-quality learning materials with local, national, and global communities.</p>
            <p>Guided by <strong>Strategic Intent 1, Goal 1.1.2</strong> and anchored on the <strong>UNESCO Recommendation on OER (2019)</strong>, Metau advances quality education through inclusivity, collaboration, and lifelong learning.</p>
            <p>Every contribution joins a wider movement of open knowledge, empowering learners and strengthening education for all.</p>
          </div>
        </div>
      </section>

      <section class="oer-contribute-section" aria-labelledby="oer-contribute-title">
        <div class="oer-shell">
          <div class="oer-contribute-banner">
            <div>
              <p class="oer-eyebrow">Your knowledge can go further</p>
              <h2 id="oer-contribute-title">Share a resource. Inspire a learner.</h2>
              <p>A lesson, a guide, a video. Start with something you know.</p>
            </div>
            <NuxtLink to="/dashboard" class="oer-button oer-button-light">
              <i class="fa-solid fa-upload" aria-hidden="true"></i> Contribute to Metau
            </NuxtLink>
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.oer-page {
  --oer-green: #146444;
  --oer-ink: #153b30;
  --oer-muted: #52665e;
  background: #fff;
  color: var(--oer-ink);
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 1rem;
  line-height: 1.7;
}
.oer-page *, .oer-page *::before, .oer-page *::after { box-sizing: border-box; }
.oer-shell { width: min(100% - 3rem, 76rem); margin-inline: auto; }
.oer-breadcrumb-wrap { border-bottom: 1px solid #e5ece7; }
.oer-breadcrumb { display: flex; align-items: center; flex-wrap: wrap; gap: .75rem; padding-block: 1rem; font-size: .875rem; color: var(--oer-muted); }
.oer-breadcrumb a { color: var(--oer-green); text-decoration: none; }
.oer-breadcrumb a:hover { text-decoration: underline; }
.oer-hero { padding-block: clamp(2.5rem, 5vw, 5rem); }
.oer-hero-grid { display: grid; grid-template-columns: minmax(0, 1.14fr) minmax(0, 1fr); gap: clamp(2rem, 5vw, 4.5rem); align-items: center; }
.oer-hero-copy { min-width: 0; }
.oer-eyebrow { margin: 0 0 1rem; color: var(--oer-green); font-size: .875rem; font-weight: 700; letter-spacing: .11em; line-height: 1.5; text-transform: uppercase; }
.oer-hero-copy > .oer-eyebrow { display: flex; align-items: center; gap: .65rem; }
.oer-brand-mark { width: 1.1rem; height: 1.1rem; flex-shrink: 0; background: var(--oer-green); border-radius: .2rem .7rem .2rem .2rem; }
.oer-hero h1 { margin: 0; font-size: clamp(2.4rem, 4.15vw, 3.65rem); line-height: 1.13; font-weight: 750; letter-spacing: -.045em; text-wrap: balance; }
.oer-hero h1 span { color: var(--oer-green); }
.oer-hero-description { max-width: 35rem; margin: 1.5rem 0 0; color: var(--oer-muted); font-size: 1.0625rem; line-height: 1.85; }
.oer-hero-description strong { color: var(--oer-ink); font-weight: 600; }
.oer-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem; margin-top: 1.85rem; }
.oer-button { display: inline-flex; justify-content: center; align-items: center; gap: .65rem; min-height: 3.125rem; padding: .75rem 1.2rem; border: 1px solid transparent; border-radius: .65rem; font-size: .9375rem; font-weight: 650; line-height: 1.5; text-align: center; text-decoration: none; transition: background-color .18s, border-color .18s; }
.oer-button-primary { background: var(--oer-green); color: #fff; }
.oer-button-primary:hover { background: #0c4b31; }
.oer-button-secondary { border-color: #cbdad1; background: #fff; color: var(--oer-ink); }
.oer-button-secondary:hover { background: #f1f7f3; border-color: var(--oer-green); }
.oer-formats { display: flex; flex-wrap: wrap; gap: .6rem 1.35rem; margin-top: 1.8rem; color: var(--oer-muted); font-size: .875rem; }
.oer-formats span { display: inline-flex; align-items: center; gap: .5rem; }
.oer-formats i { color: var(--oer-green); }
.oer-art-panel { position: relative; min-width: 0; padding: 1.75rem 1.75rem 1.35rem; border: 1px solid #d8e6dd; border-radius: 1.5rem; background: #edf5ef; }
.oer-art-heading { display: flex; align-items: center; gap: .85rem; font-size: .875rem; font-weight: 600; line-height: 1.45; }
.oer-art-symbol { display: grid; place-items: center; width: 2.8rem; height: 2.8rem; border-radius: .75rem; background: var(--oer-green); color: #fff; font-family: Georgia, serif; font-size: 2.1rem; line-height: 1; }
.oer-book-art { display: block; width: 100%; height: auto; margin-block: .25rem; }
.oer-art-caption { display: flex; justify-content: center; gap: 1.65rem; padding-top: .6rem; border-top: 1px solid #cfdfd4; font-size: .875rem; font-weight: 650; }
.oer-art-caption span:nth-child(1) { color: #a81729; }
.oer-art-caption span:nth-child(2) { color: #b50d54; }
.oer-art-caption span:nth-child(3) { color: #19486a; }
.oer-goals-section { padding-block: 3.75rem; border-block: 1px solid #e6ece8; background: #f7f9f8; }
.oer-section-heading { display: flex; justify-content: space-between; align-items: end; gap: 2rem; margin-bottom: 1.8rem; }
.oer-section-heading .oer-eyebrow { margin-bottom: .5rem; }
.oer-page h2 { margin: 0; font-size: clamp(1.75rem, 2.7vw, 2.3rem); line-height: 1.25; font-weight: 700; letter-spacing: -.035em; text-wrap: balance; }
.oer-section-heading > p { max-width: 22rem; margin: 0; color: var(--oer-muted); font-size: 1rem; }
.oer-goals-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.25rem; }
.oer-goal { display: flex; flex-direction: column; min-width: 0; padding: 1.6rem; border: 1px solid #e0e7e3; border-top: 4px solid var(--goal-color); border-radius: .85rem; background: #fff; }
.oer-goal-top { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.4rem; }
.oer-goal-number { display: flex; align-items: center; gap: .45rem; color: var(--goal-color); font-size: 1.6rem; font-weight: 750; line-height: 1; }
.oer-goal-number > span { font-size: .875rem; letter-spacing: .06em; }
.oer-goal-top > i { display: grid; place-items: center; width: 3rem; height: 3rem; border-radius: .7rem; background: var(--goal-tint); color: var(--goal-color); font-size: 1.2rem; }
.oer-goal h3 { margin: 0; font-size: 1.25rem; line-height: 1.4; font-weight: 700; letter-spacing: -.02em; }
.oer-goal > p { margin: .75rem 0 1.25rem; color: var(--oer-muted); font-size: 1rem; line-height: 1.7; }
.oer-goal-link { align-self: start; display: inline-flex; align-items: center; min-height: 2.75rem; margin-top: auto; color: var(--oer-ink); font-size: .875rem; font-weight: 650; text-decoration: underline; text-underline-offset: .25em; text-decoration-color: var(--goal-color); }
.oer-goal-link:hover { color: var(--goal-color); }
.oer-about-section { padding-block: 4.5rem; scroll-margin-top: 10rem; }
.oer-about-grid { display: grid; grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); gap: clamp(2rem, 6vw, 6rem); }
.oer-about-intro .oer-eyebrow { margin-bottom: .6rem; }
.oer-definition { display: flex; flex-direction: column; gap: .4rem; max-width: 24rem; margin-top: 1.75rem; padding-left: 1.1rem; border-left: 3px solid var(--oer-green); color: var(--oer-muted); font-size: 1rem; line-height: 1.7; }
.oer-definition-word { color: var(--oer-green); font-family: Georgia, serif; font-size: 2rem; font-style: italic; line-height: 1.3; }
.oer-definition strong { color: var(--oer-ink); font-weight: 600; }
.oer-about-copy p { margin: 0 0 1rem; color: var(--oer-muted); font-size: 1rem; line-height: 1.85; }
.oer-about-copy p:last-child { margin-bottom: 0; }
.oer-about-copy strong { color: var(--oer-ink); font-weight: 600; }
.oer-contribute-section { padding-bottom: 4.5rem; }
.oer-contribute-banner { display: flex; align-items: center; justify-content: space-between; gap: 2rem; padding: clamp(1.5rem, 3.5vw, 3rem); border-radius: 1.1rem; background: #19486a; color: #fff; }
.oer-contribute-banner .oer-eyebrow { margin-bottom: .65rem; color: #c4e4f1; }
.oer-contribute-banner h2 { max-width: 35rem; font-size: clamp(1.6rem, 2.5vw, 2rem); }
.oer-contribute-banner p:last-child { margin: .8rem 0 0; color: #dae8f0; font-size: 1rem; }
.oer-button-light { flex-shrink: 0; background: #fff; color: #19486a; }
.oer-button-light:hover { background: #e8f2f8; }
.oer-page a:focus-visible { outline: 3px solid #19486a; outline-offset: 4px; }
.oer-contribute-banner a:focus-visible { outline-color: #fff; }
.oer-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 1000px) {
  .oer-hero-grid { gap: 2rem; }
  .oer-hero h1 { font-size: clamp(2.1rem, 4.4vw, 3rem); }
  .oer-art-panel { padding: 1.25rem; }
  .oer-section-heading { align-items: start; }
  .oer-section-heading > p { max-width: 18rem; }
  .oer-goal { padding: 1.25rem; }
}
@media (max-width: 760px) {
  .oer-shell { width: min(100% - 2rem, 38rem); }
  .oer-hero { padding-block: 2.5rem; }
  .oer-hero-grid, .oer-about-grid { grid-template-columns: minmax(0, 1fr); }
  .oer-hero h1 { font-size: clamp(2.2rem, 6.8vw, 3.3rem); }
  .oer-hero-description { font-size: 1rem; }
  .oer-art-panel { margin-top: .5rem; }
  .oer-book-art { max-width: 27rem; margin-inline: auto; }
  .oer-section-heading { flex-direction: column; gap: .85rem; }
  .oer-section-heading > p { max-width: none; }
  .oer-goals-grid { grid-template-columns: minmax(0, 1fr); gap: 1rem; }
  .oer-goal { padding: 1.4rem; }
  .oer-goal-top { margin-bottom: 1rem; }
  .oer-goals-section, .oer-about-section { padding-block: 2.75rem; }
  .oer-about-grid { gap: 1.5rem; }
  .oer-definition { margin-top: 1.25rem; }
  .oer-contribute-section { padding-bottom: 2.75rem; }
  .oer-contribute-banner { flex-direction: column; align-items: start; gap: 1.4rem; }
}
@media (max-width: 420px) {
  .oer-actions { flex-direction: column; align-items: stretch; }
  .oer-actions .oer-button, .oer-button-light { width: 100%; }
  .oer-formats { justify-content: space-between; gap: .75rem; }
  .oer-art-panel { padding: 1.1rem; border-radius: 1rem; }
  .oer-hero h1 { font-size: clamp(2rem, 9vw, 2.5rem); }
}
@media (prefers-reduced-motion: reduce) {
  .oer-button { transition: none; }
}
</style>
