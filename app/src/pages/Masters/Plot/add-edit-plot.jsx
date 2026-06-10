import "../../../styles/Drawer.css";
import { AccountTree, Add, Close, FilterTiltShift, GridOn, LocationOn, Save } from '@mui/icons-material'
import { Button, Checkbox, FormControl, FormControlLabel, FormHelperText, IconButton, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material'
import React from 'react'
import { RippleEffect } from "../../../utilities/ripple";
import { Controller, useForm } from "react-hook-form";
import axiosInstance from "../../../config/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../../../redux/slices/snackbar";

const AddEditPlot = (props) => {

    const user = useSelector((state) => state.auth.user)
    const dispatch = useDispatch();
    const [locationList, setLocationList] = React.useState([]);

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
        defaultValues: {
            locationId: "",
            nameOfMouza: "",
            plotNo: "",
            totalArea: "",
            status: "Active",
            
        },
        mode: "onBlur",
        reValidateMode: "onChange",
    });

    React.useEffect(() => {
        console.log("Selected Plot ", props.selectedPlot)
        if(props.selectedPlot) {
            const { plotNo, nameOfMouza, totalArea, locationId } = props.selectedPlot;
            reset({ plotNo, nameOfMouza, totalArea, locationId });
        }
    }, [props.selectedPlot, reset])

    React.useEffect(() => {
        getLocationList();
    }, []);

    const getLocationList = async () => {
        try {
            const result = await axiosInstance.get(`/admin/location/fetch`)
            console.log(result)
            if(result.status === 200) {
                setLocationList(result.data.data);
            } else {
                dispatch(showSnackbar({ message: result.message, severity: 'error', duration: 2000 }));
            }
        } catch (error) {
            console.error("Error fetching location list:", error);
            dispatch(showSnackbar({ message: "Failed to fetch location list", severity: 'error', duration: 2000 }));
            return [];
        }
    };

    const onSubmit = async (data) => {
        // console.log(user)
        // console.log(data);
        data.createdby = user?._id;
        data.status = "Active";
        
        try {
            let url = props.selectedPlot ? `/admin/plot/update/${props.selectedPlot._id}` : `/admin/plot/create`;
            const result = await axiosInstance[props.selectedPlot ? "patch":"post"](url, data).then(res => res.data)
            
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
                    <GridOn color="primary" style={{ fontSize: "2rem", margin: "-10px 0" }} /> {props.selectedPlot ? "EDIT":"ADD"} PLOT
                </Typography>
                <IconButton onClick={() => props.onClose()}> <Close color="error" width={300} /> </IconButton>
            </div>
            <form className="drawer-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="input-container"> 
                    <Controller name="locationId" control={control}
                        rules={{ required: "Location is required" }}
                        render={({ field }) => (
                            <FormControl fullWidth variant="filled" error={!!errors.locationId}>
                                <InputLabel id="location-label">Location</InputLabel>
                                <Select {...field} labelId="location-label" id="location" >
                                    {locationList.map((location) => (
                                        <MenuItem key={location._id} value={location._id}>
                                            {location.plantName?.[0]} - {location.locationName}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>{errors.locationId?.message}</FormHelperText>
                            </FormControl>
                        )}
                    />
                </div>
                <div className="input-container"> 
                    <TextField label="Mouza Name" variant="filled" {...register("nameOfMouza", { required: "Mouza Name is required" })} 
                    error={!!errors.nameOfMouza} helperText={errors.nameOfMouza?.message} fullWidth /> 
                </div>
                <div className="input-container"> 
                    <TextField label="Plot No" variant="filled" {...register("plotNo", { required: "Plot No is required" })} 
                    error={!!errors.plotNo} helperText={errors.plotNo?.message} fullWidth /> 
                </div>
                <div className="input-container"> 
                    <TextField type="number" label="Total Area"  variant="filled" {...register("totalArea", { required: "Total Area is required" })} 
                    error={!!errors.totalArea} helperText={errors.totalArea?.message} fullWidth /> 
                </div>

                <div className="action-buttons">
                    <div style={{padding: "1rem 2rem", display: "flex", alignItems: "center", gap: "1rem"}}>
                        <Button type="submit" variant="contained" size="large">
                            {props.selectedPlot ? "UPDATE":"ADD"} <Add style={{ margin: "-3px 0 0 4px" }} />
                        </Button>
                        
                        <div className="reset-button" onClick={handleReset}> Reset </div>
                    </div>
                </div>
            </form>
        </section>
    )
}

export default AddEditPlot