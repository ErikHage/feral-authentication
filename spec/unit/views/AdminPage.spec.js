import { h } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import { mountInLayout } from '../../helpers/layout';
import AdminPage from '@/views/AdminPage.vue';

const pages = ['roles', 'users', 'authorization', 'keys', 'applications'];

// Flat routes: mounted directly, the admin page's router-view is the top one
async function mountAdminPage(path) {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: pages.map(page => ({
            path: `/admin/${page}`,
            component: { render: () => h('p', { class: 'page' }, `${page} page`) },
        })),
    });
    await router.push(path);

    return mountInLayout(AdminPage, { global: { plugins: [router] } });
}

describe('AdminPage', () => {
    it('shows the current page, and no links of its own', async () => {
        const wrapper = await mountAdminPage('/admin/keys');

        expect(wrapper.find('.page').text()).toBe('keys page');
        expect(wrapper.find('a').exists()).toBe(false);
    });
});
