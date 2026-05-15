import React, { useState } from "react";
import { Box, Button, Card, CardContent, Typography, Grid, TextField, MenuItem, LinearProgress, Autocomplete, } from "@mui/material";
import "./deedbank.css";
import axiosInstance from "../../config/axiosInstance";
import store from "../../redux/store";

export default function DeedBank() {

  const [selectedDeed, setSelectedDeed] = useState(null);
  const [deedOptions, setDeedOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // owners + table
  const [owners, setOwners] = useState([]);
  const [tableData, setTableData] = useState([]);

  const searchDeeds = async (searchText) => {
    try {
      if (!searchText || searchText.length < 2) {
        setDeedOptions([]);
        return;
      }

      setLoading(true);

      const res = await axiosInstance.get(`/deed/search?search=${searchText}`);
      setDeedOptions(res.data?.data || []);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGo = async () => {
    try {
      if (!selectedDeed?.nameOfSeller) return;
      const res = await axiosInstance.get( `/deed/search?sellerName=${selectedDeed.nameOfSeller}` );
      const sellerDeeds = res.data?.data || [];

      setOwners(sellerDeeds);
      setTableData([]);
      
    } catch (error) {
      console.error(error);
    }
  };

  const handleFolderClick = (owner) => {
    setTableData(owner.deedDocs || []);
  };

  const downloadFile = async (file) => {
    try {
      const response = await axiosInstance.get(`/file/download/${file.filId}`, {responseType: "blob"});
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", file.filName);
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error) {
      console.error("Error downloading documents:", error);
    } 
    
  }
  
  const viewFile = async (file) => {
    const { accessToken } = store.getState().auth;
    try {
      window.open( `${axiosInstance.defaults.baseURL}/file/view/${file.filId}?accessToken=${accessToken}`, "_blank" );
    } catch (error) {
      console.error("Error viewing document:", error);
    }
  };

  return (
    
    <div className="bank-wrapper">
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
              <Autocomplete className="deed-autocomplete" style={{ width: 300}} size="small" 
                options={deedOptions} loading={loading} value={selectedDeed}
                onChange={(event, newValue) => setSelectedDeed(newValue)}
                onInputChange={(event, value) => searchDeeds(value)}
                getOptionLabel={(option) =>
                  option?.deedNo ? `${option.deedNo} - ${option.nameOfPurchaser || ""}` : ""
                }
                filterOptions={(x) => x}
                renderInput={(params) => (<TextField {...params} placeholder="Search Deed No" />)}
              />

              <button className="go-btn" onClick={handleGo}>
                GO
              </button>
            </div>
          </div>

          {/* SECTION 2 - ALWAYS VISIBLE */}
          <div className="right-box">
            {owners.length === 0 ? (
              <div>No Owners Selected</div>
            ) : (
              owners.map((owner, index) => (
                <div className="owner-row" key={index}>
                  <span>{owner.nameOfSeller}</span>
                  <button className="folder-btn" onClick={() => handleFolderClick(owner)} >
                    Go to folder
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SECTION 3 - ALWAYS VISIBLE TABLE */}
        <h3 className="document-title">Documents</h3>
        {/* {JSON.stringify(tableData)} */}
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
                <td colSpan="4">
                  No Data Available
                </td>
              </tr>
            ) : (
              tableData.map((file, index) => (
                <tr key={index}>
                  <td>{file.filName}</td>
                  <td>{file.filContentSize}</td>
                  <td>{file.fileUploadDate}</td>
                  <td>
                    <button className="view-btn" onClick={() => viewFile(file)}>View</button>
                    <button className="download-btn" onClick={() => downloadFile(file)}>Download</button>
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
