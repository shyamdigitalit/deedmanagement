// fileOpUtility.js
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import archiver from "archiver";
import crypto from "crypto";
import { PassThrough, Readable } from "stream";
import fs from "fs";
import path from "path";

let gfs;

// ✅ Initialize GridFS once when Mongoose is ready
mongoose.connection.once("open", () => {
  gfs = new GridFSBucket(mongoose.connection.db, { bucketName: "fileuploads" });
  console.log("✅ GridFSBucket initialized for reusable file ops");
});


/* ------------------------------------------------------------------
  ✅ 1. Upload with duplicate prevention
------------------------------------------------------------------ */
export const uploadFile = async (buffer, originalname, mimetype) => {
  if (!gfs) throw new Error("GridFS not initialized");

  const hash = crypto.createHash("md5").update(buffer).digest("hex");

  return new Promise((resolve, reject) => {
    const uploadStream = gfs.openUploadStream(originalname, {
      metadata: { hash, size: buffer.length, contentType: mimetype || "application/octet-stream" },
    });

    uploadStream.end(buffer); // ✅ CRITICAL FIX

    uploadStream.on("finish", async () => {
      const fileInfo = await mongoose.connection.db
        .collection("fileuploads.files")
        .findOne({ _id: uploadStream.id });

      resolve({ duplicate: false, file: fileInfo });
    });

    uploadStream.on("error", reject);
  });
};


/* ------------------------------------------------------------------
  ✅ 2. Get all uploaded files metadata
------------------------------------------------------------------ */
export const getAllFiles = async () => {
  if (!gfs) throw new Error("GridFS not initialized");

  return mongoose.connection.db
    .collection("fileuploads.files")
    .find()
    .sort({ uploadDate: -1 })
    .toArray();
};

/* ------------------------------------------------------------------
  ✅ 3. Get single file stream
------------------------------------------------------------------ */
export const getFileStream = async (fileId) => {
  if (!gfs) throw new Error("GridFS not initialized");

  const _id = new mongoose.Types.ObjectId(fileId);
  const file = await mongoose.connection.db
    .collection("fileuploads.files")
    .findOne({ _id });

  if (!file) throw new Error("File not found");

  const stream = gfs.openDownloadStream(_id);
  return { file, stream };
};

/* ------------------------------------------------------------------
  ✅ 4. Get ZIP stream for multiple files
------------------------------------------------------------------ */
export const getZipStream = async (deedDocs) => {
    if (!Array.isArray(deedDocs) || !deedDocs.length) {
        throw new Error("No files provided");
    }

    const archive = archiver("zip", {
        zlib: { level: 9 },
    });

    let filesAdded = 0;

    for (const file of deedDocs) {
        try {
            console.log("=================================");
            console.log("File:", file.filName);
            console.log("filPath:", file.filPath);
            console.log("Exists:", fs.existsSync(file.filPath));

            if (!file.filPath) {
                console.warn("Missing filPath");
                continue;
            }

            if (!fs.existsSync(file.filPath)) {
                console.warn("FILE DOES NOT EXIST:", file.filPath);
                continue;
            }

            archive.file(file.filPath, {
                name: file.filName,
            });

            filesAdded++;

            console.log("Added to ZIP:", file.filName);

        } catch (err) {
            console.error(
                `Error processing ${file.filName}:`,
                err
            );
        }
    }

    console.log("Total files added:", filesAdded);

    if (filesAdded === 0) {
        throw new Error("No files could be found to add to ZIP");
    }

    archive.on("warning", (err) => {
        console.warn("ARCHIVER WARNING:", err);
    });

    archive.on("error", (err) => {
        console.error("ARCHIVER ERROR:", err);
    });

    process.nextTick(() => {
        archive.finalize();
    });

    return archive;
};
/* ------------------------------------------------------------------
  ✅ 5. Delete file by ID
------------------------------------------------------------------ */

export const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    return { message: "File deleted successfully", };
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
};