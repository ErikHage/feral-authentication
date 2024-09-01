<template>
  <v-container>
    <v-app-bar app>
      <v-btn :to="loginPath">Login</v-btn>
    </v-app-bar>
    <div class="text-center mb-4">
      <v-img
          src="/assets/ai-rooster.jpg"
          alt="Logo"
          contain
          max-width="500"
          class="mx-auto"
      ></v-img>
    </div>
  </v-container>
</template>

<script>

import { views } from "@/utils/constants";

export default {
  name: 'PublicPage',

  data: () => ({
    loginPath: views.login.path,
  }),
}
</script>
