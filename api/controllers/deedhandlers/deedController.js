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

const removeFiles = async (files, fileIds) => {
    if (!files?.length) return;
    
    await Promise.allSettled(
        files.map(file => deleteFile(file.filId).catch(err => console.error("❌ File Deletion Error:", err.message)))
    );
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

        if (req.files) {
            const results = await uploadNewFiles(req.files, filefield, user?._id);
            if (results[filefield].length > 0) {
                deedRecord = await deedModel.findByIdAndUpdate(deedId, {
                    $push: { deedDocs: { $each: results[filefield] } }
                }, { new: true });
            }
        }

        const deedInfo = await getAllDeedDetails({ deedNo: deedRecord.deedNo });
        res.status(201).json({
            message: apprvFlg === 0 ? "Deed details updated successfully" : "Deed details changes approved successfully",
            data: deedInfo[0] || deedRecord
        });
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

        const deedRecord = await complianceModel.findByIdAndUpdate(deedId,
            { status: deedPayld.status, updatedby: user._id },
            { new: true }
        );
        res.status(201).json({
            message: "Deed details updated successfully",
            data: deedRecord
        });
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