<template>
  <v-container>
    <h2>Roles Admin</h2>
    <v-row justify="center">
      <v-col cols="12" sm="8">
        <v-card>
          <v-card-title>
            <span class="headline">Manage Roles</span>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="openDialog()">Add Role</v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table :headers="headers" :items="roles" item-key="id">
              <template #item.actions="{ item }">
                <v-icon small @click="openDialog(item)">mdi-pencil</v-icon>
                <v-icon small @click="deleteRole(item.id)">mdi-delete</v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ isEditMode ? 'Edit Role' : 'Add Role' }}</span>
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
  </v-container>
</template>

<script>
import { useRoles } from "@/store";
import { mapActions, mapState } from "pinia";

export default {
  name: "RolesAdmin",

  data() {
    return {
      dialog: false,
      isEditMode: false,
      form: {
        id: null,
        scope: '',
        title: '',
        description: '',
      },
      headers: [
        { text: 'Scope', value: 'scope' },
        { text: 'Title', value: 'title' },
        { text: 'Description', value: 'description' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },

  computed: {
    ...mapState(useRoles, ['roles']),
  },

  methods: {
    ...mapActions(useRoles, ['fetchRoles', 'addRole', 'updateRole', 'deleteRole']),

    openDialog(role = null) {
      if (role) {
        this.form = { ...role };
        this.isEditMode = true;
      } else {
        this.resetForm();
        this.isEditMode = false;
      }
      this.dialog = true;
    },
    closeDialog() {
      this.dialog = false;
    },
    resetForm() {
      this.form = {
        id: null,
        scope: '',
        title: '',
        description: '',
      };
    },
    saveRole() {
      if (this.$refs.roleForm.validate()) {
        if (this.isEditMode) {
          const index = this.roles.findIndex((role) => role.id === this.form.id);
          if (index !== -1) {
            this.roles.splice(index, 1, { ...this.form });
          }
        } else {
          this.form.id = Date.now(); // Generate a simple unique id
          this.roles.push({ ...this.form });
        }
        this.closeDialog();
      }
    },
    deleteRole(id) {
      this.roles = this.roles.filter((role) => role.id !== id);
    },
  },

  mounted() {
    this.fetchRoles();
  },
}
</script>

<style scoped>

</style>