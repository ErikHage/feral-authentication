import { expectUrl, expectVisible } from './assertions';
import { createRoutedPageDriver } from './routed-page-driver';
import { urlOf } from './urls';

/** The users admin page, as Playwright sees it. */
export function createUsersAdminPageDriver(page) {
    const applicationsHeading = page.getByRole('main').getByRole('heading', { name: 'Available Applications' });

    return {
        ...createRoutedPageDriver(page, {
            name: 'the users admin page',
            path: 'admin/users',
            marker: main => main.getByText('Manage Users', { exact: true }),
        }),

        /** Today's behaviour: a reload goes through login, on to the applications page. */
        async landsOnApplicationsPageAfterReload() {
            const what = 'reloading the users admin page';

            await expectUrl(page, urlOf('dashboard/applications'), what);
            await expectVisible(applicationsHeading, what);
        },
    };
}
