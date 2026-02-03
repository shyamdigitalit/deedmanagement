import { Box, TextField, Typography } from "@mui/material";
import { Controller } from "react-hook-form";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import { stepOneFieldsArray } from "../deed-fields";


const renderFields = (section, control, errors) =>
  stepOneFieldsArray
    .filter(field => field.section === section)
    .map(field => (
      <Controller key={field.name} name={field.name} control={control} rules={field.rules}
        render={({ field: controllerField }) => (
          <TextField {...controllerField} {...field} type={field.type || "text"}
            error={!!errors[field.name]} helperText={errors[field.name]?.message || field.helperText}
          />
        )}
      />
    ));



const StepOne = ({ control, errors }) => {
    
  return (
    <Box>

      {/* =======================
          Deed & Parties
      ======================== */}
      <Box sx={cardStyles}>
        <Typography sx={sectionTitle}>
          <DescriptionOutlinedIcon fontSize="small" color="warning" />
          Deed & Parties Information
        </Typography>

        <Typography sx={sectionSubTitle}>
          Capture the legal transaction identity and involved parties
        </Typography>

        
        
        <Box sx={gridStyles}>
          {renderFields("deed", control, errors)}
        </Box>
      </Box>

      {/* =======================
          Area & Mutation
      ======================== */}
      <Box sx={cardStyles}>
        <Typography sx={sectionTitle}>
          <TimelineOutlinedIcon fontSize="small" color="warning" />
          Area & Mutation Details
        </Typography>

        <Typography sx={sectionSubTitle}>
          Capture the legal transaction identity and involved parties
        </Typography>

        <Box sx={gridStyles}>
          {renderFields("area", control, errors)}
        </Box>
      </Box>

    </Box>
  );
};

export default StepOne;




const cardStyles = {
  border: "1px solid #eee",
  borderRadius: "14px",
  p: 3,
  mb: 3,
};

const sectionTitle = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  fontWeight: 600,
};

const sectionSubTitle = {
  color: "text.secondary",
  fontSize: "0.85rem",
  mb: 2,
};

const gridStyles = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 2,
};
