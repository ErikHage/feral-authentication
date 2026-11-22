import { useNotificationsStore } from '@/store/notifications';

/** The latest message given for the snackbars, as `{ color, text }`. */
export function lastMessage() {
    return useNotificationsStore().messages.at(-1);
}
