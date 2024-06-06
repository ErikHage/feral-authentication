import { createRouter, createWebHistory } from 'vue-router';

import LoginPage from "@/views/LoginPage.vue";
import AppsPage from "@/views/AppsPage.vue";
import AdminPage from "@/views/AdminPage.vue";

import { useUser } from '@/store';

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
    },
    {
        path: '/admin',
        name: 'Admin',
        component: AdminPage,
    }
];

const router = createRouter({
    history: createWebHistory('/auth'),
    routes
});

router.beforeEach(async (to, from) => {
    let user = useUser();
    if (!user.token && to.name !== 'Login') { // ❗️ Avoid an infinite redirect
        console.log('sending you back to Login');
        return { name: 'Login' };
    }
});

router.beforeEach(async (to, from) => {
    let user = useUser();
    if (user.token && to.name === 'Login') {
        console.log('already logged in, sending you to Apps');
        return { name: 'Apps' };
    }
});

// router.beforeEach(async (to, from) => {
//     let user = useUser();
//     if (user.token && to.name === 'Admin' && user.isAdmin) {
//         return { name: 'Admin' };
//     } else {
//         return { name: 'Apps' };
//     }
// });

export default router;