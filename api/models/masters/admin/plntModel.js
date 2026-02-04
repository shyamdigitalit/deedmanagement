import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const PlntSchema = new Schema({
    plantCode: { type: String, required: true, unique: true, trim: true },
    plantName: { type: String, required: true, trim: true },
    plnt_cmpny: { type: Types.ObjectId, ref: 'Company' },
    plnt_loc: { type: Types.ObjectId, ref: 'State' },
    status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Active' },
    createdby: { type: Types.ObjectId, ref: 'Account', required: true },
    updatedby: { type: Types.ObjectId, ref: 'Account' }
}, { timestamps: true });

export default model("Plant", PlntSchema);