import { expectCount, expectVisible } from './assertions';
import { createRoutedPageDriver } from './routed-page-driver';

/**
 * The authorization admin page, as Playwright sees it: a user select, and
 * once a user is chosen, a card each for their applications and roles.
 * Each card has a select, a plus button that adds the choice as a chip, and
 * Save.
 */
export function createAuthorizationAdminPageDriver(page) {
    const main = page.getByRole('main');
    // Vuetify doesn't tie a select's label to it, so the selects go by place:
    // the user select comes first, and each card has one of its own
    const userSelect = main.getByRole('combobox').first();

    // The cards have no role, the plus buttons no accessible name, and the
    // chips no role, so these go by class
    const card = title => main.locator('.v-card').filter({ hasText: title });
    const applicationsCard = card('Manage Applications');
    const rolesCard = card('Manage Roles');
    const chipIn = (cardLocator, text) => cardLocator.locator('.v-chip').getByText(text, { exact: true });

    /**
     * Chooses `option` in a Vuetify select. Long lists render only the
     * options in view, so this types the start of it to bring it into view.
     */
    async function choose(select, option) {
        await select.click();
        await page.keyboard.type(option);
        await page.getByRole('option', { name: option, exact: true }).click();
    }

    async function selectUser(username) {
        await choose(userSelect, username);
    }

    /** Adds `option` in the card as a chip, and saves. */
    async function grant(cardLocator, option) {
        await choose(cardLocator.getByRole('combobox'), option);
        await cardLocator.locator('.mdi-plus').click();
        await cardLocator.getByRole('button', { name: 'Save' }).click();
        // Saving deselects the user, and the cards close. Wait for that, so
        // the next step's choice isn't cleared under it
        await expectCount(cardLocator, 0, `saving ${option}`);
    }

    return {
        ...createRoutedPageDriver(page, {
            name: 'the authorization admin page',
            path: 'admin/authorization',
            marker: main => main.getByText('Manage Authorization', { exact: true }),
        }),

        async grantRole(username, role) {
            await selectUser(username);
            await grant(rolesCard, role);
        },

        async grantApplication(username, application) {
            await selectUser(username);
            await grant(applicationsCard, application);
        },

        async showsRole(username, role) {
            await selectUser(username);
            await expectVisible(chipIn(rolesCard, role), `showing ${username}'s role ${role}`);
        },

        async showsApplication(username, application) {
            await selectUser(username);
            await expectVisible(chipIn(applicationsCard, application), `showing ${username}'s application ${application}`);
        },
    };
}
