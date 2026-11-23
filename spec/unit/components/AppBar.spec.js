import { flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mountInLayout } from '../../helpers/layout';
import { linkRouter } from '../../helpers/routers';
import { onADesktop, onAPhone } from '../../helpers/display';
import AppBar from '@/components/AppBar.vue';
import { useAuthenticationStore } from '@/store';
import { useNavigationStore } from '@/store/navigation';

async function mountAppBar({ showAppBar }) {
    const router = linkRouter();
    const pinia = createTestingPinia({ initialState: { authentication: { showAppBar } } });
    const wrapper = await mountInLayout(AppBar, { global: { plugins: [router, pinia] } });

    return { wrapper, router, store: useAuthenticationStore(pinia), navigation: useNavigationStore(pinia) };
}

const buttonLabels = wrapper => wrapper.findAll('.v-btn').map(button => button.text());

// The hamburger, which Vuetify renders as an icon button
const menuButton = wrapper => wrapper.find('button[aria-label="Menu"]');

describe('AppBar', () => {
    afterEach(() => {
        onADesktop();
    });

    it('shows the title', async () => {
        const { wrapper } = await mountAppBar({ showAppBar: false });

        expect(wrapper.find('.v-toolbar-title').text()).toBe('Feral Authentication');
    });

    it('shows no buttons when logged out', async () => {
        const { wrapper } = await mountAppBar({ showAppBar: false });

        expect(buttonLabels(wrapper)).toEqual([]);
        expect(menuButton(wrapper).exists()).toBe(false);
    });

    it('shows Menu and Logout, and no links, when logged in', async () => {
        const { wrapper } = await mountAppBar({ showAppBar: true });

        expect(menuButton(wrapper).exists()).toBe(true);
        expect(buttonLabels(wrapper)).toEqual(['', 'Logout']);
        expect(wrapper.find('a').exists()).toBe(false);
    });

    it('shows the buttons as soon as the store says so', async () => {
        const { wrapper, store } = await mountAppBar({ showAppBar: false });

        store.showAppBar = true;
        await flushPromises();

        expect(menuButton(wrapper).exists()).toBe(true);
        expect(buttonLabels(wrapper)).toContain('Logout');
    });

    it('switches the drawer to and from the rail on a desktop', async () => {
        const { wrapper, navigation } = await mountAppBar({ showAppBar: true });

        await menuButton(wrapper).trigger('click');

        expect(navigation.toggle).toHaveBeenCalledWith(false);
    });

    it('opens the drawer on a phone', async () => {
        onAPhone();
        const { wrapper, navigation } = await mountAppBar({ showAppBar: true });

        await menuButton(wrapper).trigger('click');

        expect(navigation.toggle).toHaveBeenCalledWith(true);
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
