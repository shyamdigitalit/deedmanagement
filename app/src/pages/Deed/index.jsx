import "../../styles/InspectionEntryForm.css";

import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Typography, Card, CardContent, LinearProgress } from '@mui/material';
import { Link, useLocation } from "react-router-dom";
import { DataGridStyle } from "../../utilities/datagridStyle";
import { Description } from "@mui/icons-material";
import axiosInstance from "../../config/axiosInstance";
import { DEED_COLUMNS } from "./deed-columns";


export default function Deed() {

  const location = useLocation();
  const [rmtdcData, setDeedData] = React.useState([]);
  const [loading, setLoading] = React.useState("");

  React.useEffect(() => {
    getShiftList();
    document.title = "Deed";
  }, []);


  React.useEffect(() => {
    // Fetch Deed data when component mounts
    const controller = new AbortController();
    const getDeedData = async () => {
    
      try {
        setLoading("Loading");
        const response = await axiosInstance.get(`/rmtc/fetch`, {
          signal: controller.signal
        }).then(res => res.data)
        if (response.statuscode === 200) {
          setDeedData(response.data);
          setLoading("");
        } else {
          console.error("Failed to fetch Deed data:", response.message);
          setLoading("");
        }

      } catch (error) {
        // console.log(error)
      } finally {
        setLoading("");
      }
    }
  
    getDeedData();

    return () => controller.abort();
  }, []);
  

  
  const getShiftList = async () => {
    try {
      const result = await axiosInstance.get(`/shft/fetch`).then(res => res.data)
      if(result.statuscode == 200) {
        setShiftList(result.data)
      }
    } catch (error) {
      console.error(error)
    }
}

  return (
    <section className="inspection-entry-form">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "start", gap: "2rem", marginBottom: "1rem" }}>
          {/* <Typography className="title" color="primary">
              <Description color="primary" style={{ fontSize: "3rem", margin: "-10px 0" }} /> Deed
          </Typography> */}
          <Link to={"form"}>
            <Button variant="outlined" size="large" className="button-css">
                <AddIcon style={{ margin: "-1px 0 0 2px", fontSize: 25, fontWeight: 600 }} />
            </Button>
          </Link>
        </div>
        
        {/* <div style={{fontSize: "1rem", color: "#888"}}> TC NO. :  SSPL INDORE/LAB/JUNE-16/SC-00 </div> */}

        
        <Card>
            <CardContent style={{ padding: "0px" }}>

              {loading && (<LinearProgress />)}
              <DataGrid showToolbar
                sx={DataGridStyle} rows={rmtdcData} columns={DEED_COLUMNS} getRowId={row => row._id}
                pageSizeOptions={[5, 10, 15]} checkboxSelection disableRowSelectionOnClick
                onRowSelectionModelChange={event => setSelectedRows([...event.ids])}
                initialState={{
                  pagination: { paginationModel: { pageSize: 15, }, },
                }} 
              />
            </CardContent>
        </Card>
    </section>
  );
}

