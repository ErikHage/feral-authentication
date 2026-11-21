<template>
  <fr-container>
    <fr-row class="justify-center">
      <fr-col cols="12" sm="8">
        <FadeOutAlert class="my-2" :is-visible="alertVisible" :alert-type="alertType" :message="alertMessage"/>

        <fr-card title="Manage Keys">
          <div class="px-4 pb-4">
            <div class="mb-3">
              <fr-btn class="mr-2" color="primary" @click="openGenerateDialog">Generate</fr-btn>
              <fr-btn color="primary" @click="refresh">Refresh</fr-btn>
            </div>
            <fr-data-table
                :headers="headers"
                :items="availableKeys"
                item-value="keyId"
                class="elevation-1"
            >
            </fr-data-table>
          </div>
        </fr-card>
      </fr-col>
    </fr-row>

    <fr-dialog v-model="generateDialog" title="Generate Key" persistent>
      <fr-form ref="generateForm" v-model="formValid">
        <v-text-field
            v-model="keyName"
            label="Key Name"
            :rules="nameRules"
            required
        ></v-text-field>

        <v-text-field
            v-model="expiration"
            label="Expiration Date"
            :rules="dateRules"
            required
            type="datetime-local"
        ></v-text-field>
      </fr-form>
      <template #actions>
        <fr-btn color="blue darken-1" text @click="closeGenerateDialog">Cancel</fr-btn>
        <fr-btn color="blue darken-1" text @click="generate" :disabled="!formValid">Generate</fr-btn>
      </template>
    </fr-dialog>
  </fr-container>
</template>

<script>
import { useKeysStore } from "@/store";
import { mapActions, mapState } from "pinia";
import {
  FrBtn, FrCard, FrCol, FrContainer, FrDataTable, FrDialog, FrForm, FrRow,
} from "@feral-auth/vue-components";
import FadeOutAlert from "@/components/FadeOutAlert.vue";
import { required } from "@/utils/rules";

export default {
  name: "KeysAdmin",
  components: {
    FadeOutAlert, FrBtn, FrCard, FrCol, FrContainer, FrDataTable, FrDialog, FrForm, FrRow,
  },

  data() {
    return {
      generateDialog: false,
      keyToDelete: null,
      keyName: '',
      expiration: '',
      // Vuetify's: null until every field has been checked, then true or false
      formValid: null,
      headers: [
        { title: 'Key Id', key: 'keyId' },
        { title: 'Key Name', key: 'keyName' },
        { title: 'Expiration', key: 'expiration' },
      ],
      nameRules: [required('Name')],
      dateRules: [required('Expiration date')],
    };
  },

  computed: {
    ...mapState(useKeysStore, [
      'availableKeys', 'alertType', 'alertMessage', 'alertVisible',
    ]),
  },

  methods: {
    ...mapActions(useKeysStore, [
      'fetchKeys',
      'generateKey',
    ]),

    resetForm() {
      this.keyName = '';
      this.expiration = '';
    },

    async openGenerateDialog() {
      this.resetForm();
      this.generateDialog = true;
      // The dialog keeps its form between openings, so clear the last one's errors
      await this.$nextTick();
      this.$refs.generateForm.resetValidation();
    },

    closeGenerateDialog() {
      this.generateDialog = false;
    },

    async generate() {
      const { valid } = await this.$refs.generateForm.validate();
      if (!valid) {
        return;
      }
      console.log('generating');
      console.log('keyName', this.keyName);
      console.log('expiration', this.expiration);
      await this.generateKey(this.keyName, this.expiration);
      this.closeGenerateDialog();
      await this.refresh();
    },

    async refresh() {
      await this.fetchKeys();
    }
  },

  mounted() {
    this.refresh();
  },
}
</script>

<style scoped>
</style>