<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8">
        <FadeOutAlert class="my-2" :is-visible="alertVisible" :alert-type="alertType" :message="alertMessage"/>
        <v-card>
          <v-card-title>
            <span class="headline">Manage Applications</span>
            <v-spacer></v-spacer>
            <v-btn class="mr-2" color="primary" @click="openDialog()">Add</v-btn>
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
                <v-icon small :aria-label="`Edit ${item.applicationName}`" @click="goToApplicationDetails(item)">mdi-pencil</v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card>
        <v-card-title>
          <span class="headline">Add Application</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="applicationForm" v-model="formValid">
            <v-text-field v-model="form.applicationName" label="Name" :rules="rules.applicationName"></v-text-field>
            <v-text-field v-model="form.applicationUrl" label="Url" :rules="rules.applicationUrl"></v-text-field>
            <v-text-field v-model="form.scope" label="Scope" :rules="rules.scope"></v-text-field>
            <v-autocomplete
                v-model="form.keyPairId"
                :items="availableKeys"
                item-title="keyName"
                item-value="keyId"
                label="Key"
                variant="solo"
                :rules="rules.keyPairId"
            ></v-autocomplete>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">Cancel</v-btn>
          <v-btn color="blue darken-1" text :disabled="!formValid" @click="saveApplication">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
import { mapActions, mapState } from "pinia";

import { useApplicationsStore, useKeysStore } from "@/store";
import FadeOutAlert from "@/components/FadeOutAlert.vue";
import { required } from "@/utils/rules";

export default {
  name: "ApplicationsAdmin",

  components: { FadeOutAlert },

  data() {
    return {
      dialog: false,
      // Vuetify's: null until every field has been checked, then true or false
      formValid: null,
      rules: {
        applicationName: [required('Name')],
        applicationUrl: [required('Url')],
        scope: [required('Scope')],
        keyPairId: [required('Key')],
      },
      form: {
        applicationName: '',
        applicationUrl: '',
        scope: '',
        keyPairId: '',
      },
      headers: [
        { title: 'Application Name', key: 'applicationName' },
        { title: 'Application Url', key: 'applicationUrl' },
        { title: 'Scope', key: 'scope' },
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

    ...mapState(useKeysStore, [
      'availableKeys',
    ]),
  },

  methods: {
    ...mapActions(useApplicationsStore, [
      'fetchApplications',
      'createApplication',
      'setAlertMessage',
    ]),

    ...mapActions(useKeysStore, [
      'fetchKeys',
    ]),

    async refreshData() {
      await this.fetchApplications();
      await this.fetchKeys();
    },

    resetForm() {
      this.form = {
        applicationName: '',
        applicationUrl: '',
        scope: '',
        keyPairId: '',
      };
    },

    async openDialog() {
      this.resetForm();
      this.dialog = true;
      // The dialog keeps its form between openings, so clear the last one's errors
      await this.$nextTick();
      this.$refs.applicationForm.resetValidation();
    },

    closeDialog() {
      this.dialog = false;
    },

    async saveApplication() {
      const validationResult = await this.$refs.applicationForm.validate();
      if (validationResult.valid) {
        await this.createApplication(this.form);
        await this.refreshData();
        this.dialog = false;
      } else {
        console.log('create app form invalid', validationResult);
      }
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