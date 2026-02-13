import React, { useState } from "react";
import { Box, Button, Card, CardContent, Typography, Grid, TextField, MenuItem, LinearProgress, } from "@mui/material";
import "./deedbank.css";

export default function DeedBank() {
  const deedData = [
    {
      id: 1,
      name: "Deed of 3B, Ashoka Road",
      owners: [
        {
          name: "Smt. Sumitra Devi Agarwal",
          files: [
            {
              name: "Deed No 5774 dt.25.05.2089 area 1600 sq.ft.pdf",
              size: "15.4 MB",
              modified: "2/1/2023, 4:33:52 PM"
            }
          ]
        },
        {
          name: "Sri M.P Agarwal & Sons (HUF)",
          files: [
            {
              name: "HUF Document.pdf",
              size: "10 MB",
              modified: "2/1/2023, 4:33:52 PM"
            }
          ]
        }
      ]
    },
    {
      id: 2,
      name: "Deed of Burdwan",
      owners: []
    }
  ];

  const [selectedDeedId, setSelectedDeedId] = useState("");
  const [owners, setOwners] = useState([]);
  const [tableData, setTableData] = useState([]);

  const handleGo = () => {
    const deed = deedData.find(
      (d) => d.id === Number(selectedDeedId)
    );

    if (!deed) return;

    setOwners(deed.owners);
    setTableData([]); // clear table until folder clicked
  };

  const handleFolderClick = (owner) => {
    setTableData(owner.files);
  };

  return (
    
    <div className="wrapper">
      <Box>
          <Typography variant="h5" fontWeight={600}>
            Deedwise
          </Typography>
          <Typography color="text.secondary">
            Track, verify, and manage land acquisition deeds
          </Typography>
        </Box>
      <div className="card">

        {/* SECTION 1 - SEARCH */}
        <div className="top-section">
          <div className="left-box">
            <label>Deed</label>
            <div className="dropdown-row">
              <select
                value={selectedDeedId}
                onChange={(e) => setSelectedDeedId(e.target.value)}
              >
                <option value="">Search</option>
                {deedData.map((deed) => (
                  <option key={deed.id} value={deed.id}>
                    {deed.name}
                  </option>
                ))}
              </select>

              <button className="go-btn" onClick={handleGo}>
                GO
              </button>
            </div>
          </div>

          {/* SECTION 2 - ALWAYS VISIBLE */}
          <div className="right-box">
            {owners.length === 0 ? (
              <div className="empty-text">No Owners Selected</div>
            ) : (
              owners.map((owner, index) => (
                <div className="owner-row" key={index}>
                  <span>{owner.name}</span>
                  <button
                    className="folder-btn"
                    onClick={() => handleFolderClick(owner)}
                  >
                    Go to folder
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SECTION 3 - ALWAYS VISIBLE TABLE */}
        <h3 className="title">Documents</h3>

        <table className="file-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Modified</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {tableData.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-text">
                  No Data Available
                </td>
              </tr>
            ) : (
              tableData.map((file, index) => (
                <tr key={index}>
                  <td>{file.name}</td>
                  <td>{file.size}</td>
                  <td>{file.modified}</td>
                  <td>
                    <button className="view-btn">View</button>
                    <button className="download-btn">Download</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

      </div>
    </div>
  );
}
