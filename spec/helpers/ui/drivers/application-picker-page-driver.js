import { expectEventually, expectThat, expectUrl } from './assertions';
import { createRoutedPageDriver } from './routed-page-driver';
import { urlOf } from './urls';

/** The applications page, where a login lands, as Playwright sees it. */
export function createApplicationPickerPageDriver(page, serviceCalls) {
    const main = page.getByRole('main');
    // Each application is a card titled with its name, over its logo
    const card = name => main.getByText(name, { exact: true });
    const logos = main.getByRole('img', { name: 'Logo' });
    const listRefused = () => serviceCalls.wereAnswered('GET', /\/users\/current\/applications$/, 403);

    return {
        ...createRoutedPageDriver(page, {
            name: 'the applications page',
            path: 'dashboard/applications',
            marker: main => main.getByRole('heading', { name: 'Available Applications' }),
        }),

        /**
         * Today's behaviour for a user without the admin role: the service
         * refuses them the list of their applications, and the page shows
         * none, with no error.
         */
        async offersNoneAsTheListIsRefused(name) {
            const what = `offering ${name} to a user without the admin role`;

            await expectEventually(listRefused, 'the service to refuse the list of applications (403)', what);
            await expectUrl(page, urlOf('dashboard/applications'), what);
            const shown = await card(name).count();
            expectThat(shown === 0, `no card for ${name}`, `${shown} shown`, what);
        },

        /**
         * Today's behaviour when a user without the admin role logs in after
         * someone else logged out, without a reload: their list is refused,
         * and the page still shows the previous user's applications.
         */
        async showsThePreviousUsersApplications() {
            const what = 'offering no applications to a user who has none';

            await expectEventually(listRefused, 'the service to refuse the list of applications (403)', what);
            await expectUrl(page, urlOf('dashboard/applications'), what);
            const shown = await logos.count();
            expectThat(shown > 0, "the previous user's applications", 'no applications', what);
        },
    };
}
