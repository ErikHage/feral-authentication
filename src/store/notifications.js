import { useToast } from '@feral-auth/vue-components';

/**
 * What the app has to say about an action the user took ("User updated
 * successfully!", "Couldn't add the role …"), shown as toasts, one after
 * another, by the frame's FrSnackbarQueue: FrAppShell's once logged in, the
 * logged-out frame's otherwise. A page that couldn't load says so on the page
 * instead, through its store's load error, since the toast goes and the empty
 * page stays.
 *
 * A toast showing when the frame changes (on login or logout) goes with the
 * old frame, so a message about that change is given after it.
 */
export const appToast = useToast();

const messageTimeout = 3000;

/** `type` is success, error, warning or info. An error is read out as an alert. */
export function notify(type, text) {
    appToast.show(text, { color: type, timeout: messageTimeout });
}

/** Dismisses the message showing and drops those waiting; ones given after still show. */
export function clearNotifications() {
    appToast.clear();
}
