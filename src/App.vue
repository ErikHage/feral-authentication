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
import { FrAppShell, FrAppUserMenu, FrListItem, FrSnackbarQueue } from "@feral-auth/vue-components";
import { useAuthenticationStore } from "@/store";
import { activeViewFor, sections } from "@/utils/navigation";

export default {
  name: 'App',

  components: { FrAppShell, FrAppUserMenu, FrListItem, FrSnackbarQueue },

  data: () => ({
    sections,
  }),

  computed: {
    ...mapState(useAuthenticationStore, [
      'showAppBar',
      'actor',
    ]),

    activeView() {
      return activeViewFor(this.$route.path);
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
