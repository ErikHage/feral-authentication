import { flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mountWithPlugins } from '../../../helpers/mount';
import { buttonLabelled, fieldLabelled, inputLabelled } from '../../../helpers/fields';
import { dialogTitled, findDialog } from '../../../helpers/dialogs';
import { rowWith, tableHeaders, tableRows } from '../../../helpers/tables';
import UsersAdmin from '@/views/admin/UsersAdmin.vue';
import { useUsersStore } from '@/store';

// As usersApi.fetchUsers maps them
const alice = {
    userId: 'user-1', firstName: 'Alice', lastName: 'Smith', email: 'alice@example.test',
    username: 'alice', lastLogin: '2026-10-01T12:00:00Z', isSuspended: 'N',
};
const bob = {
    userId: 'user-2', firstName: 'Bob', lastName: 'Jones', email: 'bob@example.test',
    username: 'bob', lastLogin: '-', isSuspended: 'Y',
};

const formLabels = ['First Name', 'Last Name', 'Email', 'Username', 'Password'];

async function mountPage({ state = {} } = {}) {
    const pinia = createTestingPinia({ initialState: { user: { users: [alice, bob], ...state } } });
    const wrapper = mountWithPlugins(UsersAdmin, { attachTo: document.body, global: { plugins: [pinia] } });
    await flushPromises();

    return { wrapper, store: useUsersStore(pinia) };
}

async function click(target) {
    await target.trigger('click');
    await flushPromises();
}

const formValues = dialog => formLabels.map(label => inputLabelled(dialog, label).element.value);

// Types each [label, value] in turn
async function fillIn(dialog, entries) {
    for (const [label, value] of entries) {
        await inputLabelled(dialog, label).setValue(value);
    }
    await flushPromises();
}

const carol = [
    ['First Name', 'Carol'], ['Last Name', 'White'], ['Email', 'carol@example.test'],
    ['Username', 'carol'], ['Password', 'secret'],
];

