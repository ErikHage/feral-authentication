import { expect } from '@playwright/test';

/**
 * Low-level expectations shared by the drivers.
 *
 * This is the only file in the suite that imports `expect`. Specs and page
 * objects contain no assertions and no locators; the drivers express theirs
 * through these primitives.
 *
 * Every message says what was being done and what was expected, so a failing
 * run explains itself. Locator assertions retry until Playwright's timeout.
 */

const failureMessage = (what, expectation) => `${what}\n  expected: ${expectation}`;

export async function expectVisible(locator, what) {
    await expect(locator, failureMessage(what, `${locator} to be visible`)).toBeVisible();
}

/**
 * For conditions a driver has already worked out. `expectation` says, in
 * words, what should have been true, and `actual` what was found instead.
 */
export function expectThat(condition, expectation, actual, what) {
    expect(condition, `${failureMessage(what, expectation)}\n  actual:   ${actual}`).toBe(true);
}

/** `url` is a string to match exactly, or a RegExp. */
export async function expectUrl(page, url, what) {
    await expect(page, failureMessage(what, `the browser to be at ${url}`)).toHaveURL(url);
}
