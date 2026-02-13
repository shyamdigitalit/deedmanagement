import {
  Box,
  Typography,
  TextField,
  Chip,
  Stack,
} from "@mui/material";
import { Controller } from "react-hook-form";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { stepTwoFieldsArray } from "../plot-fields";
import { TimelineOutlined } from "@mui/icons-material";


const renderStepTwoFields = (section, control, errors) =>
  stepTwoFieldsArray
    .filter(field => field.section === section)
    .map(field => (
      <Controller key={field.name} name={field.name} control={control} rules={field.rules}
        render={({ field: controllerField }) => (
          <TextField {...controllerField} label={field.label} placeholder={field.placeholder} variant={field.variant || "outlined"}
            error={!!errors[field.name]} helperText={errors[field.name]?.message || field.helperText} fullWidth
            disabled={field.disabled ? true : false}
          />
        )}
      />
    ));

    

const StepTwo = ({ control, errors }) => {
  return (
    <Box>
      <Box
        sx={{
          backgroundColor: "#FFF7ED",
          border: "1px solid #FED7AA",
          borderRadius: "12px",
          p: 3,
          mb: 3
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          mb={3}
        >
          <Stack direction="row" spacing={1.5}>
            <LocationOnOutlinedIcon sx={{ color: "#FB923C", mt: "2px" }} />
            <Box>
              <Typography fontWeight={600}>
                Plot Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tie this plot to official government land records
              </Typography>
            </Box>
          </Stack>

          <Chip
            icon={<InfoOutlinedIcon />}
            label="Required for traceability"
            size="small"
            sx={{
              backgroundColor: "#FFEDD5",
              color: "#9A3412",
              fontWeight: 500,
            }}
          />
        </Stack>

        {/* 3-column grid fields */}
        <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2} >
          {renderStepTwoFields("plot", control, errors)}
        </Box>

        {/* Full-width field */}
        {/* <Box mt={2}>
          {renderStepTwoFields("fullWidth", control, errors)}
        </Box> */}
      </Box>



      <Box sx={cardStyles}>
        <Typography sx={sectionTitle}>
          <TimelineOutlined fontSize="small" color="warning" />
          Plot Calculation
        </Typography>

        <Typography sx={sectionSubTitle}>
          Capture the legal transaction identity and involved parties
        </Typography>

        <Box sx={gridStyles}>
          {renderStepTwoFields("calculation", control, errors)}
          {/* {renderFields("area", control, errors)} */}
        </Box>
      </Box>
    </Box>
  );
};

export default StepTwo;



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
