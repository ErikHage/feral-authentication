import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      // Vuetify's data tables name their slots after columns, as in
      // v-slot:item.actions; the dot isn't a modifier
      'vue/valid-v-slot': ['error', { allowModifiers: true }],
    },
  },
]
