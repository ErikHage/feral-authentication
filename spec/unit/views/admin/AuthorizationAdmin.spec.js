import { flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mountWithPlugins } from '../../../helpers/mount';
import { buttonLabelled } from '../../../helpers/fields';
import AuthorizationAdmin from '@/views/admin/AuthorizationAdmin.vue';
import { useApplicationsStore, useRolesStore, useUsersStore } from '@/store';

const alice = { userId: 'user-1', username: 'alice' };
const bob = { userId: 'user-2', username: 'bob' };

const feralAdmin = { roleId: 'role-1', scope: 'feral', title: 'admin' };
const harvestUser = { roleId: 'role-2', scope: 'harvest', title: 'user' };

const feral = { applicationId: 'app-1', applicationName: 'Feral' };
const harvest = { applicationId: 'app-2', applicationName: 'Harvest' };

// Bob starts with the feral admin role and the Feral application
async function mountPage() {
    const pinia = createTestingPinia({
        initialState: {
            user: { users: [alice, bob] },
            role: { roles: [feralAdmin, harvestUser] },
            application: { applications: [feral, harvest] },
        },
    });
    const usersStore = useUsersStore(pinia);
    usersStore.selectUser.mockImplementation(async userId => {
        usersStore.selectedUser = {
            details: usersStore.users.find(user => user.userId === userId),
            roles: userId === 'user-2' ? [feralAdmin] : [],
            applications: userId === 'user-2' ? [feral] : [],
        };
    });
    usersStore.clearSelectedUser.mockImplementation(() => { usersStore.selectedUser = null; });

    const wrapper = mountWithPlugins(AuthorizationAdmin, { global: { plugins: [pinia] } });
    await flushPromises();

    return {
        wrapper,
        usersStore,
        rolesStore: useRolesStore(pinia),
        applicationsStore: useApplicationsStore(pinia),
    };
}

const selectLabelled = (wrapper, label) => wrapper.findAllComponents({ name: 'VSelect' })
    .find(select => select.props('label') === label);

const cardTitled = (wrapper, title) => wrapper.findAll('.v-card')
    .find(card => card.find('.v-card-title').text() === title);

const chips = card => card.findAll('.v-chip').map(chip => chip.text());

async function chooseUser(wrapper, userId) {
    await selectLabelled(wrapper, 'Select User').setValue(userId);
    await flushPromises();
}

async function choose(wrapper, label, item) {
    await selectLabelled(wrapper, label).setValue(item);
    await flushPromises();
}

async function click(target) {
    await target.trigger('click');
    await flushPromises();
}

const plusButton = card => card.findAll('.v-btn').find(button => button.find('.mdi-plus').exists());

