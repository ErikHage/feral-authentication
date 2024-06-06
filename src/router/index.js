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

router.beforeEach(async (to, from) => {
    const token = localStorage.getItem('feral-auth-token');

    if (!token && to.name !== 'Login') { // ❗️ Avoid an infinite redirect
        console.log('sending you back to Login');
        return { name: 'Login' }
    }
});

router.beforeEach(async (to, from) => {
    const token = localStorage.getItem('feral-auth-token');

    if (token && to.name === 'Login') {
        console.log('already logged in, sending you to Apps');
        return { name: 'Apps' }
    }
});

export default router;