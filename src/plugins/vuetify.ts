/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */
import 'vuetify/styles'
import { type ThemeDefinition, createVuetify } from 'vuetify'

import colors from 'vuetify/util/colors'
import { md3 } from 'vuetify/blueprints'

import '@mdi/font/css/materialdesignicons.css'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const lightTheme: ThemeDefinition = {
    dark: false,
    colors: {
        primary: colors.purple.lighten2,
        secondary: colors.grey.lighten4,
        surface: colors.grey.lighten5,
    },
}

const darkTheme: ThemeDefinition = {
    dark: true,
    colors: {
        primary: colors.purple.lighten4,
        secondary: colors.purple.lighten2,
        surface: colors.grey.darken4,
    },
}

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
const vuetify = createVuetify({
    blueprint: md3,
    theme: {
        defaultTheme: 'light',
        themes: {
            light: lightTheme,
            dark: darkTheme
        }
    },
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
        },
    },
})

/**
 * 应用主题
 * @param theme - 主题模式: 'system' | 'light' | 'dark'
 */
export function applyTheme(theme: 'system' | 'light' | 'dark') {
    const resolvedTheme = theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme
    vuetify.theme.change(resolvedTheme)
}

/**
 * 获取系统主题
 */
export function getSystemThemeMediaQuery() {
    return window.matchMedia('(prefers-color-scheme: dark)')
}

export default vuetify