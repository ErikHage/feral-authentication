<template>
  <v-container v-if="applicationDetails">
    <h2>Application Details</h2>

    <v-row justify="center">
      <v-col cols="12" sm="8">
        <FadeOutAlert class="my-2" :is-visible="alertVisible" :alert-type="alertType" :message="alertMessage"/>
        <v-card class="mt-3">
          <v-card-text>
            <v-text-field
                :rules="[rules.applicationName]"
                v-model="applicationDetails.applicationName"
                label="Application Name"
                ref="applicationNameField"
                @input="checkValidity"
            ></v-text-field>
            <v-text-field
                disabled
                v-model="applicationDetails.applicationId"
                label="Application Id"
            ></v-text-field>
            <v-text-field
                disabled
                v-model="applicationDetails.applicationUrl"
                label="Application Landing Page"
            ></v-text-field>
            <v-text-field
                disabled
                v-model="applicationDetails.keyPairId"
                label="Key Pair Id"
            ></v-text-field>
            <v-text-field
                v-if="applicationDetails.previousKeyPairId"
                disabled
                v-model="applicationDetails.previousKeyPairId"
                label="Previous Key Pair Id"
            ></v-text-field>
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
                :disabled="!isInputValid"
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
              v-model="form.keyPairId"
              :items="availableKeys"
              item-title="keyName"
              item-value="keyId"
              label="Key"
              variant="solo"
              required
          ></v-autocomplete>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="performKeyRotation">Save</v-btn>
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
      applicationDetails: null,
      isInputValid: false,
      form: {
        newKeyId: '',
      },
      rules: {
        applicationName: (v) => !!v || 'Field is required',
      },
    };
  },

  computed: {
    ...mapState(useApplicationsStore, [
      'selectedApplication', 'loading', 'alertType', 'alertMessage', 'alertVisible',
    ]),

    ...mapState(useKeysStore, [
      'availableKeys',
    ]),

    // ...mapState(useKeysStore, {
    //   availableKeys: (state) => state.availableKeys.filter(key => key.keyPairId !== this.applicationDetails.keyPairId),
    // }),
  },

  methods: {
    ...mapActions(useApplicationsStore, [
      'fetchApplications',
      'selectApplication',
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
      this.applicationDetails = this.selectedApplication.applicationDetails;
    },

    async checkValidity() {
      const nameValidation = await this.$refs.applicationNameField.validate();
      this.isInputValid = nameValidation.length === 0;
    },

    async updateApplicationDetails() {
      console.log('updateApplicationDetails');
      // TODO
      await this.refreshData();
    },

    async performKeyRotation() {
      console.log('performKeyRotation');
      // TODO
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