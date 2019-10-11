const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const keys = require('./keys')
const User = require('../models/user-model');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt')

passport.serializeUser((user, done) => {
    done(null, user.id)
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

passport.use(
    new GoogleStrategy({
        //options for the google strat
        callbackURL: '/noauth/google/redirect',
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret
    }, (accessToken, refreshToken, profile, done) => {
        //check if user already exists

        User.findOne({ thirdPartyId: profile.id }).then((currentUser) => {
            if (currentUser) {
                //already have the user
                done(null, currentUser);

            } else {
                //if not creat user in our db
                console.log(profile)
                new User({
                    email: undefined,
                    thirdPartyId: profile.id,
                    estimatedSats: 0,
                    earnedSats: 0,
                    sats: 0,
                    paidSats: 0,
                    views: 0,
                    userName: profile.displayName,
                    upVotes: 0,
                }).save().then((newUser) => {
                    done(null, newUser);
                });
            }
        });

    })
);

passport.use(new LocalStrategy(
    function (username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) { 
                console.log('nouser')
                return done(null, false, { message: 'Username not found' }); }
            bcrypt.compare(password, user.password, (bcryptErr, res) => {
                if (bcryptErr) { return done(bcryptErr); }
                if (!res) {
                    console.log('wrong password')
                    { return done(null, false, { message: 'Incorect Password' }); }
                }
                return done(null, user);
            })
        })
    }

));