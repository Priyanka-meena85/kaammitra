const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

const isCloudinaryConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);
const isProduction = process.env.NODE_ENV === 'production';

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
    const uploadDirectory = path.join(__dirname, '../uploads');
    fs.mkdirSync(uploadDirectory, { recursive: true });
    storage = multer.diskStorage({
        destination: uploadDirectory,
        filename: (req, file, cb) => {
            const extension = path.extname(file.originalname).toLowerCase();
            cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
        }
    });
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
    if (!isCloudinaryConfigured && isProduction) {
        return res.status(503).json({ success: false, message: 'File uploads are not configured.' });
    }

    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }
        
        const url = isCloudinaryConfigured
            ? req.file.path
            : `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        res.status(200).json({
            success: true,
            url,
            public_id: req.file.filename
        });
    });
};
