import multer from 'multer';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const isCsv =
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'application/octet-stream' ||
      file.originalname.toLowerCase().endsWith('.csv');
    if (isCsv) cb(null, true);
    else cb(new Error('Invalid file format. Please upload a CSV file.'));
  },
});
