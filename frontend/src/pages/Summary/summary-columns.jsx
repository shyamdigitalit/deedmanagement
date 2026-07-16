import { Chip, IconButton, Tooltip } from "@mui/material";
import { Download, EditSquare } from "@mui/icons-material";
import { Link } from "react-router";
import moment from "moment";

let headerObj = {
  "purchaseInCompany": "Purchase In Company",
  "nameOfMouza": "Mouza Name",
  "locationName": "Location Name",
  "mutatedKhatianNo": "Mutated Khatian No"
}

export const SUMMARY_COLUMNS = (props) => ([
    { field: props.groupValue, headerName: headerObj[props.groupValue] || "Group", width: 180 },
    { field: 'totalArea', headerName: 'Total Area', width: 100 },
    { field: 'totalPurchasedArea', headerName: 'Purchased Area', width: 120 },
    { field: 'remainingArea', headerName: 'Balance Area', width: 120, renderCell: (params) => {
      const remainingArea = parseFloat(params.value);
      return params.value
    } },
    { field: 'totalMutatedArea', headerName: 'Total Muted Area', width: 150 },
    { field: 'nonMutatedArea', headerName: 'Non Muted Area', width: 150 },
    // { field: 'remarks', headerName: 'Remarks', width: 180 },

    // { field: 'action', headerName: 'Actions', type: 'number',
    //   renderCell: (params) => {
        
    //     return (
    //       <div>
    //           <Tooltip title="Download Files" arrow onClick={() => props.downloadAllFiles(params.row)}> 
    //             <IconButton> <Download /> </IconButton> 
    //           </Tooltip>
    //           <Tooltip title="Edit" arrow onClick={() => props.onEdit(params.row)}> 
    //             <IconButton> <EditSquare /> </IconButton> 
    //           </Tooltip>
    //       </div>
    //     );
    //   }
    // },
  ]);