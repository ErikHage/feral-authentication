/**
 * A Vuetify select or autocomplete in `within`, by its label (a string,
 * matched exactly, or a pattern). Vuetify names the field's own input, which
 * is hidden; the field around it is what opens the menu, and names it.
 */
export function selectField(page, within, label) {
    return within.getByRole('combobox')
        .filter({ has: page.getByRole('combobox', { name: label, exact: true }) });
}

/**
 * Chooses `option` in a Vuetify select or autocomplete, `select` being its
 * field, from `selectField`.
 *
 * A long list renders only the options in view, so this scrolls the
 * select's own menu until the option is there. Typing would bring it into
 * view too, but a select chooses every option that matches on the way, and
 * on the authorization page each choice loads that user's grants.
 */
export async function chooseOption(page, select, option) {
    await select.click();
    // The open select names its menu; a closing one may still be shown
    const menu = page.locator(`[id="${await select.getAttribute('aria-owns')}"]`);
    const list = menu.getByRole('listbox');
    const wanted = menu.getByRole('option', { name: option, exact: true });

    while (await wanted.count() === 0) {
        const moved = await list.evaluate(element => {
            const before = element.scrollTop;
            element.scrollTop += element.clientHeight;
            return element.scrollTop !== before;
        });
        // Two frames, for the list to render what scrolled into view
        await page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
        if (!moved) {
            // At the bottom: the click below fails, naming the option
            break;
        }
    }
    await wanted.click();
}
