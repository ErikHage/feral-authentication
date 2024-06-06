<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>Feral Authentication</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn to="/">Login</v-btn>
      <v-btn to="/apps">Apps</v-btn>
<!--      <v-btn @click="logout">Logout</v-btn>-->
    </v-app-bar>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import loginApi from './js/login-api';

export default {
  name: 'App',

  methods: {
    async logout() {
      try {
        await loginApi.logout();
        this.$router.push('/login');
      } catch (err) {
        console.log(err.message);
        // what to do?
      }
    }
  },
}
</script>
