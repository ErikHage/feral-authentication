<template>
  <v-container v-if="sessions">
    <h2 class="headline">Active Sessions</h2>

    <v-row class="mt-3">

      <v-col cols="2"></v-col>

      <v-col cols="8">
        <v-row>
          <v-col>
            <v-btn color="green" @click="refreshData">Refresh</v-btn>
            <FadeOutAlert :is-visible="alertVisible" :alert-type="alertType" :message="alertMessage"/>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="6" v-for="session in sessions">
            <v-card
                class="ma-2 text-left"
                :title="session.sessionId"
                :subtitle="isCurrentSession(session.sessionId) ? 'current session' : 'remote session'"
            >
              <template v-slot:prepend>
                <v-icon
                    v-if="isCurrentSession(session.sessionId)"
                    color="primary"
                    icon="mdi-star"
                ></v-icon>
              </template>
              <v-card-text class="ma-3">
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
              <v-card-actions>
                <v-btn
                    class="text-red"
                    :disabled="isCurrentSession(session.sessionId)"
                    @click="revokeSession(session.sessionId)"
                >Revoke
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

      </v-col>

      <v-col cols="2"></v-col>

    </v-row>
  </v-container>
</template>

<script>

import { mapActions, mapState } from "pinia";

import { useAuthenticationStore, useSessionsStore } from "@/store";
import FadeOutAlert from "@/components/FadeOutAlert.vue";

export default {
  name: 'UserProfile',

  components: { FadeOutAlert },

  computed: {
    ...mapState(useAuthenticationStore, [
      'actor',
    ]),

    ...mapState(useSessionsStore, [
      'sessions', 'alertType', 'alertMessage', 'alertVisible',
    ]),
  },

  methods: {
    ...mapActions(useSessionsStore, [
      'fetchUserSessions',
      'deleteSessionById',
    ]),

    async refreshData() {
      await this.fetchUserSessions(this.actor.userId);
    },

    isCurrentSession(sessionId) {
      return this.actor.sessionId === sessionId;
    },

    async revokeSession(sessionId) {
      await this.deleteSessionById(sessionId);
      await this.refreshData();
    }
  },

  mounted() {
    this.refreshData();
  },
}
</script>
