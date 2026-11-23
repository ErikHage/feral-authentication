<template>
  <fr-page v-if="userDetails" :title="`${savedDetails.firstName} ${savedDetails.lastName}`">
    <fr-row>
      <fr-col cols="12" md="6">
        <fr-card title="Personal Details">
          <fr-form v-model="formValid">
            <fr-text-field
                :rules="[rules.firstName]"
                v-model="userDetails.firstName"
                label="First Name"
            ></fr-text-field>
            <fr-text-field
                :rules="[rules.lastName]"
                v-model="userDetails.lastName"
                label="Last Name"
            ></fr-text-field>
            <fr-text-field
                disabled
                v-model="userDetails.username"
                label="Username"
            ></fr-text-field>
            <fr-text-field
                disabled
                v-model="userDetails.email"
                label="Email"
            ></fr-text-field>
            <fr-text-field
                disabled
                v-model="userDetails.lastLogin"
                label="Last Login"
            ></fr-text-field>
            <fr-text-field
                disabled
                v-model="userDetails.isSuspended"
                label="Suspended"
            ></fr-text-field>
          </fr-form>
          <template #actions>
            <fr-btn
                :disabled="!formValid || !isChanged"
                @click="updateUserDetails">
              Save
            </fr-btn>
          </template>
        </fr-card>
      </fr-col>

      <fr-col cols="12" md="6">
        <fr-card title="Authorization">
          <fr-row>
            <fr-card
                class="ma-2"
                v-for="scope in Object.keys(userRolesMap)"
                :key="scope"
                variant="tonal"
                :subtitle="scope"
            >
              <fr-chip-group>
                <fr-chip
                    v-for="role in userRolesMap[scope]"
                    :key="role.roleId"
                    variant="outlined"
                >{{ role.title }}
                </fr-chip>
              </fr-chip-group>
            </fr-card>
          </fr-row>
        </fr-card>
      </fr-col>
    </fr-row>
  </fr-page>
  <!-- A failed load leaves no form, so its alert shows on its own -->
  <fr-page v-else>
    <LoadErrors :messages="[currentUserLoadError]"/>
  </fr-page>
</template>

<script>

import { mapActions, mapState } from "pinia";
import { useUsersStore } from "@/store";
import {
  FrBtn, FrCard, FrChip, FrChipGroup, FrCol, FrForm, FrPage, FrRow, FrTextField,
} from "@feral-auth/vue-components";
import LoadErrors from "@/components/LoadErrors.vue";

export default {
  name: 'UserProfile',

  components: {
    LoadErrors, FrBtn, FrCard, FrChip, FrChipGroup, FrCol, FrForm, FrPage, FrRow, FrTextField,
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
      'currentUser', 'currentUserLoadError',
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
