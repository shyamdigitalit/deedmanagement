import mongoose from 'mongoose';
import deedModel from '../../models/deedhandlers/deedModel.js';

// ---------------------------------------------------------------------------------------------------------------------------------
// =================================================================================================================================
// Reusable functions---------------------------------------------------------------------------------------------------------------

// null / empty / invalid numeric strings are treated as 0
const toNumber = (field) => ({ $convert: { input: field, to: 'double', onError: 0, onNull: 0 } });
const round2 = (field) => ({ $round: [field, 2] });
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Shared base pipeline: every dashboard API uses it, so all of them respect the same filters
const buildBasePipeline = (query = {}) => {
    const { plantId, locationId, nameOfMouza, mutatedInCompany, nameOfPurchaser, fromDate, toDate, search } = query;
    const matchQuery = { status: { $ne: 'Inactive' } };

    if (plantId && mongoose.isValidObjectId(plantId)) matchQuery.plantId = new mongoose.Types.ObjectId(plantId);
    if (locationId && mongoose.isValidObjectId(locationId)) matchQuery['plot.locationId'] = new mongoose.Types.ObjectId(locationId);
    if (nameOfMouza?.trim()) matchQuery['plot.nameOfMouza'] = nameOfMouza.trim();
    if (mutatedInCompany?.trim()) matchQuery.purchaseInCompany = mutatedInCompany.trim();
    if (nameOfPurchaser?.trim()) matchQuery.nameOfPurchaser = nameOfPurchaser.trim();

    // "Registered from / to" -> deed date
    if (fromDate || toDate) {
        matchQuery.deedDate = {};
        if (fromDate) matchQuery.deedDate.$gte = new Date(fromDate);
        if (toDate) {
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
            matchQuery.deedDate.$lte = to;
        }
    }

    if (search?.trim()) {
        const regex = { $regex: escapeRegex(search.trim()), $options: 'i' };
        matchQuery.$or = [
            // { deedNo: regex }, 
            { 'plot.plotNo': search.trim() }
        ];
    }

    return [
        { $lookup: { from: 'plots', localField: 'plotNo', foreignField: '_id', as: 'plot' } },
        { $unwind: { path: '$plot', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'locations', localField: 'plot.locationId', foreignField: '_id', as: 'location' } },
        { $unwind: { path: '$location', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'plants', localField: 'plantId', foreignField: '_id', as: 'plant' } },
        { $unwind: { path: '$plant', preserveNullAndEmptyArrays: true } },
        { $match: matchQuery },
        {
            $addFields: {
                plotKey: { $ifNull: ['$plotNo', '$_id'] },
                plotNumber: '$plot.plotNo',
                mouza: '$plot.nameOfMouza',
                locationName: '$location.locationName',
                plantName: '$plant.plantName',
                areaN: toNumber('$totalArea'),
                purchasedN: toNumber('$totalPurchasedArea'),
                mutatedN: toNumber('$totalMutatedArea')
            }
        }
    ];
};

// One row per plot: plot area, purchased area, mutated area, balance (area - purchased) and pending (purchased - mutated)
const groupByPlot = [
    {
        $group: {
            _id: '$plotKey',
            area: { $max: '$areaN' },
            purchased: { $sum: '$purchasedN' },
            mutated: { $sum: '$mutatedN' }
        }
    },
    {
        $addFields: {
            balance: round2({ $subtract: ['$area', '$purchased'] }),
            pending: round2({ $subtract: ['$purchased', '$mutated'] })
        }
    }
];

const countIf = (condition) => ({ $sum: { $cond: [condition, 1, 0] } });

// ---------------------------------------------------------------------------------------------------------------------------------
// =================================================================================================================================
// Controller functions

