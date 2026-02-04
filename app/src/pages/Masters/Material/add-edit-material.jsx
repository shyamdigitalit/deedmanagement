import "../../../styles/Drawer.css";
import { Add, Close, LocationOn } from '@mui/icons-material'
import { Button, FormControl, FormHelperText, IconButton, InputLabel, MenuItem, OutlinedInput, Select, TextField, Typography } from '@mui/material'
import React from 'react'
import { RippleEffect } from "../../../utilities/ripple";
import { useForm } from "react-hook-form";
import axiosInstance from "../../../config/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../../../redux/slices/snackbar";

const AddEditMaterial = (props) => {

    const user = useSelector((state) => state.auth.user)
    const dispatch = useDispatch();
    const [plantList, setPlantList] = React.useState([]);

    const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm({
        defaultValues: {
            matrl_code: "",
            matrl_name: "",
            matrl_desc: "",
            matrl_type: "",
            matrl_grp: "",
            matrl_plnt: null,
            status: "Active",
        },
        mode: "onBlur",
        reValidateMode: "onChange",
    });

    React.useEffect(() => {
        getPlantList();
    }, []);

    const getPlantList = async () => {
        try {
            const result = await axiosInstance.get(`/plnt/fetch`).then(res => res.data)
            if (result.statuscode === 200) {
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
        data.matrl_plnt = data.matrl_plnt.map(item => ({ plnt_inf: item }))
        data.createdby = user?._id;
        data.status = "Active";

        try {
            const result = await axiosInstance.post(`/matrl/create`, data).then(res => res.data)

            if (result.statuscode === 201) {
                props.onClose();
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
                    <LocationOn color="primary" style={{ fontSize: "2rem", margin: "-10px 0" }} /> ADD MATERIAL
                </Typography>
                <IconButton onClick={() => props.onClose()}> <Close color="error" width={300} /> </IconButton>
            </div>
            <form className="drawer-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="input-container">
                    <TextField label="Material Code" variant="filled" {...register("matrl_code", { required: "Material Code is required" })}
                        error={!!errors.matrl_code} helperText={errors.matrl_code?.message} fullWidth />
                </div>
                <div className="input-container">
                    <TextField label="Material Name" variant="filled" {...register("matrl_name", { required: "Material Name is required" })}
                        error={!!errors.matrl_name} helperText={errors.matrl_name?.message} fullWidth />
                </div>

                <div className="input-container">
                    <TextField label="Material Description" variant="filled" {...register("matrl_desc")}
                        error={!!errors.matrl_desc} helperText={errors.matrl_desc?.message} fullWidth />
                </div>
                <div className="input-container">
                    <TextField label="Material Type" variant="filled" {...register("matrl_type", { required: "Material Type is required" })}
                        error={!!errors.matrl_type} helperText={errors.matrl_type?.message} fullWidth />
                </div>
                <div className="input-container">
                    <TextField label="Material Group" variant="filled" {...register("matrl_grp", { required: "Material Group is required" })}
                        error={!!errors.matrl_grp} helperText={errors.matrl_grp?.message} fullWidth />
                </div>
                <FormControl variant="outlined" error={!!errors.matrl_plnt} fullWidth>
                    <InputLabel id="plant-label">Plant</InputLabel>
                    <Select labelId="plant-label" id="plant-select" multiple
                        value={control._formValues.matrl_plnt || []}
                        onChange={(e) => setValue("matrl_plnt", e.target.value, { shouldValidate: true })}
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
                                {plant.plnt_code} - {plant.plnt_name}
                            </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>{errors.matrl_plnt?.message}</FormHelperText>
                </FormControl>



                <div className="action-buttons">
                    <div style={{ padding: "1rem 2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
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

export default AddEditMaterial