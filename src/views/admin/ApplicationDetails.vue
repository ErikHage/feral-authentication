<template>
  <v-container v-if="applicationDetails">
    <h2>Application Details</h2>

    <v-row justify="center">
      <v-col cols="12" sm="8">
        <FadeOutAlert class="my-2" :is-visible="alertVisible" :alert-type="alertType" :message="alertMessage"/>
        <v-card class="mt-3">
          <v-card-text>
            <v-form v-model="formValid">
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
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                @click="openDialog">
              Rotate Key
            </v-btn>
            <v-btn
                @click="refreshData">
              Reset
            </v-btn>
            <v-btn
                :disabled="!formValid || !isChanged"
                @click="updateApplicationDetails">
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Choose New Key</span>
        </v-card-title>
        <v-card-text>
          <v-autocomplete
              v-model="form.newKeyId"
              :items="rotateKeysSelect"
              item-title="keyName"
              item-value="keyId"
              label="Key"
              variant="solo"
          ></v-autocomplete>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">Cancel</v-btn>
          <v-btn color="blue darken-1" text :disabled="!form.newKeyId" @click="performKeyRotation">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
import { mapActions, mapState } from "pinia";

import { useApplicationsStore, useKeysStore } from "@/store";
import FadeOutAlert from "@/components/FadeOutAlert.vue";

export default {
  name: "ApplicationDetails",

  components: { FadeOutAlert },

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
      'selectedApplication', 'loading', 'alertType', 'alertMessage', 'alertVisible',
    ]),

    ...mapState(useKeysStore, [
      'availableKeys',
    ]),
  },

  methods: {
    ...mapActions(useApplicationsStore, [
      'fetchApplications',
      'selectApplication',
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

    async updateApplicationDetails() {
      console.log('updateApplicationDetails');
      // TODO
      await this.refreshData();
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