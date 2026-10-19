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

    return {
        /** Whether a `method` call to a path matching `path` (a RegExp) was answered with `status`. */
        wereAnswered(method, path, status) {
            return answered.some(call => call.method === method && path.test(call.path) && call.status === status);
        },
    };
}
