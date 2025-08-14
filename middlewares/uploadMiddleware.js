const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png'];

const isAllowed = allowedTypes.includes(file.mimetype);

  if (!isAllowed) {
const error = new Errror( File type not supported. Allowed types: JPEG, PNG. Received: ${file.mimetype}`
    );
error.statusCode = 400; // Bad Request
    return cb(error, false);
  }

  cb(null, true);
};


const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('file');

const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum allowed size is 5MB.',
        });
      }
      if (err.statusCode && err.message) {
        return res.status(err.statusCode).json({
          success: false,
          message: err.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: 'An unexpected error occurred during file upload.',
      });
    }
    next();
  });
};

module.exports = upload;
