import "../../../styles/Drawer.css";
import { AccountTree, Add, Close, LocationOn, Save } from '@mui/icons-material'
import { Button, Checkbox, FormControlLabel, IconButton, TextField, Typography } from '@mui/material'
import React from 'react'
import { RippleEffect } from "../../../utilities/ripple";
import { useForm } from "react-hook-form";
import axiosInstance from "../../../config/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../../../redux/slices/snackbar";

const AddEditDesignation = (props) => {

    const user = useSelector((state) => state.auth.user)
    const dispatch = useDispatch();

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            desig_code: "",
            desig_name: "",
            desig_desc: "",
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
            const result = await axiosInstance.post(`/desig/create`, data).then(res => res.data)
            
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
                    <LocationOn color="primary" style={{ fontSize: "2rem", margin: "-10px 0" }} /> ADD DESIGNATION
                </Typography>
                <IconButton onClick={() => props.onClose()}> <Close color="error" width={300} /> </IconButton>
            </div>
            <form className="drawer-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="input-container"> 
                    <TextField label="Designation Code" variant="filled" {...register("desig_code", { required: "Designation Code is required" })} 
                    error={!!errors.desig_code} helperText={errors.desig_code?.message} fullWidth /> 
                </div>
                
                <div className="input-container"> 
                    <TextField label="Designation Name" variant="filled" {...register("desig_name", { required: "Designation Name is required" })} 
                    error={!!errors.desig_name} helperText={errors.desig_name?.message} fullWidth /> 
                </div>

                <div className="input-container"> 
                    <TextField  label="Designation Description"  variant="filled" {...register("desig_desc", { required: "Designation Description is required" })} 
                    error={!!errors.desig_desc} helperText={errors.desig_desc?.message} fullWidth /> 
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

export default AddEditDesignation