const Users = require('../models/user-model')
var passport = require('passport');
const logger = require('winston')
const bcrypt = require('bcrypt');

// console.log(logger)


module.exports = function (app) {


    app.get('/api/google', passport.authenticate('google', {
        scope: ['profile', 'email']
    }));

    // login with username and password
    app.post('/api/loginsubmit', passport.authenticate('local'), (req, res) => {
        if (req.user) {
            res.send({ user: req.user });
        }
        else { res.send({ error: 'Incorrect Username or Password' }) }

    },
    );


    app.get('/api/google/redirect', passport.authenticate('google'), (req, res) => {

        res.redirect('/');
    });



    // auth logout
    app.get('/api/logout', (req, res) => {
        // handle with passport
        req.logout();
        res.redirect('/');
    });


    // create new user with username and password. 
    app.post('/api/register', async (req, res) => {
        // if (usernameFormat.test(req.body.username)) {
        //     req.flash("error", "Invalid Username. The characters allowed are A-Z 0-9 and _ ")
        //     res.redirect('/noauth/register')

        // }
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        new Users({
            password: hashedPassword,
            email: undefined,
            thirdPartyId: undefined,
            estimatedSats: 0,
            earnedSats: 0,
            sats: 0,
            paidSats: 0,
            views: 0,
            userName: req.body.username,
            lowerCaseUserName: req.body.username.toLowerCase(),
            upvotes: 0,
            avatarUrl: '/api/avatar/Default.jpg',
            avatarFileName: 'Default.jpg',
            upvoted: [],
            reported: [],

        }).save()
            .then(newuser => res.send({ user: newuser }))
        // req.flash("error", "Welcome Please Log in")
        // res.send()
    });


}