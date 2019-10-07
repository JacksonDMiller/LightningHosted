const express = require('express');
const app = express();
const keys = require('./config/keys');
const cookieSession = require('cookie-session');
const passport = require('passport');
const passportSetup = require('./config/passport-setup');
const authRoutes = require('./routes/auth-routes');
const noauthRoutes = require('./routes/noauth-routes');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');

// setting up express
app.use(express.static('public'));
app.use(bodyParser());
app.set('view engine', 'ejs');

app.listen(3000, () => console.log(`Yipyip the app listening on port 3000!`));

app.use (function (req, res, next) {
  if (req.secure) {
          // request was via https, so do no special handling
          next();
  } else {
          // request was via http, so redirect to https
          res.redirect('https://' + req.headers.host + req.url);
  }
});


//  comment out for testing
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/lightninghosted.com/privkey.pem', 'utf8'),
  cert: fs.readFileSync('/etc/letsencrypt/live/lightninghosted.com/fullchain.pem', 'utf8')
}

https.createServer(options, app).listen(8443);



// setting up filepond
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 },
  abortOnLimit: true,
  safeFileNames: true,
  preserveExtension: 4,
}));

// setting up passport
app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000,
  keys: [keys.session.cookieKey]
}));

app.use(passport.initialize());
app.use(passport.session());

//routes
app.use('/noauth', noauthRoutes);
app.use('/auth', authRoutes);

// setting up mongodb
mongoose.connect(keys.mongodb.dbURI);

mongoose.connection.once('open', function () {
  console.log('Yipyip the database has connected!');
}).on('error', function (error) {
  console.log(error);
});

// home page handler
app.get('/', function (req, res) {
  res.redirect('/noauth')
});



