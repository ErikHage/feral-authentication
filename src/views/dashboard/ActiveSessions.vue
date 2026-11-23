<template>
  <fr-page v-if="sessions" title="Active Sessions">
    <template #actions>
      <fr-btn color="success" @click="refreshData">Refresh</fr-btn>
    </template>
    <LoadErrors :messages="[sessionsLoadError, userApplicationsLoadError]"/>

    <fr-row>
      <fr-col cols="12" md="6" v-for="session in sessions" v-bind:key="session.sessionId">
        <fr-card
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
          <fr-text-field
              :model-value="applicationNameOf(session.applicationId)"
              label="Application"
              disabled
          ></fr-text-field>
          <fr-text-field
              v-model="session.roles"
              label="Authorization"
              disabled
          ></fr-text-field>
          <fr-text-field
              v-model="session.expiration"
              label="Expiration"
              disabled
          ></fr-text-field>
          <template #actions>
            <fr-btn
                color="error"
                :disabled="isCurrentSession(session.sessionId)"
                @click="revokeSession(session.sessionId)"
            >Revoke
            </fr-btn>
          </template>
        </fr-card>
      </fr-col>
    </fr-row>
  </fr-page>
</template>

<script>

import { mapActions, mapState } from "pinia";

import { useApplicationsStore, useAuthenticationStore, useSessionsStore } from "@/store";
import { FrBtn, FrCard, FrCol, FrIcon, FrPage, FrRow, FrTextField } from "@feral-auth/vue-components";
import LoadErrors from "@/components/LoadErrors.vue";

export default {
  name: 'ActiveSessions',

  components: { LoadErrors, FrBtn, FrCard, FrCol, FrIcon, FrPage, FrRow, FrTextField },

  computed: {
    ...mapState(useAuthenticationStore, [
      'actor',
    ]),

    ...mapState(useSessionsStore, [
      'sessions', 'sessionsLoadError',
    ]),

    ...mapState(useApplicationsStore, [
      'userAllowedApplications', 'userApplicationsLoadError',
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
