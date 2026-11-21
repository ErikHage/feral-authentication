<template>
  <fr-container v-if="sessions">
    <h2>Active Sessions</h2>

    <fr-row class="mt-3">

      <fr-col cols="2"></fr-col>

      <fr-col cols="8">
        <fr-row>
          <fr-col>
            <fr-btn color="green" @click="refreshData">Refresh</fr-btn>
            <FadeOutAlert :is-visible="alertVisible" :alert-type="alertType" :message="alertMessage"/>
          </fr-col>
        </fr-row>

        <fr-row>
          <fr-col cols="6" v-for="session in sessions" v-bind:key="session.sessionId">
            <fr-card
                class="ma-2 text-left"
                role="region"
                :aria-label="`Session ${session.sessionId}`"
                :title="session.sessionId"
                :subtitle="isCurrentSession(session.sessionId) ? 'current session' : 'remote session'"
            >
              <!-- Given on every card, as before the Fr* swap: a remote session's card keeps an
                   empty prepend area, which sets its title 8px in -->
              <template #prepend>
                <fr-icon v-if="isCurrentSession(session.sessionId)" color="primary" icon="mdi-star"/>
              </template>
              <div class="ma-3 px-4 pb-4">
                <v-text-field
                    :model-value="applicationNameOf(session.applicationId)"
                    label="Application"
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
              </div>
              <template #actions>
                <fr-btn
                    class="text-red"
                    :disabled="isCurrentSession(session.sessionId)"
                    @click="revokeSession(session.sessionId)"
                >Revoke
                </fr-btn>
              </template>
            </fr-card>
          </fr-col>
        </fr-row>

      </fr-col>

      <fr-col cols="2"></fr-col>

    </fr-row>
  </fr-container>
</template>

<script>

import { mapActions, mapState } from "pinia";

import { useApplicationsStore, useAuthenticationStore, useSessionsStore } from "@/store";
import { FrBtn, FrCard, FrCol, FrContainer, FrIcon, FrRow } from "@feral-auth/vue-components";
import FadeOutAlert from "@/components/FadeOutAlert.vue";

export default {
  name: 'ActiveSessions',

  components: { FadeOutAlert, FrBtn, FrCard, FrCol, FrContainer, FrIcon, FrRow },

  computed: {
    ...mapState(useAuthenticationStore, [
      'actor',
    ]),

    ...mapState(useSessionsStore, [
      'sessions', 'alertType', 'alertMessage', 'alertVisible',
    ]),

    ...mapState(useApplicationsStore, [
      'userAllowedApplications',
    ]),
  },

  methods: {
    ...mapActions(useSessionsStore, [
      'fetchUserSessions',
      'deleteSessionById',
    ]),

    ...mapActions(useApplicationsStore, [
      'fetchApplicationsForCurrentUser',
    ]),

    // A session names only its application's id. The user's own applications
    // name most; any other shows as its id
    applicationNameOf(applicationId) {
      return this.userAllowedApplications
          .find(application => application.applicationId === applicationId)
          ?.applicationName ?? applicationId;
    },

    async refreshData() {
      await this.fetchUserSessions();
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
    this.fetchApplicationsForCurrentUser();
  },
}
</script>
