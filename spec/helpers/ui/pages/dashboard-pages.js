import { dashboardComponents, routedPageSteps } from './routed-page';

/*
 * The dashboard's pages, in words, while all they have is the shared steps:
 * `open`, `checkIsShown`, and the `appBar` and `dashboardNav` components. A
 * page moves to its own file once it has steps of its own, as the
 * applications, profile and sessions pages have.
 */

const dashboardPage = (world, driver) => ({
    ...dashboardComponents(world),
    ...routedPageSteps(driver),
});

/** The dashboard before one of its pages is chosen: only its navigation. */
export const createDashboardPage = dashboardPage;
