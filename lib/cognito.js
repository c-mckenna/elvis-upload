const request = require('request');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');

class Cognito {
   constructor(config) {
      this.config = config;
   }

   async validate(token) {
      let jwks = await this.jwks();

      //validate the token
      var decodedJwt = jwt.decode(token, { complete: true });
      if (!decodedJwt) {
         throw new Error("Not a valid JWT token");
      }

      var kid = decodedJwt.header.kid;
      var pem = jwks[kid];
      if (!pem) {
         throw new Error('Invalid token');
      }

      return new Promise((resolve, reject) => {
         jwt.verify(token, pem, function (error, payload) {
            if (error) {
               reject(error);
            } else {
               resolve(payload);
            }
         });
      });
   }

   async jwks() {
      if (this.jwksPromise) {
         return this.jwksPromise;
      }

      return this.jwksPromise = new Promise((resolve, reject) => {
         request({
            url: this.config.jwksUrl,
            json: true
         }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
               resolve(body.keys.reduce((pems, key) => {
                  let kid = key.kid;
                  pems[kid] = jwkToPem({ kty: key.kty, n: key.n, e: key.e });
                  return pems;
               },
                  {}));
            } else {
               reject(error);
            }
         });
      });
   }
}

module.exports = Cognito;