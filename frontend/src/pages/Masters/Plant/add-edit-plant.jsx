import "../../../styles/Drawer.css";
import { AccountTree, Add, Close, LocationOn, Save } from '@mui/icons-material'
import { Button, Checkbox, FormControl, FormControlLabel, FormHelperText, IconButton, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material'
import React from 'react'
import { RippleEffect } from "../../../utilities/ripple";
import { Controller, useForm, useWatch } from "react-hook-form";
import axiosInstance from "../../../config/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../../../redux/slices/snackbar";

const AddEditPlant = (props) => {

    const user = useSelector((state) => state.auth.user)
    const dispatch = useDispatch();
    const [companyList, setCompanyList] = React.useState([]);
    const [locationList, setLocationList] = React.useState([]);

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
        defaultValues: {
            plantCode: "",
            plantName: "",
            plnt_cmpny: "",
            plnt_loc: "",
            status: "Active",
        },
        mode: "onBlur",
        reValidateMode: "onChange",
    });

    const plantCompany = useWatch({ control, name: "plnt_cmpny" });
    const plantLocation = useWatch({ control, name: "plnt_loc" });

    React.useEffect(() => {
        if(props.selectedPlant) {
            const { plantCode, plantName, plnt_cmpny, plnt_loc } = props.selectedPlant;
            reset({ plantCode, plantName, plnt_cmpny: plnt_cmpny?._id || "", plnt_loc: plnt_loc?._id || "" });
        }
    }, [props.selectedPlant, reset])

    React.useEffect(() => {
        getCompanyList();
        getLocationList();
    }, []);

    const getCompanyList = async () => {
        try {
            const result = await axiosInstance.get(`/admin/cmpny/fetch`)
            console.log(result)
            if(result.status === 200) {
                setCompanyList(result.data.data);
            } else {
                dispatch(showSnackbar({ message: result.message, severity: 'error', duration: 2000 }));
            }
        } catch (error) {
            console.error("Error fetching company list:", error);
            dispatch(showSnackbar({ message: "Failed to fetch company list", severity: 'error', duration: 2000 }));
            return [];
        }
    };

    const getLocationList = async () => {
        try {
            const result = await axiosInstance.get(`/admin/stt/fetch`)
            if(result.status === 200) {
                setLocationList(result.data.data);
            } else {
                dispatch(showSnackbar({ message: result.message, severity: 'error', duration: 2000 }));
                return [];
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
            let url = props.selectedPlant ? `/admin/plnt/update/${props.selectedPlant._id}` : `/admin/plnt/create`;
            const result = await axiosInstance[props.selectedPlant ? "patch":"post"](url, data).then(res => res.data)
            
            props.onClose(); // Close the drawer
            dispatch(showSnackbar({ message: result.message, severity: 'success', }));
            // if(result.statuscode === 201){
            // }

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
                    <LocationOn color="primary" style={{ fontSize: "2rem", margin: "-10px 0" }} /> {props.selectedPlant ? "EDIT":"ADD"} PLANT
                </Typography>
                <IconButton onClick={() => props.onClose()}> <Close color="error" width={300} /> </IconButton>
            </div>
            <form className="drawer-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="input-container"> 
                    <TextField label="Plant Code" variant="filled" {...register("plantCode", { required: "Plant Code is required" })} 
                    error={!!errors.plantCode} helperText={errors.plantCode?.message} fullWidth /> 
                </div>
                <div className="input-container"> 
                    <TextField  label="Plant Name"  variant="filled" {...register("plantName", { required: "Plant Name is required" })} 
                    error={!!errors.plantName} helperText={errors.plantName?.message} fullWidth /> 
                </div>
                <div className="input-container"> 
                    <Controller name="plnt_cmpny" control={control} 
                        rules={{ required: "Company is required" }}
                        render={({ field }) => (
                            <FormControl fullWidth variant="filled" error={!!errors.plnt_cmpny}>
                                <InputLabel>Company</InputLabel>
                                <Select {...field}>
                                    {companyList.map((company) => (
                                        <MenuItem key={company._id} value={company._id}>
                                            {company.companyCode} - {company.companyDesc}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>{errors.plnt_cmpny?.message}</FormHelperText>
                            </FormControl>
                        )}
                    />
                </div>
                <div className="input-container"> 
                    <Controller name="plnt_loc" control={control}
                        rules={{ required: "State is required" }}
                        render={({ field }) => (
                            <FormControl fullWidth variant="filled" error={!!errors.plnt_loc}>
                                <InputLabel>State</InputLabel>
                                <Select {...field}>
                                    {locationList.map((location) => (
                                        <MenuItem key={location._id} value={location._id}>
                                            {location.stt_code} - {location.stt_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>{errors.plnt_loc?.message}</FormHelperText>
                            </FormControl>
                        )}
                    />
                </div>


                <div className="action-buttons">
                    <div style={{padding: "1rem 2rem", display: "flex", alignItems: "center", gap: "1rem"}}>
                        <Button type="submit" variant="contained" size="large">
                            {props.selectedPlant ? "UPDATE":"ADD"} <Add style={{ margin: "-3px 0 0 4px" }} />
                        </Button>
                        
                        <div className="reset-button" onClick={handleReset}> Reset </div>
                    </div>
                </div>
            </form>
        </section>
    )
}

export default AddEditPlant