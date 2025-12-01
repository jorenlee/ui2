<script setup>
const schedules = [
  {
    title: "OCTOBER 15, 2025",
    rows: [
      {
        time: "7:00AM–8:00AM",
        activity: "USG Spectator Stamp",
        venue: "USG Office",
        unit: "HEU",
      },
      {
        time: "8:00AM–12:00NN",
        activity: "Basketball (Pre-Games)",
        venue: "IS Covered Court",
        unit: "HEU",
      },
      {
        time: "12:30PM–1:30PM",
        activity: "USG Spectator Stamp",
        venue: "SJ Food Park",
        unit: "HEU",
      },
      {
        time: "1:30PM–4:30PM",
        activity: "Basketball (Pre-Games)",
        venue: "IS Covered Court",
        unit: "HEU",
      },
      {
        time: "5:30PM–10:00PM",
        activity: "Basketball – Lay Partners",
        venue: "IS Covered Court",
        unit: "HEU",
      },
    ],
  },
  {
    title: "OCTOBER 18, 2025",
    rows: [
      {
        time: "3:00AM–4:00AM",
        activity: "Animo Run Registration",
        venue: "Campus Facade",
        unit: "HEU",
      },
      {
        time: "4:00AM–8:00AM",
        activity: "LSU Animo Run 2025",
        venue: "Ozamiz City Streets",
        unit: "HEU",
      },
      {
        time: "12:30PM–1:30PM",
        activity: "USG Spectator Stamp",
        venue: "Oval",
        unit: "HEU",
      },
      {
        time: "1:30PM–4:30PM",
        activity: "Volleyball (M&W) / Basketball (M&W)",
        venue: "Deportivo / IS Covered Court",
        unit: "HEU",
      },
      {
        time: "5:30PM–10:00PM",
        activity: "Basketball – Lay Partners",
        venue: "IS Covered Court",
        unit: "HEU",
      },
    ],
  },
  {
    title: "OCTOBER 20, 2025",
    rows: [
      {
        time: "7:00AM–8:00AM",
        activity: "Spectator Stamp",
        venue: "College Quarters",
        unit: "HEU",
      },
      {
        time: "7:00AM–10:00PM",
        activity: "Final Stretch of Practices (per College)",
        venue: "Designated in-campus / off-campus",
        unit: "HEU",
      },
      {
        time: "7:30AM–8:00AM",
        activity: "House Attendance & Log-in",
        venue: "Classrooms",
        unit: "BEU",
      },
      {
        time: "7:30AM–11:50AM",
        activity:
          "House Heraldry & Chronicles Contest / Booth & Bench-Cheering Prep",
        venue: "Physics Lab / Playground A / Assigned Venues",
        unit: "BEU",
      },
      {
        time: "8:00AM–12:00NN",
        activity:
          "Basketball, Volleyball, Badminton, Esports (Elims), Shirt Distribution",
        venue: "Deportivo / SB Grounds / Arts Center / SJ Rooms / USG Office",
        unit: "HEU",
      },
      {
        time: "8:00AM–5:00PM",
        activity: "Free Photobooth / Hugyaw: Animo Hunt & Karaoke",
        venue: "USG Office / Campus 1 & 2",
        unit: "HEU",
      },
      {
        time: "12:30PM–1:30PM",
        activity: "Spectator Stamp",
        venue: "College Quarters",
        unit: "HEU",
      },
      {
        time: "1:30PM–5:00PM",
        activity: "Shirt Distribution / Sports Elims / BEU Activities",
        venue: "USG Office / Various Venues",
        unit: "HEU / BEU",
      },
      {
        time: "3:30PM–6:00PM",
        activity: "Pahina sa La Salle",
        venue: "Campus 2 / Campus 1",
        unit: "BEU / HEU",
      },
      {
        time: "6:00PM–8:00PM",
        activity: "CBA Runway Show",
        venue: "Arts Center",
        unit: "HEU",
      },
    ],
  },
  {
    title: "OCTOBER 21, 2025",
    rows: [
      {
        time: "7:00AM–8:00AM",
        activity: "Spectator Stamp / House Attendance / Meeting",
        venue: "College Quarters / BVM Classrooms",
        unit: "HEU / BEU",
      },
      {
        time: "8:00AM–12:00NN",
        activity:
          "Sports Elims / 25th TAJA Opening / House Heraldry / BEU Sports Elims / Bench-Cheering Prep",
        venue: "Various Venues",
        unit: "HEU / BEU",
      },
      {
        time: "8:00AM–5:00PM",
        activity: "CSO: Midas Touch Avenue / Free Photobooth",
        venue: "Campus 1 / USG Office",
        unit: "HEU",
      },
      {
        time: "12:30PM–1:30PM",
        activity: "Spectator Stamp",
        venue: "College Quarters",
        unit: "HEU",
      },
      {
        time: "1:30PM–4:30PM",
        activity:
          "Continuation of Sports & TAJA Workshops / Bench-Cheering Prep",
        venue: "Various Venues",
        unit: "HEU / BEU",
      },
      {
        time: "4:30PM–5:30PM",
        activity: "Pahina sa La Salle",
        venue: "Campus 1",
        unit: "HEU",
      },
      {
        time: "5:30PM–6:00PM",
        activity: "Technical Check",
        venue: "SC Grounds",
        unit: "HEU",
      },
      {
        time: "6:00PM–9:00PM",
        activity: "Tugtugan sa La Salle",
        venue: "SC Grounds",
        unit: "HEU",
      },
    ],
  },
  {
    title: "OCTOBER 22, 2025",
    rows: [
      {
        time: "6:00AM–7:00AM",
        activity: "Parade Assembly & Prep / Creative Photography Orientation",
        venue: "Oval & SB Grounds / Tingog Office",
        unit: "HEU",
      },
      {
        time: "7:00AM–9:00AM",
        activity: "Panaghugpong Parade",
        venue: "City Streets / Assigned Route",
        unit: "HEU / BEU",
      },
      {
        time: "9:00AM–10:00AM",
        activity: "Eucharistic Celebration",
        venue: "Arts Center",
        unit: "HEU",
      },
      {
        time: "10:00AM–11:30AM",
        activity: "Opening Ceremony",
        venue: "Arts Center",
        unit: "HEU",
      },
      {
        time: "10:00AM–11:50AM",
        activity: "House Booth Opening / Sports Blocks",
        venue: "Roadway / Beach VB / BVM Library",
        unit: "BEU",
      },
      {
        time: "1:30PM–6:00PM",
        activity: "Basketball – Lay Partners (Finals)",
        venue: "Deportivo",
        unit: "HEU",
      },
      {
        time: "1:30PM–5:30PM",
        activity:
          "Sepak Takraw / Chess / Esports / Quiz Bee / Eucharistic Celebration & BEU Opening",
        venue: "Various Venues",
        unit: "HEU / BEU",
      },
      {
        time: "5:00PM–6:30PM",
        activity: "Wellness Dance / Log-out Attendance / Pahina sa La Salle",
        venue: "SC Grounds / Campus 1",
        unit: "HEU",
      },
      {
        time: "6:30PM–9:00PM",
        activity: "Calle de Noche (Musical) / Night Market",
        venue: "Arts Center / SC Grounds",
        unit: "HEU",
      },
    ],
  },
  {
    title: "OCTOBER 23, 2025",
    rows: [
      {
        time: "7:00AM–8:00AM",
        activity: "Log-In Attendance",
        venue: "USG Office / Concierge / College Quarters",
        unit: "HEU",
      },
      {
        time: "7:30AM–11:50AM",
        activity: "Championship Rounds (Serve That Ball, Chess, etc.)",
        venue: "Covered Ct / BVM Lib / Roadway / LSU Oval",
        unit: "BEU",
      },
      {
        time: "8:00AM–11:30AM",
        activity:
          "Arnis / Basketball / Volleyball / Table Tennis / Football / Valorant / TAJA Finals",
        venue: "Various Venues",
        unit: "HEU",
      },
      {
        time: "8:00AM–9:00AM",
        activity: "Bench Cheering Competition",
        venue: "Arts Center",
        unit: "BEU",
      },
      {
        time: "9:00AM–12:00NN",
        activity: "Badminton",
        venue: "Arts Center",
        unit: "HEU",
      },
      {
        time: "8:00AM–4:00PM",
        activity: "Esports: Tetris Tournament",
        venue: "SJ 316",
        unit: "HEU",
      },
      {
        time: "1:30PM–6:00PM",
        activity:
          "Bench-Cheering Finals / Radio Broadcasting / ANIMOlympics / Various Sports",
        venue: "Arts Center / LSU Oval / Other Venues",
        unit: "HEU / BEU",
      },
      {
        time: "4:30PM–5:00PM",
        activity: "Wellness Dance",
        venue: "SC Grounds",
        unit: "HEU",
      },
      {
        time: "6:00PM–9:00PM",
        activity: "AnimoGroove / Short Film Viewing / Tugtugan / Night Market",
        venue: "Arts Center / SC Grounds",
        unit: "HEU",
      },
    ],
  },
  {
    title: "OCTOBER 24, 2025",
    rows: [
      {
        time: "7:00AM–8:00AM",
        activity: "Log-In Attendance / House Attendance",
        venue: "USG Office / Classrooms",
        unit: "HEU / BEU",
      },
      {
        time: "7:30AM–11:50AM",
        activity:
          "Volleyball (Boys & Girls) / Basketball (Boys) / Spelling Bee & Storytelling",
        venue: "Beach VB Area / Arts Center / BVM Library",
        unit: "BEU",
      },
      {
        time: "8:00AM–5:00PM",
        activity: "CSO: Midas Touch Avenue",
        venue: "LSU Campus 1",
        unit: "HEU",
      },
      {
        time: "8:00AM–11:30AM",
        activity:
          "Volleyball Championship / Chess / Valorant / Tekken / Hugyaw",
        venue: "Various Venues",
        unit: "HEU",
      },
      {
        time: "9:00AM–12:00NN",
        activity: "Basketball Championship",
        venue: "Arts Center",
        unit: "HEU",
      },
      {
        time: "12:30PM–1:30PM",
        activity: "Log-In Attendance",
        venue: "USG Office / Arts Center Gallery",
        unit: "HEU",
      },
      {
        time: "2:00PM–4:20PM",
        activity: "Closing Program & Awarding (AniMOVE Highlight)",
        venue: "Arts Center",
        unit: "BEU",
      },
      {
        time: "6:00PM–8:00PM",
        activity: "Awarding & Closing / Officers’ Showdown",
        venue: "Arts Center",
        unit: "HEU",
      },
      {
        time: "8:15PM–9:30PM",
        activity: "Animo Night & A&As Launching",
        venue: "SC Grounds",
        unit: "HEU",
      },
      {
        time: "9:30PM–10:00PM",
        activity: "Campus After-Care",
        venue: "Campus 1 & Arts Center",
        unit: "HEU",
      },
    ],
  },
];
</script>

