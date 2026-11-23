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
    it('shows the current page, and no links of its own', async () => {
        const wrapper = await mountDashboard('/dashboard/profile');

        expect(wrapper.find('.page').text()).toBe('profile page');
        expect(wrapper.find('a').exists()).toBe(false);
    });
});
