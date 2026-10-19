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

// JSON, except that a RegExp reads as itself rather than as {}
const shown = value => JSON.stringify(value, (key, each) => (each instanceof RegExp ? String(each) : each));

/**
 * `text` is a string or RegExp, or an array with one per element `locator`
 * matches.
 */
export async function expectText(locator, text, what) {
    await expect(locator, failureMessage(what, `${locator} to read ${shown(text)}`)).toHaveText(text);
}

/** A form field's value. */
export async function expectValue(locator, value, what) {
    await expect(locator, failureMessage(what, `${locator} to hold ${shown(value)}`)).toHaveValue(value);
}

export async function expectDisabled(locator, what) {
    await expect(locator, failureMessage(what, `${locator} to be disabled`)).toBeDisabled();
}

/** Retries, so it waits for elements to come or go: use it only once they are sure to. */
export async function expectCount(locator, count, what) {
    await expect(locator, failureMessage(what, `${count} of ${locator}`)).toHaveCount(count);
}

/** Retries `check`, a function returning a boolean, until it returns true. */
export async function expectEventually(check, expectation, what) {
    await expect.poll(check, { message: failureMessage(what, expectation) }).toBe(true);
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
