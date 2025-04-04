const multer = require("multer");
const cloudinary = require("../utils/cloudinary");
const ApiError = require("../utils/ApiError");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// sitting Cloudinary 
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "uploads", 
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
        transformation: [   { width: 1024, height: 1024, crop: "limit" },
                            { quality: "auto:good" }
        ], //reduce image size
    },
});

const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith("image")) {
        return cb(new ApiError("Only Image allowed", 400), false);
    }
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // Maximum size is(5MB)
});

exports.uploadSingleImage = (fieldName) => upload.single(fieldName);

exports.uploadMixOfImages = (fieldsArray) => upload.fields(fieldsArray);
