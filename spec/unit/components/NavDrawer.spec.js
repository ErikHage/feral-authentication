import { flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import NavDrawer from '@/components/NavDrawer.vue';
import { useNavigationStore } from '@/store/navigation';
import { mountInLayout } from '../../helpers/layout';
import { linkRouter } from '../../helpers/routers';
import { onADesktop, onAPhone } from '../../helpers/display';

async function mountDrawer({ showAppBar = true, navigation = {} } = {}) {
    const router = linkRouter();
    await router.push('/dashboard/applications');
    const pinia = createTestingPinia({
        stubActions: false,
        initialState: { authentication: { showAppBar }, navigation },
    });

    const wrapper = await mountInLayout(NavDrawer, {
        attachTo: document.body,
        global: { plugins: [router, pinia] },
    });
    return { wrapper, router, store: useNavigationStore(pinia) };
}

// The text and path of each link in the drawer
function drawerLinks(wrapper) {
    return wrapper.findAll('.v-navigation-drawer a[href]').map(link => [link.text(), link.attributes('href')]);
}

// The headings, and the text and path of each link, in the drawer's order
function drawerContents(wrapper) {
    return wrapper.findAll('.v-navigation-drawer .v-list-subheader, .v-navigation-drawer a[href]')
        .map(item => (item.element.tagName === 'A' ? [item.text(), item.attributes('href')] : item.text()));
}

const allContents = [
    'User',
    ['My Applications', '/dashboard/applications'],
    ['Profile', '/dashboard/profile'],
    ['Sessions', '/dashboard/sessions'],
    'Admin',
    ['Roles', '/admin/roles'],
    ['Users', '/admin/users'],
    ['Authorization', '/admin/authorization'],
    ['Keys', '/admin/keys'],
    ['Applications', '/admin/applications'],
];

const allLinks = allContents.filter(item => Array.isArray(item));

// Whether Vuetify made the drawer inert. jsdom has no `inert` property, so Vue
// writes the value as an attribute, "true" or "false"; a browser gets the
// property, and only a true one
function isInert(wrapper) {
    return wrapper.find('.v-navigation-drawer').attributes('inert') === 'true';
}

describe('NavDrawer', () => {
    afterEach(() => {
        onADesktop();
        document.body.innerHTML = '';
    });

    it('is not there for a visitor who isn\'t logged in', async () => {
        const { wrapper } = await mountDrawer({ showAppBar: false });

        expect(wrapper.find('.v-navigation-drawer').exists()).toBe(false);
    });

    describe('on a desktop', () => {
        it('links to each page, grouped under User and Admin', async () => {
            const { wrapper } = await mountDrawer();

            expect(drawerContents(wrapper)).toEqual(allContents);
            expect(wrapper.find('.v-navigation-drawer').classes()).not.toContain('v-navigation-drawer--rail');
        });

        // A data table's pagination is a navigation landmark too
        it('is named, to tell it from other navigation', async () => {
            const { wrapper } = await mountDrawer();

            expect(wrapper.find('.v-navigation-drawer').attributes('aria-label')).toBe('Main menu');
        });

        it('gives each page an icon', async () => {
            const { wrapper } = await mountDrawer();

            expect(wrapper.findAll('.v-navigation-drawer a[href] .v-icon')).toHaveLength(allLinks.length);
        });

        it('shows a rail of the same links, with a divider between the groups for the headings', async () => {
            const { wrapper } = await mountDrawer({ navigation: { isRail: true } });

            expect(wrapper.find('.v-navigation-drawer').classes()).toContain('v-navigation-drawer--rail');
            expect(drawerLinks(wrapper).map(([, path]) => path)).toEqual(allLinks.map(([, path]) => path));
            expect(wrapper.find('.v-list-subheader').exists()).toBe(false);
            expect(wrapper.findAll('.v-navigation-drawer .v-divider')).toHaveLength(1);
        });

        it('has no dividers when expanded', async () => {
            const { wrapper } = await mountDrawer();

            expect(wrapper.find('.v-navigation-drawer .v-divider').exists()).toBe(false);
        });

        it('stays open when a link is followed', async () => {
            const { wrapper } = await mountDrawer();

            await wrapper.find('a[href="/admin/keys"]').trigger('click');
            await flushPromises();

            expect(wrapper.find('.v-navigation-drawer').classes()).toContain('v-navigation-drawer--active');
        });

        it('is never inert, expanded or as a rail', async () => {
            expect(isInert((await mountDrawer()).wrapper)).toBe(false);
            expect(isInert((await mountDrawer({ navigation: { isRail: true } })).wrapper)).toBe(false);
        });
    });

    describe('on a phone', () => {
        beforeEach(() => {
            onAPhone();
        });

        it('is hidden until opened, never as a rail', async () => {
            const { wrapper } = await mountDrawer({ navigation: { isRail: true } });

            const drawer = wrapper.find('.v-navigation-drawer');
            expect(drawer.classes()).not.toContain('v-navigation-drawer--active');
            expect(drawer.classes()).not.toContain('v-navigation-drawer--rail');
        });

        // Vuetify's doing: off screen, the closed drawer's links are out of the
        // tab order and the accessibility tree
        it('is inert while closed, and not once opened', async () => {
            const { wrapper, store } = await mountDrawer();
            expect(isInert(wrapper)).toBe(true);

            store.setOpenOnPhone(true);
            await flushPromises();

            expect(isInert(wrapper)).toBe(false);
        });

        it('slides in over the page when opened, with every page', async () => {
            const { wrapper } = await mountDrawer({ navigation: { isOpenOnPhone: true } });

            const drawer = wrapper.find('.v-navigation-drawer');
            expect(drawer.classes()).toContain('v-navigation-drawer--active');
            expect(drawer.classes()).toContain('v-navigation-drawer--temporary');
            expect(drawerLinks(wrapper)).toEqual(allLinks);
        });

        it('closes when a link is followed', async () => {
            const { wrapper, store } = await mountDrawer({ navigation: { isOpenOnPhone: true } });

            await wrapper.find('a[href="/admin/keys"]').trigger('click');
            await flushPromises();

            expect(store.isOpenOnPhone).toBe(false);
        });
    });
});
