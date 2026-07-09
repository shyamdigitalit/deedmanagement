import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const ALLOWED_MIME_TYPES = [
  "application/pdf", "image/jpeg", "image/png", "image/webp", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || "20", 10) * 1024 * 1024;

// ─────────────────────────────────────────────────────────────
// File Filter
// ─────────────────────────────────────────────────────────────

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) { return cb(null, true); }
  cb(Object.assign(new Error( `File type '${file.mimetype}' is not allowed` ), { statusCode: 415, }), false);
};

// ─────────────────────────────────────────────────────────────
// Disk Storage
// ─────────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadDir = path.join( process.cwd(), "uploads", "deed" );
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true, });
    cb(null, uploadDir);
  },

  filename(req, file, cb) {
    crypto.randomBytes(16, (err, buffer) => {
      if (err) { return cb(err); }
      const uniqueName = buffer.toString("hex") + path.extname(file.originalname);
      cb(null, uniqueName);
    });
  },
});

// ─────────────────────────────────────────────────────────────
// Multer Upload
// ─────────────────────────────────────────────────────────────

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE, }, });
const uploadDocuments = upload.array( "deedDocs", 10 );

// ─────────────────────────────────────────────────────────────
// Error Handler
// ─────────────────────────────────────────────────────────────

const handleUploadErrors = ( err, req, res, next ) => {
  console.log(err)
  if (err instanceof multer.MulterError) return res.status(400).json({ success: false, message: err.message, });
  if (err?.statusCode === 415) return res.status(415).json({ success: false, message: err.message, });
  next(err);
};

export { uploadDocuments, handleUploadErrors, };