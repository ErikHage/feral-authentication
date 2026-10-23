import { flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { mountWithPlugins } from '../../helpers/mount';
import NotFoundPage from '@/views/NotFoundPage.vue';

async function mountAt(path) {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/', component: { render: () => null } },
            { path: '/:pathMatch(.*)*', component: NotFoundPage },
        ],
    });
    await router.push(path);
    const wrapper = mountWithPlugins(NotFoundPage, { global: { plugins: [router] } });
    await flushPromises();
    return wrapper;
}

describe('NotFoundPage', () => {
    it('says there is no page at the path', async () => {
        const wrapper = await mountAt('/no-such-page?tab=2');

        expect(wrapper.find('h2').text()).toBe('Page not found');
        expect(wrapper.text()).toContain("There's no page at /no-such-page?tab=2.");
    });

    it('links to the home page', async () => {
        const wrapper = await mountAt('/no-such-page');

        const home = wrapper.find('a.v-btn');
        expect(home.text()).toBe('Go to the home page');
        expect(home.attributes('href')).toBe('/');
    });
});
