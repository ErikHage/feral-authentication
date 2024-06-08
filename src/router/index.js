import { createRouter, createWebHistory } from 'vue-router';

import LoginPage from "@/views/LoginPage.vue";
import Dashboard from "@/views/Dashboard.vue";
import AdminPage from "@/views/AdminPage.vue";
import RolesAdmin from "@/views/admin/RolesAdmin.vue";

import { useUser } from '@/store';

const routes = [
    {
        path: '/',
        name: 'Login',
        component: LoginPage,
        meta: {
            requiresAuthenticated: false,
        },
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
            requiresAuthenticated: true,
        },
    },
    {
        path: '/admin',
        name: 'Admin',
        component: AdminPage,
        meta: {
            requiresAuthenticated: true,
        },
        children: [
            {
                path: 'roles',
                name: 'RolesAdmin',
                component: RolesAdmin,
                meta: {
                    requiresAuthenticated: true,
                },
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory('/auth'),
    routes
});

router.beforeEach((to, from) => {
    const user = useUser();
    const requiresAuthenticated = to.matched.some(record => record.meta.requiresAuthenticated);
    // todo required roles in meta too

    if (requiresAuthenticated && !user.isAuthenticated && to.name !== 'Login') { // ❗️ Avoid an infinite redirect
        console.log('sending you back to Login');
        return { name: 'Login' };
    }
});

export default router;