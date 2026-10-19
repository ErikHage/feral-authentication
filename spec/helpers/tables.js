// The text of each cell of each body row of the first table in `wrapper`
export function tableRows(wrapper) {
    return wrapper.findAll('tbody tr').map(row => row.findAll('td').map(cell => cell.text()));
}

// The headers of the first table in `wrapper`
export function tableHeaders(wrapper) {
    return wrapper.findAll('thead th').map(header => header.text());
}

// The body row of the first table in `wrapper` that has a cell reading `text`
export function rowWith(wrapper, text) {
    const row = wrapper.findAll('tbody tr')
        .find(tr => tr.findAll('td').some(cell => cell.text() === text));

    if (!row) {
        throw new Error(`no table row with a cell reading "${text}"`);
    }
    return row;
}
