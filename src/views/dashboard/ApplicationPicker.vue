<template>
  <v-container v-if="userApplications">
    <h2 class="headline">Available Applications</h2>
    <v-row class="mt-3">
      <v-col cols="2"></v-col>

      <v-col cols="8">
        <v-row>
          <v-col v-for="application in userApplications"
                 v-bind:key="application.applicationId"
                 cols="4"
          >
            <v-card>
              <v-card-title class="text-left">
                {{ application.applicationName }}
              </v-card-title>
              <v-card-text class="ma-3">
                <!-- TODO add a logo to click instead of an anchor tag -->
                <!-- TODO this should not be a direct link, we need to get a proper token first -->
                <v-btn @click="goToApplication(application.applicationId)">Go!</v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="2"></v-col>

    </v-row>
  </v-container>
</template>

<script>
import {mapActions, mapState} from "pinia";

import { useApplicationsStore, useAuthenticationStore, } from "@/store";

export default {
  name: 'ApplicationPicker',

  data() {
    return {
      userApplications: null,
    };
  },

  computed: {
    ...mapState(useApplicationsStore, [
      'userAllowedApplications',
    ]),
  },

  methods: {
    ...mapActions(useApplicationsStore, [
      'fetchApplicationsForCurrentUser',
    ]),

    ...mapActions(useAuthenticationStore, [
      'loginToApplication',
    ]),

    async goToApplication(applicationId) {
      console.log('goToApplication', applicationId);
      await this.loginToApplication(applicationId);
    },

    async refreshData() {
      await this.fetchApplicationsForCurrentUser();
      this.userApplications = this.userAllowedApplications;
    },
  },

  mounted() {
    this.refreshData();
  },
}
</script>

<style scoped>

</style>
