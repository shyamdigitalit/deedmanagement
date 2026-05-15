import React from "react";
import { Box, Button, Tab, Tabs, TextField, Typography, IconButton, } from "@mui/material";
import { Add, Close, TimelineOutlined, } from "@mui/icons-material";
import { Controller, useFieldArray, useWatch, } from "react-hook-form";
import { stepTwoFieldsArray } from "../deed-fields";

const DEFAULT_DEED = {
  deedNo: "",
  plotNo: "",

  totalArea: "",
  totalPurchasedArea: "",
  balanceArea: "",
  totalMutatedArea: "",
  nonMutatedArea: "",

  mutatedInCompany: "",
  mutatedKhatianNo: "",

  remarks: "",
  deedDocs: [],
};

const StepTwo = ({ control, errors, setValue, }) => {

  const [activeTab, setActiveTab] = React.useState(0);
  const { fields, append, remove, } = useFieldArray({ control, name: "deeds", });

  const handleRemove = (index) => {
    remove(index);
    if (activeTab >= index && activeTab > 0) setActiveTab(activeTab - 1);
  };

  return (
    <Box>

      {/* TABS */}

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue) }
        variant="scrollable" scrollButtons="auto"
        sx={{
          position: "sticky",
          top: -18,
          pl: 2,
          zIndex: 2,
          backgroundColor: "#fff",
          boxShadow: 1,
          borderBottom: "1px solid #eee",
          borderRadius: "0 0 8px 8px",
          mb: 2,
        }}
      >

        {fields.map((item, index) => (
          <Tab key={item.id} label={item.plotNo ? `Plot - ${item.plotNo}` : `Deed ${index + 1}`} />
        ))}

      </Tabs>

      <Box sx={cardStyles}>

        {/* HEADER */}

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} >

          <Box>
            <Typography sx={sectionTitle}>
              <TimelineOutlined fontSize="small" color="warning" />
              Deed Calculation
            </Typography>
            <Typography sx={sectionSubTitle}> Capture deed calculation details </Typography>
          </Box>

        </Box>

        {/* TAB CONTENT */}

        {fields.map((item, index) => (

          <Box key={item.id} sx={{ display: activeTab === index ? "block" : "none", }} >

            <DeedTabForm index={index} control={control} errors={errors} setValue={setValue}
              remove={handleRemove} totalTabs={fields.length}
            />

          </Box>

        ))}

      </Box>

    </Box>
  );
};

export default StepTwo;





/* ---------------------------------------- */
/* TAB FORM */
/* ---------------------------------------- */

const DeedTabForm = ({ index, control, errors, setValue, remove, totalTabs, }) => {

  /* WATCH ONLY CURRENT TAB */

  const totalArea = useWatch({ control, name: `deeds.${index}.totalArea`, }) || 0;
  const totalPurchasedArea = useWatch({ control, name: `deeds.${index}.totalPurchasedArea`, }) || 0;
  const totalMutatedArea = useWatch({ control, name: `deeds.${index}.totalMutatedArea`, }) || 0;


  /* CALCULATIONS */
  React.useEffect(() => {

    const balanceArea = Number(totalArea || 0) - Number(totalPurchasedArea || 0);
    const nonMutatedArea = Number(totalPurchasedArea || 0) - Number(totalMutatedArea || 0);

    setValue(`deeds.${index}.balanceArea`, balanceArea >= 0 ? balanceArea : 0, { shouldValidate: false, shouldDirty: false, } );
    setValue( `deeds.${index}.nonMutatedArea`, nonMutatedArea >= 0 ? nonMutatedArea : 0, { shouldValidate: false, shouldDirty: false, } );

  }, [ totalArea, totalPurchasedArea, totalMutatedArea, index, setValue, ]);


  const renderFields = (section) =>
    stepTwoFieldsArray.filter((field) => field.section === section)
      .map((field) => (

        <Controller key={`${field.name}-${index}`} name={`deeds.${index}.${field.name}`} 
          control={control} rules={field.rules}
          render={({ field: controllerField, }) => (

            <TextField {...controllerField} label={field.label} placeholder={field.placeholder}
              variant={ field.variant || "outlined" } size="small" fullWidth
              disabled={ field.disabled || false } error={!!errors?.deeds?.[index]?.[field.name]}
              helperText={ errors?.deeds?.[index]?.[field.name]?.message || field.helperText }
            />

          )}
        />

      ));


  return (
    <Box position="relative">

      {/* REMOVE */}
      {totalTabs > 1 && (

        <IconButton color="error" size="small" type="button" onClick={() => remove(index)}
          sx={{ position: "absolute", top: -10, right: -10, zIndex: 2,}}
        >
          <Close fontSize="small" />
        </IconButton>

      )}

      {/* FIELDS */}
      <Box sx={gridStyles}> {renderFields("calculation")} </Box>

    </Box>
  );
};





/* ---------------------------------------- */
/* STYLES */
/* ---------------------------------------- */

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
};

const gridStyles = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(250px, 1fr))",
  gap: 2,
};