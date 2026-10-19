import { test as base } from '@playwright/test';

import { createWorld } from './world';
import {
    createAdminPage,
    createApplicationsAdminPage,
    createKeysAdminPage,
} from './pages/admin-pages';
import { createApplicationPickerPage } from './pages/application-picker-page';
import { createAuthorizationAdminPage } from './pages/authorization-admin-page';
import { createDashboardPage } from './pages/dashboard-pages';
import { createLoginPage } from './pages/login-page';
import { createProfilePage } from './pages/profile-page';
import { createPublicPage } from './pages/public-page';
import { createRolesAdminPage } from './pages/roles-admin-page';
import { createSessionsPage } from './pages/sessions-page';
import { createUsersAdminPage } from './pages/users-admin-page';

/** A fixture for a page object, over the driver of the same name. */
const pageFixture = (name, createPage) => async ({ world }, use) => {
    await use(createPage(world, world.drivers[name]));
};

/**
 * The one thing a spec imports.
 *
 * Playwright's `test`, extended with a fixture per page object, so a spec
 * asks for the pages it uses by name: `async ({ loginPage }) => ...`.
 * Everything a spec can say lives behind these, so the layering is
 * checkable: any other import in spec/ui is a spec reaching past the pages.
 *
 * `expect` is deliberately not exported; assertions live in the drivers.
 */
export const test = base.extend({
    // One world per test, shared by every page object in it, and cleaned up
    // when the test ends, so specs need no afterEach
    world: async ({ page }, use) => {
        const world = createWorld(page);
        await use(world);
        await world.cleanup();
    },

    publicPage: pageFixture('publicPage', createPublicPage),
    loginPage: pageFixture('loginPage', createLoginPage),

    dashboardPage: pageFixture('dashboardPage', createDashboardPage),
    applicationPickerPage: pageFixture('applicationPickerPage', createApplicationPickerPage),
    profilePage: pageFixture('profilePage', createProfilePage),
    sessionsPage: pageFixture('sessionsPage', createSessionsPage),

    adminPage: pageFixture('adminPage', createAdminPage),
    rolesAdminPage: pageFixture('rolesAdminPage', createRolesAdminPage),
    usersAdminPage: pageFixture('usersAdminPage', createUsersAdminPage),
    authorizationAdminPage: pageFixture('authorizationAdminPage', createAuthorizationAdminPage),
    keysAdminPage: pageFixture('keysAdminPage', createKeysAdminPage),
    applicationsAdminPage: pageFixture('applicationsAdminPage', createApplicationsAdminPage),
});
