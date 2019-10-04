const router = require('express').Router();
const passport = require('passport');
const User = require('../models/user-model');
const nodemailer = require('nodemailer');
const keys = require('../config/keys');
const crypto = require('crypto');

var recentViews = {}
var recentUpvotes = {}

recentCleanUp();

router.get('/', (req, res) => {
    if (!req.user) {
        res.render('index', { logInStatus: 'loggedOut' })
    }
    else {
        res.render('index', { logInStatus: 'loggedIn' })
    }
})

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
                if (element.images[image].deleted != true && element.images[image].payStatus === true) {
                    topPostsList.push(element.images[image])
                }
            }

        });
        topPostsList.sort(function (a, b) { return parseFloat(b.views) - parseFloat(a.views) })
        var slicedTopPostList = topPostsList.slice((req.params.page - 1) * 10, req.params.page * 10)
        if (slicedTopPostList == false) {
        }
        res.send(slicedTopPostList)
    });
});

router.get('/image/:fileName', (req, res) => {
    res.sendFile('uploads/' + req.params.fileName, { root: './' });
});

router.get('/comment/:imageId/:commentId/:comment', (req, res) => {
    console.log('comment',req.params.comment, 'commID',req.params.commentId, 'imageID', req.params.imageId)
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
            user: 'bitcoinacolyte@gmail.com',
            pass: keys.email.password
        }
    });

    var mailOptions = {
        from: req.body.email,
        to: keys.email.email,
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

// Share image page that counts views
router.get('/share/:imageId', (req, res) => {
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

// handles and counts unique upvotes 
router.get('/upvote/:fileName', (req, res) => {
    var found = false;
    if (recentUpvotes[req.connection.remoteAddress]) {
        recentUpvotes[req.connection.remoteAddress].forEach(function (element) {
            if (element === req.params.fileName) {
                res.send('Already Upvoted')
                found = true;
            }
        })
        if (found === true) {
            return;
        }
        recentUpvotes[req.connection.remoteAddress].push(req.params.fileName)
        User.findOne({ 'images.imageId': req.params.fileName }).then((currentUser) => {
            currentUser.images.forEach(element => {
                if (element.imagefileName == req.params.fileName) {
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
        recentUpvotes[req.connection.remoteAddress].push(req.params.fileName)
        User.findOne({ 'images.imageId': req.params.fileName }).then((currentUser) => {
            currentUser.images.forEach(element => {
                if (element.imageId == req.params.fileName) {
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

