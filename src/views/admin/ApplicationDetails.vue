<template>
  <v-container v-if="applicationDetails">
    <h2>Application Details</h2>

    <v-row justify="center">
      <v-col cols="12" sm="8">
        <FadeOutAlert class="my-2" :is-visible="alertVisible" :alert-type="alertType" :message="alertMessage"/>
        <v-card>
          <v-card-title>
            <span class="headline">{{ selectedApplication.applicationName }}</span>
          </v-card-title>
          <v-card-text>
            {{ selectedApplication }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

  </v-container>
</template>

<script>
import { mapActions, mapState } from "pinia";

import { useApplicationsStore } from "@/store";
import FadeOutAlert from "@/components/FadeOutAlert.vue";

export default {
  name: "ApplicationDetails",

  components: { FadeOutAlert },

  data() {
    return {
      applicationDetails: null,
    };
  },

  computed: {
    ...mapState(useApplicationsStore, [
        'selectedApplication', 'loading', 'alertType', 'alertMessage', 'alertVisible',
    ]),
  },

  methods: {
    ...mapActions(useApplicationsStore, [
      'fetchApplications',
      'selectApplication',
    ]),

    async refreshData() {
      await this.fetchApplications();
      await this.selectApplication(this.$route.params.id);
      this.applicationDetails = this.selectedApplication.applicationDetails;
    },
  },

  mounted() {
    this.refreshData();
  },
}
</script>

<style scoped>

</style>