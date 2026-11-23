<template>
  <fr-page>
    <LoadErrors :messages="[rolesLoadError]"/>
    <fr-card flush>
      <fr-data-table
          title="Manage Roles"
          :headers="headers"
          :items="roles"
          item-value="roleId"
      >
        <template #actions>
          <fr-btn @click="openDialog()">Add</fr-btn>
          <fr-btn @click="fetchRoles()">Refresh</fr-btn>
        </template>
        <template #item.actions="{ item }">
          <fr-icon-btn icon="mdi-delete" :label="`Delete ${item.scope}/${item.title}`" @click="openDeleteDialog(item)"/>
        </template>
      </fr-data-table>
    </fr-card>

    <fr-dialog
        v-model="dialog"
        title="Add Role"
        cancel-text="Cancel"
        confirm-text="Save"
        :confirm-disabled="!formValid"
        @cancel="closeDialog"
        @confirm="saveRole"
    >
      <fr-form ref="roleForm" v-model="formValid">
        <fr-text-field v-model="form.scope" label="Scope" :rules="rules.scope"></fr-text-field>
        <fr-text-field v-model="form.title" label="Title" :rules="rules.title"></fr-text-field>
        <fr-textarea v-model="form.description" label="Description" :rules="rules.description"></fr-textarea>
      </fr-form>
    </fr-dialog>

    <fr-dialog
        v-model="deleteDialog"
        title="Delete Role"
        cancel-text="Cancel"
        confirm-text="Delete"
        confirm-color="error"
        @cancel="closeDeleteDialog"
        @confirm="deleteRoleById(roleToDelete?.roleId)"
    >
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
        <span class="text-error font-weight-bold">Are you sure? This cannot be undone!</span>
      </div>
    </fr-dialog>
  </fr-page>
</template>

<script>
import { useRolesStore } from "@/store";
import { mapActions, mapState } from "pinia";
import {
  FrBtn, FrCard, FrDataTable, FrDialog, FrForm, FrIconBtn, FrPage, FrTable, FrTextField,
  FrTextarea,
} from "@feral-auth/vue-components";
import LoadErrors from "@/components/LoadErrors.vue";
import { required } from "@/utils/rules";

export default {
  name: "RolesAdmin",
  components: {
    LoadErrors, FrBtn, FrCard, FrDataTable, FrDialog, FrForm, FrIconBtn, FrPage, FrTable,
    FrTextField, FrTextarea,
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
</style>