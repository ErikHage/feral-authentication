import { DOMWrapper } from '@vue/test-utils';

// Vuetify renders a dialog into document.body, outside the wrapper, so a
// page with dialogs must be mounted with `attachTo: document.body`

function openDialogs() {
    return [...document.querySelectorAll('.v-overlay--active .v-overlay__content')]
        .map(content => new DOMWrapper(content));
}

// The open dialog whose title is `title`, or undefined
export function findDialog(title) {
    return openDialogs().find(dialog => dialog.find('.v-card-title').text() === title);
}

// The open dialog whose title is `title`
export function dialogTitled(title) {
    const dialog = findDialog(title);

    if (!dialog) {
        const open = openDialogs().map(d => d.find('.v-card-title').text());
        throw new Error(`no open dialog titled "${title}" (open: ${JSON.stringify(open)})`);
    }
    return dialog;
}
