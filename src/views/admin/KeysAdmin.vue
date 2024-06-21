<template>
  <v-container>
    <h2>Keys Admin</h2>
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
          <v-form ref="generateForm">
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
          <v-btn color="blue darken-1" text @click="generate" :disabled="!isFormValid">Generate</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { useKeysStore } from "@/store";
import { mapActions, mapState } from "pinia";
import FadeOutAlert from "@/components/FadeOutAlert.vue";

export default {
  name: "KeysAdmin",
  components: { FadeOutAlert },

  data() {
    return {
      generateDialog: false,
      keyToDelete: null,
      keyName: '',
      expiration: '',
      headers: [
        { title: 'Key Name', key: 'keyName' },
        { title: 'Expiration', key: 'expiration' },
      ],
      nameRules: [v => !!v || 'Name is required'],
      dateRules: [v => !!v || 'Expiration date is required'],
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

    openGenerateDialog() {
      this.resetForm();
      this.generateDialog = true;
    },

    closeGenerateDialog() {
      this.generateDialog = false;
    },

    async isFormValid() {
      const { valid: formValid } = await this.$refs.generateForm.validate();

      return formValid;
    },

    async generate() {
      console.log('generating');
      console.log('keyName', this.keyName);
      console.log('expiration', this.expiration);
      await this.generateKey(this.keyName, this.expiration);
      this.closeGenerateDialog();
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