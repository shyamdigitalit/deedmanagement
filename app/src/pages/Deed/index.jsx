import "../../styles/ListPage.css";

import React from "react";
import { Box, Button, Card, CardContent, Typography, Grid, TextField, MenuItem, LinearProgress, FormControl, InputLabel, Select, } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { DataGrid } from "@mui/x-data-grid";
import axiosInstance from "../../config/axiosInstance";
import { Description, HourglassTop, Map, Verified } from "@mui/icons-material";
import MUIDialog from "../../components/MUIDialog";
import AddEditDeed from "./AddEditDeed";
import { DEED_COLUMNS } from "./deed-columns";
import { useSearchParams } from "react-router";

export default function Deed() {
  const [searchParams] = useSearchParams();
  const [deedData, setDeedData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [selectedDeed, setSelectedDeed] = React.useState(null);
  const [plantList, setPlantList] = React.useState([])
  const [filters, setFilters] = React.useState({
    plantId: searchParams.get('plantId'),
    deedNo: "",
    plotNo: "",
    nameOfSeller: "",
    nameOfPurchaser: "",
    fromDate: "",
    toDate: "",
  });

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    fetchDeeds();
  };

  React.useEffect(() => {
    getPlantList();
    document.title = "Deedwise";
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => fetchDeeds(filters), 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const fetchDeeds = async (customFilters = filters) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      Object.entries(customFilters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const res = await axiosInstance.get( `/deed/fetch?${queryParams.toString()}` );
      setDeedData(res.data.data || []);

    } catch (err) {
      console.error(err);

    } finally {
      setLoading(false);
    }
  };

  const getPlantList = async () => {
    try {
      const result = await axiosInstance.get(`/admin/plnt/fetch`).then(res => res.data)
      if(result.statuscode == 200) {
        setPlantList(result.data)
      }
    }
    catch (error) {
      console.error(error)
    }
  }


  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };


  const onEdit = (row) => {
    // console.log(row)
    setSelectedDeed(row)
    handleClickOpen();
  }

  const downloadAllFiles = async (row) => {
    try {
      const response = await axiosInstance.get(`/file/downloadall?files=${row.deedDocs.map(doc => doc.filId).join(",")}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Deed_${row.deedNo}_Docs.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading documents:", error);
    } 
  }

  return (
    <Box className="module-container" p={3}>

      <MUIDialog open={open} handleClose={handleClose} 
        icon={<Description sx={{ color: '#fff', fontSize: 22 }} />} 
        title={selectedDeed ? "Update Detail" : "Add New Detail"} 
        description={"Enter legal and land aquisition details"}
        content={<AddEditDeed selectedDeed={selectedDeed} handleClose={handleClose}  />}>
      </MUIDialog>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Land Management
          </Typography>
          <Typography color="text.secondary">
            Track, verify, and manage land acquisition
          </Typography>
        </Box>

        <Button className="add-button" onClick={() => {
          setSelectedDeed(null)
          setOpen(true)
        }}>
          <AddIcon /> Add Deed </Button>
        {/* <Link to="form">

        </Link> */}
      </Box>

      {/* Deed List */}
      <Card className="datagrid-card" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} >
            <Typography variant="h6" fontWeight={600}>
              {/* Deed List */}
            </Typography>

            {/* Filters */}
            <Box display="flex" gap={2} flexWrap="wrap">

              {!!plantList.length && <FormControl size="small" variant="outlined" fullWidth style={{width: 150}}>
                <InputLabel id="plant-label">Location</InputLabel>
                <Select labelId="plant-label" id="plant" defaultValue={filters.plantId || ""}
                onChange={(e) => handleFilterChange("plantId", e.target.value)}>
                  <MenuItem value=""> <em>Select</em> </MenuItem>
                  {plantList.map((plant) => (
                    <MenuItem key={plant._id} value={plant._id}>
                      {plant.plantName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>}


              <TextField size="small" label="Deed No" value={filters.deedNo} style={{width: 130}}
                onChange={(e) => handleFilterChange("deedNo", e.target.value)}
              />

              <TextField size="small" label="Plot No" value={filters.plotNo} style={{width: 130}}
                onChange={(e) => handleFilterChange("plotNo", e.target.value) }
              />

              <TextField size="small" label="Seller" value={filters.nameOfSeller}
                onChange={(e) => handleFilterChange("nameOfSeller", e.target.value) }
              />

              <TextField size="small" label="Purchaser" value={filters.nameOfPurchaser}
                onChange={(e) => handleFilterChange("nameOfPurchaser", e.target.value) }
              />

              <TextField type="date" size="small" label="From Date" value={filters.fromDate}
                onChange={(e) => handleFilterChange("fromDate", e.target.value) }
                InputLabelProps={{ shrink: true }}
              />

              <TextField type="date" size="small" label="To Date" value={filters.toDate}
                onChange={(e) => handleFilterChange("toDate", e.target.value) }
                InputLabelProps={{ shrink: true }}
              />

            </Box>
          </Box>

          {loading && <LinearProgress />}

          <Box height={450}>
            <DataGrid rows={deedData} columns={DEED_COLUMNS({ onEdit, downloadAllFiles })} getRowId={(row) => row._id}
              pageSizeOptions={[5, 10, 15]} disableRowSelectionOnClick showToolbar
              sx={{
                border: "none",
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#fafafa",
                  fontWeight: 600,
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
