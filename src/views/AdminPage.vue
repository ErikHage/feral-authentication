<template>
  <div>
    <!-- No Fr* app bar yet -->
    <v-app-bar app>
      <fr-btn color="default" to="/admin/roles">Roles</fr-btn>
      <fr-btn color="default" to="/admin/users">Users</fr-btn>
      <fr-btn color="default" to="/admin/authorization">Authorization</fr-btn>
      <fr-btn color="default" to="/admin/keys">Keys</fr-btn>
      <fr-btn color="default" to="/admin/applications">Applications</fr-btn>
    </v-app-bar>
    <router-view/>
  </div>
</template>

<script>
import { FrBtn } from "@feral-auth/vue-components";

export default {
  name: 'AdminPage',

  components: { FrBtn },

  methods: {

  },
}
</script>
