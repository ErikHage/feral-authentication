import { appToast, clearNotifications, notify } from '@/store/notifications';
import { messages } from '../../helpers/notifications';

describe('notifications', () => {
    it('starts with nothing to say', () => {
        expect(messages()).toEqual([]);
    });

    it('shows each message as a toast, in order, coloured by its type, for 3 seconds', () => {
        notify('success', 'Role feral/admin Added');
        notify('error', "Couldn't delete the role: it wasn't found");

        expect(appToast.show).toHaveBeenNthCalledWith(1, 'Role feral/admin Added', { color: 'success', timeout: 3000 });
        expect(messages()).toEqual([
            { color: 'success', text: 'Role feral/admin Added' },
            { color: 'error', text: "Couldn't delete the role: it wasn't found" },
        ]);
    });

    it('clears the toasts, keeping those given after', () => {
        notify('success', 'Role Deleted.');

        clearNotifications();
        notify('warning', 'Logged out here');

        expect(appToast.clear).toHaveBeenCalledOnce();
        expect(messages()).toEqual([{ color: 'warning', text: 'Logged out here' }]);
    });
});
