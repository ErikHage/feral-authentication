import { appToast } from '@/store/notifications';

/**
 * The messages given in this test and not cleared since, in order, as
 * `{ color, text }`: what is still to show, or showing. spec/setup.js spies on
 * the app's toasts for each test
 */
export function messages() {
    const shows = vi.mocked(appToast.show).mock;
    const clears = vi.mocked(appToast.clear).mock;
    const events = [
        ...shows.calls.map(([text, { color }], i) => ({ order: shows.invocationCallOrder[i], message: { color, text } })),
        ...clears.invocationCallOrder.map(order => ({ order, clear: true })),
    ].sort((a, b) => a.order - b.order);

    return events.reduce((given, event) => (event.clear ? [] : [...given, event.message]), []);
}

/** The latest message given for the toasts, as `{ color, text }`. */
export function lastMessage() {
    return messages().at(-1);
}
