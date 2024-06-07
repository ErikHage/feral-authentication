<template>
  <v-container>
    <h2>Dashboard</h2>
    <br/>
    <v-row>
      <v-card v-if="actor()">
        <v-card-text>
          Welcome {{ actor().username }}
          <br/><br/>
          <strong>Your roles:</strong>
          <v-chip-group>
            <v-chip v-for="role in actor().roles">{{ role }}</v-chip>
          </v-chip-group>
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
