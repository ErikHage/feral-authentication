// The v-text-field (or v-textarea) labelled `label`
export function fieldLabelled(wrapper, label) {
    const field = wrapper.findAll('.v-input')
        .find(input => input.find('label').exists() && input.find('label').text() === label);

    if (!field) {
        throw new Error(`no field labelled "${label}"`);
    }
    return field;
}

// The input inside the field labelled `label`
export function inputLabelled(wrapper, label) {
    return fieldLabelled(wrapper, label).find('input, textarea');
}

export function buttonLabelled(wrapper, label) {
    const button = wrapper.findAll('.v-btn').find(btn => btn.text() === label);

    if (!button) {
        throw new Error(`no button labelled "${label}"`);
    }
    return button;
}
