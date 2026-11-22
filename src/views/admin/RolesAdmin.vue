<template>
  <fr-container>
    <fr-row class="justify-center">
      <fr-col cols="12" sm="8">
        <LoadErrors :messages="[rolesLoadError]"/>
        <fr-card title="Manage Roles">
          <div class="px-4 pb-4">
            <div class="mb-3">
              <fr-btn class="mr-2" color="primary" @click="openDialog()">Add</fr-btn>
              <fr-btn color="primary" @click="fetchRoles()">Refresh</fr-btn>
            </div>
            <fr-data-table
                :headers="headers"
                :items="roles"
                item-value="roleId"
                class="elevation-1"
            >
              <template #item.actions="{ item }">
                <fr-icon :aria-label="`Delete ${item.scope}/${item.title}`" @click="openDeleteDialog(item)">mdi-delete</fr-icon>
              </template>
            </fr-data-table>
          </div>
        </fr-card>
      </fr-col>
    </fr-row>

    <fr-dialog v-model="dialog" title="Add Role">
      <fr-form ref="roleForm" v-model="formValid">
        <v-text-field v-model="form.scope" label="Scope" :rules="rules.scope"></v-text-field>
        <v-text-field v-model="form.title" label="Title" :rules="rules.title"></v-text-field>
        <v-textarea v-model="form.description" label="Description" :rules="rules.description"></v-textarea>
      </fr-form>
      <template #actions>
        <fr-btn color="blue darken-1" text @click="closeDialog">Cancel</fr-btn>
        <fr-btn color="blue darken-1" text :disabled="!formValid" @click="saveRole">Save</fr-btn>
      </template>
    </fr-dialog>

    <fr-dialog v-model="deleteDialog" title="Delete Role">
      <div class="text-center">
        <fr-table>
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
        </fr-table>
        <br/>
        <span class="red-text">Are you sure? This cannot be undone!</span>
      </div>
      <template #actions>
        <fr-btn color="blue darken-1" text @click="closeDeleteDialog">Cancel</fr-btn>
        <fr-btn color="blue darken-1" text @click="deleteRoleById(this.roleToDelete?.roleId)">Delete</fr-btn>
      </template>
    </fr-dialog>
  </fr-container>
</template>

<script>
import { useRolesStore } from "@/store";
import { mapActions, mapState } from "pinia";
import {
  FrBtn, FrCard, FrCol, FrContainer, FrDataTable, FrDialog, FrForm, FrIcon, FrRow, FrTable,
} from "@feral-auth/vue-components";
import LoadErrors from "@/components/LoadErrors.vue";
import { required } from "@/utils/rules";

export default {
  name: "RolesAdmin",
  components: {
    LoadErrors, FrBtn, FrCard, FrCol, FrContainer, FrDataTable, FrDialog, FrForm, FrIcon, FrRow, FrTable,
  },

  data() {
    return {
      dialog: false,
      deleteDialog: false,
      roleToDelete: null,
      // Vuetify's: null until every field has been checked, then true or false
      formValid: null,
      rules: {
        scope: [required('Scope')],
        title: [required('Title')],
        description: [required('Description')],
      },
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
    ...mapState(useRolesStore, ['roles', 'rolesLoadError']),
  },

  methods: {
    ...mapActions(useRolesStore, ['fetchRoles', 'addRole', 'deleteRole']),

    async refreshData() {
      await this.fetchRoles();
    },

    async openDialog() {
      this.resetForm();
      this.dialog = true;
      // The dialog keeps its form between openings, so clear the last one's errors
      await this.$nextTick();
      this.$refs.roleForm.resetValidation();
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