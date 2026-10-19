import { adminComponents, routedPageSteps } from './routed-page';

/*
 * The admin pages, in words, while all they have is the shared steps:
 * `open`, `checkIsShown`, and the `appBar` and `adminNav` components. A page
 * moves to its own file once it has steps of its own, as every admin page
 * now has.
 */

const adminPage = (world, driver) => ({
    ...adminComponents(world),
    ...routedPageSteps(driver),
});

/** The admin area before one of its pages is chosen: only its navigation. */
export const createAdminPage = adminPage;
