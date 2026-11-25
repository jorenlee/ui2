<template>
  <section id="oer-announcement" class="metau-announcement min-h-screen" aria-labelledby="oer-announcement-title">
    <div class="metau-glow" aria-hidden="true"></div>
    <div class="metau-shell">
      <div class="metau-topline">
        <p class="metau-identity"><span class="metau-mark" aria-hidden="true">m.</span> Metau <span class="metau-divider" aria-hidden="true"></span> LSU OER</p>
        <span class="metau-launch">Introducing our new OER page</span>
      </div>

      <div class="metau-grid">
        <div class="metau-copy">
          <p class="metau-eyebrow">Open Educational Resources</p>
          <h2 id="oer-announcement-title">Open knowledge.<br><span>Endless possibilities.</span></h2>
          <p class="metau-description">
            Great ideas grow when we share them. Discover La Salle University's
            <strong>Open Educational Resources</strong> initiative, where our community
            comes together to make quality learning accessible to all.
          </p>
          <div class="metau-actions">
            <NuxtLink to="/oer" class="metau-button metau-button-primary">
              <i class="fa-solid fa-book-open" aria-hidden="true"></i> Explore Metau
            </NuxtLink>
            <NuxtLink to="/dashboard" class="metau-button metau-button-secondary">
              <i class="fa-solid fa-upload" aria-hidden="true"></i> Contribute a resource
            </NuxtLink>
          </div>
          <div class="metau-formats" aria-label="Explore resource formats">
            <span class="metau-formats-label">A little knowledge, in every format.</span>
            <div class="metau-format-links">
              <NuxtLink to="/oer#oer-resources"><i class="fa-regular fa-file-lines" aria-hidden="true"></i> Documents</NuxtLink>
              <NuxtLink to="/oer#oer-resources"><i class="fa-brands fa-google-drive" aria-hidden="true"></i> Google Docs</NuxtLink>
              <NuxtLink to="/oer#oer-resources"><i class="fa-solid fa-circle-play" aria-hidden="true"></i> Videos</NuxtLink>
            </div>
          </div>
        </div>

        <div class="metau-visual">
          <div class="metau-orbit" aria-hidden="true"></div>
          <figure class="metau-art-card">
            <div class="metau-art-heading">
              <span class="metau-art-label">A world of possibility.</span>
              <span class="metau-art-spark" aria-hidden="true">✳</span>
            </div>
            <svg class="metau-book" viewBox="0 0 520 345" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="metau-book-title">
              <title id="metau-book-title">Open knowledge supporting SDG 4: Quality Education, SDG 10: Reduced Inequalities, and SDG 17: Partnerships for the Goals.</title>
              <circle cx="260" cy="182" r="142" fill="#d7e9dd" />
              <circle cx="260" cy="182" r="112" stroke="#b4cebe" stroke-dasharray="4 9" />
              <path d="M79 126C118 66 175 45 224 60M305 57C365 59 412 103 434 144M424 247C393 289 350 308 310 310M195 309C137 298 106 270 87 234" stroke="#a0bda9" stroke-width="1.5" />
              <path d="M109 149L250 185L410 142V270L268 310L109 271V149Z" fill="#163f32" fill-opacity=".12" />
              <g class="metau-book-pages">
                <path d="M107 135L257 169L411 135V258L264 297L107 259V135Z" fill="#12583d" stroke="#12583d" stroke-width="7" stroke-linejoin="round" />
                <path d="M119 115C163 106 211 120 259 147V279C208 251 163 240 119 246V115Z" fill="#fff" stroke="#19486a" stroke-width="3" stroke-linejoin="round" />
                <path d="M259 147C306 120 355 106 400 115V246C353 240 309 251 259 279V147Z" fill="#f7faf8" stroke="#19486a" stroke-width="3" stroke-linejoin="round" />
                <path d="M259 149V276" stroke="#19486a" stroke-width="3" />
                <path d="M142 142C174 140 202 148 232 162M142 163C174 161 202 170 232 183M142 184C174 182 202 191 232 204M142 205C165 204 183 208 204 216" stroke="#c4d5ce" stroke-width="5" stroke-linecap="round" />
                <path d="M286 163C316 149 345 141 377 142M286 184C316 170 345 162 377 163M286 205C316 191 345 183 377 184M286 226C306 216 328 209 350 207" stroke="#c4d5ce" stroke-width="5" stroke-linecap="round" />
                <path d="M345 114L361 112V181L353 174L345 182V114Z" fill="#c5192d" />
              </g>
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
            <figcaption class="metau-art-caption"><span>Learn.</span><span>Create.</span><span>Share.</span></figcaption>
          </figure>
          <div class="metau-note">
            <span class="metau-note-icon" aria-hidden="true"><i class="fa-solid fa-seedling"></i></span>
            <p>Rooted in our community.<br><strong>Open to a world of learners.</strong></p>
          </div>
        </div>
      </div>

      <div class="metau-bottomline">
        <p>Free learning materials. Shared possibilities.</p>
        <NuxtLink to="/oer">lsu.edu.ph/oer</NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.metau-announcement {
  position: relative;
  isolation: isolate;
  display: flex;
  min-height: 100svh;
  overflow: hidden;
  background: #f8fcf9;
  color: #153b30;
}
.metau-announcement *, .metau-announcement *::before, .metau-announcement *::after { box-sizing: border-box; }
.metau-glow {
  position: absolute;
  z-index: -1;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at 85% 35%, #dceee0 0, transparent 55%), linear-gradient(120deg, #fff 25%, transparent 80%);
}
.metau-shell {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: clamp(2rem, 5vh, 4rem);
  width: min(100% - 6rem, 82rem);
  margin-inline: auto;
  padding-block: 2rem;
}
.metau-topline, .metau-bottomline { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.metau-identity { display: flex; align-items: center; gap: .8rem; font-size: .875rem; font-weight: 700; letter-spacing: .08em; }
.metau-mark { display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: .75rem .75rem .75rem .2rem; background: #175b3e; color: #fff; font-family: Georgia, serif; font-size: 2rem; letter-spacing: -.08em; line-height: 1; padding-right: .15rem; }
.metau-divider { width: 1px; height: 1rem; background: #b7cdbf; }
.metau-launch { padding: .5rem .85rem; border: 1px solid #c7ddce; border-radius: 2rem; background: #ffffffa6; color: #286045; font-size: .875rem; font-weight: 600; }
.metau-grid { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); align-items: center; gap: clamp(2rem, 5vw, 5.5rem); padding-block: 1rem 2rem; }
.metau-copy { position: relative; z-index: 1; }
.metau-eyebrow { margin: 0 0 1.25rem; color: #256344; font-size: .875rem; font-weight: 700; text-transform: uppercase; letter-spacing: .16em; }
.metau-copy h2 { margin: 0; font-size: clamp(2.5rem, 3.7vw, 4rem); font-weight: 800; line-height: 1.08; letter-spacing: -.055em; }
.metau-copy h2 > span { color: #2b754d; }
.metau-description { max-width: 35rem; margin: 1.75rem 0 0; color: #4c6558; font-size: 1rem; line-height: 1.85; }
.metau-description strong { color: #153b30; font-weight: 600; }
.metau-actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 2rem; }
.metau-button { display: inline-flex; align-items: center; justify-content: center; gap: .65rem; min-height: 3.4rem; padding: .85rem 1.3rem; border: 1px solid transparent; border-radius: .75rem; font-size: .875rem; font-weight: 700; text-align: center; text-decoration: none; transition: background .2s, box-shadow .2s, transform .2s; }
.metau-button-primary { background: #175b3e; color: #fff; box-shadow: 0 6px 16px #175b3e24; }
.metau-button-primary:hover { background: #10482f; box-shadow: 0 8px 20px #175b3e35; transform: translateY(-2px); }
.metau-button-secondary { border-color: #c5d7cb; background: #ffffffb3; color: #175b3e; }
.metau-button-secondary:hover { background: #e9f3ec; transform: translateY(-2px); }
.metau-formats { margin-top: 2rem; }
.metau-formats-label { color: #5b7164; font-size: .875rem; }
.metau-format-links { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: .75rem; }
.metau-format-links a { display: inline-flex; align-items: center; gap: .5rem; min-height: 2.75rem; padding: .5rem .8rem; border: 1px solid #d9e6dd; border-radius: 2rem; background: #ffffffb3; color: #28553d; font-size: .875rem; text-decoration: none; transition: background .2s, border-color .2s; }
.metau-format-links a:hover { border-color: #72a786; background: #e5f1e8; }
.metau-format-links i { color: #287049; }
.metau-visual { position: relative; min-width: 0; padding: 1rem 0 2rem; }
.metau-orbit { position: absolute; inset: -8% -8% 0; border: 1px solid #c2d8c780; border-radius: 50%; transform: rotate(-15deg); pointer-events: none; }
.metau-orbit::after { content: ''; position: absolute; inset: 1.5rem; border: 1px dashed #c2d8c7a6; border-radius: inherit; }
.metau-art-card { position: relative; margin: 0; padding: 1.5rem 1.75rem 1.25rem; border: 1px solid #fff; border-radius: 1.75rem; background: #ffffffd9; box-shadow: 0 28px 70px -24px #17472c33, 0 0 0 1px #d7e6dc80; transform: rotate(-3deg); transition: transform .4s; }
.metau-visual:hover .metau-art-card { transform: rotate(0); }
.metau-art-heading { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding-bottom: .75rem; }
.metau-art-label { color: #3a604a; font-size: .875rem; font-weight: 600; }
.metau-art-spark { color: #2b754d; font-size: 2rem; line-height: 1; }
.metau-book { display: block; width: 100%; height: auto; overflow: visible; }
.metau-book-pages { animation: metau-float 7s ease-in-out infinite; }
.metau-art-caption { display: flex; align-items: center; justify-content: center; gap: 2rem; padding-top: 1rem; border-top: 1px solid #dce8df; font-size: 1rem; font-weight: 800; letter-spacing: -.025em; }
.metau-art-caption span:nth-child(1) { color: #b2182a; }
.metau-art-caption span:nth-child(2) { color: #bb1259; }
.metau-art-caption span:nth-child(3) { color: #19486a; }
.metau-note { position: absolute; right: -1rem; bottom: -.5rem; display: flex; align-items: center; gap: .75rem; max-width: calc(100% - 1rem); padding: .9rem 1.1rem; border: 1px solid #d7e5db; border-radius: 1rem; background: #fff; box-shadow: 0 12px 30px -12px #153b3033; transform: rotate(3deg); }
.metau-note-icon { display: grid; place-items: center; width: 2.5rem; height: 2.5rem; flex-shrink: 0; border-radius: 50%; background: #eaf4ed; color: #287049; }
.metau-note p { margin: 0; color: #526c5c; font-size: .875rem; line-height: 1.6; }
.metau-note strong { color: #153b30; font-weight: 600; }
.metau-bottomline { padding-top: 1.25rem; border-top: 1px solid #d4e3d9; color: #5b7164; font-size: .875rem; }
.metau-bottomline p { margin: 0; }
.metau-bottomline a { display: inline-flex; align-items: center; min-height: 2.75rem; color: #175b3e; font-weight: 700; text-decoration: underline; text-underline-offset: .3em; text-decoration-color: #91b59e; }
.metau-bottomline a:hover { text-decoration-color: currentColor; }
.metau-announcement a:focus-visible { outline: 3px solid #19486a; outline-offset: 5px; }
@keyframes metau-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
@media (max-width: 1050px) {
  .metau-shell { width: min(100% - 4rem, 82rem); }
  .metau-grid { gap: 2rem; }
  .metau-copy h2 { font-size: clamp(2.25rem, 3.7vw, 3rem); }
  .metau-art-card { padding: 1.25rem; }
  .metau-note { right: -.5rem; padding: .75rem; }
}
@media (min-width: 761px) and (max-height: 850px) {
  .metau-shell { gap: 1.25rem; padding-block: 1.25rem; }
  .metau-grid { padding-block: .25rem 1rem; }
  .metau-description { margin-top: 1.25rem; line-height: 1.75; }
  .metau-actions, .metau-formats { margin-top: 1.5rem; }
  .metau-bottomline { padding-top: .75rem; }
}
@media (max-width: 760px) {
  .metau-shell { width: min(100% - 2.5rem, 38rem); gap: 2rem; padding-block: 1.5rem; }
  .metau-topline { align-items: flex-start; flex-wrap: wrap; }
  .metau-identity { font-size: .875rem; }
  .metau-launch { font-size: .75rem; }
  .metau-grid { grid-template-columns: minmax(0, 1fr); gap: 3rem; padding-block: .5rem 1rem; }
  .metau-copy h2 { font-size: clamp(2.5rem, 8vw, 3.75rem); }
  .metau-eyebrow { font-size: .75rem; margin-bottom: 1rem; }
  .metau-description { margin-top: 1.25rem; }
  .metau-actions { margin-top: 1.5rem; }
  .metau-visual { width: min(100% - 1rem, 30rem); margin-inline: auto; }
  .metau-art-card { padding: 1.25rem; }
  .metau-note { right: -1rem; }
  .metau-art-caption { gap: 1.5rem; }
  .metau-bottomline { align-items: flex-start; flex-direction: column; gap: .25rem; }
}
@media (max-width: 420px) {
  .metau-actions { flex-direction: column; }
  .metau-button { width: 100%; }
  .metau-note p { font-size: .75rem; }
}
@media (prefers-reduced-motion: reduce) {
  .metau-book-pages { animation: none; }
  .metau-art-card, .metau-button, .metau-format-links a { transition: none; }
  .metau-visual:hover .metau-art-card { transform: rotate(-3deg); }
  .metau-button:hover { transform: none; }
}
</style>
