const router = require('express').Router();
const passport = require('passport');
const User = require('../models/user-model');
const nodemailer = require('nodemailer');
const keys = require('../config/keys');


var recentViews = {}
var recentUpvotes = {}

function recentCleanUp () {
    setTimeout(function () {
        recentViews = {};
        recentUpvotes= {};
        recentCleanUp();
    }, 1000*60*60*2); // 2 hours 
    }
recentCleanUp();

router.get('/', (req, res) => {
    if (!req.user) {
        res.render('index', { logInStatus: '<li class="nav-item"><a href="/noauth/google">Log in</a></li>' })
    }
    else {
        res.render('index', { logInStatus: '<li class="nav-item"><a href="/noauth/logout">Logout</a></li>' })
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

router.get('/topPosts/:page', (req, res) => {
    User.find({}).lean().then(function (record) {
        topPostsList = []
        record.forEach(element => {
            for (image in element.images) {
                if (element.images[image].deleted != true && element.images[image].payStatus === true) {
                    let x = {}
                    x.imageId = element.images[image].imageId
                    x.fileName = element.images[image].fileName
                    x.views = element.images[image].views
                    x.title = element.images[image].title
                    x.caption = element.images[image].caption
                    x.height = element.images[image].height
                    x.width = element.images[image].width
                    x.upVotes = element.images[image].upVotes
                    x.id = element.images[image]._id
                    topPostsList.push(x)
                }
            }

        });
        topPostsList.sort(function (a, b) { return parseFloat(b.views) - parseFloat(a.views) })
        var slicedTopPostList = topPostsList.slice((req.params.page - 1) * 10, req.params.page * 10)
        res.send(slicedTopPostList)
    });
});

router.get('/image/:fileName', (req, res) => {
    res.sendFile('uploads/' + req.params.fileName, { root: './' });
});

router.get('/about/', (req, res) => {
    if (!req.user) {
        res.render('about', { logInStatus: '<li class="nav-item"><a href="/noauth/google">Log in</a></li>' })
    }
    else {
        res.render('about', { logInStatus: '<li class="nav-item"><a href="/noauth/logout">Logout</a></li>' })
    }
})

router.get('/contact/', (req, res) => {
    if (!req.user) {
        res.render('contact', { logInStatus: '<li class="nav-item"><a href="/noauth/google">Log in</a></li>' })
    }
    else {
        res.render('contact', { logInStatus: '<li class="nav-item"><a href="/noauth/logout">Logout</a></li>' })
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
    console.log(req.body)
});


router.get('/share/:fileName', (req, res) => {
    User.findOne({ 'images.fileName': req.params.fileName }).then((currentUser) => {
        currentUser.images.forEach(element => {
            if (element.fileName == req.params.fileName) {
                if (!req.user) {
                    res.render('share', { logInStatus: '<li class="nav-item"><a href="/noauth/google">Log in</a></li>', image: element })
                }
                else {
                    res.render('share', { logInStatus: '<li class="nav-item"><a href="/noauth/logout">Logout</a></li>', image: element })
                }
            }
            var found = false;
            if (recentViews[req.connection.remoteAddress]) {
                recentViews[req.connection.remoteAddress].forEach(function (element) {
                    if (element === req.params.fileName) {
                        found = true;
                    }
                })
                if (found === true) {
                    return;
                }
                recentViews[req.connection.remoteAddress].push(req.params.fileName)
                currentUser.images.forEach(element => {
                    if (element.fileName == req.params.fileName) {
                        element.views = element.views + 1;
                    }
                })
                currentUser.save();
                return false;
            }
            else {
                recentViews[req.connection.remoteAddress] = [];
                recentViews[req.connection.remoteAddress].push(req.params.fileName)
                    currentUser.images.forEach(element => {
                        if (element.fileName == req.params.fileName) {
                            element.views = element.views + 1;
                        }
                    })
                    currentUser.save();
            }
        })
    })
    console.log(recentViews)
})

router.get('/upvote/:id', (req, res) => {
    console.log(recentUpvotes);
    var found = false;
    if (recentUpvotes[req.connection.remoteAddress]) {
        recentUpvotes[req.connection.remoteAddress].forEach(function (element) {
            if (element === req.params.id) {
                res.send('Already Upvoted')
                found = true;
            }
        })
        if (found === true) {
            return;
        }
        recentUpvotes[req.connection.remoteAddress].push(req.params.id)
        User.findOne({ 'images._id': req.params.id }).then((currentUser) => {
            currentUser.images.forEach(element => {
                if (element._id == req.params.id) {
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
        recentUpvotes[req.connection.remoteAddress].push(req.params.id)
        User.findOne({ 'images._id': req.params.id }).then((currentUser) => {
            currentUser.images.forEach(element => {
                if (element._id == req.params.id) {
                    element.upVotes = element.upVotes + 1;
                }
            })
            currentUser.save();
            res.send('Upvoted')
        })
    }

})

module.exports = router;

