import React, { useState } from "react";
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, Chip, Stack, } from "@mui/material";

import "./home.css";
import axiosInstance from "../../config/axiosInstance";
import { useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [plantList, setPlantList] = React.useState([])

  React.useEffect(() => {
    getPlantList();
  }, [])

  const getPlantList = async () => {
    try {
      const result = await axiosInstance.get(`/admin/plnt/fetch`).then(res => res.data)
      if(result.statuscode == 200) {
        console.log(result.data)
        setPlantList(result.data)
      }
    }
    catch (error) {
      console.error(error)
    }
  }


  const handleContinue = () => {
    if (!selectedLocation) return;
    setOpen(false);
    navigate("/deed?plantId=" + selectedLocation);
  };

  return (
    <>
      <Box className="welcome-wrapper">
        {/* LEFT SECTION */}
        <Box className="left-section">
          <Typography className="title">
            Smart <span>Deed</span> Management System
          </Typography>

          <Typography className="subtitle">
            A secure, fast, and modern digital solution for storing and
            managing property deed documents — with smart indexing, quick
            search, access control, and compliance-ready structure.
          </Typography>

          <Box className="buttons">
            <Button
              className="start-btn"
              variant="contained"
              size="large"
              onClick={() => setOpen(true)}
            >
              Get Started
            </Button>

            <Button className="learn-btn" variant="outlined" size="large">
              Learn More
            </Button>
          </Box>
        </Box>

        {/* RIGHT SECTION */}
        <Box className="circle-container">
          <img src="./plot.jpg" alt="plot visual" />
        </Box>
      </Box>

      {/* LOCATION POPUP */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ className: "location-dialog", }}
        >
            <DialogTitle className="popup-title"> Choose Location </DialogTitle>

            <DialogContent>
                <Box className="chip-container">
                {plantList.map((plant) => (
                    <Box key={plant._id} onClick={() => setSelectedLocation(plant._id)}
                    className={`location-chip-card ${selectedLocation === plant._id ? "active-location" : ""}`}
                    >
                        {plant.plantName}
                    </Box>
                ))}
                </Box>

                <Button fullWidth variant="contained" className="continue-btn" disabled={!selectedLocation}
                    onClick={handleContinue}
                    >
                    Continue
                </Button>
            </DialogContent>
        </Dialog>
    </>
  );
}