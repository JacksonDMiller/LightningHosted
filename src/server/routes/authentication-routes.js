const Users = require('../models/user-model')
var passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');



module.exports = function (app) {


    app.get('/api/google', passport.authenticate('google', {
        scope: ['profile']
    }));

    app.get('/api/google/redirect', passport.authenticate('google'), (req, res) => {

        res.redirect('/');
    });

    // auth logout
    app.get('/api/logout', (req, res) => {
        // handle with passport
        req.logout();
        res.redirect('/');
    });


}