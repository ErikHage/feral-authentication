import { flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mountWithPlugins } from '../../../helpers/mount';
import { buttonLabelled, fieldLabelled, inputLabelled } from '../../../helpers/fields';
import { dialogTitled, findDialog } from '../../../helpers/dialogs';
import ApplicationDetails from '@/views/admin/ApplicationDetails.vue';
import { useApplicationsStore, useKeysStore } from '@/store';

const keys = [
    { keyId: 'key-1', keyName: 'first' },
    { keyId: 'key-2', keyName: 'second' },
    { keyId: 'key-3', keyName: 'third' },
];
const rotated = {
    applicationId: 'app-1', applicationName: 'Feral', applicationUrl: 'https://feral.test',
    scope: 'feral', keyPairId: 'key-2', previousKeyPairId: 'key-1',
};
const neverRotated = {
    applicationId: 'app-2', applicationName: 'Harvest', applicationUrl: 'https://harvest.test',
    scope: 'harvest', keyPairId: 'key-1', previousKeyPairId: null,
};

async function mountDetails(applicationId = 'app-1', { state = {} } = {}) {
    // Copies: the form edits the selected application in place
    const pinia = createTestingPinia({
        initialState: {
            application: { applications: [{ ...rotated }, { ...neverRotated }], ...state },
            key: { availableKeys: keys },
        },
    });
    const applicationsStore = useApplicationsStore(pinia);
    applicationsStore.selectApplication.mockImplementation(async id => {
        applicationsStore.selectedApplication = {
            applicationDetails: applicationsStore.applications.find(app => app.applicationId === id),
        };
    });

    const wrapper = mountWithPlugins(ApplicationDetails, {
        attachTo: document.body,
        global: { plugins: [pinia], mocks: { $route: { params: { id: applicationId } } } },
    });
    await flushPromises();

    return { wrapper, applicationsStore, keysStore: useKeysStore(pinia) };
}

async function click(target) {
    await target.trigger('click');
    await flushPromises();
}

async function typeInto(wrapper, label, value) {
    await inputLabelled(wrapper, label).setValue(value);
    await flushPromises();
}

const fieldLabels = wrapper => wrapper.findAll('.v-input label.v-label:not(.v-field-label--floating)')
    .map(label => label.text());

