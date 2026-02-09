import { Autocomplete, Box, CircularProgress, TextField, Typography } from "@mui/material";
import { Controller } from "react-hook-form";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { stepOneFieldsArray } from "../deed-fields";
import React from "react";
import axiosInstance from "../../../../config/axiosInstance";


const renderFields = (section, control, errors) =>
  stepOneFieldsArray
    .filter(field => field.section === section)
    .map(field => (
      <Controller key={field.name} name={field.name} control={control} rules={field.rules}
        render={({ field: controllerField }) => (
          <TextField {...controllerField} {...field} type={field.type || "text"} variant={field.variant || "outlined"}
            error={!!errors[field.name]} helperText={errors[field.name]?.message || field.helperText}
          />
        )}
      />
    ));



const StepOne = ({ control, errors, setValue }) => {
    
  const [options, setOptions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const fetchDeedNumbers = async (search) => {
    if (!search) return;

    try {
      setLoading(true);
      // const res = await axios.get(`/api/deeds?search=${search}`);
      const response = await axiosInstance.get(`/deedmaster/fetchbyno?deedno=${search}`);
      // console.log(response)
      setOptions(response?.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


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

        
        
        {/* {JSON.stringify(control._formValues)} */}
        <Box sx={gridStyles}>

          <Controller name="deedNo" control={control} rules={{ required: "Deed No is required" }}
            render={({ field }) => (
              <Autocomplete freeSolo options={options}
                loading={loading} inputValue={field.value ?? ""}
                getOptionLabel={(option) => {
                  // when user types manually, option is string
                  if (typeof option === "string") return option;
                  return option.deedNo || "";
                }}
                onInputChange={(e, value) => {
                  setValue("deedType", null)
                  field.onChange(value);     // keep typed value
                  fetchDeedNumbers(value);   // call API
                }}
                onChange={(e, value) => {
                  setValue("deedType", value._id)
                  setValue("dateOfRegistration", value.dateOfRegistration)
                  setValue("nameOfSeller", value.nameOfSeller)
                  setValue("nameOfPurchaser", value.nameOfPurchaser)
                  setValue("mutatedOrLeased", value.mutatedOrLeased)
                  setValue("nameOfMouza", value.nameOfMouza)
                  setValue("khatianNo", value.khatianNo)
                  field.onChange(value);     // when selected from dropdown
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Deed No" variant="filled" fullWidth
                    error={!!errors?.deedNo} helperText={errors?.deedNo?.message}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loading && <CircularProgress size={18} />}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />
            )}
          />



          {renderFields("deed", control, errors)}
        </Box>
      </Box>

      {/* =======================
          Area & Mutation
      ======================== */}
      {/* <Box sx={cardStyles}>
        <Typography sx={sectionTitle}>
          <TimelineOutlinedIcon fontSize="small" color="warning" />
          Area & Mutation Details
        </Typography>

        <Typography sx={sectionSubTitle}>
          Capture the legal transaction identity and involved parties
        </Typography>

        <Box sx={gridStyles}>
          {renderFields("area", control, errors)}
        </Box>
      </Box> */}

    </Box>
  );
};

export default StepOne;




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
