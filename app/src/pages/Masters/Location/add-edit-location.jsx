import "../../../styles/Drawer.css";
import { AccountTree, Add, Close, LocationOn, Save } from '@mui/icons-material'
import { Button, Checkbox, FormControl, FormControlLabel, FormHelperText, IconButton, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material'
import React from 'react'
import { RippleEffect } from "../../../utilities/ripple";
import { Controller, useForm } from "react-hook-form";
import axiosInstance from "../../../config/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../../../redux/slices/snackbar";

const AddEditLocation = (props) => {

    const user = useSelector((state) => state.auth.user)
    const dispatch = useDispatch();
    const [plantList, setPlantList] = React.useState([]);

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
        defaultValues: {
            plantId: "",
            locationName: "",
            status: "Active",
        },
        mode: "onBlur",
        reValidateMode: "onChange",
    });


    React.useEffect(() => {
        console.log("Selected Location ", props.selectedLocation)
        if(props.selectedLocation) {
            const { plantId, locationName } = props.selectedLocation;
            reset({ plantId: plantId || "", locationName });
        }
    }, [props.selectedLocation, reset])

    React.useEffect(() => {
        getPlantList();
    }, []);

    const getPlantList = async () => {
        try {
            const result = await axiosInstance.get(`/admin/plnt/fetch`)
            console.log(result)
            if(result.status === 200) {
                setPlantList(result.data.data);
            } else {
                dispatch(showSnackbar({ message: result.message, severity: 'error', duration: 2000 }));
            }
        } catch (error) {
            console.error("Error fetching plant list:", error);
            dispatch(showSnackbar({ message: "Failed to fetch plant list", severity: 'error', duration: 2000 }));
            return [];
        }
    };


    const onSubmit = async (data) => {
       console.log("FORM SUBMITTED", data);
        data.createdby = user?._id;
        data.status = "Active";
        
        try {
            let url = props.selectedLocation ? `/admin/location/update/${props.selectedLocation._id}` : `/admin/location/create`;
            const result = await axiosInstance[props.selectedLocation ? "patch":"post"](url, data).then(res => res.data)
            
            if(result.statuscode === 201){
                props.onClose(); // Close the drawer
                dispatch(showSnackbar({ message: result.message, severity: 'success', }));
            }

        } catch (error) {
            const message = error.response ? error.response.data.message : error.message;
            dispatch(showSnackbar({ message, severity: 'error', }));
        }
    };

    const handleReset = (e) => {
        RippleEffect(e)
        reset();
    };

    return (
        <section className="drawer-container">
            <div className="drawer-header">
                <Typography className="title" color="primary">
                    <LocationOn color="primary" style={{ fontSize: "2rem", margin: "-10px 0" }} /> {props.selectedLocation ? "EDIT" : "ADD"} LOCATION
                </Typography>
                <IconButton onClick={() => props.onClose()}> <Close color="error" width={300} /> </IconButton>
            </div>
            <form className="drawer-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="input-container"> 
                    <Controller name="plantId" control={control}
                        rules={{ required: "Plant is required" }}
                        render={({ field }) => (
                            <FormControl fullWidth variant="filled" error={!!errors.plantId}>
                                <InputLabel id="plant-label">Plant</InputLabel>
                                <Select {...field} labelId="plant-label" id="plant" >
                                    {plantList.map((plant) => (
                                        <MenuItem key={plant._id} value={plant._id}>
                                            {plant.plantCode} - {plant.plantName}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>{errors.plantId?.message}</FormHelperText>
                            </FormControl>
                        )}
                    />
                </div>
                <div className="input-container"> 
                    <TextField label="Location Name" variant="filled" {...register("locationName", { required: "Location Name is required" })} 
                    error={!!errors.locationName} helperText={errors.locationName?.message} fullWidth /> 
                </div>

                <div className="action-buttons">
                    <div style={{padding: "1rem 2rem", display: "flex", alignItems: "center", gap: "1rem"}}>
                        <Button type="submit" variant="contained" size="large">
                            {props.selectedLocation ? "UPDATE":"ADD"} <Add style={{ margin: "-3px 0 0 4px" }} />
                        </Button>
                        
                        <div className="reset-button" onClick={handleReset}> Reset </div>
                    </div>
                </div>
            </form>
        </section>
    )
}

export default AddEditLocation