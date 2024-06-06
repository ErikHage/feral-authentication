<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>Feral Authentication</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text to="/">Login</v-btn>
      <v-btn text to="/apps">Apps</v-btn>
    </v-app-bar>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',
}
</script>
