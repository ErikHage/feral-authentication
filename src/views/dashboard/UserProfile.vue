<template>
  <fr-container v-if="userDetails">
    <h2>{{ savedDetails.firstName }} {{ savedDetails.lastName }}</h2>
    <fr-row class="mt-3">
      <fr-col cols="2">
      </fr-col>

      <fr-col cols="8">
        <fr-row>
          <fr-col>
            <fr-card class="text-left" title="Personal Details">
              <div class="ma-3 px-4 pb-4">
                <fr-form v-model="formValid">
                  <v-text-field
                      :rules="[rules.firstName]"
                      v-model="userDetails.firstName"
                      label="First Name"
                  ></v-text-field>
                  <v-text-field
                      :rules="[rules.lastName]"
                      v-model="userDetails.lastName"
                      label="Last Name"
                  ></v-text-field>
                  <v-text-field
                      disabled
                      v-model="userDetails.username"
                      label="Username"
                  ></v-text-field>
                  <v-text-field
                      disabled
                      v-model="userDetails.email"
                      label="Email"
                  ></v-text-field>
                  <v-text-field
                      disabled
                      v-model="userDetails.lastLogin"
                      label="Last Login"
                  ></v-text-field>
                  <v-text-field
                      disabled
                      v-model="userDetails.isSuspended"
                      label="Suspended"
                  ></v-text-field>
                </fr-form>

                <FadeOutAlert :is-visible="alertVisible" :alert-type="alertType" :message="alertMessage"/>
              </div>
              <template #actions>
                <fr-btn
                    :disabled="!formValid || !isChanged"
                    @click="updateUserDetails">
                  Save
                </fr-btn>
              </template>
            </fr-card>
          </fr-col>
        </fr-row>

        <fr-row>
          <fr-col>
            <fr-card class="text-left" title="Authorization">
              <div class="ma-3 px-4 pb-4">
                <fr-row>
                  <fr-card
                      class="ma-2"
                      v-for="scope in Object.keys(userRolesMap)"
                      :key="scope"
                      variant="tonal"
                      :subtitle="scope"
                  >
                    <fr-chip-group class="px-4 pb-4">
                      <fr-chip
                          v-for="role in userRolesMap[scope]"
                          :key="role.roleId"
                          text="Elevator"
                          variant="outlined"
                      >{{ role.title }}
                      </fr-chip>
                    </fr-chip-group>
                  </fr-card>
                </fr-row>
              </div>
            </fr-card>
          </fr-col>
        </fr-row>
      </fr-col>

      <fr-col cols="2"></fr-col>

    </fr-row>
  </fr-container>
  <!-- A failed load leaves no form, so its alert shows on its own -->
  <fr-container v-else>
    <FadeOutAlert :is-visible="alertVisible" :alert-type="alertType" :message="alertMessage"/>
  </fr-container>
</template>

<script>

import { mapActions, mapState } from "pinia";
import { useUsersStore } from "@/store";
import {
  FrBtn, FrCard, FrChip, FrChipGroup, FrCol, FrContainer, FrForm, FrRow,
} from "@feral-auth/vue-components";
import FadeOutAlert from "@/components/FadeOutAlert.vue";

export default {
  name: 'UserProfile',

  components: {
    FadeOutAlert, FrBtn, FrCard, FrChip, FrChipGroup, FrCol, FrContainer, FrForm, FrRow,
  },

  data() {
    return {
      // The stored user, and the copy the form edits until Save
      savedDetails: null,
      userDetails: null,
      userRoles: [],
      userRolesMap: {},
      rules: {
        firstName: (v) => !!v || 'Field is required',
        lastName: (v) => !!v || 'Field is required',
      },
      // Vuetify's: null until every field has been checked, then true or false
      formValid: null,
    };
  },

  computed: {
    isChanged() {
      return ['firstName', 'lastName']
          .some(field => this.userDetails[field] !== this.savedDetails[field]);
    },

    ...mapState(useUsersStore, [
      'currentUser', 'alertType', 'alertMessage', 'alertVisible',
    ]),
  },

  methods: {
    ...mapActions(useUsersStore, [
      'loadCurrentUser',
      'updateCurrentUser',
    ]),

    async refreshData() {
      await this.loadCurrentUser();
      if (!this.currentUser) {
        return;
      }
      this.userRoles = this.currentUser.roles;
      this.userRolesMap = this.currentUser.rolesByScope;
      this.savedDetails = this.currentUser.details;
      this.userDetails = { ...this.savedDetails };
    },

    // A failed save keeps the change, to correct
    async updateUserDetails() {
      const { firstName, lastName } = this.userDetails;
      if (await this.updateCurrentUser({ firstName, lastName })) {
        await this.refreshData();
      }
    }
  },

  mounted() {
    this.refreshData();
  },
}
</script>
