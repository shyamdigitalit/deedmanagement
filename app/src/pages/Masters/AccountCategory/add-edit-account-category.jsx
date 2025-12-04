import "../../../styles/Drawer.css";
import { AccountTree, Add, Close, Save } from '@mui/icons-material'
import { Button, Checkbox, FormControlLabel, IconButton, TextField, Typography } from '@mui/material'
import React from 'react'
import { RippleEffect } from "../../../utilities/ripple";
import { useForm } from "react-hook-form";
import axiosInstance from "../../../config/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../../../redux/slices/snackbar";

const AddEditAccountCategory = (props) => {

    const user = useSelector((state) => state.auth.user)
    const dispatch = useDispatch();

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            cat_name: null,
            cat_dtl: null,
            cat_lvl: null,
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
            const result = await axiosInstance.post(`/acccat/create`, data).then(res => res.data)
            
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
                    <AccountTree color="primary" style={{ fontSize: "2rem", margin: "-10px 0" }} /> ADD ACCOUNT CATEGORY
                </Typography>
                <IconButton onClick={() => props.onClose()}> <Close color="error" width={300} /> </IconButton>
            </div>
            <form className="drawer-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="input-container"> 
                    <TextField label="Category Name" variant="filled" fullWidth 
                        {...register("cat_name", { required: "Category Name is required" })}
                        error={!!errors.cat_name} helperText={errors.cat_name?.message}
                    /> 
                </div>
                <div className="input-container"> 
                    <TextField label="Category Details" variant="filled" fullWidth 
                        {...register("cat_dtl", { required: "Category Details is required" })}
                        error={!!errors.cat_dtl} helperText={errors.cat_dtl?.message}
                    /> 
                </div>
                <div className="input-container"> 
                    <TextField type="number" label="Category Level"  variant="filled" fullWidth 
                        {...register("cat_lvl", { required: "Category Level is required" })}
                        error={!!errors.cat_lvl} helperText={errors.cat_lvl?.message} /> 
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

export default AddEditAccountCategory