describe('ApplicationDetails', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('loads the keys and applications, then selects the one in the url', async () => {
        const { applicationsStore, keysStore } = await mountDetails('app-2');

        expect(keysStore.fetchKeys).toHaveBeenCalledTimes(1);
        expect(applicationsStore.fetchApplications).toHaveBeenCalledTimes(1);
        expect(applicationsStore.selectApplication).toHaveBeenCalledWith('app-2');
    });

    it('shows the details, with only the name, landing page and scope editable', async () => {
        const { wrapper } = await mountDetails();

        const details = ['Application Id', 'Application Name', 'Application Landing Page', 'Roles Scope', 'Key Pair Id']
            .map(label => [label, inputLabelled(wrapper, label).element.value, inputLabelled(wrapper, label).element.disabled]);
        expect(details).toEqual([
            ['Application Id', 'app-1', true],
            ['Application Name', 'Feral', false],
            ['Application Landing Page', 'https://feral.test', false],
            ['Roles Scope', 'feral', false],
            ['Key Pair Id', 'key-2', true],
        ]);
    });

    it('names the current and previous keys', async () => {
        const { wrapper } = await mountDetails();

        expect(inputLabelled(wrapper, 'Key Pair Name').element.value).toBe('second');
        expect(inputLabelled(wrapper, 'Previous Key Pair Id').element.value).toBe('key-1');
        expect(inputLabelled(wrapper, 'Previous Key Pair Name').element.value).toBe('first');
    });

    it('shows no previous key for an application never rotated', async () => {
        const { wrapper } = await mountDetails('app-2');

        expect(fieldLabels(wrapper)).toEqual([
            'Application Id', 'Application Name', 'Application Landing Page', 'Roles Scope',
            'Key Pair Id', 'Key Pair Name',
        ]);
    });

    it('shows the applications store alert', async () => {
        const { wrapper } = await mountDetails('app-1', {
            state: { alertVisible: true, alertType: 'success', alertMessage: 'Key Rotated!' },
        });

        expect(wrapper.find('.v-alert').text()).toContain('Key Rotated!');
    });

    it('reloads when Reset is pressed', async () => {
        const { wrapper, applicationsStore, keysStore } = await mountDetails();

        await click(buttonLabelled(wrapper, 'Reset'));

        expect(keysStore.fetchKeys).toHaveBeenCalledTimes(2);
        expect(applicationsStore.selectApplication).toHaveBeenCalledTimes(2);
    });

    describe('saving', () => {
        it('is not possible before anything is changed', async () => {
            const { wrapper } = await mountDetails();

            expect(buttonLabelled(wrapper, 'Save').attributes('disabled')).toBeDefined();
        });

        it('is possible once a valid change is typed', async () => {
            const { wrapper } = await mountDetails();

            await typeInto(wrapper, 'Roles Scope', 'feral-2');

            expect(buttonLabelled(wrapper, 'Save').attributes('disabled')).toBeUndefined();
        });

        it.each([
            ['Application Landing Page', 'applicationUrl is required'],
            ['Roles Scope', 'scope is required'],
        ])('is not possible with an empty %s', async (label, message) => {
            const { wrapper } = await mountDetails();

            await typeInto(wrapper, label, '');

            expect(fieldLabelled(wrapper, label).text()).toContain(message);
            expect(buttonLabelled(wrapper, 'Save').attributes('disabled')).toBeDefined();
        });

        it('is still possible with an empty name', async () => {
            // current behavior: as on the profile page, checkValidity runs before Vuetify
            // has updated the field typed in, and validates the name first, so it sees the
            // old value. The error shows, but Save stays enabled
            const { wrapper } = await mountDetails();

            await typeInto(wrapper, 'Application Name', '');

            expect(fieldLabelled(wrapper, 'Application Name').text()).toContain('applicationName is required');
            expect(buttonLabelled(wrapper, 'Save').attributes('disabled')).toBeUndefined();
        });

        it('saves nothing, only reloads', async () => {
            // current behavior: updateApplicationDetails is a TODO; there is no update
            // action in the store or the api
            const { wrapper, applicationsStore } = await mountDetails();
            await typeInto(wrapper, 'Roles Scope', 'feral-2');

            await click(buttonLabelled(wrapper, 'Save'));

            expect(applicationsStore.selectApplication).toHaveBeenCalledTimes(2);
            expect(buttonLabelled(wrapper, 'Save').attributes('disabled')).toBeDefined();
        });

        it('changes the stored application as it is typed, before saving', async () => {
            // current behavior: the form edits the store's application object directly
            const { wrapper, applicationsStore } = await mountDetails();

            await typeInto(wrapper, 'Roles Scope', 'feral-2');

            expect(applicationsStore.applications[0].scope).toBe('feral-2');
        });
    });

    describe('rotating the key', () => {
        it('offers every key but the current one', async () => {
            const { wrapper } = await mountDetails();

            await click(buttonLabelled(wrapper, 'Rotate Key'));

            expect(dialogTitled('Choose New Key').exists()).toBe(true);
            expect(wrapper.findComponent({ name: 'VAutocomplete' }).props('items').map(key => key.keyId))
                .toEqual(['key-1', 'key-3']);
        });

        it('rotates to the chosen key, closes and reloads', async () => {
            const { wrapper, applicationsStore } = await mountDetails();
            await click(buttonLabelled(wrapper, 'Rotate Key'));
            await wrapper.findComponent({ name: 'VAutocomplete' }).setValue('key-3');

            await click(buttonLabelled(dialogTitled('Choose New Key'), 'Save'));

            expect(applicationsStore.rotateAuthenticationKey).toHaveBeenCalledWith('app-1', 'key-3');
            expect(applicationsStore.selectApplication).toHaveBeenCalledTimes(2);
            expect(findDialog('Choose New Key')).toBeUndefined();
        });

        it('rotates to no key when none is chosen', async () => {
            // current behavior: the key is marked `required`, but nothing checks it
            const { wrapper, applicationsStore } = await mountDetails();
            await click(buttonLabelled(wrapper, 'Rotate Key'));

            await click(buttonLabelled(dialogTitled('Choose New Key'), 'Save'));

            expect(applicationsStore.rotateAuthenticationKey).toHaveBeenCalledWith('app-1', '');
        });

        it('rotates nothing when cancelled', async () => {
            const { wrapper, applicationsStore } = await mountDetails();
            await click(buttonLabelled(wrapper, 'Rotate Key'));

            await click(buttonLabelled(dialogTitled('Choose New Key'), 'Cancel'));

            expect(applicationsStore.rotateAuthenticationKey).not.toHaveBeenCalled();
            expect(findDialog('Choose New Key')).toBeUndefined();
        });
    });
});
