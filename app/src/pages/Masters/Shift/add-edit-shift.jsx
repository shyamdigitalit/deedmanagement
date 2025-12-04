import "../../../styles/Drawer.css";
import { AccountTree, Add, Close, FilterTiltShift, LocationOn, Save } from '@mui/icons-material'
import { Button, Checkbox, FormControlLabel, IconButton, TextField, Typography } from '@mui/material'
import React from 'react'
import { RippleEffect } from "../../../utilities/ripple";
import { useForm } from "react-hook-form";
import axiosInstance from "../../../config/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../../../redux/slices/snackbar";

const AddEditShift = (props) => {

    const user = useSelector((state) => state.auth.user)
    const dispatch = useDispatch();

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            shft_code: "",
            shft_name: "",
            shft_desc: "",
            shft_start_time: "",
            shft_end_time: "",
            status: "Active",
            
        },
        mode: "onBlur",
        reValidateMode: "onChange",
    });

    const onSubmit = async (data) => {
        // console.log(user)
        // console.log(data);
        data.createdby = user?._id;
        data.status = "Active";
        
        try {
            const result = await axiosInstance.post(`/shft/create`, data).then(res => res.data)
            
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
                    <FilterTiltShift color="primary" style={{ fontSize: "2rem", margin: "-10px 0" }} /> ADD SHIFT
                </Typography>
                <IconButton onClick={() => props.onClose()}> <Close color="error" width={300} /> </IconButton>
            </div>
            <form className="drawer-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="input-container"> 
                    <TextField label="Shift Code" variant="filled" {...register("shft_code", { required: "Shift Code is required" })} 
                    error={!!errors.shft_code} helperText={errors.shft_code?.message} fullWidth /> 
                </div>
                <div className="input-container"> 
                    <TextField  label="Shift Name"  variant="filled" {...register("shft_name", { required: "Shift Name is required" })} 
                    error={!!errors.shft_name} helperText={errors.shft_name?.message} fullWidth /> 
                </div>
                <div className="input-container"> 
                    <TextField  label="Shift Description"  variant="filled" {...register("shft_desc")} 
                    error={!!errors.shft_desc} helperText={errors.shft_desc?.message} fullWidth /> 
                </div>
                <div className="input-container"> 
                    <TextField type="time" label="Shift Start Time"  variant="filled" {...register("shft_start_time", { required: "Shift Start Time is required" })} 
                    error={!!errors.shft_start_time} helperText={errors.shft_start_time?.message} fullWidth /> 
                </div>
                <div className="input-container"> 
                    <TextField type="time" label="Shift End Time"  variant="filled" {...register("shft_end_time", { required: "Shift End Time is required" })} 
                    error={!!errors.shft_end_time} helperText={errors.shft_end_time?.message} fullWidth /> 
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

export default AddEditShift