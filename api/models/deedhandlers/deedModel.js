import moment from 'moment'
import mongoose from 'mongoose'

const { Schema, model, Types } = mongoose

const DeedSchema = new Schema({
    deedNo: { type: String, required: true, trim: true },
    nameOfSeller: { type: String, trim: true },
    nameOfPurchaser: { type: String, trim: true },
    nameOfMouza: { type: String, trim: true },
    mutatedOrLeased: { type: String, trim: true },
    khatianNo: { type: String, trim: true },
    plotNo: { type: String, trim: true },
    totalAreaOfplotNo: { type: String, trim: true },
    totalPurchasedArea: { type: String, trim: true },
    totalMutatedArea: { type: String, trim: true },
    nonMutatedArea: { type: String, trim: true },
    locationOfPurchaseLand: { type: String, trim: true },
    notes: { type: String, trim: true },
    deedDocs: [{
        filId: { type: String, trim: true, required: true },
        filName: { type: String, trim: true, required: true },
        filContentType: { type: String, trim: true, required: true },
        filContentSize: { type: String, trim: true, required: true },
        filUploadStatus: { type: String, required: true, enum: ['Pending', 'Done'], default: 'Done' },
        fileUploadDate: { type: String, required: true, trim: true, default: () => moment().format("DD-MM-YYYY") },
        fileUploadTime: { type: String, required: true, trim: true, default: () => moment().format("HH:mm:ss") },
        fileUploadedby: { type: Types.ObjectId, ref: 'Account' }
    }],
    status: { type: String, required: true, enum: ['Open', 'Active', 'Inactive'], default: 'Active' },
    createdby: { type: Types.ObjectId, ref: 'Account', required: true },
    updatedby: { type: Types.ObjectId, ref: 'Account' },
    creationdt: { type: String, required: true, trim: true, default: () => moment().format("DD-MM-YYYY") },
    creationtm: { type: String, required: true, trim: true, default: () => moment().format("HH:mm:ss") },
    approvalStatus: { type: String, required: true, default: 'Approved', trim: true },
    currentPendingApprovalLevel: { type: Number, required: true, default: 0 }, // Current Approval Level
    approvalDetails: [{
        approvalLevel: { type: Number, required: true },
        approvalOption: { type: String, required: true, enum: ['Approval', 'Rejection'], default: 'Approval' },
        approver: { type: Types.ObjectId, ref: 'Account', required: true },
        approvalDate: { type: String, required: true, trim: true, default: () => moment().format("DD-MM-YYYY") },
        approvalTime: { type: String, required: true, trim: true, default: () => moment().format("HH:mm:ss") },
        approvalRemarks: { type: String, trim: true }
    }]
}, { timestamps: true })

export default model('Deed', DeedSchema)