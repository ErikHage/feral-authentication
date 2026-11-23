<template>
  <fr-page>
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
          <fr-btn @click="openDialog()">Add</fr-btn>
          <fr-btn @click="refreshData()">Refresh</fr-btn>
        </template>
        <template #item.actions="{ item }">
          <fr-icon-btn icon="mdi-pencil" :label="`Edit ${item.username}`" @click="openDialog(item)"/>
          <fr-icon-btn icon="mdi-delete" :label="`Delete ${item.username}`" @click="openDeleteDialog(item)"/>
        </template>
      </fr-data-table>
    </fr-card>

    <fr-dialog
        v-model="dialog"
        :title="isEditMode ? 'Edit User' : 'Add User'"
        cancel-text="Cancel"
        confirm-text="Save"
        :confirm-disabled="!formValid"
        @cancel="closeDialog"
        @confirm="saveUser"
    >
      <fr-form ref="userForm" v-model="formValid">
        <fr-text-field v-model="form.firstName" label="First Name" :rules="rules.firstName"></fr-text-field>
        <fr-text-field v-model="form.lastName" label="Last Name" :rules="rules.lastName"></fr-text-field>
        <!-- Editing changes only the name: the service updates nothing else -->
        <fr-text-field v-model="form.email" label="Email" :rules="rules.email" :disabled="isEditMode"></fr-text-field>
        <fr-text-field v-model="form.username" label="Username" :rules="rules.username" :disabled="isEditMode"></fr-text-field>
        <fr-text-field
            v-if="!isEditMode"
            v-model="form.password"
            :rules="rules.password"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            counter
            @click:append="showPassword = !showPassword"
        ></fr-text-field>
      </fr-form>
    </fr-dialog>

    <fr-dialog
        v-model="deleteDialog"
        title="Delete User"
        cancel-text="Cancel"
        confirm-text="Delete"
        confirm-color="error"
        @cancel="closeDeleteDialog"
        @confirm="deleteUserById(userToDelete?.userId)"
    >
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
        <span class="text-error font-weight-bold">Are you sure? This cannot be undone!</span>
      </div>
    </fr-dialog>
  </fr-page>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useUsersStore } from "@/store";
import {
  FrBtn, FrCard, FrDataTable, FrDialog, FrForm, FrIconBtn, FrPage, FrTable, FrTextField,
} from "@feral-auth/vue-components";
import LoadErrors from "@/components/LoadErrors.vue";
import { required } from "@/utils/rules";

export default {
  name: "UsersAdmin",

  components: {
    LoadErrors, FrBtn, FrCard, FrDataTable, FrDialog, FrForm, FrIconBtn, FrPage, FrTable,
    FrTextField,
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
</style>