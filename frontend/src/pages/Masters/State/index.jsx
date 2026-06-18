import "../../../styles/InspectionEntryForm.css";
import React, { Suspense } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import DeleteIcon from '@mui/icons-material/Delete';

import { DataGrid } from '@mui/x-data-grid';
import { Button, Typography, IconButton, Card, CardContent, Breadcrumbs, Drawer, LinearProgress, Tooltip } from '@mui/material';
import { Link } from "react-router-dom";
import { AccountTree, Delete, EditSquare, LocationOn } from "@mui/icons-material";
import { DataGridStyle } from "../../../utilities/datagridStyle";
import axiosInstance from '../../../config/axiosInstance'
import { useDispatch } from "react-redux";
import Loader from "../../../components/loader";
import moment from "moment";
import { showSnackbar } from "../../../redux/slices/snackbar";

const AddEditState = React.lazy(() => import("./add-edit-state"));

const TableHeaderFormat = (props) => {
 
  return [
    { 
      field: 'id', headerName: 'ID', width: 80,
      renderCell: (params) => {
        return params.api.getRowIndexRelativeToVisibleRows(params.id) + 1 + (props.currentPage * props.pageSize);
      },  
    },
    { field: 'stt_code', headerName: 'State Code', width: 150 },
    { field: 'stt_name', headerName: 'State Name', width: 150 },
    { field: 'stt_desc', headerName: 'State Description', width: 150 },
    { field: 'stt_captl', headerName: 'State Capital', width: 150 },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'createdAtITC', headerName: 'Created At', width: 180, renderCell: (params) => moment(params.value, 'DD-MM-YYYY hh:mm').format('DD-MM-YYYY hh:mm A')},
    { field: 'updatedAtITC', headerName: 'Updated At', width: 180, renderCell: params => moment(params.value, 'DD-MM-YYYY hh:mm').format('DD-MM-YYYY hh:mm A') },
    { field: 'action', headerName: 'Actions', type: 'number',
      renderCell: (params) => {
        
        return (
          <div>
              <Tooltip title="Edit" arrow onClick={() => props.onEdit(params.row)}> 
                <IconButton> <EditSquare /> </IconButton> 
              </Tooltip>
              <Tooltip title="Delete" arrow onClick={() => props.onDelete(params.row)}> 
                <IconButton> <Delete /> </IconButton> 
              </Tooltip>
          </div>
        );
      }
    }
  ]
}


export default function State() {
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false)
  const [stateList , setStateList] = React.useState([])
  const [currentPage, setCurrentPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const [selectedState, setSelectedState] = React.useState(null);

  React.useEffect(() => {
    getStateList();
  }, [])

  const getStateList = async () => {
    try {
      setLoading(true);
      const result = await axiosInstance.get(`/admin/stt/fetch`).then(res => res.data)
      
      if(result.statuscode == 200) {
        setStateList(result.data)
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
    getStateList();
  }


  const onEdit = (row) => {
    // console.log(row)
    setSelectedState(row)
    setOpen(true);
    // handleClickOpen();
  }

  const onDelete = async (row) => {
    if(window.confirm("Are you sure you want to delete this record?")) {
      try {
        const result = await axiosInstance.delete(`/admin/stt/delete/${row._id}`).then(res => res.data)
        console.log(result)
        if(result.statuscode === 200) {
          dispatch(showSnackbar({ message: result.message, severity: 'success', }));
          getStateList();
        }
      } catch (error) {
        const message = error.response ? error.response.data.message : error.message;
        dispatch(showSnackbar({ message, severity: 'error', }));
      }
    }
  }



  return (
    <section className="inspection-entry-form">
        
        <Drawer anchor={"right"} open={open} onClose={() => handleClose()} PaperProps={{ style: { width: 600 } }}> 
          <Suspense fallback={<Loader />}>
            <AddEditState selectedState={selectedState} onClose={handleClose} /> 
          </Suspense>
        </Drawer>
 
        <Breadcrumbs aria-label="breadcrumb" style={{marginBottom: "1rem"}}>
          <Link underline="hover" color="inherit" href="/"> Masters </Link>
          <Link underline="hover" color="inherit" href="/material-ui/getting-started/installation/" > Admin Modules </Link>
          <Typography sx={{ color: 'text.primary' }}>State</Typography>
        </Breadcrumbs>

        <Typography className="title" color="primary">
            <LocationOn color="primary" style={{ fontSize: "3rem", margin: "-10px 0" }} /> State
        </Typography>

        <div className="button-container">
            <Button variant="outlined" size="large" className="button-css" onClick={() => {
              setSelectedState(null);
              setOpen(true)
            }}>
                Add New <AddIcon style={{ margin: "-1px 0 0 2px", fontSize: 17, fontWeight: 600 }} />
            </Button>
            {/* <IconButton> <EditSquareIcon color="info" /> </IconButton> */}
            {/* <IconButton> <DeleteIcon color="error" /> </IconButton> */}
        </div>
        
        <Card>
            <CardContent style={{ padding: "0px" }}>
                {loading && (<LinearProgress />)}
                <DataGrid sx={DataGridStyle} rows={stateList} columns={TableHeaderFormat({currentPage, pageSize, onEdit, onDelete})} getRowId={row => row._id}
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
