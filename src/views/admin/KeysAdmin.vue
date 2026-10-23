<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8">
        <FadeOutAlert class="my-2" :is-visible="alertVisible" :alert-type="alertType" :message="alertMessage"/>

        <v-card>
          <v-card-title>
            <span class="headline">Manage Keys</span>
            <v-spacer></v-spacer>
            <v-btn class="mr-2" color="primary" @click="openGenerateDialog">Generate</v-btn>
            <v-btn color="primary" @click="refresh">Refresh</v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
                :headers="headers"
                :items="availableKeys"
                item-key="keyId"
                class="elevation-1"
            >
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="generateDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title>
          <span class="headline">Generate Key</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="generateForm" v-model="formValid">
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
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeGenerateDialog">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="generate" :disabled="!formValid">Generate</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { useKeysStore } from "@/store";
import { mapActions, mapState } from "pinia";
import FadeOutAlert from "@/components/FadeOutAlert.vue";
import { required } from "@/utils/rules";

export default {
  name: "KeysAdmin",
  components: { FadeOutAlert },

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