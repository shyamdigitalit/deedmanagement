import React from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from "@mui/material";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { ADMIN_MENU, SIDE_MENU } from "../utilities/menu";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { showSnackbar } from "../redux/slices/snackbar";
import DropdownMenu from "./Dropdown";
import { AdminPanelSettings } from "@mui/icons-material";

export default function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const [anchorEl, setAnchorEl] = React.useState(null);
  const user = useSelector((state) => state.auth.user);
  const userSymbol = user?.acc_fname?.split(" ")?.map(item => item[0])?.join("");

  const open = Boolean(anchorEl);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    const result = await dispatch(logout());
    // console.log(result);
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(showSnackbar({ message: "Logged Out Successfully", severity: 'info', }));
      navigate('/');
    }
  }
   
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        // backdropFilter: "blur(12px)",
        background: "transparent",
        // boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        px: 3,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>

        {/* ---------------------- LOGO ---------------------- */}
        <Link to="/" style={{ textDecoration: "none" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <img src="./shyamlogo.png" width={70} alt="logo" />
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
              Deed Management
            </Typography>
          </Box>
        </Link>

        {/* Center Menu */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 1.2,
              background: "white",
              padding: "1px 40px",
              borderRadius: "10px",
              boxShadow: "2px 2px 8px rgba(2,6,23,0.06)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(15,23,42,0.06)",
              overflow: "visible",
            }}
          >
            {SIDE_MENU.map((item, i) => {
              const active = location.pathname.startsWith(item.path);

              return (
                <Link key={i} to={item.path}>
                  <Box
                    sx={{
                      position: "relative",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      fontSize: "14px",
                      cursor: "pointer",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      transition: "all 0.35s cubic-bezier(.25,.8,.25,1)",

                      /** TEXT + COLOR */
                      bgcolor: active ? "#0f172a" : "transparent",
                      color: active ? "#fff" : "#334155",

                      /** LEFT–RIGHT SLIDE EFFECT */
                      transform: active ? "translateX(6px) scale(1.06)" : "translateX(0)",

                      /** GLOW SHADOW */
                      boxShadow: active ? "0 4px 12px rgba(15,23,42,0.25)" : "none",
                      zIndex: active ? 5 : 1,

                      /** BORDER */
                      border: active
                        ? "1px solid rgba(255,255,255,0.15)"
                        : "1px solid transparent",

                      /** HOVER EFFECT */
                      "&:hover": {
                        transform: active
                          ? "translateX(6px) scale(1.06)"
                          : "translateX(3px) scale(1.02)",
                        background: active ? "#0f172a" : "rgba(15,23,42,0.08)",
                      },

                      /** SHADOW BELOW ACTIVE TAB */
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: -6,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "70%",
                        height: 10,
                        borderRadius: "50%",
                        filter: "blur(12px)",
                        background: active ? "rgba(15,23,42,0.25)" : "transparent",
                        opacity: active ? 1 : 0,
                        transition: "all 0.3s ease",
                        pointerEvents: "none",
                      },
                    }}
                  >
                    {item.title}
                  </Box>
                </Link>
              );
            })}
          </Box>
        </Box>


        {/* Right Section */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {!user ? (
            <>
              <Link to="/login">
                <Button
                  variant="outlined"
                  sx={{
                    borderRadius: "999px",
                    textTransform: "none",
                    px: 3,
                    py: 0.8,
                    borderColor: "#e2e8f0",
                    color: "#0f172a",
                    fontWeight: 600,
                  }}
                >
                  Log in
                </Button>
              </Link>

              <Button
                variant="contained"
                sx={{
                  borderRadius: "999px",
                  textTransform: "none",
                  px: 3,
                  py: 0.8,
                  bgcolor: "#0f172a",
                  boxShadow: "0 8px 20px rgba(2,6,23,0.12)",
                  "&:hover": { bgcolor: "#111827" },
                  fontWeight: 700,
                }}
              >
                Sign up
              </Button>
            </>
          ) : (
            <>
            
              <DropdownMenu title="Configuration" icon={<AdminPanelSettings className="icn" />} menuItems={ADMIN_MENU} />
              {/* Profile Icon */}
              <Button
                onClick={handleOpenMenu}
                sx={{
                  // bgcolor: "#0f172a",
                  // color: "#fff",
                  // width: 42,
                  // height: 42,
                  // borderRadius: "12px",
                  // boxShadow: "0 6px 15px rgba(15,23,42,0.3)",
                  // "&:hover": { bgcolor: "#111827" },
                  gap: 1
                }}
              >
                <AccountCircleIcon style={{width: 30, height: 30}} /> 
                <strong>Accounts</strong>
              </Button>

              {/* Dropdown Menu */}
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleCloseMenu}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    width: 260,
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.85)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 10px 30px rgba(15,23,42,0.15)",
                    p: 1,
                  },
                }}
              >
                <MenuItem disabled>
                  <Avatar sx={{ width: 50, height: 50 }}> <small style={{fontSize: "1rem"}}>{userSymbol}</small> </Avatar>
                  <div style={{ marginLeft: "10px" }}>
                    <div>{user?.acc_fname}</div>
                    <strong>{user?.acc_typ?.typname}</strong>
                  </div>
                </MenuItem>
                <Link to="/accounts">
                  <MenuItem sx={{ gap: 1 }}>
                    <AccountCircleIcon fontSize="small" /> Accounts
                  </MenuItem>
                </Link>

                {/* <MenuItem sx={{ gap: 1 }}>
                  <SettingsIcon fontSize="small" /> Settings
                </MenuItem> */}

                <Divider sx={{ my: 1 }} />

                <MenuItem sx={{ color: "red", gap: 1 }} onClick={handleLogout}>
                  <LogoutIcon fontSize="small" /> Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
