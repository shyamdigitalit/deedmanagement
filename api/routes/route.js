import express from 'express';
import { basicAuth, jwtHybrdProtect } from '../middlewares/authMiddleware.js';
const router = express.Router();
import fileUpload from '../middlewares/fileUpload.js';

import polcyopController from '../controllers/insurancemodules/polcyopController.js';
import claimController from '../controllers/insurancemodules/claimController.js';
import settlmntController from '../controllers/insurancemodules/settlmntController.js';

import acctypController from '../controllers/masters/accsetups/acctypController.js';
import cmpnyController from '../controllers/masters/admin/cmpnyController.js';
import untController from '../controllers/masters/admin/untController.js';
import polcytypController from '../controllers/masters/insurncsetups/polcytypController.js';
import provdrController from '../controllers/masters/insurncsetups/provdrController.js';
import brokrController from '../controllers/masters/insurncsetups/brokrController.js';

import accController from '../controllers/accController.js';
import funcController from '../controllers/adminmgmt/function/funcController.js';
import dynapprvlController from '../controllers/adminmgmt/dynapproval/dynapprvlController.js';
import fileOpController from '../controllers/fileOpController.js';

// import { getPolicyExipryMailDetails } from '../utilities/jobscheduler/jobScheduler.js';
// import { getInstallmentRenewalMailDetails } from '../utilities/jobscheduler/jobScheduler.js';



// Utility function to create routes
const createRoute = (method, path, ...handlers) => {
    router.route(path)[method](...handlers);
};

// PING
createRoute('get', '/', (_, res) => res.json({ message: 'Server is Live...', statuscode: 200 }));
createRoute('get', '/chckstat', (_, res) => res.json({ message: 'Server is Online Now...', statuscode: 200 }));

// POST
const postRoutes = [
    { path: '/polcyop/create',
        handlers: [
            jwtHybrdProtect,
            // fileUpload.array("files", 20),
            fileUpload.fields([
                { name: "nfaForQuotation", maxCount: 10 },
                { name: "nfaForPayment", maxCount: 10 },
                { name: "otherDocs", maxCount: 10 },
            ]),
            polcyopController.create
        ]
    },
    { path: '/claim/create', handlers: [ jwtHybrdProtect, fileUpload.fields([ { name: "otherDocs", maxCount: 10 } ]), claimController.create ]},
    { path: '/settlmnt/create', handlers: [ jwtHybrdProtect, fileUpload.fields([ { name: "otherDocs", maxCount: 10 } ]), settlmntController.create ]},
    { path: '/acctyp/create', handlers: [jwtHybrdProtect, fileUpload.none(), acctypController.create] },
    { path: '/cmpny/create', handlers: [jwtHybrdProtect, fileUpload.none(), cmpnyController.create] },
    { path: '/unt/create', handlers: [jwtHybrdProtect, fileUpload.none(), untController.create] },
    { path: '/polcytyp/create', handlers: [jwtHybrdProtect, fileUpload.none(), polcytypController.create] },
    { path: '/provdr/create', handlers: [jwtHybrdProtect, fileUpload.none(), provdrController.create] },
    { path: '/brokr/create', handlers: [jwtHybrdProtect, fileUpload.none(), brokrController.create] },
    { path: '/acc/create', handlers: [jwtHybrdProtect, fileUpload.none(), accController.create] },
    { path: '/acc/import', handlers: [basicAuth, fileUpload.none(), accController.upload] },
    { path: '/func/create', handlers: [basicAuth, fileUpload.none(), funcController.create] },
    { path: '/dynapprvl/create', handlers: [jwtHybrdProtect, fileUpload.none(), dynapprvlController.create] },
    // { path: '/mail/send', handlers: [basicAuth, fileUpload.none(), mailtestController.send] },
];
postRoutes.forEach(route => createRoute('post', route.path, ...route.handlers));

