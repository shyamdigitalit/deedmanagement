import mongoose from "mongoose";
import locationModel from "../../../models/masters/admin/locationModel.js";

const create = async (req, res) => {
    try {
        const payload = req.body;
        const user = req.user

        if (user) {
            Object.assign(payload, { status: 'Active', createdby: user?._id });
        }
        const existingLocation = await locationModel.findOne({ locationName: payload.locationName });
        if (existingLocation) {
            return res.status(409).json({ message: "Location code already exists" });
        }
        else {
            const location = await locationModel.create(payload);
            if (!location) {
                return res.status(422).json({ message: "Failed to create Location record" });
            } else {
                res.status(201).json({
                    statuscode: 201,
                    message: "Location record created successfully",
                    data: location
                });
            }
        }
    } catch (error) {
        console.error("Error creating Location record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const read = async (req, res) => {
    try {
        const pipeline = [
            { $sort: { updatedAt: -1 } },
            { $lookup: { from: 'accounts', localField: 'createdby', foreignField: '_id', as: 'createdby' } },
            { $unwind: { path: '$createdby', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'accounts', localField: 'updatedby', foreignField: '_id', as: 'updatedby' } },
            { $unwind: { path: '$updatedby', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'plants', localField: 'plantId', foreignField: '_id', as: 'plant' } },
            { $unwind: { path: '$updatedby', preserveNullAndEmptyArrays: true } },
            { $addFields: {
                createdAtITC: { $dateToString: { format: "%d-%m-%Y %H:%M:%S", date: '$createdAt', timezone: "+05:30" } },
                updatedAtITC: { $dateToString: { format: "%d-%m-%Y %H:%M:%S", date: '$updatedAt', timezone: "+05:30" } },
                plantName: "$plant.plantName"
            }}
        ]
        const locationRecords = await locationModel.aggregate(pipeline)

        res.status(200).json({
            message: "Location records retrieved successfully",
            data: locationRecords
        });
    } catch (error) {
        console.error("Error retrieving Location records:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const readById = async (req, res) => {
    try {
        const locationId = req.params.id;
        const locationRecord = await locationModel.findById(locationId)
            .populate(['createdby', 'updatedby']);
        if (!locationRecord) {
            return res.status(404).json({ message: "Location record not found" });
        }
        res.status(200).json({
            message: "Location record retrieved successfully",
            data: locationRecord
        });
    } catch (error) {
        console.error("Error retrieving Location record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const update = async (req, res) => {
    try {
        const locationId = new mongoose.Types.ObjectId(req.params.id) || null;
        const payload = req.body;
        const user = req.user

        if (user) {
            Object.assign(payload, { status: 'Active', updatedby: user?._id });
        }
        const updatedLocation = await locationModel.findByIdAndUpdate(locationId, payload, { new: true });
        if (!updatedLocation) {
            return res.status(404).json({ message: "Location record not found" });
        }
        res.status(201).json({
            message: "Location record updated successfully",
            data: updatedLocation,
            statuscode: 201
        });
    } catch (error) {
        console.error("Error updating Location record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const remove = async (req, res) => {
    try {
        const locationId = new mongoose.Types.ObjectId(req.params.id) || null;
        const deletedLocation = await locationModel.findByIdAndDelete(locationId);
        if (!deletedLocation) {
            return res.status(404).json({ message: "Location record not found" });
        }
        res.status(200).json({
            message: "Location record deleted successfully",
            data: deletedLocation,
            statuscode: 200
        });
    } catch (error) {
        console.error("Error deleting Location record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export default {
    create,
    read,
    readById,
    update,
    remove
};