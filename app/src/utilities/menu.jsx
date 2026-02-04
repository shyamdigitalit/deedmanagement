import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { AccountBalance, Approval, ContentPasteSearch, CorporateFare, Dashboard, Description, FlakySharp, FmdGood, Handyman, Home, LocationOff, LocationOn, Settings, Shield } from '@mui/icons-material';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BadgeIcon from '@mui/icons-material/Badge';
import MemoryIcon from '@mui/icons-material/Memory';
import LabelImportantIcon from '@mui/icons-material/LabelImportant';
import HubIcon from '@mui/icons-material/Hub';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import FactoryIcon from '@mui/icons-material/Factory';
import BallotIcon from '@mui/icons-material/Ballot';
import DomainIcon from '@mui/icons-material/Domain';


export const SIDE_MENU = [
    // { title: 'Form Builder', icon: <Handyman className='icn' />, path: '/' },
    { title: 'Home', path: "/home", icon: <Home className='sidebar-icon' /> },
    { title: 'Deed Wise', path: "/deed", icon: <Description className='sidebar-icon' /> },
    { title: 'Plot Wise', path: "/plot", icon: <FmdGood className='sidebar-icon' /> },
    { title: 'Deed Bank', path: "/bank", icon: <AccountBalance className='sidebar-icon' /> },
    
];


export const ADMIN_MENU = [
    {
      title: 'Admin Modules',
      icon: <AdminPanelSettingsIcon className='icn' />,
      className: 'menu-group',
      children: [
        { title: 'Function Master', icon: <AccountTreeIcon className='icn' />, path: '/admin/function' },
        { title: 'State Master', icon: <LocationOn className='icn' />, path: '/admin/state' },
        { title: 'Company Master', icon: <CorporateFare className='icn' />, path: '/admin/company' },
        { title: 'Plant Master', icon: <FactoryIcon className='icn' />, path: '/admin/plant' },
        // { title: 'Material Master', icon: <AcUnitIcon className='icn' />, path: '/admin/material' },
        // { title: 'Organization Master', icon: <BadgeIcon />, path: '/' },
        // { title: 'Privelege Management', icon: <BadgeIcon className='icn' />, path: '/' },
      ],
    },
    {
      title: 'Account Setup',
      icon: <ManageAccountsIcon className='icn' />,
      className: 'menu-group',
      children: [
        { title: 'Type Master', icon: <AccountTreeIcon />, path: '/account/type' },
        { title: 'Category Master', icon: <AccountTreeIcon />, path: '/account/category' },
        // { title: 'Division Master', icon: <BadgeIcon />, path: '/account/division' },
        { title: 'Department Master', icon: <BadgeIcon />, path: '/account/department' },
        { title: 'Designation Master', icon: <BadgeIcon />, path: '/account/designation' },
      ],
    },
    {
      title: 'Process Setup',
      icon: <MemoryIcon className='icn' />,
      className: 'menu-group',
      children: [
        { title: 'Shift Master', icon: <LabelImportantIcon className='icn' />, path: '/process/shift' },
        // { title: 'Phase Master', icon: <DomainIcon className='icn' />, path: '/' },
        // { title: 'Doctype Master', icon: <DomainIcon className='icn' />, path: '/' },
        // { title: 'Filetype Master', icon: <DomainIcon className='icn' />, path: '/' },
      ],
    },
    // {
    //   title: 'Item Setup',
    //   icon: <HubIcon className='icn' />,
    //   className: 'menu-group',
    //   children: [
    //     { title: 'QC-Parameter Master', icon: <BallotIcon className='icn' />, path: '/' },
    //   ],
    // },
    // { title: 'Help', icon: <HelpCenterIcon className='icn' />, path: '/' }, // Another simple item
  ];  