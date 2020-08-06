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
        if (/^[a-zA-Z0-9_-]{3,16}$/.test(req.body.username)) {
            let newUsernameLowerCase = req.body.username.toLowerCase();
            let newUserEmailAddress = req.body.email.toLowerCase();
            const doc = await Users.findOne({ 'lowerCaseUserName': newUsernameLowerCase })
            if (doc === null) {
                const hashedPassword = await bcrypt.hash(req.body.password, 10)
                new Users({
                    password: hashedPassword,
                    email: newUserEmailAddress,
                    thirdPartyId: undefined,
                    estimatedSats: 0,
                    earnedSats: 0,
                    sats: 0,
                    paidSats: 0,
                    views: 0,
                    username: req.body.username,
                    lowerCaseUserName: newUsernameLowerCase,
                    upvotes: 0,
                    avatarUrl: '/api/avatar/Default.jpg',
                    avatarFileName: 'Default.jpg',
                    upvoted: [],
                    reported: [],

                }).save()
                    .then(newuser => res.send({ user: newuser }))
            }
            else { res.status(400).send({ error: `That username is already taken` }) }
        }
        else {
            res.send({ error: 'Invalid Username' })
        }
    });


}