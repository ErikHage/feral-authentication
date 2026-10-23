import { expectCount, expectEventually, expectVisible } from './assertions';
import { createRoutedPageDriver } from './routed-page-driver';
import { chooseOption } from './select';

/**
 * The authorization admin page, as Playwright sees it: a user select, and
 * once a user is chosen, a card (a region) each for their applications and
 * roles. Each card has a select, a plus button that adds the choice as a
 * chip, and Save. A chip is a button that removes what it names.
 */
export function createAuthorizationAdminPageDriver(page, serviceCalls) {
    const main = page.getByRole('main');
    // Vuetify doesn't tie a select's label to it, so the selects go by place:
    // the user select comes first, and each card has one of its own
    const userSelect = main.getByRole('combobox').first();

    const applicationsCard = main.getByRole('region', { name: 'Manage Applications' });
    const rolesCard = main.getByRole('region', { name: 'Manage Roles' });
    const chipIn = (cardLocator, text) => cardLocator.getByRole('button', { name: `Remove ${text}`, exact: true });
    const plusIn = cardLocator => cardLocator.getByRole('button', { name: /^Add the / });

    // Loading a user ends with their applications, so one more of those
    // answered means the page has loaded a user again
    const userLoads = () => serviceCalls.countAnswered('GET', /\/users\/[^/]+\/applications$/, 200);

    const choose = (select, option) => chooseOption(page, select, option);

    async function selectUser(username) {
        await choose(userSelect, username);
    }

    /** Adds `option` in the card as a chip, without saving. */
    async function add(cardLocator, option) {
        await choose(cardLocator.getByRole('combobox'), option);
        await plusIn(cardLocator).click();
        await expectVisible(chipIn(cardLocator, option), `adding ${option}`);
    }

    /**
     * Saves the card. A save reloads the user, and resets the card to what
     * the service then holds. Waits for that, so the next step doesn't act
     * under it.
     */
    async function save(cardLocator, what) {
        const loadsBefore = userLoads();
        await cardLocator.getByRole('button', { name: 'Save' }).click();
        await expectEventually(() => userLoads() > loadsBefore, 'the user to be reloaded', what);
    }

    /** Adds `option` in the card as a chip, and saves. */
    async function grant(cardLocator, option) {
        await add(cardLocator, option);
        await save(cardLocator, `saving ${option}`);
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

        async chooseUser(username) {
            await selectUser(username);
        },

        async addApplication(application) {
            await add(applicationsCard, application);
        },

        async addRole(role) {
            await add(rolesCard, role);
        },

        async cancelRoles() {
            await rolesCard.getByRole('button', { name: 'Cancel' }).click();
        },

        async saveRoles() {
            await save(rolesCard, 'saving the roles');
        },

        /** After `saveRoles`, which waited for the reload: the chip is the service's. */
        async showsTheSavedRoleKeepingTheUser(role) {
            const what = `saving the role ${role}`;

            await expectVisible(chipIn(rolesCard, role), what);
            await expectVisible(applicationsCard, what);
        },

        async dropsTheRoleKeepingTheUser(role) {
            const what = `cancelling the role ${role}`;

            // The chip was on screen, so its going is the sign Cancel is done
            await expectCount(chipIn(rolesCard, role), 0, what);
            await expectVisible(rolesCard, what);
        },

        async stillAddsApplication(application) {
            await expectVisible(chipIn(applicationsCard, application),
                `keeping ${application}, unsaved, after the roles card's Cancel or Save`);
        },

        // Each opens the page afresh first, so the chips are what the service
        // holds, not what this page last showed

        async showsRole(username, role) {
            await page.reload();
            await selectUser(username);
            await expectVisible(chipIn(rolesCard, role), `showing ${username}'s role ${role}`);
        },

        async showsApplication(username, application) {
            await page.reload();
            await selectUser(username);
            await expectVisible(chipIn(applicationsCard, application), `showing ${username}'s application ${application}`);
        },
    };
}
