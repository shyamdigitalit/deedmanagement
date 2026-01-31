import * as styles from "./../../../styles/formStyle"

import React, { useEffect, useState } from "react";
import { Box, Button, Step, StepLabel, Stepper, TextField, Typography, } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import axiosInstance from "../../../config/axiosInstance";
import { showSnackbar } from "../../../redux/slices/snackbar";
import FileUploader from "../../../components/FileUploader";
import StepTwo from "./steps/StepTwo";
import StepOne from "./steps/stepOne";
import DEFAULTVALUES from "./default-values";
import CustomConnector from "./stepper/custom-connector";
import CustomStepIcon from "./stepper/custom-step-icon";
import CustomStepper from "./stepper";


export default function AddEditDeed() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [activeStep, setActiveStep] = useState(0);
  const [files, setFiles] = useState([]);
  const [approvalRemarks, setApprovalRemarks] = useState(null);

  const { control, register, handleSubmit, reset, setValue, watch, trigger, formState: { errors }, } = useForm({ defaultValues: DEFAULTVALUES });

  const totalPurchasedArea = watch("totalPurchasedArea") || 0;
  const totalMutatedArea = watch("totalMutatedArea") || 0;

  const id = new URLSearchParams(window.location.search).get("_id");

  /* ===========================
     EFFECTS
  ============================ */

  useEffect(() => {
    if (id) getDeedById(id);
  }, [id]);

  useEffect(() => {
    const nonMutatedArea =
      parseFloat(totalPurchasedArea) - parseFloat(totalMutatedArea);
    setValue("nonMutatedArea", nonMutatedArea >= 0 ? nonMutatedArea : 0);
  }, [totalPurchasedArea, totalMutatedArea]);

  /* ===========================
     API
  ============================ */

  const getDeedById = async (id) => {
    try {
      const result = await axiosInstance.get(`/deed/fetchby/${id}`);
      if (result.status === 200) {
        const deedData = result.data.data;

        setFiles(
          deedData?.deedDocs?.map((f) => ({
            id: f.filId,
            name: f.filName,
            size: Number(f.filContentSize),
            type: f.filContentType,
            isExisting: true,
          }))
        );

        if (deedData.approvalStatus === "Rejected") {
          setApprovalRemarks(
            deedData.approvalDetails[
              deedData.approvalDetails.length - 1
            ]
          );
        }

        reset(deedData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  /* ===========================
     STEPPER NAV
  ============================ */

  const handleNext = async () => {
    let fields = [];
    // if (activeStep === 0) fields = stepOneFields;
    // if (activeStep === 1) fields = stepTwoFields

    const isValid = await trigger(fields);
    if (!isValid) return;

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  /* ===========================
     SUBMIT
  ============================ */

  const onSubmit = async (data) => {
    if (parseFloat(totalMutatedArea) > parseFloat(totalPurchasedArea)) {
      dispatch(
        showSnackbar({
          message:
            "Total Mutated Area cannot be greater than Total Purchased Area",
          severity: "error",
        })
      );
      return;
    }

    data.createdby = user._id;
    data.approvalStatus = "Pending L1 Approval";
    data.currentPendingApprovalLevel = 1;

    data.deedDocs = files.map((f) => f.file).filter(Boolean);
    data.deedDocsExisting = JSON.stringify(
      files
        .filter((f) => f.isExisting)
        .map((f) => ({
          filId: f.id,
          filName: f.name,
          filContentType: f.type,
          filContentSize: f.size,
        }))
    );

    const formData = new FormData();
    for (const key in data) {
      if (key === "deedDocs") {
        data.deedDocs.forEach((file) => formData.append("deedDocs", file) );
      } else {
        formData.append(key, data[key]);
      }
    }

    try {
      const url = id ? `/deed/update?id=${id}` : "/deed/create";
      const response = await axiosInstance[id ? "patch" : "post"]( url, formData );

      if (response.status === 201) {
        dispatch( showSnackbar({ message: response.data.message, severity: "success", }) );
        navigate("/deed");
      }
    } catch (error) {
      dispatch( showSnackbar({ message: error.message, severity: "error", }) );
    }
  };

  /* ===========================
     UI
  ============================ */

  return (
    <section style={{position: "relative"}}>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* <Stepper activeStep={activeStep} sx={{ mx: 5, my: 2 }}>
            {steps.map((label) => (
            <Step key={label}>
                <StepLabel>{label}</StepLabel>
            </Step>
            ))}
        </Stepper> */}
        <CustomStepper activeStep={activeStep} />
        
        
        {/* {activeStep} */}
        <Box sx={{ p: 6, pt: 2, height: "calc(100vh - 430px)", overflowY: "auto" }}>
            {/* STEP 1 */}
            {activeStep === 0 && ( <StepOne control={control} errors={errors} /> )}

            {/* STEP 2 */}
            {activeStep === 1 && ( <StepTwo control={control} errors={errors} /> )}

            {/* STEP 3 */}
            {activeStep === 2 && (
                <Box>
                    <Typography variant="h6" mb={1}> Notes </Typography>
                    <textarea {...register("notes")} rows={5} style={{ width: "100%", padding: 10 }} />
                    <Box mt={3}>
                    <FileUploader files={files} setFiles={setFiles} />
                    </Box>
                </Box>
            )}

        </Box>

        {/* FOOTER */}
        {/* FOOTER (INSIDE CONTENT) */}
        <Box sx={styles.dialogActions} >
            <Button sx={styles.secondaryButton} type="button" onClick={handleBack}>Back</Button>

            {activeStep === 2 ? (
                <Button sx={styles.primaryButton} type="submit">Save Changes</Button>
            ) : (
                <Button sx={styles.primaryButton} type="button" variant="contained"
                onClick={handleNext}>Continue</Button>
            )}
        </Box>
      </form>
    </section>
  );
}
