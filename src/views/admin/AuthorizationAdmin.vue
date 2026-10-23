<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8">
        <v-card>
          <v-card-title>
            <span class="headline">Manage Authorization</span>
          </v-card-title>
          <v-card-text>
            <v-select
                v-model="selectedUserId"
                :items="users"
                item-title="username"
                item-value="userId"
                label="Select User"
                variant="solo"
                @update:model-value="onSelectUserChange"
            ></v-select>
          </v-card-text>
        </v-card>

        <FadeOutAlert :is-visible="alertVisible" :alert-type="alertType" :message="alertMessage"/>

        <v-card class="mt-3" v-if="selectedUser" role="region" aria-labelledby="manage-applications">
          <v-card-title>
            <span id="manage-applications" class="headline">Manage Applications</span>
          </v-card-title>
          <v-card-text>
            <v-row align="center">
              <v-col cols="11">
                <v-select
                    v-model="selectedApplication"
                    :items="applications"
                    item-title="applicationName"
                    item-value="applicationId"
                    label="Select Application To Add"
                    variant="solo"
                    return-object
                ></v-select>
              </v-col>
              <v-col cols="1">
                <v-btn
                    block
                    color="error"
                    @click="addSelectedApplication"
                    :disabled="!selectedApplication || isApplicationAlreadySelected(selectedApplication)"
                    aria-label="Add the application"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-chip-group v-if="selectedApplications">
              <v-chip v-for="application in selectedApplications" :key="application.applicationId"
                      role="button" :aria-label="`Remove ${application.applicationName}`"
                      @click="removeApplicationFromSelected(application.applicationId)">
                {{ application.applicationName }}
              </v-chip>
              <!-- click on them to remove -->
            </v-chip-group>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="cancelUpdatingApplications">Cancel</v-btn>
            <v-btn color="blue darken-1" text @click="saveApplicationUpdates">Save</v-btn>
          </v-card-actions>
        </v-card>

        <v-card class="mt-3" v-if="selectedUser" role="region" aria-labelledby="manage-roles">
          <v-card-title>
            <span id="manage-roles" class="headline">Manage Roles</span>
          </v-card-title>
          <v-card-text>
            <v-row align="center">
              <v-col cols="11">
                <!--            TODO split into scope and title selects -->
                <v-select
                    v-model="selectedRole"
                    :items="roles"
                    :item-title="(item) => `${item.scope}/${item.title}`"
                    item-value="roleId"
                    label="Select Role To Add"
                    variant="solo"
                    return-object
                ></v-select>
              </v-col>
              <v-col cols="1">
                <v-btn
                    block
                    color="error"
                    @click="addSelectedRole"
                    :disabled="!selectedRole || isRoleAlreadySelected(selectedRole)"
                    aria-label="Add the role"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-chip-group v-if="selectedRoles">
              <v-chip v-for="role in selectedRoles" :key="role.roleId"
                      role="button" :aria-label="`Remove ${role.scope}/${role.title}`"
                      @click="removeRoleFromSelected(role.roleId)">
                {{ role.scope }}/{{ role.title }}
              </v-chip>
              <!-- click on them to remove -->
            </v-chip-group>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="cancelUpdatingRoles">Cancel</v-btn>
            <v-btn color="blue darken-1" text @click="saveRoleUpdates">Save</v-btn>
          </v-card-actions>
        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useApplicationsStore, useRolesStore, useUsersStore } from "@/store";
import { mapActions, mapState } from "pinia";
import FadeOutAlert from "@/components/FadeOutAlert.vue";

export default {
  name: "AuthorizationAdmin",
  components: { FadeOutAlert },

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
      'users', 'selectedUser', 'loading', 'alertType', 'alertMessage', 'alertVisible',
    ]),

    ...mapState(useRolesStore, [
      'roles',
    ]),

    ...mapState(useApplicationsStore, [
      'applications',
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