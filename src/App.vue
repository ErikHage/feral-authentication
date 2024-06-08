<template>
  <v-app>
    <AppBar/>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import { mapActions, mapState } from "pinia";
import AppBar from "@/components/AppBar.vue";
import { useUser } from "@/store";

export default {
  name: 'App',

  components: { AppBar },

  methods: {
    ...mapActions(useUser, ['verifyToken']),

    ...mapState(useUser, {
      isAuthenticated: (state) => state.isAuthenticated,
    }),
  },

  mounted() {
    this.verifyToken().then(() => {
      if (this.isAuthenticated()) {
        setTimeout(() => {
          this.$router.push('/dashboard');
        }, 750);
      }
    });
  },
}
</script>
