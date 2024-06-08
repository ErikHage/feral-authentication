<template>
  <v-container>
    <v-app-bar app>
      <v-btn to="/admin/roles">Roles</v-btn>
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
