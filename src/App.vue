<template>
  <!-- On the pages that need someone logged in, the app runs in FrAppShell:
       the side drawer, the toolbar with the command palette, the theme menu
       and the user's menu, and the app's toasts -->
  <fr-app-shell
      v-if="isLoggedInPage"
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

  <!-- Elsewhere (the login page, a page not found), only the app's name, and
       the toasts -->
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
import { nextTick } from "vue";
import { mapActions, mapState } from "pinia";
import { FrAppShell, FrAppUserMenu, FrBreadcrumbs, FrListItem, FrSnackbarQueue } from "@feral-auth/vue-components";
import { useApplicationsStore, useAuthenticationStore } from "@/store";
import { notify } from "@/store/notifications";
import { activeViewFor, crumbsFor, sections } from "@/utils/navigation";

export default {
  name: 'App',

  components: { FrAppShell, FrAppUserMenu, FrBreadcrumbs, FrListItem, FrSnackbarQueue },

  data: () => ({
    sections,
  }),

  computed: {
    // The frame follows the route, not the store: the guard lets only
    // someone logged in reach these pages. Switching frames remounts the
    // page, so following the store would remount a dashboard page as it logs
    // out (loading it again with no token), and the login page as it logs in
    isLoggedInPage() {
      return this.$route.matched.some(record => record.meta.requiresAuthenticated);
    },

    ...mapState(useAuthenticationStore, [
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
      const warning = await this.logout();
      await this.$router.push('/login');
      if (warning) {
        // Once the logged-out frame has replaced FrAppShell, whose toasts go with it
        await nextTick();
        notify('warning', warning);
      }
    },
  },
}
</script>
