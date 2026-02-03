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
import { stepTwoFieldsArray } from "../deed-fields";


const renderStepTwoFields = (filter, control, errors) =>
  stepTwoFieldsArray
    .filter(field => field[filter])
    .map(field => (
      <Controller key={field.name} name={field.name} control={control} rules={field.rules}
        render={({ field: controllerField }) => (
          <TextField {...controllerField} label={field.label} placeholder={field.placeholder} variant="filled"
            error={!!errors[field.name]} helperText={errors[field.name]?.message} fullWidth
          />
        )}
      />
    ));

    

const StepTwo = ({ control, errors }) => {
  return (
    <Box
      sx={{
        backgroundColor: "#FFF7ED",
        border: "1px solid #FED7AA",
        borderRadius: "12px",
        p: 3,
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
              Land Identification
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tie this deed to official government land records
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
        {renderStepTwoFields("grid", control, errors)}
      </Box>

      {/* Full-width field */}
      <Box mt={2}>
        {renderStepTwoFields("fullWidth", control, errors)}
      </Box>
    </Box>
  );
};

export default StepTwo;
