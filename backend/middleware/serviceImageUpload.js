import multer from 'multer';
import path from 'path';
import fs from 'fs';

/* =========================
   ENSURE UPLOAD DIR EXISTS
========================= */
const uploadDir = 'uploads/serviceimage';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* =========================
   STORAGE CONFIG
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name =
      file.fieldname +
      '-' +
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      ext;

    cb(null, name);
  },
});

/* =========================
   FILE FILTER
========================= */
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const isValid =
    allowed.test(file.mimetype) &&
    allowed.test(path.extname(file.originalname).toLowerCase());

  if (isValid) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

/* =========================
   MULTER EXPORT
========================= */
const serviceImageUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default serviceImageUpload;
