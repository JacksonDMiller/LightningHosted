const router = require('express').Router();
const passport = require('passport');
const User = require('../models/user-model');
const nodemailer = require('nodemailer');
const keys = require('../config/keys');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
var recentUpvotes = {}
var usernameFormat = /[ !@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]/;

recentCleanUp();

router.get('/', (req, res) => {
    if (!req.user) {
        res.render('index', { logInStatus: 'loggedOut' })
    }
    else {
        res.render('index', { logInStatus: 'loggedIn' })
    }
})


router.get('/login/', (req, res) => {
    res.render('login', { logInStatus: 'loggedOut' })
})

router.post('/login/submit', passport.authenticate('local', {
    failureRedirect: '/noauth/login',
    successRedirect: '/auth/',
    failureFlash: true
}),
);


router.get('/register/', (req, res) => {
    res.render('register', { logInStatus: 'loggedOut' })
})


router.post('/register/submit', async (req, res) => {
    if (usernameFormat.test(req.body.username)){
        req.flash("error", "Invalid Username. The characters allowed are A-Z 0-9 and _ ")
        res.redirect('/noauth/register') 

    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    new User({
        email: undefined,
        thirdPartyId: undefined,
        estimatedSats: 0,
        earnedSats: 0,
        sats: 0,
        paidSats: 0,
        views: 0,
        username: req.body.username,
        password: hashedPassword,
        upVotes: 0,
    }).save()
    req.flash("error", "Welcome Please Log in")
    res.redirect('/noauth/login') 

});

// auth logout
router.get('/logout', (req, res) => {
    // handle with passport
    req.logout();
    res.redirect('../');
});

// auth with google
router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}));

//callback route for google to redirect to
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    res.redirect('/auth/');
});

// Sends images for infinite scroll 10 images at a time
router.get('/topPosts/:page', (req, res) => {
    User.find({}).lean().then(function (record) {
        topPostsList = [];
        record.forEach(element => {
            for (image in element.images) {
                // sorting to give new images a boost. 
                var daysOld = Math.round((new Date - element.images[image].date) / 1000 / 60 / 60 / 24)
                element.images[image].score = element.images[image].views - (daysOld * 10)
                if (daysOld < 5) {
                    element.images[image].score += 100
                }
                if (element.images[image].score < 0) {
                    element.images[image].score = 0;
                }
                if (element.images[image].deleted != true && element.images[image].payStatus === true) {
                    topPostsList.push(element.images[image])
                }
            }

        });
        topPostsList.sort(function (a, b) { return parseFloat(b.score) - parseFloat(a.score) })
        var slicedTopPostList = topPostsList.slice((req.params.page - 1) * 10, req.params.page * 10)
        if (slicedTopPostList == false) {
        }
        res.send(slicedTopPostList)
    });
});

router.get('/image/:fileName', (req, res) => {
    res.sendFile('uploads/' + req.params.fileName, { root: './' });
});

router.get('/thumb/:fileName', (req, res) => {
    res.sendFile('thumbnails/' + req.params.fileName, { root: './' });
});

router.get('/comment/:imageId/:commentId/:comment', (req, res) => {
    req.params.comment = req.params.comment.replace(/[&\/\\#,+()$~%'":*<>{}]/g, '');
    if (req.params.commentId == 'undefined') {
        User.findOne({ 'images.imageId': req.params.imageId }).then((currentUser) => {
            commentId = crypto.randomBytes(8).toString('hex')
            currentUser.images.forEach(element => {
                if (element.imageId == req.params.imageId) {
                    element.comments.push({
                        commentId: commentId,
                        date: new (Date),
                        comment: req.params.comment,
                        upVotes: 0,
                    })
                }
            })
            currentUser.save();
            res.send(commentId);
        })
    }
    else {
        User.findOne({ 'images.imageId': req.params.imageId }).then((currentUser) => {
            subCommentId = crypto.randomBytes(8).toString('hex')
            currentUser.images.forEach(element => {
                if (element.imageId == req.params.imageId) {
                    element.comments.forEach(comment => {
                        if (comment.commentId == req.params.commentId) {
                            comment.subComments.push({
                                subCommentId: subCommentId,
                                date: new (Date),
                                comment: req.params.comment,
                                upVotes: 0,

                            })
                        }
                    })
                }
            })
            currentUser.save()
            res.send(subCommentId)
        })
    }
});

router.get('/about/', (req, res) => {
    if (!req.user) {
        res.render('about', { logInStatus: 'loggedOut' })
    }
    else {
        res.render('about', { logInStatus: 'loggedIn' })
    }
})

router.get('/contact/', (req, res) => {
    if (!req.user) {
        res.render('contact', { logInStatus: 'loggedOut' })
    }
    else {
        res.render('contact', { logInStatus: 'loggedIn' })
    }
})

router.post('/contact/submit', function (req, res) {

    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: keys.email.email,
            pass: keys.email.password
        }
    });

    var mailOptions = {
        from: req.body.email,
        to: 'hello@lightninghosted.com',
        subject: req.body.subject + ' ' + req.body.email,
        text: req.body.message,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
    res.send('Thank You! Your message has been sent.')
});

// handles and counts unique upvotes 
router.get('/upvote/:imageId', (req, res) => {
    var found = false;
    if (recentUpvotes[req.connection.remoteAddress]) {
        recentUpvotes[req.connection.remoteAddress].forEach(function (element) {
            if (element === req.params.imageId) {
                res.send('Already Upvoted')
                found = true;
            }
        })
        if (found === true) {
            return;
        }
        recentUpvotes[req.connection.remoteAddress].push(req.params.imageId)
        User.findOne({ 'images.imageId': req.params.imageId }).then((currentUser) => {
            currentUser.images.forEach(element => {
                if (element.imageId == req.params.imageId) {
                    element.upVotes = element.upVotes + 1;
                }
            })
            currentUser.save();
            res.send('Upvoted')
            return false;
        })
    }
    else {
        recentUpvotes[req.connection.remoteAddress] = [];
        recentUpvotes[req.connection.remoteAddress].push(req.params.imageId)
        User.findOne({ 'images.imageId': req.params.imageId }).then((currentUser) => {
            currentUser.images.forEach(element => {
                if (element.imageId == req.params.imageId) {
                    element.upVotes = element.upVotes + 1;
                }
            })
            currentUser.save();
            res.send('Upvoted')
        })
    }

})

function recentCleanUp() {
    setTimeout(function () {
        recentViews = {};
        recentUpvotes = {};
        recentCleanUp();
    }, 1000 * 60 * 60 * 2); // 2 hours 
}

module.exports = router;

