import React from "react";
import { Box, Typography, TextField, Tabs, Tab, IconButton,} from "@mui/material";
import { Close, InfoOutlined, } from "@mui/icons-material";
import { Controller, useFieldArray, useWatch, } from "react-hook-form";
import { stepThreeFieldsArray } from "../deed-fields";
import FileUploader from "../../../../components/FileUploader";

const StepThree = ({ control, errors, setValue }) => {

  const [activeTab, setActiveTab] = React.useState(0);
  const { fields, remove, } = useFieldArray({ control, name: "deeds", });

  return (
    <Box>

      {/* TABS */}

      <Tabs value={activeTab} variant="scrollable" scrollButtons="auto"
        onChange={(e, newValue) => setActiveTab(newValue)}
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
          <Tab key={item.id} label={item.plotNo ? `${item.deedNo} / ${item.plotNo}` : `Deed ${index + 1}`} />
        ))}

      </Tabs>

      {/* TAB CONTENT */}

      {fields.map((item, index) => (

        <Box key={item.id} sx={{display: activeTab === index ? "block" : "none",}} >
          <DeedReviewTab index={index} control={control} errors={errors} setValue={setValue}
            totalTabs={fields.length} remove={remove}
          />
        </Box>

      ))}

    </Box>
  );
};

export default StepThree;





/* ---------------------------------------- */
/* TAB COMPONENT */
/* ---------------------------------------- */

const DeedReviewTab = ({ index, control, errors, setValue, totalTabs, remove }) => {
  
  const renderFields = (section) =>
    stepThreeFieldsArray.filter( (field) => field.section === section )
      .map((field) => (

        <Controller key={`${field.name}-${index}`} name={`deeds.${index}.${field.name}`} control={control}
          rules={field.rules}
          render={({field: controllerField,}) => (

            <TextField {...controllerField} label={field.label} placeholder={field.placeholder}
              variant={ field.variant || "outlined" } fullWidth size="small" disabled={field.disabled || false}
              error={!!errors?.deeds?.[index]?.[field.name]}
              helperText={errors?.deeds?.[index]?.[field.name]?.message || field.helperText}
            />

          )}
        />

      ));

  return (
    <Box sx={cardStyles}>

      {/* HEADER */}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} >

        <Box>

          <Typography sx={sectionTitle}>
            <InfoOutlined fontSize="small" color="primary" />
            Review Details
          </Typography>

          <Typography sx={sectionSubTitle}> Upload documents and add remarks </Typography>

        </Box>

        {totalTabs > 1 && (
          <IconButton color="error" size="small" type="button" onClick={() => remove(index)} >
            <Close fontSize="small" />
          </IconButton>
        )}

      </Box>

      {/* FORM FIELDS */}
      <Box sx={gridStyles}> 
        
        <Controller name="purchaseInCompany" control={control}
          render={({field: controllerField,}) => (
            <TextField {...controllerField} label="Purchase In Company"
              variant="outlined" fullWidth size="small" disabled={true}
            />
          )}
        />

        {renderFields("review")} 
      </Box>

      {/* FILE UPLOADER */}
      <Box mt={3}>

        <Controller name={`deeds.${index}.remarks`} control={control} rules={{ required: "Remarks is Required" }}
          render={({ field }) => (
            <TextField {...field} multiline rows={5} fullWidth label="Remarks" placeholder="Enter remarks" 
              error={!!errors?.remarks} helperText={errors?.remarks?.message}
            />
          )}
        />

        {/* <FileUploader files={files} setValue={setValue} index={index} /> */}
        <Controller
          name={`deeds.${index}.deedDocs`}
          control={control}
          render={({ field }) => (
            <FileUploader
              files={field.value || []}
              setFiles={field.onChange}
            />
          )}
        />

      </Box>

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
  mb: 2,
};

const gridStyles = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(250px, 1fr))",
  gap: 2,
};