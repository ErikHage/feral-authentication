/**
 * A message the app shows after an action ("User updated successfully!",
 * "Couldn't add the role …"), found by its text.
 *
 * It's a snackbar, which Vuetify renders as a `status` in its overlay
 * container, outside main, so this looks across the whole page. A field's
 * validation message is an alert inside main, and a failed load an alert on
 * the page; neither matches.
 */
export function messageSaying(page, message) {
    return page.getByRole('status').filter({ hasText: message });
}
