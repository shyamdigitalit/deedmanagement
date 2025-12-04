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
import { AcUnit, Upload } from "@mui/icons-material";
import BulkUploadDialog from "../../../components/bulkUpload";
import MaterialBulkFormat from "./MaterialBulkFormat";
import { ApprovalStatusChip } from "../../../utilities/approval-history";
import { useDispatch } from "react-redux";
import moment from "moment";
import { showSnackbar } from "../../../redux/slices/snackbar";

const AddEditMaterial = React.lazy(() => import("./add-edit-material"));



export default function Material() {

  const TableHeaderFormat = (props) => {
   
    return [
      { 
        field: 'id', headerName: 'ID', width: 50,
        renderCell: (params) => {
          return params.api.getRowIndexRelativeToVisibleRows(params.id) + 1 + (props.currentPage * props.pageSize);
        },  
      },
      { field: 'status', headerName: 'Status', width: 100, renderCell: (params) => {
        let color = params.value === "Active" ? "#81bc97" : "#df8b92";
        return <div style={{cursor: "pointer"}} onClick={() => deleteMaterials(params.id, params.value)}>
          <span style={ApprovalStatusChip(color)}>{params.value}</span>
        </div>
  
      } },
      { field: 'matrl_code', headerName: 'Code', width: 120 },
      { field: 'matrl_name', headerName: 'Name', width: 180 },
      { field: 'matrl_desc', headerName: 'Description', width: 150 },
      { field: 'matrl_type', headerName: 'Type', width: 100 },
      { field: 'matrl_grp', headerName: 'Group', width: 80 },
      { field: 'matrl_plnt', headerName: 'Plant', width: 150 },
      { field: 'createdAtITC', headerName: 'Created At', width: 180, renderCell: (params) => moment(params.value, 'DD-MM-YYYY hh:mm').format('DD-MM-YYYY hh:mm A')},
      { field: 'updatedAtITC', headerName: 'Updated At', width: 180, renderCell: params => moment(params.value, 'DD-MM-YYYY hh:mm').format('DD-MM-YYYY hh:mm A') },
    ]
  }



  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false)
  const [openBulk, setOpenBulk] = React.useState(false);
  const [materialList , setMaterialList] = React.useState([])
  // const [selectedRows, setSelectedRows] = React.useState([])
  const [currentPage, setCurrentPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(1)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    getMaterialList();
  }, [])

  const getMaterialList = async () => {
    try {
      setLoading(true);
      const result = await axiosInstance.get(`/matrl/fetch`).then(res => res.data)
      if(result.statuscode == 200) {
        setMaterialList(result.data)
        setLoading(false);
        // dispatch(showSnackbar({ message: result.message, severity: 'info', duration: 2000}));
      }
    } catch (error) {
      setLoading(false);
      console.error(error)
    }
  }

  const deleteMaterials = async (id, status) => {
    try {
      setLoading(true);
      const result = await axiosInstance.post(`/matrl/deactivate/${id}?status=${status}`).then(res => res.data)
      if (result.statuscode === 200) {
        dispatch(showSnackbar({ message: result.message, severity: 'success', duration: 2000 }));
        getMaterialList();
      } else {
        dispatch(showSnackbar({ message: result.message, severity: 'error', duration: 2000 }));
      }
    } catch (error) {
      console.error(error);
      dispatch(showSnackbar({ message: "Failed to delete materials", severity: 'error', duration: 2000 }));
    } finally {
      setLoading(false);
    }
  }
  

  const handleClose = () => {
    setOpen(false);
    getMaterialList();
  }

  const handleCloseBulk = () => {
    setOpenBulk(false);
    getMaterialList();
  }


  return (
    <section className="inspection-entry-form">
        
        <React.Suspense fallback={<Loader />}>
          <BulkUploadDialog url={'/matrl/import'} format={MaterialBulkFormat} open={openBulk} handleClose={handleCloseBulk} />
        </React.Suspense>
        <Drawer anchor={"right"} open={open} onClose={() => handleClose()} PaperProps={{ style: { width: 600 } }}> 
          <Suspense fallback={<Loader />}>
            <AddEditMaterial onClose={handleClose} /> 
          </Suspense>
        </Drawer>
 
        <Breadcrumbs aria-label="breadcrumb" style={{marginBottom: "1rem"}}>
          <Link underline="hover" color="inherit" href="/"> Masters </Link>
          <Link underline="hover" color="inherit" href="/material-ui/getting-started/installation/" > Admin Modules </Link>
          <Typography sx={{ color: 'text.primary' }}>Material</Typography>
        </Breadcrumbs>

        <Typography className="title" color="primary">
            <AcUnit color="primary" style={{ fontSize: "3rem", margin: "-10px 0" }} /> Material
        </Typography>

        <div className="button-container">
            <Button variant="outlined" size="large" className="button-css" onClick={() => setOpen(true)}>
                Add New <AddIcon style={{ margin: "-1px 0 0 2px", fontSize: 17, fontWeight: 600 }} />
            </Button>
            <Button variant="outlined" size="large" color="info" onClick={() => setOpenBulk(true)}>
                Upload <Upload style={{ margin: "-1px 0 0 2px", fontSize: 24, fontWeight: 600 }} />
            </Button>
            {/* <IconButton> <EditSquareIcon color="info" /> </IconButton> */}
            {/* {!!selectedRows.length && <IconButton onClick={() => deleteMaterials()}> <DeleteIcon color="error" /> </IconButton>} */}
        </div>
        
        <Card>
            <CardContent style={{ padding: "0px" }}>
                {loading && (<LinearProgress />)}
                <DataGrid sx={DataGridStyle} rows={materialList} columns={TableHeaderFormat({currentPage, pageSize})} getRowId={row => row._id}
                  pageSizeOptions={[5, 10, 15]} checkboxSelection disableRowSelectionOnClick
                  initialState={{ pagination: { paginationModel: { pageSize: 15, }, }, }} 
                  // onRowSelectionModelChange={event => setSelectedRows([...event.ids])}
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
