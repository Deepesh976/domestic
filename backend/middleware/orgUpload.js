import multer from 'multer';
import path from 'path';
import fs from 'fs';

/* =====================================================
   ENSURE UPLOAD DIRECTORY EXISTS
===================================================== */
const uploadDir = path.join(
  process.cwd(),
  'uploads',
  'organizations'
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* =====================================================
   STORAGE CONFIG
===================================================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

/* =====================================================
   FILE FILTER (IMAGES ONLY)
===================================================== */
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith('image/') &&
    ['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(
      path.extname(file.originalname).toLowerCase()
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only PNG, JPG, JPEG, WEBP, SVG allowed.'
      ),
      false
    );
  }
};

/* =====================================================
   MULTER INSTANCE
===================================================== */
export const uploadOrgLogo = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB max
  },
});
