import { expectEventually, expectThat, expectUrl } from './assertions';
import { createRoutedPageDriver } from './routed-page-driver';
import { urlOf } from './urls';

/** The logged-in user's profile page, as Playwright sees it. */
export function createProfilePageDriver(page, serviceCalls) {
    const main = page.getByRole('main');
    const personalDetails = main.getByText('Personal Details', { exact: true });

    return {
        ...createRoutedPageDriver(page, {
            name: 'the profile page',
            path: 'dashboard/profile',
            marker: () => personalDetails,
        }),

        /**
         * Today's behaviour for a user without the admin role: the service
         * refuses the page's calls, the last being the user's roles, and the
         * page shows nothing but its navigation, with no error.
         */
        async showsNothingAsTheUserIsRefused(username) {
            const what = `showing ${username} their profile`;

            await expectEventually(
                () => serviceCalls.wereAnswered('GET', /\/users\/[^/]+\/roles$/, 403),
                "the service to refuse the user's roles (403)", what);
            await expectUrl(page, urlOf('dashboard/profile'), what);
            const shown = await personalDetails.count();
            expectThat(shown === 0, 'no Personal Details', `${shown} shown`, what);
        },
    };
}
