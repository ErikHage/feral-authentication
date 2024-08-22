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
              <v-card-title class="text-center">
                {{ application.applicationName }}
              </v-card-title>
              <v-card-text class="ma-3">
                <v-img
                    :src="getAssetPathToDisplay(application)"
                    alt="Logo"
                    contain
                    max-width="125"
                    class="mx-auto pointer"
                    @click="goToApplication(application.applicationId)"
                ></v-img>
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
import { mapActions, mapState } from "pinia";

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

    getAssetPathToDisplay(application) {
      if (application.mascotAssetPath) {
        return `/auth/assets/${application.mascotAssetPath}`;
      }
      return '/auth/assets/default-mascot.jpg';
    },

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
.pointer {
  cursor: pointer;
}
</style>
