import plntModel from '../../../models/masters/admin/plntModel.js';
import cmpnyModel from '../../../models/masters/admin/cmpnyModel.js';
import sttModel from '../../../models/masters/admin/sttModel.js';
import mongoose from 'mongoose';

const create = async (req, res) => {
    try {
        const plntPayld = req.body;
        const existingPlnt = await plntModel.findOne({ plantCode: plntPayld.plantCode });
        if (existingPlnt) {
            return res.status(409).json({ message: "Plant code already exists" });
        }
        else {
            const plnt = await plntModel.create(plntPayld);
            if (!plnt) {
                return res.status(422).json({ message: "Failed to create Plant record" });
            } else {
                res.status(201).json({
                    message: "Plant record created successfully",
                    statuscode: 201,
                    data: plnt
                });
            }
        }
    } catch (error) {
        console.error("Error creating Plant record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const upload = async (req, res) => {
    try {
        const plntPayload = req.body;
        const user = req.user;
        let resfl = plntPayload

        if (!plntPayload || !Array.isArray(plntPayload) || plntPayload.length === 0) {
            return res.status(400).json({ message: "Invalid or empty data" });
        }
        for (let i=0; i < plntPayload.length; i++) {
            const plntData = plntPayload[i];
            console.log(plntData)
            let cmpny = await cmpnyModel.findOne({ companyCode: plntData.company_code });
            let stt = await sttModel.findOne({ stt_code: plntData.state_code });
            if (!cmpny) {
                cmpny = await cmpnyModel.create({ companyCode: plntData.company_code, status: 'Active', createdby: user._id })
            }
            if (!stt) {
                stt = await sttModel.create({ stt_code: plntData.state_code, stt_name: plntData.state_name, status: 'Active', createdby: user._id })
            }
            if (cmpny && stt) {
                const exstngPlntData = await plntModel.findOne({ plantCode: plntData?.plant_code })
                if (!exstngPlntData) {
                    const newPlntData = await plntModel.create({
                        plantCode: plntData.plant_code,
                        plantName: plntData.plant_name,
                        plnt_cmpny: cmpny?._id,
                        plnt_loc: stt?._id,
                        status: 'Active',
                        createdby: user._id
                    })
                    if (newPlntData) {
                        resfl[i].upload_status = 'Success'
                        resfl[i].upload_message = 'Created Successfully'
                    }
                    else {
                        resfl[i].upload_status = 'Error'
                        resfl[i].upload_message = 'Failed to Upload'
                    }
                }
                else {
                    const updtdPlntData = await plntModel.updateOne({ plantCode: plntData.plantCode }, {
                        plantName: plntData.plantName,
                        plnt_cmpny: cmpny?._id,
                        plnt_loc: stt?._id,
                        status: 'Active',
                        updatedby: user._id
                    }, { new: true })
                    if (updtdPlntData) {
                        resfl[i].upload_status = 'Success'
                        resfl[i].upload_message = 'Updated Successfully'
                    }
                    else {
                        resfl[i].upload_status = 'Error'
                        resfl[i].upload_message = 'Failed to Upload'
                    }
                }
            }
            else {
                resfl[i].upload_status = 'Error'
                resfl[i].upload_message = 'Failed to Upload'
            }
        }
        if (resfl || resfl.length > 0) {
            return res.status(201).json({ message: 'Upload Summery', statuscode: 201, resfl })
        }
        else {
            return res.status(422).json({ message: 'Upload Issue Summery', statuscode: 422 })
        }
    } catch (error) {
        console.error("Error uploading Plant data:", error);
        res.status(500).json({ message: "Internal server error" });        
    }
}

const read = async (req, res) => {
    try {
        const cmpny = req.query.cmpny?.trim() || ''
        const loc = req.query.loc?.trim() || ''

        const matchConditions = {};
        if (cmpny) matchConditions['plnt_cmpny.cmpny_code'] = { $regex: cmpny, $options: 'i' };
        if (loc) matchConditions['plnt_loc.stt_name'] = { $regex: loc, $options: 'i' };

        const plntRecords = await plntModel.aggregate([
            {
                $lookup: {
                    from: 'companies',
                    localField: 'plnt_cmpny',
                    foreignField: '_id',
                    as: 'plnt_cmpny'
                }
            },
            { $unwind: { path: '$plnt_cmpny', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'states',
                    localField: 'plnt_loc',
                    foreignField: '_id',
                    as: 'plnt_loc'
                }
            },
            { $unwind: { path: '$plnt_loc', preserveNullAndEmptyArrays: true } },
            ...(Object.keys(matchConditions).length > 0 ? [{ $match: matchConditions }] : []),
            {
                $lookup: {
                    from: 'accounts',
                    localField: 'createdby',
                    foreignField: '_id',
                    as: 'createdby'
                }
            },
            {
                $lookup: {
                    from: 'accounts',
                    localField: 'updatedby',
                    foreignField: '_id',
                    as: 'updatedby'
                }
            },
            { $addFields: {
                createdAtITC: {
                    $dateToString: {
                        format: "%d-%m-%Y %H:%M:%S",
                        date: "$createdAt",
                        timezone: "+05:30"
                    }
                },
                updatedAtITC: {
                    $dateToString: {
                        format: "%d-%m-%Y %H:%M:%S",
                        date: "$updatedAt",
                        timezone: "+05:30"
                    }
                }
            }},
            {
                $project: {
                    plantCode: 1,
                    plantName: 1,
                    plnt_cmpny: 1,
                    plnt_loc: 1,
                    status: 1,
                    createdOn: '$createdAt',
                    updatedOn: '$updatedAt',
                    createdby: 1,
                    updatedby: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    createdAtITC: 1,
                    updatedAtITC: 1
                }
            },
            { $sort: { updatedAt: -1 } }
        ]);

        res.status(200).json({
            message: "Plant records retrieved successfully",
            statuscode: 200,
            data: plntRecords
        });
    } catch (error) {
        console.error("Error retrieving Plant records:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const readById = async (req, res) => {
    try {
        const plntId = req.params.id;
        const plntRecord = await plntModel.findById(plntId)
            .populate(['plnt_cmpny', 'plnt_loc', 'createdby', 'updatedby']);
        if (!plntRecord) {
            return res.status(404).json({ message: "Plant record not found" });
        }
        res.status(200).json({
            message: "Plant record retrieved successfully",
            statuscode: 200,
            data: plntRecord
        });
    } catch (error) {
        console.error("Error retrieving Plant record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const update = async (req, res) => {
    try {
        const plntId = req.params.id;
        const plntPayld = req.body;
        const updatedPlnt = await plntModel.findByIdAndUpdate(plntId, plntPayld, { new: true });
        if (!updatedPlnt) {
            return res.status(404).json({ message: "Plant record not found" });
        }
        res.status(201).json({
            message: "Plant record updated successfully",
            statuscode: 201,
            data: updatedPlnt
        });
    } catch (error) {
        console.error("Error updating Plant record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const deactivate = async (req, res) => {
    try {
        const plntData = req.body
        if (!plntData || !Array.isArray(plntData) || plntData.length === 0) {
            return res.status(400).json({ message: "Invalid or empty data" });
        }
        else {
            const inactvPlnts = await plntModel.updateMany({ _id: { $in: new mongoose.Types.ObjectId(plntData) }}, { status: 'Inactive'}, { new: true })
            return res.status(200).json({ message: 'Deactivation summary', statuscode: 200, data: inactvPlnts })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error" });
    }
}

const remove = async (req, res) => {
    try {
        const plntId = req.params.id;
        const deletedPlnt = await plntModel.findByIdAndDelete(plntId);
        if (!deletedPlnt) {
            return res.status(404).json({ message: "Plant record not found" });
        }
        res.status(200).json({
            message: "Plant record deleted successfully",
            statuscode: 200,
            data: deletedPlnt
        });
    } catch (error) {
        console.error("Error deleting Plant record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export default {
    create,
    upload,
    read,
    readById,
    update,
    deactivate,
    remove
};