const AWS = require('aws-sdk');

class S3 {
   constructor(config) {
      this.config = config;
      this.s3 = new AWS.S3({
         accessKeyId: config.accessKey,
         secretAccessKey: config.secretAccessKey
      });
   }

   upload(prefix, fileName, data) {
      return new Promise((resolve, reject) => {
         const params = {
            Bucket: this.config.bucket, // pass your bucket name
            Key: prefix + "/" + fileName, // file will be saved as testBucket/contacts.csv
            Body: data
         };
         this.s3.upload(params, function (s3Err, data) {
            if (s3Err) {
               reject(s3Err)
            } else {
               //console.log(`File uploaded successfully at ${data.Location}`);
               resolve(data);
            }
         });
      });
   }

   list(prefix) {
      return new Promise((resolve, reject) => {
         const s3params = {
            Bucket: this.config.bucket,
            MaxKeys: 20,
            Delimiter: '/',
            Prefix: prefix
         };
         this.s3.listObjectsV2(s3params, (err, data) => {
            if (err) {
               reject(err);
            } else {
               resolve(data);
            }
         });
      });
   }
};

module.exports = S3;