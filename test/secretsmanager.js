// Only a test harness to run on an EC2 instance

const util = require('util');

var AWS = require('aws-sdk'),
    region = "ap-southeast-2",
    secretName = "fsdf/placenames/postgresql",
    secret,
    decodedBinarySecret;

const bootstrap = async function () {
    let secret = await getSecretValue();

    console.log(secret);
}();

async function getSecretValue() {
    let client = new AWS.SecretsManager({
        region: region
    });

    return new Promise((resolve, reject) => {
        client.getSecretValue({ SecretId: secretName }, function (err, data) {
            if (err) {
                if (err.code === 'DecryptionFailureException')
                    // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
                    // Deal with the exception here, and/or rethrow at your discretion.
                    reject(err);
                else if (err.code === 'InternalServiceErrorException')
                    // An error occurred on the server side.
                    // Deal with the exception here, and/or rethrow at your discretion.
                    reject(err);
                else if (err.code === 'InvalidParameterException')
                    // You provided an invalid value for a parameter.
                    // Deal with the exception here, and/or rethrow at your discretion.
                    reject(err);
                else if (err.code === 'InvalidRequestException')
                    // You provided a parameter value that is not valid for the current state of the resource.
                    // Deal with the exception here, and/or rethrow at your discretion.
                    reject(err);
                else if (err.code === 'ResourceNotFoundException')
                    // We can't find the resource that you asked for.
                    // Deal with the exception here, and/or rethrow at your discretion.
                    reject(err);
            } else {
                // Decrypts secret using the associated KMS CMK.
                // Depending on whether the secret is a string or binary, one of these fields will be populated.
                if ('SecretString' in data) {
                    resolve(data.SecretString);
                } else {
                    let buff = new Buffer(data.SecretBinary, 'base64');
                    resolve(buff.toString('ascii'));
                }
            }
        });
    });
}