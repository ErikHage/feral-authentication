<template>
  <v-app-bar app>
    <v-toolbar-title>Feral Authentication</v-toolbar-title>
    <v-spacer></v-spacer>
    <div v-if="showAppBar() === true">
      <v-btn to="/dashboard">Dashboard</v-btn>
      <v-btn to="/admin">Admin</v-btn>
      <v-btn @click="logoutUser">Logout</v-btn>
    </div>
  </v-app-bar>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useAuthenticationStore } from "@/store";

export default {
  name: "AppBar",

  methods: {
    ...mapActions(useAuthenticationStore, {
      logout: 'logout',
    }),

    ...mapState(useAuthenticationStore, {
      showAppBar: (state) => state.showAppBar,
    }),

    async logoutUser() {
      await this.logout();
      this.$router.push('/login');
    }
  },
}
</script>

<style scoped>

</style>