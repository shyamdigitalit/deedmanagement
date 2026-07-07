import plotModel from "../../../models/masters/deedsetups/plotModel.js";

const create = async (req, res) => {
    try {
        const plotPayld = req.body;
        const user = req.user;
        
        Object.assign(plotPayld, { status: 'Active', createdby: user._id });
        const existingPlot = await plotModel.findOne({ locationId: plotPayld.locationId, plotNo: plotPayld.plotNo, nameOfMouza: plotPayld.nameOfMouza });
        if (existingPlot) {
            return res.status(409).json({ message: "Plot No already exists", statuscode: 409 });
        } else {
            const plot = await plotModel.create(plotPayld);
            if (!plot) {
                return res.status(401).json({ message: "Failed to create Plot record" });
            } else {
                res.status(201).json({
                    message: "Plot record created successfully",
                    statuscode: 201,
                    data: plot
                });
            }
        }
    } catch (error) {
        console.error("Error creating Plot record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const read = async (req, res) => {
    const { plotNo } = req.query;
    const query = { status: { $ne: "Inactive" } };
    if (plotNo?.trim()) query.plotNo = { $regex: `^${plotNo.trim()}`, $options: "i" };


    try {
        const pipeline = [
            { $match: query },
            { $lookup: { from: 'accounts', localField: 'createdby', foreignField: '_id', as: 'createdby' } },
            { $unwind: { path: '$createdby', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'accounts', localField: 'updatedby', foreignField: '_id', as: 'updatedby' } },
            { $unwind: { path: '$updatedby', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'locations', localField: 'locationId', foreignField: '_id', as: 'location' } },
            { $unwind: { path: '$location', preserveNullAndEmptyArrays: true } },
            { $addFields: {
                createdAtITC: { $dateToString: { format: "%d-%m-%Y %H:%M:%S", date: '$createdAt', timezone: "+05:30" } },
                updatedAtITC: { $dateToString: { format: "%d-%m-%Y %H:%M:%S", date: '$updatedAt', timezone: "+05:30" } },
                locationName: "$location.locationName"
            }},
            { $sort: { updatedAt: -1 } }
        ]
        const plotRecords = await plotModel.aggregate(pipeline)
        res.status(200).json({
            message: "Plot records fetched successfully",
            statuscode: 200,
            data: plotRecords
        });
    } catch (error) {
        console.error("Error fetching Plot records:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const readById = async (req, res) => {
    try {
        const plotId = req.params.id;
        const plotRecord = await plotModel.findById(plotId).populate(['createdby', 'updatedby']);
        if (!plotRecord) {
            return res.status(404).json({ message: "Plot record not found", statuscode: 404 });
        }
        res.status(200).json({
            message: "Plot record fetched successfully",
            statuscode: 200,
            data: plotRecord
        });
    } catch (error) {
        console.error("Error fetching Plot record by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const update = async (req, res) => {
    try {
        const plotId = req.params.id;
        const plotPayld = req.body;
        const user = req.user;
        
        Object.assign(plotPayld, { status: 'Active', updatedby: user._id });
        const updatedPlot = await plotModel.findByIdAndUpdate(plotId, plotPayld, { new: true });
        if (!updatedPlot) {
            return res.status(404).json({ message: "Plot record not found", statuscode: 404 });
        }
        res.status(201).json({
            message: "Plot record updated successfully",
            statuscode: 201,
            data: updatedPlot
        });
    } catch (error) {
        console.error("Error updating Plot record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const remove = async (req, res) => {
    try {
        const plotId = req.params.id;
        const deletedPlot = await plotModel.findByIdAndDelete(plotId);
        if (!deletedPlot) {
            return res.status(404).json({ message: "Plot record not found", statuscode: 404 });
        }
        res.status(200).json({
            message: "Plot record deleted successfully",
            statuscode: 200
        });
    } catch (error) {
        console.error("Error deleting Plot record:", error);
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