import { adminComponents } from './routed-page';

/**
 * The admin area, on whichever of its pages, in words: its app bar and
 * navigation. `/admin` itself opens the roles page, so the area has no page
 * of its own to open or check.
 */
export const createAdminPage = world => adminComponents(world);
