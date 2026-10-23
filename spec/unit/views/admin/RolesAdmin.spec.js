import { flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mountWithPlugins } from '../../../helpers/mount';
import { buttonLabelled, fieldLabelled, inputLabelled } from '../../../helpers/fields';
import { dialogTitled, findDialog } from '../../../helpers/dialogs';
import { rowWith, tableHeaders, tableRows } from '../../../helpers/tables';
import RolesAdmin from '@/views/admin/RolesAdmin.vue';
import { useRolesStore } from '@/store';

const admin = { roleId: 'role-1', scope: 'feral', title: 'admin', description: 'Administers feral' };
const user = { roleId: 'role-2', scope: 'harvest', title: 'user', description: 'Uses harvest' };

async function mountPage({ state = {} } = {}) {
    const pinia = createTestingPinia({ initialState: { role: { roles: [admin, user], ...state } } });
    const wrapper = mountWithPlugins(RolesAdmin, { attachTo: document.body, global: { plugins: [pinia] } });
    await flushPromises();

    return { wrapper, store: useRolesStore(pinia) };
}

async function click(target) {
    await target.trigger('click');
    await flushPromises();
}

async function fillIn(dialog, values) {
    for (const [label, value] of Object.entries(values)) {
        await inputLabelled(dialog, label).setValue(value);
    }
}

describe('RolesAdmin', () => {
    it('loads the roles', async () => {
        const { store } = await mountPage();

        expect(store.fetchRoles).toHaveBeenCalledTimes(1);
    });

    it('lists the roles', async () => {
        const { wrapper } = await mountPage();

        expect(tableHeaders(wrapper)).toEqual(['Scope', 'Title', 'Description', 'Actions']);
        expect(tableRows(wrapper)).toEqual([
            ['feral', 'admin', 'Administers feral', ''],
            ['harvest', 'user', 'Uses harvest', ''],
        ]);
    });

    it('reloads when Refresh is pressed', async () => {
        const { wrapper, store } = await mountPage();

        await click(buttonLabelled(wrapper, 'Refresh'));

        expect(store.fetchRoles).toHaveBeenCalledTimes(2);
    });

    it('shows the roles store alert', async () => {
        const { wrapper } = await mountPage({
            state: { alertVisible: true, alertType: 'success', alertMessage: 'Role Deleted.' },
        });

        expect(wrapper.find('.v-alert').text()).toContain('Role Deleted.');
    });

    describe('adding a role', () => {
        it('opens an empty form', async () => {
            const { wrapper } = await mountPage();

            await click(buttonLabelled(wrapper, 'Add'));

            const dialog = dialogTitled('Add Role');
            expect(['Scope', 'Title', 'Description'].map(label => inputLabelled(dialog, label).element.value))
                .toEqual(['', '', '']);
        });

        it('adds the role, reloads and closes', async () => {
            const { wrapper, store } = await mountPage();
            await click(buttonLabelled(wrapper, 'Add'));
            await fillIn(dialogTitled('Add Role'), { Scope: 'harvest', Title: 'admin', Description: 'Administers harvest' });

            await click(buttonLabelled(dialogTitled('Add Role'), 'Save'));

            expect(store.addRole).toHaveBeenCalledWith({ scope: 'harvest', title: 'admin', description: 'Administers harvest' });
            expect(store.fetchRoles).toHaveBeenCalledTimes(2);
            expect(findDialog('Add Role')).toBeUndefined();
        });

        it('keeps Save disabled until every field is filled', async () => {
            const { wrapper } = await mountPage();
            await click(buttonLabelled(wrapper, 'Add'));
            const dialog = dialogTitled('Add Role');
            const save = () => buttonLabelled(dialog, 'Save');
            expect(save().attributes('disabled')).toBeDefined();

            await fillIn(dialog, { Scope: 'harvest', Title: 'admin' });
            await flushPromises();
            expect(save().attributes('disabled')).toBeDefined();

            await fillIn(dialog, { Description: 'Administers harvest' });
            await flushPromises();
            expect(save().attributes('disabled')).toBeUndefined();
        });

        it('adds nothing from an empty form', async () => {
            const { wrapper, store } = await mountPage();
            await click(buttonLabelled(wrapper, 'Add'));

            await click(buttonLabelled(dialogTitled('Add Role'), 'Save'));

            expect(store.addRole).not.toHaveBeenCalled();
        });

        it.each(['Scope', 'Title', 'Description'])('says %s is required once it is cleared', async label => {
            const { wrapper } = await mountPage();
            await click(buttonLabelled(wrapper, 'Add'));
            const dialog = dialogTitled('Add Role');

            await fillIn(dialog, { [label]: 'x' });
            await fillIn(dialog, { [label]: '' });
            await flushPromises();

            expect(fieldLabelled(dialog, label).text()).toContain(`${label} is required`);
        });

        it('adds nothing when cancelled', async () => {
            const { wrapper, store } = await mountPage();
            await click(buttonLabelled(wrapper, 'Add'));
            await fillIn(dialogTitled('Add Role'), { Scope: 'harvest' });

            await click(buttonLabelled(dialogTitled('Add Role'), 'Cancel'));

            expect(store.addRole).not.toHaveBeenCalled();
            expect(findDialog('Add Role')).toBeUndefined();
        });

        it('starts empty again after being cancelled', async () => {
            const { wrapper } = await mountPage();
            await click(buttonLabelled(wrapper, 'Add'));
            await fillIn(dialogTitled('Add Role'), { Scope: 'harvest' });
            await click(buttonLabelled(dialogTitled('Add Role'), 'Cancel'));

            await click(buttonLabelled(wrapper, 'Add'));

            expect(inputLabelled(dialogTitled('Add Role'), 'Scope').element.value).toBe('');
        });

        it('opens again without the last form\'s errors', async () => {
            const { wrapper } = await mountPage();
            await click(buttonLabelled(wrapper, 'Add'));
            await fillIn(dialogTitled('Add Role'), { Scope: 'x' });
            await fillIn(dialogTitled('Add Role'), { Scope: '' });
            await click(buttonLabelled(dialogTitled('Add Role'), 'Cancel'));

            await click(buttonLabelled(wrapper, 'Add'));

            expect(dialogTitled('Add Role').text()).not.toContain('is required');
        });
    });

    describe('deleting a role', () => {
        it('asks first, naming the role', async () => {
            const { wrapper } = await mountPage();

            await click(rowWith(wrapper, 'harvest').find('.mdi-delete'));

            const dialog = dialogTitled('Delete Role');
            expect(tableRows(dialog)).toEqual([['harvest'], ['user']]);
            expect(dialog.text()).toContain('Are you sure? This cannot be undone!');
        });

        it('deletes the role, reloads and closes', async () => {
            const { wrapper, store } = await mountPage();
            await click(rowWith(wrapper, 'harvest').find('.mdi-delete'));

            await click(buttonLabelled(dialogTitled('Delete Role'), 'Delete'));

            expect(store.deleteRole).toHaveBeenCalledWith('role-2');
            expect(store.fetchRoles).toHaveBeenCalledTimes(2);
            expect(findDialog('Delete Role')).toBeUndefined();
        });

        it('deletes nothing when cancelled', async () => {
            const { wrapper, store } = await mountPage();
            await click(rowWith(wrapper, 'harvest').find('.mdi-delete'));

            await click(buttonLabelled(dialogTitled('Delete Role'), 'Cancel'));

            expect(store.deleteRole).not.toHaveBeenCalled();
            expect(findDialog('Delete Role')).toBeUndefined();
        });
    });
});
