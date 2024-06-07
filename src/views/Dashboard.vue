<template>
  <v-container>
    <h2>Dashboard</h2>
    <br/>
    <v-row>
      <v-card>
        <v-card-text>
          Welcome {{ actor()?.username }}
          <br/>
          <strong>Your roles:</strong> {{ actor()?.roles.join(',') }}
        </v-card-text>
      </v-card>

    </v-row>
  </v-container>
</template>

<script>

import { mapState } from "pinia";
import { useUser } from "@/store";

export default {
  name: 'Dashboard',

  methods: {
    ...mapState(useUser, {
      actor: 'actor',
    }),
  },
}
</script>
