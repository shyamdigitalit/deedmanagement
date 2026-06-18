// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#FF7A18",          // Orange (Add Deed button)
      light: "#FFF1E6",
      dark: "#E56A0F",
      contrastText: "#ffffff",
    },

    secondary: {
      main: "#6B7280",          // Neutral gray
      light: "#9CA3AF",
      dark: "#374151",
      contrastText: "#ffffff",
    },

    success: {
      main: "#22C55E",          // Verified
      contrastText: "#ffffff",
    },

    warning: {
      main: "#F59E0B",          // Pending
      contrastText: "#ffffff",
    },

    error: {
      main: "#EF4444",          // Rejected
      contrastText: "#ffffff",
    },

    background: {
      default: "#F9FAFB",       // Page background
      paper: "#FFFFFF",         // Cards
    },

    text: {
      primary: "#111827",       // Main text
      secondary: "#6B7280",     // Sub text
      disabled: "#9CA3AF",
    },

    divider: "#E5E7EB",
  },
  
  typography: {
    fontFamily: "Poppins, system-ui, -apple-system, sans-serif",
  },
  // typography: {
  //   fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',

  //   h5: {
  //     fontWeight: 600,
  //     color: "#111827",
  //   },

  //   h6: {
  //     fontWeight: 600,
  //     color: "#111827",
  //   },

  //   body2: {
  //     color: "#6B7280",
  //   },
  // },

  // shape: {
  //   borderRadius: 12, // rounded cards like image
  // },

  // components: {
  //   MuiCard: {
  //     styleOverrides: {
  //       root: {
  //         borderRadius: 16,
  //         boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  //         border: "1px solid #E5E7EB",
  //       },
  //     },
  //   },

  //   MuiButton: {
  //     styleOverrides: {
  //       root: {
  //         borderRadius: 10,
  //         textTransform: "none",
  //         fontWeight: 500,
  //       },
  //     },
  //   },

  //   MuiChip: {
  //     styleOverrides: {
  //       root: {
  //         borderRadius: 8,
  //         fontWeight: 500,
  //       },
  //     },
  //   },

  //   MuiDataGrid: {
  //     styleOverrides: {
  //       root: {
  //         border: "none",
  //       },
  //       columnHeaders: {
  //         backgroundColor: "#F5F6F8",
  //         color: "#374151",
  //         fontWeight: 600,
  //       },
  //       row: {
  //         borderBottom: "1px solid #E5E7EB",
  //       },
  //     },
  //   },

  //   MuiTextField: {
  //     defaultProps: {
  //       size: "small",
  //     },
  //   },
  // },
});

export default theme;
