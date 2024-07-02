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
import { useAuthenticationStore } from "@/store";

export default {
  name: 'App',

  components: { AppBar },

  computed: {
    ...mapState(useAuthenticationStore, [
      'isAuthenticated',
    ]),
  },

  methods: {
    ...mapActions(useAuthenticationStore, [
      'tokenPresent',
      'clearToken',
      'verifyToken',
      'setAlertMessage',
    ]),
  },

  mounted() {
    if (this.tokenPresent()) {
      this.verifyToken()
          .then(() => {
            if (this.isAuthenticated) {
              setTimeout(() => {
                this.$router.push('/dashboard/applications');
              }, 750);
            } else {
              this.clearToken();
              this.$router.push('/');
            }
          })
          .catch((err) => {
            this.clearToken();
            if (err.status === 401) {
              this.$router.push('/');
            }
          });
    }
  },
}
</script>
