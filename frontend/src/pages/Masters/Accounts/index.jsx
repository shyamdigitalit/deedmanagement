import "../../../styles/InspectionEntryForm.css";
import React, { Suspense } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import DeleteIcon from '@mui/icons-material/Delete';

import { DataGrid } from '@mui/x-data-grid';
import { Button, Typography, IconButton, Card, CardContent, Breadcrumbs, Drawer, Box, LinearProgress } from '@mui/material';
import { Link } from "react-router-dom";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { DataGridStyle } from "../../../utilities/datagridStyle";
import axiosInstance from '../../../config/axiosInstance'
import { useDispatch } from "react-redux";
import { showSnackbar } from "../../../redux/slices/snackbar";
import Loader from "../../../components/loader";
import BulkUploadDialog from "../../../components/bulkUpload";
import AccountsBulkFormat from "./AccountsBulkFormat";
import { Upload } from "@mui/icons-material";
import moment from "moment";
const AddEditAccounts = React.lazy(() => import("./add-edit-accounts"));

const TableHeaderFormat = (props) => {
 
  return [
    { 
      field: 'id', headerName: 'ID', width: 150,
      renderCell: (params) => {
        return params.api.getRowIndexRelativeToVisibleRows(params.id) + 1 + (props.currentPage * props.pageSize);
      },  
    },
    { field: 'acc_typ', headerName: 'Account Type', width: 150, renderCell: (params) => params.value.typname},
    { field: 'acc_uname', headerName: 'User Name', width: 150 },
    // { field: 'acc_pass', headerName: 'Password', width: 150 },
    // { field: 'acc_pass_bckup', headerName: 'Backup Password', width: 150 },
    { field: 'acc_eml', headerName: 'Email', width: 150 },
    { field: 'acc_phn', headerName: 'Phone', width: 150 },
    { field: 'acc_fname', headerName: 'Full Name', width: 150 },
    { field: 'acc_secphn', headerName: 'Secondary Phone', width: 150 },
    { field: 'acc_cat', headerName: 'Category', width: 150 },
    { field: 'acc_comp', headerName: 'Company', width: 150 },
    { field: 'acc_emp_code', headerName: 'Employee Code', width: 150 },
    { field: 'acc_dept', headerName: 'Department', width: 150 },
    { field: 'acc_desig', headerName: 'Designation', width: 150 },
    // { field: 'acc_lvl', headerName: 'Level', width: 150 },
    { field: 'acc_reporting', headerName: 'Reporting To', width: 150 },
    // { field: 'acc_org', headerName: 'Organization', width: 150 },
    // { field: 'acc_div', headerName: 'Division', width: 150 },
    { field: 'acc_state', headerName: 'State', width: 150 },
    // { field: 'acc_base_loc_dist', headerName: 'Base Location District', width: 150 },
    { field: 'acc_addrss', headerName: 'Address', width: 150 },
    { field: 'acc_pan', headerName: 'PAN', width: 150 },
    { field: 'acc_gst', headerName: 'GST', width: 150 },
    { field: 'acc_img', headerName: 'Image', width: 150 },
    { field: 'acc_img_publicid', headerName: 'Image Public ID', width: 150 },
    { field: 'acc_dob', headerName: 'Date of Birth', width: 150 },
    { field: 'acc_anniversary', headerName: 'Anniversary', width: 150 },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'createdAtITC', headerName: 'Created At', width: 180, renderCell: (params) => moment(params.value, 'DD-MM-YYYY hh:mm').format('DD-MM-YYYY hh:mm A')},
    { field: 'updatedAtITC', headerName: 'Updated At', width: 180, renderCell: params => moment(params.value, 'DD-MM-YYYY hh:mm').format('DD-MM-YYYY hh:mm A') },
    { field: 'typname', headerName: 'Type Name', width: 150 },
    { field: 'heirarchy', headerName: 'Hierarchy', width: 150 },
    { field: 'stacklvl', headerName: 'Same Level', width: 150 },
  ];
}


export default function Accounts() {
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false)
  const [openBulk, setOpenBulk] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(5);
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [loading, setLoading] = React.useState(false)
  const [accountList, setAccountList] = React.useState([])

  React.useEffect(() => {
    getAccountTypeList();
  }, [currentPage, pageSize])

  const getAccountTypeList = async () => {
    try {
      setLoading(true);
      let query = `?page=${currentPage+1}&limit=${pageSize}`;
      const result = await axiosInstance.get(`/acc/fetch${query}`).then(res => res.data)
      if(result.statuscode == 202) {
        setAccountList(result.data.Acc)
        setTotalRecords(result.data.totalCount); // assume backend sends total records
        // dispatch(showSnackbar({ message: result.message, severity: 'info', duration: 2000}));
        setLoading(false)
      }
    } catch (error) {
      setLoading(false);
      console.error(error)
    }
  }

  
  const handleCloseBulk = () => {
    setOpenBulk(false);
    getAccountTypeList();
  }

  const handleClose = () => {
    setOpen(false);
    getAccountTypeList();
  }

  return (
    <section className="inspection-entry-form">
        
        <React.Suspense fallback={<Loader />}>
          <BulkUploadDialog url={'/acc/import'} format={AccountsBulkFormat} open={openBulk} handleClose={handleCloseBulk} />
        </React.Suspense>
        <Drawer anchor={"right"} open={open} onClose={handleClose} PaperProps={{ style: { width: 1100 } }}> 
          <Suspense fallback={<Loader />}>
            <AddEditAccounts onClose={handleClose} setOpen={setOpen} /> 
          </Suspense>
        </Drawer>
 
        <Breadcrumbs aria-label="breadcrumb" style={{marginBottom: "1rem"}}>
          <Link underline="hover" color="inherit" href="/"> Dashboard </Link>
          <Typography sx={{ color: 'text.primary' }}>Accounts</Typography>
        </Breadcrumbs>

        <Typography className="title" color="primary">
            <AccountBoxIcon color="primary" style={{ fontSize: "3rem", margin: "-10px 0" }} /> ACCOUNTS
        </Typography>

        <div className="button-container">
            <Button variant="outlined" size="large" className="button-css" onClick={() => setOpen(true)}>
                Add New <AddIcon style={{ margin: "-1px 0 0 2px", fontSize: 17, fontWeight: 600 }} />
            </Button>
            <Button variant="outlined" size="large" color="info" onClick={() => setOpenBulk(true)}>
                Upload <Upload style={{ margin: "-1px 0 0 2px", fontSize: 24, fontWeight: 600 }} />
            </Button>
            {/* <IconButton> <EditSquareIcon color="info" /> </IconButton>
            <IconButton> <DeleteIcon color="error" /> </IconButton> */}
        </div>
        
        <Card>
            <CardContent style={{ padding: "0px" }}>
              {loading && (<LinearProgress />)}
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <DataGrid sx={DataGridStyle} rows={accountList} columns={TableHeaderFormat({currentPage, pageSize})} getRowId={row => row._id}
                  checkboxSelection disableRowSelectionOnClick
                  pageSizeOptions={[5, 10, 25]} 
                  rowCount={totalRecords} // <-- Important
                  paginationMode="server" // <-- Enables server-side pagination
                  paginationModel={{ page: currentPage, pageSize }}
                  onPaginationModelChange={(e) => {
                    setCurrentPage(e.page)
                    setPageSize(e.pageSize)
                  }}
                />

              </Box>
            </CardContent>
        </Card>
    </section>
  );
}
