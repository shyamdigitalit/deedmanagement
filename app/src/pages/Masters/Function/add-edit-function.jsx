import "../../../styles/Drawer.css";
import { AccountTree, Add, Badge, Close, LocationOn, Save } from '@mui/icons-material'
import { Button, Checkbox, FormControl, FormControlLabel, FormHelperText, IconButton, InputLabel, MenuItem, OutlinedInput, Select, TextField, Typography } from '@mui/material'
import React from 'react'
import { RippleEffect } from "../../../utilities/ripple";
import { useForm } from "react-hook-form";
import axiosInstance from "../../../config/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../../../redux/slices/snackbar";
import { swapRefresh } from "../../../redux/slices/functionRefresh";

const AddEditFunction = (props) => {

    const user = useSelector((state) => state.auth.user)
    const dispatch = useDispatch();
    const [plantList, setPlantList] = React.useState([]);

    const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm({
        defaultValues: {
            func_code: "",
            func_name: "",
            func_path: "",
            func_query: "",
            func_plnt: null,
            status: "Active",
        },
        mode: "onBlur",
        reValidateMode: "onChange",
    });

    React.useEffect(() => {
        console.log(props.data)
        if(props.data) {
            reset(props.data)
            let arr = props.data.func_plnt.map(plnt => plnt._id);
            setValue("func_plnt", arr);
        }

        getPlantList();
    }, [props]);

    const getPlantList = async () => {
        try {
            const result = await axiosInstance.get(`/plnt/fetch`).then(res => res.data)
            if(result.statuscode === 200) {
                setPlantList(result.data);
                return result.data;
            } else {
                dispatch(showSnackbar({ message: result.message, severity: 'error', duration: 2000 }));
                return [];
            }
        } catch (error) {
            console.error("Error fetching plant list:", error);
            dispatch(showSnackbar({ message: "Failed to fetch plant list", severity: 'error', duration: 2000 }));
            return [];
        }
    };


    const onSubmit = async (data) => {
        // console.log(user)
        // console.log(data);
        data.createdby = user?._id;
        data.status = "Active";
        
        try {
            const result = await axiosInstance.post(`/func/create`, data).then(res => res.data)
            
            if(result.statuscode === 201){
                props.onClose(); // Close the drawer
                dispatch(showSnackbar({ message: result.message, severity: 'success', }));
                dispatch(swapRefresh()); // Trigger refresh in function list
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
                    <Badge color="primary" style={{ fontSize: "2rem", margin: "-10px 0" }} /> {props.data ? "Update":"Add"} Function
                </Typography>
                <IconButton onClick={() => props.onClose()}> <Close color="error" width={300} /> </IconButton>
            </div>
            <form className="drawer-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="input-container"> 
                    <TextField label="Function Code" variant="filled" {...register("func_code", { required: "Function Code is required" })} 
                    error={!!errors.func_code} helperText={errors.func_code?.message} fullWidth /> 
                </div>
                
                <div className="input-container"> 
                    <TextField label="Function Name" variant="filled" {...register("func_name", { required: "Function Name is required" })} 
                    error={!!errors.func_name} helperText={errors.func_name?.message} fullWidth /> 
                </div>
                
                <div className="input-container"> 
                    <TextField label="Path" variant="filled" {...register("func_path")} 
                    error={!!errors.func_path} helperText={errors.func_path?.message} fullWidth /> 
                </div>
                
                
                <div className="input-container"> 
                    <TextField label="Query" variant="filled" {...register("func_query")} 
                    error={!!errors.func_query} helperText={errors.func_query?.message} fullWidth /> 
                </div>

                <FormControl variant="outlined" error={!!errors.func_plnt} fullWidth>
                    <InputLabel id="plant-label">Plant</InputLabel>
                    <Select labelId="plant-label" id="plant-select" multiple
                        value={control._formValues.func_plnt || []}
                        onChange={(e) => setValue("func_plnt", e.target.value, { shouldValidate: true })}
                        input={<OutlinedInput label="Plant" />}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                maxHeight: 224,
                                width: 250,
                                },
                            },
                        }}
                    >
                        {plantList.map((plant) => (
                        <MenuItem key={plant._id} value={plant._id}>
                            <Checkbox checked={control._formValues.func_plnt?.includes(plant._id) || false} />
                            {`${plant.plnt_code} - ${plant.plnt_name}`}
                        </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>{errors.func_plnt?.message}</FormHelperText>
                </FormControl>

                <div className="action-buttons">
                    <div style={{padding: "1rem 2rem", display: "flex", alignItems: "center", gap: "1rem"}}>
                        <Button type="submit" variant="contained" size="large">
                            {props.data ? "UPDATE":"SAVE"}
                        </Button>
                        
                        <div className="reset-button" onClick={handleReset}> Reset </div>
                    </div>
                </div>
            </form>
        </section>
    )
}

export default AddEditFunction