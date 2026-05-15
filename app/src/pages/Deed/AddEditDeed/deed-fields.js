export const stepOneFieldsArray = [
  // {
  //   section: "deed",
  //   name: "deedNo",
  //   label: "Deed No *",
  //   placeholder: "eg., D-2024-5245",
  //   rules: { required: "Deed No is required" },
  //   helperText: "Unique legal number assigned to this deed",
  // },

  {
    section: "deed",
    name: "nameOfSeller",
    label: "Name of the Seller *",
    placeholder: "Enter Seller name",
    rules: { required: "Seller name is required" },
  },
  {
    section: "deed",
    name: "nameOfPurchaser",
    label: "Name of the Purchaser *",
    placeholder: "Enter Purchaser name",
    rules: { required: "Purchaser name is required" },
  },
  {
    section: "deed",
    name: "nameOfMouza",
    label: "Mouza Name",
    placeholder: "Enter mouza",
    rules: { required: "Required" },
  },
  {
    section: "deed",
    name: "purchaseInCompany",
    label: "Purchase In Company",
    placeholder: "Enter purchase in company",
    rules: { required: "Required" },
  },
  // {
  //   section: "deed",
  //   name: "deedNo",
  //   label: "Deed No",
  //   type: "number",
  //   placeholder: "Enter Deed No",
  //   rules: { required: "Required" },
  // },
  // {
  //   section: "deed",
  //   name: "plotNo",
  //   label: "Plot No",
  //   type: "number",
  //   placeholder: "Enter Plot No",
  //   rules: { required: "Required" },
  // },


  // ================= Area & Mutation =================
];

export const stepTwoFieldsArray = [
  {
    section: "calculation",
    name: "totalArea",
    label: "Total Area ( A )",
    type: "number",
    placeholder: "0.00",
    rules: { required: "Required" },
  },
  {
    section: "calculation",
    name: "totalPurchasedArea",
    label: "Total Purchased Area ( B ) ",
    type: "number",
    placeholder: "0.00",
    rules: { required: "Required" },
  },
  {
    section: "calculation",
    name: "balanceArea",
    label: "Balance Area ( C )",
    type: "number", variant: "filled",
    placeholder: "0.00", disabled: true,
    rules: { required: "Required" },
    helperText: "Auto-calculated: A - B",
  },
  {
    section: "calculation",
    name: "totalMutatedArea",
    label: "Total Mutated Area ( D )",
    type: "number",
    placeholder: "0.00",
    rules: { required: "Required" },
  },
  {
    section: "calculation",
    name: "nonMutatedArea",
    label: "Non-Mutated Area ( E )",
    type: "number", variant: "filled",
    placeholder: "0.00",
    disabled: true,
    helperText: "Auto-calculated: B - D",
    rules: { required: "Required" },
  },
];


export const stepThreeFieldsArray = [
  {
    section: "review",
    name: "mutatedInCompany",
    label: "Mutated In Company",
    placeholder: "Enter Mutated in company",
    rules: { required: "Required" },
  },
  {
    section: "review",
    name: "mutatedKhatianNo",
    label: "Mutated Khatian No",
    placeholder: "Enter Mutated Khaitan No",
    rules: { required: "Required" },
  },

]