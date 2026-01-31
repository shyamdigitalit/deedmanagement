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

      {/* Fields */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(3, 1fr)"
        gap={2}
      >
        <Controller
          name="mouzaName"
          control={control}
          rules={{ required: "Required" }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Mouza Name"
              placeholder="Enter mouza"
              variant="filled"
              error={!!errors.mouzaName}
              fullWidth
            />
          )}
        />

        <Controller
          name="khatianNo"
          control={control}
          rules={{ required: "Required" }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Khatian No"
              placeholder="Enter khatian"
              variant="filled"
              error={!!errors.khatianNo}
              fullWidth
            />
          )}
        />

        <Controller
          name="plotNo"
          control={control}
          rules={{ required: "Required" }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Plot No"
              placeholder="Enter plot"
              variant="filled"
              error={!!errors.plotNo}
              fullWidth
            />
          )}
        />
      </Box>

      {/* Location */}
      <Box mt={2}>
        <Controller
          name="locationOfPurchaseLand"
          control={control}
          rules={{ required: "Required" }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Location of Purchased Land"
              placeholder="e.g., North-West corner adjacent to NH-34"
              variant="filled"
              error={!!errors.locationOfPurchaseLand}
              fullWidth
            />
          )}
        />
      </Box>
    </Box>
  );
};

export default StepTwo;
