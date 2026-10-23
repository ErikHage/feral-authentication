import { flushPromises } from '@vue/test-utils';

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

// Types `value` into the field labelled `label`, in the order a browser runs the listeners.
// Vuetify updates its model from a listener on the <input>, but puts a v-text-field's own
// @input on the field's root, where it hears the event bubble up. A real keystroke runs a
// microtask checkpoint between the two, so Vue has re-rendered by the time @input runs.
// setValue() dispatches from script, which runs both in one go, so @input would still see
// the old value
export async function typeInto(wrapper, label, value) {
    const input = inputLabelled(wrapper, label);

    input.element.value = value;
    input.element.dispatchEvent(new Event('input'));
    await flushPromises();
    fieldLabelled(wrapper, label).element.dispatchEvent(new Event('input'));
    await flushPromises();
}
