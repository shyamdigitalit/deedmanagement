import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const PlotSchema = new Schema({
    locationId: { type: Types.ObjectId, ref: 'Location' },
    nameOfMouza: { type: String, required: true, trim: true },
    plotNo: { type: String, required: true, trim: true },
    totalArea: { type: String, required: true, trim: true },
    status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Active' },
    createdby: { type: Types.ObjectId, ref: 'Account', required: true },
    updatedby: { type: Types.ObjectId, ref: 'Account' }
}, {
    timestamps: true
});

export default model('Plot', PlotSchema);