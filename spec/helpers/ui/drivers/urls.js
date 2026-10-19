import { appUrl } from '../setup/config';

/** Opens `path` in the app, e.g. `login`. */
export async function openPath(page, path) {
    await page.goto(`${appUrl}${path}`);
}

/** The app's URL for `path`, for drivers to check where the browser is. */
export const urlOf = path => `${appUrl}${path}`;
