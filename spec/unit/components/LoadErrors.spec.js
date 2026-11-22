import { mountWithPlugins } from '../../helpers/mount';
import LoadErrors from '@/components/LoadErrors.vue';

describe('LoadErrors', () => {
    it('shows one error alert per load that failed', () => {
        const wrapper = mountWithPlugins(LoadErrors, {
            props: { messages: ["Couldn't load the users: you don't have permission", null, "Couldn't load the roles: it wasn't found"] },
        });

        const alerts = wrapper.findAll('.v-alert');
        expect(alerts.map(alert => alert.text())).toEqual([
            "Couldn't load the users: you don't have permission",
            "Couldn't load the roles: it wasn't found",
        ]);
        // FrAlert is tonal: the type colours the text, on a tint of it
        expect(alerts[0].classes()).toContain('text-error');
    });

    it('shows nothing when every load succeeded', () => {
        const wrapper = mountWithPlugins(LoadErrors, { props: { messages: [null, null] } });

        expect(wrapper.find('.v-alert').exists()).toBe(false);
    });
});
