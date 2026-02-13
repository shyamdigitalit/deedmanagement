import moment from 'moment'
import mongoose from 'mongoose'

const { Schema, model, Types } = mongoose

const PlotSchema = new Schema({

  /* -------------------- References -------------------- */
  deedRef: {
    type: Types.ObjectId,
    ref: 'Deed',
    required: true
  },

  /* -------------------- Plot Identity -------------------- */
  plotNo: {
    type: String,
    trim: true,
    required: true
  },

  plotType: {
    type: String,
    trim: true,
    required: true
  },

  mouzaWithJLNo: { type: String, trim: true },
  locationOfPlot: { type: String, trim: true },

  /* -------------------- Calculated / Derived -------------------- */
  totalAreaOfPlot: { type: Number },               // from deed
  totalPurchasedArea: { type: Number },            // from deed
  balanceAreaToBePurchased: { type: Number },      // total - purchased
  totalMutatedArea: { type: Number },
  nonMutatedArea: { type: Number },

  excessPurchasedArea: { type: Number },
  excessMutatedDeedNotReceived: { type: Number },

  /* -------------------- Business Flags -------------------- */
  purchasedByDeedNotReceived: {
    type: Boolean,
    default: false
  },

  landPurchasedInNameOfCompany: {
    type: Boolean,
    default: false
  },

  purchasedLandRetainedArea: { type: Number },
  actualLandPurchasedLeasedOutArea: { type: Number },

  /* -------------------- Mutation Details -------------------- */
  mutatedCompanyKhNo: { type: String, trim: true },
  mutatedAreaCompanyKh: { type: Number },

  mutatedLeasedKhNo: { type: String, trim: true },
  mutatedAreaLeasedKh: { type: Number },

  mutatedFreeholdKhNo: { type: String, trim: true },
  mutatedAreaFreeholdKh: { type: Number },

  /* -------------------- Documents -------------------- */
  plotDocs: [{
    fileId: { type: String, required: true },
    fileName: { type: String, required: true },
    fileContentType: { type: String, required: true },
    fileContentSize: { type: String, required: true },
    fileUploadStatus: {
      type: String,
      enum: ['Pending', 'Done'],
      default: 'Done'
    },
    fileUploadDate: {
      type: String,
      default: () => moment().format('DD-MM-YYYY')
    },
    fileUploadTime: {
      type: String,
      default: () => moment().format('HH:mm:ss')
    },
    fileUploadedBy: {
      type: Types.ObjectId,
      ref: 'Account'
    }
  }],

  /* -------------------- Workflow -------------------- */
  status: {
    type: String,
    enum: ['Open', 'Active', 'Inactive'],
    default: 'Active'
  },

  remarks: { type: String, trim: true },

  approvalStatus: {
    type: String,
    default: 'Approved'
  },

  currentPendingApprovalLevel: {
    type: Number,
    default: 0
  },

  approvalDetails: [{
    approvalLevel: { type: Number, required: true },
    approvalOption: {
      type: String,
      enum: ['Approval', 'Rejection'],
      default: 'Approval'
    },
    approver: {
      type: Types.ObjectId,
      ref: 'Account',
      required: true
    },
    approvalDate: {
      type: String,
      default: () => moment().format('DD-MM-YYYY')
    },
    approvalTime: {
      type: String,
      default: () => moment().format('HH:mm:ss')
    },
    approvalRemarks: { type: String }
  }],

  /* -------------------- Audit -------------------- */
  createdBy: {
    type: Types.ObjectId,
    ref: 'Account',
    required: true
  },

  updatedBy: {
    type: Types.ObjectId,
    ref: 'Account'
  },

  creationDate: {
    type: String,
    default: () => moment().format('DD-MM-YYYY')
  },

  creationTime: {
    type: String,
    default: () => moment().format('HH:mm:ss')
  }

}, { timestamps: true })

export default model('Plot', PlotSchema)
