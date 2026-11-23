<template>
  <!-- No Fr* app bar, nav icon or toolbar title yet -->
  <v-app-bar app>
    <v-app-bar-nav-icon
        v-if="showAppBar === true"
        aria-label="Menu"
        @click="toggle($vuetify.display.smAndDown)"
    />
    <v-toolbar-title>Feral Authentication</v-toolbar-title>
    <fr-spacer></fr-spacer>
    <fr-btn v-if="showAppBar === true" color="default" @click="logoutUser">Logout</fr-btn>
  </v-app-bar>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useAuthenticationStore } from "@/store";
import { useNavigationStore } from "@/store/navigation";
import { FrBtn, FrSpacer } from "@feral-auth/vue-components";

export default {
  name: "AppBar",

  components: { FrBtn, FrSpacer },

  computed: {
    ...mapState(useAuthenticationStore, [
      'showAppBar',
    ]),
  },

  methods: {
    ...mapActions(useAuthenticationStore, {
      logout: 'logout',
    }),

    ...mapActions(useNavigationStore, [
      'toggle',
    ]),

    async logoutUser() {
      await this.logout();
      this.$router.push('/login');
    }
  },
}
</script>
