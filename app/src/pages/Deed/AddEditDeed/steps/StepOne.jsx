import { Box, TextField, Typography } from "@mui/material";
import { Controller } from "react-hook-form";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";

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
          <Controller
            name="deedNo"
            control={control}
            rules={{ required: "Deed No is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Deed No *"
                placeholder="eg., D-2024-5245"
                variant="outlined"
                error={!!errors.deedNo}
                helperText="Unique legal number assigned to this deed"
              />
            )}
          />

          <Controller
            name="dateOfRegistration"
            control={control}
            rules={{ required: "Date of registration is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Date of registration *"
                type="date"
                InputLabelProps={{ shrink: true }}
                error={!!errors.dateOfRegistration}
              />
            )}
          />

          <Controller
            name="nameOfSeller"
            control={control}
            rules={{ required: "Seller name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Name of the Seller *"
                placeholder="Enter Seller name"
                error={!!errors.nameOfSeller}
              />
            )}
          />

          <Controller
            name="nameOfPurchaser"
            control={control}
            rules={{ required: "Purchaser name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Name of the Purchaser *"
                placeholder="Enter Purchaser name"
                error={!!errors.nameOfPurchaser}
              />
            )}
          />
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
          <Controller
            name="totalAreaOfplotNo"
            control={control}
            rules={{ required: "Required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Total Area of Plot"
                type="number"
                placeholder="0.00"
                error={!!errors.totalAreaOfplotNo}
              />
            )}
          />

          <Controller
            name="totalPurchasedArea"
            control={control}
            rules={{ required: "Required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Purchased Area as per Deed"
                type="number"
                placeholder="0.00"
                error={!!errors.totalPurchasedArea}
              />
            )}
          />

          <Controller
            name="totalMutatedArea"
            control={control}
            rules={{ required: "Required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Total Mutated Area"
                type="number"
                placeholder="0.00"
                error={!!errors.totalMutatedArea}
              />
            )}
          />

          <Controller
            name="nonMutatedArea"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Non-Mutated Area"
                type="number"
                placeholder="0.00"
                disabled
                helperText="Auto-calculated: Purchased - Mutated"
              />
            )}
          />
        </Box>
      </Box>

    </Box>
  );
};

export default StepOne;
