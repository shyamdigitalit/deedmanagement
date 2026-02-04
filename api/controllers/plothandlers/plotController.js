import mongoose, { isValidObjectId } from 'mongoose';
import plotModel from '../../models/plothandlers/plotModel.js';
import plotMasterModel from '../../models/plothandlers/plotMasterModel.js';
import { uploadFile, deleteFile } from '../../utilities/fileOperations.js';

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

const getPlotMasterById = async (plotMasterId) => {
    try {
        const plotMaster = await plotMasterModel.findById(plotMasterId);
        return plotMaster;
    } catch (error) {
        console.error("Error retrieving Plot Master details:", error);
        throw error;
    }
};

const getPlotMasterByPlotNo = async (plotNo) => {
    try {
        const plotMaster = await plotMasterModel.find({ plotNo: plotNo }).sort({ createdAt: -1 });
        return plotMaster;
    }
    catch (error) {
        console.error("Error retrieving Plot Master details by Plot No:", error);
        throw error;
    }
};


// ----------------------------------------------------------------------------------------------------------------------------------
// ==================================================================================================================================
// Controller functions

const create = async (req, res) => {
    try {
        const plotPayld = req.body;
        const user = req.user;
        
        if (plotPayld.plotType === null) {
            const plotMaster = await plotMasterModel.create({
                plotNo: plotPayld.plotNo,
                dateOfRegistration: plotPayld.dateOfRegistration,
                nameOfSeller: plotPayld.nameOfSeller,
                nameOfPurchaser: plotPayld.nameOfPurchaser,
                nameOfMouza: plotPayld.nameOfMouza,
                mutatedOrLeased: plotPayld.mutatedOrLeased,
                khatianNo: plotPayld.khatianNo
            });
            plotPayld.plotType = validateId(plotMaster._id);
        }
        else {
            plotPayld.plotType = validateId(plotPayld.plotType);
        }

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const fileField = 'plotDocs';
        const results = await uploadNewFiles(req.files, fileField, user?._id);

        if (results[fileField].length > 0) {
            plotPayld[fileField] = results[fileField];
        }

        Object.assign(plotPayld, {
            status: 'Active',
            approvalStatus: 'Approved',
            currentPendingApprovalLevel: 0,
            createdby: user?._id
        });

        const plot = await plotModel.create(plotPayld);
        if (!plot) {
            return res.status(422).json({ message: "Failed to add New Plot" });
        }

        res.status(201).json({
            message: "Plot details added successfully",
            data: plot
        });
    } catch (error) {
        console.error("Error creating Plot details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getAllPlotDetails = async (filter) => {
    try {
        const status = filter?.status ? String(filter?.status).trim().toLowerCase() : '';
        const plotNo = filter?.plotNo ? String(filter?.plotNo).trim().toLowerCase() : '';

        const pipeline = [
            ...(status !== '' ? [ { $match: { status: { $regex: `^${status}$`, $options: 'i' } } } ] : []),
            ...(plotNo !== '' ? [ { $match: { plotNo: String(plotNo).trim() } } ] : []),
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
        const plotRecords = await plotModel.aggregate(pipeline)

        return plotRecords
    } catch (error) {
        console.error(error)
    }
}

const readPlotMaster = async (req, res) => {
    try {
        const plotNo = req.query.plotno || '';
        const plotMasters = await getPlotMasterByPlotNo(plotNo);
        res.status(200).json({
            message: "Plot Masters retrieved successfully",
            data: plotMasters
        });
    } catch (error) {
        console.error("Error retrieving plot Masters:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const read = async (req, res) => {
    try {
        const status = req.query.status || '';
        const plotRecords = await getAllplotDetails({status})

        res.status(200).json({
            message: "plot details retrieved successfully",
            data: plotRecords
        });
    } catch (error) {
        console.error("Error retrieving plot details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const readById = async (req, res) => {
    try {
        const plotId = req.params.id;
        const plotRecord = await plotModel.findById(plotId)
            .populate(['createdby', 'updatedby']);
        if (!plotRecord) {
            return res.status(404).json({ message: "plot details not found" });
        }
        res.status(200).json({
            message: "plot details retrieved successfully",
            data: plotRecord
        });
    } catch (error) {
        console.error("Error retrieving plot details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const update = async (req, res) => {
    try {
        const plotId = new mongoose.Types.ObjectId(req.query.id) || null;
        const plotPayld = req.body;
        const user = req.user;

        [
            'serial', 'id', '_id', '__v', 'plotNo', 'createdby', 'creationdt', 'creationtm',
            'createdAt', 'updatedAt', 'createdAtITC', 'updatedAtITC'
        ]?.forEach(field => delete plotPayld[field]);
        Object.assign(plotPayld, { updatedby: user?._id });

        const filefield = 'plotDocs';
        const existingKey = `${filefield}Existing`;
        if (plotPayld?.[existingKey]?.length > 0) {
            plotPayld[filefield] = JSON.parse(plotPayld[existingKey]);
            delete plotPayld[existingKey];
        }

        const { plotDocs: plotDocsPayld } = plotPayld;
        delete plotPayld[filefield];

        let plotRecord = await plotModel.findById(plotId);
        if (!plotRecord) {
            return res.status(404).json({ message: "plot details not found" });
        }

        const plotDocsRmv = plotDocsPayld?.length > 0
            ? plotRecord.plotDocs.filter(file => !plotDocsPayld.some(f => f.filId === file.filId))
            : plotRecord.plotDocs;

        if (plotDocsRmv.length > 0) {
            await removeFiles(plotDocsRmv);

            let updtPlotRecord = await plotModel.findByIdAndUpdate(plotId, {
                $pull: { plotDocs: { filId: { $in: plotDocsRmv.map(f => f.filId) } } }
            }, { new: true });

            if (!updtPlotRecord) {
                return res.status(404).json({ message: "plot details update failed" });
            }
            plotRecord = updtPlotRecord;
        }

        if (req.files) {
            const results = await uploadNewFiles(req.files, filefield, user?._id);
            if (results[filefield].length > 0) {
                plotRecord = await plotModel.findByIdAndUpdate(plotId, {
                    $push: { plotDocs: { $each: results[filefield] } }
                }, { new: true });
            }
        }

        const plotInfo = await getAllPlotDetails({ plotNo: plotRecord.plotNo });
        res.status(201).json({
            message: apprvFlg === 0 ? "plot details updated successfully" : "plot details changes approved successfully",
            data: plotInfo[0] || plotRecord
        });
    } catch (error) {
        console.error("Error updating plot details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const statusUpdate = async (req, res) => {
    try {
        const plotId = new mongoose.Types.ObjectId(req.query.id) || null;
        const plotPayld = req.body;
        // console.log(plotPayld);
        const user = req.user

        const plotRecord = await complianceModel.findByIdAndUpdate(plotId,
            { status: plotPayld.status, updatedby: user._id },
            { new: true }
        );
        res.status(201).json({
            message: "plot details updated successfully",
            data: plotRecord
        });
    } catch (error) {
        console.error("Error deleting plot details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const remove = async (req, res) => {
    try {
        const plotId = new mongoose.Types.ObjectId(req.query.id) || null;
        // console.log(plotId);
        const plotRecord = await plotModel.findById(plotId);
        if (!plotRecord) {
            return res.status(404).json({ message: "plot details not found" });
        }
        else {
            const fileField = 'plotDocs';
            const files = plotRecord[fileField] || [];
            for (const file of files) {
                try {
                    await deleteFile(file.filId);
                } catch (err) {
                    console.error("❌ File Deletion Error:", err.message);
                }
            }
            const deletedPlot = await plotModel.findByIdAndDelete(plotId);
            if (!deletedPlot) {
                return res.status(404).json({ message: "plot details not found" });
            }
            res.status(200).json({
                message: "plot details and associated files deleted successfully",
                data: deletedPlot
            });
        }
    } catch (error) {
        console.error("Error deleting plot details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export default {
    create,
    readPlotMaster,
    read,
    readById,
    update,
    statusUpdate,
    remove
};

