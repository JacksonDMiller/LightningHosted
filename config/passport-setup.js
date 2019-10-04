const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const keys = require('./keys')
const User = require('../models/user-model');

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
                new User({
                    thirdPartyId: profile.id,
                    estimatedSats: 0,
                    earnedSats: 0,
                    sats:0,
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

