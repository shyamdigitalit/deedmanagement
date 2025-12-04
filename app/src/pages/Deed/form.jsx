import "../../../styles/InspectionEntryForm.css";

import React, { useState } from 'react';
import { Add, ArrowBack, Close } from "@mui/icons-material";
import { Autocomplete, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import axiosInstance from "../../../config/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../../../redux/slices/snackbar";
import { Link, useNavigate } from "react-router-dom";
import POGPForm from "../../../components/pogpform";
import PERIODIC_ELEMENTS from "../../../utilities/periodic-elements";


const OTHER_ELEMENTS = [ "SiO₂", "Total Moisture", "Al₂O₃", "Ash", "Fe₂O₃", "VM", "FeO", "FC", "R₂O₃", "CaF₂", "CaO", 
    "Boric Acid", "MgO", "L₂O₃", "LOI",
]

const MERGED_ELEMENTS = [...PERIODIC_ELEMENTS, ...OTHER_ELEMENTS];

const DEFAULTVALUES = {
    tcNo: "",
    poNo: "",
    gpNo: "",
    grnNo: "",
    shift: "",
    material: "",
    invoiceNo: "",
    truckNo: "",
    party: "",
    // date: "",
    batchNo: "",
    billWt: "",
    receivedWt: "",
    sizeAnalysisReport: [],
    wetAnalysisElement: [],
    physicalInspectionElement: [],
    partyTCElement: [],
    notes: ""
}


export default function AddEditRMTC() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(state => state.auth.user);
    const [approvalRemarks, setApprovalRemarks] = useState(null);
    const [refreshPOGP, setRefreshPOGP] = useState(false);
    const { register, control, handleSubmit, reset, setValue, formState: {errors} } = useForm({
        defaultValues: DEFAULTVALUES
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "sizeAnalysisReport"
    });
    const { fields: wetAnalysisFields, append: wetAnalysisAppend, remove: wetAnalysisRemove } = useFieldArray({
        control,
        name: "wetAnalysisElement"
    });
    const { fields: physicalInspectionFields, append: physicalInspectionAppend, remove: physicalInspectionRemove } = useFieldArray({
        control,
        name: "physicalInspectionElement"
    });
    const { fields: partyTCFields, append: partyTCAppend, remove: partyTCRemove } = useFieldArray({
        control,
        name: "partyTCElement"
    });
    // Track input and selection status per index for wet analysis
    const [inputs, setInputs] = useState(
        wetAnalysisFields.map(() => ({ inputValue: '', selectedFromOptions: false }))
    );

    // Track input and selection status per index for party TC
    const [partyInputs, setPartyInputs] = useState(
        partyTCFields.map(() => ({ inputValue: '', selectedFromOptions: false }))
    );


    const handleInputChange = (index, newInputValue) => {
        const isMatch = MERGED_ELEMENTS.includes(newInputValue) || newInputValue === '';
        const updatedInputs = [...inputs];
        updatedInputs[index] = {
            inputValue: newInputValue,
            selectedFromOptions: isMatch,
        };
        setInputs(updatedInputs);
    };

    const handlePartyInputChange = (index, newInputValue) => {
        const isMatch = MERGED_ELEMENTS.includes(newInputValue) || newInputValue === '';
        const updatedPartyInputs = [...partyInputs];
        updatedPartyInputs[index] = {
            inputValue: newInputValue,
            selectedFromOptions: isMatch,
        };
        setPartyInputs(updatedPartyInputs);
    };
    const id = new URLSearchParams(window.location.search).get("_id");
    React.useEffect(() => {
        id && getRMTCById(id);
    }, [id]);


    const getRMTCById = async (id) => {
        try {
            const result = await axiosInstance.get(`/rmtc/fetchby/${id}`).then(res => res.data);
            if (result.statuscode === 200) {
                const rmtcData = result.data;
                if(result.data.approvalStatus === "Rejected") setApprovalRemarks(rmtcData.approvalDetails[rmtcData.approvalDetails.length - 1]);
                reset(rmtcData)
            } else {
                console.error("Error fetching RMTC by ID:", result.message);
            }
        } catch (error) {
            console.error("Error fetching RMTC by ID:", error);
        }
    };

    
    const onSubmit = async (data) => {
        data.createdby = user._id
        console.log(data);
        
        try {
            const response = id ? await axiosInstance.put(`/rmtc/update/${id}`, data).then(res => res.data) : 
            await axiosInstance.post("/rmtc/create", data).then(res => res.data);
            console.log("Response from server:", response);
            if (response.statuscode === 201) {
                navigate('/rmtc');
                dispatch(showSnackbar({ message: response.message, severity: 'success', duration: 2000 }));
            }
            else {
                console.error("Error creating RMTC record:", response.message);
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
                        <Link to={"/rmtc"}><ArrowBack color="primary" style={{ fontSize: "3rem", margin: "-10px 0" }} /> </Link>
                        RMTC ( Raw Material Test Certificate ) 
                    </Typography>
                    <span style={{fontSize: "1rem", color: "#888"}}>
                        TC NO. : 
                        <input {...register("tcNo", {required: true})} type="text" style={{width: "250px", marginLeft: "5px"}} />
                    </span>

                </div>
                <div style={{display: "flex", gap: "1rem"}}>
                    <Button variant="contained" size="large" type="submit">{id ? "UPDATE":"SAVE"}</Button>
                    {!id && <Button variant="outlined" size="large" color="warning" type="button" onClick={() => {
                        reset(DEFAULTVALUES)
                        setRefreshPOGP(!refreshPOGP);
                    }}>Reset</Button>}
                </div>
    
            </div>

            <POGPForm id={id} control={control} errors={errors} reset={reset} setValue={setValue} refreshPOGP={refreshPOGP} defaultValues={DEFAULTVALUES} />
            
            <section style={{display: "flex", flexDirection: "row", alignItems: "start", gap: "1.5rem", marginTop: "1.5rem"}}>
                <Card style={{width: "50%"}}>
                    <CardContent>
                        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem"}}>
                            <Typography variant="h5" style={{margin: 0}}>Wet analysis report</Typography>
                            <Button variant="outlined" color="primary" onClick={() => wetAnalysisAppend({ element: "", value: "" })} > <Add /> ADD ROW </Button>
                        </div>
                        {wetAnalysisFields.map((item, index) => (
                            <div key={item.id} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "5px", marginBottom: "1rem" }}>
                                <Stack spacing={2}> 
                                    <Controller name={`wetAnalysisElement.${index}.element`} control={control} defaultValue={inputs[index]?.inputValue || ""}
                                        rules={{ required: "Element is required" }}
                                        render={({ field }) => (
                                            <Autocomplete freeSolo fullWidth options={MERGED_ELEMENTS} inputValue={field.value} 
                                            onInputChange={(event, newInputValue) => {
                                                field.onChange(newInputValue); // sync with RHF
                                                handleInputChange(index, newInputValue); // your custom logic
                                            }}
                                            renderInput={(params) => ( <TextField {...params} label={ !inputs[index] || inputs[index]?.selectedFromOptions ? "Element" : "Compound" } variant="outlined" error={!!errors?.wetAnalysisElement?.[index]?.element} /> )}
                                            />
                                        )}
                                    />  
                                </Stack>
                                <TextField {...register(`wetAnalysisElement.${index}.value`, {required: true})} type="number" onWheel={(e) => e.target.blur()} inputProps={{ step: 'any' }} label="Value" variant="outlined" error={!!errors?.wetAnalysisElement?.[index]?.value} />
                                <Button variant="outlined" color="error" onClick={() => wetAnalysisRemove(index)} > <Close /> Remove </Button>
                                <div></div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                
                <Card style={{width: "50%"}}>
                    <CardContent>
                        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem"}}>
                            <Typography variant="h5" style={{margin: 0}}>Party TC report</Typography>
                            <Button variant="outlined" color="primary" onClick={() => partyTCAppend({ element: "", value: "" })} > <Add /> ADD ROW </Button>
                        </div>
                        {partyTCFields.map((item, index) => (
                            <div key={item.id} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "5px", marginBottom: "1rem" }}>
                                <Stack spacing={2}>
                                    <Controller name={`partyTCElement.${index}.element`} control={control} defaultValue={partyInputs[index]?.inputValue || ""}
                                        rules={{ required: "Element is required" }}
                                        render={({ field }) => (
                                        <Autocomplete freeSolo fullWidth options={MERGED_ELEMENTS} inputValue={field.value}
                                        onInputChange={(event, newInputValue) => {
                                            field.onChange(newInputValue); // sync with form
                                            handlePartyInputChange(index, newInputValue); // your logic
                                        }}
                                        renderInput={(params) => ( <TextField {...params} label={ !partyInputs[index] || partyInputs[index]?.selectedFromOptions ? "Element" : "Compound" } variant="outlined" error={!!errors?.partyTCElement?.[index]?.element} /> )}
                                        />
                                    )}
                                    />
                                </Stack>
                                <TextField {...register(`partyTCElement.${index}.value`, {required: true})} type="number" onWheel={(e) => e.target.blur()} inputProps={{ step: 'any' }} label="Value" variant="outlined" error={!!errors?.partyTCElement?.[index]?.value} />
                                <Button variant="outlined" color="error" onClick={() => partyTCRemove(index)} > <Close /> Remove </Button>
                                <div></div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </section>
            
            <section style={{display: "flex", flexDirection: "row", alignItems: "start", gap: "1.5rem", marginTop: "1.5rem"}}>
                <Card style={{width: "50%"}}>
                    <CardContent>
                        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem"}}>
                            <Typography variant="h5" style={{margin: 0}}>Size Analysis Report (%)</Typography>
                            <Button variant="outlined" color="primary" onClick={() => append({ size: fields.length+10+"mm", percentage: "" })} > <Add /> ADD ROW </Button>
                        </div>
                        {fields.map((item, index) => (
                            <div key={item.id} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "5px", marginBottom: "1rem" }}>
                                <TextField {...register(`sizeAnalysisReport.${index}.size`, {required: true})} label="Size" variant="outlined" error={!!errors?.sizeAnalysisReport?.[index]?.size} />
                                <TextField {...register(`sizeAnalysisReport.${index}.percentage`, {required: true})} type="number" onWheel={(e) => e.target.blur()} inputProps={{ step: 'any' }} label="Percentage" error={!!errors?.sizeAnalysisReport?.[index]?.percentage}
                                variant="outlined" sx={noArrowCSS} InputProps={{
                                    endAdornment: (<span style={{ marginLeft: "5px" }}>%</span>)
                                }} />
                                <Button variant="outlined" color="error" onClick={() => remove(index)} > <Close /> Remove </Button>
                                <div></div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                
                <Card style={{width: "50%"}}>
                    <CardContent>
                        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem"}}>
                            <Typography variant="h5" style={{margin: 0}}>Physical Inspection report (%)</Typography>
                            <Button variant="outlined" color="primary" onClick={() => physicalInspectionAppend({ size: physicalInspectionFields.length+10+"mm", percentage: "" })} > <Add /> ADD ROW </Button>
                        </div>
                        {physicalInspectionFields.map((item, index) => (
                            <div key={item.id} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "5px", marginBottom: "1rem" }}>
                                <TextField {...register(`physicalInspectionElement.${index}.size`, {required: true})} label="Size" variant="outlined" error={!!errors?.physicalInspectionElement?.[index]?.size} />
                                <TextField {...register(`physicalInspectionElement.${index}.percentage`, {required: true})} type="number" onWheel={(e) => e.target.blur()} inputProps={{ step: 'any' }} label="Percentage" error={!!errors?.physicalInspectionElement?.[index]?.percentage}
                                variant="outlined" sx={noArrowCSS} InputProps={{
                                    endAdornment: (<span style={{ marginLeft: "5px" }}>%</span>)
                                }} />
                                <Button variant="outlined" color="error" onClick={() => physicalInspectionRemove(index)} > <Close /> Remove </Button>
                                <div></div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </section>
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
                ></textarea>

            </div>


        </form>


    </section>
  );
}


const noArrowCSS = {
    // For Chrome, Safari, Edge
    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
      margin: 0,
    },
    // For Firefox
    '& input[type=number]': {
      MozAppearance: 'textfield',
    },
  }