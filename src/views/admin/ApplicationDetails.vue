<template>
  <fr-container v-if="applicationDetails">
    <h2>Application Details</h2>

    <fr-row class="justify-center">
      <fr-col cols="12" sm="8">
        <LoadErrors :messages="[applicationsLoadError, keysLoadError]"/>
        <fr-card class="mt-3">
          <div class="pa-4">
            <fr-form v-model="formValid">
              <v-text-field
                  disabled
                  v-model="applicationDetails.applicationId"
                  label="Application Id"
              ></v-text-field>
              <v-text-field
                  :rules="[rules.applicationName]"
                  v-model="applicationDetails.applicationName"
                  label="Application Name"
              ></v-text-field>
              <v-text-field
                  :rules="[rules.applicationUrl]"
                  v-model="applicationDetails.applicationUrl"
                  label="Application Landing Page"
              ></v-text-field>
              <v-text-field
                  :rules="[rules.scope]"
                  v-model="applicationDetails.scope"
                  label="Roles Scope"
              ></v-text-field>
              <v-text-field
                  disabled
                  v-model="applicationDetails.keyPairId"
                  label="Key Pair Id"
              ></v-text-field>
              <v-text-field
                  v-if="currentKeyDetails"
                  disabled
                  v-model="currentKeyDetails.keyName"
                  label="Key Pair Name"
              ></v-text-field>
              <v-text-field
                  v-if="applicationDetails.previousKeyPairId"
                  disabled
                  v-model="applicationDetails.previousKeyPairId"
                  label="Previous Key Pair Id"
              ></v-text-field>
              <v-text-field
                  v-if="previousKeyDetails"
                  disabled
                  v-model="previousKeyDetails.keyName"
                  label="Previous Key Pair Name"
              ></v-text-field>
            </fr-form>
          </div>
          <template #actions>
            <fr-btn
                @click="openDialog">
              Rotate Key
            </fr-btn>
            <fr-btn
                @click="refreshData">
              Reset
            </fr-btn>
            <fr-btn
                :disabled="!formValid || !isChanged"
                @click="updateApplicationDetails">
              Save
            </fr-btn>
          </template>
        </fr-card>
      </fr-col>
    </fr-row>

    <fr-dialog v-model="dialog" title="Choose New Key">
      <fr-autocomplete
          v-model="form.newKeyId"
          :items="rotateKeysSelect"
          item-title="keyName"
          item-value="keyId"
          label="Key"
      ></fr-autocomplete>
      <template #actions>
        <fr-btn color="blue darken-1" text @click="closeDialog">Cancel</fr-btn>
        <fr-btn color="blue darken-1" text :disabled="!form.newKeyId" @click="performKeyRotation">Save</fr-btn>
      </template>
    </fr-dialog>

  </fr-container>
</template>

<script>
import { mapActions, mapState } from "pinia";

import { useApplicationsStore, useKeysStore } from "@/store";
import {
  FrAutocomplete, FrBtn, FrCard, FrCol, FrContainer, FrDialog, FrForm, FrRow,
} from "@feral-auth/vue-components";
import LoadErrors from "@/components/LoadErrors.vue";

export default {
  name: "ApplicationDetails",

  components: {
    LoadErrors, FrAutocomplete, FrBtn, FrCard, FrCol, FrContainer, FrDialog, FrForm, FrRow,
  },

  data() {
    return {
      dialog: false,
      // The stored application, and the copy the form edits until Save
      savedDetails: null,
      applicationDetails: null,
      currentKeyDetails: null,
      previousKeyDetails: null,
      rotateKeysSelect: [],
      // Vuetify's: null until every field has been checked, then true or false
      formValid: null,
      form: {
        newKeyId: '',
      },
      rules: {
        applicationName: (v) => !!v || 'applicationName is required',
        applicationUrl: (v) => !!v || 'applicationUrl is required',
        scope: (v) => !!v || 'scope is required',
      },
    };
  },

  computed: {
    isChanged() {
      return ['applicationName', 'applicationUrl', 'scope']
          .some(field => this.applicationDetails[field] !== this.savedDetails[field]);
    },

    ...mapState(useApplicationsStore, [
      'selectedApplication', 'loading', 'applicationsLoadError',
    ]),

    ...mapState(useKeysStore, [
      'availableKeys', 'keysLoadError',
    ]),
  },

  methods: {
    ...mapActions(useApplicationsStore, [
      'fetchApplications',
      'selectApplication',
      'updateApplication',
      'rotateAuthenticationKey',
    ]),

    ...mapActions(useKeysStore, [
      'fetchKeys',
    ]),

    resetForm() {
      this.form = {
        newKeyId: '',
      };
    },

    openDialog() {
      this.dialog = true;
      this.resetForm();
    },

    closeDialog() {
      this.dialog = false;
      this.resetForm();
    },

    async refreshData() {
      await this.fetchKeys();
      await this.fetchApplications();
      await this.selectApplication(this.$route.params.id);
      this.savedDetails = this.selectedApplication.applicationDetails;
      // An unknown id has nothing to copy, so the page stays hidden
      this.applicationDetails = this.savedDetails && { ...this.savedDetails };

      this.currentKeyDetails = this.availableKeys.find(key => key.keyId === this.applicationDetails.keyPairId);
      this.previousKeyDetails = this.availableKeys.find(key => key.keyId === this.applicationDetails.previousKeyPairId);
      this.rotateKeysSelect = this.availableKeys.filter(key => key.keyId !== this.applicationDetails.keyPairId);

      console.log('refreshData', {
        currentKey: this.currentKeyDetails,
        prevKey: this.previousKeyDetails,
        app: this.applicationDetails,
      });
    },

    // A failed save keeps the change, to correct or Reset
    async updateApplicationDetails() {
      if (await this.updateApplication(this.applicationDetails)) {
        await this.refreshData();
      }
    },

    async performKeyRotation() {
      console.log('performKeyRotation');
      await this.rotateAuthenticationKey(this.applicationDetails.applicationId, this.form.newKeyId);
      this.closeDialog();
      await this.refreshData();
    },
  },

  mounted() {
    this.refreshData();
  },
}
</script>

<style scoped>

</style>