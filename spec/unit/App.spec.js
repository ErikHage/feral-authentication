import { flushPromises, mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { createFeralVuetifyOptions } from '@feral-auth/vue-components';
import { linkRouter } from '../helpers/routers';
import { tokenFor } from '../helpers/tokens';
import App from '@/App.vue';
import { useAuthenticationStore } from '@/store';

// The app as main.js makes it: the feral themes, which FrAppShell switches between
async function mountApp({ showAppBar, token = null, path = '/dashboard/applications', selectedApplication = null }) {
    const router = linkRouter();
    await router.push(path);
    const pinia = createTestingPinia({
        initialState: { authentication: { showAppBar, token }, application: { selectedApplication } },
    });
    const vuetify = createVuetify(createFeralVuetifyOptions({ components, directives }));
    const wrapper = mount(App, { global: { plugins: [router, pinia, vuetify] }, attachTo: document.body });
    await flushPromises();
    return { wrapper, router, store: useAuthenticationStore(pinia) };
}

describe('App', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('logged out', () => {
        it("shows only the app's name: no drawer, and no buttons", async () => {
            const { wrapper } = await mountApp({ showAppBar: false, path: '/login' });

            expect(wrapper.find('.v-toolbar-title').text()).toBe('Feral Authentication');
            expect(wrapper.find('.fr-app-shell').exists()).toBe(false);
            expect(wrapper.find('nav').exists()).toBe(false);
            expect(wrapper.find('.fr-breadcrumbs').exists()).toBe(false);
            expect(wrapper.find('.v-app-bar').findAll('button')).toHaveLength(0);
        });

        it('has a queue for the toasts', async () => {
            const { wrapper } = await mountApp({ showAppBar: false, path: '/login' });

            expect(wrapper.findComponent({ name: 'FrSnackbarQueue' }).exists()).toBe(true);
        });
    });

    describe('logged in', () => {
        const token = tokenFor({ username: 'ada lovelace', roles: [] });

        it('runs in FrAppShell, with every page in its drawer', async () => {
            const { wrapper } = await mountApp({ showAppBar: true, token });
            const shell = wrapper.findComponent({ name: 'FrAppShell' });

            expect(shell.props()).toMatchObject({ title: 'Feral', subtitle: 'Authentication', storagePrefix: 'feral-authentication' });
            const links = wrapper.findAll('nav#app-nav .v-list-item').map(link => link.attributes('aria-label'));
            expect(links).toEqual([
                'My Applications', 'Profile', 'Sessions',
                'Roles', 'Users', 'Authorization', 'Keys', 'Applications',
            ]);
        });

        it("marks the page's link, or the link it's under", async () => {
            const { wrapper, router } = await mountApp({ showAppBar: true, token, path: '/admin/applications/app-1' });

            expect(wrapper.find('#nav-ApplicationsAdmin').attributes('aria-current')).toBe('page');

            await router.push('/dashboard/profile');
            await flushPromises();
            expect(wrapper.find('#nav-UserProfile').attributes('aria-current')).toBe('page');
            expect(wrapper.find('#nav-ApplicationsAdmin').attributes('aria-current')).toBeUndefined();
        });

        it("shows the page's breadcrumbs in the toolbar: Admin and Applications, linked, then the application", async () => {
            const selectedApplication = { applicationDetails: { applicationId: 'app-1', applicationName: 'Game' } };
            const { wrapper } = await mountApp({ showAppBar: true, token, path: '/admin/applications/app-1', selectedApplication });
            const crumbs = wrapper.find('.v-app-bar .fr-breadcrumbs');

            expect(crumbs.findAll('.v-breadcrumbs-item').map(item => item.text())).toEqual(['Admin', 'Applications', 'Game']);
            expect(crumbs.findAll('a.v-breadcrumbs-item--link').map(link => link.attributes('href')))
                .toEqual(['/admin/roles', '/admin/applications']);
        });

        it("shows the user's menu, under their username from the token", async () => {
            const { wrapper } = await mountApp({ showAppBar: true, token });

            expect(wrapper.find('.v-app-bar button[aria-label="Account: ada lovelace"]').text()).toBe('AL');
        });

        it('logs out from the menu, and goes to the login page', async () => {
            const { wrapper, router, store } = await mountApp({ showAppBar: true, token });
            await wrapper.find('button[aria-label="Account: ada lovelace"]').trigger('click');
            await flushPromises();

            const logout = [...document.querySelectorAll('.fr-app-user-menu .v-list-item')]
                .find(item => item.textContent.includes('Logout'));
            logout.click();
            await flushPromises();

            expect(store.logout).toHaveBeenCalledOnce();
            await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/login'));
        });

        it('switches to the logged-out frame when the store says so', async () => {
            const { wrapper, store } = await mountApp({ showAppBar: true, token });

            store.showAppBar = false;
            await flushPromises();

            expect(wrapper.find('.fr-app-shell').exists()).toBe(false);
            expect(wrapper.find('.v-toolbar-title').text()).toBe('Feral Authentication');
        });

        it('has no username without a token', async () => {
            const { wrapper } = await mountApp({ showAppBar: true });

            expect(wrapper.find('button[aria-label="Account: "]').exists()).toBe(true);
        });
    });
});
