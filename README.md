# elvis-upload
Allows authenticated users to upload files for feature inclusion in placenames.

Most of the variables need to be stored in environment variables
* PLACENAMES_AWS_S3_BUCKET The bucket name on AWS S3.
* PLACENAMES_AWS_ACCESS_KEY_ID Cognito access key id.
* PLACENAMES_AWS_SECRET_ACCESS_KEY Cognito secret access key.
* PLACENAMES_AWS_COGNITO_LOGIN_URL The name says it all.
* PLACENAMES_AWS_COGNITO_JWKS_URL Get user pool jwks details.