<template>
  <div class="bg-gray-50">
    <Header />
    <div class="bg-white">
      <div class="relative">
        <div
          class="bg-cover bg-center flex items-center justify-center bg-green-800 pt-[100px]"
        >
          <div class="text-center text-white">
            <h1 class="lg:text-xl font-bold mb-4">
              PANAGHUGPONG 2025 SCHEDULE
            </h1>
          </div>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul
            class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs"
          >
            <li>
              <a href="/" class="mr-1"> Home </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/events" class="mr-1"> Events </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/events/panaghugpong" class="mr-1"> Panaghugpong </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <span class="mr-1"> Schedule </span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="">
      <div class="justify-center lg:w-11/12 mx-auto lg:my-5 my-3 text-xs">
        <div class="bg-white shadow-lg rounded-lg lg:p-6 p-2">
          <div class="text-center mb-2">
            <h2 class="lg:text-2xl font-bold text-green-800 text-center mb-2">
              UNIVERSITY DAYS CELEBRATION
            </h2>

            <div class="text-left mx-auto mb-8">
              <p class="mb-4 text-xs lg:text-center">
                With faith and gratitude, the University announces the
                celebration of
                <strong
                  >PANAGHUGPONG 2025 – "Pilgrims of Hope: Encountering the
                  Peripheries"</strong
                >
                on <strong>October 20–24, 2025</strong>, with pre-events on
                October 15 and 18, at La Salle University Campuses 1 and 2. Let
                us come together as one Lasallian community of pilgrims of hope,
                celebrating unity, faith, and joy in our journey of encounter
                and solidarity.
              </p>

              <p class="mb-4 text-xs lg:text-center">
                Spearheaded by the University Student Government (USG) for the
                Higher Education Unit (HEU) and the Student Coordinating Council
                (SCC) for the Basic Education Unit (BEU), this week-long
                celebration unites the entire Lasallian family through academic,
                cultural, and athletic engagements that embody faith, service,
                and communion in mission.
              </p>

              <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <h4 class="font-bold text-xs mb-2">Reminders:</h4>
                <ol class="list-decimal list-inside text-xs space-y-1">
                  <li>
                    Faculty and staff are encouraged to allow student
                    participation throughout the celebration week.
                  </li>
                  <li>
                    Colleges with off-campus practices must ensure proper
                    supervision and safety protocols.
                  </li>
                  <li>
                    Offices may adjust operations to support institutional
                    activities.
                  </li>
                  <li>
                    All participants must uphold discipline, cleanliness, and
                    the Lasallian values of Faith, Service, and Communion in
                    Mission.
                  </li>
                </ol>
              </div>
            </div>
          </div>

          <div>
            <section class="bg-white text-gray-800">
              <div class="">
                <h2
                  class="lg:text-2xl font-bold text-green-800 text-center mb-2"
                >
                  SCHEDULE OF ACTIVITIES
                </h2>

                <div class="">
                  <div v-for="day in schedules" :key="day.title">
                    <h3 class="text-center font-bold text-green-700 mb-3">
                      {{ day.title }}
                    </h3>

                    <div
                      class="overflow-x-auto max-h-[500px] border border-gray-300 mb-5"
                    >
                      <table class="min-w-full text-xs border-collapse">
                        <thead
                          class="bg-green-800 text-white sticky top-0 z-10"
                        >
                          <tr>
                            <th
                              class="px-3 py-0.5 text-left border border-gray-300"
                            >
                              Time
                            </th>
                            <th
                              class="px-3 py-0.5 text-left border border-gray-300"
                            >
                              Activity / Description
                            </th>
                            <th
                              class="px-3 py-0.5 text-left border border-gray-300"
                            >
                              Venue
                            </th>
                            <th
                              class="px-3 py-0.5 text-left border border-gray-300"
                            >
                              Unit
                            </th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 text-[11px]">
                          <tr
                            v-for="row in day.rows"
                            :key="row.time + row.activity"
                            class="hover:bg-green-50"
                          >
                            <td class="px-3 py-0.5 whitespace-nowrap">
                              {{ row.time }}
                            </td>
                            <td class="px-3 py-0.5">{{ row.activity }}</td>
                            <td class="px-3 py-0.5">{{ row.venue }}</td>
                            <td class="px-3 py-0.5">{{ row.unit }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.lasalle-green {
  background-color: #1f5f3f;
}
.lasalle-green-text {
  color: #1f5f3f;
}
</style>
