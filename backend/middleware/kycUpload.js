  import multer from 'multer';
  import path from 'path';
  import fs from 'fs';

  const uploadDir = 'uploads/kycadmins';

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

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

  const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files allowed'), false);
    } else {
      cb(null, true);
    }
  };

  const kycUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
  });

  export default kycUpload;
