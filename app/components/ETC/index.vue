<script setup>
useHead({
  title: 'ETC - myZ1 | Educational Technology Center',
  meta: [
    {
      name: 'description',
      content:
        'Welcome to myZ1 — An Automatic Equipment Management and Technical Support System by the Educational Technology Center, La Salle University Ozamiz.',
    },
  ],
});
</script>

<template>
  <div class="font-montserrat min-h-screen flex flex-col bg-[#f5f7f4] text-slate-800 antialiased">
    <Header />

    <ETCHero />
    <ETCForm />
    <ETCServices />
    <ETCEquipmentList />
    <ETCHyZONE />
    <ETCCustodianship />
    <ETCProductionAndRates />
    <ETCEventStreaming />
    <ETCEquipmentRental />
    <ETCStudioRental />
    <ETCMultimediaProduction />
    <ETCEdTechTraining />
    <ETCProcessSteps />
    <ETCPolicies />
    <ETCTeam />
    <ETCFAQs />
    <ETCContact />

    <Footer />
  </div>
</template>
