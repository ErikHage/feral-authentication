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
            <v-data-table
                :headers="headers"
                :items="roles"
                item-key="roleId"
                class="elevation-1"
            >
              <template #item.actions="{ item }">
                <v-icon small @click="deleteRoleById(item.roleId)">mdi-delete</v-icon>
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
    ...mapState(useRoles, ['roles']),
  },

  methods: {
    ...mapActions(useRoles, ['fetchRoles', 'addRole', 'deleteRole']),

    openDialog(role = null) {
      if (role) {
        this.form = { ...role };
      } else {
        this.resetForm();
      }
      this.dialog = true;
    },
    closeDialog() {
      this.dialog = false;
    },
    resetForm() {
      this.form = {
        scope: '',
        title: '',
        description: '',
      };
    },
    async saveRole() {
      if (this.$refs.roleForm.validate()) {
        await this.addRole(this.form);
        await this.fetchRoles();
        this.closeDialog();
      }
    },
    async deleteRoleById(roleId) {
      await this.deleteRole(roleId);
      await this.fetchRoles();
    },
  },

  mounted() {
    this.fetchRoles();
  },
}
</script>

<style scoped>

</style>