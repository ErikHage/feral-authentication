<template>
  <v-app-bar app>
    <v-toolbar-title>Feral Authentication</v-toolbar-title>
    <v-spacer></v-spacer>
    <div v-if="showAppBar() === true">
      <v-btn to="/apps">Apps</v-btn>
      <v-btn @click="logoutUser">Logout</v-btn>
    </div>
  </v-app-bar>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useUser } from "@/store";

export default {
  name: "AppBar",

  methods: {
    ...mapActions(useUser, {
      logout: 'logout',
    }),

    ...mapState(useUser, {
      showAppBar: (state) => state.showAppBar,
    }),

    async logoutUser() {
      await this.logout();
      this.$router.push('/');
    }
  },
}
</script>

<style scoped>

</style>