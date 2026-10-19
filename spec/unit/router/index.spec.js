import { createPinia, setActivePinia } from 'pinia';
import router from '@/router';
import { useAuthenticationStore } from '@/store';
import PublicPage from '@/views/PublicPage.vue';
import LoginPage from '@/views/LoginPage.vue';
import Dashboard from '@/views/Dashboard.vue';
import ApplicationPicker from '@/views/dashboard/ApplicationPicker.vue';
import UserProfile from '@/views/dashboard/UserProfile.vue';
import ActiveSessions from '@/views/dashboard/ActiveSessions.vue';
import AdminPage from '@/views/AdminPage.vue';
import RolesAdmin from '@/views/admin/RolesAdmin.vue';
import UsersAdmin from '@/views/admin/UsersAdmin.vue';
import AuthorizationAdmin from '@/views/admin/AuthorizationAdmin.vue';
import KeysAdmin from '@/views/admin/KeysAdmin.vue';
import ApplicationsAdmin from '@/views/admin/ApplicationsAdmin.vue';
import ApplicationDetails from '@/views/admin/ApplicationDetails.vue';

const protectedPaths = [
    '/dashboard',
    '/dashboard/applications',
    '/dashboard/profile',
    '/dashboard/sessions',
    '/admin',
    '/admin/roles',
    '/admin/users',
    '/admin/authorization',
    '/admin/keys',
    '/admin/applications',
    '/admin/applications/app-1',
];

describe('router', () => {
    it('serves the app under /auth/', () => {
        expect(router.resolve('/login').href).toBe('/auth/login');
    });

    describe('routes', () => {
        it.each([
            ['/', 'Public', [PublicPage]],
            ['/login', 'Login', [LoginPage]],
            ['/dashboard', 'Dashboard', [Dashboard]],
            ['/dashboard/applications', 'ApplicationPicker', [Dashboard, ApplicationPicker]],
            ['/dashboard/profile', 'UserProfile', [Dashboard, UserProfile]],
            ['/dashboard/sessions', 'ActiveSessions', [Dashboard, ActiveSessions]],
            ['/admin', 'Admin', [AdminPage]],
            ['/admin/roles', 'RolesAdmin', [AdminPage, RolesAdmin]],
            ['/admin/users', 'UsersAdmin', [AdminPage, UsersAdmin]],
            ['/admin/authorization', 'AuthorizationAdmin', [AdminPage, AuthorizationAdmin]],
            ['/admin/keys', 'KeysAdmin', [AdminPage, KeysAdmin]],
            ['/admin/applications', 'ApplicationsAdmin', [AdminPage, ApplicationsAdmin]],
            ['/admin/applications/app-1', 'ApplicationDetails', [AdminPage, ApplicationDetails]],
        ])('resolves %s to %s', (path, name, components) => {
            const route = router.resolve(path);

            expect(route.name).toBe(name);
            expect(route.matched.map(record => record.components.default)).toEqual(components);
        });

        it('passes the application id as a route param', () => {
            expect(router.resolve('/admin/applications/app-1').params).toEqual({ id: 'app-1' });
        });

        it('has no route for an unknown path', () => {
            // current behavior: there is no catch-all, so an unknown url shows an empty page
            vi.spyOn(console, 'warn').mockImplementation(() => {});

            expect(router.resolve('/no-such-page').matched).toEqual([]);
        });
    });

    describe('guard', () => {
        let store;

        beforeEach(async () => {
            setActivePinia(createPinia());
            store = useAuthenticationStore();
            vi.spyOn(console, 'log').mockImplementation(() => {});
            // Start each test from a page the guard always allows
            await router.push('/');
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it.each(['/', '/login'])('lets anyone open %s', async path => {
            await router.push(path);

            expect(router.currentRoute.value.path).toBe(path);
        });

        it.each(protectedPaths)('sends someone not logged in from %s to the login page', async path => {
            await router.push(path);

            expect(router.currentRoute.value.name).toBe('Login');
        });

        it('forgets where they were going', async () => {
            // current behavior: no redirect query, so after logging in they land on the
            // dashboard rather than the page they asked for
            await router.push('/admin/users');

            expect(router.currentRoute.value.fullPath).toBe('/login');
        });

        it.each(protectedPaths)('lets someone logged in open %s', async path => {
            store.$patch({ isAuthenticated: true });

            await router.push(path);

            expect(router.currentRoute.value.path).toBe(path);
        });

        it('checks the store, not the stored token', async () => {
            // current behavior: a token from an earlier visit doesn't count until the
            // login page has verified it
            localStorage.setItem('feral-token', 'a-token');

            await router.push('/dashboard/profile');

            expect(router.currentRoute.value.name).toBe('Login');
            localStorage.clear();
        });
    });
});
