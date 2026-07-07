import * as styles from "./../../../styles/formStyle"

import React, { useEffect, useState } from "react";
import { Box, Button, Typography, } from "@mui/material";
import { CheckCircleOutline, LocationOnOutlined, PersonOutline } from "@mui/icons-material";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import axiosInstance from "../../../config/axiosInstance";
import { showSnackbar } from "../../../redux/slices/snackbar";
import FileUploader from "../../../components/FileUploader";
import StepTwo from "./steps/StepTwo";
import StepOne from "./steps/StepOne";
import DEFAULTVALUES from "./default-values";
import CustomStepper from "../../../components/stepper";
import { stepOneFieldsArray, stepTwoFieldsArray } from "./deed-fields";
import StepThree from "./steps/StepThree";


export default function AddEditDeed({ plantId, selectedDeed, handleClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const containerRef = React.useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [approvalRemarks, setApprovalRemarks] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const { control, register, handleSubmit, reset, setValue, watch, trigger, formState: { errors }, } = useForm({ defaultValues: DEFAULTVALUES, shouldUnregister: false });
  

  // const id = new URLSearchParams(window.location.search).get("_id");
  const id = selectedDeed?._id;
  React.useEffect(() => {
    if (id) getDeedById(id);
  }, [id]);

  React.useEffect(() => {
    if (plantId) setValue("plantId", plantId);
  }, [plantId, setValue]);
  

  React.useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTo({ top: 0, behavior: "smooth", });
  }, [activeStep]);


  // const totalArea = watch("totalArea") || 0;
  // const totalPurchasedArea = watch("totalPurchasedArea") || 0;
  // const totalMutatedArea = watch("totalMutatedArea") || 0;

  // useEffect(() => {
  //   const balanceArea = parseFloat(totalArea) - parseFloat(totalPurchasedArea);
  //   setValue("balanceArea", balanceArea >= 0 ? balanceArea : 0);
  //   const nonMutatedArea = parseFloat(totalPurchasedArea) - parseFloat(totalMutatedArea);
  //   setValue("nonMutatedArea", nonMutatedArea >= 0 ? nonMutatedArea : 0);
  // }, [totalPurchasedArea, totalMutatedArea]);


  /* ===========================
     API
  ============================ */

  const getDeedById = async (id) => {
    try {
      const result = await axiosInstance.get(`/deed/fetchby/${id}`);
      if (result.status === 200) {
        const deedData = result.data.data;
        
        reset({
          plantId: deedData.plantId,
          nameOfSeller: deedData.nameOfSeller,
          nameOfPurchaser: deedData.nameOfPurchaser,
          nameOfMouza: deedData.nameOfMouza,
          correcterOfLand: deedData.correcterOfLand,
          purchaseInCompany: deedData.purchaseInCompany,

          deeds: [
              {
                  deedDate: deedData.deedDate.split("T")[0],
                  deedNo: deedData.deedNo,
                  plotNo: deedData.plotNo,
                  plotNumber: deedData.plotNumber,
              
                  totalArea: deedData.totalArea,
                  totalPurchasedArea: deedData.totalPurchasedArea,
                  balanceArea: deedData.balanceArea,
                  totalMutatedArea: deedData.totalMutatedArea,
                  nonMutatedArea: deedData.nonMutatedArea,
              
                  mutatedInCompany: deedData.mutatedInCompany,
                  mutatedKhatianNo: deedData.mutatedKhatianNo,
                  
                  remarks: deedData.remarks,
                  deedDocs: deedData?.deedDocs?.map((f) => ({
                    id: f.filId,
                    name: f.filName,
                    size: Number(f.filContentSize),
                    type: f.filContentType,
                    isExisting: true,
                  }))
              }
          ]
        });

        if (deedData.approvalStatus === "Rejected") {
          setApprovalRemarks(
            deedData.approvalDetails[
              deedData.approvalDetails.length - 1
            ]
          );
        }

      }
    } catch (error) {
      console.error(error);
    }
  };

  /* ===========================
     STEPPER NAV
  ============================ */

  const handleNext = async () => {
    console.log("handle next")
    let fields = [];
    if (activeStep === 0) fields = [...stepOneFieldsArray.map(e => e.name), "deeds", "plantId"];
    // if (activeStep === 1) fields = [...stepTwoFieldsArray.map(e => e.name), "deeds"];

    if (activeStep === 1) {

      const deedFields = watch("deeds") || [];

      fields = deedFields.flatMap((_, index) =>
        stepTwoFieldsArray.map(
          field => `deeds.${index}.${field.name}`
        )
      );
    }


    const isValid = await trigger(fields);
    console.log(isValid)
    if (!isValid) return;

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);


  const flattenDeedPayload = (payload) => {

    const commonFields = {
      plantId: payload.plantId,
      nameOfSeller: payload.nameOfSeller,
      nameOfPurchaser: payload.nameOfPurchaser,
      correcterOfLand: payload.correcterOfLand,
      purchaseInCompany: payload.purchaseInCompany,
    };

    return payload.deeds.map((deed) => ({
      ...commonFields,

      deedDate: deed.deedDate.split("T")[0],
      deedNo: deed.deedNo,
      plotNo: deed.plotNo,
      plotNumber: deed.plotNumber,
      nameOfMouza: deed.nameOfMouza,

      totalArea: deed.totalArea,
      totalPurchasedArea: deed.totalPurchasedArea,
      balanceArea: deed.balanceArea,

      totalMutatedArea: deed.totalMutatedArea,
      nonMutatedArea: deed.nonMutatedArea,

      mutatedInCompany: deed.mutatedInCompany,
      mutatedKhatianNo: deed.mutatedKhatianNo,

      remarks: deed.remarks,

      deedDocs: deed.deedDocs,
    }));
  };


  /* ===========================
     SUBMIT
  ============================ */

  const onSubmit = async (data) => {
    console.log("Before => ",data)
    const finalPayload = flattenDeedPayload(data);
    console.log(finalPayload);
    // return;

    finalPayload.forEach((payload) => saveDeed(payload));
  };
  
  
  const saveDeed = async (data) => {
    console.log(data)
    // return;
    if(!data.totalMutatedArea && data.mutatedKhatianNo)
    return dispatch( showSnackbar({ message: `Total Mutated Area is required for ${data.deedNo} / ${data.plotNumber} .`, severity: "error", }) );
    if(data.totalMutatedArea && !data.mutatedKhatianNo)
    return dispatch( showSnackbar({ message: `Mutated Khatian No is required for ${data.deedNo} / ${data.plotNumber} .`, severity: "error", }) );
      
    // if (parseFloat(totalMutatedArea) > parseFloat(totalPurchasedArea)) {
    //   dispatch(
    //     showSnackbar({
    //       message:
    //         "Total Mutated Area cannot be greater than Total Purchased Area",
    //       severity: "error",
    //     })
    //   );
    //   return;
    // }
    setLoading(true);
    data.createdby = user._id;
    data.approvalStatus = "Pending L1 Approval";
    data.currentPendingApprovalLevel = 1;
  
    const files = data.deedDocs || [];
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
    console.log(data)
    // return;
  
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
        handleClose();
        setLoading(false);
      }
    } catch (error) {
      dispatch( showSnackbar({ message: error.message, severity: "error", }) );
      setLoading(false);
    }

  }

  /* ===========================
     UI
  ============================ */

  return (
    <section style={{position: "relative"}}>

      <form>
        <CustomStepper steps={steps} activeStep={activeStep} />
        
        
        {/* {activeStep} */}
        <Box ref={containerRef} sx={{ p: 6, pt: 2, height: "calc(100vh - 430px)", overflowY: "auto" }}>
            {/* STEP 1 */}
            {activeStep === 0 && ( <StepOne control={control} errors={errors} setValue={setValue} /> )}

            {/* STEP 2 */}
            {activeStep === 1 && ( <StepTwo control={control} errors={errors} setValue={setValue} /> )}

            {/* STEP 3 */}
            {activeStep === 2 && (<StepThree control={control} errors={errors} setValue={setValue} />)}

        </Box>

        {/* FOOTER */}
        {/* FOOTER (INSIDE CONTENT) */}
        <Box sx={styles.dialogActions} >
            <Button sx={styles.secondaryButton} type="button" onClick={handleBack} disabled={activeStep < 1}>Back</Button>

            {activeStep === 2 ? (
                <Button sx={styles.primaryButton} type="button" onClick={handleSubmit(onSubmit)} disabled={isLoading}>
                  {isLoading ? "Loading ..." : selectedDeed ? "Update Changes":"Save Changes"}
                </Button>
            ) : (
                <Button sx={styles.primaryButton} type="button" variant="contained"
                onClick={handleNext}>Continue</Button>
            )}
        </Box>
      </form>
    </section>
  );
}



const steps = [
  {
    label: "Deed, Area & Mutation",
    subLabel: "Step 1/3",
    icon: <PersonOutline />,
  },
  {
    label: "Deed Calculation",
    subLabel: "Step 2/3",
    icon: <LocationOnOutlined />,
  },
  {
    label: "Review",
    subLabel: "Step 3/3",
    icon: <CheckCircleOutline />,
  },
];
