<template>
  <fr-container>
    <!-- No Fr* app bar yet -->
    <v-app-bar app>
      <fr-btn to="/dashboard/applications">Applications</fr-btn>
      <fr-btn to="/dashboard/profile">Profile</fr-btn>
      <fr-btn to="/dashboard/sessions">Sessions</fr-btn>
    </v-app-bar>
    <fr-row>
      <router-view/>
    </fr-row>
  </fr-container>
</template>

<script>

import { mapState } from "pinia";
import { FrBtn, FrContainer, FrRow } from "@feral-auth/vue-components";
import { useAuthenticationStore } from "@/store";

export default {
  name: 'DashboardPage',

  components: { FrBtn, FrContainer, FrRow },

  methods: {
    ...mapState(useAuthenticationStore, {
      actor: 'actor',
    }),
  },
}
</script>
