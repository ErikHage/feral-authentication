import { createPinia, setActivePinia } from 'pinia';
import router from '@/router';
import { useAuthenticationStore } from '@/store';
import PublicPage from '@/views/PublicPage.vue';
import LoginPage from '@/views/LoginPage.vue';
import DashboardPage from '@/views/DashboardPage.vue';
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
import NotFoundPage from '@/views/NotFoundPage.vue';
import authenticationApi from '@/api/authentication-api';

vi.mock('@/api/authentication-api', () => ({
    default: { verifyToken: vi.fn() },
}));

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

// Each shell, only navigation on its own, and the first page it opens at
const shells = [
    ['/dashboard', '/dashboard/applications'],
    ['/admin', '/admin/roles'],
];
const pagePaths = protectedPaths.filter(path => !shells.some(([shell]) => shell === path));

describe('router', () => {
    it('serves the app under /auth/', () => {
        expect(router.resolve('/login').href).toBe('/auth/login');
    });

    describe('routes', () => {
        it.each([
            ['/', 'Public', [PublicPage]],
            ['/login', 'Login', [LoginPage]],
            ['/dashboard/applications', 'ApplicationPicker', [DashboardPage, ApplicationPicker]],
            ['/dashboard/profile', 'UserProfile', [DashboardPage, UserProfile]],
            ['/dashboard/sessions', 'ActiveSessions', [DashboardPage, ActiveSessions]],
            ['/admin/roles', 'RolesAdmin', [AdminPage, RolesAdmin]],
            ['/admin/users', 'UsersAdmin', [AdminPage, UsersAdmin]],
            ['/admin/authorization', 'AuthorizationAdmin', [AdminPage, AuthorizationAdmin]],
            ['/admin/keys', 'KeysAdmin', [AdminPage, KeysAdmin]],
            ['/admin/applications', 'ApplicationsAdmin', [AdminPage, ApplicationsAdmin]],
            ['/admin/applications/app-1', 'ApplicationDetails', [AdminPage, ApplicationDetails]],
            ['/no-such-page', 'NotFound', [NotFoundPage]],
            ['/admin/no-such-page', 'NotFound', [NotFoundPage]],
        ])('resolves %s to %s', (path, name, components) => {
            const route = router.resolve(path);

            expect(route.name).toBe(name);
            expect(route.matched.map(record => record.components.default)).toEqual(components);
        });

        it('passes the application id as a route param', () => {
            expect(router.resolve('/admin/applications/app-1').params).toEqual({ id: 'app-1' });
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
            localStorage.clear();
            vi.clearAllMocks();
            vi.restoreAllMocks();
        });

        // A token from an earlier visit, in a store created after it, as on a reload
        function reloadWithStoredToken() {
            localStorage.setItem('feral-token', 'a-token');
            setActivePinia(createPinia());
        }

        it.each(['/', '/login', '/no-such-page'])('lets anyone open %s', async path => {
            await router.push(path);

            expect(router.currentRoute.value.path).toBe(path);
        });

        it.each(protectedPaths)('sends someone not logged in from %s to the login page', async path => {
            await router.push(path);

            expect(router.currentRoute.value.name).toBe('Login');
        });

        it('remembers where they were going', async () => {
            await router.push('/admin/users?tab=2');

            expect(router.currentRoute.value.name).toBe('Login');
            expect(router.currentRoute.value.query).toEqual({ redirect: '/admin/users?tab=2' });
        });

        it.each(pagePaths)('lets someone logged in open %s', async path => {
            store.$patch({ isAuthenticated: true });

            await router.push(path);

            expect(router.currentRoute.value.path).toBe(path);
        });

        it.each(shells)('opens %s at its first page, %s', async (shell, firstPage) => {
            store.$patch({ isAuthenticated: true });

            await router.push(shell);

            expect(router.currentRoute.value.path).toBe(firstPage);
        });

        it('lets someone with a stored token the service accepts open the page they reload', async () => {
            reloadWithStoredToken();
            authenticationApi.verifyToken.mockResolvedValue(true);

            await router.push('/dashboard/profile');

            expect(authenticationApi.verifyToken).toHaveBeenCalledWith('a-token');
            expect(router.currentRoute.value.path).toBe('/dashboard/profile');
        });

        it('sends someone whose stored token the service rejects to the login page', async () => {
            reloadWithStoredToken();
            authenticationApi.verifyToken.mockResolvedValue(false);

            await router.push('/dashboard/profile');

            expect(router.currentRoute.value.name).toBe('Login');
            expect(localStorage.getItem('feral-token')).toBeNull();
        });

        it('checks a stored token only once', async () => {
            reloadWithStoredToken();
            authenticationApi.verifyToken.mockResolvedValue(true);

            await router.push('/dashboard/profile');
            await router.push('/admin/users');

            expect(authenticationApi.verifyToken).toHaveBeenCalledTimes(1);
        });
    });
});
