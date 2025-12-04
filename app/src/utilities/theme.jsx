// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      light: '#6ec6ff',
      main:  '#d25d78',
      dark:  '#005b9f',
      contrastText: '#fff',
    },
    // You can also override secondary, error, background, etc.
    secondary: {
      main: '#d81b60',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  // (Optional) You can override typography, spacing, components, etc.
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default theme;
