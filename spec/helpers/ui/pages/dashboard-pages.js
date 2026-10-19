import { dashboardComponents, routedPageSteps } from './routed-page';

/*
 * The dashboard's pages, in words, while all they have is the shared steps:
 * `open`, `checkIsShown`, and the `appBar` and `dashboardNav` components. A
 * page moves to its own file once it has steps of its own.
 */

const dashboardPage = (world, driver) => ({
    ...dashboardComponents(world),
    ...routedPageSteps(driver),
});

/** The dashboard before one of its pages is chosen: only its navigation. */
export const createDashboardPage = dashboardPage;

/** The applications page, where a login lands. */
export const createApplicationPickerPage = dashboardPage;

/** The logged-in user's own profile. */
export const createProfilePage = dashboardPage;

/** The logged-in user's sessions. */
export const createSessionsPage = dashboardPage;
