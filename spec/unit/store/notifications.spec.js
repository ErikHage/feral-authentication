import { createPinia, setActivePinia } from 'pinia';
import { notify, useNotificationsStore } from '@/store/notifications';

describe('useNotificationsStore', () => {
    let store;

    beforeEach(() => {
        setActivePinia(createPinia());
        store = useNotificationsStore();
    });

    it('starts with nothing to say', () => {
        expect(store.messages).toEqual([]);
    });

    it('keeps each message, in order, coloured by its type', () => {
        notify('success', 'Role feral/admin Added');
        notify('error', "Couldn't delete the role: it wasn't found");

        expect(store.messages).toEqual([
            { color: 'success', text: 'Role feral/admin Added' },
            { color: 'error', text: "Couldn't delete the role: it wasn't found" },
        ]);
    });

    it('drops every message on clear, and counts the clear for the one showing', () => {
        notify('success', 'Role Deleted.');

        store.clear();

        expect(store.messages).toEqual([]);
        expect(store.clears).toBe(1);
    });
});
