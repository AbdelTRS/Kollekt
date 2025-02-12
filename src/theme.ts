import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
};

const colors = {
  brand: {
    50: '#f7fafc',
    100: '#edf2f7',
    200: '#e2e8f0',
    300: '#cbd5e0',
    400: '#a0aec0',
    500: '#718096',
    600: '#4a5568',
    700: '#2d3748',
    800: '#1a202c',
    900: '#171923',
  },
};

const styles = {
  global: (props: { colorMode: 'light' | 'dark' }) => ({
    'html, body': {
      bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
      color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      minHeight: '100vh',
      margin: 0,
    },
    '#root': {
      minHeight: '100vh',
      bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
    },
    '.chakra-modal__content': {
      bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
    },
    '.chakra-table': {
      th: {
        bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.50',
        userSelect: 'none',
      },
      td: {
        borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
        userSelect: 'none',
      },
      'td.selectable': {
        userSelect: 'text',
      },
      tr: {
        _hover: {
          bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.50',
        },
      },
    },
    '.chakra-select__wrapper': {
      bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
    },
    'input, select, textarea': {
      bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
      borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
    },
  }),
};

export const theme = extendTheme({ config, colors, styles });