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
          padding: 20px 70px 0 70px;
          align-items: center;
          background: linear-gradient(135deg, #edf2ff, #f8fafc);
          font-family: "Inter", sans-serif;
        }

        /* LEFT SECTION */
        .left-section {
          padding-right: 40px;
          animation: fadeIn 0.7s ease-out;
        }

        .title {
          font-size: 48px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
          margin-bottom: 24px;
        }

        .title span {
          color: #4f46e5;
        }

        .subtitle {
          font-size: 18px;
          line-height: 1.7;
          max-width: 560px;
          color: #475569;
          margin-bottom: 32px;
        }

        .buttons {
          display: flex;
          gap: 16px;
          margin-top: 10px;
        }

        .buttons button {
          padding: 12px 28px;
          border-radius: 30px;
          font-size: 16px;
          font-weight: 600;
          transition: 0.25s ease-out;
        }

        .buttons .start-btn {
          background: #4f46e5;
          box-shadow: 0 6px 16px rgba(79, 70, 229, 0.25);
        }

        .buttons .start-btn:hover {
          background: #4338ca;
          box-shadow: 0 8px 20px rgba(79, 70, 229, 0.35);
          transform: translateY(-2px);
        }

        .buttons .learn-btn:hover {
          background: rgba(0,0,0,0.04);
          transform: translateY(-2px);
        }

        /* RIGHT SIDE – Circular Visual */
        .circle-container {
          display: flex;
          justify-content: center;
          align-items: center;
          animation: fadeInUp 1s ease-out;
        }

        .circle-container img {
          margin-top: 50px;
          width: 440px;
          height: 440px;
          object-fit: cover;
          border-radius: 50%;
          border: 10px solid #ffffff;
          box-shadow:
            0 15px 40px rgba(15, 23, 42, 0.15),
            0 0 60px rgba(79, 70, 229, 0.15);
          animation: float 7s ease-in-out infinite;
        }


        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }


        /* ✨ NEW Multi-direction Floating Animation */
        @keyframes float {
          0% {
            transform: translate(0px, 0px) rotate(0deg) scale(1);
          }
          25% {
            transform: translate(10px, -12px) rotate(2deg) scale(1.02);
          }
          50% {
            transform: translate(0px, -20px) rotate(-2deg) scale(1.03);
          }
          75% {
            transform: translate(-10px, -12px) rotate(1.5deg) scale(1.02);
          }
          100% {
            transform: translate(0px, 0px) rotate(0deg) scale(1);
          }
        }

        /* RESPONSIVE */
        @media (max-width: 950px) {
          .welcome-wrapper {
            grid-template-columns: 1fr;
            padding: 40px 35px;
            text-align: center;
            gap: 40px;
          }

          .left-section {
            padding-right: 0;
          }

          .circle-container img {
            width: 320px;
            height: 320px;
          }

          .buttons {
            justify-content: center;
          }
        }
      `}</style>

      <Box className="welcome-wrapper">

        {/* LEFT SECTION */}
        <Box className="left-section">
          <Typography className="title">
            Smart <span>Deed</span> Management System
          </Typography>

          <Typography className="subtitle">
            A secure, fast, and modern digital solution for storing and managing
            property deed documents — with smart indexing, quick search,
            access control, and compliance-ready structure.
          </Typography>

          <Box className="buttons">
            <Button className="start-btn" variant="contained" size="large">
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
    </>
  );
}
