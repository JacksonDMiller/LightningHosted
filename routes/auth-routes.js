const router = require('express').Router();
const User = require('../models/user-model');
const crypto = require('crypto');


// This checks to see if a user is logged in before allowing them to access a page.
const authCheck = (req, res, next) => {
    if (!req.user) {
        // if user is not logged in
        res.redirect('../noauth/google')
    }
    else {
        // if logged in
        next();
    }
};

router.get('/', authCheck, (req, res) => {
    res.render('profile', { user: req.user });

});

router.post('/upload', function (req, res) {
    if (Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.filepond;

    fileName = crypto.randomBytes(20).toString('hex')
    // use the mv() method to place the file somewhere on your server
    sampleFile.mv( './uploads/' + fileName + '.jpg', function (err) {
        if (err) { return res.status(500).send(err) };

        User.findOne({ _id: req.user.id }).then((currentUser) => {
            currentUser.images.push({
                imageId: fileName,
                reviewStatus: false,
                deleted: false,
                views: 0,
                reports: 0,
                fileName: fileName + '.jpg',
                thumbNail: 'x',
                width: 1,
                height: 1,
                date: new(Date),
                title: 'ss',
                caption: 'String',
                paymentRequest: 'String',
                upVotes: 0
            })
            currentUser.save();
        });

        res.send('File uploaded!');
    });
});

router.get('/user', authCheck, (req, res) => {
    User.findOne({ _id: req.user.id }).then((currentUser) => {
    res.send(currentUser)
    })
});

module.exports = router;