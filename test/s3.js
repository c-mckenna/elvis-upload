const config = require("../lib/config");
const S3 = require("../lib/s3");

const awsS3 = new S3(config);

let results = awsS3.list('NSW_Placenames/UploadedData/');

results.then(data => {
   console.log(data);
});

awsS3.upload('NSW_Placenames/UploadedData', 'lag_' + Date.now() + '.txt', "Hello, Larry").then(result => {
   console.log(result);
});