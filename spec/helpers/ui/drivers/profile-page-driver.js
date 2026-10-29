import {
    expectDisabled, expectEnabled, expectText, expectValue, expectVisible,
} from './assertions';
import { createRoutedPageDriver } from './routed-page-driver';

/** The logged-in user's profile page, as Playwright sees it. */
export function createProfilePageDriver(page) {
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

        async headingKeepsTheSavedName(firstName, lastName) {
            const what = 'editing the first name, before saving';

            // Save is enabled by the edit, so the page has re-rendered by then
            await expectEnabled(saveButton, what);
            await expectText(heading, `${firstName} ${lastName}`, what);
        },

        async showsTheNextUser(username, previousUsername) {
            const what = `showing ${username} their profile, after ${previousUsername} logged out`;

            await expectValue(field('Username'), username, what);
        },
    };
}
