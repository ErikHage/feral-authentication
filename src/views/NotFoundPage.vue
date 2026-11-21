<template>
  <fr-container class="text-center">
    <h2>Page not found</h2>
    <p class="my-3">There's no page at {{ $route.fullPath }}.</p>
    <fr-btn color="primary" :to="publicPath">Go to the home page</fr-btn>
  </fr-container>
</template>

<script>
import { FrBtn, FrContainer } from "@feral-auth/vue-components";
import { views } from "@/utils/constants";

export default {
  name: 'NotFoundPage',

  components: { FrBtn, FrContainer },

  data: () => ({
    publicPath: views.public.path,
  }),
}
</script>
