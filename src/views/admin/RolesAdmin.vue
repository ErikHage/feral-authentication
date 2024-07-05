<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8">
        <FadeOutAlert class="my-2" :is-visible="alertVisible" :alert-type="alertType" :message="alertMessage"/>
        <v-card>
          <v-card-title>
            <span class="headline">Manage Roles</span>
            <v-spacer></v-spacer>
            <v-btn class="mr-2" color="primary" @click="openDialog()">Add</v-btn>
            <v-btn color="primary" @click="fetchRoles()">Refresh</v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
                :headers="headers"
                :items="roles"
                item-key="roleId"
                class="elevation-1"
            >
              <template #item.actions="{ item }">
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
          <span class="headline">Add Role</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="roleForm">
            <v-text-field v-model="form.scope" label="Scope" required></v-text-field>
            <v-text-field v-model="form.title" label="Title" required></v-text-field>
            <v-textarea v-model="form.description" label="Description" required></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="saveRole">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Delete Role</span>
        </v-card-title>
        <v-card-text class="text-center">
          <v-table>
            <tbody>
            <tr>
              <th>Scope</th>
              <td>{{this.roleToDelete?.scope}}</td>
            </tr>
            <tr>
              <th>Title</th>
              <td>{{this.roleToDelete?.title}}</td>
            </tr>
            </tbody>
          </v-table>
          <br/>
          <span class="red-text">Are you sure? This cannot be undone!</span>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDeleteDialog">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="deleteRoleById(this.roleToDelete?.roleId)">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { useRolesStore } from "@/store";
import { mapActions, mapState } from "pinia";
import FadeOutAlert from "@/components/FadeOutAlert.vue";

export default {
  name: "RolesAdmin",
  components: { FadeOutAlert },

  data() {
    return {
      dialog: false,
      deleteDialog: false,
      roleToDelete: null,
      form: {
        scope: '',
        title: '',
        description: '',
      },
      headers: [
        { title: 'Scope', key: 'scope' },
        { title: 'Title', key: 'title' },
        { title: 'Description', key: 'description' },
        { title: 'Actions', key: 'actions', sortable: false },
      ],
    };
  },

  computed: {
    ...mapState(useRolesStore, ['roles', 'alertType', 'alertMessage', 'alertVisible']),
  },

  methods: {
    ...mapActions(useRolesStore, ['fetchRoles', 'addRole', 'deleteRole']),

    async refreshData() {
      await this.fetchRoles();
    },

    openDialog() {
      this.resetForm();
      this.dialog = true;
    },
    closeDialog() {
      this.dialog = false;
    },
    openDeleteDialog(role) {
      this.deleteDialog = true;
      this.roleToDelete = role;
    },
    closeDeleteDialog() {
      this.deleteDialog = false;
      this.roleToDelete = null;
    },
    resetForm() {
      this.form = {
        scope: '',
        title: '',
        description: '',
      };
    },
    async saveRole() {
      const { valid } = await this.$refs.roleForm.validate();
      if (valid) {
        await this.addRole(this.form);
        await this.refreshData();
        this.closeDialog();
      }
    },
    async deleteRoleById(roleId) {
      await this.deleteRole(roleId);
      this.deleteDialog = false;
      this.roleToDelete = null;
      await this.refreshData();
    },
  },

  mounted() {
    this.fetchRoles();
  },
}
</script>

<style scoped>
  .red-text {
    color: darkred;
    font-weight: bold;
  }
</style>