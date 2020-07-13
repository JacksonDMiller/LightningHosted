// setting up Passport
const keys = require('./keys')
var passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const Users = require('../models/user-model')

passport.use(
    new GoogleStrategy({
        //options for the google strat
        callbackURL: 'http://localhost:3000/api/google/redirect',
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret
    }, (accessToken, refreshToken, profile, done) => {
        console.log(profile)

        Users.findOne({ thirdPartyId: profile.id }).then((currentUser) => {
            if (currentUser) {
                console.log('already signed up')
                //already have the user
                done(null, currentUser);

            } else {
                //if not creat user in our db
                console.log(profile._json.picture)
                new Users({
                    avatarUrl: profile._json.picture,
                    avatarFileName: null,
                    email: profile._json.email,
                    thirdPartyId: profile.id,
                    estimatedSats: 0,
                    earnedSats: 0,
                    sats: 0,
                    paidSats: 0,
                    views: 0,
                    userName: profile.displayName,
                    upvotes: 0,
                    upvoted: [],
                    reported: []
                }).save().then((newUser) => {
                    done(null, newUser);
                });
            }
        });
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id)
});

// set up database then return the user
passport.deserializeUser((id, done) => {
    Users.findById(id).then((user) => {
        done(null, user);
        // done(null, id)
    });
});