/**
 * The app's own calls to the service, as answered, recorded from the start
 * of the test.
 *
 * For checks that something is absent: a page that shows nothing looks the
 * same before its data arrives as after, so a driver waits for the call that
 * would have filled it to be answered, then reads the page once.
 */
export function recordServiceCalls(page) {
    const answered = [];

    page.on('response', response => {
        answered.push({
            method: response.request().method(),
            path: new URL(response.url()).pathname,
            status: response.status(),
        });
    });

    const matches = (call, { method, path, status }) =>
        call.method === method && path.test(call.path) && call.status === status;
    const matching = (method, path, status) => answered.filter(call => matches(call, { method, path, status }));

    return {
        /** Whether a `method` call to a path matching `path` (a RegExp) was answered with `status`. */
        wereAnswered(method, path, status) {
            return matching(method, path, status).length > 0;
        },

        /**
         * Whether a call matching `then` was answered after the last call
         * matching `first`, each a { method, path, status }: say, the list a
         * page loads for the next user, after the latest logout.
         */
        wereAnsweredAfter(first, then) {
            const last = answered.findLastIndex(call => matches(call, first));
            return last >= 0 && answered.slice(last + 1).some(call => matches(call, then));
        },

        /** How many such calls were answered so far, to wait for one more. */
        countAnswered(method, path, status) {
            return matching(method, path, status).length;
        },
    };
}
