import { flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createMemoryHistory } from 'vue-router';
import { mountInLayout } from '../../helpers/layout';
import AppBar from '@/components/AppBar.vue';
import { useAuthenticationStore } from '@/store';

const emptyPage = { render: () => null };

async function mountAppBar({ showAppBar }) {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: ['/', '/login', '/dashboard', '/admin'].map(path => ({ path, component: emptyPage })),
    });
    const pinia = createTestingPinia({ initialState: { authentication: { showAppBar } } });
    const wrapper = await mountInLayout(AppBar, { global: { plugins: [router, pinia] } });

    return { wrapper, router, store: useAuthenticationStore(pinia) };
}

const buttonLabels = wrapper => wrapper.findAll('.v-btn').map(button => button.text());

describe('AppBar', () => {
    it('shows the title', async () => {
        const { wrapper } = await mountAppBar({ showAppBar: false });

        expect(wrapper.find('.v-toolbar-title').text()).toBe('Feral Authentication');
    });

    it('shows no buttons when logged out', async () => {
        const { wrapper } = await mountAppBar({ showAppBar: false });

        expect(buttonLabels(wrapper)).toEqual([]);
    });

    it('shows Dashboard, Admin and Logout when logged in', async () => {
        const { wrapper } = await mountAppBar({ showAppBar: true });

        expect(buttonLabels(wrapper)).toEqual(['Dashboard', 'Admin', 'Logout']);
    });

    it('links to the dashboard and admin pages', async () => {
        const { wrapper } = await mountAppBar({ showAppBar: true });

        const hrefs = wrapper.findAll('a.v-btn').map(link => link.attributes('href'));
        expect(hrefs).toEqual(['/dashboard', '/admin']);
    });

    it('shows the buttons as soon as the store says so', async () => {
        const { wrapper, store } = await mountAppBar({ showAppBar: false });

        store.showAppBar = true;
        await flushPromises();

        expect(buttonLabels(wrapper)).toEqual(['Dashboard', 'Admin', 'Logout']);
    });

    it('logs out, then goes to the login page', async () => {
        const { wrapper, router, store } = await mountAppBar({ showAppBar: true });
        const push = vi.spyOn(router, 'push');

        await wrapper.findAll('.v-btn').find(button => button.text() === 'Logout').trigger('click');
        await flushPromises();

        expect(store.logout).toHaveBeenCalledTimes(1);
        expect(push).toHaveBeenCalledWith('/login');
    });
});