// GET
const getRoutes = [
    { path: '/polcyop/fetch', handlers: [basicAuth, polcyopController.read] },
    { path: '/claim/fetch', handlers: [basicAuth, claimController.read] },
    { path: '/claim/groupbypolcy/fetch', handlers: [basicAuth, claimController.readOnPolcy] },
    { path: '/settlmnt/fetch', handlers: [basicAuth, settlmntController.read] },
    { path: '/acctyp/fetch', handlers: [jwtHybrdProtect, acctypController.read] },
    { path: '/acctyp/fetchby/:id', handlers: [jwtHybrdProtect, acctypController.readById] },
    { path: '/acctyp/fetchuppr', handlers: [jwtHybrdProtect, acctypController.readLowrHierarchy] },
    { path: '/cmpny/fetch', handlers: [jwtHybrdProtect, cmpnyController.read] },
    { path: '/unt/fetch', handlers: [basicAuth, untController.read] },
    { path: '/polcytyp/fetch', handlers: [jwtHybrdProtect, polcytypController.read] },
    { path: '/provdr/fetch', handlers: [jwtHybrdProtect, provdrController.read] },
    { path: '/brokr/fetch', handlers: [jwtHybrdProtect, brokrController.read] },
    { path: '/acc/fetch', handlers: [basicAuth, accController.read] },
    { path: '/acc/fetchby/:id', handlers: [basicAuth, accController.readById] },
    { path: '/acc/fetchuppr/:acctypid', handlers: [basicAuth, accController.readLowrHierarchy] },
    { path: '/func/fetch', handlers: [basicAuth, funcController.read] },
    { path: '/dynapprvl/fetch', handlers: [basicAuth, dynapprvlController.read] },
    { path: '/file/download/:id', handlers: [jwtHybrdProtect, fileOpController.downloadHandler] },
    { path: '/file/downloadall', handlers: [jwtHybrdProtect, fileOpController.downloadAllHandler] },
    // { path: '/policy/expiry/fetch', handlers: [basicAuth, getPolicyExipryMailDetails] },
    // { path: '/policy/installment/renewal/fetch', handlers: [basicAuth, getInstallmentRenewalMailDetails] },
];
getRoutes.forEach(route => createRoute('get', route.path, ...route.handlers));

// PUT
const putRoutes = [
    { path: '/polcyop/update',
        handlers: [
            jwtHybrdProtect,
            fileUpload.fields([
                { name: "nfaForQuotation", maxCount: 10 },
                { name: "nfaForPayment", maxCount: 10 },
                { name: "otherDocs", maxCount: 10 },
            ]),
            polcyopController.update
        ]
    },
    { path: '/polcyop/status/update', handlers: [ jwtHybrdProtect, fileUpload.none(), polcyopController.statusUpdate ] },
    { path: '/claim/update', handlers: [ jwtHybrdProtect, fileUpload.fields([ { name: "otherDocs", maxCount: 10 } ]), claimController.update ] },
    { path: '/claim/status/update', handlers: [ jwtHybrdProtect, claimController.statusUpdate ] },
    { path: '/settlmnt/update', handlers: [ jwtHybrdProtect, fileUpload.fields([ { name: "otherDocs", maxCount: 10 } ]), settlmntController.update ] },
    { path: '/settlmnt/status/update', handlers: [ jwtHybrdProtect, settlmntController.statusUpdate ] },
    { path: '/acctyp/update', handlers: [jwtHybrdProtect, fileUpload.none(), acctypController.update] },
    { path: '/cmpny/update', handlers: [jwtHybrdProtect, fileUpload.none(), cmpnyController.update] },
    { path: '/unt/update', handlers: [jwtHybrdProtect, fileUpload.none(), untController.update] },
    { path: '/polcytyp/update', handlers: [jwtHybrdProtect, fileUpload.none(), polcytypController.update] },
    { path: '/provdr/update', handlers: [jwtHybrdProtect, fileUpload.none(), provdrController.update] },
    { path: '/brokr/update', handlers: [jwtHybrdProtect, fileUpload.none(), brokrController.update] },
    { path: '/acc/update', handlers: [jwtHybrdProtect, fileUpload.none(), accController.update] },
    { path: '/func/update', handlers: [jwtHybrdProtect, fileUpload.none(), funcController.update] },
    { path: '/dynapprvl/update/:id', handlers: [jwtHybrdProtect, fileUpload.none(), dynapprvlController.update] },
    { path: '/dynapprvl/statusupdt/:id', handlers: [jwtHybrdProtect, fileUpload.none(), dynapprvlController.statusUpdt] },
];
putRoutes.forEach(route => createRoute('put', route.path, ...route.handlers));

// DELETE
const deleteRoutes = [
    { path: '/polcyop/delete', handlers: [jwtHybrdProtect, polcyopController.remove] },
    { path: '/claim/delete', handlers: [jwtHybrdProtect, claimController.remove] },
    { path: '/settlmnt/delete', handlers: [jwtHybrdProtect, settlmntController.remove] },
    { path: '/acctyp/delete', handlers: [jwtHybrdProtect, acctypController.remove] },
    { path: '/dynapprvl/delete/:id', handlers: [jwtHybrdProtect, dynapprvlController.remove] },
    { path: '/cmpny/delete', handlers: [jwtHybrdProtect, cmpnyController.remove] },
    { path: '/unt/delete', handlers: [jwtHybrdProtect, untController.remove] },
    { path: '/polcytyp/delete', handlers: [jwtHybrdProtect, polcytypController.remove] },
    { path: '/provdr/delete', handlers: [jwtHybrdProtect, provdrController.remove] },
    { path: '/brokr/delete', handlers: [jwtHybrdProtect, brokrController.remove] },
    { path: '/acc/delete', handlers: [jwtHybrdProtect, accController.remove] },
    { path: '/func/delete', handlers: [jwtHybrdProtect, funcController.remove] },
];
deleteRoutes.forEach(route => createRoute('delete', route.path, ...route.handlers));

export default router;