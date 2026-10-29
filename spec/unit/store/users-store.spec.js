import { createPinia, setActivePinia } from 'pinia';
import { useUsersStore } from '@/store';
import usersApi from '@/api/users-api';
import { httpError } from '../../helpers/http-errors';

vi.mock('@/api/users-api', () => ({
    default: {
        fetchUsers: vi.fn(),
        fetchUser: vi.fn(),
        fetchCurrentUser: vi.fn(),
        fetchCurrentUserRoles: vi.fn(),
        updateCurrentUser: vi.fn(),
        addUser: vi.fn(),
        updateUser: vi.fn(),
        deleteUser: vi.fn(),
        fetchUserRoles: vi.fn(),
        setUserRoles: vi.fn(),
        clearUserRoles: vi.fn(),
        fetchUserApplications: vi.fn(),
        setUserApplications: vi.fn(),
        clearUserApplications: vi.fn(),
    },
}));

const alice = { userId: 'user-1', username: 'alice', firstName: 'Alice', lastName: 'Smith' };
const bob = { userId: 'user-2', username: 'bob', firstName: 'Bob', lastName: 'Jones' };

const feralAdmin = { roleId: 'role-1', scope: 'feral', title: 'admin' };
const feralUser = { roleId: 'role-2', scope: 'feral', title: 'user' };
const harvestUser = { roleId: 'role-3', scope: 'harvest', title: 'user' };

