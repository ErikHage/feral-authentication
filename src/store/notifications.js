import { defineStore } from 'pinia';

/**
 * What the app has to say about an action the user took ("User updated
 * successfully!", "Couldn't add the role …"), for AppMessages to show as
 * snackbars, one after another. A page that couldn't load says so on the
 * page instead, through its store's load error, since the snackbar goes and
 * the empty page stays.
 */
export const useNotificationsStore = defineStore('notification', {
    actions: {
        notify(type, text) {
            this.messages.push({ text, color: type });
        },
        // Drops those waiting; AppMessages dismisses the one showing
        clear() {
            this.messages = [];
            this.clears++;
        },
    },
    state: () => {
        return {
            // Taken off by the snackbar queue as it shows each one
            messages: [],
            clears: 0,
        };
    },
});

/** `type` is success, error, warning or info. */
export function notify(type, text) {
    useNotificationsStore().notify(type, text);
}