// Filter dropdown options
const getFilterOptions = async (req, res) => {
    try {
        const distinctOf = (field) => [
            { $match: { [field]: { $nin: [null, ''] } } },
            { $group: { _id: `$${field}` } },
            { $sort: { _id: 1 } }
        ];

        const [result] = await deedModel.aggregate([
            ...buildBasePipeline(),
            {
                $facet: {
                    plants: [
                        { $match: { plantName: { $ne: null } } },
                        { $group: { _id: '$plantId', name: { $first: '$plantName' } } },
                        { $sort: { name: 1 } }
                    ],
                    locations: [
                        { $match: { locationName: { $ne: null } } },
                        { $group: { _id: '$plot.locationId', name: { $first: '$locationName' } } },
                        { $sort: { name: 1 } }
                    ],
                    mouzas: distinctOf('mouza'),
                    mutatedInCompanies: distinctOf('purchaseInCompany'),
                    purchasers: distinctOf('nameOfPurchaser')
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            data: {
                plants: result.plants.map(p => ({ value: p._id, label: p.name })),
                locations: result.locations.map(l => ({ value: l._id, label: l.name })),
                mouzas: result.mouzas.map(m => m._id),
                mutatedInCompanies: result.mutatedInCompanies.map(c => c._id),
                purchasers: result.purchasers.map(p => p._id)
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard filters:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Land position + mutation cards + counts + "pending by company"
const getSummary = async (req, res) => {
    try {
        const [result] = await deedModel.aggregate([
            ...buildBasePipeline(req.query),
            {
                $facet: {
                    plots: [
                        ...groupByPlot,
                        {
                            $group: {
                                _id: null,
                                plots: { $sum: 1 },
                                plotArea: { $sum: '$area' },
                                purchased: { $sum: '$purchased' },
                                mutated: { $sum: '$mutated' },
                                // balance > 0 -> still to be purchased, balance < 0 -> purchased in excess of plot area
                                notPurchasedArea: { $sum: { $cond: [{ $gt: ['$balance', 0] }, '$balance', 0] } },
                                notPurchasedPlots: countIf({ $gt: ['$balance', 0] }),
                                excessArea: { $sum: { $cond: [{ $lt: ['$balance', 0] }, { $multiply: ['$balance', -1] }, 0] } },
                                excessPlots: countIf({ $lt: ['$balance', 0] }),
                                pendingPlots: countIf({ $gt: ['$pending', 0] })
                            }
                        }
                    ],
                    counts: [
                        {
                            $group: {
                                _id: null,
                                deeds: { $addToSet: '$deedNo' },
                                mouzas: { $addToSet: '$mouza' },
                                records: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                records: 1,
                                deeds: { $size: '$deeds' },
                                mouzas: { $size: { $setDifference: ['$mouzas', [null, '']] } }
                            }
                        }
                    ],
                    companies: [
                        { $match: { purchaseInCompany: { $nin: [null, ''] } } },
                        { $group: { _id: '$purchaseInCompany', purchased: { $sum: '$purchasedN' }, mutated: { $sum: '$mutatedN' } } },
                        { $addFields: { pending: round2({ $subtract: ['$purchased', '$mutated'] }) } },
                        { $sort: { pending: -1, _id: 1 } },
                        { $limit: 5 },
                        { $project: { _id: 0, name: '$_id', purchased: round2('$purchased'), mutated: round2('$mutated'), pending: 1 } }
                    ]
                }
            }
        ]);

        const p = result.plots[0] || {};
        const c = result.counts[0] || {};
        const purchased = p.purchased || 0;
        const mutated = p.mutated || 0;

        return res.status(200).json({
            success: true,
            data: {
                landPosition: {
                    plotArea: Number((p.plotArea || 0).toFixed(2)),
                    purchasedArea: Number(purchased.toFixed(2)),
                    notPurchasedArea: Number((p.notPurchasedArea || 0).toFixed(2)),
                    notPurchasedPlots: p.notPurchasedPlots || 0,
                    excessArea: Number((p.excessArea || 0).toFixed(2)),
                    excessPlots: p.excessPlots || 0
                },
                counts: {
                    deeds: c.deeds || 0,
                    plots: p.plots || 0,
                    mouzas: c.mouzas || 0,
                    records: c.records || 0
                },
                mutation: {
                    purchasedArea: Number(purchased.toFixed(2)),
                    mutatedArea: Number(mutated.toFixed(2)),
                    pendingArea: Number((purchased - mutated).toFixed(2)), // pending = purchased - mutated
                    pendingPlots: p.pendingPlots || 0
                },
                pendingByCompany: result.companies
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// "Plot vs purchased area" chart: top 10 groups by plot area
const getPlotVsPurchased = async (req, res) => {
    try {
        const groupFields = { mouza: '$mouza', location: '$locationName', company: '$purchaseInCompany', plant: '$plantName' };
        const groupField = groupFields[req.query.groupBy || 'mouza'];
        if (!groupField) {
            return res.status(400).json({ message: 'groupBy must be mouza, location, company or plant' });
        }

        const result = await deedModel.aggregate([
            ...buildBasePipeline(req.query),
            // plot area must be counted once per plot inside a group
            {
                $group: {
                    _id: { name: groupField, plot: '$plotKey' },
                    area: { $max: '$areaN' },
                    purchased: { $sum: '$purchasedN' }
                }
            },
            { $match: { '_id.name': { $nin: [null, ''] } } },
            { $group: { _id: '$_id.name', plotArea: { $sum: '$area' }, purchasedArea: { $sum: '$purchased' } } },
            { $sort: { plotArea: -1, _id: 1 } },
            {
                $facet: {
                    top: [
                        { $limit: 10 },
                        { $project: { _id: 0, name: '$_id', plotArea: round2('$plotArea'), purchasedArea: round2('$purchasedArea') } }
                    ],
                    total: [{ $count: 'count' }]
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            data: { rows: result[0].top, totalGroups: result[0].total[0]?.count || 0 }
        });
    } catch (error) {
        console.error('Error fetching plot vs purchased area:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// "Pending mutation" bars: top 10 groups by pending area (purchased - mutated)
const getPendingMutation = async (req, res) => {
    try {
        const groupFields = { mouza: '$mouza', purchaser: '$nameOfPurchaser' };
        const groupField = groupFields[req.query.groupBy || 'mouza'];
        if (!groupField) {
            return res.status(400).json({ message: 'groupBy must be mouza or purchaser' });
        }

        const rows = await deedModel.aggregate([
            ...buildBasePipeline(req.query),
            { $match: { $expr: { $gt: [{ $strLenCP: { $ifNull: [groupField, ''] } }, 0] } } },
            { $group: { _id: groupField, purchased: { $sum: '$purchasedN' }, mutated: { $sum: '$mutatedN' } } },
            { $addFields: { pending: round2({ $subtract: ['$purchased', '$mutated'] }) } },
            { $match: { pending: { $gt: 0 } } },
            { $sort: { pending: -1, _id: 1 } },
            { $limit: 10 },
            { $project: { _id: 0, name: '$_id', pending: 1 } }
        ]);

        return res.status(200).json({ success: true, data: { rows } });
    } catch (error) {
        console.error('Error fetching pending mutation:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// "Plots with pending mutation" table (server side pagination + search)
const getPendingPlots = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100000);
        const tableSearch = req.query.tableSearch?.trim();

        const pipeline = [
            ...buildBasePipeline(req.query),
            { $addFields: { pendingN: { $subtract: ['$purchasedN', '$mutatedN'] } } },
            // oldest deed first, so the first pending deed of a plot is the one pending the longest
            { $sort: { deedDate: 1, _id: 1 } },
            {
                $group: {
                    _id: '$plotKey',
                    plotNo: { $first: '$plotNumber' },
                    nameOfMouza: { $first: '$mouza' },
                    purchased: { $sum: '$purchasedN' },
                    mutated: { $sum: '$mutatedN' },
                    deedNos: { $push: '$deedNo' },
                    pendingDeeds: {
                        $push: {
                            $cond: [
                                { $gt: ['$pendingN', 0] },
                                { deedId: '$_id', deedNo: '$deedNo', deedDate: '$deedDate', mutatedInCompany: '$purchaseInCompany', purchaser: '$nameOfPurchaser' },
                                '$$REMOVE'
                            ]
                        }
                    }
                }
            },
            { $addFields: { pendingArea: round2({ $subtract: ['$purchased', '$mutated'] }), oldest: { $arrayElemAt: ['$pendingDeeds', 0] } } },
            { $match: { pendingArea: { $gt: 0 } } }
        ];

        if (tableSearch) {
            const regex = { $regex: escapeRegex(tableSearch), $options: 'i' };
            pipeline.push({ $match: { $or: [{ plotNo: regex }, { nameOfMouza: regex }, { deedNos: regex }] } });
        }

        pipeline.push(
            { $sort: { pendingArea: -1, plotNo: 1 } },
            {
                $facet: {
                    rows: [
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1,
                                plotNo: 1,
                                nameOfMouza: 1,
                                pendingArea: 1,
                                mutatedInCompany: '$oldest.purchaseInCompany',
                                purchaser: '$oldest.purchaser',
                                pendingSince: '$oldest.deedDate',
                                deedId: '$oldest.deedId',
                                deedNo: '$oldest.deedNo'
                            }
                        }
                    ],
                    total: [{ $count: 'count' }]
                }
            }
        );

        const [result] = await deedModel.aggregate(pipeline);

        return res.status(200).json({
            success: true,
            data: { rows: result.rows, totalCount: result.total[0]?.count || 0 }
        });
    } catch (error) {
        console.error('Error fetching pending plots:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export default {
    getFilterOptions,
    getSummary,
    getPlotVsPurchased,
    getPendingMutation,
    getPendingPlots
};