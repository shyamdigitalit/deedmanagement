import mongoose, { isValidObjectId } from 'mongoose';
import plotModel from '../../models/plothandlers/plotModel.js';
import plotMasterModel from '../../models/plothandlers/plotMasterModel.js';
import { uploadFile, deleteFile } from '../../utilities/fileOperations.js';

/* -------------------------------------------------------------------------- */
/*                               Helper Utils                                 */
/* -------------------------------------------------------------------------- */

const validateId = (id) => {
    if (!isValidObjectId(id)) {
        throw new Error('Invalid ObjectId');
    }
    return new mongoose.Types.ObjectId(id);
};

const uploadNewFiles = async (files, fileField, userId) => {
    const results = { [fileField]: [] };
    if (!files) return results;

    const fileList = Array.isArray(files)
        ? files.filter(f => f.fieldname === fileField)
        : files[fileField] || [];

    await Promise.allSettled(
        fileList.map(async (file) => {
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
                filUploadStatus: 'Done',
                fileUploadedby: userId
            });
        })
    );

    return results;
};

const removeFiles = async (files = []) => {
    await Promise.allSettled(
        files.map(f =>
            deleteFile(f.filId).catch(err =>
                console.error('❌ File Deletion Error:', err.message)
            )
        )
    );
};

/* -------------------------------------------------------------------------- */
/*                            Plot Master Helpers                              */
/* -------------------------------------------------------------------------- */

// const getPlotMasterByPlotNo = async (plotNo) => {
//     return plotMasterModel
//         .find({ plotNo })
//         .sort({ createdAt: -1 });
// };

/* -------------------------------------------------------------------------- */
/*                               Controllers                                   */
/* -------------------------------------------------------------------------- */

/* ------------------------------- CREATE ----------------------------------- */

const create = async (req, res) => {
    try {
        const plotPayld = req.body;
        const user = req.user;

        if (!plotPayld.plotType) {
            return res.status(400).json({ message: 'Plot Type is required' });
        }

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const { plotDocs } = await uploadNewFiles(req.files, 'plotDocs', user?._id);

        Object.assign(plotPayld, {
            plotDocs,
            createdBy: user?._id,
            status: 'Active',
            approvalStatus: 'Approved',
            currentPendingApprovalLevel: 0
        });

        const plot = await plotModel.create(plotPayld);

        res.status(201).json({
            message: 'Plot details added successfully',
            data: plot
        });

    } catch (error) {
        console.error('Error creating Plot:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/* ------------------------------- READ ALL --------------------------------- */

export const getAllPlotDetails = async (filter = {}) => {
    const pipeline = [
        ...(filter.status ? [{
            $match: { status: { $regex: `^${filter.status}$`, $options: 'i' } }
        }] : []),

        ...(filter.plotNo ? [{
            $match: { plotNo: filter.plotNo }
        }] : []),

        { $lookup: { from: 'accounts', localField: 'createdBy', foreignField: '_id', as: 'createdBy' } },
        { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },

        { $lookup: { from: 'accounts', localField: 'updatedBy', foreignField: '_id', as: 'updatedBy' } },
        { $unwind: { path: '$updatedBy', preserveNullAndEmptyArrays: true } },

        { $sort: { updatedAt: -1 } }
    ];

    return plotModel.aggregate(pipeline);
};

const read = async (req, res) => {
    try {
        const status = req.query.status || '';
        const plotRecords = await getAllPlotDetails({ status });

        res.status(200).json({
            message: 'Plot details retrieved successfully',
            data: plotRecords
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/* ------------------------------- READ BY ID -------------------------------- */

const readById = async (req, res) => {
    try {
        const plotId = validateId(req.params.id);

        const plotRecord = await plotModel
            .findById(plotId)
            .populate(['createdBy', 'updatedBy']);

        if (!plotRecord) {
            return res.status(404).json({ message: 'Plot not found' });
        }

        res.status(200).json({
            message: 'Plot details retrieved successfully',
            data: plotRecord
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/* ------------------------------- UPDATE ----------------------------------- */

const update = async (req, res) => {
    try {
        const plotId = validateId(req.query.id);
        const plotPayld = req.body;
        const user = req.user;

        [
            '_id', '__v', 'createdBy', 'createdAt', 'updatedAt'
        ].forEach(f => delete plotPayld[f]);

        plotPayld.updatedBy = user?._id;

        let plotRecord = await plotModel.findById(plotId);
        if (!plotRecord) {
            return res.status(404).json({ message: 'Plot not found' });
        }

        /* -------- Handle Existing Files -------- */
        if (plotPayld.plotDocsExisting) {
            plotPayld.plotDocs = JSON.parse(plotPayld.plotDocsExisting);
            delete plotPayld.plotDocsExisting;
        }

        const removedFiles = plotRecord.plotDocs.filter(
            f => !plotPayld.plotDocs?.some(p => p.filId === f.filId)
        );

        if (removedFiles.length) {
            await removeFiles(removedFiles);
        }

        /* -------- Upload New Files -------- */
        if (req.files) {
            const { plotDocs } = await uploadNewFiles(req.files, 'plotDocs', user?._id);
            plotPayld.plotDocs = [...(plotPayld.plotDocs || []), ...plotDocs];
        }

        const updatedPlot = await plotModel.findByIdAndUpdate(
            plotId,
            plotPayld,
            { new: true }
        );

        res.status(200).json({
            message: 'Plot details updated successfully',
            data: updatedPlot
        });

    } catch (error) {
        console.error('Error updating plot:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/* ------------------------------- STATUS UPDATE ----------------------------- */

const statusUpdate = async (req, res) => {
    try {
        const plotId = validateId(req.query.id);
        const user = req.user;

        const plotRecord = await plotModel.findByIdAndUpdate(
            plotId,
            { status: req.body.status, updatedBy: user._id },
            { new: true }
        );

        res.status(200).json({
            message: 'Plot status updated successfully',
            data: plotRecord
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/* ------------------------------- DELETE ----------------------------------- */

const remove = async (req, res) => {
    try {
        const plotId = validateId(req.query.id);

        const plotRecord = await plotModel.findById(plotId);
        if (!plotRecord) {
            return res.status(404).json({ message: 'Plot not found' });
        }

        await removeFiles(plotRecord.plotDocs);

        const deletedPlot = await plotModel.findByIdAndDelete(plotId);

        res.status(200).json({
            message: 'Plot details and associated files deleted successfully',
            data: deletedPlot
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/* ------------------------------- PLOT MASTER ------------------------------- */

// const readPlotMaster = async (req, res) => {
//     try {
//         const plotNo = req.query.plotno || '';
//         const plotMasters = await getPlotMasterByPlotNo(plotNo);

//         res.status(200).json({
//             message: 'Plot Masters retrieved successfully',
//             data: plotMasters
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

/* -------------------------------------------------------------------------- */
/*                                   EXPORT                                   */
/* -------------------------------------------------------------------------- */

export default {
    create,
    read,
    readById,
    update,
    statusUpdate,
    remove,
    // readPlotMaster
};
