import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const DeedMasterSchema = new Schema({
    deedNo: { type: String, required: true, trim: true },
    dateOfRegistration: { type: String, trim: true },
    nameOfSeller: { type: String, trim: true },
    nameOfPurchaser: { type: String, trim: true },
    nameOfMouza: { type: String, trim: true },
    mutatedOrLeased: { type: String, trim: true },
    khatianNo: { type: String, trim: true },
    status: { type: String, required: true, enum: ['Open', 'Active', 'Inactive'], default: 'Active' },
    createdby: { type: Types.ObjectId, ref: 'Account', required: true },
    updatedby: { type: Types.ObjectId, ref: 'Account' }
}, { timestamps: true });

export default model('Deedmaster', DeedMasterSchema);