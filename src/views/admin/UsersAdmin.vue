<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8">
        <FadeOutAlert class="my-2" :is-visible="alertVisible" :alert-type="alertType" :message="alertMessage"/>
        <v-card>
          <v-card-title>
            <span class="headline">Manage Users</span>
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
                <v-icon small @click="openDeleteDialog(item)">mdi-delete</v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ isEditMode ? 'Edit User' : 'Add User' }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="userForm" v-model="formValid">
            <v-text-field v-model="form.firstName" label="First Name" :rules="rules.firstName"></v-text-field>
            <v-text-field v-model="form.lastName" label="Last Name" :rules="rules.lastName"></v-text-field>
            <v-text-field v-model="form.email" label="Email" :rules="rules.email"></v-text-field>
            <v-text-field v-model="form.username" label="Username" :rules="rules.username"></v-text-field>
            <!-- Editing a user leaves their password as it is -->
            <v-text-field
                v-model="form.password"
                :rules="isEditMode ? [] : rules.password"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                label="Password"
                counter
                @click:append="showPassword = !showPassword"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">Cancel</v-btn>
          <v-btn color="blue darken-1" text :disabled="!formValid" @click="saveUser">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Delete User</span>
        </v-card-title>
        <v-card-text class="text-center">
          <v-table>
            <tbody>
            <tr>
              <th>Username</th>
              <td>{{ this.userToDelete?.username }}</td>
            </tr>
            </tbody>
          </v-table>
          <br/>
          <span class="red-text">Are you sure? This cannot be undone!</span>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDeleteDialog">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="deleteUserById(this.userToDelete?.userId)">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useUsersStore } from "@/store";
import FadeOutAlert from "@/components/FadeOutAlert.vue";
import { required } from "@/utils/rules";

export default {
  name: "UsersAdmin",

  components: { FadeOutAlert },

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
        'users', 'loading', 'alertType', 'alertMessage', 'alertVisible',
    ]),
  },

  methods: {
    ...mapActions(useUsersStore, [
      'fetchUsers',
      'addUser',
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
        await this.addUser(this.form);
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