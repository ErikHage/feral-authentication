import { createRouter, createWebHistory } from 'vue-router';

import { useAuthenticationStore } from '@/store';

import LoginPage from "@/views/LoginPage.vue";

import Dashboard from "@/views/Dashboard.vue";
import UserProfile from "@/views/dashboard/UserProfile.vue";
import ApplicationPicker from "@/views/dashboard/ApplicationPicker.vue";
import ActiveSessions from "@/views/dashboard/ActiveSessions.vue";

import AdminPage from "@/views/AdminPage.vue";
import RolesAdmin from "@/views/admin/RolesAdmin.vue";
import UsersAdmin from "@/views/admin/UsersAdmin.vue";
import AuthorizationAdmin from "@/views/admin/AuthorizationAdmin.vue";
import KeysAdmin from "@/views/admin/KeysAdmin.vue";
import ApplicationsAdmin from "@/views/admin/ApplicationsAdmin.vue";
import ApplicationDetails from "@/views/admin/ApplicationDetails.vue";

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
        children: [
            {
                path: 'applications',
                name: 'ApplicationPicker',
                component: ApplicationPicker,
                meta: {
                    requiresAuthenticated: true,
                },
            },
            {
                path: 'profile',
                name: 'UserProfile',
                component: UserProfile,
                meta: {
                    requiresAuthenticated: true,
                },
            },
            {
                path: 'sessions',
                name: 'ActiveSessions',
                component: ActiveSessions,
                meta: {
                    requiresAuthenticated: true,
                },
            },
        ],
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
            {
                path: 'users',
                name: 'UsersAdmin',
                component: UsersAdmin,
                meta: {
                    requiresAuthenticated: true,
                },
            },
            {
                path: 'authorization',
                name: 'AuthorizationAdmin',
                component: AuthorizationAdmin,
                meta: {
                    requiresAuthenticated: true,
                },
            },
            {
                path: 'keys',
                name: 'KeysAdmin',
                component: KeysAdmin,
                meta: {
                    requiresAuthenticated: true,
                },
            },
            {
                path: 'applications',
                name: 'ApplicationsAdmin',
                component: ApplicationsAdmin,
                meta: {
                    requiresAuthenticated: true,
                },
            },
            {
                path: 'applications/:id',
                name: 'ApplicationDetails',
                component: ApplicationDetails,
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
    const user = useAuthenticationStore();
    const requiresAuthenticated = to.matched.some(record => record.meta.requiresAuthenticated);
    // todo required roles in meta too

    if (requiresAuthenticated && !user.isAuthenticated && to.name !== 'Login') { // ❗️ Avoid an infinite redirect
        console.log('sending you back to Login');
        return { name: 'Login' };
    }
});

export default router;
