import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const LocationSchema = new Schema({
    plantId: { type: Types.ObjectId, ref: 'Plant' },
    locationName: { type: String, required: true, trim: true },
    status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Active' },
    createdby: { type: Types.ObjectId, ref: 'Account', required: true },
    updatedby: { type: Types.ObjectId, ref: 'Account' }
}, {
    timestamps: true,
});

export default model('Location', LocationSchema);