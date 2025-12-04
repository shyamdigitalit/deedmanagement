import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import * as XLSX from "xlsx";
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../redux/slices/snackbar';
import axiosInstance from '../config/axiosInstance';
import { LinearProgress } from '@mui/material';
import { useSmoothProgress } from '../utilities/hooks/useSmoothProgress';

export default function BulkUploadDialog(props) {
  const dispatch = useDispatch();
  const [uploadedData, setUploadedData] = React.useState([]);
  const [responseAvailable, setResponseAvailable] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = useSmoothProgress()
  // const user = useSelector(state => state.auth.user);

  React.useEffect(() => {
    if (props.open) {
      setUploadedData([]); // Reset uploaded data when dialog opens
      setResponseAvailable(false)
    }
  }, [props.open]);
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const fileType = file.type;
    const fileName = file.name;
  
    const isCSV = fileType === "text/csv" || fileName.endsWith(".csv");
    const isExcel =
      fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      fileName.endsWith(".xlsx");
  
    if (isCSV) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result.trim();
        const [headerLine, ...lines] = text.split("\n");
        const headers = headerLine.split(",").map(h => h.trim());
  
        const rows = lines.map(line => {
          const values = line.split(",").map(v => v.trim());
          return Object.fromEntries(headers.map((key, i) => [key, values[i]]));
        });
  
        setUploadedData(rows);
        console.log("CSV Data as objects:", rows);
      };
      reader.onerror = () => console.error("Error reading CSV file.");
      reader.readAsText(file);
    } else if (isExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" }); // ← returns array of objects
          
          setUploadedData(rows);
          console.log("Excel Data as objects:", rows);
        } catch (error) {
          console.error("Error parsing Excel file:", error);
        }
      };
      reader.onerror = () => console.error("Error reading Excel file.");
      reader.readAsArrayBuffer(file);
    } else {
      console.error("Unsupported file type. Please upload a CSV or Excel file.");
    }
  };


  const handleDownloadTemplate = (templateData, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    XLSX.writeFile(workbook, filename);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setProgress(0);
    setResponseAvailable(false);

    const totalRecords = uploadedData.length;
    let uploadedCount = 0;
    let responseChunks = [];

    try {
      for (const record of uploadedData) {
        const response = await axiosInstance.post(props.url, [record], {
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.data?.resfl) {
          responseChunks.push(...response.data.resfl);
        }

        uploadedCount += 1;
        setProgress(Math.round((uploadedCount / totalRecords) * 100));
      }

      if (responseChunks.length > 0) {
        setUploadedData(responseChunks);
        setResponseAvailable(true);
      }

      setLoading(false);
      dispatch(showSnackbar({ message: "Upload completed", severity: 'success' }));
    } catch (error) {
      console.log(error.message);
      const message = error?.response?.data?.message || error.message;
      dispatch(showSnackbar({ message, severity: 'error' }));
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUploadedData([]);
    setResponseAvailable(false);
    setProgress(0)
    document.getElementById("file-upload").value = ""; // Reset file input
  }
  
  

  return (
    <React.Fragment>
      <Dialog
        open={props.open}
        onClose={props.handleClose}
        slotProps={{
          paper: {
            component: 'form',
            onSubmit: (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const formJson = Object.fromEntries(formData.entries());
              const email = formJson.email;
              console.log(email);
              props.handleClose();
            },
          },
        }}
      >
        <DialogTitle>Bulk Upload</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To map the auction process, please upload a file that contains the auctionId and process Id in a structured format.
          </DialogContentText>

          

          <TextField margin="normal" id="file-upload" name="fileUpload" type="file" fullWidth inputProps={{ accept: ".csv, .xlsx" }}
            helperText="Please upload a CSV or Excel file." onChange={handleFileUpload}
          />
          

          {uploadedData.length > 0 ? (
            <div style={{ marginTop: '20px', maxHeight: "45vh", overflowX: "auto" }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {Object.keys(uploadedData[0]).map((header, index) => (
                      <th key={index} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uploadedData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex} style={{ 
                          border: '1px solid #ddd', padding: '8px', 
                          color: cellIndex > 2 ? 
                            row.upload_status === "Error" ? "darkred" : 
                            row.upload_status === "Warning" ? "orange" : 
                            row.upload_status === "Success" ? "green" : "black" : "black" 
                          }}>
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img src="/upload-vector.png" alt="Bulk Link Illustration" width={250} />
          </div>}

        </DialogContent>
        <DialogActions style={{ padding: '16px' }}>
          {responseAvailable ? (<Button onClick={() => handleDownloadTemplate(uploadedData, "Upload_Response.xlsx")}>Download Response</Button>) :
          uploadedData.length > 0 ? (<Button variant="contained" type="button" onClick={handleSubmit} disabled={loading}> {loading ? "Uploading ...": "Upload"} </Button>) : 
          (<Button onClick={() => handleDownloadTemplate(props.format, "Upload_Template.xlsx")}>Download Template</Button>)}

          <Button color="warning" type="button" onClick={handleReset}>Reset</Button>
        </DialogActions>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 10,
            marginLeft: 2,
            marginRight: 2,
            borderRadius: 5,
            transition: 'all 0.2s ease-out',
            backgroundColor: '#eee',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#71df75ff',
            },
          }}
        />
        <p style={{ fontSize: '15px', fontWeight: '600', marginLeft: '15px', marginRight: '15px' }}>
          {progress.toFixed(0)}% Uploaded {loading && '⏳'}
        </p>

        {loading && (<LinearProgress />)}

      </Dialog>
    </React.Fragment>
  );
}
