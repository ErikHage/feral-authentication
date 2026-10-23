import { createAdminNavDriver } from './admin-nav-driver';
import { createAppBarDriver } from './app-bar-driver';
import { createApplicationDetailsPageDriver } from './application-details-page-driver';
import { createApplicationPickerPageDriver } from './application-picker-page-driver';
import { createApplicationsAdminPageDriver } from './applications-admin-page-driver';
import { createAuthorizationAdminPageDriver } from './authorization-admin-page-driver';
import { createDashboardNavDriver } from './dashboard-nav-driver';
import { createKeysAdminPageDriver } from './keys-admin-page-driver';
import { createLoginPageDriver } from './login-page-driver';
import { createNotFoundPageDriver } from './not-found-page-driver';
import { createProfilePageDriver } from './profile-page-driver';
import { createPublicPageDriver } from './public-page-driver';
import { createRolesAdminPageDriver } from './roles-admin-page-driver';
import { recordServiceCalls } from './service-calls';
import { createSessionsPageDriver } from './sessions-page-driver';
import { createUsersAdminPageDriver } from './users-admin-page-driver';

/**
 * Builds each driver once per test, over Playwright's `page`. The admin
 * area's page object has no driver: it is only its components'.
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
        notFoundPage: createNotFoundPageDriver(page),

        applicationPickerPage: createApplicationPickerPageDriver(page, serviceCalls),
        profilePage: createProfilePageDriver(page, serviceCalls),
        sessionsPage: createSessionsPageDriver(page),

        rolesAdminPage: createRolesAdminPageDriver(page),
        usersAdminPage: createUsersAdminPageDriver(page),
        authorizationAdminPage: createAuthorizationAdminPageDriver(page, serviceCalls),
        keysAdminPage: createKeysAdminPageDriver(page),
        applicationsAdminPage: createApplicationsAdminPageDriver(page),
        applicationDetailsPage: createApplicationDetailsPageDriver(page),
    };
}
