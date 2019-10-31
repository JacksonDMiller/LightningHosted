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
const User = require('./models/user-model');
const flash = require('express-flash');
var recentViews = {};

// setting up express
app.use(express.static('public'));
app.use(bodyParser());
app.set('view engine', 'ejs');
app.use(flash());

app.listen(3000, () => console.log(`Yipyip the app listening on port 3000!`));


//  comment out for testing

// app.use(function(req, res, next) {
//     if (req.secure) {
//         // request was via https, so do no special handling
//         next();
//     } else {
//         // request was via http, so redirect to https
//         res.redirect('https://' + req.headers.host + req.url);
//     }
// });


// const options = {
//     key: fs.readFileSync('/etc/letsencrypt/live/lightninghosted.com/privkey.pem', 'utf8'),
//     cert: fs.readFileSync('/etc/letsencrypt/live/lightninghosted.com/fullchain.pem', 'utf8')
// }

// https.createServer(options, app).listen(8443);



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

app.get('/s/:imageId', (req, res) => {
    User.findOne({ 'images.imageId': req.params.imageId }).then((currentUser) => {
        currentUser.images.forEach(element => {
            if (element.imageId == req.params.imageId) {
                if (!req.user) {
                    res.render('share', { logInStatus: 'loggedOut', image: element })
                }
                else {
                    res.render('share', { logInStatus: 'loggedIn', image: element })
                }
            }
        })
        var found = false;
        if (recentViews[req.connection.remoteAddress]) {
            recentViews[req.connection.remoteAddress].forEach(function (element) {
                if (element === req.params.imageId) {
                    found = true;
                }
            })
            if (found === true) {
                return;
            }
            recentViews[req.connection.remoteAddress].push(req.params.imageId)
            currentUser.images.forEach(element => {
                if (element.imageId == req.params.imageId) {
                    element.views = element.views + 1;
                    if (element.views === 100) {
                        currentUser.earnedSats = currentUser.earnedSats + 250;
                        currentUser.sats = currentUser.sats + 250; //earned sats
                        element.sats = element.sats + 250;
                    };
                }
            })
            currentUser.save();
            return false;
        }
        else {
            recentViews[req.connection.remoteAddress] = [];
            recentViews[req.connection.remoteAddress].push(req.params.imageId)
            currentUser.images.forEach(element => {
                if (element.imageId == req.params.imageId) {
                    element.views = element.views + 1;
                    if (element.views === 100) {
                        currentUser.earnedSats = currentUser.earnedSats + 250; //earned sats
                        currentUser.sats = currentUser.sats + 250;
                        element.sats = element.sats + 250;
                    };
                }
            })
            currentUser.save();
        }

    })
})
app.get('/a/', function (req, res) {
    res.render('aAds');
});

app.get('/api/:imageId', function (req, res) {
    User.findOne({ 'images.imageId': req.params.imageId }).then((currentUser) => {
        currentUser.images.forEach(element => {
            if (element.imageId == req.params.imageId) {
                res.send(`<?xml version="1.0"?>
<oembed version="1.0" encoding="utf-8" standalone="yes"><version>1.0</version><type>rich</type><provider_name>LightningHosted</provider_name><provider_url>https://lightninghosted.com</provider_url><width>540</width><height>500</height><html>&lt;img src=&quot;https://lightninghosted.com/noauth/image/`+element.fileName+`&quot;&gt;</html></oembed>`);
            }
        })
    })

});


app.get('/apiJ/:imageId', function (req, res) {
    User.findOne({ 'images.imageId': req.params.imageId }).then((currentUser) => {
        currentUser.images.forEach(element => {
            if (element.imageId == req.params.imageId) {
                res.render('apij', {image: element});
            }
        })
    })

});

