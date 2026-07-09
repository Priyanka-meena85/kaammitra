const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');

// Fallback check
const isCloudinaryConfigured = !!process.env.CLOUDINARY_API_KEY;

let storage;
if (isCloudinaryConfigured) {
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'kaammitra/worker-verification',
            allowed_formats: ['jpeg', 'jpg', 'png', 'webp', 'pdf'],
            // Cloudinary handles resource_type automatically but for pdf we might need 'raw' or 'auto'
            resource_type: 'auto'
        }
    });
} else {
    // If not configured, we don't silently fallback to disk in production
    // We'll catch this in the uploadDocument function
    storage = multer.memoryStorage();
}

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images and PDFs only!'));
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('file'); // Expect 'file' field

exports.uploadDocument = (req, res) => {
    // Prevent fallback if cloudinary is missing
    if (!isCloudinaryConfigured) {
        return res.status(400).json({ success: false, message: 'Cloudinary is not configured.' });
    }

    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }
        
        // Cloudinary file details
        res.status(200).json({
            success: true,
            url: req.file.path, // multer-storage-cloudinary puts the secure_url in req.file.path
            public_id: req.file.filename // and public_id in req.file.filename
        });
    });
};
