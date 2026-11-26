import { MarkeeTheme } from './sdk'
import { darken, lighten, transparentize } from 'polished'
import { DefaultTheme } from 'styled-components'

// Matches the app's modal (20px), cards (8px) and buttons/inputs (8px).
const RADII = { radius: 20, cardRadius: 8, controlRadius: 8 }
const FONT_FAMILY = "'Montserrat', sans-serif"

/**
 * Maps Honeyswap's styled-components theme onto the Markee SDK theme so the sign and modal
 * follow the app's light (teal) and dark (honey) palettes. Light-mode teal is darkened where it
 * is used as text or a focus ring so it stays readable on white.
 */
export function markeeTheme(theme: DefaultTheme, darkMode: boolean): MarkeeTheme {
  const brand = theme.primary2 // dark: honey #FFE270, light: teal #7CE0D6
  const brandText = darkMode ? brand : darken(0.45, brand)

  return {
    mode: darkMode ? 'dark' : 'light',
    fontFamily: FONT_FAMILY,
    ...RADII,
    colors: {
      background: theme.bg1,
      surface: theme.bg2,
      text: theme.text1,
      muted: theme.text2,
      border: darkMode ? theme.bg3 : theme.bg4,
      inputBackground: theme.bg1,
      inputText: theme.text1,
      // Same pairing as ButtonPrimary (theme.white is black in light mode).
      primary: theme.primary1,
      primaryText: theme.white,
      accent: brand,
      accentText: darkMode ? theme.bg1 : theme.text1,
      accentSurface: transparentize(0.88, brand),
      accentSurfaceText: brandText,
      accentBorder: brand,
      selected: theme.bg3,
      selectedText: theme.text1,
      info: transparentize(0.85, theme.blue1),
      infoText: darkMode ? lighten(0.25, theme.blue1) : darken(0.1, theme.blue1),
      error: transparentize(0.85, theme.red1),
      errorText: darkMode ? theme.red1 : darken(0.15, theme.red2),
      warning: transparentize(0.85, theme.yellow2),
      warningText: darkMode ? theme.yellow1 : darken(0.25, theme.yellow2),
      warningBorder: theme.yellow2,
      success: transparentize(0.85, theme.green1),
      successText: darkMode ? lighten(0.2, theme.green1) : darken(0.1, theme.green1),
      link: brandText,
      focusRing: darkMode ? brand : darken(0.3, brand),
      overlay: theme.modalBG
    }
  }
}
