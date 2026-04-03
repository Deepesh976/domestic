import multer from 'multer';
import path from 'path';
import fs from 'fs';

/* =========================
   UPLOAD DIRECTORY
========================= */
const uploadDir = 'uploads/kyctechnicians';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* =========================
   STORAGE
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

/* =========================
   FILE FILTER
========================= */
const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Only image files allowed'), false);
  } else {
    cb(null, true);
  }
};

/* =========================
   EXPORT UPLOAD
========================= */
const kycTechnicianUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

export default kycTechnicianUpload;
