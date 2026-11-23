<template>
  <fr-container>
    <fr-row class="justify-center">
      <fr-col cols="12" sm="8">
        <LoadErrors :messages="[applicationsLoadError, keysLoadError]"/>
        <fr-card flush>
          <fr-data-table
              title="Manage Applications"
              :headers="headers"
              :items="applications"
              item-value="applicationId"
              :loading="loading"
          >
            <template #actions>
              <fr-btn color="primary" @click="openDialog()">Add</fr-btn>
              <fr-btn color="primary" @click="refreshData()">Refresh</fr-btn>
            </template>
            <template #item.actions="{ item }">
              <fr-icon :aria-label="`Edit ${item.applicationName}`" @click="goToApplicationDetails(item)">mdi-pencil</fr-icon>
            </template>
          </fr-data-table>
        </fr-card>
      </fr-col>
    </fr-row>

    <fr-dialog v-model="dialog" title="Add Application" persistent>
      <fr-form ref="applicationForm" v-model="formValid">
        <v-text-field v-model="form.applicationName" label="Name" :rules="rules.applicationName"></v-text-field>
        <v-text-field v-model="form.applicationUrl" label="Url" :rules="rules.applicationUrl"></v-text-field>
        <v-text-field v-model="form.scope" label="Scope" :rules="rules.scope"></v-text-field>
        <fr-autocomplete
            v-model="form.keyPairId"
            :items="availableKeys"
            item-title="keyName"
            item-value="keyId"
            label="Key"
            :rules="rules.keyPairId"
        ></fr-autocomplete>
      </fr-form>
      <template #actions>
        <fr-btn @click="closeDialog">Cancel</fr-btn>
        <fr-btn :disabled="!formValid" @click="saveApplication">Create</fr-btn>
      </template>
    </fr-dialog>

  </fr-container>
</template>

<script>
import { mapActions, mapState } from "pinia";

import { useApplicationsStore, useKeysStore } from "@/store";
import {
  FrAutocomplete, FrBtn, FrCard, FrCol, FrContainer, FrDataTable, FrDialog, FrForm, FrIcon, FrRow,
} from "@feral-auth/vue-components";
import LoadErrors from "@/components/LoadErrors.vue";
import { required } from "@/utils/rules";

export default {
  name: "ApplicationsAdmin",

  components: {
    LoadErrors, FrAutocomplete, FrBtn, FrCard, FrCol, FrContainer, FrDataTable, FrDialog, FrForm, FrIcon, FrRow,
  },

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
      'applications', 'loading', 'applicationsLoadError',
    ]),

    ...mapState(useKeysStore, [
      'availableKeys', 'keysLoadError',
    ]),
  },

  methods: {
    ...mapActions(useApplicationsStore, [
      'fetchApplications',
      'createApplication',
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