import { h } from 'vue';
import { flushPromises } from '@vue/test-utils';
import { VLayout } from 'vuetify/components';
import { mountWithPlugins } from './mount';

// Mounts a component that renders a v-app-bar, which must live inside a
// layout. In Vuetify 3.6 the app bar's setup waits for the layout to be
// ready, so it renders only after the pending promises settle
export async function mountInLayout(component, options = {}) {
    const wrapper = mountWithPlugins({
        render: () => h(VLayout, () => h(component)),
    }, options);
    await flushPromises();
    return wrapper;
}
