export const stepOneFieldsArray = [
  {
    section: "deed",
    name: "deedNo",
    label: "Deed No *",
    placeholder: "eg., D-2024-5245",
    rules: { required: "Deed No is required" },
    helperText: "Unique legal number assigned to this deed",
  },
  // {
  //   section: "deed",
  //   name: "dateOfRegistration",
  //   label: "Date of registration *",
  //   type: "date",
  //   // rules: { required: "Date of registration is required" },
  //   InputLabelProps: { shrink: true },
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
    name: "khatianNo",
    label: "Khatian No",
    placeholder: "Enter khatian",
    rules: { required: "Required" },
  },

  // ================= Area & Mutation =================
  {
    section: "area",
    name: "totalAreaOfplotNo",
    label: "Total Area of Plot",
    type: "number",
    placeholder: "0.00",
    rules: { required: "Required" },
  },
  {
    section: "area",
    name: "totalPurchasedArea",
    label: "Purchased Area as per Deed",
    type: "number",
    placeholder: "0.00",
    rules: { required: "Required" },
  },
  {
    section: "area",
    name: "totalMutatedArea",
    label: "Total Mutated Area",
    type: "number",
    placeholder: "0.00",
    rules: { required: "Required" },
  },
  {
    section: "area",
    name: "nonMutatedArea",
    label: "Non-Mutated Area",
    type: "number",
    placeholder: "0.00",
    disabled: true,
    helperText: "Auto-calculated: Purchased - Mutated",
  },
];

export const stepTwoFieldsArray = [
  {
    name: "nameOfMouza",
    label: "Mouza Name",
    placeholder: "Enter mouza",
    rules: { required: "Required" },
    grid: true,
  },
  {
    name: "plotNo",
    label: "Plot No",
    placeholder: "Enter plot",
    rules: { required: "Required" },
    grid: true,
  },
  {
    name: "locationOfPurchaseLand",
    label: "Location of Purchased Land",
    placeholder: "e.g., North-West corner adjacent to NH-34",
    rules: { required: "Required" },
    grid: true,
  },
];