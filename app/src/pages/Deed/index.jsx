import "../../styles/ListPage.css";

import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  TextField,
  MenuItem,
  LinearProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import axiosInstance from "../../config/axiosInstance";
import { Description, HourglassTop, Map, Verified } from "@mui/icons-material";
import MUIDialog from "../../components/MUIDialog";
import AddEditDeed from "./AddEditDeed";

export default function Deed() {
  const [deedData, setDeedData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  React.useEffect(() => {
    fetchDeeds();
    document.title = "Deedwise";
  }, []);

  const fetchDeeds = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/deed/fetch");
      setDeedData(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "deedNo", headerName: "Deed No", flex: 1 },
    { field: "plotNo", headerName: "Plot No", flex: 1 },
    { field: "nameOfSeller", headerName: "Seller", flex: 1 },
    { field: "nameOfPurchaser", headerName: "Purchaser", flex: 1.5 },
    { field: "totalPurchasedArea", headerName: "Purchased Area", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: ({ value }) => {
        const color =
          value === "Active"
            ? "success"
            : value === "Open"
            ? "secondary"
            : value === "Rejected"
            ? "error"
            : "default";

        return <Chip size="small" label={value} color={color} />;
      },
    },
    { field: "creationdt", headerName: "Deed Date", flex: 1 },
  ];

  return (
    <Box className="module-container" p={3}>
      <MUIDialog open={open} handleClose={handleClose} 
      icon={<Description sx={{ color: '#fff', fontSize: 22 }} />} title={"Add New Deed"} description={"Enter legal and land aquisition details"}
      content={<AddEditDeed />}></MUIDialog>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Deedwise
          </Typography>
          <Typography color="text.secondary">
            Track, verify, and manage land acquisition deeds
          </Typography>
        </Box>

        <Button className="add-button" onClick={() => setOpen(true)}
          sx={{
            backgroundColor: "#FF7A00",
            color: "#fff",
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "14px",
            padding: "8px 14px",
            minHeight: "36px",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#E86E00",
              boxShadow: "none",
            },
          }}
        >
          <AddIcon />
          Add Deed
        </Button>
        {/* <Link to="form">

        </Link> */}
      </Box>

      {/* Stats Cards */}
      <Grid className="stats-cards" container spacing={2} mb={3}>
        {[
          { label: "Total Deeds", value: 892, icon: <Description />, bg: "#FFF3E0", color: "#FB8C00", },
          { label: "Verified Deed", value: 745, icon: <Verified />, bg: "#E8F5E9", color: "#43A047", },
          { label: "Pending Review", value: 147, icon: <HourglassTop />, bg: "#FFF8E1", color: "#F9A825", },
          { label: "Total Coverage", value: "5,132 acres", icon: <Map />, bg: "#E3F2FD", color: "#1E88E5", },
        ].map((item, i) => (
          <Grid item xs={12} md={3} key={i}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent style={{display: "flex", alignItems: "center", gap: "2rem"}}>
                {/* Left Section */}
                <Box>
                  <Typography color="text.secondary" fontSize={14}>
                    {item.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {item.value}
                  </Typography>
                </Box>
                
                {/* Right icon */}
                <Box className="right-icon" sx={{ backgroundColor: item.bg, color: item.color, }} >
                  {item.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Deed List */}
      <Card className="datagrid-card" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" fontWeight={600}>
              Deed List
            </Typography>

            {/* Filters */}
            <Box display="flex" gap={2}>
              <TextField select size="small" label="Status" fullWidth>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Verified">Verified</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </TextField>

              <TextField fullWidth size="small" type="date" label="Date range"
                InputLabelProps={{ shrink: true }}
              />

              <TextField size="small" fullWidth placeholder="Search" />
            </Box>
          </Box>

          {loading && <LinearProgress />}

          <Box height={450}>
            <DataGrid
              rows={deedData}
              columns={columns}
              getRowId={(row) => row._id}
              pageSizeOptions={[5, 10, 15]}
              disableRowSelectionOnClick
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
