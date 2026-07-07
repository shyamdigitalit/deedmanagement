import moment from 'moment'
import mongoose from 'mongoose'

const { Schema, model, Types } = mongoose

const DeedSchema = new Schema({
    
    plantId: { type: Types.ObjectId, ref: 'Plant', required: true },
    nameOfSeller: { type: String, trim: true },
    nameOfPurchaser: { type: String, trim: true },
    nameOfMouza: { type: String, trim: true },
    correcterOfLand: { type: String, trim: true },

    purchaseInCompany: { type: String, required: true, trim: true },
    deedDate: { type: Date, required: true, trim: true },
    deedNo: { type: String, required: true, trim: true },
    plotNo: { type: Types.ObjectId, ref: 'Plot' },

    totalArea: { type: String, trim: true },
    totalPurchasedArea: { type: String, trim: true },
    balanceArea: { type: String, trim: true },
    remainingArea: { type: String, trim: true },
    totalMutatedArea: { type: String, trim: true },
    nonMutatedArea: { type: String, trim: true },

    mutatedInCompany: { type: String, trim: true },
    mutatedKhatianNo: { type: String, trim: true },
    

    remarks: { type: String, trim: true },
    deedDocs: [{
        filId: { type: String, trim: true, required: true },
        filName: { type: String, trim: true, required: true },
        filPath: { type: String, trim: true, required: true },
        filContentType: { type: String, trim: true, required: true },
        filContentSize: { type: String, trim: true, required: true },
        filUploadStatus: { type: String, required: true, enum: ['Pending', 'Done'], default: 'Done' },
        fileUploadDate: { type: String, required: true, trim: true, default: () => moment().format("DD-MM-YYYY") },
        fileUploadTime: { type: String, required: true, trim: true, default: () => moment().format("HH:mm:ss") },
        fileUploadedby: { type: Types.ObjectId, ref: 'Account' }
    }],
    status: { type: String, required: true, enum: ['Open', 'Active', 'Inactive'], default: 'Active' },
    createdby: { type: Types.ObjectId, ref: 'Account', required: true },
    updatedby: { type: Types.ObjectId, ref: 'Account' }
}, { timestamps: true })

export default model('Deed', DeedSchema)