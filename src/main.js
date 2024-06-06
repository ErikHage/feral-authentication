import { createApp } from 'vue';
import App from './App.vue';
import vuetify from '@/plugins/vuetify';
import { pinia } from "@/plugins/pinia";

import { loadFonts } from './plugins/webfontloader';
import router from "@/router";

const app = createApp(App);

loadFonts();
app.use(router);
app.use(vuetify);
app.use(pinia);

app.mount('#app');
