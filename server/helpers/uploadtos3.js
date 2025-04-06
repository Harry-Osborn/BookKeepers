const aws = require("aws-sdk");

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const uploadFileToS3 = async (file, folder) => {
  if (!file) return null;

  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Body: file.buffer,
    Key: `${folder}/${Date.now()}-${file.originalname}`,
    ContentType: file.mimetype,
    ACL: "public-read",
  };

  const result = await s3.upload(uploadParams).promise();
  return result.Location; // Return the S3 URL
};

module.exports = uploadFileToS3;
