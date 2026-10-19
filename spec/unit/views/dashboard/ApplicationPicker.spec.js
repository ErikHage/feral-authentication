import { flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mountWithPlugins } from '../../../helpers/mount';
import ApplicationPicker from '@/views/dashboard/ApplicationPicker.vue';
import { useApplicationsStore, useAuthenticationStore } from '@/store';

const feral = { applicationId: 'app-1', applicationName: 'Feral' };
const harvest = { applicationId: 'app-2', applicationName: 'Harvest', mascotAssetPath: '/ai-owl.jpg' };

async function mountPicker(applications) {
    const pinia = createTestingPinia();
    const applicationsStore = useApplicationsStore(pinia);
    applicationsStore.fetchApplicationsForCurrentUser.mockImplementation(async () => {
        applicationsStore.userAllowedApplications = applications;
    });

    const wrapper = mountWithPlugins(ApplicationPicker, { global: { plugins: [pinia] } });
    await flushPromises();

    return { wrapper, applicationsStore, authenticationStore: useAuthenticationStore(pinia) };
}

describe('ApplicationPicker', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("loads the current user's applications", async () => {
        const { applicationsStore } = await mountPicker([feral]);

        expect(applicationsStore.fetchApplicationsForCurrentUser).toHaveBeenCalledTimes(1);
    });

    it('shows nothing until they have loaded', () => {
        const pinia = createTestingPinia();
        useApplicationsStore(pinia).fetchApplicationsForCurrentUser.mockReturnValue(new Promise(() => {}));

        const wrapper = mountWithPlugins(ApplicationPicker, { global: { plugins: [pinia] } });

        expect(wrapper.text()).toBe('');
    });

    it('shows a card per application', async () => {
        const { wrapper } = await mountPicker([feral, harvest]);

        expect(wrapper.find('h2').text()).toBe('Available Applications');
        expect(wrapper.findAll('.v-card-title').map(title => title.text())).toEqual(['Feral', 'Harvest']);
    });

    it("shows each application's mascot, or the default one", async () => {
        const { wrapper } = await mountPicker([feral, harvest]);

        const images = wrapper.findAllComponents({ name: 'VImg' }).map(image => image.props('src'));
        expect(images).toEqual(['/assets-test/default-mascot.jpg', '/assets-test/ai-owl.jpg']);
    });

    it('logs in to an application when its mascot is clicked, in this tab', async () => {
        const { wrapper, authenticationStore } = await mountPicker([feral, harvest]);

        await wrapper.findAllComponents({ name: 'VImg' })[1].trigger('click');

        // newTab is left out, so the store replaces this page
        expect(authenticationStore.loginToApplication).toHaveBeenCalledWith('app-2');
    });

    it('shows no cards, and no error, when there are no applications', async () => {
        // current behavior: the page has no alert, so a failed load (which leaves
        // the store's list empty) looks the same as having no applications
        const { wrapper } = await mountPicker([]);

        expect(wrapper.find('h2').text()).toBe('Available Applications');
        expect(wrapper.findAll('.v-card')).toHaveLength(0);
        expect(wrapper.find('.v-alert').exists()).toBe(false);
    });
});
