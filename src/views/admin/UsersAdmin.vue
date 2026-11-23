<template>
  <fr-container>
    <fr-row class="justify-center">
      <fr-col cols="12" sm="8">
        <LoadErrors :messages="[usersLoadError]"/>
        <fr-card flush>
          <fr-data-table
              title="Manage Users"
              :headers="headers"
              :items="users"
              item-value="userId"
              :loading="loading"
          >
            <template #actions>
              <fr-btn color="primary" @click="openDialog()">Add</fr-btn>
              <fr-btn color="primary" @click="refreshData()">Refresh</fr-btn>
            </template>
            <template #item.actions="{ item }">
              <fr-icon :aria-label="`Edit ${item.username}`" @click="openDialog(item)">mdi-pencil</fr-icon>
              <fr-icon :aria-label="`Delete ${item.username}`" @click="openDeleteDialog(item)">mdi-delete</fr-icon>
            </template>
          </fr-data-table>
        </fr-card>
      </fr-col>
    </fr-row>

    <fr-dialog v-model="dialog" :title="isEditMode ? 'Edit User' : 'Add User'">
      <fr-form ref="userForm" v-model="formValid">
        <v-text-field v-model="form.firstName" label="First Name" :rules="rules.firstName"></v-text-field>
        <v-text-field v-model="form.lastName" label="Last Name" :rules="rules.lastName"></v-text-field>
        <!-- Editing changes only the name: the service updates nothing else -->
        <v-text-field v-model="form.email" label="Email" :rules="rules.email" :disabled="isEditMode"></v-text-field>
        <v-text-field v-model="form.username" label="Username" :rules="rules.username" :disabled="isEditMode"></v-text-field>
        <v-text-field
            v-if="!isEditMode"
            v-model="form.password"
            :rules="rules.password"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            counter
            @click:append="showPassword = !showPassword"
        ></v-text-field>
      </fr-form>
      <template #actions>
        <fr-btn @click="closeDialog">Cancel</fr-btn>
        <fr-btn :disabled="!formValid" @click="saveUser">Save</fr-btn>
      </template>
    </fr-dialog>

    <fr-dialog v-model="deleteDialog" title="Delete User">
      <div class="text-center">
        <fr-table>
          <tbody>
          <tr>
            <th>Username</th>
            <td>{{ this.userToDelete?.username }}</td>
          </tr>
          </tbody>
        </fr-table>
        <br/>
        <span class="red-text">Are you sure? This cannot be undone!</span>
      </div>
      <template #actions>
        <fr-btn @click="closeDeleteDialog">Cancel</fr-btn>
        <fr-btn color="error" @click="deleteUserById(this.userToDelete?.userId)">Delete</fr-btn>
      </template>
    </fr-dialog>
  </fr-container>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useUsersStore } from "@/store";
import {
  FrBtn, FrCard, FrCol, FrContainer, FrDataTable, FrDialog, FrForm, FrIcon, FrRow, FrTable,
} from "@feral-auth/vue-components";
import LoadErrors from "@/components/LoadErrors.vue";
import { required } from "@/utils/rules";

export default {
  name: "UsersAdmin",

  components: {
    LoadErrors, FrBtn, FrCard, FrCol, FrContainer, FrDataTable, FrDialog, FrForm, FrIcon, FrRow, FrTable,
  },

  data() {
    return {
      dialog: false,
      deleteDialog: false,
      userToDelete: null,
      showPassword: false,
      isEditMode: false,
      // Vuetify's: null until every field has been checked, then true or false
      formValid: null,
      rules: {
        firstName: [required('First Name')],
        lastName: [required('Last Name')],
        email: [required('Email')],
        username: [required('Username')],
        password: [required('Password')],
      },
      form: {
        userId: '',
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        email: '',
      },
      headers: [
        { title: 'First Name', key: 'firstName' },
        { title: 'Last Name', key: 'lastName' },
        { title: 'Username', key: 'username' },
        { title: 'Email', key: 'email' },
        { title: 'Last Login', key: 'lastLogin' },
        { title: 'Suspended', key: 'isSuspended' },
        { title: 'Actions', key: 'actions', sortable: false },
      ],
    };
  },

  computed: {
    ...mapState(useUsersStore, [
        'users', 'loading', 'usersLoadError',
    ]),
  },

  methods: {
    ...mapActions(useUsersStore, [
      'fetchUsers',
      'addUser',
      'updateUser',
      'deleteUser'
    ]),

    refreshData() {
      this.fetchUsers();
    },
    async openDialog(user) {
      if (user) {
        this.form = {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          password: '',
          email: user.email,
        };
        this.isEditMode = true;
      } else {
        this.resetForm();
        this.isEditMode = false;
      }
      this.dialog = true;
      // The dialog keeps its form between openings, so clear the last one's errors
      await this.$nextTick();
      this.$refs.userForm.resetValidation();
    },
    closeDialog() {
      this.dialog = false;
    },
    openDeleteDialog(user) {
      this.deleteDialog = true;
      this.userToDelete = user;
    },
    closeDeleteDialog() {
      this.deleteDialog = false;
      this.userToDelete = null;
    },
    resetForm() {
      this.form = {
        userId: '',
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        email: '',
      };
    },
    async saveUser() {
      const { valid } = await this.$refs.userForm.validate();
      if (valid) {
        if (this.isEditMode) {
          await this.updateUser(this.form);
        } else {
          await this.addUser(this.form);
        }
        this.closeDialog();
        await this.fetchUsers();
      }
    },
    async deleteUserById(userId) {
      await this.deleteUser(userId);
      this.closeDeleteDialog();
      await this.fetchUsers();
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