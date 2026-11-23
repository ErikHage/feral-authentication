<template>
  <div>
    <!-- No Fr* app bar yet -->
    <v-app-bar app>
      <fr-btn color="default" to="/dashboard/applications">Applications</fr-btn>
      <fr-btn color="default" to="/dashboard/profile">Profile</fr-btn>
      <fr-btn color="default" to="/dashboard/sessions">Sessions</fr-btn>
    </v-app-bar>
    <router-view/>
  </div>
</template>

<script>

import { mapState } from "pinia";
import { FrBtn } from "@feral-auth/vue-components";
import { useAuthenticationStore } from "@/store";

export default {
  name: 'DashboardPage',

  components: { FrBtn },

  methods: {
    ...mapState(useAuthenticationStore, {
      actor: 'actor',
    }),
  },
}
</script>
