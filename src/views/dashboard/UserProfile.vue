<template>
  <v-container v-if="userDetails">
    <h2 class="headline">{{ userDetails.firstName }} {{ userDetails.lastName }}</h2>
    <br/>
    <v-row>

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
                <v-row>
                  <v-text-field v-model="userDetails.firstName" label="First Name"></v-text-field>
                </v-row>
                <v-row>
                  <v-text-field v-model="userDetails.lastName" label="Last Name"></v-text-field>
                </v-row>
                <v-btn @click="updateName">Save</v-btn>
              </v-card-text>
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
                      variant="tonal"
                  >
                    <v-card-subtitle class="text-left pt-2">
                      {{ scope }}
                    </v-card-subtitle>
                    <v-card-text>
                      <v-chip-group>
                        <v-chip
                            v-for="role in userRolesMap[scope]"
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

      <v-col cols="2">

      </v-col>

    </v-row>
  </v-container>
</template>

<script>

import { mapActions, mapState } from "pinia";
import { useAuthenticationStore, useUsersStore } from "@/store";

export default {
  name: 'UserProfile',

  data() {
    return {
      userDetails: null,
      userRoles: [],
      userRolesMap: {},
    };
  },

  computed: {
    ...mapState(useAuthenticationStore, ['actor']),
    ...mapState(useUsersStore, ['selectedUser']),
  },

  methods: {

    ...mapActions(useUsersStore, [
      'fetchUsers',
      'selectUser'
    ]),

    async refreshData() {
      await this.fetchUsers();
      await this.selectUser(this.actor.userId);
      this.userRoles = this.selectedUser.roles;
      this.userRolesMap = this.selectedUser.rolesByScope;
      this.userDetails = this.selectedUser.details;
    },

    async updateName() {
      console.log('update name called', this.userDetails.firstName, this.userDetails.lastName);
      // TODO
    }
  },

  mounted() {
    this.refreshData();
  },
}
</script>
