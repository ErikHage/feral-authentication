<template>
  <fr-container>
    <!-- No Fr* app bar yet -->
    <v-app-bar app>
      <fr-btn color="default" :to="loginPath">Login</fr-btn>
    </v-app-bar>
    <div class="text-center mb-4">
      <fr-image
          :src="getLogoPath()"
          alt="Logo"
          max-width="500"
          class="mx-auto"
      ></fr-image>
    </div>
  </fr-container>
</template>

<script>

import { views } from "@/utils/constants";
import { getAssetPath } from "@/utils/assets";
import { FrBtn, FrContainer, FrImage } from "@feral-auth/vue-components";


export default {
  name: 'PublicPage',

  components: { FrBtn, FrContainer, FrImage },

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
