import "../../styles/ListPage.css";

import React from "react";
import { Box, Button, Card, CardContent, Typography, Grid, TextField, MenuItem, LinearProgress, FormControl, InputLabel, Select, InputAdornment, IconButton, Tabs, Tab, } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axiosInstance from "../../config/axiosInstance";
import { SUMMARY_COLUMNS } from "./summary-columns";

export default function DeedSummary() {
  const [deedData, setDeedData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [groupValue, setGroupValue] = React.useState("purchaseInCompany"); // purchaseInCompany or nameOfMouza

  React.useEffect(() => {
    document.title = "Summary";
  }, []);

  
  React.useEffect(() => {
    fetchDeeds();
  }, [groupValue]);


  const fetchDeeds = async () => {
    try {
      setLoading(true)

      const res = await axiosInstance.get( `/deed/summary?groupBy=${groupValue}` );
      setDeedData(res.data.data || []);

    } catch (err) {
      console.error(err);

    } finally {
      setLoading(false);
    }
  };


  return (
    <Box className="module-container" p={3}>
        
        <Tabs value={groupValue} onChange={(_, value) => setGroupValue(value)} >
            <Tab label="Company Wise" value="purchaseInCompany" />
            <Tab label="Mouza Wise" value="nameOfMouza" />
            <Tab label="Location" value="locationName" />
            <Tab label="Khatian" value="mutatedKhatianNo" />
        </Tabs>

        {/* Header */}
        <Box style={{position: "relative"}}>
            <Typography variant="h5" fontWeight={600} style={{position: "absolute", left: "10px",top: "15px", zIndex: 10}}> 
                {/* {groupValue === "purchaseInCompany" ? "Purchase In Company":"Mouza"} Summary  */}
            </Typography>

            <DataGrid rows={deedData} columns={SUMMARY_COLUMNS({ groupValue })} getRowId={(row) => row._id}
                pageSizeOptions={[5, 10, 15]} disableRowSelectionOnClick showToolbar density="compact"
                sx={datagridStyles}
            />
        </Box>

    </Box>
  );
}





const datagridStyles = {

    border: "1px solid #d1d5db",

    "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#fafafa",
    fontWeight: 600,
    borderBottom: "1px solid #d1d5db",
    },

    "& .MuiDataGrid-columnHeader": {
    borderRight: "1px solid #e5e7eb",
    },

    "& .MuiDataGrid-cell": {
    borderRight: "1px solid #e5e7eb",
    borderBottom: "1px solid #e5e7eb",
    py: 0,
    px: 1,
    fontSize: "0.875rem",
    display: "flex",
    alignItems: "center",
    },


    "& .MuiDataGrid-footerContainer": {
    borderTop: "1px solid #d1d5db",
    },
}