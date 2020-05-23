const AWS = require('aws-sdk');

var region = "ap-southeast-2",

   secretName = "fsdf/placenames/postgresql",

   secret,

   decodedBinarySecret;



// Create a Secrets Manager client

var client = new AWS.SecretsManager({

   region: region

});


class S3 {
   constructor(config) {
      this.config = config;
      // Do we have a accesskey or are we using a secrets manager
      if (config.accessKey && config.secretAccessKey) {
         this.s3 = new AWS.S3({
               accessKeyId: config.accessKey,
               secretAccessKey: config.secretAccessKey
         });
      } else {
         this.s3 = new AWS.S3();
      }
   }

   async upload(prefix, fileName, data) {
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

   async list(prefix) {
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

   async getCredentials() {

   }
};

module.exports = S3;