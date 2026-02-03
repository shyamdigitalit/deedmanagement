import { Stepper, Step, StepLabel, Typography, Box, } from "@mui/material";

import CustomConnector from "./custom-connector";
import CustomStepIcon from "./custom-step-icon";

const CustomStepper = ({ activeStep,  steps}) => (
    <Stepper
          activeStep={activeStep}
          alternativeLabel
          connector={<CustomConnector />}
          sx={{ px: 5, py: 2 }}
        >
        {steps.map((step, index) => (
        <Step key={step.label}>
            <StepLabel
            StepIconComponent={(props) => (
                <CustomStepIcon {...props} icon={step.icon} />
            )}
            >
            <Box textAlign="center">
                <Typography
                sx={{
                    fontSize: "12px",
                    color: activeStep === index ? "#FF6A00" : "#9CA3AF",
                    fontWeight: 500,
                }}
                >
                {step.subLabel}
                </Typography>

                <Typography
                sx={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: activeStep === index ? "#111827" : "#6B7280",
                }}
                >
                {step.label}
                </Typography>
            </Box>
            </StepLabel>
        </Step>
        ))}
    </Stepper>
)


export default CustomStepper;