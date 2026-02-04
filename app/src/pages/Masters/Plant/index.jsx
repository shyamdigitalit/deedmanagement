import "../../../styles/InspectionEntryForm.css";
import React, { Suspense } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import DeleteIcon from '@mui/icons-material/Delete';

import { DataGrid } from '@mui/x-data-grid';
import { Button, Typography, IconButton, Card, CardContent, Breadcrumbs, Drawer, LinearProgress } from '@mui/material';
import { Link } from "react-router-dom";

import { DataGridStyle } from "../../../utilities/datagridStyle";
import axiosInstance from '../../../config/axiosInstance'
// import { useDispatch } from "react-redux";
import Loader from "../../../components/loader";
import { Factory, Upload } from "@mui/icons-material";
import BulkUploadDialog from "../../../components/bulkUpload";
import PlantBulkFormat from "./PlantBulkFormat";
import moment from "moment";

const AddEditPlant = React.lazy(() => import("./add-edit-plant"));

const TableHeaderFormat = (props) => {
 
  return [
    { 
      field: 'id', headerName: 'ID', width: 50,
      renderCell: (params) => {
        return params.api.getRowIndexRelativeToVisibleRows(params.id) + 1 + (props.currentPage * props.pageSize);
      },  
    },
    { field: 'plantCode', headerName: 'Plant Code', width: 100 },
    { field: 'plantName', headerName: 'Plant Name', width: 180 },
    { field: 'plnt_cmpny', headerName: 'Company', width: 100, renderCell: (params) => params.value?.companyCode || '' },
    { field: 'plnt_loc', headerName: 'Location', width: 150, renderCell: (params) => params.value?.stt_name || '' },
    { field: 'status', headerName: 'Status', width: 100 },
    { field: 'createdAtITC', headerName: 'Created At', width: 180, renderCell: (params) => moment(params.value, 'DD-MM-YYYY hh:mm').format('DD-MM-YYYY hh:mm A')},
    { field: 'updatedAtITC', headerName: 'Updated At', width: 180, renderCell: params => moment(params.value, 'DD-MM-YYYY hh:mm').format('DD-MM-YYYY hh:mm A') },
  ]
}


export default function Plant() {
  // const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false)
  const [openBulk, setOpenBulk] = React.useState(false);
  const [plantList , setPlantList] = React.useState([])
  const [currentPage, setCurrentPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(1)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    getPlantList();
  }, [])

  const getPlantList = async () => {
    try {
      setLoading(true);
      const result = await axiosInstance.get(`/admin/plnt/fetch`).then(res => res.data)
      if(result.statuscode == 200) {
        setPlantList(result.data)
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
    getPlantList();
  }
  
  const handleCloseBulk = () => {
    setOpenBulk(false);
    getPlantList();
  }

  return (
    <section className="inspection-entry-form">
        
        <React.Suspense fallback={<Loader />}>
          <BulkUploadDialog url={'/admin/plnt/import'} format={PlantBulkFormat} open={openBulk} handleClose={handleCloseBulk} />
        </React.Suspense>
        <Drawer anchor={"right"} open={open} onClose={() => handleClose()} PaperProps={{ style: { width: 600 } }}> 
          <Suspense fallback={<Loader />}>
            <AddEditPlant onClose={handleClose} /> 
          </Suspense>
        </Drawer>
 
        <Breadcrumbs aria-label="breadcrumb" style={{marginBottom: "1rem"}}>
          <Link underline="hover" color="inherit" href="/"> Masters </Link>
          <Link underline="hover" color="inherit" href="/material-ui/getting-started/installation/" > Admin Modules </Link>
          <Typography sx={{ color: 'text.primary' }}>Plant</Typography>
        </Breadcrumbs>

        <Typography className="title" color="primary">
            <Factory color="primary" style={{ fontSize: "3rem", margin: "-10px 0" }} /> Plant
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
                <DataGrid sx={DataGridStyle} rows={plantList} columns={TableHeaderFormat({currentPage, pageSize})} getRowId={row => row._id}
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
