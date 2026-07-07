import mongoose, { isValidObjectId } from 'mongoose';
import deedModel from '../../models/deedhandlers/deedModel.js';
import deedMasterModel from '../../models/deedhandlers/deedMasterModel.js';
import { uploadFile, deleteFile } from '../../utilities/fileOperations.js';
import fs from "fs/promises";

// ---------------------------------------------------------------------------------------------------------------------------------
// =================================================================================================================================
// Reusable functions---------------------------------------------------------------------------------------------------------------

export const validateId = (id) => {
    if (!isValidObjectId(id)) {
        throw new Error("Invalid ObjectId");
    }
    return new mongoose.Types.ObjectId(id);
}

export const uploadNewFiles = async (files, fileField, userId) => {
    const results = { [fileField]: [] };
    const duplicates = { [fileField]: [] };

    if (!files || files.length === 0) return results;

    const fileList = Array.isArray(files)
        ? files.filter(f => f.fieldname === fileField)
        : files[fileField] || [];

    for (const file of fileList) {
        try {
            results[fileField].push({
                filId: file.filename, // unique identifier
                filName: file.filename,
                filOriginalName: file.originalname,
                filPath: file.path,
                filContentType: file.mimetype,
                filContentSize: file.size,
                filUploadStatus: "Done",
                fileUploadedby: userId
            });
        } catch (err) {
            console.error("❌ Upload Error:", err.message);
        }
    }

    return results;
};

export const removeFiles = async (files) => {
    if (!files?.length) return;
    console.log(files)
    await Promise.allSettled(
        files.map(async (file) => {
            try {
                if (file.filPath) {
                    await fs.unlink(file.filPath);
                }
            } catch (err) {
                if (err.code !== "ENOENT") {
                    console.error(
                        "❌ File Deletion Error:",
                        err.message
                    );
                }
            }
        })
    );
};

