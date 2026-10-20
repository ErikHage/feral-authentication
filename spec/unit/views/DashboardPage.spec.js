import { h } from 'vue';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createMemoryHistory } from 'vue-router';
import { mountInLayout } from '../../helpers/layout';
import DashboardPage from '@/views/DashboardPage.vue';

// Flat routes: mounted directly, the dashboard's router-view is the top one
async function mountDashboard(path) {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: ['applications', 'profile', 'sessions'].map(page => ({
            path: `/dashboard/${page}`,
            component: { render: () => h('p', { class: 'page' }, `${page} page`) },
        })),
    });
    await router.push(path);

    return mountInLayout(DashboardPage, { global: { plugins: [router, createTestingPinia()] } });
}

describe('DashboardPage', () => {
    it('links to its three pages', async () => {
        const wrapper = await mountDashboard('/dashboard/applications');

        const links = wrapper.findAll('a.v-btn').map(link => [link.text(), link.attributes('href')]);
        expect(links).toEqual([
            ['Applications', '/dashboard/applications'],
            ['Profile', '/dashboard/profile'],
            ['Sessions', '/dashboard/sessions'],
        ]);
    });

    it('shows the current page below the links', async () => {
        const wrapper = await mountDashboard('/dashboard/profile');

        expect(wrapper.find('.page').text()).toBe('profile page');
    });
});
