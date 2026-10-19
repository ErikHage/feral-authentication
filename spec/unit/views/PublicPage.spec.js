import { createRouter, createMemoryHistory } from 'vue-router';
import { mountInLayout } from '../../helpers/layout';
import PublicPage from '@/views/PublicPage.vue';

function mountPage() {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: ['/', '/login'].map(path => ({ path, component: { render: () => null } })),
    });
    return mountInLayout(PublicPage, { global: { plugins: [router] } });
}

describe('PublicPage', () => {
    it('links to the login page', async () => {
        const wrapper = await mountPage();

        const login = wrapper.find('a.v-btn');
        expect(login.text()).toBe('Login');
        expect(login.attributes('href')).toBe('/login');
    });

    it('shows the rooster logo from the asset path', async () => {
        const wrapper = await mountPage();

        expect(wrapper.findComponent({ name: 'VImg' }).props('src')).toBe('/assets-test/ai-rooster.jpg');
    });
});
