import mongoose, { isValidObjectId } from 'mongoose';
import deedModel from '../../models/deedhandlers/deedModel.js';
import deedMasterModel from '../../models/deedhandlers/deedMasterModel.js';
import { uploadFile, deleteFile } from '../../utilities/fileOperations.js';

// ---------------------------------------------------------------------------------------------------------------------------------
// =================================================================================================================================
// Reusable functions---------------------------------------------------------------------------------------------------------------

const validateId = (id) => {
    if (isValidObjectId(id)) {
        throw new Error("Invalid ObjectId");
    }
    return new mongoose.Types.ObjectId(id);
}

const uploadNewFiles = async (files, fileField, userId) => {
    const results = { [fileField]: [] };
    const duplicates = { [fileField]: [] };

    if (!files || files.length === 0) return results;

    const fileList = Array.isArray(files)
        ? files.filter(f => f.fieldname === fileField)
        : files[fileField] || [];

    await Promise.allSettled(
        fileList.map(async (file) => {
            try {
                const uploadedFile = await uploadFile(
                    file.buffer,
                    file.originalname,
                    file.mimetype
                );
                results[fileField].push({
                    filId: uploadedFile?.file?._id,
                    filName: uploadedFile?.file?.filename,
                    filContentType: uploadedFile?.file?.metadata?.contentType,
                    filContentSize: uploadedFile?.file?.length,
                    filUploadStatus: "Done",
                    fileUploadedby: userId
                });
            } catch (err) {
                if (err.message.includes("Duplicate file")) {
                    duplicates[fileField].push(file.originalname);
                } else {
                    console.error("❌ Upload Error:", err.message);
                }
            }
        })
    );

    return results;
};

const getDeedMasterById = async (deedMasterId) => {
    try {
        const deedMaster = await deedMasterModel.findById(deedMasterId);
        return deedMaster;
    } catch (error) {
        console.error("Error retrieving Deed Master details:", error);
        throw error;
    }
};

const getDeedMasterByDeedNo = async (deedNo) => {
    try {
        const deedMaster = await deedMasterModel.find({ deedNo: deedNo }).sort({ createdAt: -1 });
        return deedMaster;
    }
    catch (error) {
        console.error("Error retrieving Deed Master details by Deed No:", error);
        throw error;
    }
};


// ----------------------------------------------------------------------------------------------------------------------------------
// ==================================================================================================================================
// Controller functions

