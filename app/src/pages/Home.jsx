import React from "react";
import { Box, Typography, Button } from "@mui/material";

export default function WelcomePage() {
  return (
    <>
      <style>{`
        .welcome-wrapper {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          padding: 0 60px;
          background: linear-gradient(135deg, #eef2ff, #f8fafc);
          align-items: center;
          font-family: 'Inter', sans-serif;
        }

        /* LEFT SIDE */
        .left-section {
          padding-right: 40px;
          animation: fadeIn 0.8s ease-out;
        }

        .title {
          font-size: 42px;
          font-weight: 800;
          color: #1a237e;
          margin-bottom: 20px;
        }

        .subtitle {
          font-size: 18px;
          line-height: 1.6;
          max-width: 550px;
          margin-bottom: 35px;
          color: #444;
        }

        .buttons {
          display: flex;
          gap: 20px;
        }

        /* RIGHT SIDE Circular Design */
        .circle-container {
          position: relative;
          width: 420px;
          height: 420px;
          margin: auto;
          animation: fadeIn 1.2s ease-out;
        }

        .circle {
          position: absolute;
          border-radius: 50%;
          border: 4px solid rgba(30, 41, 59, 0.15);
          animation: rotate 12s linear infinite;
        }

        .circle-1 {
          width: 420px;
          height: 420px;
          top: 0;
          left: 0;
          border-color: #3b82f6;
        }

        .circle-2 {
          width: 300px;
          height: 300px;
          top: 60px;
          left: 60px;
          border-color: #10b981;
          animation-duration: 16s;
        }

        .circle-3 {
          width: 180px;
          height: 180px;
          top: 120px;
          left: 120px;
          border-color: #6366f1;
          animation-duration: 20s;
        }

        /* Center Logo */
        .center-icon {
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: #0f172a;
          top: 150px;
          left: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 1px;
          animation: popIn 0.8s ease;
        }

        /* ANIMATIONS */
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes popIn {
          from { transform: scale(0.7); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        /* RESPONSIVE */
        @media(max-width: 900px) {
          .welcome-wrapper {
            grid-template-columns: 1fr;
            text-align: center;
            padding: 40px;
            gap: 40px;
          }
          .left-section {
            padding-right: 0;
          }
        }
      `}</style>

      <Box className="welcome-wrapper">

        {/* LEFT SECTION */}
        <Box className="left-section">
          <Typography className="title">
            Deed Management System
          </Typography>

          <Typography className="subtitle">
            A complete digital solution to store, track, organize and secure
            property deed documents with streamlined indexing, fast search,
            and compliance-ready storage.
          </Typography>

          <Box className="buttons">
            <Button variant="contained" size="large">Get Started</Button>
            <Button variant="outlined" size="large">Learn More</Button>
          </Box>
        </Box>

        {/* RIGHT SECTION (Circular Design) */}
        <Box className="circle-container">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>

          <div className="center-icon">
            DMS
          </div>
        </Box>

      </Box>
    </>
  );
}
