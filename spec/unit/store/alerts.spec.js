import { failureMessage } from '@/store/alerts';
import { httpError, noAnswer } from '../../helpers/http-errors';

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
