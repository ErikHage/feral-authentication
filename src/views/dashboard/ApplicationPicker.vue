<template>
  <fr-container v-if="userApplications">
    <h2>Available Applications</h2>
    <LoadErrors :messages="[userApplicationsLoadError]"/>
    <fr-row class="mt-3">
      <fr-col cols="2"></fr-col>

      <fr-col cols="8">
        <fr-row>
          <fr-col v-for="application in userApplications"
                  v-bind:key="application.applicationId"
                  cols="4"
          >
            <fr-card class="text-center" :title="application.applicationName">
              <div class="ma-3 px-4 pb-4">
                <fr-image
                    :src="getAssetPathToDisplay(application)"
                    alt="Logo"
                    max-width="125"
                    class="mx-auto pointer"
                    @click="goToApplication(application.applicationId)"
                ></fr-image>
              </div>
            </fr-card>
          </fr-col>
        </fr-row>
      </fr-col>

      <fr-col cols="2"></fr-col>

    </fr-row>
  </fr-container>
</template>

<script>
import { mapActions, mapState } from "pinia";

import { useApplicationsStore, useAuthenticationStore, } from "@/store";
import { getAssetPath } from "@/utils/assets";
import { FrCard, FrCol, FrContainer, FrImage, FrRow } from "@feral-auth/vue-components";
import LoadErrors from "@/components/LoadErrors.vue";

export default {
  name: 'ApplicationPicker',

  components: { LoadErrors, FrCard, FrCol, FrContainer, FrImage, FrRow },

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
