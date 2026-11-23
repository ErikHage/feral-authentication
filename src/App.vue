<template>
  <v-app>
    <AppBar/>
    <NavDrawer/>
    <v-main>
      <router-view></router-view>
    </v-main>
    <AppMessages/>
  </v-app>
</template>

<script>
import AppBar from "@/components/AppBar.vue";
import AppMessages from "@/components/AppMessages.vue";
import NavDrawer from "@/components/NavDrawer.vue";

export default {
  name: 'App',

  components: { AppBar, AppMessages, NavDrawer },
}
</script>
