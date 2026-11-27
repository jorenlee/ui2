<script setup>
import { ref, computed } from 'vue';

const activeTab = ref('catalog');
const selectedCategory = ref('All');
const search = ref('');

const categories = [
  'All',
  'Slide Presentation',
  'Event Branding',
  'Graphic Design',
  'Photo Documentation',
  'Video Production',
  'Audio: Voiceover',
  'Audio: Music',
  'Text Media Script'
];

const productionCatalog = [
  // Part 1 of 9: Slide Presentation
  {
    category: 'Slide Presentation',
    part: 'Part 1 of 9',
    name: 'Slide Presentation | Speech Slides',
    fee: '₱2,000.00',
    inclusions: 'A presentation with 20–30 slides (through Google Slides, MS PowerPoint or Canva)',
    responsibility: 'Content, Brand Kit'
  },
  {
    category: 'Slide Presentation',
    part: 'Part 1 of 9',
    name: 'Slide Presentation | Instructional Slides',
    fee: '₱2,000.00',
    inclusions: 'A presentation with 20–30 slides (through Google Slides, MS PowerPoint or Canva)',
    responsibility: 'Content, Brand Kit'
  },
  {
    category: 'Slide Presentation',
    part: 'Part 1 of 9',
    name: 'Slide Presentation | Event Program Flow Slides',
    fee: '₱2,000.00',
    inclusions: 'A presentation with 20–30 slides (through Google Slides, MS PowerPoint or Canva)',
    responsibility: 'Content, Brand Kit'
  },
  {
    category: 'Slide Presentation',
    part: 'Part 1 of 9',
    name: 'Slide Presentation | Event Presentation Deck or Digital Kit',
    fee: '₱2,000.00',
    inclusions: 'A presentation with 20–30 slides (through Google Slides, MS PowerPoint or Canva)',
    responsibility: 'Content, Brand Kit'
  },

  // Part 2 of 9: Event Branding
  {
    category: 'Event Branding',
    part: 'Part 2 of 9',
    name: 'Event Branding | Brand Kit',
    fee: '₱5,000.00',
    inclusions: 'Logo (Graphical Logo and Logo Type), Typography, Color palettes, Animated logo, Facebook frame, Sample publication and advertising material (posters, infographics, billboard designs, thumbnail, social media post designs), Sample merchandise designs (t-shirt, cap, jacket, mug, tote bags, product packaging)',
    responsibility: 'Initial Thoughts or Ideas'
  },

  // Part 3 of 9: Graphic Design
  {
    category: 'Graphic Design',
    part: 'Part 3 of 9',
    name: 'Graphic Design | Logo',
    fee: '₱1,500.00',
    inclusions: 'Logo (either Graphical Logo or Logo Type), Color palettes',
    responsibility: 'Initial Thoughts or Ideas'
  },
  {
    category: 'Graphic Design',
    part: 'Part 3 of 9',
    name: 'Graphic Design | Animated Logo',
    fee: '₱2,000.00',
    inclusions: '20–30 sec animated logo',
    responsibility: 'Content, Brand Kit'
  },
  {
    category: 'Graphic Design',
    part: 'Part 3 of 9',
    name: 'Graphic Design | Facebook Frame',
    fee: '₱500.00',
    inclusions: '1 facebook frame',
    responsibility: 'Content, Brand Kit'
  },
  {
    category: 'Graphic Design',
    part: 'Part 3 of 9',
    name: 'Graphic Design | Publication and Advertising Material',
    fee: '₱500.00',
    inclusions: '1 publication material (either posters, billboard designs, thumbnail, and other social media post designs, etc.)',
    responsibility: 'Content, Brand Kit'
  },
  {
    category: 'Graphic Design',
    part: 'Part 3 of 9',
    name: 'Graphic Design | Merchandise Design',
    fee: '₱500.00',
    inclusions: '1 merchandise design (t-shirt, cap, jacket, mug, tote bags, product packaging, etc.)',
    responsibility: 'Content, Brand Kit'
  },
  {
    category: 'Graphic Design',
    part: 'Part 3 of 9',
    name: 'Graphic Design | Motion Graphic / Animation Design',
    fee: '₱2,000.00',
    inclusions: '20–30 sec motion graphic or animation design',
    responsibility: 'Content, Brand Kit'
  },
  {
    category: 'Graphic Design',
    part: 'Part 3 of 9',
    name: 'Graphic Design | Web Page Design',
    fee: '₱2,000.00',
    inclusions: '1 mockup page design (focuses on visual experience & design of on-screen graphic elements like buttons, menus, micro-interactions)',
    responsibility: 'Content, Brand Kit'
  },
  {
    category: 'Graphic Design',
    part: 'Part 3 of 9',
    name: 'Graphic Design | Production Design',
    fee: '₱3,000.00',
    inclusions: '1 mockup production design (including stage and venue)',
    responsibility: 'Content, Brand Kit'
  },

  // Part 4 & 5 of 9: Photo Documentation (Event, Studio & Outdoor)
  {
    category: 'Photo Documentation',
    part: 'Part 4 of 9',
    name: 'Photo Documentation | Event Photo Highlights (Edited)',
    fee: '₱3,500.00',
    inclusions: '1 Photographer, 3-hour event, 500–1000 raw photos via Google Drive, 250 edited photos uploaded on ETC\'s Facebook Page (with DPA consent)',
    responsibility: 'Transportation, Meals/snacks'
  },
  {
    category: 'Photo Documentation',
    part: 'Part 4 of 9',
    name: 'Photo Documentation | Event Photo Highlights (Raw)',
    fee: '₱3,000.00',
    inclusions: '1 Photographer, 3-hour event, 500–1000 raw photos via Google Drive',
    responsibility: 'Transportation, Meals/snacks'
  },
  {
    category: 'Photo Documentation',
    part: 'Part 4 of 9',
    name: 'Photo Documentation | Studio Photoshoot for 1 Hour (Edited)',
    fee: '₱2,500.00',
    inclusions: '1 Photographer, 1 Technical Crew, 1-hour studio use, 150–300 raw photos via Google Drive, 75 edited photos uploaded on ETC\'s Facebook Page (with DPA consent)',
    responsibility: 'Transportation, Meals/snacks'
  },
  {
    category: 'Photo Documentation',
    part: 'Part 4 of 9',
    name: 'Photo Documentation | Studio Photoshoot for 1 Hour (Raw)',
    fee: '₱2,000.00',
    inclusions: '1 Photographer, 1 Technical Crew, 1-hour studio use, 150–300 raw photos via Google Drive',
    responsibility: 'Transportation, Meals/snacks'
  },
  {
    category: 'Photo Documentation',
    part: 'Part 4 of 9',
    name: 'Photo Documentation | Studio Photoshoot for 3 Hours (Edited)',
    fee: '₱3,500.00',
    inclusions: '1 Photographer, 3-hour studio use, 500–1000 raw photos via Google Drive, 250 edited photos uploaded on ETC\'s Facebook Page (with DPA consent)',
    responsibility: 'Transportation, Meals/snacks'
  },
  {
    category: 'Photo Documentation',
    part: 'Part 4 of 9',
    name: 'Photo Documentation | Studio Photoshoot for 3 Hours (Raw)',
    fee: '₱3,000.00',
    inclusions: '1 Photographer, 3-hour studio use, 500–1000 raw photos via Google Drive',
    responsibility: 'Transportation, Meals/snacks'
  },
  {
    category: 'Photo Documentation',
    part: 'Part 5 of 9',
    name: 'Photo Documentation | Outdoor Photoshoot for 1 Hour (Edited)',
    fee: '₱3,000.00',
    inclusions: '1 Photographer, 1-hour outdoor location shooting, 150–300 raw photos via Google Drive, 75 edited photos uploaded on ETC\'s Facebook Page (with DPA consent)',
    responsibility: 'Transportation, Meals/snacks'
  },
  {
    category: 'Photo Documentation',
    part: 'Part 5 of 9',
    name: 'Photo Documentation | Outdoor Photoshoot for 1 Hour (Raw)',
    fee: '₱2,500.00',
    inclusions: '1 Photographer, 1-hour outdoor location shooting, 150–300 raw photos via Google Drive',
    responsibility: 'Transportation, Meals/snacks'
  },
  {
    category: 'Photo Documentation',
    part: 'Part 5 of 9',
    name: 'Photo Documentation | Outdoor Photoshoot for 3 Hours (Edited)',
    fee: '₱4,000.00',
    inclusions: '1 Photographer, 3-hour outdoor location shooting, 500–1000 raw photos via Google Drive, 250 edited photos uploaded on ETC\'s Facebook Page (with DPA consent)',
    responsibility: 'Transportation, Meals/snacks'
  },
  {
    category: 'Photo Documentation',
    part: 'Part 5 of 9',
    name: 'Photo Documentation | Outdoor Photoshoot for 3 Hours (Raw)',
    fee: '₱3,500.00',
    inclusions: '1 Photographer, 3-hour outdoor location shooting, 500–1000 raw photos via Google Drive',
    responsibility: 'Transportation, Meals/snacks'
  },

  // Part 6 of 9: Video Production
  {
    category: 'Video Production',
    part: 'Part 6 of 9',
    name: 'Video Production A (Production Only)',
    fee: '₱3,000.00',
    inclusions: 'Production Only (Recording/Shooting): 1 Videographer, 1 Technical Crew, 3-hour studio/outdoor/event location shooting, Raw video clips via Google Drive',
    responsibility: 'Content/Concept, Brand Kit, Location (studio reservation or outdoor/event transportation budget), May provide meal budget for 2 pax'
  },
  {
    category: 'Video Production',
    part: 'Part 6 of 9',
    name: 'Video Production B (Post-Production Only)',
    fee: '₱3,000.00',
    inclusions: 'Post-Production or Editing Only: 1 Video Editor, 1 video with maximum of 10 minutes total running time via Google Drive',
    responsibility: 'Raw Video Clips, Content/Concept, Brand Kit, May provide snack budget'
  },
  {
    category: 'Video Production',
    part: 'Part 6 of 9',
    name: 'Video Production C (Full Production & Editing)',
    fee: '₱5,000.00',
    inclusions: 'Production: 1 Videographer, 1 Technical Crew, 3-hour shooting, Raw clips via GDrive. Post-Production: 1 Video Editor, 1 video max 5 mins runtime. (Note: +₱2,000 per additional 1–5 minutes)',
    responsibility: 'Content/Concept, Brand Kit, Location reservation/transportation budget, May provide meal budget'
  },

  // Part 7 of 9: Audio Production - Voiceover
  {
    category: 'Audio: Voiceover',
    part: 'Part 7 of 9',
    name: 'Audio Production | Voiceover Production A (Recording Only)',
    fee: '₱1,000.00',
    inclusions: 'Production Only (Recording): 1 Technical Crew, 3-hour studio use with audio recording equipment, Raw audio clips via Google Drive',
    responsibility: 'Voice-Over Artists, Content/Concept, May provide snack budget'
  },
  {
    category: 'Audio: Voiceover',
    part: 'Part 7 of 9',
    name: 'Audio Production | Voiceover Production B (Editing Only)',
    fee: '₱1,000.00',
    inclusions: 'Post-Production or Editing Only: 1 Audio Producer, 1 Audio clip max 10 minutes total running time via Google Drive',
    responsibility: 'VO Clips (otherwise ETC will provide AI VO Artist), Content/Concept, Non-copyrighted Background Music (if needed), May provide snack budget'
  },
  {
    category: 'Audio: Voiceover',
    part: 'Part 7 of 9',
    name: 'Audio Production | Voiceover Production C (Recording & Editing)',
    fee: '₱1,500.00',
    inclusions: 'Production: 1 Technical Crew, 3-hr studio recording, Raw audio clips. Post-Production: 1 Audio Producer, 1 Audio clip max 5 mins. (+₱300 per additional 1–2 mins)',
    responsibility: 'VO Clips (or ETC AI VO Artist), Content/Concept, Background Music, May provide snack budget'
  },

  // Part 8 of 9: Audio Production - Music
  {
    category: 'Audio: Music',
    part: 'Part 8 of 9',
    name: 'Audio Production | Music Production A (Recording Only)',
    fee: '₱2,000.00',
    inclusions: 'Production Only (Recording): 1 Technical Crew, 3-hour studio use with audio recording equipment, Raw audio clips via Google Drive',
    responsibility: 'Artists, Content/Concept, Instruments and audio jacks, May provide snack budget'
  },
  {
    category: 'Audio: Music',
    part: 'Part 8 of 9',
    name: 'Audio Production | Music Production B (Recording & Editing)',
    fee: '₱5,000.00',
    inclusions: 'Production: 1 Technical Crew, 3-hr studio use with recording gear, Raw clips. Post-Production: 1 Music Producer, 1 audio clip max 5 mins. (Additional studio: 1 hr = ₱500; 3 hr = ₱1,500; 8 hr = ₱3,000)',
    responsibility: 'Artists, Content/Concept, Instruments and audio jacks, Meal budget (lunch for 2 pax; lunch & dinner if 8 hours)'
  },

  // Part 9 of 9: Text Media Production
  {
    category: 'Text Media Script',
    part: 'Part 9 of 9',
    name: 'Text Media Production | Technical Script or Prompsheet',
    fee: '₱500.00',
    inclusions: '1 Full Technical Script or Prompt Script',
    responsibility: 'Only applicable when booked together with Event Streaming or Production'
  },
  {
    category: 'Text Media Script',
    part: 'Part 9 of 9',
    name: 'Text Media Production | AV Script',
    fee: '₱500.00',
    inclusions: '1 Full AV Script',
    responsibility: 'Only applicable when booked together with Audio or Video Production'
  }
];

