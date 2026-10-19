import { adminComponents, routedPageSteps } from './routed-page';

/*
 * The admin pages, in words, while all they have is the shared steps:
 * `open`, `checkIsShown`, and the `appBar` and `adminNav` components. A page
 * moves to its own file once it has steps of its own, as the users page has.
 */

const adminPage = (world, driver) => ({
    ...adminComponents(world),
    ...routedPageSteps(driver),
});

/** The admin area before one of its pages is chosen: only its navigation. */
export const createAdminPage = adminPage;

export const createRolesAdminPage = adminPage;

export const createAuthorizationAdminPage = adminPage;

export const createKeysAdminPage = adminPage;

export const createApplicationsAdminPage = adminPage;
