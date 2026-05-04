import { createTheme } from '@mui/material/styles';
import designSystem from './designSystem';

const { colorPalette, typography, borderRadius, transitions, roleColors, spacing } = designSystem;

const lightPalette = {
  background: {
    default: colorPalette.background.primary,
    paper: colorPalette.background.secondary,
  },
  text: {
    primary: colorPalette.text.primary,
    secondary: colorPalette.text.secondary,
    disabled: colorPalette.text.tertiary,
  },
};

const darkPalette = {
  background: {
    default: colorPalette.dark.background,
    paper: colorPalette.dark.surface,
  },
  text: {
    primary: colorPalette.dark.text,
    secondary: colorPalette.dark.textMuted,
    disabled: '#4B5563',
  },
};

export const createAppTheme = (role = 'student', mode = 'light') => {
  const validRole = (role === 'admin' || role === 'student') ? role : 'student';
  const roleColor = roleColors[validRole] || roleColors['student'];

  const primaryColor = roleColor?.primary || colorPalette.primary.DEFAULT;

  const paletteColors = mode === 'dark' ? darkPalette : lightPalette;
  const isDark = mode === 'dark';

  return createTheme({
    spacing: spacing.base,

    palette: {
      mode,
      primary: {
        main: primaryColor,
        light: colorPalette.primary.light,
        dark: colorPalette.primary.dark,
        contrastText: colorPalette.text.inverse,
      },
      secondary: {
        main: isDark ? colorPalette.dark.textMuted : colorPalette.text.secondary,
        light: isDark ? '#70809A' : colorPalette.text.tertiary,
        dark: isDark ? colorPalette.dark.text : colorPalette.text.primary,
      },
      background: {
        default: paletteColors.background.default,
        paper: paletteColors.background.paper,
      },
      text: {
        primary: paletteColors.text.primary,
        secondary: paletteColors.text.secondary,
        disabled: paletteColors.text.disabled,
      },
      success: {
        main: colorPalette.success,
      },
      warning: {
        main: colorPalette.warning,
      },
      error: {
        main: colorPalette.error,
      },
      info: {
        main: colorPalette.info,
      },
      divider: isDark ? colorPalette.borderDark : colorPalette.border,
      grey: {
        50: '#F4F7FB',
        100: '#EEF3F8',
        200: '#D9E1EC',
        300: '#BBC7D6',
        400: '#9AA8BF',
        500: '#7A879F',
        600: colorPalette.text.secondary,
        700: colorPalette.text.primary,
        800: '#1A2536',
        900: '#0F1724',
      },
    },

    typography: {
      fontFamily: typography.fontFamily.body,
      h1: {
        fontFamily: typography.fontFamily.display,
        fontWeight: typography.fontWeight.bold,
        fontSize: typography.fontSize['4xl'],
        lineHeight: typography.lineHeight.tight,
        color: paletteColors.text.primary,
      },
      h2: {
        fontFamily: typography.fontFamily.display,
        fontWeight: typography.fontWeight.bold,
        fontSize: typography.fontSize['3xl'],
        lineHeight: typography.lineHeight.tight,
        color: paletteColors.text.primary,
      },
      h3: {
        fontFamily: typography.fontFamily.display,
        fontWeight: typography.fontWeight.semibold,
        fontSize: typography.fontSize['2xl'],
        lineHeight: typography.lineHeight.tight,
        color: paletteColors.text.primary,
      },
      h4: {
        fontFamily: typography.fontFamily.body,
        fontWeight: typography.fontWeight.semibold,
        fontSize: typography.fontSize.xl,
        lineHeight: typography.lineHeight.normal,
        color: paletteColors.text.primary,
      },
      h5: {
        fontFamily: typography.fontFamily.body,
        fontWeight: typography.fontWeight.semibold,
        fontSize: typography.fontSize.lg,
        lineHeight: typography.lineHeight.normal,
        color: paletteColors.text.primary,
      },
      h6: {
        fontFamily: typography.fontFamily.body,
        fontWeight: typography.fontWeight.semibold,
        fontSize: typography.fontSize.base,
        lineHeight: typography.lineHeight.normal,
        color: paletteColors.text.primary,
      },
      body1: {
        fontFamily: typography.fontFamily.body,
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.normal,
        lineHeight: typography.lineHeight.relaxed,
        color: paletteColors.text.secondary,
        fontFamily: typography.fontFamily.body,
      },
      body2: {
        fontFamily: typography.fontFamily.body,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.normal,
        lineHeight: typography.lineHeight.relaxed,
        color: paletteColors.text.secondary,
        fontFamily: typography.fontFamily.body,
      },
      caption: {
        fontFamily: typography.fontFamily.mono,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        letterSpacing: '0.05em',
        color: paletteColors.text.secondary,
      },
      button: {
        fontFamily: typography.fontFamily.body,
        fontWeight: typography.fontWeight.semibold,
        letterSpacing: '0.02em',
        textTransform: 'none',
      },
    },

    shape: {
      borderRadius: borderRadius.xl,
    },

    shadows: [
      'none',
      isDark ? colorPalette.shadow.dark.sm : colorPalette.shadow.sm,
      isDark ? colorPalette.shadow.dark.sm : colorPalette.shadow.sm,
      isDark ? colorPalette.shadow.dark.md : colorPalette.shadow.md,
      isDark ? colorPalette.shadow.dark.md : colorPalette.shadow.md,
      isDark ? colorPalette.shadow.dark.lg : colorPalette.shadow.lg,
      isDark ? colorPalette.shadow.dark.lg : colorPalette.shadow.lg,
      isDark ? colorPalette.shadow.dark.xl : colorPalette.shadow.xl,
      isDark ? colorPalette.shadow.dark.xl : colorPalette.shadow.xl,
      ...Array(16).fill(isDark ? colorPalette.shadow.dark.xl : colorPalette.shadow.xl),
    ],

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? colorPalette.dark.background : colorPalette.background.primary,
            color: isDark ? colorPalette.dark.text : colorPalette.text.primary,
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? colorPalette.dark.surface : colorPalette.light.surface,
            borderRadius: borderRadius.xl,
            border: isDark ? `1px solid ${colorPalette.borderDark}` : `1px solid ${colorPalette.border}`,
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.lg,
            padding: `${spacing.md}px 20px`,
            boxShadow: 'none',
            transition: transitions.normal,
          },
          contained: {
            backgroundColor: primaryColor,
            color: colorPalette.text.inverse,
            '&:hover': {
              backgroundColor: primaryColor,
              boxShadow: 'none',
            },
          },
          outlined: {
            borderColor: isDark ? colorPalette.borderDark : colorPalette.border,
            color: isDark ? colorPalette.dark.text : colorPalette.text.primary,
            borderRadius: borderRadius.sm,
            padding: `${spacing.sm}px 16px`,
            '&:hover': {
              borderColor: isDark ? colorPalette.borderDark : colorPalette.border,
              backgroundColor: 'transparent',
            },
          },
          text: {
            borderRadius: 0,
            padding: '0px',
          },
        },
      },

      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: borderRadius.sm,
              backgroundColor: isDark ? colorPalette.dark.elevated : colorPalette.light.elevated,
              transition: transitions.normal,
              '& fieldset': {
                borderColor: isDark ? colorPalette.borderDark : colorPalette.border,
              },
              '&:hover fieldset': {
                borderColor: isDark ? colorPalette.borderDark : colorPalette.border,
              },
              '&.Mui-focused fieldset': {
                borderColor: primaryColor,
                borderWidth: 2,
              },
            },
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.full,
            fontWeight: typography.fontWeight.medium,
            fontSize: typography.fontSize.xs,
          },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(26, 37, 54, 0.92)' : 'rgba(253, 254, 255, 0.92)',
            color: isDark ? colorPalette.dark.text : colorPalette.text.primary,
            backdropFilter: 'blur(12px)',
            borderBottom: isDark ? `1px solid ${colorPalette.borderDark}` : `1px solid ${colorPalette.border}`,
          },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? colorPalette.dark.surface : colorPalette.background.secondary,
            borderRight: isDark ? `1px solid ${colorPalette.borderDark}` : `1px solid ${colorPalette.border}`,
          },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.sm,
            transition: transitions.normal,
            '&.Mui-selected': {
              backgroundColor: isDark ? 'rgba(122, 162, 255, 0.14)' : 'rgba(79, 124, 255, 0.1)',
              borderLeft: `3px solid ${primaryColor}`,
              '&:hover': {
                backgroundColor: isDark ? 'rgba(122, 162, 255, 0.14)' : 'rgba(79, 124, 255, 0.1)',
              },
            },
            '&:hover': {
              backgroundColor: 'transparent',
            },
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: isDark ? `1px solid ${colorPalette.borderDark}` : `1px solid ${colorPalette.border}`,
          },
          head: {
            backgroundColor: isDark ? colorPalette.dark.elevated : colorPalette.background.secondary,
            fontWeight: typography.fontWeight.semibold,
            color: isDark ? colorPalette.dark.text : colorPalette.text.primary,
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: 'transparent',
            },
          },
        },
      },
    },
  });
};

export default createAppTheme;
