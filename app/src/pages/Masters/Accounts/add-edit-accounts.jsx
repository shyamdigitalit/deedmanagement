import "../../../styles/Drawer.css";
import { AccountTree, Add, Close, Image, Report, Save } from '@mui/icons-material'
import { Button, Card, CardContent, Checkbox, FormControl, FormControlLabel, FormHelperText, IconButton, InputAdornment, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from '@mui/material'
import React from 'react'
import { RippleEffect } from "../../../utilities/ripple";
import { Form, useForm, useWatch } from "react-hook-form";
import axiosInstance from "../../../config/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../../../redux/slices/snackbar";
import FieldError from "../../../components/FieldError";
import moment from 'moment'

const AddEditAccounts = (props) => {

    const user = useSelector((state) => state.auth.user)
    const dispatch = useDispatch();

    const [selectedImage, setSelectedImage] = React.useState(null);
    const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
        mode: "onBlur",
        reValidateMode: "onChange",
        defaultValues: {
            acc_uname: '',
            acc_fname: '',
            acc_typ: ''
        }
    });

    const [accountTypeList, setAccountTypeList] = React.useState([])
    const [categoryList, setCategoryList] = React.useState([]);
    const [stateList, setStateList] = React.useState([]);
    const [departmentList, setDepartmentList] = React.useState([]);
    const [designationList, setDesignationList] = React.useState([]);
    const [reportingManagerList, setReportingManagerList] = React.useState([]);

    const accountType = useWatch({ control, name: "acc_typ" });

    React.useEffect(() => {
        fetchReportingManagerList(accountType);
    }, [accountType]);

    React.useEffect(() => {
        fetchMasterData();
        if (user) {
            reset({
                acc_uname: user?.username || '',
                acc_fname: user?.name || '',
                acc_typ: user?.acc_typ || ''
            });
        }
    }, [user, reset])
    
    const fetchMasterData = async () => {
        try {
            const [accountTypeResponse, categoryResponse, stateResponse, departmentResponse, designationResponse] = await Promise.allSettled([
                axiosInstance.get(`/acctyp/fetchuppr`),
                axiosInstance.get(`/acccat/fetch`),
                axiosInstance.get(`/stt/fetch`),
                axiosInstance.get(`/dept/fetch`),
                axiosInstance.get(`/desig/fetch`)
            ]);

            setAccountTypeList(accountTypeResponse.status === "fulfilled" ? accountTypeResponse.value.data.data : []);
            setCategoryList(categoryResponse.status === "fulfilled" ? categoryResponse.value.data.data : []);
            setStateList(stateResponse.status === "fulfilled" ? stateResponse.value.data.data : []);
            setDepartmentList(departmentResponse.status === "fulfilled" ? departmentResponse.value.data.data : []); 
            setDesignationList(designationResponse.status === "fulfilled" ? designationResponse.value.data.data : []);

        } catch (error) {
            console.error(error);
            dispatch(showSnackbar({ message: "Failed to fetch data", severity: 'error', duration: 2000 }));
        }
    };

    const fetchReportingManagerList = async (accountTypeId) => {
        try {
            let url = !accountTypeId ? '/acc/fetch' : `/acc/fetchuppr/${accountTypeId?._id || accountTypeId}`
            const response = await axiosInstance.get(url).then(res => res.data);
            
            if (response.statuscode === 202) {
                setReportingManagerList(!accountTypeId ? response.data.Acc : response.data);
            } 
        } catch (error) {
            console.error("Error fetching reporting managers:", error);
            dispatch(showSnackbar({ message: "Failed to fetch reporting managers", severity: 'error', duration: 2000 }));
        }
    };


    const onSubmit = async (data) => {
        data.createdby = user?._id;
        data.status = "Active";
        data.creation_dt = moment().format('DD-MM-YYYY')
        data.creation_tm = moment().format('hh:mm:ss a')
        
        try {
            const result = await axiosInstance.post(`/acc/create`, data).then(res => res.data)
            
            if(result.statuscode === 201){
                props.onClose(); // Close the drawer
                dispatch(showSnackbar({ message: result.message, severity: 'success', }));
            }

        }
        catch (error) {
            const message = error.response ? error.response.data.message : error.message;
            dispatch(showSnackbar({ message, severity: 'error', }));
        }
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setSelectedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageRemove = () => {
        setSelectedImage(null);
    };

    const handleReset = (e) => {
        RippleEffect(e)
        reset();
    };

    return (
        <section className="drawer-container">
            <div className="drawer-header">
                <Typography className="title" color="primary">
                    <AccountTree color="primary" style={{ fontSize: "2rem", margin: "-10px 0" }} /> ADD ACCOUNTS
                </Typography>
                <IconButton onClick={() => props.onClose()}> <Close color="error" width={300} /> </IconButton>
            </div>
            <form className="drawer-form" onSubmit={handleSubmit(onSubmit)}>

                <div style={{display: "grid", gridTemplateColumns: "1fr 3fr", gap: "1rem"}}>
                    <Card>
                        <CardContent>

                            {/* Image Uploader */}
                            <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem", flexDirection: "column" }}>
                                {!selectedImage ? (
                                    <div style={{ marginBottom: "1rem", textAlign: "center" }}>
                                        <Image style={{ fontSize: "4rem", color: "#757575" }} />
                                        <Typography variant="body2" color="textSecondary">
                                            No image selected
                                        </Typography>
                                        
                                        <Button variant="outlined" component="label">
                                            Upload Image
                                            <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                                        </Button>
                                    </div>
                                ) : (
                                    <div style={{ marginBottom: "1rem", textAlign: "center", display: "flex", flexDirection: "column" }}>
                                        <img
                                            src={selectedImage}
                                            alt="Selected"
                                            style={{ maxWidth: "100%", maxHeight: "100px", borderRadius: "8px" }}
                                        />
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            onClick={handleImageRemove}
                                            style={{ marginTop: "0.5rem" }}
                                        >
                                            Remove Image
                                        </Button>
                                    </div>
                                )}
                            </div>
                            {/* Image Uploader End */}

                            <div >
                                <div className="accounts-input-container">
                                <FormControl variant="filled" fullWidth error={!!errors.acc_typ}>
                                    <InputLabel id="account-type-label">Account Type</InputLabel>
                                    <Select labelId="account-type-label" id="account-type" defaultValue={""}
                                        {...register("acc_typ", { required: "Account Type is required" })} >
                                        <MenuItem value=""> <em>Select</em> </MenuItem>
                                            {accountTypeList.map((type) => (
                                                <MenuItem key={type._id} value={type._id}>
                                                    {type.typname}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                                </div>
                                <div className="accounts-input-container">
                                    <TextField label="Full Name" variant="filled" fullWidth {...register("acc_fname", { required: "Full Name is required" })}
                                        error={!!errors.acc_fname}  InputProps={{ endAdornment: !!errors.acc_fname && (<FieldError message={errors?.acc_fname?.message} />) }} />
                                </div>
                                <div className="accounts-input-container">
                                    <TextField label="Username" variant="filled" fullWidth {...register("acc_uname", { required: "Username is required" })}
                                        error={!!errors.acc_uname}  InputProps={{ endAdornment: !!errors.acc_uname && (<FieldError message={errors?.acc_uname?.message} />) }} />
                                </div>
                                <div className="accounts-input-container">
                                    <TextField label="Email" variant="filled" fullWidth type="email" {...register("acc_eml")}
                                        error={!!errors.acc_eml}/>
                                </div>
                                <div className="accounts-input-container">
                                    <TextField label="Password" variant="filled" fullWidth type="password" {...register("acc_pass", { required: "Password is required" })} 
                                        error={!!errors.acc_pass} InputProps={{ endAdornment: !!errors.acc_pass && (<FieldError message={errors?.acc_pass?.message} />) }} />
                                </div>
                            </div>
                        </CardContent>

                    </Card>

                    
                    <div>
                        <div className="form-fields" style={{maxHeight: "calc(100vh - 10rem)", overflow: "auto", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem"}}>
                            <div className="accounts-input-container">
                                <TextField label="Phone" variant="filled" fullWidth {...register("acc_phn")}
                                    error={!!errors.acc_phn}/>
                            </div>
                            <div className="accounts-input-container">
                                <TextField label="Secondary Phone" variant="filled" fullWidth {...register("acc_secphn")} />
                            </div>
                            {/* <div className="accounts-input-container">
                                <TextField label="Category" variant="filled" fullWidth {...register("acc_cat")} defaultValue />
                            </div> */}
                            
                            <div className="accounts-input-container"> 
                                <FormControl fullWidth variant="filled" error={!!errors.acc_cat}>
                                <InputLabel id="category-label">Category</InputLabel>
                                <Select labelId="category-label" id="category" defaultValue={""} {...register("acc_cat")} >
                                    {categoryList.map((category) => (
                                    <MenuItem key={category._id} value={category._id}>
                                        {category.cat_name}
                                    </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>{errors.acc_cat?.message}</FormHelperText>
                                </FormControl>
                            </div>
                            <div className="accounts-input-container">
                                <TextField label="Company" variant="filled" fullWidth {...register("acc_comp")} />
                            </div>
                            <div className="accounts-input-container">
                                <TextField label="Employee Code" variant="filled" fullWidth {...register("acc_emp_code")} />
                            </div>
                            
                            <div className="accounts-input-container">
                                <FormControl variant="filled" fullWidth error={!!errors.acc_dept}>
                                    <InputLabel id="department-label">Department</InputLabel>
                                    <Select labelId="department-label" id="department-select" defaultValue={""} {...register("acc_dept")} >
                                        <MenuItem value=""> <em>Select</em> </MenuItem>
                                        {departmentList.map((dept) => (
                                            <MenuItem key={dept._id} value={dept._id}>
                                                {dept.dept_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{errors.acc_dept?.message}</FormHelperText>
                                </FormControl>
                            </div>

                            <div className="accounts-input-container">
                                <FormControl variant="filled" fullWidth error={!!errors.acc_desig}>
                                    <InputLabel id="designation-label">Designation</InputLabel>
                                    <Select labelId="designation-label" id="designation-select" defaultValue={""} {...register("acc_desig")} >
                                        <MenuItem value=""> <em>Select</em> </MenuItem>
                                        {designationList.map((desig) => (
                                            <MenuItem key={desig._id} value={desig._id}>
                                                {desig.desig_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{errors.acc_desig?.message}</FormHelperText>
                                </FormControl>
                            </div>


                            {/* <div className="accounts-input-container">
                                <TextField label="Level" variant="filled" fullWidth {...register("acc_lvl")} />
                            </div> */}
                            

                            <div className="accounts-input-container">
                                <FormControl variant="filled" fullWidth error={!!errors.acc_reporting}>
                                    <InputLabel id="reporting-manager-label">Reporting To</InputLabel>
                                    <Select labelId="reporting-manager-label" id="reporting-manager-select" defaultValue={""} {...register("acc_reporting")}>
                                        <MenuItem value=""> <em>Select</em> </MenuItem>
                                        {reportingManagerList.map((manager) => (
                                            <MenuItem key={manager._id} value={manager._id}>
                                                {manager.acc_fname} ({manager.acc_uname})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{errors.acc_reporting?.message}</FormHelperText>
                                </FormControl>
                            </div>

                            {/* <div className="accounts-input-container">
                                <TextField label="Organization" variant="filled" fullWidth {...register("acc_org")} />
                            </div> */}
                            {/* <div className="accounts-input-container">
                                <TextField label="Division" variant="filled" fullWidth {...register("acc_div")} />
                            </div> */}
                            

                            <div className="accounts-input-container">
                                <FormControl variant="filled" fullWidth error={!!errors.acc_state}>
                                    <InputLabel id="state-label">State</InputLabel>
                                    <Select labelId="state-label" id="state-select" defaultValue={""} {...register("acc_state")} >
                                        <MenuItem value=""> <em>Select</em> </MenuItem>
                                        {stateList.map((state) => (
                                            <MenuItem key={state._id} value={state._id}>
                                                {state.stt_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{errors.acc_state?.message}</FormHelperText>
                                </FormControl>
                            </div>


                            {/* <div className="accounts-input-container">
                                <TextField label="Base Location District" variant="filled" fullWidth {...register("acc_base_loc_dist")} />
                            </div> */}
                            <div className="accounts-input-container">
                                <TextField label="Address" variant="filled" fullWidth {...register("acc_addrss")} />
                            </div>
                            <div className="accounts-input-container">
                                <TextField label="PAN" variant="filled" fullWidth {...register("acc_pan")} />
                            </div>
                            <div className="accounts-input-container">
                                <TextField label="GST" variant="filled" fullWidth {...register("acc_gst")} />
                            </div>
                            {/* <div className="accounts-input-container">
                                <TextField label="Image" variant="filled" fullWidth {...register("acc_img")} />
                            </div>
                            <div className="accounts-input-container">
                                <TextField label="Image Public ID" variant="filled" fullWidth {...register("acc_img_publicid")} />
                            </div> */}
                            <div className="accounts-input-container">
                                <TextField label="Date of Birth" variant="filled" fullWidth type="date" InputLabelProps={{ shrink: true }} 
                                {...register("acc_dob")} />
                            </div>
                            <div className="accounts-input-container">
                                <TextField label="Anniversary" variant="filled" fullWidth type="date" InputLabelProps={{ shrink: true }} 
                                {...register("acc_anniversary")} />
                            </div>

                            
                        </div>
                    </div>

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

export default AddEditAccounts