import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const PlotMasterSchema = new Schema({
    plotNo: { type: String, required: true, trim: true },
    dateOfRegistration: { type: String, trim: true },
    nameOfSeller: { type: String, trim: true },
    nameOfPurchaser: { type: String, trim: true },
    nameOfMouza: { type: String, trim: true },
    mutatedOrLeased: { type: String, trim: true },
    khatianNo: { type: String, trim: true }
}, { timestamps: true });

export default model('Plotmaster', PlotMasterSchema);