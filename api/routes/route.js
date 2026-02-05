import express from 'express';
import { basicAuth, jwtHybrdProtect } from '../middlewares/authMiddleware.js';
const router = express.Router();
import fileUpload from '../middlewares/fileUpload.js';

import deedController from '../controllers/deedhandlers/deedController.js';

import acctypController from '../controllers/masters/accsetups/acctypController.js';
import cmpnyController from '../controllers/masters/admin/cmpnyController.js';
import untController from '../controllers/masters/admin/untController.js';
import polcytypController from '../controllers/masters/insurncsetups/polcytypController.js';
import provdrController from '../controllers/masters/insurncsetups/provdrController.js';
import brokrController from '../controllers/masters/insurncsetups/brokrController.js';
import plntController from '../controllers/masters/admin/plntController.js';
import accController from '../controllers/accController.js';
import funcController from '../controllers/adminmgmt/function/funcController.js';
import dynapprvlController from '../controllers/adminmgmt/dynapproval/dynapprvlController.js';
import fileOpController from '../controllers/fileOpController.js';
import acccatController from '../controllers/masters/accsetups/acccatController.js';
import sttController from '../controllers/masters/admin/sttController.js';
import deptController from '../controllers/masters/accsetups/deptController.js';
import desigController from '../controllers/masters/accsetups/desigController.js';

// Utility function to create routes
const createRoute = (method, path, ...handlers) => {
    router.route(path)[method](...handlers);
};

// PING
createRoute('get', '/', (_, res) => res.json({ message: 'Server is Live...', statuscode: 200 }));
createRoute('get', '/chckstat', (_, res) => res.json({ message: 'Server is Online Now...', statuscode: 200 }));

// POST
const postRoutes = [
    {
        path: '/deed/create',
        handlers: [
            jwtHybrdProtect,
            fileUpload.fields([
                { name: "deedDocs", maxCount: 10 }
            ]),
            deedController.create
        ]
    },
    { path: '/acctyp/create', handlers: [jwtHybrdProtect, fileUpload.none(), acctypController.create] },
    { path: '/dept/create', handlers: [jwtHybrdProtect, fileUpload.none(), deptController.create] },
    { path: '/desig/create', handlers: [jwtHybrdProtect, fileUpload.none(), desigController.create] },
    { path: '/acccat/create', handlers: [jwtHybrdProtect, fileUpload.none(), acccatController.create] },
    { path: '/admin/cmpny/create', handlers: [jwtHybrdProtect, fileUpload.none(), cmpnyController.create] },
    { path: '/unt/create', handlers: [jwtHybrdProtect, fileUpload.none(), untController.create] },
    { path: '/polcytyp/create', handlers: [jwtHybrdProtect, fileUpload.none(), polcytypController.create] },
    { path: '/provdr/create', handlers: [jwtHybrdProtect, fileUpload.none(), provdrController.create] },
    { path: '/brokr/create', handlers: [jwtHybrdProtect, fileUpload.none(), brokrController.create] },
    { path: '/acc/create', handlers: [jwtHybrdProtect, fileUpload.none(), accController.create] },
    { path: '/acc/import', handlers: [basicAuth, fileUpload.none(), accController.upload] },
    { path: '/func/create', handlers: [basicAuth, fileUpload.none(), funcController.create] },
    { path: '/admin/stt/create', handlers: [basicAuth, fileUpload.none(), sttController.create] },
    { path: '/admin/plnt/create', handlers: [basicAuth, fileUpload.none(), plntController.create] },
    { path: '/admin/plnt/import', handlers: [basicAuth, plntController.upload] },
    { path: '/dynapprvl/create', handlers: [jwtHybrdProtect, fileUpload.none(), dynapprvlController.create] },
];
postRoutes.forEach(route => createRoute('post', route.path, ...route.handlers));

// GET
const getRoutes = [
    { path: '/deed/fetch', handlers: [basicAuth, deedController.read] },
    { path: '/deedmaster/fetchbyno', handlers: [basicAuth, deedController.readDeedMaster] },
    { path: '/dept/fetch', handlers: [basicAuth, deptController.read] },
    { path: '/desig/fetch', handlers: [basicAuth, desigController.read] },
    { path: '/acccat/fetch', handlers: [basicAuth, acccatController.read] },
    { path: '/deedmaster/fetchbyno', handlers: [basicAuth, deedController.readDeedMaster] },
    { path: '/deed/fetchby/:id', handlers: [basicAuth, deedController.readById] },
    { path: '/acctyp/fetch', handlers: [jwtHybrdProtect, acctypController.read] },
    { path: '/acctyp/fetchby/:id', handlers: [jwtHybrdProtect, acctypController.readById] },
    { path: '/acctyp/fetchuppr', handlers: [jwtHybrdProtect, acctypController.readLowrHierarchy] },
    { path: '/admin/cmpny/fetch', handlers: [jwtHybrdProtect, cmpnyController.read] },
    { path: '/unt/fetch', handlers: [basicAuth, untController.read] },
    { path: '/polcytyp/fetch', handlers: [jwtHybrdProtect, polcytypController.read] },
    { path: '/provdr/fetch', handlers: [jwtHybrdProtect, provdrController.read] },
    { path: '/brokr/fetch', handlers: [jwtHybrdProtect, brokrController.read] },
    { path: '/acc/fetch', handlers: [basicAuth, accController.read] },
    { path: '/acc/fetchby/:id', handlers: [basicAuth, accController.readById] },
    { path: '/acc/fetchuppr/:acctypid', handlers: [basicAuth, accController.readLowrHierarchy] },
    { path: '/func/fetch', handlers: [basicAuth, funcController.read] },
    { path: '/admin/stt/fetch', handlers: [basicAuth, sttController.read] },
    { path: '/admin/plnt/fetch', handlers: [basicAuth, plntController.read] },
    { path: '/dynapprvl/fetch', handlers: [basicAuth, dynapprvlController.read] },
    { path: '/file/download/:id', handlers: [jwtHybrdProtect, fileOpController.downloadHandler] },
    { path: '/file/downloadall', handlers: [jwtHybrdProtect, fileOpController.downloadAllHandler] }
];
getRoutes.forEach(route => createRoute('get', route.path, ...route.handlers));

// PATCH
const patchRoutes = [
    {
        path: '/deed/update',
        handlers: [
            jwtHybrdProtect,
            fileUpload.fields([
                { name: "deedDocs", maxCount: 10 }
            ]),
            deedController.update
        ]
    },
    { path: '/deed/status/update', handlers: [jwtHybrdProtect, fileUpload.none(), deedController.statusUpdate] },
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
patchRoutes.forEach(route => createRoute('patch', route.path, ...route.handlers));

// DELETE
const deleteRoutes = [
    { path: '/deed/delete', handlers: [jwtHybrdProtect, deedController.remove] },
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