const create = async (req, res) => {
    try {
        const deedPayld = req.body;
        const user = req.user;
        
        if (deedPayld.deedType === null) {
            const deedMaster = await deedMasterModel.create({
                deedNo: deedPayld.deedNo,
                dateOfRegistration: deedPayld.dateOfRegistration,
                nameOfSeller: deedPayld.nameOfSeller,
                nameOfPurchaser: deedPayld.nameOfPurchaser,
                nameOfMouza: deedPayld.nameOfMouza,
                mutatedOrLeased: deedPayld.mutatedOrLeased,
                khatianNo: deedPayld.khatianNo
            });
            deedPayld.deedType = validateId(deedMaster._id);
        }
        else {
            deedPayld.deedType = validateId(deedPayld.deedType);
        }

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const fileField = 'deedDocs';
        const results = await uploadNewFiles(req.files, fileField, user?._id);

        if (results[fileField].length > 0) {
            deedPayld[fileField] = results[fileField];
        }

        Object.assign(deedPayld, {
            status: 'Active',
            approvalStatus: 'Approved',
            currentPendingApprovalLevel: 0,
            createdby: user?._id
        });

        const deed = await deedModel.create(deedPayld);
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

export const getAllDeedDetails = async (filter) => {
    try {
        const status = filter?.status ? String(filter?.status).trim().toLowerCase() : '';
        const deedNo = filter?.deedNo ? String(filter?.deedNo).trim().toLowerCase() : '';

        const pipeline = [
            ...(status !== '' ? [ { $match: { status: { $regex: `^${status}$`, $options: 'i' } } } ] : []),
            ...(deedNo !== '' ? [ { $match: { deedNo: String(deedNo).trim() } } ] : []),
            { $lookup: { from: 'accounts', localField: 'createdby', foreignField: '_id', as: 'createdby' } },
            { $unwind: { path: '$createdby', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'accounts', localField: 'updatedby', foreignField: '_id', as: 'updatedby' } },
            { $unwind: { path: '$updatedby', preserveNullAndEmptyArrays: true } },

            { $unwind: { path: '$approvalDetails', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'accounts', localField: 'approvalDetails.approver', foreignField: '_id', as: 'approvalDetails.approver' } },
            { $unwind: { path: '$approvalDetails.approver', preserveNullAndEmptyArrays: true } },
            
            {
                $addFields: {
                    createdAtITC: { $dateToString: { format: "%d-%m-%Y %H:%M:%S", date: '$createdAt', timezone: "+05:30" } },
                    updatedAtITC: { $dateToString: { format: "%d-%m-%Y %H:%M:%S", date: '$updatedAt', timezone: "+05:30" } }
                }
            },
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
            { $replaceRoot: { newRoot: { $mergeObjects: ['$doc', { approvalDetails: '$approvalDetails' }] } } },
            { $sort: { updatedAt: -1 } },
        ]
        const deedRecords = await deedModel.aggregate(pipeline)

        return deedRecords
    } catch (error) {
        console.error(error)
    }
}

const readDeedMaster = async (req, res) => {
    try {
        const deedNo = req.query.deedno || '';
        const deedMasters = await getDeedMasterByDeedNo(deedNo);
        res.status(200).json({
            message: "Deed Masters retrieved successfully",
            data: deedMasters
        });
    } catch (error) {
        console.error("Error retrieving Deed Masters:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const read = async (req, res) => {
    try {
        const status = req.query.status || '';
        const deedRecords = await getAllDeedDetails({status})

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
        const deedRecord = await deedModel.findById(deedId)
            .populate(['createdby', 'updatedby']);
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
        const deedPayld = req.body;
        const user = req.user;
        let deedDocsRmv = [];

        [
            'serial', 'id', '_id', '__v', 'deedNo', 'createdby', 'creationdt', 'creationtm',
            'createdAt', 'updatedAt', 'createdAtITC', 'updatedAtITC'
        ]?.forEach(field => delete deedPayld[field]);

        Object.assign(deedPayld, { updatedby: user?._id });

        const filefield = 'deedDocs';
        const existingKey = `${filefield}Existing`;
        if (deedPayld?.[existingKey]?.length > 0) {
            deedPayld[filefield] = JSON.parse(deedPayld[existingKey]);
            delete deedPayld[existingKey];
        }

        const { deedDocs: deedDocsPayld } = deedPayld;
        delete deedPayld[filefield];

        let apprvFlg = 0, approvalInfo = {};
        const highestApprvlLvl = parseInt(deedPayld?.highestApprvlLvl);
        delete deedPayld?.highestApprvlLvl;

        if (deedPayld?.approvalOption && parseInt(deedPayld?.currentPendingApprovalLevel) > 0 && deedPayld?.approvalStatus !== 'Approved') {
            if (deedPayld?.approvalOption === 'Approval') {
                apprvFlg = 1;
                Object.assign(approvalInfo, {
                    approvalLevel: parseInt(deedPayld.currentPendingApprovalLevel),
                    approvalOption: deedPayld?.approvalOption || 'Approval',
                    approver: user?._id,
                    approvalRemarks: deedPayld?.approvalRemarks || '',
                });
                if (highestApprvlLvl > parseInt(deedPayld?.currentPendingApprovalLevel)) {
                    deedPayld.status = 'Pending';
                    deedPayld.currentPendingApprovalLevel = parseInt(deedPayld.currentPendingApprovalLevel) + 1;
                    deedPayld.approvalStatus = `Pending L${deedPayld.currentPendingApprovalLevel} Approval`;
                } else if (highestApprvlLvl === parseInt(deedPayld?.currentPendingApprovalLevel)) {
                    Object.assign(deedPayld, {
                        status: 'Active',
                        approvalStatus: 'Approved',
                        currentPendingApprovalLevel: 0,
                    });
                }
            } else if (deedPayld?.approvalOption === 'Rejection' && deedPayld.status === 'Pending') {
                apprvFlg = 2;
                Object.assign(approvalInfo, {
                    approvalLevel: parseInt(deedPayld.currentPendingApprovalLevel),
                    approvalOption: deedPayld?.approvalOption || 'Rejection',
                    approver: user?._id,
                    approvalRemarks: deedPayld?.approvalRemarks || '',
                });
            }
        } else {
            apprvFlg = 0;
            Object.assign(deedPayld, {
                status: 'Open',
                approvalStatus: 'Pending L1 Approval',
                currentPendingApprovalLevel: 1
            });
        }

        if (apprvFlg < 2) {
            let deedRecord = await deedModel.findByIdAndUpdate(deedId, {
                ...deedPayld,
                ...(apprvFlg === 1 && { $push: { approvalDetails: approvalInfo } })
            }, { new: true });

            if (!deedRecord) {
                return res.status(404).json({ message: "Deed details not found" });
            }

            const getFilesToRemove = (existingFiles, payloadFiles) =>
                payloadFiles?.length > 0
                    ? existingFiles.filter(file => !payloadFiles.some(f => f.filId === file.filId))
                    : existingFiles;

            deedDocsRmv = getFilesToRemove(deedRecord.deedDocs, deedDocsPayld);

            await Promise.allSettled(
                deedDocsRmv.map(file => deleteFile(file.filId).catch(err => console.error("❌ File Deletion Error:", err.message)))
            );

            let updtDeedRecord = await deedModel.findByIdAndUpdate(deedId, {
                $pull: { deedDocs: { filId: { $in: deedDocsRmv.map(f => f.filId) } } }
            }, { new: true });

            if (!updtDeedRecord) {
                return res.status(404).json({ message: "Deed details update failed" });
            }

            if (req.files) {
                const results = await uploadNewFiles(req.files, filefield, user?._id);
                if (results[filefield].length > 0) {
                    updtDeedRecord = await deedModel.findByIdAndUpdate(deedId, {
                        $push: { deedDocs: { $each: results[filefield] } }
                    }, { new: true });
                }
            }

            if (!updtDeedRecord) {
                return res.status(404).json({ message: "Deed details update failed" });
            }

            const deedInfo = await getAllDeedDetails({ deedNo: updtDeedRecord.deedNo });
            const deedDetails = deedInfo[0] || updtDeedRecord;

            res.status(201).json({
                message: apprvFlg === 0 ? "Deed details updated successfully" : "Deed details changes approved successfully",
                data: deedDetails
            });
        } else {
            const deedRecord = await deedModel.findByIdAndUpdate(deedId, {
                status: 'Open',
                approvalStatus: 'Pending L1 Approval',
                currentPendingApprovalLevel: 1,
                $push: { approvalDetails: approvalInfo }
            }, { new: true });

            if (!deedRecord) {
                return res.status(404).json({ message: "Deed details changes rejection failed" });
            }

            res.status(201).json({
                message: "Deed details changes rejected successfully",
                data: deedRecord
            });
        }
    } catch (error) {
        console.error("Error updating Deed details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const statusUpdate = async (req, res) => {
    try {
        const deedId = new mongoose.Types.ObjectId(req.query.id) || null;
        const deedPayld = req.body;
        // console.log(deedPayld);
        const user = req.user
        
        const deedRecord = await deedModel.findById(deedId);
        if (!deedRecord) {
            return res.status(404).json({ message: "Deed details not found" });
        }
        else {
            const updtDeedRecord = await deedModel.findByIdAndUpdate(deedId, { status: deedPayld.status, updatedby: user?._id }, { new: true })
            if (updtDeedRecord.modifiedCount === 0) {
                return res.status(404).json({ message: "Deed details update failed" });
            }
            else {
                res.status(201).json({
                    message: "Deed details updated successfully",
                    data: updtDeedRecord
                });
            }
        }
    } catch (error) {
        console.error("Error deleting Deed details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const remove = async (req, res) => {
    try {
        const deedId = new mongoose.Types.ObjectId(req.query.id) || null;
        // console.log(deedId);
        const deedRecord = await deedModel.findById(deedId);
        if (!deedRecord) {
            return res.status(404).json({ message: "Deed details not found" });
        }
        else {
            const fileField = 'deedDocs';
            const files = deedRecord[fileField] || [];
            for (const file of files) {
                try {
                    await deleteFile(file.filId);
                } catch (err) {
                    console.error("❌ File Deletion Error:", err.message);
                }
            }
            const deletedDeed = await deedModel.findByIdAndDelete(deedId);
            if (!deletedDeed) {
                return res.status(404).json({ message: "Deed details not found" });
            }
            res.status(200).json({
                message: "Deed details and associated files deleted successfully",
                data: deletedDeed
            });
        }
    } catch (error) {
        console.error("Error deleting Deed details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export default {
    create,
    readDeedMaster,
    read,
    readById,
    update,
    statusUpdate,
    remove
};