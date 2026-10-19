import { createAdminNavDriver } from './admin-nav-driver';
import { createAppBarDriver } from './app-bar-driver';
import { createApplicationDetailsPageDriver } from './application-details-page-driver';
import { createApplicationPickerPageDriver } from './application-picker-page-driver';
import { createApplicationsAdminPageDriver } from './applications-admin-page-driver';
import { createAuthorizationAdminPageDriver } from './authorization-admin-page-driver';
import { createDashboardNavDriver } from './dashboard-nav-driver';
import { createKeysAdminPageDriver } from './keys-admin-page-driver';
import { createLoginPageDriver } from './login-page-driver';
import { createProfilePageDriver } from './profile-page-driver';
import { createPublicPageDriver } from './public-page-driver';
import { createRolesAdminPageDriver } from './roles-admin-page-driver';
import { createRoutedPageDriver } from './routed-page-driver';
import { recordServiceCalls } from './service-calls';
import { createSessionsPageDriver } from './sessions-page-driver';
import { createUsersAdminPageDriver } from './users-admin-page-driver';

/**
 * Builds each driver once per test, over Playwright's `page`. A page with
 * nothing to do yet but be shown is a plain routed page; it gets its own
 * driver file once it has more.
 */
export function createDrivers(page) {
    // Before anything loads, so no call goes unrecorded
    const serviceCalls = recordServiceCalls(page);

    return {
        appBar: createAppBarDriver(page),
        dashboardNav: createDashboardNavDriver(page),
        adminNav: createAdminNavDriver(page),

        publicPage: createPublicPageDriver(page),
        loginPage: createLoginPageDriver(page),

        // The dashboard and admin shells, before a page in them is chosen,
        // show only their navigation
        dashboardPage: createRoutedPageDriver(page, {
            name: 'the dashboard', path: 'dashboard', marker: main => main.getByRole('link', { name: 'Profile' }),
        }),
        applicationPickerPage: createApplicationPickerPageDriver(page, serviceCalls),
        profilePage: createProfilePageDriver(page, serviceCalls),
        sessionsPage: createSessionsPageDriver(page),

        adminPage: createRoutedPageDriver(page, {
            name: 'the admin area', path: 'admin', marker: main => main.getByRole('link', { name: 'Keys' }),
        }),
        rolesAdminPage: createRolesAdminPageDriver(page),
        usersAdminPage: createUsersAdminPageDriver(page),
        authorizationAdminPage: createAuthorizationAdminPageDriver(page),
        keysAdminPage: createKeysAdminPageDriver(page),
        applicationsAdminPage: createApplicationsAdminPageDriver(page),
        applicationDetailsPage: createApplicationDetailsPageDriver(page),
    };
}
