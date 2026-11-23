<template>
  <fr-page>
    <LoadErrors :messages="[keysLoadError]"/>

    <fr-card flush>
      <fr-data-table
          title="Manage Keys"
          :headers="headers"
          :items="availableKeys"
          item-value="keyId"
      >
        <template #actions>
          <fr-btn @click="openGenerateDialog">Generate</fr-btn>
          <fr-btn @click="refresh">Refresh</fr-btn>
        </template>
      </fr-data-table>
    </fr-card>

    <fr-dialog
        v-model="generateDialog"
        title="Generate Key"
        persistent
        cancel-text="Cancel"
        confirm-text="Generate"
        :confirm-disabled="!formValid"
        @cancel="closeGenerateDialog"
        @confirm="generate"
    >
      <fr-form ref="generateForm" v-model="formValid">
        <fr-text-field
            v-model="keyName"
            label="Key Name"
            :rules="nameRules"
            required
        ></fr-text-field>

        <fr-text-field
            v-model="expiration"
            label="Expiration Date"
            :rules="dateRules"
            required
            type="datetime-local"
        ></fr-text-field>
      </fr-form>
    </fr-dialog>
  </fr-page>
</template>

<script>
import { useKeysStore } from "@/store";
import { mapActions, mapState } from "pinia";
import {
  FrBtn, FrCard, FrDataTable, FrDialog, FrForm, FrPage, FrTextField,
} from "@feral-auth/vue-components";
import LoadErrors from "@/components/LoadErrors.vue";
import { required } from "@/utils/rules";

export default {
  name: "KeysAdmin",
  components: {
    LoadErrors, FrBtn, FrCard, FrDataTable, FrDialog, FrForm, FrPage, FrTextField,
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
      'availableKeys', 'keysLoadError',
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