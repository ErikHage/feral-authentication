import { createRouter, createWebHistory } from 'vue-router';

import LoginPage from "@/views/LoginPage.vue";
import AppsPage from "@/views/AppsPage.vue";

const routes = [
    {
        path: '/',
        name: 'Login',
        component: LoginPage
    },
    {
        path: '/apps',
        name: 'Apps',
        component: AppsPage,
    }
];

const router = createRouter({
    history: createWebHistory('/auth'),
    routes
});

export default router;