import { Box } from "@mui/material";

const CustomStepIcon = ({ active, completed, icon }) => {
  const isHighlighted = active || completed;

  return (
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isHighlighted ? "#FF6A00" : "#fff",
        border: isHighlighted ? "none" : "2px solid #E5E7EB",
        color: isHighlighted ? "#fff" : "#9CA3AF",
        transition: "all 0.3s ease",
      }}
    >
      {icon}
    </Box>
  );
};

export default CustomStepIcon;