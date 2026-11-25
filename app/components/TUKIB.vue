<template>
  <section
    id="tukib-announcement"
    class="relative isolate overflow-hidden bg-[#082f25] bg-[radial-gradient(ellipse_at_85%_35%,#28664770,transparent_60%),linear-gradient(115deg,#051f1840,transparent_70%)] text-base leading-[1.6] text-white [font-family:'Segoe_UI',Arial,sans-serif] [&_a:focus-visible]:outline [&_a:focus-visible]:outline-[3px] [&_a:focus-visible]:outline-offset-[5px]"
    aria-labelledby="tukib-banner-title"
  >
    <div class="pointer-events-none absolute -right-60 -top-[17rem] -z-10 aspect-square w-[49rem] rounded-full border border-[#d9c17d22] max-[760px]:-right-[31rem]" aria-hidden="true"></div>
    <div class="pointer-events-none absolute -right-40 -top-48 -z-10 aspect-square w-[39rem] rounded-full border border-[#d9c17d18] max-[760px]:-right-[26rem]" aria-hidden="true"></div>

    <div class="mx-auto w-[calc(100%_-_6rem)] max-w-[82rem] pb-5 pt-8 max-[1000px]:w-[calc(100%_-_3rem)] max-[760px]:w-[calc(100%_-_2rem)] max-[760px]:max-w-[38rem] max-[760px]:pt-6">
      <div class="flex items-center justify-between gap-x-8 gap-y-4 border-b border-[#ffffff24] pb-6 max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-2 max-[760px]:pb-5">
        <p class="m-0 text-sm font-[650] uppercase tracking-[.13em] text-[#e5ce8d] max-[760px]:tracking-[.08em]">La Salle University Ozamiz, Inc.</p>
        <span class="text-right text-sm text-[#c0d6c9] max-[760px]:text-left">The 1st LSU International Research Congress</span>
      </div>

      <div class="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center gap-[clamp(2rem,6vw,6rem)] py-[clamp(2.5rem,5vw,4.5rem)] max-[1000px]:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] max-[1000px]:gap-8 max-[760px]:grid-cols-1 max-[760px]:gap-9">
        <div class="min-w-0">
          <p class="mb-4 mt-0 text-sm font-semibold uppercase tracking-[.11em] text-[#bdd7c7] max-[1000px]:max-w-[22rem] max-[760px]:max-w-none max-[760px]:tracking-[.07em]">Connecting ideas. Inspiring innovation.</p>
          <h2 id="tukib-banner-title" class="m-0 text-[clamp(3.25rem,6.2vw,6rem)] font-extrabold leading-[1.05] tracking-[-.055em] max-[760px]:text-[clamp(3.25rem,11vw,5rem)]">TUKIB <span class="text-[#e5c578]">2027</span></h2>
          <p class="mb-0 mt-4 text-[clamp(1.25rem,1.85vw,1.75rem)] font-semibold leading-[1.4] tracking-[-.025em] text-[#f1f6f3] max-[420px]:text-[1.2rem]">International Research Congress</p>
          <p class="mb-0 mt-5 max-w-xl text-base leading-[1.85] text-[#bdd1c5]">
            Transforming Understanding Through Knowledge, Innovation, and
            Breakthroughs. Share your research and be part of a global conversation
            that moves communities forward.
          </p>
          <div class="mt-8 flex flex-wrap gap-[.85rem] max-[420px]:flex-col">
            <a
              href="https://tukib.lsu.edu.ph"
              class="inline-flex min-h-14 items-center justify-center gap-[.85rem] rounded-xl border border-transparent bg-[#e5c578] px-[1.45rem] py-[.9rem] text-center text-base font-bold leading-normal text-[#0b3023] no-underline shadow-[0_5px_20px_#0002] transition-[background-color,border-color,box-shadow,transform] duration-200 hover:bg-[#f3d996] hover:shadow-[0_8px_25px_#0003] focus-visible:outline-[#f2d995] motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none max-[1000px]:px-[1.1rem] max-[420px]:w-full"
            >
              Explore TUKIB 2027
              <svg class="h-[1.2rem] w-[1.2rem] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <ellipse cx="12" cy="12" rx="4" ry="9" />
                <path d="M3 12h18" />
              </svg>
            </a>
            <a
              href="https://tukib.lsu.edu.ph/#submission"
              class="inline-flex min-h-14 items-center justify-center gap-[.85rem] rounded-xl border border-[#a8c4b55c] bg-[#ffffff06] px-[1.45rem] py-[.9rem] text-center text-base font-bold leading-normal text-white no-underline transition-[background-color,border-color,box-shadow,transform] duration-200 hover:border-[#b7d2c2] hover:bg-[#ffffff12] focus-visible:outline-[#f2d995] motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none max-[1000px]:px-[1.1rem] max-[420px]:w-full"
            >Submit an abstract</a>
          </div>
          <p class="mb-0 mt-4 text-sm text-[#b0c9ba]">For researchers, educators, professionals, and students.</p>
        </div>

        <aside class="relative min-w-0 rounded-[1.25rem] border border-t-4 border-[#d9e5d5] border-t-[#e5c578] bg-[#f8fcf9] p-[clamp(1.5rem,2.5vw,2.25rem)] text-[#143c2b] shadow-[0_24px_64px_-20px_#001a1499] max-[420px]:p-5" aria-label="Congress date and venue">
          <div class="flex items-center justify-between gap-4">
            <span class="text-sm font-bold uppercase tracking-[.14em] text-[#496856]">Save the date</span>
            <svg class="h-6 w-6 text-[#4b7059]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
              <rect x="3" y="5" width="18" height="16" rx="3" />
              <path d="M7 3v4m10-4v4M3 11h18m-14 5h3m4 0h3" stroke-linecap="round" />
            </svg>
          </div>
          <time class="mb-7 mt-[1.4rem] flex items-center gap-5 max-[760px]:mb-6 max-[760px]:mt-4 max-[420px]:gap-4" datetime="2027-04-23">
            <span class="text-[clamp(4.5rem,7vw,6.5rem)] font-[750] leading-none tracking-[-.07em] max-[760px]:text-[5.5rem]">23</span>
            <span class="flex flex-col text-[1.75rem] font-[650] leading-[1.2] tracking-[-.035em] max-[760px]:flex-row max-[760px]:flex-wrap max-[760px]:items-baseline max-[760px]:gap-x-2 max-[760px]:gap-y-0">
              April <strong class="font-[inherit]">2027</strong>
              <span class="mt-[.45rem] text-sm font-medium tracking-[.02em] text-[#5d7567] max-[760px]:basis-full">Friday</span>
            </span>
          </time>
          <div class="flex items-center gap-[.8rem] border-t border-[#dce7de] pt-6 max-[420px]:items-start">
            <span class="grid h-11 w-11 shrink-0 place-items-center rounded-[.8rem] bg-[#e8f1e9] text-[#2e6443]" aria-hidden="true">
              <svg class="h-[1.4rem] w-[1.4rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                <rect x="3" y="5" width="13" height="14" rx="3" />
                <path d="m16 10 5-3v10l-5-3z" stroke-linejoin="round" />
              </svg>
            </span>
            <div>
              <strong class="block text-[.9375rem] font-[650] leading-normal">One congress. A world of ideas.</strong>
              <span class="mt-[.3rem] block text-sm text-[#577060]">Online via Zoom · Join from anywhere</span>
            </div>
          </div>
          <div class="mt-6 flex flex-col gap-[.1rem] rounded-[.7rem] bg-[#eaf2ec] px-[1.15rem] py-4 max-[760px]:flex-row max-[760px]:flex-wrap max-[760px]:items-center max-[760px]:justify-between max-[760px]:gap-x-3 max-[760px]:gap-y-1">
            <span class="text-sm text-[#617769]">Discover the congress</span>
            <a href="https://tukib.lsu.edu.ph/#tracks" class="inline-flex min-h-11 items-center self-start text-[.9375rem] font-bold text-[#205437] underline decoration-[#9aba9f] underline-offset-4 hover:text-[#0c3421] hover:decoration-current focus-visible:outline-[#205437]">Explore 6 research tracks</a>
          </div>
        </aside>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-[#ffffff24] pt-4 text-sm">
        <p class="m-0 text-[#b0c9ba]">Connecting ideas. Inspiring innovation. <span class="text-[#e5ce8d]">Transforming communities.</span></p>
        <a href="https://tukib.lsu.edu.ph" class="inline-flex min-h-11 items-center font-semibold text-[#e5ce8d] no-underline hover:underline hover:underline-offset-4 focus-visible:outline-[#f2d995]">tukib.lsu.edu.ph</a>
      </div>
    </div>
  </section>
</template>
