var config = {
   secretsManager: {
      region:  "ap-southeast-2",
      secretName: "fsdf/placenames/general"
   },

   bucket: "PLACENAMES_AWS_S3_BUCKET", 
   loginUrl: "PLACENAMES_AWS_COGNITO_LOGIN_URL",
   jwksUrl: "PLACENAMES_AWS_COGNITO_JWKS_URL",
   crossAccountRole: "PLACENAMES_CROSS_ACCOUNT_ROLE",
   
   jurisdictionToS3: {
      AAD: {
         path: "AAD_PLACENAMES/UploadedData"
      },
      ACT: {
         path: "ACT_Placenames/UploadedData"
      },
      AHO: {
         path: "AHO_Placenames/UploadedData"
      },
      DPS: {
         path: "DPS/UploadedData"
      },
      NSW: {
         path: "NSW_Placenames/UploadedData"
      },
      NT: {
         path: "NT_Placenames/UploadedData"
      },
      QLD: {
         path: "QLD_Placenames/UploadedData"
      },
      SA: {
         path: "SA_Placenames/UploadedData"
      },
      TAS: {
         path: "TAS_Placenames/UploadedData"
      },
      VIC: {
         path: "VIC_Placenames/UploadedData"
      },
      WA: {
         path: "WA_Placenames/UploadedData"
      },
      TEST: {
         path: "TEST_Placenames/UploadedData"
      },
   }
};

module.exports = config;
