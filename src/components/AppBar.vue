<template>
  <!-- No Fr* app bar or toolbar title yet -->
  <v-app-bar app>
    <v-toolbar-title>Feral Authentication</v-toolbar-title>
    <fr-spacer></fr-spacer>
    <div v-if="showAppBar() === true">
      <fr-btn color="default" to="/dashboard">Dashboard</fr-btn>
      <fr-btn color="default" to="/admin">Admin</fr-btn>
      <fr-btn color="default" @click="logoutUser">Logout</fr-btn>
    </div>
  </v-app-bar>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useAuthenticationStore } from "@/store";
import { FrBtn, FrSpacer } from "@feral-auth/vue-components";

export default {
  name: "AppBar",

  components: { FrBtn, FrSpacer },

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