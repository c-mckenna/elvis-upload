const config = require("./lib/config");
const express = require("express");
const fileUpload = require("express-fileupload");

const S3 = require("./lib/s3");
const awsS3 = new S3(config);

const Cognito = require("./lib/cognito");
const cognito = new Cognito(config.cognito);

const app = express();
app.use(fileUpload());

const yargs = require('yargs').options({
   'port': {
      'default': 4000,
      'description': 'Port to listen on.'
   },
   'public': {
      'type': 'boolean',
      'description': 'Run a public server that listens on all interfaces.'
   },
   'upstream-proxy': {
      'description': 'A standard proxy server that will be used to retrieve data.  Specify a URL including port, e.g. "http://proxy:8000".'
   },
   'bypass-upstream-proxy-hosts': {
      'description': 'A comma separated list of hosts that will bypass the specified upstream_proxy, e.g. "lanhost1,lanhost2"'
   },
   'help': {
      'alias': 'h',
      'type': 'boolean',
      'description': 'Show this help.'
   }
});
const argv = yargs.argv;
const port = process.env.PORT || argv.port;

// eventually this mime type configuration will need to change
// https://github.com/visionmedia/send/commit/d2cb54658ce65948b0ed6e5fb5de69d022bef941
const mime = express.static.mime;
mime.define({
   'application/json': ['czml', 'json', 'geojson', 'topojson'],
   'model/vnd.gltf+json': ['gltf'],
   'model/vnd.gltf.binary': ['bgltf'],
   'text/plain': ['glsl']
});

app.use('/login', function (req, res) {   // Allows access to login page
   res.sendFile(__dirname + '/dist/login.html')  // before access token check
});

app.get('/', redirectSansToken);
app.get('/index.html', redirectSansToken);

function redirectSansToken(req, res) {
   // console.log(req.query);
   cognito.validate(req.query.access_token).then(response => {
      res.cookie('placenamesUpload',
         "username=" + response.username +
         ';jurisdiction=' + response['cognito:groups'][0] +
         ";expires=" + response.exp +
         ";token=" + req.query.access_token,
         { expires: new Date(response.exp * 1000) });

      res.sendFile(__dirname + "/dist/index.html")
   }).catch((error) => {
      res.redirect(config.loginUrl);
   });
}

// serve static files
app.use(express.static("dist"));
app.use(function (req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});

// The app is sessionless so we validate the token on upload. If they try to spoof something along the way we should catch it here.
app.post('/upload', function (req, res, next) {
   let token = req.query.token;
   cognito.validate(token).then(response => {
      let file = req.files.file;
      let jurisdiction = response['cognito:groups'][0];
      let prefix = config.jurisdictionToS3[jurisdiction].path;

      awsS3.upload(prefix, file.name, file.data).then(result => {
         console.log("Whoopee Doo!");
         console.log(result);
      });
      res.status(200).send("Message");
   }).catch((error) => {
      res.status(500).send(error);
   });
});

app.get('/login', function (req, res, next) {
   console.log(req);
   console.log(req.url);
   res.status(200).send("OK");
});

app.listen(port, function (err) {
   console.log("running server on port " + port);
});
