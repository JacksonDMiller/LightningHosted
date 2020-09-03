// setting up Passport
const keys = require("./keys");
var passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const Users = require("../models/user-model");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local");

passport.use(
  new GoogleStrategy(
    {
      //options for the google strat
      callbackURL: "https://lightninghosted.com/api/google/redirect",
      // callbackURL: 'http://192.168.0.33:3000/api/google/redirect',
      //testing
      clientID: keys.google.clientID,
      clientSecret: keys.google.clientSecret,
    },
    (accessToken, refreshToken, profile, done) => {
      Users.findOne({ thirdPartyId: profile.id }).then((currentUser) => {
        if (currentUser) {
          //already have the user
          done(null, currentUser);
        } else {
          //if not creat user in our db
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
            username: profile.displayName,
            upvotes: 0,
            moderator: false,
            upvoted: [],
            reported: [],
          })
            .save()
            .then((newUser) => {
              done(null, newUser);
            });
        }
      });
    }
  )
);

// login with username and password
passport.use(
  new LocalStrategy(function (username, password, done) {
    username = username.toLowerCase();
    Users.findOne(
      {
        $or: [
          {
            lowerCaseUserName: username,
          },
          {
            email: username,
          },
        ],
      },
      function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "Username not found" });
        }
        bcrypt.compare(password, user.password, (bcryptErr, res) => {
          if (bcryptErr) {
            return done(bcryptErr);
          }
          if (!res) {
            {
              bcrypt.hash(password, 10).then((pa) => {});
              return done(null, false, { message: "Incorect Password" });
            }
          }
          return done(null, user);
        });
      }
    );
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

// set up database then return the user
passport.deserializeUser((id, done) => {
  Users.findById(id).then((user) => {
    done(null, user);

    // done(null, id)
  });
});