describe('UsersAdmin', () => {
    it('loads the users', async () => {
        const { store } = await mountPage();

        expect(store.fetchUsers).toHaveBeenCalledTimes(1);
    });

    it('lists the users', async () => {
        const { wrapper } = await mountPage();

        expect(tableHeaders(wrapper)).toEqual(
            ['First Name', 'Last Name', 'Username', 'Email', 'Last Login', 'Suspended', 'Actions']);
        expect(tableRows(wrapper)).toEqual([
            ['Alice', 'Smith', 'alice', 'alice@example.test', '2026-10-01T12:00:00Z', 'N', ''],
            ['Bob', 'Jones', 'bob', 'bob@example.test', '-', 'Y', ''],
        ]);
    });

    it('reloads when Refresh is pressed', async () => {
        const { wrapper, store } = await mountPage();

        await click(buttonLabelled(wrapper, 'Refresh'));

        expect(store.fetchUsers).toHaveBeenCalledTimes(2);
    });

    it('shows the users store alert', async () => {
        const { wrapper } = await mountPage({
            state: { alertVisible: true, alertType: 'error', alertMessage: 'error adding user' },
        });

        expect(wrapper.find('.v-alert').text()).toContain('error adding user');
    });

    describe('adding a user', () => {
        it('opens an empty form', async () => {
            const { wrapper } = await mountPage();

            await click(buttonLabelled(wrapper, 'Add'));

            expect(formValues(dialogTitled('Add User'))).toEqual(['', '', '', '', '']);
        });

        it('adds the user, closes and reloads', async () => {
            const { wrapper, store } = await mountPage();
            await click(buttonLabelled(wrapper, 'Add'));
            const dialog = dialogTitled('Add User');
            await fillIn(dialog, carol);

            await click(buttonLabelled(dialog, 'Save'));

            expect(store.addUser).toHaveBeenCalledWith({
                userId: '', firstName: 'Carol', lastName: 'White',
                email: 'carol@example.test', username: 'carol', password: 'secret',
            });
            expect(store.fetchUsers).toHaveBeenCalledTimes(2);
            expect(findDialog('Add User')).toBeUndefined();
        });

        it('keeps Save disabled until every field is filled', async () => {
            const { wrapper } = await mountPage();
            await click(buttonLabelled(wrapper, 'Add'));
            const dialog = dialogTitled('Add User');
            const save = () => buttonLabelled(dialog, 'Save');
            expect(save().attributes('disabled')).toBeDefined();

            await fillIn(dialog, carol.slice(0, -1));
            expect(save().attributes('disabled')).toBeDefined();

            await fillIn(dialog, carol.slice(-1));
            expect(save().attributes('disabled')).toBeUndefined();
        });

        it('adds nothing from an empty form', async () => {
            const { wrapper, store } = await mountPage();
            await click(buttonLabelled(wrapper, 'Add'));

            await click(buttonLabelled(dialogTitled('Add User'), 'Save'));

            expect(store.addUser).not.toHaveBeenCalled();
        });

        it.each(formLabels)('says %s is required once it is cleared', async label => {
            const { wrapper } = await mountPage();
            await click(buttonLabelled(wrapper, 'Add'));
            const dialog = dialogTitled('Add User');

            await fillIn(dialog, [[label, 'x'], [label, '']]);

            expect(fieldLabelled(dialog, label).text()).toContain(`${label} is required`);
        });

        it('opens again without the last form\'s errors', async () => {
            const { wrapper } = await mountPage();
            await click(buttonLabelled(wrapper, 'Add'));
            await fillIn(dialogTitled('Add User'), [['First Name', 'x'], ['First Name', '']]);
            await click(buttonLabelled(dialogTitled('Add User'), 'Cancel'));

            await click(buttonLabelled(wrapper, 'Add'));

            expect(dialogTitled('Add User').text()).not.toContain('is required');
        });

        it('adds nothing when cancelled', async () => {
            const { wrapper, store } = await mountPage();
            await click(buttonLabelled(wrapper, 'Add'));

            await click(buttonLabelled(dialogTitled('Add User'), 'Cancel'));

            expect(store.addUser).not.toHaveBeenCalled();
            expect(findDialog('Add User')).toBeUndefined();
        });

        it('hides the password until its eye is clicked', async () => {
            const { wrapper } = await mountPage();
            await click(buttonLabelled(wrapper, 'Add'));
            const password = () => inputLabelled(dialogTitled('Add User'), 'Password');
            expect(password().attributes('type')).toBe('password');

            await click(fieldLabelled(dialogTitled('Add User'), 'Password').find('.mdi-eye-off'));

            expect(password().attributes('type')).toBe('text');
        });
    });

    describe('editing a user', () => {
        it("opens the form with the user's details, only the name editable, and no password", async () => {
            const { wrapper } = await mountPage();

            await click(rowWith(wrapper, 'bob').find('[aria-label="Edit bob"]'));

            const dialog = dialogTitled('Edit User');
            const details = ['First Name', 'Last Name', 'Email', 'Username']
                .map(label => [label, inputLabelled(dialog, label).element.value, inputLabelled(dialog, label).element.disabled]);
            expect(details).toEqual([
                ['First Name', 'Bob', false],
                ['Last Name', 'Jones', false],
                ['Email', 'bob@example.test', true],
                ['Username', 'bob', true],
            ]);
            expect(() => fieldLabelled(dialog, 'Password')).toThrow('no field labelled "Password"');
        });

        it('can be saved without a password', async () => {
            const { wrapper } = await mountPage();

            await click(rowWith(wrapper, 'bob').find('[aria-label="Edit bob"]'));

            expect(buttonLabelled(dialogTitled('Edit User'), 'Save').attributes('disabled')).toBeUndefined();
        });

        it("updates the user's name, closes and reloads", async () => {
            const { wrapper, store } = await mountPage();
            await click(rowWith(wrapper, 'bob').find('[aria-label="Edit bob"]'));
            await inputLabelled(dialogTitled('Edit User'), 'First Name').setValue('Robert');

            await click(buttonLabelled(dialogTitled('Edit User'), 'Save'));

            expect(store.updateUser).toHaveBeenCalledWith(expect.objectContaining({
                userId: 'user-2', firstName: 'Robert', lastName: 'Jones',
            }));
            expect(store.addUser).not.toHaveBeenCalled();
            expect(store.fetchUsers).toHaveBeenCalledTimes(2);
            expect(findDialog('Edit User')).toBeUndefined();
        });

        it('opens an empty Add form after an edit', async () => {
            const { wrapper } = await mountPage();
            await click(rowWith(wrapper, 'bob').find('[aria-label="Edit bob"]'));
            await click(buttonLabelled(dialogTitled('Edit User'), 'Cancel'));

            await click(buttonLabelled(wrapper, 'Add'));

            expect(formValues(dialogTitled('Add User'))).toEqual(['', '', '', '', '']);
        });
    });

    describe('deleting a user', () => {
        it('asks first, naming the user', async () => {
            const { wrapper } = await mountPage();

            await click(rowWith(wrapper, 'bob').find('[aria-label="Delete bob"]'));

            const dialog = dialogTitled('Delete User');
            expect(tableRows(dialog)).toEqual([['bob']]);
            expect(dialog.text()).toContain('Are you sure? This cannot be undone!');
        });

        it('deletes the user, closes and reloads', async () => {
            const { wrapper, store } = await mountPage();
            await click(rowWith(wrapper, 'bob').find('[aria-label="Delete bob"]'));

            await click(buttonLabelled(dialogTitled('Delete User'), 'Delete'));

            expect(store.deleteUser).toHaveBeenCalledWith('user-2');
            expect(store.fetchUsers).toHaveBeenCalledTimes(2);
            expect(findDialog('Delete User')).toBeUndefined();
        });

        it('deletes nothing when cancelled', async () => {
            const { wrapper, store } = await mountPage();
            await click(rowWith(wrapper, 'bob').find('[aria-label="Delete bob"]'));

            await click(buttonLabelled(dialogTitled('Delete User'), 'Cancel'));

            expect(store.deleteUser).not.toHaveBeenCalled();
            expect(findDialog('Delete User')).toBeUndefined();
        });
    });
});
