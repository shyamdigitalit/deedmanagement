import "../../../styles/InspectionEntryForm.css";
import React, { Suspense } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import DeleteIcon from '@mui/icons-material/Delete';

import { DataGrid } from '@mui/x-data-grid';
import { Button, Typography, IconButton, Card, CardContent, Breadcrumbs, Drawer, LinearProgress, Tooltip } from '@mui/material';
import { Link } from "react-router-dom";
import { Badge, CorporateFare, EditSquare } from "@mui/icons-material";
import { DataGridStyle } from "../../../utilities/datagridStyle";
import axiosInstance from '../../../config/axiosInstance'
// import { useDispatch } from "react-redux";
import Loader from "../../../components/loader";
import moment from "moment";
import { ApprovalStatusChip } from "../../../utilities/approval-history";
import { showSnackbar } from "../../../redux/slices/snackbar";
import { useDispatch } from "react-redux";
import { swapRefresh } from "../../../redux/slices/functionRefresh";

const AddEditFunction = React.lazy(() => import("./add-edit-function"));



export default function Function() {

  const TableHeaderFormat = (props) => {
   
    return [
      { 
        field: 'id', headerName: 'ID', width: 100,
        renderCell: (params) => {
          return params.api.getRowIndexRelativeToVisibleRows(params.id) + 1 + (props.currentPage * props.pageSize);
        },  
      },
      { field: 'status', headerName: 'Status', width: 100, renderCell: (params) => {
        let color = params.value === "Active" ? "#81bc97" : "#df8b92";
        return <div style={{cursor: "pointer"}} onClick={() => deleteFunctions(params.id, params.value)}>
          <span style={ApprovalStatusChip(color)}>{params.value}</span>
        </div>
  
      } },
      { field: 'func_code', headerName: 'Function Code', width: 150 },
      { field: 'func_name', headerName: 'Function Name', width: 250 },
      { field: 'func_path', headerName: 'Function Path', width: 250 },
      { field: 'func_query', headerName: 'Function Query', width: 250 },
      { field: 'createdAtITC', headerName: 'Created At', width: 180, renderCell: (params) => moment(params.value, 'DD-MM-YYYY hh:mm').format('DD-MM-YYYY hh:mm A')},
      { field: 'updatedAtITC', headerName: 'Updated At', width: 180, renderCell: params => moment(params.value, 'DD-MM-YYYY hh:mm').format('DD-MM-YYYY hh:mm A') },
    ]
  }

  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false)
  const [functionList , setFunctionList] = React.useState([])
  const [currentPage, setCurrentPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const [selectedRows, setSelectedRows] = React.useState([])

  React.useEffect(() => {
      getFunctionList()
  }, [])

  const getFunctionList = async () => {
    try {
      setLoading(true);
      const result = await axiosInstance.get(`/func/fetch`).then(res => res.data)
      setFunctionList(result.data)
      setLoading(false);
      if(result.statuscode == 200) {
        // dispatch(showSnackbar({ message: result.message, severity: 'info', duration: 2000}));
      }
    } catch (error) {
      setLoading(false);
      console.error(error)
    }
  }

  const deleteFunctions = async (id, status) => {
    try {
      setLoading(true);
      const result = await axiosInstance.put(`/func/update?id=${id}&status=${status}`).then(res => res.data)
      if (result.statuscode === 201) {
        getFunctionList();
        dispatch(swapRefresh()); // Trigger refresh in function list
        dispatch(showSnackbar({ message: result.message, severity: 'success', duration: 2000 }));
      } else {
        dispatch(showSnackbar({ message: result.message, severity: 'error', duration: 2000 }));
      }
    } catch (error) {
      console.error(error);
      dispatch(showSnackbar({ message: "Failed to delete functions", severity: 'error', duration: 2000 }));
    } finally {
      setLoading(false);
    }
  }

  const handleClose = () => {
    setOpen(false);
    getFunctionList();
  }

  return (
    <section className="inspection-entry-form">
        
        <Drawer anchor={"right"} open={open} onClose={() => handleClose()} PaperProps={{ style: { width: 600 } }}> 
          <Suspense fallback={<Loader />}>
            <AddEditFunction data={functionList.find(item => item._id === selectedRows[0])} onClose={handleClose} /> 
          </Suspense>
        </Drawer>
 
        <Breadcrumbs aria-label="breadcrumb" style={{marginBottom: "1rem"}}>
          <Link underline="hover" color="inherit" href="/"> Masters </Link>
          <Link underline="hover" color="inherit" href="/material-ui/getting-started/installation/" > Admin Modules </Link>
          <Typography sx={{ color: 'text.primary' }}>Function</Typography>
        </Breadcrumbs>

        <Typography className="title" color="primary">
            <Badge color="primary" style={{ fontSize: "3rem", margin: "-10px 0" }} /> Function
        </Typography>

        <div className="button-container">
            <Button variant="outlined" size="large" className="button-css" onClick={() => {setOpen(true);setSelectedRows([])}}>
                Add New <AddIcon style={{ margin: "-1px 0 0 2px", fontSize: 17, fontWeight: 600 }} />
            </Button>
            {selectedRows.length === 1 && <IconButton onClick={() => setOpen(true)}> <EditSquareIcon color="info" /> </IconButton>}
            <IconButton> <DeleteIcon color="error" /> </IconButton>
        </div>
        
        <Card>
            <CardContent style={{ padding: "0px" }}>
                {loading && (<LinearProgress />)}
                <DataGrid sx={DataGridStyle} rows={functionList} columns={TableHeaderFormat({currentPage, pageSize})} getRowId={row => row._id}
                  pageSizeOptions={[5, 10, 15]} checkboxSelection disableRowSelectionOnClick
                  initialState={{ pagination: { paginationModel: { pageSize: 15, }, }, }} 
                  onRowSelectionModelChange={event => setSelectedRows([...event.ids])}
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
