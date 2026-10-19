import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

// Mounts a component with a fresh Vuetify instance plus any extra plugins
export function mountWithPlugins(component, options = {}) {
    const { global = {}, ...rest } = options;
    const vuetify = createVuetify({ components, directives });

    return mount(component, {
        ...rest,
        global: {
            ...global,
            plugins: [vuetify, ...(global.plugins || [])],
        },
    });
}
