<template>
  <v-container>
    <h2>Users Admin</h2>
    <v-row justify="center">
      <v-col cols="12" sm="8">
        <v-card>
          <v-card-title>
            <span class="headline">Manage Authorization</span>
            <v-spacer></v-spacer>
            <v-btn class="mr-2" color="primary" @click="openDialog()">Add</v-btn>
            <v-btn color="primary" @click="refreshData()">Refresh</v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
                :headers="headers"
                :items="users"
                item-key="userId"
                class="elevation-1"
                :loading="loading"
            >
              <template #item.actions="{ item }">
                <v-icon small @click="openDialog(item)">mdi-pencil</v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Add Role</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="userRolesForm">
            <v-text-field v-model="form.selectedRole" label="First Name" required></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="saveRole">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { useRolesStore, useUsersStore } from "@/store";
import { mapActions, mapState } from "pinia";

export default {
  name: "AuthorizationAdmin",

  data() {
    return {
      dialog: false,
      form: {},
      headers: [
        { title: 'Username', key: 'username' },
        { title: 'Actions', key: 'actions', sortable: false },
      ],
    };
  },

  computed: {
    ...mapState(useUsersStore, ['users', 'loading']),
    ...mapState(useRolesStore, ['roles']),
  },

  methods: {
    ...mapActions(useUsersStore, [
      'fetchUsers',
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
    },
    openDialog(user) {
      if (user) {
        this.form = {};
      } else {
        this.resetForm();
      }
      this.dialog = true;
    },
    closeDialog() {
      this.dialog = false;
    },
    resetForm() {
      this.form = {};
    },
    async addRoleToUser() {
      if (this.$refs.userRolesForm.validate()) {
        await this.addUserRole(this.form);
        this.closeDialog();
        await this.refreshData();
      }
    },
    async removeRoleFromUser(userId) {
      await this.deleteUserRole(userId, roleId);
      await this.refreshData();
    },
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