import "../../../styles/InspectionEntryForm.css";
import React, { Suspense } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import DeleteIcon from '@mui/icons-material/Delete';

import { DataGrid } from '@mui/x-data-grid';
import { Button, Typography, IconButton, Card, CardContent, Breadcrumbs, Drawer, LinearProgress } from '@mui/material';
import { Link } from "react-router-dom";
import { AccountTree } from "@mui/icons-material";
import { DataGridStyle } from "../../../utilities/datagridStyle";
import axiosInstance from '../../../config/axiosInstance'
import { useDispatch } from "react-redux";
import { showSnackbar } from "../../../redux/slices/snackbar";
import Loader from "../../../components/loader";
import moment from "moment";
const AddEditAccountType = React.lazy(() => import("./add-edit-account-type"));

const TableHeaderFormat = (props) => {
 
  return [
    { 
      field: 'id', headerName: 'ID', width: 150,
      renderCell: (params) => {
        return params.api.getRowIndexRelativeToVisibleRows(params.id) + 1 + (props.currentPage * props.pageSize);
      },  
    },
    { field: 'typname', headerName: 'Type name', width: 150 },
    { field: 'heirarchy', headerName: 'Heirarchy', width: 150 },
    { field: 'stacklvl', headerName: 'Same Level', width: 150 },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'createdAtITC', headerName: 'Created At', width: 180, renderCell: (params) => moment(params.value, 'DD-MM-YYYY hh:mm').format('DD-MM-YYYY hh:mm A')},
    { field: 'updatedAtITC', headerName: 'Updated At', width: 180, renderCell: params => moment(params.value, 'DD-MM-YYYY hh:mm').format('DD-MM-YYYY hh:mm A') },
  ]
}


export default function AccountType() {
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false)
  const [accountList , setAccountList] = React.useState([])
  const [currentPage, setCurrentPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(1)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    getAccountTypeList();
  }, [])

  const getAccountTypeList = async () => {
    try {
      setLoading(true);
      const result = await axiosInstance.get(`/acctyp/fetch`).then(res => res.data)
      if(result.statuscode == 202) {
        setAccountList(result.data)
        setLoading(false);
        // dispatch(showSnackbar({ message: result.message, severity: 'info', duration: 2000}));
      }
    } catch (error) {
      setLoading(false);
      console.error(error)
    }
  }

  const handleClose = () => {
    setOpen(false);
    getAccountTypeList();
  }

  return (
    <section className="inspection-entry-form">
        
        <Drawer anchor={"right"} open={open} onClose={() => handleClose()} PaperProps={{ style: { width: 600 } }}> 
          <Suspense fallback={<Loader />}>
            <AddEditAccountType onClose={handleClose} /> 
          </Suspense>
        </Drawer>
 
        <Breadcrumbs aria-label="breadcrumb" style={{marginBottom: "1rem"}}>
          <Link underline="hover" color="inherit" href="/"> Masters </Link>
          <Link underline="hover" color="inherit" href="/material-ui/getting-started/installation/" > Account Setup </Link>
          <Typography sx={{ color: 'text.primary' }}>Account Type</Typography>
        </Breadcrumbs>

        <Typography className="title" color="primary">
            <AccountTree color="primary" style={{ fontSize: "3rem", margin: "-10px 0" }} /> ACCOUNT TYPE
        </Typography>

        <div className="button-container">
            <Button variant="outlined" size="large" className="button-css" onClick={() => setOpen(true)}>
                Add New <AddIcon style={{ margin: "-1px 0 0 2px", fontSize: 17, fontWeight: 600 }} />
            </Button>
            {/* <IconButton> <EditSquareIcon color="info" /> </IconButton>
            <IconButton> <DeleteIcon color="error" /> </IconButton> */}
        </div>
        
        <Card>
            <CardContent style={{ padding: "0px" }}>
                {loading && (<LinearProgress />)}
                <DataGrid sx={DataGridStyle} rows={accountList} columns={TableHeaderFormat({currentPage, pageSize})} getRowId={row => row._id}
                  pageSizeOptions={[5, 10, 15]} checkboxSelection disableRowSelectionOnClick
                  initialState={{ pagination: { paginationModel: { pageSize: 15, }, }, }} 
                  onPaginationModelChange={(e) => {
                    setCurrentPage(e.page)
                    setPageSize(e.pageSize)
                  }}
                />
            </CardContent>
        </Card>
    </section>
  );
}
