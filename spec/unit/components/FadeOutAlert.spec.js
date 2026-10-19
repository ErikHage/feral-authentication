import { mountWithPlugins } from '../../helpers/mount';
import FadeOutAlert from '@/components/FadeOutAlert.vue';

describe('FadeOutAlert', () => {
    it('shows the message with the alert type when visible', () => {
        const wrapper = mountWithPlugins(FadeOutAlert, {
            props: { isVisible: true, alertType: 'error', message: 'Something broke' },
        });

        const alert = wrapper.find('.v-alert');
        expect(alert.text()).toContain('Something broke');
        expect(alert.classes()).toContain('bg-error');
    });

    it('renders nothing when hidden', () => {
        const wrapper = mountWithPlugins(FadeOutAlert, {
            props: { isVisible: false, alertType: 'error', message: 'Something broke' },
        });

        expect(wrapper.find('.v-alert').exists()).toBe(false);
    });
});
