<template>
  <v-container>
    <v-app-bar app>
      <v-btn :to="loginPath">Login</v-btn>
    </v-app-bar>
    <div class="text-center mb-4">
      <v-img
          :src="getLogoPath()"
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
import { getAssetPath } from "@/utils/assets";


export default {
  name: 'PublicPage',

  data: () => ({
    loginPath: views.login.path,
  }),

  methods: {
    getLogoPath() {
      return getAssetPath('/ai-rooster.jpg');
    }
  },
}
</script>
