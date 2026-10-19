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
     * Chooses `option` in a Vuetify select. A long list renders only the
     * options in view, so this scrolls the select's own menu until it's
     * there. Typing would bring it into view too, but it selects every option
     * that matches on the way, and choosing a user loads their grants: a
     * slower load for an earlier match can land last (backlog B17).
     */
    async function choose(select, option) {
        await select.click();
        // The open select names its menu; a closing one may still be shown
        const menu = page.locator(`[id="${await select.getAttribute('aria-owns')}"]`);
        const list = menu.getByRole('listbox');
        const wanted = menu.getByRole('option', { name: option, exact: true });

        while (await wanted.count() === 0) {
            const moved = await list.evaluate(element => {
                const before = element.scrollTop;
                element.scrollTop += element.clientHeight;
                return element.scrollTop !== before;
            });
            // Two frames, for the list to render what scrolled into view
            await page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
            if (!moved) {
                // At the bottom: the click below fails, naming the option
                break;
            }
        }
        await wanted.click();
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
