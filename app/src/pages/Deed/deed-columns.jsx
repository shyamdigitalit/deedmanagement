import { IconButton, Tooltip } from "@mui/material";
import { EditSquare } from "@mui/icons-material";
import { Link } from "react-router";
import moment from "moment";

export const DEED_COLUMNS = [
    // { field: 'id', headerName: 'ID', width: 90 },
    // { field: 'logbookName', headerName: 'Logbook Name', width: 150 },
    { field: 'tcNo', headerName: 'Deed Number', width: 150 },
    { field: 'gpNo', headerName: 'Plot Number', width: 150 },
    { field: 'poNo', headerName: 'Name of Seller', width: 150 },
    { field: 'grnNo', headerName: 'Name of Purchaser', width: 180 },
    // { field: 'shift', headerName: 'Shift', width: 100, renderCell: (params) => params.row?.shift?.shft_name },
    // { field: 'material', headerName: 'Material', width: 180, renderCell: (params) => params.row?.material?.matrl_name},
    { field: 'createdAtITC', headerName: 'Created At', width: 180, renderCell: (params) => moment(params.value, 'DD-MM-YYYY hh:mm').format('DD-MM-YYYY hh:mm A')},
    { field: 'updatedAtITC', headerName: 'Updated At', width: 180, renderCell: params => moment(params.value, 'DD-MM-YYYY hh:mm').format('DD-MM-YYYY hh:mm A') },
    
    { field: 'action', headerName: 'Actions', type: 'number', width: 100,
      renderCell: (params) => {
        
        return (
          <div>
              <Link to={`form?_id=${params.row._id}`}><Tooltip title="Edit" arrow> 
                <IconButton> <EditSquare /> </IconButton> 
              </Tooltip></Link>
          </div>
        );
      }
    },
  ];