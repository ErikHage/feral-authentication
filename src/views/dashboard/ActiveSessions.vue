<template>
  <v-container v-if="sessions">
    <h2 class="headline">Active Sessions</h2>
    <v-row class="mt-3">
      <v-col cols="2">
      </v-col>

      <v-col cols="8">
        <v-row>
          <v-col cols="6" v-for="session in sessions">
            <v-card class="ma-2">
              <v-card-text class="ma-3">
                <v-text-field
                    v-model="session.sessionId"
                    label="Session Id"
                    disabled
                    density="compact"
                ></v-text-field>
                <v-text-field
                    v-model="session.roles"
                    label="Authorization"
                    disabled
                    density="compact"
                ></v-text-field>
                <v-text-field
                    v-model="session.expiration"
                    label="Expiration"
                    disabled
                    density="compact"
                ></v-text-field>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

      </v-col>

      <v-col cols="2">

      </v-col>

    </v-row>
  </v-container>
</template>

<script>

import { mapActions, mapState } from "pinia";
import { useAuthenticationStore, useSessionsStore, useUsersStore } from "@/store";
import FadeOutAlert from "@/components/FadeOutAlert.vue";

export default {
  name: 'UserProfile',

  computed: {
    ...mapState(useAuthenticationStore, [
      'actor',
    ]),

    ...mapState(useSessionsStore, [
      'sessions',
    ]),
  },

  methods: {
    ...mapActions(useSessionsStore, [
        'fetchUserSessions',
    ]),

    async refreshData() {
      await this.fetchUserSessions(this.actor.userId);
    },
  },

  mounted() {
    this.refreshData();
  },
}
</script>
