<template>
  <v-container>
    <v-app-bar app>
      <v-btn to="/dashboard/profile">Profile</v-btn>
      <v-btn to="/dashboard/sessions">Sessions</v-btn>
    </v-app-bar>
    <v-row class="text-center">
      <router-view/>
    </v-row>
  </v-container>
</template>

<script>

import { mapState } from "pinia";
import { useAuthenticationStore } from "@/store";

export default {
  name: 'Dashboard',

  methods: {
    ...mapState(useAuthenticationStore, {
      actor: 'actor',
    }),
  },
}
</script>
