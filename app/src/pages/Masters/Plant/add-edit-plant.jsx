import "../../../styles/Drawer.css";
import { AccountTree, Add, Close, LocationOn, Save } from '@mui/icons-material'
import { Button, Checkbox, FormControl, FormControlLabel, FormHelperText, IconButton, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material'
import React from 'react'
import { RippleEffect } from "../../../utilities/ripple";
import { useForm } from "react-hook-form";
import axiosInstance from "../../../config/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../../../redux/slices/snackbar";

const AddEditPlant = (props) => {

    const user = useSelector((state) => state.auth.user)
    const dispatch = useDispatch();
    const [companyList, setCompanyList] = React.useState([]);
    const [locationList, setLocationList] = React.useState([]);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            plnt_code: "",
            plnt_name: "",
            plnt_cmpny: "",
            plnt_loc: "",
            status: "Active",
        },
        mode: "onBlur",
        reValidateMode: "onChange",
    });

    React.useEffect(() => {
        getCompanyList();
        getLocationList();
    }, []);

    const getCompanyList = async () => {
        try {
            const result = await axiosInstance.get(`/cmpny/fetch`).then(res => res.data)
            if(result.statuscode === 200) {
                setCompanyList(result.data);
                return result.data;
            } else {
                dispatch(showSnackbar({ message: result.message, severity: 'error', duration: 2000 }));
                return [];
            }
        } catch (error) {
            console.error("Error fetching company list:", error);
            dispatch(showSnackbar({ message: "Failed to fetch company list", severity: 'error', duration: 2000 }));
            return [];
        }
    };

    const getLocationList = async () => {
        try {
            const result = await axiosInstance.get(`/stt/fetch`).then(res => res.data)
            if(result.statuscode === 200) {
                setLocationList(result.data);
                return result.data;
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
            const result = await axiosInstance.post(`/plnt/create`, data).then(res => res.data)
            
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
                    <LocationOn color="primary" style={{ fontSize: "2rem", margin: "-10px 0" }} /> ADD PLANT
                </Typography>
                <IconButton onClick={() => props.onClose()}> <Close color="error" width={300} /> </IconButton>
            </div>
            <form className="drawer-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="input-container"> 
                    <TextField label="Plant Code" variant="filled" {...register("plnt_code", { required: "Plant Code is required" })} 
                    error={!!errors.plnt_code} helperText={errors.plnt_code?.message} fullWidth /> 
                </div>
                <div className="input-container"> 
                    <TextField  label="Plant Name"  variant="filled" {...register("plnt_name", { required: "Plant Name is required" })} 
                    error={!!errors.plnt_name} helperText={errors.plnt_name?.message} fullWidth /> 
                </div>
                <div className="input-container"> 
                    <FormControl fullWidth variant="filled" error={!!errors.plnt_cmpny}>
                    <InputLabel id="plant-company-label">Company</InputLabel>
                    <Select
                        labelId="plant-company-label"
                        id="plant-company" defaultValue={""}
                        {...register("plnt_cmpny", { required: "Company is required" })}
                    >
                        {companyList.map((company) => (
                        <MenuItem key={company._id} value={company._id}>
                            {company.cmpny_code} - {company.cmpny_desc}
                        </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>{errors.plnt_cmpny?.message}</FormHelperText>
                    </FormControl>
                </div>
                <div className="input-container"> 
                    <FormControl fullWidth variant="filled" error={!!errors.plnt_loc}>
                    <InputLabel id="plant-location-label">Location</InputLabel>
                    <Select
                        labelId="plant-location-label"
                        id="plant-location" defaultValue={""}
                        {...register("plnt_loc", { required: "Location is required" })}
                    >
                        {locationList.map((location) => (
                        <MenuItem key={location._id} value={location._id}>
                            {location.stt_code} - {location.stt_name}
                        </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>{errors.plnt_loc?.message}</FormHelperText>
                    </FormControl>
                </div>


                <div className="action-buttons">
                    <div style={{padding: "1rem 2rem", display: "flex", alignItems: "center", gap: "1rem"}}>
                        <Button type="submit" variant="contained" size="large">
                            ADD <Add style={{ margin: "-3px 0 0 4px" }} />
                        </Button>
                        
                        <div className="reset-button" onClick={handleReset}> Reset </div>
                    </div>
                </div>
            </form>
        </section>
    )
}

export default AddEditPlant