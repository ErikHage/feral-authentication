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

    maybeGetApplicationIdQueryParam() {
      const urlParams = new URLSearchParams(window.location.search);
      console.log('app query param: ', urlParams.get('app'));
      return urlParams.get('app');
    },

    delayedRedirectToDashboard() {
      setTimeout(() => {
        this.$router.push('/dashboard/applications');
      }, 750);
    },

    redirectToLogin() {
      this.$router.push('/login');
    }
  },

  async mounted() {
    const maybeApplicationId = this.maybeGetApplicationIdQueryParam();

    if (this.tokenPresent()) {
      try {
        await this.verifyToken();
        if (this.isAuthenticated) {
          this.delayedRedirectToDashboard();
        } else {
          this.clearToken();
          this.redirectToLogin();
        }
      } catch (err) {
        this.clearToken();
        if (err.status === 401) {
          this.redirectToLogin();
        }
      }
    }
  },
}
</script>
