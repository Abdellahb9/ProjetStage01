import { createTheme } from '@mui/material/styles';

// Inspired by Stripe's and Notion's color palettes
const lightPalette = {
  primary: {
    main: '#6758F6', // A modern, friendly purple
    light: '#8C80F8',
    dark: '#5045C6',
  },
  secondary: {
    main: '#1A1A1A', // A calm, dark gray for text and secondary elements
    light: '#4D4D4D',
    dark: '#000000',
  },
  background: {
    default: '#F7F7F7', // A very light gray for the background
    paper: '#FFFFFF',
  },
  text: {
    primary: '#1A1A1A',
    secondary: '#6B7280', // Gray from Tailwind's color palette
  },
};

const darkPalette = {
  primary: {
    main: '#8C80F8',
    light: '#A9A0FA',
    dark: '#6758F6',
  },
  secondary: {
    main: '#E5E5E5',
    light: '#FFFFFF',
    dark: '#B3B3B3',
  },
  background: {
    default: '#1A1A1A',
    paper: '#2A2A2A',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#9CA3AF', // Lighter gray from Tailwind's palette
  },
};

const defaultShadows = createTheme().shadows;

const baseTheme = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12, // rounded-xl
  },
  spacing: 8, // Base spacing unit
  shadows: defaultShadows,
};

export const createCustomTheme = (mode: 'light' | 'dark') => {
  const palette = mode === 'light' ? lightPalette : darkPalette;

  return createTheme({
    palette: {
      mode,
      ...palette,
    },
    ...baseTheme,
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: baseTheme.shape.borderRadius,
            boxShadow: baseTheme.shadows[1],
            '&:hover': {
              boxShadow: baseTheme.shadows[2],
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: baseTheme.shape.borderRadius,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: baseTheme.shape.borderRadius,
          },
        },
      },
      MuiContainer: {
        defaultProps: {
          maxWidth: 'lg',
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: `1px solid ${palette.background.default}`,
          },
        },
      },
    },
  });
};