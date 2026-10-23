import { flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mountWithPlugins } from '../../../helpers/mount';
import { buttonLabelled, fieldLabelled, inputLabelled } from '../../../helpers/fields';
import { dialogTitled, findDialog } from '../../../helpers/dialogs';
import { tableHeaders, tableRows } from '../../../helpers/tables';
import KeysAdmin from '@/views/admin/KeysAdmin.vue';
import { useKeysStore } from '@/store';

const key1 = { keyId: 'key-1', keyName: 'first', expiration: '2027-01-01T00:00:00.000Z' };
const key2 = { keyId: 'key-2', keyName: 'second', expiration: '2027-06-01T00:00:00.000Z' };

async function mountPage({ state = {} } = {}) {
    const pinia = createTestingPinia({ initialState: { key: { availableKeys: [key1, key2], ...state } } });
    const wrapper = mountWithPlugins(KeysAdmin, { attachTo: document.body, global: { plugins: [pinia] } });
    await flushPromises();

    return { wrapper, store: useKeysStore(pinia) };
}

async function click(target) {
    await target.trigger('click');
    await flushPromises();
}

describe('KeysAdmin', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('loads the keys', async () => {
        const { store } = await mountPage();

        expect(store.fetchKeys).toHaveBeenCalledTimes(1);
    });

    it('lists the keys', async () => {
        const { wrapper } = await mountPage();

        expect(tableHeaders(wrapper)).toEqual(['Key Id', 'Key Name', 'Expiration']);
        expect(tableRows(wrapper)).toEqual([
            ['key-1', 'first', '2027-01-01T00:00:00.000Z'],
            ['key-2', 'second', '2027-06-01T00:00:00.000Z'],
        ]);
    });

    it('reloads when Refresh is pressed', async () => {
        const { wrapper, store } = await mountPage();

        await click(buttonLabelled(wrapper, 'Refresh'));

        expect(store.fetchKeys).toHaveBeenCalledTimes(2);
    });

    it('shows the keys store alert', async () => {
        const { wrapper } = await mountPage({
            state: { alertVisible: true, alertType: 'error', alertMessage: 'Request failed with status code 400' },
        });

        expect(wrapper.find('.v-alert').text()).toContain('Request failed with status code 400');
    });

    describe('generating a key', () => {
        it('opens an empty form, asking for a date and time', async () => {
            const { wrapper } = await mountPage();

            await click(buttonLabelled(wrapper, 'Generate'));

            const dialog = dialogTitled('Generate Key');
            expect(inputLabelled(dialog, 'Key Name').element.value).toBe('');
            expect(inputLabelled(dialog, 'Expiration Date').element.value).toBe('');
            expect(inputLabelled(dialog, 'Expiration Date').attributes('type')).toBe('datetime-local');
        });

        it('generates the key, closes and reloads', async () => {
            const { wrapper, store } = await mountPage();
            await click(buttonLabelled(wrapper, 'Generate'));
            const dialog = dialogTitled('Generate Key');
            await inputLabelled(dialog, 'Key Name').setValue('third');
            await inputLabelled(dialog, 'Expiration Date').setValue('2027-12-01T10:00');

            await click(buttonLabelled(dialog, 'Generate'));

            expect(store.generateKey).toHaveBeenCalledWith('third', '2027-12-01T10:00');
            expect(store.fetchKeys).toHaveBeenCalledTimes(2);
            expect(findDialog('Generate Key')).toBeUndefined();
        });

        it('keeps Generate disabled until both fields are filled', async () => {
            const { wrapper } = await mountPage();
            await click(buttonLabelled(wrapper, 'Generate'));
            const dialog = dialogTitled('Generate Key');
            const generate = () => buttonLabelled(dialog, 'Generate');
            expect(generate().attributes('disabled')).toBeDefined();

            await inputLabelled(dialog, 'Key Name').setValue('third');
            await flushPromises();
            expect(generate().attributes('disabled')).toBeDefined();

            await inputLabelled(dialog, 'Expiration Date').setValue('2027-12-01T10:00');
            await flushPromises();
            expect(generate().attributes('disabled')).toBeUndefined();
        });

        it('generates nothing from an empty form', async () => {
            const { wrapper, store } = await mountPage();
            await click(buttonLabelled(wrapper, 'Generate'));

            await click(buttonLabelled(dialogTitled('Generate Key'), 'Generate'));

            expect(store.generateKey).not.toHaveBeenCalled();
        });

        it.each([
            ['Key Name', 'third', 'Name is required'],
            ['Expiration Date', '2027-12-01T10:00', 'Expiration date is required'],
        ])('says the %s is required once it is cleared', async (label, value, message) => {
            const { wrapper } = await mountPage();
            await click(buttonLabelled(wrapper, 'Generate'));
            const dialog = dialogTitled('Generate Key');

            await inputLabelled(dialog, label).setValue(value);
            await inputLabelled(dialog, label).setValue('');
            await flushPromises();

            expect(fieldLabelled(dialog, label).text()).toContain(message);
        });

        it('opens again without the last form\'s errors', async () => {
            const { wrapper } = await mountPage();
            await click(buttonLabelled(wrapper, 'Generate'));
            await inputLabelled(dialogTitled('Generate Key'), 'Key Name').setValue('third');
            await inputLabelled(dialogTitled('Generate Key'), 'Key Name').setValue('');
            await click(buttonLabelled(dialogTitled('Generate Key'), 'Cancel'));

            await click(buttonLabelled(wrapper, 'Generate'));

            expect(dialogTitled('Generate Key').text()).not.toContain('is required');
        });

        it('generates nothing when cancelled', async () => {
            const { wrapper, store } = await mountPage();
            await click(buttonLabelled(wrapper, 'Generate'));

            await click(buttonLabelled(dialogTitled('Generate Key'), 'Cancel'));

            expect(store.generateKey).not.toHaveBeenCalled();
            expect(findDialog('Generate Key')).toBeUndefined();
        });
    });
});
