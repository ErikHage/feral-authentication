<template>
  <fr-container>
    <fr-row class="justify-center">
      <fr-col cols="12" sm="8">
        <fr-card title="Manage Authorization">
          <fr-select
              v-model="selectedUserId"
              :items="users"
              item-title="username"
              item-value="userId"
              label="Select User"
              @update:model-value="onSelectUserChange"
          ></fr-select>
        </fr-card>

        <LoadErrors :messages="[usersLoadError, selectedUserLoadError, rolesLoadError, applicationsLoadError]"/>

        <fr-card class="mt-3" v-if="selectedUser" role="region" aria-label="Manage Applications" title="Manage Applications">
          <fr-row class="align-center">
            <fr-col cols="11">
              <fr-select
                  v-model="selectedApplication"
                  :items="applications"
                  item-title="applicationName"
                  item-value="applicationId"
                  label="Select Application To Add"
                  return-object
              ></fr-select>
            </fr-col>
            <fr-col cols="1">
              <fr-btn
                  block
                  color="error"
                  @click="addSelectedApplication"
                  :disabled="!selectedApplication || isApplicationAlreadySelected(selectedApplication)"
                  aria-label="Add the application"
              >
                <fr-icon>mdi-plus</fr-icon>
              </fr-btn>
            </fr-col>
          </fr-row>
          <fr-chip-group v-if="selectedApplications">
            <fr-chip v-for="application in selectedApplications" :key="application.applicationId"
                     role="button" :aria-label="`Remove ${application.applicationName}`"
                     @click="removeApplicationFromSelected(application.applicationId)">
              {{ application.applicationName }}
            </fr-chip>
            <!-- click on them to remove -->
          </fr-chip-group>
          <template #actions>
            <fr-btn @click="cancelUpdatingApplications">Cancel</fr-btn>
            <fr-btn @click="saveApplicationUpdates">Save</fr-btn>
          </template>
        </fr-card>

        <fr-card class="mt-3" v-if="selectedUser" role="region" aria-label="Manage Roles" title="Manage Roles">
          <fr-row class="align-center">
            <fr-col cols="11">
              <!--            TODO split into scope and title selects -->
              <fr-select
                  v-model="selectedRole"
                  :items="roles"
                  :item-title="(item) => `${item.scope}/${item.title}`"
                  item-value="roleId"
                  label="Select Role To Add"
                  return-object
              ></fr-select>
            </fr-col>
            <fr-col cols="1">
              <fr-btn
                  block
                  color="error"
                  @click="addSelectedRole"
                  :disabled="!selectedRole || isRoleAlreadySelected(selectedRole)"
                  aria-label="Add the role"
              >
                <fr-icon>mdi-plus</fr-icon>
              </fr-btn>
            </fr-col>
          </fr-row>
          <fr-chip-group v-if="selectedRoles">
            <fr-chip v-for="role in selectedRoles" :key="role.roleId"
                     role="button" :aria-label="`Remove ${role.scope}/${role.title}`"
                     @click="removeRoleFromSelected(role.roleId)">
              {{ role.scope }}/{{ role.title }}
            </fr-chip>
            <!-- click on them to remove -->
          </fr-chip-group>
          <template #actions>
            <fr-btn @click="cancelUpdatingRoles">Cancel</fr-btn>
            <fr-btn @click="saveRoleUpdates">Save</fr-btn>
          </template>
        </fr-card>

      </fr-col>
    </fr-row>
  </fr-container>
</template>

<script>
import { useApplicationsStore, useRolesStore, useUsersStore } from "@/store";
import { mapActions, mapState } from "pinia";
import {
  FrBtn, FrCard, FrChip, FrChipGroup, FrCol, FrContainer, FrIcon, FrRow, FrSelect,
} from "@feral-auth/vue-components";
import LoadErrors from "@/components/LoadErrors.vue";

