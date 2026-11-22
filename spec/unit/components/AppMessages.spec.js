import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { mountWithPlugins } from '../../helpers/mount';
import AppMessages from '@/components/AppMessages.vue';
import { notify, useNotificationsStore } from '@/store/notifications';

// Snackbars render in Vuetify's overlay container, outside the wrapper. A
// dismissed one stays there, hidden, as jsdom never finishes its transition
const snackbars = () => [...document.body.querySelectorAll('.v-snackbar--active')];
const shownText = () => snackbars().map(snackbar => snackbar.querySelector('.v-snackbar__content').textContent.trim());

describe('AppMessages', () => {
    let pinia;

    beforeEach(() => {
        vi.useFakeTimers();
        pinia = createPinia();
        setActivePinia(pinia);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const mountMessages = () => mountWithPlugins(AppMessages, { attachTo: document.body, global: { plugins: [pinia] } });

    it('shows a message as a snackbar coloured by its type, and takes it off the queue', async () => {
        mountMessages();

        notify('error', "Couldn't add the role feral/admin: it already exists");
        await flushPromises();

        expect(shownText()).toEqual(["Couldn't add the role feral/admin: it already exists"]);
        expect(snackbars()[0].querySelector('.v-snackbar__wrapper').classList).toContain('bg-error');
        expect(useNotificationsStore().messages).toEqual([]);
    });

    it('holds a second message until the first has gone', async () => {
        mountMessages();

        notify('success', 'Role feral/admin Added');
        notify('success', 'Role Deleted.');
        await flushPromises();

        expect(shownText()).toEqual(['Role feral/admin Added']);
        expect(useNotificationsStore().messages).toEqual([{ color: 'success', text: 'Role Deleted.' }]);
    });

    it('lets each message go after 3 seconds', async () => {
        mountMessages();
        notify('success', 'Role Deleted.');
        await flushPromises();

        await vi.advanceTimersByTimeAsync(2900);
        expect(shownText()).toEqual(['Role Deleted.']);

        await vi.advanceTimersByTimeAsync(200);
        expect(shownText()).toEqual([]);
    });

    it('dismisses the message showing when the messages are cleared', async () => {
        mountMessages();
        notify('success', 'User updated successfully!');
        await flushPromises();

        useNotificationsStore().clear();
        await vi.advanceTimersByTimeAsync(0);

        expect(shownText()).toEqual([]);
    });
});
