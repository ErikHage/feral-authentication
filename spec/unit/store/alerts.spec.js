import { failureMessage, showAlert } from '@/store/alerts';
import { httpError, noAnswer } from '../../helpers/http-errors';

describe('showAlert', () => {
    let store;

    beforeEach(() => {
        vi.useFakeTimers();
        store = { alertVisible: false, alertType: null, alertMessage: null };
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('shows the alert, and hides it after 3 seconds', () => {
        showAlert(store, 'success', 'User added successfully!');

        expect(store).toEqual({ alertVisible: true, alertType: 'success', alertMessage: 'User added successfully!' });
        vi.advanceTimersByTime(3000);
        expect(store.alertVisible).toBe(false);
    });

    it("gives a newer alert its own 3 seconds, not what's left of the older one's", () => {
        showAlert(store, 'success', 'User added successfully!');
        vi.advanceTimersByTime(2000);

        showAlert(store, 'success', 'User deleted successfully.');
        vi.advanceTimersByTime(2000);

        expect(store.alertVisible).toBe(true);
        expect(store.alertMessage).toBe('User deleted successfully.');
        vi.advanceTimersByTime(1000);
        expect(store.alertVisible).toBe(false);
    });

    it("keeps each store's clock to itself", () => {
        const other = { ...store };
        showAlert(store, 'success', 'Role Deleted.');
        vi.advanceTimersByTime(2000);

        showAlert(other, 'success', 'Key Rotated!');
        vi.advanceTimersByTime(1000);

        expect(store.alertVisible).toBe(false);
        expect(other.alertVisible).toBe(true);
    });
});

describe('failureMessage', () => {
    it.each([
        [401, 'your session has expired; log in again'],
        [403, "you don't have permission"],
        [404, "it wasn't found"],
        [409, 'it already exists'],
        [400, 'the service refused it (400)'],
        [500, 'the service failed (500)'],
        [503, 'the service failed (503)'],
    ])('explains a %i', (status, reason) => {
        expect(failureMessage(httpError(status), "Couldn't add the role")).toBe(`Couldn't add the role: ${reason}`);
    });

    it("says when the service didn't answer", () => {
        expect(failureMessage(noAnswer(), "Couldn't load the roles")).toBe("Couldn't load the roles: the service didn't answer");
    });

    it("finds the service's answer in an error that wraps it", () => {
        const err = new Error('Error logging in', { cause: httpError(403) });

        expect(failureMessage(err, "Couldn't open the application")).toBe("Couldn't open the application: you don't have permission");
    });

    it('takes a reason for a status from the caller', () => {
        const message = failureMessage(httpError(401), "Couldn't log in", { 401: 'the username or password is wrong' });

        expect(message).toBe("Couldn't log in: the username or password is wrong");
    });

    it("says only what failed when it wasn't the service", () => {
        expect(failureMessage(new TypeError('x is undefined'), "Couldn't load the user")).toBe("Couldn't load the user");
    });
});
