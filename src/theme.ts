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
      bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.50',
      color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      minHeight: '100vh',
      margin: 0,
    },
    '#root': {
      minHeight: '100vh',
      bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.50',
    },
    '.chakra-modal__content': {
      bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.100',
      boxShadow: 'lg',
    },
    '.chakra-table': {
      th: {
        bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
        userSelect: 'none',
        color: props.colorMode === 'dark' ? 'white' : 'gray.700',
      },
      td: {
        borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.300',
        userSelect: 'none',
        bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
      },
      'td.selectable': {
        userSelect: 'text',
      },
      tr: {
        _hover: {
          bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.100',
        },
      },
    },
    '.chakra-select__wrapper': {
      bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.50',
    },
    'input, select, textarea': {
      bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.50',
      borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.300',
      _hover: {
        borderColor: props.colorMode === 'dark' ? 'gray.500' : 'gray.400',
      },
      _focus: {
        borderColor: 'blue.500',
        boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
      },
    },
    '.chakra-card': {
      bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
      borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
      boxShadow: 'sm',
      _hover: {
        boxShadow: 'md',
      },
    },
    '.chakra-button': {
      _hover: {
        transform: 'translateY(-1px)',
        boxShadow: 'sm',
      },
    },
  }),
};

const components = {
  Button: {
    baseStyle: {
      _hover: {
        transform: 'translateY(-1px)',
        boxShadow: 'sm',
      },
    },
  },
  Card: {
    baseStyle: (props: { colorMode: 'light' | 'dark' }) => ({
      container: {
        bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
        borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
      },
    }),
  },
  Modal: {
    baseStyle: (props: { colorMode: 'light' | 'dark' }) => ({
      dialog: {
        bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.100',
      },
    }),
  },
};

export const theme = extendTheme({ config, colors, styles, components });