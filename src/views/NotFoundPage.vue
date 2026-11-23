<template>
  <fr-page title="Page not found">
    <p class="mb-3">There's no page at {{ $route.fullPath }}.</p>
    <fr-btn :to="publicPath">Go to the home page</fr-btn>
  </fr-page>
</template>

<script>
import { FrBtn, FrPage } from "@feral-auth/vue-components";
import { views } from "@/utils/constants";

export default {
  name: 'NotFoundPage',

  components: { FrBtn, FrPage },

  data: () => ({
    publicPath: views.public.path,
  }),
}
</script>
