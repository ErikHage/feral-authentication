<template>
  <v-container v-if="userDetails">
    <h2>User Profile: {{ userDetails.firstName }} {{ userDetails.lastName }}</h2>
    <br/>
    <v-row>
      <v-card>
        <v-card-title>
          Authorization
        </v-card-title>
        <v-card-text>
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
  },

  mounted() {
    this.refreshData();
  },
}
</script>
