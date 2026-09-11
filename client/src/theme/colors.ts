export const palette = {
  shinyJade: '#8ABF96',
  freshGreen: '#B9E0A2',
  yellowHint: '#FFF9B5',
  navajoWhite: '#FFDAAB',
  samara: '#D9A38F',
  brownishPink: '#B38F8F',
  pastelRed: '#E8A0A0',
  white: '#FFFFFF',
  darkBrown: '#332B2B',
} as const;

export const colors = {
  background: palette.yellowHint,
  surface: palette.white,
  primary: palette.shinyJade,
  secondary: palette.freshGreen,
  accent: palette.navajoWhite,
  muted: palette.samara,
  border: palette.brownishPink,
  error: palette.pastelRed,
  textPrimary: palette.darkBrown,
  textOnPrimary: palette.darkBrown,
} as const;
