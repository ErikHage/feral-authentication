import { createApp } from 'vue';
// First: its styles declare the order of Vuetify's CSS layers. Loaded after
// the components' styles, the reset would outrank them
import vuetify from '@/plugins/vuetify';
import App from './App.vue';
import { pinia } from "@/plugins/pinia";

import { loadFonts } from './plugins/webfontloader';
import router from "@/router";

const app = createApp(App);

loadFonts();
app.use(router);
app.use(vuetify);
app.use(pinia);

app.mount('#app');
