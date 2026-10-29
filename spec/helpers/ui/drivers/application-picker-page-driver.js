import { expectCount, expectEventually, expectUrl, expectVisible } from './assertions';
import { createRoutedPageDriver } from './routed-page-driver';
import { urlOf } from './urls';

/** The applications page, where a login lands, as Playwright sees it. */
export function createApplicationPickerPageDriver(page, serviceCalls) {
    const main = page.getByRole('main');
    // Each application is a card titled with its name, over its logo
    const card = name => main.getByText(name, { exact: true });
    const logos = main.getByRole('img', { name: 'Logo' });
    // The list loaded since the last logout: the next user's, not one loaded
    // for the user before. Not since the last login, which may not be
    // answered yet when a driver first looks
    const listAnsweredSinceLogout = () => serviceCalls.wereAnsweredAfter(
        { method: 'POST', path: /\/logout$/, status: 204 },
        { method: 'GET', path: /\/users\/current\/applications$/, status: 200 },
    );

    return {
        ...createRoutedPageDriver(page, {
            name: 'the applications page',
            path: 'dashboard/applications',
            marker: main => main.getByRole('heading', { name: 'Available Applications' }),
        }),

        async offersApplication(name) {
            const what = `offering ${name}`;

            await expectUrl(page, urlOf('dashboard/applications'), what);
            await expectVisible(card(name), what);
        },

        /**
         * Offers no applications, for a user granted none who logs in after
         * someone else logged out, without a reload: their own list comes back
         * empty, and nothing is left of the previous user's.
         */
        async offersNoApplications() {
            const what = 'offering no applications to a user who has none';

            await expectEventually(listAnsweredSinceLogout,'the service to answer the list of applications', what);
            await expectUrl(page, urlOf('dashboard/applications'), what);
            await expectCount(logos, 0, what);
        },
    };
}
