const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");

const upload = multer({
  storage: multer.memoryStorage(),

  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

module.exports = upload;
