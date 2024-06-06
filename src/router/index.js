import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from "@/components/LoginPage.vue";
import AppsPage from "@/components/AppsPage.vue";

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