<template>
  <v-container class="text-center">
    <h2 class="headline">Page not found</h2>
    <p class="my-3">There's no page at {{ $route.fullPath }}.</p>
    <v-btn color="primary" :to="publicPath">Go to the home page</v-btn>
  </v-container>
</template>

<script>
import { views } from "@/utils/constants";

export default {
  name: 'NotFoundPage',

  data: () => ({
    publicPath: views.public.path,
  }),
}
</script>
