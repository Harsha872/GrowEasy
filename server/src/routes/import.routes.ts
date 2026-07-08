import { Router } from 'express';
import { upload } from '../middleware/upload';
import { validateImportRequest } from '../middleware/validation';
import { handleImport } from '../controllers/import.controller';

const router = Router();

router.post('/import', upload.single('file'), validateImportRequest, handleImport);

export default router;
