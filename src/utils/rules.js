// A Vuetify rule for a field that can't be left empty, named in its message
export function required(label) {
    return value => !!value || `${label} is required`;
}
