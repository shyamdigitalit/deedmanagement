import "../../../styles/InspectionEntryForm.css";
import React, { Suspense } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import DeleteIcon from '@mui/icons-material/Delete';

import { DataGrid } from '@mui/x-data-grid';
import { Button, Typography, IconButton, Card, CardContent, Breadcrumbs, Drawer, LinearProgress } from '@mui/material';
import { Link } from "react-router-dom";
import { AccountTree, FilterTiltShift, LocationOn } from "@mui/icons-material";
import { DataGridStyle } from "../../../utilities/datagridStyle";
import axiosInstance from '../../../config/axiosInstance'
import { useDispatch } from "react-redux";
import Loader from "../../../components/loader";
import moment from "moment";

const AddEditShift = React.lazy(() => import("./add-edit-shift"));

const TableHeaderFormat = (props) => {
 
  return [
    { 
      field: 'id', headerName: 'ID', width: 150,
      renderCell: (params) => {
        return params.api.getRowIndexRelativeToVisibleRows(params.id) + 1 + (props.currentPage * props.pageSize);
      },  
    },
    { field: 'shft_code', headerName: 'Shift Code', width: 150 },
    { field: 'shft_name', headerName: 'Shift Name', width: 150 },
    { field: 'shft_desc', headerName: 'Shift Description', width: 150 },
    { field: 'shft_start_time', headerName: 'Shift Start Time', width: 150 },
    { field: 'shft_end_time', headerName: 'Shift End Time', width: 150 },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'createdAtITC', headerName: 'Created At', width: 180, renderCell: (params) => moment(params.value, 'DD-MM-YYYY hh:mm').format('DD-MM-YYYY hh:mm A')},
    { field: 'updatedAtITC', headerName: 'Updated At', width: 180, renderCell: params => moment(params.value, 'DD-MM-YYYY hh:mm').format('DD-MM-YYYY hh:mm A') },
  ]
}


export default function Shift() {
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false)
  const [shiftList , setShiftList] = React.useState([])
  const [currentPage, setCurrentPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(1)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    getShiftList();
  }, [])

  const getShiftList = async () => {
    try {
      setLoading(true);
      const result = await axiosInstance.get(`/shft/fetch`).then(res => res.data)
      
      if(result.statuscode == 200) {
        setShiftList(result.data)
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
    getShiftList();
  }

  return (
    <section className="inspection-entry-form">
        
        <Drawer anchor={"right"} open={open} onClose={() => handleClose()} PaperProps={{ style: { width: 600 } }}> 
          <Suspense fallback={<Loader />}>
            <AddEditShift onClose={handleClose} /> 
          </Suspense>
        </Drawer>
 
        <Breadcrumbs aria-label="breadcrumb" style={{marginBottom: "1rem"}}>
          <Link underline="hover" color="inherit" href="/"> Masters </Link>
          <Link underline="hover" color="inherit" href="/material-ui/getting-started/installation/" > Admin Modules </Link>
          <Typography sx={{ color: 'text.primary' }}>Shift</Typography>
        </Breadcrumbs>

        <Typography className="title" color="primary">
            <FilterTiltShift color="primary" style={{ fontSize: "3rem", margin: "-10px 0" }} /> Shift
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
                <DataGrid sx={DataGridStyle} rows={shiftList} columns={TableHeaderFormat({currentPage, pageSize})} getRowId={row => row._id}
                  pageSizeOptions={[5, 10, 15]} checkboxSelection disableRowSelectionOnClick
                  initialShift={{ pagination: { paginationModel: { pageSize: 15, }, }, }} 
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
