import { styled } from "@mui/material/styles";
import StepConnector from "@mui/material/StepConnector";

const CustomConnector = styled(StepConnector)(() => ({
  "& .MuiStepConnector-line": {
    borderTopWidth: 2,
    borderRadius: 1,
    borderColor: "#E5E7EB",
  },

  "&.Mui-active .MuiStepConnector-line": {
    borderColor: "#FF6A00",
  },

  "&.Mui-completed .MuiStepConnector-line": {
    borderColor: "#FF6A00",
  },
}));


export default CustomConnector;