export const searchDeeds = async (req, res) => {
  try {

    const { search, sellerName } = req.query;

    // main filters
    const matchFilter = { status: { $ne: "Inactive" } };
    if (sellerName?.trim()) matchFilter.nameOfSeller = { $regex: `^${sellerName.trim()}$`, $options: "i" };
    const searchFilter = {};

    if (search?.trim()) {
      searchFilter.$or = [
        { deedNo: { $regex: search.trim(), $options: "i" } },
        { "plotNo.plotNo": { $regex: search.trim(), $options: "i" } }
      ];
    }

    const deeds = await deedModel.aggregate([
      { $match: matchFilter },
      { $lookup: { from: "plots", localField: "plotNo", foreignField: "_id", as: "plotNo" } },
      { $unwind: { path: "$plotNo", preserveNullAndEmptyArrays: true } },

      // search filter
      ...(Object.keys(searchFilter).length ? [{ $match: searchFilter }] : [])

    ]);

    return res.status(200).json({ success: true, data: deeds });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


const getDeedAreaSummary = async (req, res) => {
    try {
        const { groupBy } = req.query;

        let groupField;

        if (groupBy === "purchaseInCompany") {
            groupField = "$purchaseInCompany";
        } else if (groupBy === "nameOfMouza") {
            groupField = "$nameOfMouza";
        } else {
            return res.status(400).json({
                message: "groupBy must be purchaseInCompany or nameOfMouza"
            });
        }

        const result = await deedModel.aggregate([
            { $match: { status: { $ne: "Inactive" } } },
            { $lookup: { from: 'plots', localField: 'plotNo', foreignField: '_id', as: 'plot' } },
            { $unwind: { path: '$plot', preserveNullAndEmptyArrays: true } },
            { $addFields: { nameOfMouza: "$plot.nameOfMouza" } },
            {
                $group: {
                    _id: groupField,

                    totalArea: {
                        $sum: {
                            $convert: {
                                input: "$totalArea",
                                to: "double",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    },

                    totalPurchasedArea: {
                        $sum: {
                            $convert: {
                                input: "$totalPurchasedArea",
                                to: "double",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    },

                    remainingArea: {
                        $sum: {
                            $convert: {
                                input: "$remainingArea",
                                to: "double",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    [groupBy]: "$_id",
                    totalArea: { $round: ["$totalArea", 2] },
                    totalPurchasedArea: { $round: ["$totalPurchasedArea", 2] },
                    remainingArea: { $round: ["$remainingArea", 2] }
                }
            },
            {
                $sort: {
                    [groupBy]: 1
                }
            }
        ]);

    const data = result.map((item, index) => ({
    _id: index,
    ...item,
    }));
    return res.status(200).json({
      success: true,
      data: data,
    });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


export const getAllDeedDetails = async (filter) => {
    try {
        const matchQuery = {};

        if (filter?.deedId) matchQuery._id = new mongoose.Types.ObjectId(filter.deedId);
        if (filter?.plantId) matchQuery.plantId = new mongoose.Types.ObjectId(filter.plantId);
        if (filter?.deedNo?.trim()) matchQuery.deedNo = { $regex: filter.deedNo.trim(), $options: "i" };
        if (filter?.nameOfMouza?.trim()) matchQuery["plot.nameOfMouza"] = { $regex: filter.nameOfMouza.trim(), $options: "i" };
        if (filter?.plotNo?.trim()) matchQuery["plot.plotNo"] = { $regex: filter.plotNo.trim(), $options: "i" };
        if (filter?.mutatedKhatianNo?.trim()) matchQuery.mutatedKhatianNo = { $regex: filter.mutatedKhatianNo.trim(), $options: "i" };
        if (filter?.nameOfSeller?.trim()) matchQuery.nameOfSeller = { $regex: filter.nameOfSeller.trim(), $options: "i" };
        if (filter?.nameOfPurchaser?.trim()) matchQuery.nameOfPurchaser = { $regex: filter.nameOfPurchaser.trim(), $options: "i" };


        /* DATE RANGE FILTER */

        if (filter?.fromDate || filter?.toDate) {
            matchQuery.createdAt = {};
            if (filter?.fromDate) matchQuery.createdAt.$gte = new Date(filter.fromDate);
            if (filter?.toDate) {
                const toDate = new Date(filter.toDate);
                toDate.setHours(23, 59, 59, 999);
                matchQuery.createdAt.$lte = toDate;
            }
        }

        const pipeline = [
            { $lookup: { from: 'plants', localField: 'plantId', foreignField: '_id', as: 'plant' } },
            { $unwind: { path: '$plant', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'accounts', localField: 'createdby', foreignField: '_id', as: 'createdby' } },
            { $unwind: { path: '$createdby', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'accounts', localField: 'updatedby', foreignField: '_id', as: 'updatedby' } },
            { $unwind: { path: '$updatedby', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'plots', localField: 'plotNo', foreignField: '_id', as: 'plot' } },
            { $unwind: { path: '$plot', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'locations', localField: 'plot.locationId', foreignField: '_id', as: 'location' } },
            { $unwind: { path: '$location', preserveNullAndEmptyArrays: true } },

            { $unwind: { path: '$approvalDetails', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'accounts', localField: 'approvalDetails.approver', foreignField: '_id', as: 'approvalDetails.approver' } },
            { $unwind: { path: '$approvalDetails.approver', preserveNullAndEmptyArrays: true } },
            { $addFields: { plantName: '$plant.plantName', locationName: "$location.locationName", nameOfMouza: "$plot.nameOfMouza" } },
            {
                $addFields: {
                    createdAtITC: { $dateToString: { format: "%d-%m-%Y %H:%M:%S", date: '$createdAt', timezone: "+05:30" } },
                    updatedAtITC: { $dateToString: { format: "%d-%m-%Y %H:%M:%S", date: '$updatedAt', timezone: "+05:30" } },
                    plotNumber: "$plot.plotNo"
                }
            },
            { $match: matchQuery },
            {
                $group: {
                    _id: '$_id',
                    doc: { $first: '$$ROOT' },
                    approvalDetails: {
                        $push: {
                            $cond: [
                                { $gt: [{ $ifNull: ['$approvalDetails.approvalLevel', null] }, null] },
                                '$approvalDetails',
                                '$$REMOVE'
                            ]
                        }
                    }
                }
            },

            // merge back
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            "$doc",
                            { approvalDetails: "$approvalDetails" }
                        ]
                    }
                }
            },
            { $sort: { updatedAt: -1 } },
        ]
        const deedRecords = await deedModel.aggregate(pipeline)

        return deedRecords
    } catch (error) {
        console.error(error)
    }
}




// ----------------------------------------------------------------------------------------------------------------------------------
// ==================================================================================================================================
// Controller functions

const create = async (req, res) => {
    try {
        const payload = req.body;
        const user = req.user;

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const fileField = 'deedDocs';
        const results = await uploadNewFiles(req.files, fileField, user?._id);

        if (results[fileField].length > 0) {
            payload[fileField] = results[fileField];
        }



        // Sum all purchased areas for the plot
        const purchasedAreaResult = await deedModel.aggregate([
            { $match: { plotNo: new mongoose.Types.ObjectId(payload.plotNo), status: { $ne: 'Inactive' } } },
            {
                $group: {
                    _id: null,
                    totalPurchasedArea: { $sum: { $toDouble: "$totalPurchasedArea" } }
                }
            }
        ]);

        const existingPurchasedArea = purchasedAreaResult.length > 0 ? purchasedAreaResult[0].totalPurchasedArea : 0;
        const currentPurchasedArea = Number(payload.totalPurchasedArea || 0);
        const totalPurchased = existingPurchasedArea + currentPurchasedArea;
        const totalArea = Number(payload.totalArea || 0);
        payload.remainingArea = totalArea - totalPurchased;

        Object.assign(payload, {
            status: 'Active',
            approvalStatus: 'Approved',
            currentPendingApprovalLevel: 0,
            createdby: user?._id
        });

        
        const deed = await deedModel.create(payload);
        if (!deed) {
            return res.status(422).json({ message: "Failed to add New Deed" });
        }

        res.status(201).json({
            message: "Deed details added successfully",
            data: deed
        });
    } catch (error) {
        console.error("Error creating Deed details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const read = async (req, res) => {
    try {
        const deedRecords = await getAllDeedDetails(req.query)

        res.status(200).json({
            message: "Deed details retrieved successfully",
            data: deedRecords
        });
    } catch (error) {
        console.error("Error retrieving Deed details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const readById = async (req, res) => {
    try {
        const deedId = req.params.id;
        const status = req.query.status || '';
        // const deedRecord = await deedModel.findById(deedId)
        const deedRecords = await getAllDeedDetails({deedId, status})
        const deedRecord = deedRecords[0];
        if (!deedRecord) {
            return res.status(404).json({ message: "Deed details not found" });
        }
        res.status(200).json({
            message: "Deed details retrieved successfully",
            data: deedRecord
        });
    } catch (error) {
        console.error("Error retrieving Deed details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const update = async (req, res) => {
    try {
        const deedId = new mongoose.Types.ObjectId(req.query.id) || null;
        const payload = req.body;
        payload.plantId = new mongoose.Types.ObjectId(payload.plantId) || null;
        const user = req.user;

        ['serial', 'id', '_id', '__v', 'createdby', 'createdAt',
            'updatedAt', 'createdAtITC', 'updatedAtITC']?.forEach(field => delete payload[field]);
        Object.assign(payload, { updatedby: user?._id });

        // removables removal & new Files upload
        const filefield = 'deedDocs';
        const existingKey = `${filefield}Existing`;
        if (payload?.[existingKey]?.length > 0) {
            payload[filefield] = JSON.parse(payload[existingKey]);
            delete payload[existingKey];
        }
        const { deedDocs: deedDocsPayld } = payload;
        delete payload[filefield];
        let deedRecord = await deedModel.findById(deedId);
        if (!deedRecord) {
            return res.status(404).json({ message: "Deed details not found" });
        }
        const deedDocsRmv = deedDocsPayld?.length > 0
            ? deedRecord.deedDocs.filter(file => !deedDocsPayld.some(f => f.filId === file.filId))
            : deedRecord.deedDocs;
        if (deedDocsRmv.length > 0) {
            await removeFiles(deedDocsRmv);

            let updtDeedRecord = await deedModel.findByIdAndUpdate(deedId, {
                $pull: { deedDocs: { filId: { $in: deedDocsRmv.map(f => f.filId) } } }
            }, { new: true });

            if (!updtDeedRecord) {
                return res.status(404).json({ message: "Deed details update failed" });
            }
            deedRecord = updtDeedRecord;
        }
        let newfiles = []
        if (req.files) {
            const results = await uploadNewFiles(req.files, filefield, user?._id);
            if (results[filefield].length > 0) {
                newfiles = [...results[filefield]];
            }
        }

        Object.assign(payload, { updatedby: user?._id });

        deedRecord = await deedModel.findByIdAndUpdate(deedId, {
            ...payload,
            $push: { deedDocs: { $each: newfiles } }
        }, { new: true });
        if (!deedRecord) {
            return res.status(404).json({ message: "Deed details update failed" });
        }

        // const deedInfo = await getAllDeedDetails({ deedNo: deedRecord.deedNo });
        res.status(201).json({
            message: "Deed details updated successfully",
            data: deedRecord
        });
    } catch (error) {
        console.error("Error updating Deed details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const remove = async (req, res) => {
    try {
        let deedflg = 0;
        const deedId = new mongoose.Types.ObjectId(req.query.id) || null;
        const deedDetails = await deedModel.findById(deedId);
        if (!deedDetails) {
            return res.status(404).json({ message: "Deed details not found" });
        }
        else {
            
            const fileField = 'deedDocs';
            const files = deedDetails[fileField] || [];
            for (const file of files) {
                try {
                    await deleteFile(file.filPath);
                } catch (err) {
                    console.error("❌ File Deletion Error:", err.message);
                }
            }
            const deletedDeed = await deedModel.findByIdAndDelete(deedDetails._id);
            if (deletedDeed) {
                res.status(200).json({
                    statuscode: 200,
                    message: "All Deed details and associated files deleted successfully",
                    data: deletedDeed
                });
            }
            else {
                res.status(422).json({ message: "Failed to delete Deed details" });
            }
        }
    } catch (error) {
        console.error("Error deleting Deed details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export default {
    getDeedAreaSummary,
    searchDeeds,
    create,
    read,
    readById,
    update,
    remove,
};