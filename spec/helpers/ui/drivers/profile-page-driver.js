import {
    expectDisabled, expectEventually, expectText, expectThat, expectUrl, expectValue, expectVisible,
} from './assertions';
import { createRoutedPageDriver } from './routed-page-driver';
import { urlOf } from './urls';

/** The logged-in user's profile page, as Playwright sees it. */
export function createProfilePageDriver(page, serviceCalls) {
    const main = page.getByRole('main');
    const personalDetails = main.getByText('Personal Details', { exact: true });
    // The user's full name
    const heading = main.getByRole('heading', { level: 2 });
    const field = label => main.getByLabel(label, { exact: true });
    const saveButton = main.getByRole('button', { name: 'Save' });
    const alertSaying = message => main.getByRole('alert').filter({ hasText: message });

    return {
        ...createRoutedPageDriver(page, {
            name: 'the profile page',
            path: 'dashboard/profile',
            marker: () => personalDetails,
        }),

        async showsUser({ firstName, lastName, username, email }) {
            const what = `showing ${username} their profile`;

            await expectText(heading, `${firstName} ${lastName}`, what);
            await expectValue(field('First Name'), firstName, what);
            await expectValue(field('Last Name'), lastName, what);
            await expectValue(field('Username'), username, what);
            await expectValue(field('Email'), email, what);
            await expectValue(field('Suspended'), 'N', what);
        },

        async changeFirstName(firstName) {
            await field('First Name').fill(firstName);
        },

        async save() {
            await saveButton.click();
        },

        async savedDetails() {
            await expectVisible(alertSaying('User updated successfully!'), 'saving the profile');
        },

        async cannotSaveAnEmptyFirstName() {
            const what = 'saving an empty first name';

            await expectVisible(alertSaying('Field is required'), what);
            await expectDisabled(saveButton, what);
        },

        /** Today's behaviour while editing: the heading follows the First Name field, unsaved. */
        async headingFollowsTheFirstNameField(lastName) {
            const what = 'editing the first name, before saving';
            const typed = await field('First Name').inputValue();

            await expectText(heading, `${typed} ${lastName}`, what);
        },

        /**
         * Today's behaviour after one user logs out and another logs in,
         * without a reload: the page still shows the user who was logged in
         * when it was first opened.
         */
        async showsThePreviousUser(username, previousUsername) {
            const what = `showing ${username} their profile, after ${previousUsername} logged out`;

            await expectValue(field('Username'), previousUsername, what);
        },

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
