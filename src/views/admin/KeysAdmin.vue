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
            <v-btn class="mr-2" color="primary" @click="generate()">Generate</v-btn>
            <v-btn color="primary" @click="fetchKeys()">Refresh</v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
                :headers="headers"
                :items="keys"
                item-key="keyId"
                class="elevation-1"
            >
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Delete Key</span>
        </v-card-title>
        <v-card-text class="text-center">
          <span class="headline">{{keyToDelete?.keyName}}</span>
          <span class="red-text">Are you sure? This cannot be undone!</span>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDeleteDialog">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="deleteKeyById(keyToDelete?.keyId)">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { useKeysStore, useRolesStore } from "@/store";
import { mapActions, mapState } from "pinia";
import FadeOutAlert from "@/components/FadeOutAlert.vue";

export default {
  name: "KeysAdmin",
  components: { FadeOutAlert },

  data() {
    return {
      dialog: false,
      deleteDialog: false,
      keyToDelete: null,
      headers: [
        { title: 'Key Name', key: 'keyName' },
        { title: 'Expiration', key: 'expiration' },
      ],
    };
  },

  computed: {
    ...mapState(useKeysStore, [
        'keys', 'alertType', 'alertMessage', 'alertVisible',
    ]),
  },

  methods: {
    ...mapActions(useKeysStore, [
        'fetchKeys',
      'generateKey',
    ]),

    async generate() {
      // nothing yet
    },
  },

  mounted() {
    this.fetchKeys();
  },
}
</script>

<style scoped>
  .red-text {
    color: darkred;
    font-weight: bold;
  }
</style>