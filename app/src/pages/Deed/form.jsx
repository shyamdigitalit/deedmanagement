import "../../styles/InspectionEntryForm.css";

import React, { useState } from 'react';
import { ArrowBack } from "@mui/icons-material";
import { Button, TextField, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import axiosInstance from "../../config/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../../redux/slices/snackbar";
import { Link, useNavigate } from "react-router-dom";
import FileUploader from "../../components/FileUploader";
// import POGPForm from "../../components/pogpform";

const DEFAULTVALUES = {
    deedNo: "",
    nameOfSeller: "",
    nameOfPurchaser: "",
    nameOfMouza: "",
    mutatedOrLeased: "",
    khatianNo: "",
    plotNo: "",
    totalAreaOfplotNo: "",
    totalPurchasedArea: "",
    totalMutatedArea: "",
    nonMutatedArea: "",
    locationOfPurchaseLand: "",
    notes: ""
}


export default function AddEditDeed() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(state => state.auth.user);
    const [files, setFiles] = useState([]);
    const [approvalRemarks, setApprovalRemarks] = useState(null);
    const { register, control, handleSubmit, reset, setValue, formState: {errors} } = useForm({
        defaultValues: DEFAULTVALUES
    });

    
    const id = new URLSearchParams(window.location.search).get("_id");
    React.useEffect(() => {
        id && getDeedById(id);
    }, [id]);


    const getDeedById = async (id) => {
        try {
            const result = await axiosInstance.get(`/deed/fetchby/${id}`).then(res => res.data);
            if (result.statuscode === 200) {
                const deedData = result.data;
                if(result.data.approvalStatus === "Rejected") setApprovalRemarks(deedData.approvalDetails[deedData.approvalDetails.length - 1]);
                reset(deedData)
            } else {
                console.error("Error fetching Deed by ID:", result.message);
            }
        } catch (error) {
            console.error("Error fetching Deed by ID:", error);
        }
    };

    
    const onSubmit = async (data) => {
        data.createdby = user._id
        data.deedDocs = files;
        const formData = new FormData();
        for (const key in data) {
            if (key === "deedDocs") {
                data.deedDocs.forEach((file, index) => {
                    formData.append("deedDocs", file);
                });
            } else {
                formData.append(key, data[key]);
            }
        }
        
        console.log(data);
        
        try {
            const url = id ? `/deed/update/${id}` : "/deed/create";
            const response = await axiosInstance[id ? "put":"post"](url, formData).then(res => res.data);
            console.log("Response from server:", response);
            if (response.statuscode === 201) {
                navigate('/deed');
                dispatch(showSnackbar({ message: response.message, severity: 'success', duration: 2000 }));
            }
            else {
                console.error("Error creating Deed record:", response.message);
            }

        } catch (error) {
            dispatch(showSnackbar({ message: error.message, severity: 'error', duration: 2000 }));
        }
    };
    
  
  return (
    <section className="inspection-entry-form">
        
        

        <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem"}}>
                <div>
                    {approvalRemarks?.approvalRemarks && <div 
                    style={{ fontSize: "1.2rem", color: "darkred", marginBottom: "1rem", 
                    }}> 
                        <strong>Remarks : </strong>
                        <span style={{backgroundColor: "#f1e387", color: "darkred", padding: ".3rem .7rem", borderRadius: "5px"}}> {approvalRemarks?.approvalRemarks}  </span>
                        <small style={{color: "gray", padding: "0 1rem"}}>by {approvalRemarks?.approver?.acc_fname} at L{approvalRemarks?.approvalLevel} </small>
                    </div>}
                    <Typography className="title" color="primary">
                        <Link to={"/deed"}><ArrowBack color="primary" style={{ fontSize: "3rem", margin: "-10px 0" }} /> </Link>
                    </Typography>
                    {/* <span style={{fontSize: "1rem", color: "#888"}}>
                        DEED NO. : 
                        <input {...register("deedNo", {required: true})} type="text" style={{width: "250px", marginLeft: "5px"}} />
                    </span> */}

                </div>
                <div style={{display: "flex", gap: "1rem"}}>
                    <Button variant="contained" size="large" type="submit">{id ? "UPDATE":"SAVE"}</Button>
                    {!id && <Button variant="outlined" size="large" color="warning" type="button" onClick={() => {
                        reset(DEFAULTVALUES)
                    }}>Reset</Button>}
                </div>
    
            </div>


            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "20px"}}>


                <Controller name="deedNo" control={control} defaultValue={control._formValues.deedNo ?? ""} 
                    rules={{ required: "Deed No is required" }}
                    render={({ field, fieldState }) => (
                        <TextField {...field} value={field.value ?? ""} label="Deed No" 
                        variant="filled" fullWidth error={!!errors.deedNo} />
                    )}
                />


                <Controller name="nameOfSeller" control={control} defaultValue={control._formValues.nameOfSeller ?? ""} 
                    rules={{ required: "Name Of Seller is required" }}
                    render={({ field, fieldState }) => (
                        <TextField {...field} value={field.value ?? ""} label="Name Of Seller" 
                        variant="filled" fullWidth error={!!errors.nameOfSeller} />
                    )}
                />

                
                <Controller name="nameOfPurchaser" control={control} defaultValue={control._formValues.nameOfPurchaser ?? ""} 
                    rules={{ required: "Name Of Purchaser is required" }}
                    render={({ field, fieldState }) => (
                        <TextField {...field} value={field.value ?? ""} label="Name Of Purchaser" 
                        variant="filled" fullWidth error={!!errors.nameOfPurchaser} />
                    )}
                 />
                
                <Controller name="nameOfMouza" control={control} defaultValue={control._formValues.nameOfMouza ?? ""} 
                    rules={{ required: "Name Of Mouza is required" }}
                    render={({ field, fieldState }) => (
                        <TextField {...field} value={field.value ?? ""} label="Name Of Mouza" 
                        variant="filled" fullWidth error={!!errors.nameOfMouza} />
                    )}
                />

                <Controller name="mutatedOrLeased" control={control} defaultValue={control._formValues.mutatedOrLeased ?? ""} 
                    rules={{ required: "Mutated / Leased is required" }}
                    render={({ field, fieldState }) => (
                        <TextField {...field} value={field.value ?? ""} label="Mutated / Leased" 
                        variant="filled" fullWidth error={!!errors.mutatedOrLeased} />
                    )}
                />

                
                <Controller name="khatianNo" control={control} defaultValue={control._formValues.khatianNo ?? ""} 
                    rules={{ required: "Khatian No is required" }}
                    render={({ field, fieldState }) => (
                        <TextField {...field} value={field.value ?? ""} label="Khatian No" 
                        variant="filled" fullWidth error={!!errors.khatianNo} />
                    )}
                />

                
                
                <Controller name="plotNo" control={control} defaultValue={control._formValues.plotNo ?? ""} 
                    rules={{ required: "Plot No is required" }}
                    render={({ field, fieldState }) => (
                        <TextField {...field} value={field.value ?? ""} label="Plot No" 
                        variant="filled" fullWidth error={!!errors.plotNo} />
                    )}
                />

                
                <Controller name="totalAreaOfplotNo" control={control} defaultValue={control._formValues.totalAreaOfplotNo ?? ""} 
                    rules={{ required: "Total Area of Plot No is required" }}
                    render={({ field, fieldState }) => (
                        <TextField {...field} value={field.value ?? ""} label="Total Area of Plot No" 
                        variant="filled" fullWidth error={!!errors.totalAreaOfplotNo} />
                    )}
                />
                
                <Controller name="totalPurchasedArea" control={control} defaultValue={control._formValues.totalPurchasedArea ?? ""} 
                    rules={{ required: "Total Purchased Area is required" }}
                    render={({ field, fieldState }) => (
                        <TextField {...field} value={field.value ?? ""} label="Total Purchased Area ( Deed )" 
                        variant="filled" fullWidth error={!!errors.totalPurchasedArea} />
                    )}
                />

                
                <Controller name="totalMutatedArea" control={control} defaultValue={control._formValues.totalMutatedArea ?? ""} 
                    rules={{ required: "Total Mutated Area is required" }}
                    render={({ field, fieldState }) => (
                        <TextField {...field} value={field.value ?? ""} label="Total Mutated Area" 
                        variant="filled" fullWidth error={!!errors.totalMutatedArea} />
                    )}
                />

                
                <Controller name="nonMutatedArea" control={control} defaultValue={control._formValues.nonMutatedArea ?? ""} 
                    rules={{ required: "Non - Mutated Area is required" }}
                    render={({ field, fieldState }) => (
                        <TextField {...field} value={field.value ?? ""} label="Non - Mutated Area" 
                        variant="filled" fullWidth error={!!errors.nonMutatedArea} />
                    )}
                />

                
                <Controller name="locationOfPurchaseLand" control={control} defaultValue={control._formValues.locationOfPurchaseLand ?? ""} 
                    rules={{ required: "Location Of Purchase Land is required" }}
                    render={({ field, fieldState }) => (
                        <TextField {...field} value={field.value ?? ""} label="Location Of Purchase Land" 
                        variant="filled" fullWidth error={!!errors.locationOfPurchaseLand} />
                    )}
                />
            </div>

            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px"}}>
                <div>
                    <Typography variant="h6" style={{ margin: "1.5rem 0 0" }}>Notes</Typography>
                    {errors.notes && <p style={{ color: 'red' }}>{errors.notes.message}</p>}

                    <textarea
                        {...register("notes", {
                        required: false,
                        maxLength: {
                            value: 500,
                            message: "Maximum 500 characters allowed"
                        }
                        })}
                        id="notes"
                        cols={80}
                        rows={5}
                        style={{padding: "10px"}}
                    ></textarea>

                </div>


                <FileUploader files={files} setFiles={setFiles}></FileUploader>
            </div>


        </form>


    </section>
  );
}