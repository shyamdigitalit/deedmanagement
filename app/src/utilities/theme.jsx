// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light", // or "dark" if you want dark theme
    primary: {
      main: "#000000",      // Black
      light: "#4d4d4d",     // Gray (lighter)
      dark: "#000000",      // Pure black
      contrastText: "#ffffff", // White text
    },
    secondary: {
      main: "#808080", // Neutral gray
      light: "#b3b3b3",
      dark: "#4d4d4d",
      contrastText: "#ffffff",
    },
    background: {
      default: "#ffffff", // White background
      paper: "#f5f5f5",   // Light gray paper
    },
    text: {
      primary: "#000000",   // Black text
      secondary: "#4d4d4d", // Dark gray text
      disabled: "#9e9e9e",
    },
  },

  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
});

export default theme;
