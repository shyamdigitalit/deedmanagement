import { Chip, IconButton, Tooltip } from "@mui/material";
import { Download, EditSquare } from "@mui/icons-material";
import { Link } from "react-router";
import moment from "moment";

export const DEED_COLUMNS = (props) => ([
    // { field: 'id', headerName: 'ID', width: 90 },
    // { field: 'logbookName', headerName: 'Logbook Name', width: 150 },
    { field: 'plantName', headerName: 'Plant', width: 100 },
    { field: 'deedNo', headerName: 'Deed No', width: 100 },
    { field: 'plotNo', headerName: 'Plot No', width: 100 },
    { field: 'totalArea', headerName: 'Total Area', width: 100 },
    { field: 'totalPurchasedArea', headerName: 'Purchased Area', width: 120 },
    { field: 'balanceArea', headerName: 'Balance Area', width: 100 },
    { field: 'remainingArea', headerName: 'Remaining Area', width: 120, renderCell: (params) => {
      const remainingArea = parseFloat(params.value);
      if(!remainingArea) return "";
      const color = remainingArea > 0 ? "success" : remainingArea === 0 ? "default" : "error";
      return <Chip size="small" label={params.value} color={color} />;
    } },
    { field: 'nameOfSeller', headerName: 'Seller', width: 150 },
    { field: 'nameOfPurchaser', headerName: 'Purchaser', width: 180 },
    // { field: 'shift', headerName: 'Shift', width: 100, renderCell: (params) => params.row?.shift?.shft_name },
    // { field: 'material', headerName: 'Material', width: 180, renderCell: (params) => params.row?.material?.matrl_name},
    // { field: "status", headerName: "Status", width: 80,
    //   renderCell: ({ value }) => {
    //     const color =
    //       value === "Active" ? "success" : value === "Open"
    //         ? "secondary" : value === "Rejected"
    //         ? "error" : "default";

    //     return <Chip size="small" label={value} color={color} />;
    //   },
    // },
    { field: 'createdAtITC', headerName: 'Created At', width: 180, renderCell: (params) => moment(params.value, 'DD-MM-YYYY hh:mm').format('DD-MM-YYYY hh:mm A')},
    { field: 'updatedAtITC', headerName: 'Updated At', width: 180, renderCell: params => moment(params.value, 'DD-MM-YYYY hh:mm').format('DD-MM-YYYY hh:mm A') },

    { field: 'action', headerName: 'Actions', type: 'number',
      renderCell: (params) => {
        
        return (
          <div>
              <Tooltip title="Download Files" arrow onClick={() => props.downloadAllFiles(params.row)}> 
                <IconButton> <Download /> </IconButton> 
              </Tooltip>
              <Tooltip title="Edit" arrow onClick={() => props.onEdit(params.row)}> 
                <IconButton> <EditSquare /> </IconButton> 
              </Tooltip>
          </div>
        );
      }
    },
  ]);