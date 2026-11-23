import { createMemoryHistory, createRouter } from 'vue-router';

// A router for components that render links (v-btn and v-list-item with :to).
// Every path goes to an empty page, so a spec can follow a link without
// loading the app's pages
export function linkRouter() {
    return createRouter({
        history: createMemoryHistory(),
        routes: [{ path: '/:path(.*)*', component: { render: () => null } }],
    });
}
