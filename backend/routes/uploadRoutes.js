import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const avatarUploadDirectory = path.resolve(__dirname, '../uploads/avatars');
const allowedImageTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, avatarUploadDirectory);
  },
  filename(req, file, cb) {
    const extension = allowedImageTypes.get(file.mimetype) || path.extname(file.originalname);
    cb(null, `avatar-${req.user._id}-${Date.now()}${extension}`);
  },
});

function checkFileType(file, cb) {
  if (allowedImageTypes.has(file.mimetype)) {
    return cb(null, true);
  } else {
    return cb(new Error('Chỉ chấp nhận file hình ảnh!'));
  }
}

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// @desc    Upload an avatar
// @route   POST /api/upload/avatar
// @access  Private
router.post('/avatar', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }
  // Construct the full URL path to return to the client
  const fullUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;
  res.json({ url: fullUrl });
});

export default router;
