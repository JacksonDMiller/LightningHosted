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

app.use(express.static('public'));

app.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 },
    abortOnLimit: true,
    safeFileNames: true,
    preserveExtension: 4,
  }));
  

app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [keys.session.cookieKey]
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/noauth', noauthRoutes);
app.use('/auth', authRoutes);

app.set('view engine', 'ejs');
app.listen(3000, () => console.log(`Yipyip the app listening on port 3000!`));


app.get('/', function (req, res) {
    res.render('index');
});

mongoose.connect(keys.mongodb.dbURI);

mongoose.connection.once('open', function(){
    console.log('yipyip the database has connected!');
  }).on('error', function(error){
    console.log(error);
  });

