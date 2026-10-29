import { flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mountWithPlugins } from '../../../helpers/mount';
import { buttonLabelled, fieldLabelled, inputLabelled, typeInto } from '../../../helpers/fields';
import UserProfile from '@/views/dashboard/UserProfile.vue';
import { useUsersStore } from '@/store';

const alice = {
    userId: 'user-1',
    firstName: 'Alice',
    lastName: 'Smith',
    username: 'alice',
    email: 'alice@example.test',
    lastLogin: '2026-10-01T12:00:00Z',
    isSuspended: 'N',
};
const roles = [
    { roleId: 'role-1', scope: 'feral', title: 'admin' },
    { roleId: 'role-2', scope: 'feral', title: 'user' },
    { roleId: 'role-3', scope: 'harvest', title: 'user' },
];

async function mountProfile({ state = {} } = {}) {
    const pinia = createTestingPinia({ initialState: { user: state } });
    const usersStore = useUsersStore(pinia);
    usersStore.loadCurrentUser.mockImplementation(async () => {
        usersStore.currentUser = {
            // A copy, so a test that changes the stored user can't change the next one's
            details: { ...alice },
            roles,
            rolesByScope: { feral: roles.slice(0, 2), harvest: roles.slice(2) },
        };
    });

    const wrapper = mountWithPlugins(UserProfile, { global: { plugins: [pinia] } });
    await flushPromises();

    return { wrapper, usersStore };
}

describe('UserProfile', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('loads the logged-in user', async () => {
        const { usersStore } = await mountProfile();

        expect(usersStore.loadCurrentUser).toHaveBeenCalledTimes(1);
    });

    it("is headed with the user's name", async () => {
        const { wrapper } = await mountProfile();

        expect(wrapper.find('h2').text()).toBe('Alice Smith');
    });

    it('shows the personal details, with only the name editable', async () => {
        const { wrapper } = await mountProfile();

        const details = ['First Name', 'Last Name', 'Username', 'Email', 'Last Login', 'Suspended']
            .map(label => [label, inputLabelled(wrapper, label).element.value, inputLabelled(wrapper, label).element.disabled]);
        expect(details).toEqual([
            ['First Name', 'Alice', false],
            ['Last Name', 'Smith', false],
            ['Username', 'alice', true],
            ['Email', 'alice@example.test', true],
            ['Last Login', '2026-10-01T12:00:00Z', true],
            ['Suspended', 'N', true],
        ]);
    });

    it("shows the user's roles as chips, grouped by scope", async () => {
        const { wrapper } = await mountProfile();

        const scopes = wrapper.findAll('.v-card--variant-tonal').map(card => [
            card.find('.v-card-subtitle').text(),
            card.findAll('.v-chip').map(chip => chip.text()),
        ]);
        expect(scopes).toEqual([
            ['feral', ['admin', 'user']],
            ['harvest', ['user']],
        ]);
    });

    describe('saving', () => {
        it('is not possible before anything is changed', async () => {
            const { wrapper } = await mountProfile();

            expect(buttonLabelled(wrapper, 'Save').attributes('disabled')).toBeDefined();
        });

        it('is possible once a valid name is typed', async () => {
            const { wrapper } = await mountProfile();

            await typeInto(wrapper, 'First Name', 'Alicia');

            expect(buttonLabelled(wrapper, 'Save').attributes('disabled')).toBeUndefined();
        });

        it('is not possible once the name is typed back as it was', async () => {
            const { wrapper } = await mountProfile();
            await typeInto(wrapper, 'First Name', 'Alicia');

            await typeInto(wrapper, 'First Name', 'Alice');

            expect(buttonLabelled(wrapper, 'Save').attributes('disabled')).toBeDefined();
        });

        it.each(['First Name', 'Last Name'])('is not possible with an empty %s', async label => {
            const { wrapper } = await mountProfile();

            await typeInto(wrapper, label, '');

            expect(buttonLabelled(wrapper, 'Save').attributes('disabled')).toBeDefined();
            expect(fieldLabelled(wrapper, label).text()).toContain('Field is required');
        });

        it('saves the new name, then reloads', async () => {
            const { wrapper, usersStore } = await mountProfile();
            usersStore.updateCurrentUser.mockResolvedValue(true);
            await typeInto(wrapper, 'First Name', 'Alicia');

            await buttonLabelled(wrapper, 'Save').trigger('click');
            await flushPromises();

            expect(usersStore.updateCurrentUser).toHaveBeenCalledWith({ firstName: 'Alicia', lastName: 'Smith' });
            expect(usersStore.loadCurrentUser).toHaveBeenCalledTimes(2);
        });

        it('keeps the change when the save fails', async () => {
            const { wrapper, usersStore } = await mountProfile();
            usersStore.updateCurrentUser.mockResolvedValue(false);
            await typeInto(wrapper, 'First Name', 'Alicia');

            await buttonLabelled(wrapper, 'Save').trigger('click');
            await flushPromises();

            expect(usersStore.loadCurrentUser).toHaveBeenCalledTimes(1);
            expect(inputLabelled(wrapper, 'First Name').element.value).toBe('Alicia');
            expect(buttonLabelled(wrapper, 'Save').attributes('disabled')).toBeUndefined();
        });

        it('keeps the stored user, and the heading, as they are until saved', async () => {
            const { wrapper, usersStore } = await mountProfile();

            await typeInto(wrapper, 'First Name', 'Alicia');

            expect(wrapper.find('h2').text()).toBe('Alice Smith');
            expect(usersStore.currentUser.details.firstName).toBe('Alice');
            expect(usersStore.updateCurrentUser).not.toHaveBeenCalled();
        });
    });

    it("shows only the alert when the user can't be loaded", async () => {
        const pinia = createTestingPinia({
            initialState: {
                user: { alertVisible: true, alertType: 'error', alertMessage: "Couldn't load your profile: the service failed (500)" },
            },
        });

        const wrapper = mountWithPlugins(UserProfile, { global: { plugins: [pinia] } });
        await flushPromises();

        expect(wrapper.find('h2').exists()).toBe(false);
        expect(wrapper.find('.v-alert').text()).toContain("Couldn't load your profile: the service failed (500)");
    });

    it('shows the users store alert', async () => {
        const { wrapper } = await mountProfile({
            state: { alertVisible: true, alertType: 'success', alertMessage: 'User updated successfully!' },
        });

        expect(wrapper.find('.v-alert').text()).toContain('User updated successfully!');
    });
});
