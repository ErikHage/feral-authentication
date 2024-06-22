<template>
  <v-container>
    <h2>Applications Admin</h2>

    <v-row justify="center">
      <v-col cols="12" sm="8">
        <FadeOutAlert class="my-2" :is-visible="alertVisible" :alert-type="alertType" :message="alertMessage"/>
        <v-card>
          <v-card-title>
            <span class="headline">Manage Applications</span>
            <v-spacer></v-spacer>
<!--            <v-btn class="mr-2" color="primary" @click="openDialog()">Add</v-btn>-->
            <v-btn color="primary" @click="refreshData()">Refresh</v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
                :headers="headers"
                :items="applications"
                item-key="applicationId"
                class="elevation-1"
                :loading="loading"
            >
              <template #item.actions="{ item }">
                <v-icon small @click="goToApplicationDetails(item)">mdi-pencil</v-icon>
              </template>
            </v-data-table>
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
  name: "ApplicationsAdmin",

  components: { FadeOutAlert },

  data() {
    return {
      dialog: false,
      headers: [
        { title: 'Application Name', key: 'applicationName' },
        { title: 'Application Url', key: 'applicationUrl' },
        { title: 'Key Id', key: 'keyPairId' },
        { title: 'Prev Key Id', key: 'previousKeyPairId' },
        { title: 'Actions', key: 'actions', sortable: false },
      ],
    };
  },

  computed: {
    ...mapState(useApplicationsStore, [
        'applications', 'loading', 'alertType', 'alertMessage', 'alertVisible',
    ]),
  },

  methods: {
    ...mapActions(useApplicationsStore, [
      'fetchApplications',
      'createApplication',
    ]),

    async refreshData() {
      await this.fetchApplications();
    },

    openDialog(application) {
      this.dialog = true;
    },

    goToApplicationDetails(application) {
      this.$router.push(`/admin/applications/${application.applicationId}`);
    }
  },

  mounted() {
    this.refreshData();
  },
}
</script>

<style scoped>

</style>