<template>
  <v-app>
    <AppBar/>
    <v-main>
      <router-view></router-view>
    </v-main>
    <AppMessages/>
  </v-app>
</template>

<script>
import AppBar from "@/components/AppBar.vue";
import AppMessages from "@/components/AppMessages.vue";

export default {
  name: 'App',

  components: { AppBar, AppMessages },
}
</script>
