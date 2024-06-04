<template>
  <v-app>
    <v-main>
      <FeralAuthenticationApp/>
    </v-main>
  </v-app>
</template>

<script>
import FeralAuthenticationApp from "@/components/FeralAuthenticationApp.vue";

export default {
  name: 'App',

  components: {
    FeralAuthenticationApp,
  },

  data: () => ({
    //
  }),
}
</script>
