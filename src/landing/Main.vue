<script setup lang="ts">
// Importamos los componentes de la carpeta landing según image_e73485.png
import Heading from '../landing/components/Heading.vue'
import AboutUs from '../landing/components/About-Us.vue'
import Benefits from '../landing/components/Benefits.vue'
import Roles from '../landing/components/Roles.vue'
import MonthlyPayments from '../landing/components/Monthly-payments.vue'
import FitDevicesSection from './components/FitDevicesSection.vue'
import FitStatsSection from './components/FitStatsSection.vue'
import Footer from '../landing/components/Footer.vue'
import Operation from './components/Operation.vue'
import Login from './Menu/Login.vue'
import Record from './Menu/Record.vue'
const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Heading @navigate="scrollToSection" />

    <main class="flex-grow">
      <!--Sobres Nosotros-->
      <AboutUs />
      <!--Beneficios-->
      <Benefits />
      <!--Resultados-->
      <FitStatsSection/>
      <!--APP-->
      <FitDevicesSection/>
      <Roles />
      <!--Operation-->
      <!--<Operation/>
      <MonthlyPayments />-->

    </main>
    <!--Pie de Pagina-->
    <Footer />
  </div>
</template>