const filteredCatalog = computed(() => {
  const q = search.value.trim().toLowerCase();
  return productionCatalog.filter((item) => {
    const matchCat = selectedCategory.value === 'All' || item.category === selectedCategory.value;
    const matchQ = !q || item.name.toLowerCase().includes(q) || item.inclusions.toLowerCase().includes(q);
    return matchCat && matchQ;
  });
});

const steps = [
  'Open ETC Services Google Form (https://bit.ly/ETCRequestS).',
  'Read La Salle University\'s Media Release Form category, review authorization, and check the boxes that apply (Process concludes if select "I DISAGREE").',
  'Fill in Primary Information.',
  'In the ETC Services portion, choose "Multimedia Production".',
  'Choose the specific Multimedia Production service you want to request (Note: submit one specific service per form; submit separate forms if multiple services are needed).',
  'Fill in Event, Production, and Payment Details.',
  'Complete ETC SERVICES EVALUATION (bit.ly/ETCServicesEvalForm) after the service rendered.',
  'Click Submit.'
];
</script>

<template>
  <section id="multimedia-production" class="pb-12 px-4 sm:px-6">
    <div class="max-w-6xl mx-auto bg-white rounded-3xl border border-green-900/10 shadow-sm p-6 sm:p-10">
      <!-- Section Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div>
          <div class="inline-flex items-center gap-2.5 mb-2">
            <span class="w-1.5 h-5 rounded-full bg-[#14532d]"></span>
            <span class="text-xs font-bold uppercase tracking-[0.2em] text-[#14532d]">Creative Content &amp; Media (Parts 1–9)</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Multimedia <span class="text-[#14532d]">Production</span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
            Expert creative support for students and partners in producing slide presentations, event brand kits, graphic designs, photo documentation, video production, voiceover, music, and technical scripts.
          </p>
        </div>

        <div class="inline-flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#f0f5f0] border border-green-900/15 self-start md:self-auto">
          <button
            type="button"
            class="px-3.5 py-2 rounded-lg text-xs font-bold transition-colors"
            :class="activeTab === 'catalog' ? 'bg-[#14532d] text-white' : 'text-[#14532d] hover:bg-white'"
            @click="activeTab === 'catalog'"
          >
            Services Catalog (Parts 1–9)
          </button>
          <button
            type="button"
            class="px-3.5 py-2 rounded-lg text-xs font-bold transition-colors"
            :class="activeTab === 'steps' ? 'bg-[#14532d] text-white' : 'text-[#14532d] hover:bg-white'"
            @click="activeTab === 'steps'"
          >
            Request Steps (1–8)
          </button>
        </div>
      </div>

      <!-- Tab 1: Services Catalog -->
      <div v-if="activeTab === 'catalog'" class="space-y-5">
        <!-- Search and Filters -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="cat in categories"
              :key="cat"
              type="button"
              class="px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors"
              :class="selectedCategory === cat
                ? 'bg-[#14532d] text-white border-[#14532d]'
                : 'bg-[#f5f7f4] text-slate-700 border-green-900/15 hover:border-[#14532d]'"
              @click="selectedCategory = cat"
            >
              {{ cat }}
            </button>
          </div>
          <input
            v-model="search"
            type="text"
            placeholder="Search slides, logo, video, music..."
            class="w-full lg:w-64 px-3.5 py-2 text-xs border border-green-900/20 rounded-xl bg-[#f5f7f4] focus:bg-white focus:border-[#14532d] outline-none"
          />
        </div>

        <!-- Catalog Table -->
        <div class="overflow-x-auto rounded-2xl border border-green-900/15">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-[#14532d] text-white uppercase tracking-wider">
                <th class="py-3 px-4 font-bold">Specific Service</th>
                <th class="py-3 px-3 font-bold text-right">Service Fee</th>
                <th class="py-3 px-4 font-bold">Inclusions</th>
                <th class="py-3 px-4 font-bold">Responsibility of Requester</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-green-900/10">
              <tr
                v-for="(item, idx) in filteredCatalog"
                :key="idx"
                class="odd:bg-[#fafcfa] even:bg-[#f0f5f0]/60 hover:bg-green-50/50 transition-colors"
              >
                <td class="py-3 px-4 align-top">
                  <div class="font-extrabold text-slate-900 leading-snug">{{ item.name }}</div>
                  <div class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white border border-green-900/15 text-[#14532d]">
                    {{ item.category }} · {{ item.part }}
                  </div>
                </td>
                <td class="py-3 px-3 align-top font-black text-right text-[#14532d] text-sm whitespace-nowrap">
                  {{ item.fee }}
                </td>
                <td class="py-3 px-4 align-top text-slate-700 leading-relaxed max-w-md">
                  <div class="flex items-start gap-1.5">
                    <svg class="w-3.5 h-3.5 text-[#14532d] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{{ item.inclusions }}</span>
                  </div>
                </td>
                <td class="py-3 px-4 align-top text-slate-600 leading-relaxed max-w-xs">
                  <div class="flex items-start gap-1.5">
                    <span class="text-[#14532d] font-bold">•</span>
                    <span>{{ item.responsibility }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="p-5 rounded-2xl bg-[#fafcfa] border border-green-900/15 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="text-xs text-slate-600">
            <span class="font-bold text-slate-900">Submission Note:</span> Please submit only one (1) specific multimedia production service per request form. If you require multiple services, kindly submit separate requests.
          </div>
          <a
            href="https://bit.ly/ETCRequestS"
            target="_blank"
            rel="noopener noreferrer"
            class="px-5 py-2.5 rounded-full bg-[#14532d] hover:bg-[#166534] text-white text-xs font-bold tracking-wide transition-colors shrink-0"
          >
            Submit Production Request
          </a>
        </div>
      </div>

      <!-- Tab 2: Request Steps -->
      <div v-else-if="activeTab === 'steps'" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div
            v-for="(st, idx) in steps"
            :key="idx"
            class="p-4 rounded-2xl bg-[#f5f7f4] border border-green-900/10 flex items-start gap-3"
          >
            <span class="w-6 h-6 rounded-lg bg-[#14532d] text-white text-[11px] font-black flex items-center justify-center shrink-0">
              {{ idx + 1 }}
            </span>
            <p class="text-xs text-slate-700 leading-relaxed font-medium">
              {{ st }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
