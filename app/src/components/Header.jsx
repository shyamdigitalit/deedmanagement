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
      sx={{ bgcolor: "transparent", boxShadow: "none", py: 1, px: 4 }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" sx={{ bgcolor: '#0f172a', color: '#fff' }}>
            <RocketLaunchIcon fontSize="small" />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#0f172a", fontSize: 20 }}
          >
            Deed Management
          </Typography>
        </Box>

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
              background: "#eee",
              maxHeight: "40px",
              padding: "1px 40px",
              borderRadius: "10px",
              boxShadow: "0 5px 10px rgba(2,6,23,0.06)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(15,23,42,0.06)",
              overflow: "visible",
            }}
          >
            {SIDE_MENU.map((item, i) => {
              const active = location.pathname.startsWith(item.path) ? true : false;
              return (
                <Link key={i} to={item.path}>
                  <Box
                    sx={{
                      position: "relative",
                      padding: "12px 10px",
                      borderRadius: "12px",
                      fontSize: "14px",
                      cursor: "pointer",
                      fontWeight: 700,
                      transition: "all 0.28s cubic-bezier(.2,.9,.2,1)",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,

                      bgcolor: active ? "#0f172a" : "transparent",
                      color: active ? "#fff" : "#334155",

                      transform:
                        active
                          ? "translateY(10px) scale(1.08)"
                          : "translateY(0) scale(1)",
                      boxShadow:
                        active ? "0 5px 10px rgba(2,6,23,0.22)" : "none",
                      zIndex: active ? 5 : 1,
                      border:
                        active
                          ? "1px solid rgba(255,255,255,0.06)"
                          : "1px solid transparent",

                      "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: -10,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "72%",
                        height: 12,
                        borderRadius: "50%",
                        filter: "blur(10px)",
                        background:
                          active === i ? "rgba(2,6,23,0.18)" : "transparent",
                        opacity: active === i ? 1 : 0,
                        transition: "all 0.28s ease",
                        pointerEvents: "none",
                      },
                    }}
                  >
                    {item.title}
                  </Box>
                </Link>
              )
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
              <Button variant="outlined"
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
                <AccountCircleIcon /> 
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
                <MenuItem sx={{ gap: 1 }}>
                  <DashboardIcon fontSize="small" /> Dashboard
                </MenuItem>

                <MenuItem sx={{ gap: 1 }}>
                  <SettingsIcon fontSize="small" /> Settings
                </MenuItem>

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
