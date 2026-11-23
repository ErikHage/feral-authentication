<template>
  <!-- No Fr* navigation drawer yet. permanent and temporary are set outright:
       Vuetify's own guess at mobile starts below lg, not md. Named, since a
       table's pagination is a navigation landmark too -->
  <v-navigation-drawer
      v-if="showAppBar === true"
      aria-label="Main menu"
      :model-value="isOpen"
      :permanent="!isPhone"
      :temporary="isPhone"
      :rail="isRailShown"
      @update:model-value="updateOpen"
  >
    <fr-list nav density="compact">
      <template v-for="(group, i) in groups" :key="group.heading">
        <!-- a rail has no room for headings: a divider stands between its groups -->
        <fr-divider v-if="isRailShown && i > 0"/>
        <fr-list-header v-if="!isRailShown" :title="group.heading"/>

        <fr-tooltip
            v-for="page in group.pages"
            :key="page.path"
            :text="page.title"
            :disabled="!isRailShown"
            location="end"
        >
          <template #activator="{ props }">
            <fr-list-item
                v-bind="props"
                :to="page.path"
                :prepend-icon="page.icon"
                :title="page.title"
            />
          </template>
        </fr-tooltip>
      </template>
    </fr-list>
  </v-navigation-drawer>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { FrDivider, FrList, FrListHeader, FrListItem, FrTooltip } from "@feral-auth/vue-components";
import { useAuthenticationStore } from "@/store";
import { useNavigationStore } from "@/store/navigation";
import { views } from "@/utils/constants";

const dashboard = page => `${views.dashboard.path}/${page}`;
const admin = page => `${views.admin.path}/${page}`;

// The drawer's groups, and each one's pages, in order. The user's Applications
// is "My Applications", so that no two links share a name
const groups = [
  {
    heading: 'User',
    pages: [
      { title: 'My Applications', icon: 'mdi-apps', path: dashboard('applications') },
      { title: 'Profile', icon: 'mdi-account', path: dashboard('profile') },
      { title: 'Sessions', icon: 'mdi-devices', path: dashboard('sessions') },
    ],
  },
  {
    heading: 'Admin',
    pages: [
      { title: 'Roles', icon: 'mdi-shield-account', path: admin('roles') },
      { title: 'Users', icon: 'mdi-account-multiple', path: admin('users') },
      { title: 'Authorization', icon: 'mdi-account-key', path: admin('authorization') },
      { title: 'Keys', icon: 'mdi-key', path: admin('keys') },
      { title: 'Applications', icon: 'mdi-application-cog', path: admin('applications') },
    ],
  },
];

export default {
  name: "NavDrawer",

  components: { FrDivider, FrList, FrListHeader, FrListItem, FrTooltip },

  data: () => ({
    groups,
  }),

  computed: {
    ...mapState(useAuthenticationStore, [
      'showAppBar',
    ]),

    ...mapState(useNavigationStore, [
      'isRail',
      'isOpenOnPhone',
    ]),

    isPhone() {
      return this.$vuetify.display.smAndDown;
    },

    // Elsewhere the drawer is always there, expanded or as a rail
    isOpen() {
      return this.isPhone ? this.isOpenOnPhone : true;
    },

    isRailShown() {
      return !this.isPhone && this.isRail;
    },
  },

  methods: {
    ...mapActions(useNavigationStore, [
      'setOpenOnPhone',
    ]),

    // A phone's drawer closes on a click outside it, and on leaving the page
    updateOpen(isOpen) {
      if (this.isPhone) {
        this.setOpenOnPhone(isOpen);
      }
    },
  },
}
</script>
