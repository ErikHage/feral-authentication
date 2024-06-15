<template>
  <v-container>
    <v-app-bar app>
      <v-btn to="/admin/roles">Roles</v-btn>
      <v-btn to="/admin/users">Users</v-btn>
      <v-btn to="/admin/authorization">Authorization</v-btn>
    </v-app-bar>
    <v-row class="text-center">
      <router-view/>
    </v-row>
  </v-container>
</template>

<script>

export default {
  name: 'AdminPage',

  methods: {

  },
}
</script>