export default {
  name: "AuthorizationAdmin",
  components: {
    LoadErrors, FrBtn, FrCard, FrChip, FrChipGroup, FrCol, FrContainer, FrIcon, FrRow, FrSelect,
  },

  data() {
    return {
      selectedUserId: null,

      selectedRole: null,
      selectedRoles: [],

      selectedApplication: null,
      selectedApplications: [],
    };
  },

  computed: {
    ...mapState(useUsersStore, [
      'users', 'selectedUser', 'loading', 'usersLoadError', 'selectedUserLoadError',
    ]),

    ...mapState(useRolesStore, [
      'roles', 'rolesLoadError',
    ]),

    ...mapState(useApplicationsStore, [
      'applications', 'applicationsLoadError',
    ]),
  },

  methods: {
    ...mapActions(useUsersStore, [
      'fetchUsers',
      'selectUser',
      'clearSelectedUser',
      'setUserRoles',
      'clearUserRoles',
      'setUserApplications',
      'clearUserApplications',
    ]),

    ...mapActions(useRolesStore, [
      'fetchRoles',
    ]),

    ...mapActions(useApplicationsStore, [
      'fetchApplications',
    ]),

    async refreshData() {
      this.clearSelectedUser();
      await Promise.all([
        this.fetchUsers(),
        this.fetchRoles(),
        this.fetchApplications(),
      ]);
    },

    async onSelectUserChange(userId) {
      await this.selectUser(userId);
      // A user that fails to load stays unselected, and the store says why
      if (this.selectedUser) {
        this.resetRoles();
        this.resetApplications();
      }
    },

    // Each card edits a copy of the user's list, until its Save or Cancel
    resetRoles() {
      this.selectedRole = null;
      this.selectedRoles = [...this.selectedUser.roles];
    },

    resetApplications() {
      this.selectedApplication = null;
      this.selectedApplications = [...this.selectedUser.applications];
    },

    // After a card saves: reloads the user, so the card shows what was saved,
    // and resets only that card. The other card keeps its changes
    async reloadUser(userId, resetCard) {
      // Unless another user was chosen while it saved
      if (this.selectedUserId !== userId) {
        return;
      }
      await this.selectUser(userId);
      // Or while it reloaded (the store drops this reload), or the reload failed
      if (this.selectedUserId === userId && this.selectedUser) {
        resetCard();
      }
    },

    // ROLE METHODS
    addSelectedRole() {
      if (!this.isRoleAlreadySelected(this.selectedRole)) {
        this.selectedRoles.push(this.selectedRole);
      }
      this.selectedRole = null;
    },

    removeRoleFromSelected(roleId) {
      this.selectedRoles = this.selectedRoles.filter(role => role.roleId !== roleId);
    },

    isRoleAlreadySelected(role) {
      return this.selectedRoles.map(role => role.roleId).includes(role.roleId);
    },

    cancelUpdatingRoles() {
      this.resetRoles();
    },

    // A failed save keeps the card's changes, and the store says why
    async saveRoleUpdates() {
      const userId = this.selectedUserId;
      const saved = this.selectedRoles.length === 0
          ? await this.clearUserRoles(userId)
          : await this.setUserRoles(userId, this.selectedRoles.map(role => role.roleId));
      if (saved) {
        await this.reloadUser(userId, this.resetRoles);
      }
    },

    // APPLICATION METHODS
    addSelectedApplication() {
      if (!this.isApplicationAlreadySelected(this.selectedApplication)) {
        this.selectedApplications.push(this.selectedApplication);
      }
      this.selectedApplication = null;
    },

    removeApplicationFromSelected(applicationId) {
      this.selectedApplications = this.selectedApplications.filter(
          application => application.applicationId !== applicationId);
    },

    isApplicationAlreadySelected(application) {
      return this.selectedApplications.map(application => application.applicationId)
          .includes(application.applicationId);
    },

    cancelUpdatingApplications() {
      this.resetApplications();
    },

    async saveApplicationUpdates() {
      const userId = this.selectedUserId;
      const saved = this.selectedApplications.length === 0
          ? await this.clearUserApplications(userId)
          : await this.setUserApplications(userId,
              this.selectedApplications.map(application => application.applicationId));
      if (saved) {
        await this.reloadUser(userId, this.resetApplications);
      }
    },
  },

  mounted() {
    this.refreshData();
  },
}
</script>

<style scoped>

</style>