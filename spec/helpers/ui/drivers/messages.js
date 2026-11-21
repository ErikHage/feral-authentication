/**
 * A message the app shows after an action ("User updated successfully!",
 * "Couldn't add the role …"), found by its text anywhere on the page.
 *
 * The app is moving these from an alert inside the page to a snackbar, which
 * Vuetify renders as a `status` in its overlay container, outside main. Until
 * the move is done this matches either. A field's validation message is an
 * alert too, but it never says what an action did, so matching the text is
 * enough to tell them apart.
 */
export function messageSaying(page, message) {
    return page.getByRole('alert').or(page.getByRole('status')).filter({ hasText: message });
}
