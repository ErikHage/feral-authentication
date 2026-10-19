import { expectUrl, expectVisible } from './assertions';
import { createRoutedPageDriver } from './routed-page-driver';
import { urlOf } from './urls';

/** The logged-in user's sessions page, as Playwright sees it. */
export function createSessionsPageDriver(page) {
    const main = page.getByRole('main');
    const alertSaying = message => main.getByRole('alert').filter({ hasText: message });

    return {
        ...createRoutedPageDriver(page, {
            name: 'the sessions page',
            path: 'dashboard/sessions',
            marker: main => main.getByRole('heading', { name: 'Active Sessions' }),
        }),

        /**
         * Today's behaviour for a user without the admin role: the service
         * refuses the list, and the page shows the HTTP client's message.
         */
        async showsTheRefusal() {
            const what = 'listing the sessions of a user without the admin role';

            await expectVisible(alertSaying('Request failed with status code 403'), what);
            await expectUrl(page, urlOf('dashboard/sessions'), what);
        },
    };
}
