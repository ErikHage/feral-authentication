<template>
  <fr-container>
    <!-- No Fr* app bar yet -->
    <v-app-bar app>
      <fr-btn to="/admin/roles">Roles</fr-btn>
      <fr-btn to="/admin/users">Users</fr-btn>
      <fr-btn to="/admin/authorization">Authorization</fr-btn>
      <fr-btn to="/admin/keys">Keys</fr-btn>
      <fr-btn to="/admin/applications">Applications</fr-btn>
    </v-app-bar>
    <fr-row class="text-center">
      <router-view/>
    </fr-row>
  </fr-container>
</template>

<script>
import { FrBtn, FrContainer, FrRow } from "@feral-auth/vue-components";

export default {
  name: 'AdminPage',

  components: { FrBtn, FrContainer, FrRow },

  methods: {

  },
}
</script>
