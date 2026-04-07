<script setup>
</script>

<template>
  <div class="bg-gray-50">
    <Header />
    <div class="">
      <div class="relative">
        <Banner />
        <img
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
          class="align-top w-full h-36 object-none lg:hidden block"
        />
        <div>

        </div>
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1 class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto">
            About
            <!-- <span class="lg:text-base text-xs lg:mt-5 ml-5">A.Y. 2024-2025</span> -->
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
            <li>
              <a href="/" class="mr-1"> Home </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/about" class="mr-1"> About </a>
            </li>
            <!-- <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/about-lsu" class="mr-1">  </a>
            </li> -->
          </ul>
        </div>
      </div>
    </div>

    <!-- <div>
      <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/LSUOrganizationalChart.png" 
      class="lg:w-8/12 w-11/12 mx-auto my-5"/>
    </div> -->

    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
  <div class="shadow lg:w-3/12 my-5 bg-white">
      <AboutSideMenu />
    </div>
    <div class="justify-center lg:w-10/12 mx-auto lg:my-5 my-3">
      <div>
        <div class="text-center mx-auto mb-8">
          <h2 class="font-bold lg:text-2xl text-xl text-green-800 mb-4">
            The Founder's Life
          </h2>
          <p class="text-xs lg:w-8/12 mx-auto w-11/12">
            St. John Baptist de La Salle
          </p>
        </div>

        <div class="block mx-auto lg:w-11/12">
          <div class="lg:flex lg:gap-10 lg:w-full w-11/12 mx-auto mb-12">
            <!-- Founder's Image -->
            <div class="lg:w-5/12 w-full mb-6 lg:mb-0">
              <img
                src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/about/FounderLSU.jpg"
                alt="St. John Baptist de La Salle"
                class="w-full h-auto shadow-lg rounded"
              />
            </div>

            <!-- Founder's Biography -->
            <div class="lg:w-7/12 w-full">
              <div class="mb-6">
                <h3 class="font-bold text-lg text-green-800 mb-3">Early Life</h3>
                <p class="text-xs mb-3 text-justify">
                  St. John Baptist de La Salle was born into a world very different from today.
                  He was the first son of wealthy parents living in France over 300 years ago.
                  Born at Reims, April 30, 1651, he was educated at the best schools and seemed
                  assured of a life of ease and comfort.
                </p>
                <p class="text-xs mb-3 text-justify">
                  At the age of eleven, he received the tonsure and was named Canon of the Reims
                  Cathedral. When he was sixteen, he began theological studies and was ordained
                  a priest on April 9, 1678.
                </p>
              </div>

              <div class="mb-6">
                <h3 class="font-bold text-lg text-green-800 mb-3">His Mission</h3>
                <p class="text-xs mb-3 text-justify">
                  In 1679, De La Salle came into contact with a group of rough and barely literate
                  young men in order to establish schools for poor boys. At that time, few
                  educational opportunities existed for children of the working class and the poor.
                </p>
                <p class="text-xs mb-3 text-justify">
                  Moved by the plight of the poor who seemed so "far from salvation" either in
                  this world or the next, he determined to put his own talents and advanced
                  education at the service of the children "often left to themselves and badly
                  brought up."
                </p>
              </div>

              <div class="mb-6">
                <h3 class="font-bold text-lg text-green-800 mb-3">Founding the Institute</h3>
                <p class="text-xs mb-3 text-justify">
                  To be more effective, he abandoned his family home, moved in with the teachers,
                  renounced his position as Canon and his wealth, and so formed the community that
                  became the Brothers of the Christian Schools.
                </p>
                <p class="text-xs mb-3 text-justify">
                  His enterprise met opposition from the ecclesiastical authorities who resisted
                  the creation of a new form of religious life, a community of brothers without
                  priests. The educational establishment resented his innovative methods and his
                  insistence on gratuity of education for the poor.
                </p>
              </div>

              <div>
                <h3 class="font-bold text-lg text-green-800 mb-3">Legacy</h3>
                <p class="text-xs mb-3 text-justify">
                  De La Salle was a pioneer in founding training colleges for teachers, reform
                  schools for delinquents, technical schools, and secondary schools for modern
                  languages, arts, and sciences. His work quickly spread through France and,
                  after his death, continued to spread across the globe.
                </p>
                <p class="text-xs mb-3 text-justify">
                  John Baptist de La Salle died on Good Friday, April 7, 1719, only weeks before
                  his 68th birthday. He was canonized a Saint on May 24, 1900, by Pope Leo XIII
                  and was declared Patron Saint of Teachers in 1950.
                </p>
              </div>
            </div>
          </div>

          <!-- Additional Content -->
          <div class="w-11/12 mx-auto mt-12">
            <div class="bg-green-50 p-6 rounded-lg mb-8">
              <p class="text-xs mb-4 text-justify leading-relaxed">
                John Baptist de La Salle is credited as one of the founders of modern classroom-style
                education. As a priest living in 17th-century France, De La Salle was led by the spirit
                of God to become involved in the education of youth. Education became his vocation.
              </p>
              <p class="text-xs font-semibold text-green-800 text-center italic mb-4">
                St. John Baptist de La Salle— Founder of the Institute of the Brothers of the Christian
                Schools, Patron of Christian Teachers, Father of Modern Education
              </p>
              <p class="text-xs mb-4 text-justify leading-relaxed">
                During his lifetime, he founded a religious order of men, the Brothers of the Christian
                Schools, who devoted themselves to teaching boys and young men. To assist the Brothers
                in this ministry, he developed the first real strategy for teaching, created a teacher's
                manual, wrote student textbooks, and opened a school to train teachers. He challenged
                the Brothers of his community to look upon everything with the eyes of faith, to see
                the person of Christ in their students, and to approach their ministry with great zeal
                for the evangelization of youth. By the time of his death in 1719, he had established
                numerous schools throughout France that followed his ideals. This success was later
                copied in Europe and in America.
              </p>
            </div>

            <div class="mb-8">
              <h3 class="font-bold text-xl text-green-800 mb-4 uppercase">An Innovative Educator</h3>
              <p class="text-xs mb-4 text-justify leading-relaxed">
                John Baptist de La Salle was an educational innovator. He looked at the world and saw
                a need to educate all children, and responded to that calling. In De La Salle's day,
                education was reserved for the privileged; generally only those boys and young men whose
                families could afford private tutors studied at all. Relatively few of these men went
                on to university. All subjects were taught in Latin, greatly limiting the spread of
                education and texts. There were no programs to train teachers. The tutors of the day
                were well-educated men who performed this gentleman's occupation to earn a living.
              </p>
              <p class="text-xs mb-4 text-justify leading-relaxed">
                De La Salle realized that this approach closed education to all but the very wealthy,
                perpetuating an entrenched upper class while cutting off opportunities for bright but
                poor children. He believed that the working class and poor had a right to quality
                education, so he directed his efforts to these youth. What was truly revolutionary was
                De La Salle's understanding that a tutorial approach to instruction would never be able
                to reach the masses-a new technique for instruction was needed. Thus, he developed the
                simultaneous approach to instruction, using monitors to educate small groups within a
                larger group. These groups were the first "classrooms," and this form of instruction
                remains the principal form of instruction worldwide some 300 years later.
              </p>
              <p class="text-xs mb-4 text-justify leading-relaxed">
                St. John also understood the critical need for teacher training to ensure success in
                the classroom, as well as the benefit of teachers continuing their training throughout
                their careers. Before placing teachers in the classroom, De La Salle trained them and
                called the teachers aside periodically to renew their instruction. He wrote a training
                manual for his teachers, The Conduct of Christian Schools, that included extraordinary
                insight to the task of the classroom instructor. The book outlined rules and techniques
                for class teaching, including regulations for maintaining discipline, steps for teaching
                reading, and even for student assessment and discipline.
              </p>
              <div class="bg-white border-l-4 border-green-800 p-4 my-6 shadow-md">
                <p class="text-xs italic text-gray-700 leading-relaxed">
                  "Take even more care of the education of the young people entrusted to you than if
                  they were the children of a king."
                </p>
                <p class="text-xs text-right text-green-800 mt-2">
                  — Meditation 133.2 (on St. Margaret, Queen of Scotland)
                </p>
              </div>
            </div>

            <div class="mb-8">
              <h3 class="font-bold text-xl text-green-800 mb-4 uppercase">
                Concern for the Poor and Vulnerable
              </h3>
              <p class="text-xs mb-4 text-justify leading-relaxed">
                John Baptist de La Salle had great love for the poor. He demonstrated this devotion
                by taking the poor teachers into his home to feed them, by giving away his patrimony,
                and by requiring the brothers to teach the poor and working class. He held school on
                Sundays for those working-class youth who had to labor during the week. De La Salle
                even opened a school for "incorrigible delinquents." Probably at least some of these
                youths we today would classify as special-needs students.
              </p>
            </div>

            <div class="mb-8">
              <h3 class="font-bold text-xl text-green-800 mb-4 uppercase">His Legacy</h3>
              <p class="text-xs mb-4 text-justify leading-relaxed">
                De La Salle and his Brothers succeeded in creating a network of quality schools
                throughout France that featured instruction in the vernacular, students grouped
                according to ability and achievement, integration of religious instruction with
                secular subjects, well-prepared teachers with a sense of vocation and mission, and
                the involvement of parents.
              </p>
              <p class="text-xs mb-4 text-justify leading-relaxed">
                In 1900, John Baptist de La Salle was declared a Saint. In 1950, because of his life
                and inspirational writings, he was made Patron Saint of all those who work in the
                field of education. At the present time, there are De La Salle schools in 80 different
                countries around the globe.
              </p>
              <p class="text-xs mb-4 text-justify leading-relaxed">
                As we look at the life of St. John Baptist de La Salle, a man who lived hundreds of
                years ago and in a very different world, we see that the principles that guided his
                life are still those that guide us today. These same principles can be the driving
                force for all of us involved in the glorious ministry of Catholic education. De La
                Salle must be in awe when he sees the work that he began continuing today all over
                the globe by faithful Catholic educators.
              </p>
              <p class="text-xs font-semibold text-green-800 text-center mt-6">
                St. John Baptist de La Salle, Patron of Teachers, pray for us.
              </p>
            </div>

            <div class="text-right">
              <p class="text-xs text-gray-600 italic">Source: www.lasalle.org</p>
            </div>
          </div>
        </div>
      </div>

    </div>
</div>
    <Footer />
  </div>
</template>

<style scoped>
/* a {
    border: 1px solid #969696;
    border-bottom: none;
  }
  a:hover {
    border: 1px solid #969696;
    border-bottom: none;
    background: #00cc00;
    color: #000;
  }
  a.active {
    background: #005e00;
    color: white !important;
    border-color: none !important;
  } */
</style>
