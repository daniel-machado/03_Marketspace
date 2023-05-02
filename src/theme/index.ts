import { extendTheme } from 'native-base';

export const THEME = extendTheme(
  {
    colors: {
      blue: {
        700: '#364D9D',
        500: '#647AC7',
      },
      green: {
        700: '#00875F',
        500: '#00B37E',
      },
      gray: {
        bg: '#CDCDCD',
        700: '#F7F7F8',
        600: '#EDECEE',
        500: '#D9D8DA',
        400: '#9F9BA1',
        300: '#5F5B62',
        200: '#3E3A40',
        100: '#1A181B'
      },
      white: '#FFFFFF',
      red: {
        500: '#F75A68'
      }
    },
    fonts: {
      heading: 'Roboto_700Bold',
      body: 'Roboto_400Regular',
    },
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      title: 30,
    },
    sizes: {
      14: 56,
      33: 148
    }
  }
)