import { createRouter, createWebHistory } from 'vue-router';

import { useAuthenticationStore } from '@/store';
import { views } from "@/utils/constants";

import Dashboard from "@/views/Dashboard.vue";
import LoginPage from "@/views/LoginPage.vue";
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
import PublicPage from "@/views/PublicPage.vue";

const routes = [
    {
        path: views.public.path,
        name: views.public.name,
        component: PublicPage,
        meta: {
            requiresAuthenticated: false,
        },
    },
    {
        path: views.login.path,
        name: views.login.name,
        component: LoginPage,
        meta: {
            requiresAuthenticated: false,
        },
    },
    {
        path: views.dashboard.path,
        name: views.dashboard.name,
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
        path: views.admin.path,
        name: views.admin.name,
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

router.beforeEach((to /*, from */) => {
    const user = useAuthenticationStore();
    const requiresAuthenticated = to.matched.some(record => record.meta.requiresAuthenticated);
    // todo required roles in meta too

    if (requiresAuthenticated && !user.isAuthenticated && to.name !== views.login.name) { // ❗️ Avoid an infinite redirect
        console.log('sending you back to Login');
        return { name: views.login.name };
    }
});

export default router;
