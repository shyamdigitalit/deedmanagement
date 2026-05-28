import { Autocomplete, Box, Button, CircularProgress, FormControl, IconButton, Input, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { stepOneFieldsArray } from "../deed-fields";
import React from "react";
import axiosInstance from "../../../../config/axiosInstance";
import { Add, Close, Delete, EditSquare } from "@mui/icons-material";

const renderFields = (section, control, errors) =>
  stepOneFieldsArray
    .filter(field => field.section === section)
    .map(field => {
      return (
        <Controller key={field.name} name={field.name} control={control} rules={field.rules}
          render={({ field: controllerField }) => (
            <TextField {...controllerField} {...field} type={field.type || "text"} 
              variant="outlined" error={!!errors[field.name]} 
              helperText={errors[field.name]?.message || field.helperText}
            />
          )}
        />
      )
    });



const StepOne = ({ control, errors, setValue }) => {
    
  const [options, setOptions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [plantList, setPlantList] = React.useState([])
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "deeds"
  });
  
  const plantId = useWatch({ control, name: "plantId" });

  // console.log("Plant ID ", control._formValues.plantId);
  React.useEffect(() => {
    getPlantList();
  }, [])


  const getPlantList = async () => {
    try {
      const result = await axiosInstance.get(`/admin/plnt/fetch`).then(res => res.data)
      if(result.statuscode == 200) {
        setPlantList(result.data)
      }
    }
    catch (error) {
      console.error(error)
    }
  }


  return (
    <Box>

      {/* =======================
          Deed & Parties
      ======================== */}
      <Box sx={cardStyles} style={{ position: "relative" }}>
        <Typography sx={sectionTitle}>
          <DescriptionOutlinedIcon fontSize="small" color="warning" />
          Land Information
        </Typography>

        <Typography sx={sectionSubTitle}>
          Capture the legal transaction identity and involved parties
        </Typography>
        
        {/* {JSON.stringify(control._formValues)} */}
        <Box sx={gridStyles}>
            
          {plantList.length > 0 && <Controller name="plantId" control={control} rules={{ required: "Location is required" }}
            render={({ field }) => (
              <FormControl variant="filled" fullWidth error={!!errors?.plantId} helperText={"Location is required"} >
                <InputLabel id="plant-label"> Location </InputLabel>
                <Select {...field} labelId="plant-label" id="plant" 
                  value={field.value || ""}
                >
                  <MenuItem value=""> <em>Select</em> </MenuItem>
                  {plantList.map((plant) => (
                    <MenuItem key={plant._id} value={plant._id} > {plant.plantName} </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />}


          {renderFields("deed", control, errors)}

        </Box>
      </Box>

      
      <Box sx={cardStyles} style={{ position: "relative" }}>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} >
          <Box>
            <Typography sx={sectionTitle}>
              <DescriptionOutlinedIcon fontSize="small" color="warning" />
              Deed & Plot Details
            </Typography>

            <Typography sx={sectionSubTitle}>
              Capture the legal transaction identity and involved parties
            </Typography>
          </Box>

          <Button type="button" size="small" variant="contained" startIcon={<Add />}
            onClick={() => append({ deedNo: "", plotNo: "" }) }
          >
            Add
          </Button>
        </Box>


        <Box display="flex" flexDirection="column" gap={1.5}>
          {fields.map((field, index) => (
            <Box key={field.id} display="flex" alignItems="center" gap={1} flexWrap="wrap" >

              <Controller name={`deeds.${index}.deedNo`} control={control} rules={{ required: "Deed No is required" }}
                render={({ field: controllerField }) => (
                  <TextField type="number" {...controllerField} label="Deed No" sx={{ flex: 1, minWidth: "180px" }}
                    error={!!errors?.deeds?.[index]?.deedNo} helperText={errors?.deeds?.[index]?.deedNo?.message}
                  />
                )}
              />

              <Controller name={`deeds.${index}.plotNo`} control={control} rules={{ required: "Plot No is required" }}
                render={({ field: controllerField }) => (
                  <TextField type="number" {...controllerField} label="Plot No" sx={{ flex: 1, minWidth: "180px" }}
                    error={!!errors?.deeds?.[index]?.plotNo} helperText={errors?.deeds?.[index]?.plotNo?.message}
                  />
                )}
              />

              {fields.length > 1 && (
                <IconButton color="error" size="small" onClick={() => remove(index)} >
                  <Close />
                </IconButton>
              )}

            </Box>
          ))}
        </Box>
        

      </Box>
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
