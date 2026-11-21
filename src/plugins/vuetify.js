import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
// After vuetify/styles: the few rules the Fr* components can't get from
// Vuetify's classes
import '@feral-auth/vue-components/styles.css'

import { createVuetify } from 'vuetify'
import { createFeralVuetifyOptions } from '@feral-auth/vue-components'

// The feral themes (feralDark is the default) and the mdi icon set, shared
// with the other feral apps
export default createVuetify(createFeralVuetifyOptions())