describe('AuthorizationAdmin', () => {
    it('loads the users, roles and applications, with no user selected', async () => {
        const { usersStore, rolesStore, applicationsStore } = await mountPage();

        expect(usersStore.fetchUsers).toHaveBeenCalledTimes(1);
        expect(rolesStore.fetchRoles).toHaveBeenCalledTimes(1);
        expect(applicationsStore.fetchApplications).toHaveBeenCalledTimes(1);
        expect(usersStore.clearSelectedUser).toHaveBeenCalledTimes(1);
    });

    it('offers every user by username', async () => {
        const { wrapper } = await mountPage();

        const select = selectLabelled(wrapper, 'Select User');
        expect(select.props('items')).toEqual([alice, bob]);
        expect(select.props('itemTitle')).toBe('username');
    });

    it('shows nothing to manage until a user is chosen', async () => {
        const { wrapper } = await mountPage();

        expect(cardTitled(wrapper, 'Manage Applications')).toBeUndefined();
        expect(cardTitled(wrapper, 'Manage Roles')).toBeUndefined();
    });

    it("shows the chosen user's applications and roles as chips", async () => {
        const { wrapper, usersStore } = await mountPage();

        await chooseUser(wrapper, 'user-2');

        expect(usersStore.selectUser).toHaveBeenCalledWith('user-2');
        expect(chips(cardTitled(wrapper, 'Manage Applications'))).toEqual(['Feral']);
        expect(chips(cardTitled(wrapper, 'Manage Roles'))).toEqual(['feral/admin']);
    });

    it('names roles by scope and title', async () => {
        const { wrapper } = await mountPage();
        await chooseUser(wrapper, 'user-2');

        const select = selectLabelled(wrapper, 'Select Role To Add');
        expect(select.props('itemTitle')(harvestUser)).toBe('harvest/user');
    });

    describe.each([
        {
            kind: 'applications',
            card: 'Manage Applications',
            select: 'Select Application To Add',
            held: feral,
            other: harvest,
            heldChip: 'Feral',
            otherChip: 'Harvest',
            set: 'setUserApplications',
            clear: 'clearUserApplications',
            ids: ['app-1', 'app-2'],
        },
        {
            kind: 'roles',
            card: 'Manage Roles',
            select: 'Select Role To Add',
            held: feralAdmin,
            other: harvestUser,
            heldChip: 'feral/admin',
            otherChip: 'harvest/user',
            set: 'setUserRoles',
            clear: 'clearUserRoles',
            ids: ['role-1', 'role-2'],
        },
    ])('managing $kind', ({ card, select, held, other, heldChip, otherChip, set, clear, ids }) => {
        it('cannot add before one is chosen', async () => {
            const { wrapper } = await mountPage();
            await chooseUser(wrapper, 'user-2');

            expect(plusButton(cardTitled(wrapper, card)).attributes('disabled')).toBeDefined();
        });

        it('cannot add one the user already has', async () => {
            const { wrapper } = await mountPage();
            await chooseUser(wrapper, 'user-2');

            await choose(wrapper, select, held);

            expect(plusButton(cardTitled(wrapper, card)).attributes('disabled')).toBeDefined();
        });

        it('adds the chosen one as a chip, and clears the choice', async () => {
            const { wrapper } = await mountPage();
            await chooseUser(wrapper, 'user-2');
            await choose(wrapper, select, other);

            await click(plusButton(cardTitled(wrapper, card)));

            expect(chips(cardTitled(wrapper, card))).toEqual([heldChip, otherChip]);
            expect(selectLabelled(wrapper, select).props('modelValue')).toBeNull();
        });

        it('removes one when its chip is clicked', async () => {
            const { wrapper } = await mountPage();
            await chooseUser(wrapper, 'user-2');

            await click(cardTitled(wrapper, card).find('.v-chip'));

            expect(chips(cardTitled(wrapper, card))).toEqual([]);
        });

        it('saves the chips, reloads and deselects the user', async () => {
            const { wrapper, usersStore } = await mountPage();
            await chooseUser(wrapper, 'user-2');
            await choose(wrapper, select, other);
            await click(plusButton(cardTitled(wrapper, card)));

            await click(buttonLabelled(cardTitled(wrapper, card), 'Save'));

            expect(usersStore[set]).toHaveBeenCalledWith('user-2', ids);
            expect(usersStore.fetchUsers).toHaveBeenCalledTimes(2);
            expect(cardTitled(wrapper, card)).toBeUndefined();
            expect(selectLabelled(wrapper, 'Select User').props('modelValue')).toBeNull();
        });

        it('clears them when no chips are left', async () => {
            const { wrapper, usersStore } = await mountPage();
            await chooseUser(wrapper, 'user-2');
            await click(cardTitled(wrapper, card).find('.v-chip'));

            await click(buttonLabelled(cardTitled(wrapper, card), 'Save'));

            expect(usersStore[clear]).toHaveBeenCalledWith('user-2');
            expect(usersStore[set]).not.toHaveBeenCalled();
        });

        it('saves nothing and deselects the user when cancelled', async () => {
            const { wrapper, usersStore } = await mountPage();
            await chooseUser(wrapper, 'user-2');
            await choose(wrapper, select, other);
            await click(plusButton(cardTitled(wrapper, card)));

            await click(buttonLabelled(cardTitled(wrapper, card), 'Cancel'));

            expect(usersStore[set]).not.toHaveBeenCalled();
            expect(usersStore[clear]).not.toHaveBeenCalled();
            expect(cardTitled(wrapper, card)).toBeUndefined();
        });
    });

    it('adds to the selected user in the store before saving', async () => {
        // current behavior: the chips are the store's own arrays, so adding one changes
        // selectedUser before anything is saved
        const { wrapper, usersStore } = await mountPage();
        await chooseUser(wrapper, 'user-2');
        await choose(wrapper, 'Select Role To Add', harvestUser);

        await click(plusButton(cardTitled(wrapper, 'Manage Roles')));

        expect(usersStore.selectedUser.roles).toEqual([feralAdmin, harvestUser]);
    });

    it('cancelling either card discards the changes to both', async () => {
        // current behavior: both Cancel buttons reset the whole page
        const { wrapper, usersStore } = await mountPage();
        await chooseUser(wrapper, 'user-2');
        await choose(wrapper, 'Select Role To Add', harvestUser);
        await click(plusButton(cardTitled(wrapper, 'Manage Roles')));

        await click(buttonLabelled(cardTitled(wrapper, 'Manage Applications'), 'Cancel'));

        expect(cardTitled(wrapper, 'Manage Roles')).toBeUndefined();
        expect(usersStore.setUserRoles).not.toHaveBeenCalled();
    });
});
