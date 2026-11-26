<template>
  <!-- Logged in, the app runs in FrAppShell: the side drawer, the toolbar
       with the command palette, the theme menu and the user's menu, and the
       app's toasts -->
  <fr-app-shell
      v-if="showAppBar === true"
      title="Feral"
      subtitle="Authentication"
      storage-prefix="feral-authentication"
      :sections="sections"
      :active-view="activeView"
  >
    <!-- The page's place, as the component playground shows it: its
         section, then the page, then an application on its details; the
         last crumb alone on a small screen -->
    <template #toolbar-start>
      <fr-breadcrumbs
          :items="crumbs"
          density="compact"
          class="pa-0 text-no-wrap overflow-hidden"
          style="min-width: 0"
      />
    </template>
    <template #toolbar>
      <fr-app-user-menu :name="username">
        <fr-list-item title="Logout" prepend-icon="mdi-logout" @click="logoutUser"/>
      </fr-app-user-menu>
    </template>
    <router-view/>
  </fr-app-shell>

  <!-- Logged out, only the app's name, and the toasts -->
  <v-app v-else>
    <v-app-bar>
      <v-toolbar-title>Feral Authentication</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <router-view/>
    </v-main>
    <fr-snackbar-queue/>
  </v-app>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { FrAppShell, FrAppUserMenu, FrBreadcrumbs, FrListItem, FrSnackbarQueue } from "@feral-auth/vue-components";
import { useApplicationsStore, useAuthenticationStore } from "@/store";
import { activeViewFor, crumbsFor, sections } from "@/utils/navigation";

export default {
  name: 'App',

  components: { FrAppShell, FrAppUserMenu, FrBreadcrumbs, FrListItem, FrSnackbarQueue },

  data: () => ({
    sections,
  }),

  computed: {
    ...mapState(useAuthenticationStore, [
      'showAppBar',
      'actor',
    ]),

    ...mapState(useApplicationsStore, [
      'selectedApplication',
    ]),

    activeView() {
      return activeViewFor(this.$route.path);
    },

    // Below the shell's small-screen breakpoint, the toolbar has room for
    // the last crumb alone
    crumbs() {
      return crumbsFor(this.$route.path, this.selectedApplication?.applicationDetails, this.$vuetify.display.smAndDown);
    },

    username() {
      return this.actor?.username ?? '';
    },
  },

  methods: {
    ...mapActions(useAuthenticationStore, [
      'logout',
    ]),

    async logoutUser() {
      await this.logout();
      this.$router.push('/login');
    },
  },
}
</script>
