<template>
  <v-container>
    <h2>Users Admin</h2>
    <v-row justify="center">
      <v-col cols="12" sm="8">
        <v-card>
          <v-card-title>
            <span class="headline">Manage Authorization</span>
          </v-card-title>
          <v-card-text>
            <v-select
                v-model="selectedUserId"
                :items="users"
                item-title="username"
                item-value="userId"
                label="Select User"
                variant="solo"
                @update:model-value="onSelectUserChange"
            ></v-select>
          </v-card-text>
        </v-card>

        <v-card class="mt-3" v-if="selectedUser">
          <v-card-title>
            <span class="headline">Manage Roles</span>
          </v-card-title>
          <v-card-text>
            <v-row align="center">
              <v-col cols="11">
                <!--            TODO split into scope and title selects -->
                <v-select
                    v-model="selectedRole"
                    :items="roles"
                    :item-title="(item) => `${item.scope}/${item.title}`"
                    item-value="roleId"
                    label="Select Role To Add"
                    variant="solo"
                    return-object
                ></v-select>
              </v-col>
              <v-col cols="1">
                <v-btn
                    block
                    color="error"
                    @click="addSelectedRole"
                    :disabled="!selectedRole || isRoleAlreadySelected(selectedRole)"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-chip-group v-if="selectedRoles">
              <v-chip v-for="role in selectedRoles" @click="removeRoleFromSelected(role.roleId)">{{ role.scope }}/{{ role.title }}</v-chip>
              <!-- click on them to remove -->
            </v-chip-group>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <!--             <v-btn color="blue darken-1" text @click="cancelUpdatingRoles">Cancel</v-btn>-->
            <!--             <v-btn color="blue darken-1" text @click="saveRoleUpdates">Save</v-btn>-->
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useRolesStore, useUsersStore } from "@/store";
import { mapActions, mapState } from "pinia";

export default {
  name: "AuthorizationAdmin",

  data() {
    return {
      selectedUserId: null,
      selectedRole: null,
      selectedRoles: [],
    };
  },

  computed: {
    ...mapState(useUsersStore, ['users', 'selectedUser', 'loading']),
    ...mapState(useRolesStore, ['roles']),
  },

  methods: {
    ...mapActions(useUsersStore, [
      'fetchUsers',
      'selectUser',
      'clearSelectedUser',
      'fetchUserRoles',
      'setUserRoles',
      'clearUserRoles',
    ]),
    ...mapActions(useRolesStore, [
      'fetchRoles',
    ]),

    refreshData() {
      this.fetchUsers();
      this.fetchRoles();
      this.clearSelectedUser();
    },
    async onSelectUserChange(userId) {
      await this.selectUser(userId);
      this.selectedRoles = this.selectedUser.roles;
    },
    addSelectedRole(role) {
      if (!this.isRoleAlreadySelected(role)) {
        this.selectedRoles.push(this.selectedRole);
      }
    },
    removeRoleFromSelected(roleId) {
      this.selectedRoles = this.selectedRoles.filter(role => role.roleId !== roleId);
    },
    isRoleAlreadySelected(role) {
      return this.selectedRoles.map(role => role.roleId).includes(role.roleId);
    }
    // async setRolesForUser() {
    //   if (this.$refs.userRolesForm.validate()) {
    //     await this.setUserRoles(this.selectedRoles);
    //     await this.refreshData();
    //   }
    // },
    // async clearRolesForUser(userId) {
    //   await this.clearUserRoles(userId);
    //   await this.refreshData();
    // },
  },

  mounted() {
    this.refreshData();
  },
}
</script>

<style scoped>
.red-text {
  color: darkred;
  font-weight: bold;
}
</style>