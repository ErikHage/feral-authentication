<template>
  <fr-page v-if="userApplications" title="Available Applications">
    <LoadErrors :messages="[userApplicationsLoadError]"/>
    <fr-row>
      <fr-col v-for="application in userApplications"
              v-bind:key="application.applicationId"
              cols="12" sm="6" md="4" lg="3"
      >
        <fr-card class="text-center" :title="application.applicationName">
          <fr-image
              :src="getAssetPathToDisplay(application)"
              alt="Logo"
              max-width="125"
              class="mx-auto pointer"
              @click="goToApplication(application.applicationId)"
          ></fr-image>
        </fr-card>
      </fr-col>
    </fr-row>
  </fr-page>
</template>

<script>
import { mapActions, mapState } from "pinia";

import { useApplicationsStore, useAuthenticationStore, } from "@/store";
import { getAssetPath } from "@/utils/assets";
import { FrCard, FrCol, FrImage, FrPage, FrRow } from "@feral-auth/vue-components";
import LoadErrors from "@/components/LoadErrors.vue";

export default {
  name: 'ApplicationPicker',

  components: { LoadErrors, FrCard, FrCol, FrImage, FrPage, FrRow },

  data() {
    return {
      userApplications: null,
    };
  },

  computed: {
    ...mapState(useApplicationsStore, [
      'userAllowedApplications', 'userApplicationsLoadError',
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
        return getAssetPath(application.mascotAssetPath);
      }
      return getAssetPath('/default-mascot.jpg');
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
