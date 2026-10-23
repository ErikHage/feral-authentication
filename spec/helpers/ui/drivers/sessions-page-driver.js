import {
    expectCount, expectDisabled, expectUrl, expectValue, expectVisible,
} from './assertions';
import { createRoutedPageDriver } from './routed-page-driver';
import { urlOf } from './urls';

/**
 * The logged-in user's sessions page, as Playwright sees it: a card per
 * session, titled with its id and subtitled "current session" or "remote
 * session".
 */
export function createSessionsPageDriver(page) {
    const main = page.getByRole('main');
    const alertSaying = message => main.getByRole('alert').filter({ hasText: message });

    const cards = subtitle => main.getByRole('region', { name: /^Session / }).filter({ hasText: subtitle });
    const currentSession = cards('current session');
    const remoteSessions = cards('remote session');
    const revoke = card => card.getByRole('button', { name: 'Revoke' });

    return {
        ...createRoutedPageDriver(page, {
            name: 'the sessions page',
            path: 'dashboard/sessions',
            marker: main => main.getByRole('heading', { name: 'Active Sessions' }),
        }),

        async marksTheCurrentSession() {
            const what = 'marking the current session';

            await expectCount(currentSession, 1, what);
            // The star is decoration, hidden from a screen reader, which hears
            // the subtitle instead. So it goes by class
            await expectVisible(currentSession.locator('.mdi-star'), what);
            await expectDisabled(revoke(currentSession), what);
        },

        /** The one session from another device. */
        async revokeTheRemoteSession() {
            await expectCount(remoteSessions, 1, 'finding the session from another device');
            await revoke(remoteSessions).click();
        },

        /** After `revokeTheRemoteSession`: the card was there, so waiting for it to go is safe. */
        async noLongerListsARemoteSession() {
            await expectCount(remoteSessions, 0, 'revoking the session from another device');
        },

        async showsTheApplication(applicationName) {
            const what = "naming the current session's application";

            await expectCount(currentSession, 1, what);
            await expectValue(currentSession.getByLabel('Application', { exact: true }), applicationName, what);
        },

        /**
         * Today's behaviour for a user without the admin role: the service
         * refuses the list, and the page says so.
         */
        async showsTheRefusal() {
            const what = 'listing the sessions of a user without the admin role';

            await expectVisible(alertSaying("Couldn't load your sessions: you don't have permission"), what);
            await expectUrl(page, urlOf('dashboard/sessions'), what);
        },
    };
}
