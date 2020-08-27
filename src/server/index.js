const express = require('express');
const bodyParser = require('body-parser');
var passport = require('passport');
const passportSetup = require('./config/passport-setup');
const cookieSession = require('cookie-session');
const keys = require('./config/keys')
var logger = require('./log.js');
const fallback = require('express-history-api-fallback');

// setting up express
const app = express();
app.use(express.static('dist'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [keys.session.cookieKey]
}));

app.use(passport.initialize());
app.use(passport.session());

//setting up mongodb
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true, useUnifiedTopology: true });

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("YipYip the datbase has connected!")
});

require('./routes/noauth-routes')(app);
require('./routes/authentication-routes')(app);
require('./routes/payment-routes')(app);
require('./routes/authorized-routes')(app);
require('./routes/moderator-routes')(app);

app.use(fallback('index.html', { root: './dist' }))

app.listen(process.env.PORT || 80, () => console.log(`YipYip app is listening on port ${process.env.PORT || 80}!`));