describe('useUsersStore', () => {
    let store;

    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem('feral-token', 'a-token');
        setActivePinia(createPinia());
        store = useUsersStore();
        vi.useFakeTimers();
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    it('starts with no users, none selected or current, and no alert', () => {
        expect(store.$state).toEqual({
            users: [],
            selectedUser: null,
            currentUser: null,
            loading: false,
            alertVisible: false,
            alertType: 'success',
            alertMessage: null,
        });
    });

    it('hides an alert after 3 seconds', () => {
        store.setAlertMessage('success', 'saved');

        vi.advanceTimersByTime(2999);
        expect(store.alertVisible).toBe(true);

        vi.advanceTimersByTime(1);
        expect(store.alertVisible).toBe(false);
    });

    describe('fetchUsers', () => {
        it('loads the users with the stored token', async () => {
            usersApi.fetchUsers.mockResolvedValue([alice, bob]);

            await store.fetchUsers();

            expect(usersApi.fetchUsers).toHaveBeenCalledWith('a-token');
            expect(store.users).toEqual([alice, bob]);
            expect(store.loading).toBe(false);
        });

        it('is loading while the users are fetched', async () => {
            let finish;
            usersApi.fetchUsers.mockReturnValue(new Promise(resolve => { finish = resolve; }));

            const fetching = store.fetchUsers();

            expect(store.loading).toBe(true);
            finish([]);
            await fetching;
            expect(store.loading).toBe(false);
        });

        it('says why when it fails', async () => {
            usersApi.fetchUsers.mockRejectedValue(httpError(403));

            await store.fetchUsers();

            expect(store.loading).toBe(false);
            expect(store.alertType).toBe('error');
            expect(store.alertMessage).toBe("Couldn't load the users: you don't have permission");
        });
    });

    describe.each([
        ['addUser', [alice], [alice], 'User added successfully!', "Couldn't add the user"],
        ['updateUser', [alice], [alice], 'User updated successfully!', "Couldn't update the user"],
        ['deleteUser', ['user-1'], ['user-1'], 'User deleted successfully.', "Couldn't delete the user"],
        ['setUserRoles', ['user-1', ['role-1']], ['user-1', ['role-1']], 'User Roles Updated!', "Couldn't update the user's roles"],
        ['clearUserRoles', ['user-1'], ['user-1'], 'User Roles Updated!', "Couldn't update the user's roles"],
        ['setUserApplications', ['user-1', ['app-1']], ['user-1', ['app-1']], 'User Applications Updated!', "Couldn't update the user's applications"],
        ['clearUserApplications', ['user-1'], ['user-1'], 'User Applications Updated!', "Couldn't update the user's applications"],
    ])('%s', (action, args, apiArgs, successMessage, whatFailed) => {
        it('calls the service with the stored token and says it succeeded', async () => {
            usersApi[action].mockResolvedValue({});

            await store[action](...args);

            expect(usersApi[action]).toHaveBeenCalledWith('a-token', ...apiArgs);
            expect(store.alertType).toBe('success');
            expect(store.alertMessage).toBe(successMessage);
        });

        it('says what failed, and why', async () => {
            usersApi[action].mockRejectedValue(httpError(500));

            await store[action](...args);

            expect(store.alertType).toBe('error');
            expect(store.alertMessage).toBe(`${whatFailed}: the service failed (500)`);
        });
    });

    // So the authorization page knows whether to reload the user, or keep its changes
    it.each(['setUserRoles', 'clearUserRoles', 'setUserApplications', 'clearUserApplications'])(
        '%s resolves to whether it saved', async action => {
            usersApi[action].mockResolvedValueOnce({}).mockRejectedValueOnce(httpError(500));

            await expect(store[action]('user-1', ['an-id'])).resolves.toBe(true);
            await expect(store[action]('user-1', ['an-id'])).resolves.toBe(false);
        });

    describe('selectUser', () => {
        beforeEach(() => {
            store.$patch({ users: [alice, bob] });
            usersApi.fetchUserRoles.mockResolvedValue({ roles: [feralAdmin, harvestUser, feralUser] });
            usersApi.fetchUserApplications.mockResolvedValue([{ applicationId: 'app-1' }]);
        });

        it("selects the user with their roles, grouped by scope, and their applications", async () => {
            await store.selectUser('user-2');

            expect(usersApi.fetchUserRoles).toHaveBeenCalledWith('a-token', 'user-2');
            expect(usersApi.fetchUserApplications).toHaveBeenCalledWith('a-token', 'user-2');
            expect(store.selectedUser).toEqual({
                details: bob,
                roles: [feralAdmin, harvestUser, feralUser],
                rolesByScope: {
                    feral: [feralAdmin, feralUser],
                    harvest: [harvestUser],
                },
                applications: [{ applicationId: 'app-1' }],
            });
        });

        it('selects a user with no roles', async () => {
            usersApi.fetchUserRoles.mockResolvedValue({ roles: [] });

            await store.selectUser('user-1');

            expect(store.selectedUser.rolesByScope).toEqual({});
        });

        it('takes the details of a loaded user from the list', async () => {
            await store.selectUser('user-2');

            expect(usersApi.fetchUser).not.toHaveBeenCalled();
        });

        it('fetches the details of a user it has not loaded', async () => {
            const carol = { userId: 'user-9', username: 'carol', firstName: 'Carol', lastName: 'White' };
            usersApi.fetchUser.mockResolvedValue(carol);

            await store.selectUser('user-9');

            expect(usersApi.fetchUser).toHaveBeenCalledWith('a-token', 'user-9');
            expect(store.selectedUser.details).toEqual(carol);
        });

        it('selects nothing, and says why, when the roles cannot be fetched', async () => {
            store.$patch({ selectedUser: { details: bob } });
            usersApi.fetchUserRoles.mockRejectedValue(httpError(403));

            await store.selectUser('user-1');

            expect(store.selectedUser).toBeNull();
            expect(store.alertType).toBe('error');
            expect(store.alertMessage).toBe("Couldn't load the user: you don't have permission");
        });

        // Choosing users in quick succession: alice's roles answer after bob's
        it('keeps the later choice when an earlier one answers last', async () => {
            let answerForAlice;
            usersApi.fetchUserRoles
                .mockReturnValueOnce(new Promise(resolve => { answerForAlice = resolve; }))
                .mockResolvedValueOnce({ roles: [feralAdmin] });

            const choosingAlice = store.selectUser('user-1');
            await store.selectUser('user-2');
            answerForAlice({ roles: [harvestUser] });
            await choosingAlice;

            expect(store.selectedUser.details).toEqual(bob);
            expect(store.selectedUser.roles).toEqual([feralAdmin]);
        });

        it('says nothing of an earlier choice that fails after a later one', async () => {
            let failForAlice;
            usersApi.fetchUserRoles
                .mockReturnValueOnce(new Promise((resolve, reject) => { failForAlice = reject; }));

            const choosingAlice = store.selectUser('user-1');
            await store.selectUser('user-2');
            failForAlice(httpError(500));
            await choosingAlice;

            expect(store.selectedUser.details).toEqual(bob);
            expect(store.alertVisible).toBe(false);
        });

        it('drops a choice still loading when the user is deselected', async () => {
            let answerForAlice;
            usersApi.fetchUserRoles
                .mockReturnValueOnce(new Promise(resolve => { answerForAlice = resolve; }));

            const choosingAlice = store.selectUser('user-1');
            store.clearSelectedUser();
            answerForAlice({ roles: [] });
            await choosingAlice;

            expect(store.selectedUser).toBeNull();
        });
    });

    describe('loadCurrentUser', () => {
        it('loads the logged-in user with their roles, grouped by scope', async () => {
            usersApi.fetchCurrentUser.mockResolvedValue(alice);
            usersApi.fetchCurrentUserRoles.mockResolvedValue({ userId: 'user-1', roles: [feralAdmin, harvestUser, feralUser] });

            await store.loadCurrentUser();

            expect(usersApi.fetchCurrentUser).toHaveBeenCalledWith('a-token');
            expect(usersApi.fetchCurrentUserRoles).toHaveBeenCalledWith('a-token');
            expect(store.currentUser).toEqual({
                details: alice,
                roles: [feralAdmin, harvestUser, feralUser],
                rolesByScope: {
                    feral: [feralAdmin, feralUser],
                    harvest: [harvestUser],
                },
            });
        });

        it('loads nothing, and says why, when it fails', async () => {
            store.$patch({ currentUser: { details: bob } });
            usersApi.fetchCurrentUser.mockResolvedValue(alice);
            usersApi.fetchCurrentUserRoles.mockRejectedValue(httpError(500));

            await store.loadCurrentUser();

            expect(store.currentUser).toBeNull();
            expect(store.alertType).toBe('error');
            expect(store.alertMessage).toBe("Couldn't load your profile: the service failed (500)");
        });
    });

    describe('updateCurrentUser', () => {
        const names = { firstName: 'Alicia', lastName: 'Smith' };

        it('saves the names with the stored token, says so, and resolves to true', async () => {
            usersApi.updateCurrentUser.mockResolvedValue({});

            await expect(store.updateCurrentUser(names)).resolves.toBe(true);

            expect(usersApi.updateCurrentUser).toHaveBeenCalledWith('a-token', names);
            expect(store.alertType).toBe('success');
            expect(store.alertMessage).toBe('User updated successfully!');
        });

        it('says what failed, and why, and resolves to false', async () => {
            usersApi.updateCurrentUser.mockRejectedValue(httpError(500));

            await expect(store.updateCurrentUser(names)).resolves.toBe(false);

            expect(store.alertType).toBe('error');
            expect(store.alertMessage).toBe("Couldn't save your details: the service failed (500)");
        });
    });

    it('clearSelectedUser deselects the user', () => {
        store.$patch({ selectedUser: { details: alice } });

        store.clearSelectedUser();

        expect(store.selectedUser).toBeNull();
    });
});
