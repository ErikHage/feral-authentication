<template>
  <v-container v-if="userDetails">
    <h2 class="headline">{{ savedDetails.firstName }} {{ savedDetails.lastName }}</h2>
    <v-row class="mt-3">
      <v-col cols="2">
      </v-col>

      <v-col cols="8">
        <v-row>
          <v-col>
            <v-card>
              <v-card-title class="text-left">
                Personal Details
              </v-card-title>
              <v-card-text class="ma-3">
                <v-form v-model="formValid">
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
                </v-form>

                <FadeOutAlert :is-visible="alertVisible" :alert-type="alertType" :message="alertMessage"/>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    :disabled="!formValid || !isChanged"
                    @click="updateUserDetails">
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-card>
              <v-card-title class="text-left">
                Authorization
              </v-card-title>
              <v-card-text class="ma-3">
                <v-row>
                  <v-card
                      class="ma-2"
                      v-for="scope in Object.keys(userRolesMap)"
                      :key="scope"
                      variant="tonal"
                  >
                    <v-card-subtitle class="text-left pt-2">
                      {{ scope }}
                    </v-card-subtitle>
                    <v-card-text>
                      <v-chip-group>
                        <v-chip
                            v-for="role in userRolesMap[scope]"
                            :key="role.roleId"
                            text="Elevator"
                            variant="outlined"
                        >{{ role.title }}
                        </v-chip>
                      </v-chip-group>
                    </v-card-text>
                  </v-card>
                </v-row>
              </v-card-text>
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
import { useAuthenticationStore, useUsersStore } from "@/store";
import FadeOutAlert from "@/components/FadeOutAlert.vue";

export default {
  name: 'UserProfile',

  components: { FadeOutAlert },

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

    ...mapState(useAuthenticationStore, [
      'actor',
    ]),

    ...mapState(useUsersStore, [
      'selectedUser', 'alertType', 'alertMessage', 'alertVisible',
    ]),
  },

  methods: {
    ...mapActions(useUsersStore, [
      'fetchUsers',
      'selectUser',
      'updateUser',
      'setAlertMessage',
    ]),

    async refreshData() {
      await this.fetchUsers();
      await this.selectUser(this.actor.userId);
      this.userRoles = this.selectedUser.roles;
      this.userRolesMap = this.selectedUser.rolesByScope;
      this.savedDetails = this.selectedUser.details;
      this.userDetails = { ...this.savedDetails };
    },

    async updateUserDetails() {
      console.log('update name called', this.userDetails.firstName, this.userDetails.lastName);
      await this.updateUser(this.userDetails)
      await this.refreshData();
    }
  },

  mounted() {
    this.refreshData();
  },
}
</script>
