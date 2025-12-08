import "../styles/Layout.css";
import React, { Suspense } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Link, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from "../redux/slices/authSlice";
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import { AccountTree, Close, CorporateFare, Description, DoubleArrow, FactCheck, Factory, History, Home, InsertChart, LocationOn, Logout, Person, Search, Settings, Verified } from '@mui/icons-material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Avatar, Button, FormControl, InputLabel, Menu, MenuItem, Select, TextField, Tooltip } from '@mui/material';
import DropdownMenu from './Dropdown';
import { ADMIN_MENU, SIDE_MENU } from "../utilities/menu";
import { showSnackbar } from "../redux/slices/snackbar";
import Loader from "./loader";
import { HiOutlineViewGrid } from "react-icons/hi";
import axiosInstance from "../config/axiosInstance";


const Header = React.lazy(() => import('./Header'));

const drawerWidth = 250;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    variants: [
      {
        props: ({ open }) => open,
        style: {
          ...openedMixin(theme),
          '& .MuiDrawer-paper': openedMixin(theme),
        },
      },
      {
        props: ({ open }) => !open,
        style: {
          ...closedMixin(theme),
          '& .MuiDrawer-paper': closedMixin(theme),
        },
      },
    ],
  }),
);

export default function MiniDrawer() {
  const location = useLocation();
  const dispatch = useDispatch()
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const functionRefresh = useSelector((state) => state.functionRefresh.refresh);
  const user = useSelector((state) => state.auth.user);
  const userSymbol = user?.acc_fname?.split(" ")?.map(item => item[0])?.join("");
  const navigate = useNavigate()

  const [openMenu, setOpenMenu] = React.useState({});
  
  
  const toggleSubMenu = (menu) => {
    setOpenMenu((prev) => ({
      [menu]: !prev[menu] || false  // open clicked menu, close others
    }));
  };

  
  const handleLogout = async () => {
    const result = await dispatch(logout());
    // console.log(result);
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(showSnackbar({ message: "Logged Out Successfully", severity: 'info', }));
      navigate('/');
    }
  }

  const handleAction = (text) => () => {
    if(text === 'Logout') {
      handleLogout()
    }
  };  
  
  const sessionMenuData = [
    { title: 'Me', icon: <Avatar />, onClick: handleAction('Me') }, // Another simple item
    // { title: 'Settings', icon: <Settings />, onClick: handleAction('Settings') }, // Another simple item
    { title: 'Logout', icon: <Logout />, onClick: handleAction('Logout') }, // Another simple item
  ];


  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
    setOpenMenu({});
  };
  

  return (
    <Box sx={{ display: 'flex' }}>
      {/* <CssBaseline /> */}
      {!location.pathname.startsWith("/login") && <div style={{ position: "fixed", left: 0, top: 0, width: "100%", zIndex: 100 }} >
          <Suspense fallback={<Loader />}> <Header /> </Suspense>
      </div>}
      {isAuthenticated && <>
        {/* <Drawer className="sidebar-container" variant="permanent" open={open} style={{
          margin: "2rem"
        }}>
          <DrawerHeader style={{padding: "0 15px"}} >
            {open && <div style={{textAlign: "left", width: "100%", padding: "3rem auto", display: "flex", justifyContent: "start", alignItems: "center"}}>
              <img src="/shyamlogo.png" width={100} alt="" />
            </div>}

            {open ? <>
              <IconButton onClick={handleDrawerClose}>
                {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </> : <IconButton onClick={handleDrawerOpen} style={{backgroundColor: 'darkslategrey', color: 'white', fontSize: '18px'}}>
              <HiOutlineViewGrid />
            </IconButton>}

          </DrawerHeader>
          

          <Divider />
          
          <List style={{ height: "calc(100% - 64px)", overflowY: "auto", paddingTop: "30px" }} className="sidebar-list">
            {SIDE_MENU.map((item, index) => open ? (
              <React.Fragment key={index}>
                <Link to={item.children ? "#" : (item.path)}>
                  <ListItemButton selected={(location.pathname + location.search).startsWith(item.path)} 
                  onClick={() => item.children ? toggleSubMenu(item.title) : null}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.title} />
                    {item.children ? (openMenu[item.title] ? <ExpandLess /> : <ExpandMore />) : null}
                  </ListItemButton>
                </Link>

                {item.children && (
                  <Collapse in={openMenu[item.title]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.children.map((subItem, itemKey) => (
                        <Link key={itemKey} to={subItem.path}>
                          <ListItemButton key={subItem.title} sx={{ pl: 4 }} selected={location.pathname.startsWith(subItem.path)} >
                            <ListItemText primary={subItem.title} />
                          </ListItemButton>
                        </Link>
                      ))}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            ) : (
              <DropdownMenu key={index} type={"sidebar"} title={item.title} path={item.path} icon={item.icon} menuItems={item.children || []} />
            ))}
          </List>
          <List className="sidebar-bottom" style={{marginTop: "auto", marginBottom: "1rem"}}>
            <DropdownMenu type={"sidebar"} title="Accounts" path={"/accounts"} icon={<Person className="icn" />} menuItems={[]} />
            <DropdownMenu type={"sidebar"} title="Configuration" icon={<AdminPanelSettingsIcon className="icn" />} menuItems={ADMIN_MENU} />
            <DropdownMenu type={"sidebar"} title="Me" icon={<Avatar sx={{ width: 50, height: 50 }}> <small style={{fontSize: "0.7rem"}}>{userSymbol}</small> </Avatar>} menuItems={sessionMenuData} />
          </List>

        </Drawer> */}
      </>}
      <div style={isAuthenticated ? { marginTop: "5rem", flexGrow: 1, overflowX: "auto" } : {}} >
        <Outlet /> 
      </div>
    </Box>
  );
}
