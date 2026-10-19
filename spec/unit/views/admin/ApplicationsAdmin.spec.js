import { flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mountWithPlugins } from '../../../helpers/mount';
import { buttonLabelled, inputLabelled } from '../../../helpers/fields';
import { dialogTitled, findDialog } from '../../../helpers/dialogs';
import { rowWith, tableHeaders, tableRows } from '../../../helpers/tables';
import ApplicationsAdmin from '@/views/admin/ApplicationsAdmin.vue';
import { useApplicationsStore, useKeysStore } from '@/store';

const feral = {
    applicationId: 'app-1', applicationName: 'Feral', applicationUrl: 'https://feral.test',
    scope: 'feral', keyPairId: 'key-2', previousKeyPairId: 'key-1',
};
const harvest = {
    applicationId: 'app-2', applicationName: 'Harvest', applicationUrl: 'https://harvest.test',
    scope: 'harvest', keyPairId: 'key-1', previousKeyPairId: null,
};
const keys = [
    { keyId: 'key-1', keyName: 'first' },
    { keyId: 'key-2', keyName: 'second' },
];

async function mountPage({ state = {} } = {}) {
    const router = { push: vi.fn() };
    const pinia = createTestingPinia({
        initialState: {
            application: { applications: [feral, harvest], ...state },
            key: { availableKeys: keys },
        },
    });
    const wrapper = mountWithPlugins(ApplicationsAdmin, {
        attachTo: document.body,
        global: { plugins: [pinia], mocks: { $router: router } },
    });
    await flushPromises();

    return { wrapper, router, applicationsStore: useApplicationsStore(pinia), keysStore: useKeysStore(pinia) };
}

async function click(target) {
    await target.trigger('click');
    await flushPromises();
}

async function openAddDialog(wrapper) {
    await click(buttonLabelled(wrapper, 'Add'));
    return dialogTitled('Add Application');
}

describe('ApplicationsAdmin', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('loads the applications and the keys', async () => {
        const { applicationsStore, keysStore } = await mountPage();

        expect(applicationsStore.fetchApplications).toHaveBeenCalledTimes(1);
        expect(keysStore.fetchKeys).toHaveBeenCalledTimes(1);
    });

    it('lists the applications', async () => {
        const { wrapper } = await mountPage();

        expect(tableHeaders(wrapper)).toEqual(
            ['Application Name', 'Application Url', 'Scope', 'Key Id', 'Prev Key Id', 'Actions']);
        expect(tableRows(wrapper)).toEqual([
            ['Feral', 'https://feral.test', 'feral', 'key-2', 'key-1', ''],
            ['Harvest', 'https://harvest.test', 'harvest', 'key-1', '', ''],
        ]);
    });

    it("opens an application's details from its pencil", async () => {
        const { wrapper, router } = await mountPage();

        await click(rowWith(wrapper, 'Harvest').find('.mdi-pencil'));

        expect(router.push).toHaveBeenCalledWith('/admin/applications/app-2');
    });

    it('reloads when Refresh is pressed', async () => {
        const { wrapper, applicationsStore, keysStore } = await mountPage();

        await click(buttonLabelled(wrapper, 'Refresh'));

        expect(applicationsStore.fetchApplications).toHaveBeenCalledTimes(2);
        expect(keysStore.fetchKeys).toHaveBeenCalledTimes(2);
    });

    it('shows the applications store alert', async () => {
        const { wrapper } = await mountPage({
            state: { alertVisible: true, alertType: 'error', alertMessage: 'Request failed with status code 500' },
        });

        expect(wrapper.find('.v-alert').text()).toContain('Request failed with status code 500');
    });

    describe('adding an application', () => {
        it('opens an empty form, offering every key', async () => {
            const { wrapper } = await mountPage();

            const dialog = await openAddDialog(wrapper);

            expect(['Name', 'Url', 'Scope'].map(label => inputLabelled(dialog, label).element.value))
                .toEqual(['', '', '']);
            expect(wrapper.findComponent({ name: 'VAutocomplete' }).props('items')).toEqual(keys);
        });

        it('creates the application, reloads and closes', async () => {
            const { wrapper, applicationsStore } = await mountPage();
            const dialog = await openAddDialog(wrapper);
            await inputLabelled(dialog, 'Name').setValue('Recipes');
            await inputLabelled(dialog, 'Url').setValue('https://recipes.test');
            await inputLabelled(dialog, 'Scope').setValue('recipes');
            await wrapper.findComponent({ name: 'VAutocomplete' }).setValue('key-2');

            await click(buttonLabelled(dialogTitled('Add Application'), 'Create'));

            expect(applicationsStore.createApplication).toHaveBeenCalledWith({
                applicationName: 'Recipes', applicationUrl: 'https://recipes.test', scope: 'recipes', keyPairId: 'key-2',
            });
            expect(applicationsStore.fetchApplications).toHaveBeenCalledTimes(2);
            expect(findDialog('Add Application')).toBeUndefined();
        });

        it('creates an empty application', async () => {
            // current behavior: the fields are marked `required`, but the form has no
            // rules, so it is always valid
            const { wrapper, applicationsStore } = await mountPage();
            await openAddDialog(wrapper);

            await click(buttonLabelled(dialogTitled('Add Application'), 'Create'));

            expect(applicationsStore.createApplication).toHaveBeenCalledWith({
                applicationName: '', applicationUrl: '', scope: '', keyPairId: '',
            });
        });

        it('creates nothing when cancelled', async () => {
            const { wrapper, applicationsStore } = await mountPage();
            await openAddDialog(wrapper);

            await click(buttonLabelled(dialogTitled('Add Application'), 'Cancel'));

            expect(applicationsStore.createApplication).not.toHaveBeenCalled();
            expect(findDialog('Add Application')).toBeUndefined();
        });

        it('starts empty again after being cancelled', async () => {
            const { wrapper } = await mountPage();
            const dialog = await openAddDialog(wrapper);
            await inputLabelled(dialog, 'Name').setValue('Recipes');
            await click(buttonLabelled(dialog, 'Cancel'));

            const reopened = await openAddDialog(wrapper);

            expect(inputLabelled(reopened, 'Name').element.value).toBe('');
        });
    });
});
