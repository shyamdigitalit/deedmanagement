import { Chip, IconButton, Tooltip } from "@mui/material";
import { EditSquare } from "@mui/icons-material";
import { Link } from "react-router";
import moment from "moment";

export const DEED_COLUMNS = (props) => ([
    // { field: 'id', headerName: 'ID', width: 90 },
    // { field: 'logbookName', headerName: 'Logbook Name', width: 150 },
    { field: 'deedNo', headerName: 'Deed Number', width: 150 },
    { field: 'plotNo', headerName: 'Plot Number', width: 150 },
    { field: 'nameOfSeller', headerName: 'Seller', width: 150 },
    { field: 'nameOfPurchaser', headerName: 'Purchaser', width: 180 },
    // { field: 'shift', headerName: 'Shift', width: 100, renderCell: (params) => params.row?.shift?.shft_name },
    // { field: 'material', headerName: 'Material', width: 180, renderCell: (params) => params.row?.material?.matrl_name},
    { field: "status", headerName: "Status", width: 80,
      renderCell: ({ value }) => {
        const color =
          value === "Active" ? "success" : value === "Open"
            ? "secondary" : value === "Rejected"
            ? "error" : "default";

        return <Chip size="small" label={value} color={color} />;
      },
    },
    { field: 'createdAtITC', headerName: 'Created At', width: 180, renderCell: (params) => moment(params.value, 'DD-MM-YYYY hh:mm').format('DD-MM-YYYY hh:mm A')},
    { field: 'updatedAtITC', headerName: 'Updated At', width: 180, renderCell: params => moment(params.value, 'DD-MM-YYYY hh:mm').format('DD-MM-YYYY hh:mm A') },

    { field: 'action', headerName: 'Actions', type: 'number',
      renderCell: (params) => {
        
        return (
          <div>
              <Tooltip title="Edit" arrow onClick={() => props.onEdit(params.row)}> 
                <IconButton> <EditSquare /> </IconButton> 
              </Tooltip>
          </div>
        );
      }
    },
  ]);